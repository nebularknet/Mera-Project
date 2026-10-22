import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { htmlToText, readingMinutes, sanitizePostHtml } from "./content";

/** A slug no other post uses: "my-post", then "my-post-2", "my-post-3"… */
export async function uniqueSlug(base: string, ownId?: string) {
  const { data } = await createAdminClient().from("blog_posts").select("id, slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== ownId).map((r) => r.slug as string));
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

/** Sanitized HTML, plain text and reading time for an editor body. */
export function bodyFields(rawHtml: string) {
  const content_html = sanitizePostHtml(rawHtml ?? "");
  const content_text = htmlToText(content_html);
  return { content_html, content_text, reading_minutes: readingMinutes(content_text) };
}

/**
 * The author profile for a display name: an existing author with that name
 * (case-insensitive), or a new display-only author (no email, no login).
 */
export async function authorIdForName(name: string): Promise<string | null> {
  const db = createAdminClient();
  const clean = name.trim().replace(/\s+/g, " ");
  const pattern = clean.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data: existing } = await db.from("blog_authors").select("id").ilike("name", pattern).limit(1);
  if (existing?.[0]) return existing[0].id as string;
  const { data: created, error } = await db
    .from("blog_authors")
    .insert({ name: clean, email: null, role: "writer", active: false })
    .select("id")
    .single();
  if (error) {
    console.error("[authorIdForName] insert failed:", error);
    return null;
  }
  return created.id as string;
}
