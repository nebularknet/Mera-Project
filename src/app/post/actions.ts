"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { emailTeamNewComment } from "@/lib/resend";

export type CommentResult = { ok: true } | { ok: false; error: string };

const commentSchema = z.object({
  postId: z.string().uuid(),
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  body: z.string().trim().min(3, "Write a comment.").max(2000, "Comments are limited to 2,000 characters."),
});

const RATE_LIMIT = { max: 3, minutes: 10 };

async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  // Hashed with the service key as salt so raw IPs are never stored.
  return createHash("sha256")
    .update(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Public comment submission. Comments are stored as "pending" and only shown
 * after an admin approves them. Spam protection: a hidden honeypot field and
 * a per-IP rate limit.
 */
export async function submitComment(formData: FormData): Promise<CommentResult> {
  // Honeypot: real people never fill this hidden field. Pretend success.
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    name: formData.get("name"),
    email: formData.get("email"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  const input = parsed.data;

  const db = createAdminClient();
  const { data: post } = await db
    .from("blog_posts")
    .select("id, title, slug")
    .eq("id", input.postId)
    .eq("status", "published")
    .maybeSingle();
  if (!post) return { ok: false, error: "This post isn't accepting comments." };

  const ipHash = await clientIpHash();
  const since = new Date(Date.now() - RATE_LIMIT.minutes * 60 * 1000).toISOString();
  const { count } = await db
    .from("blog_comments")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT.max) {
    return { ok: false, error: "You've commented a few times already. Please try again in a few minutes." };
  }

  const { error } = await db.from("blog_comments").insert({
    post_id: input.postId,
    name: input.name,
    email: input.email.toLowerCase(),
    body: input.body,
    ip_hash: ipHash,
  });
  if (error) {
    console.error("[submitComment] insert failed:", error);
    return { ok: false, error: "Couldn't post your comment. Please try again." };
  }

  await emailTeamNewComment(input.name, post.title as string, input.body);
  return { ok: true };
}

/** Counts a view (the client calls this once per browser session per post). */
export async function recordView(postId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return;
  const { error } = await createAdminClient().rpc("blog_increment_view", { p_post_id: postId });
  if (error) console.error("[recordView] failed:", error);
}
