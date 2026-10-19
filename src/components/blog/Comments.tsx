"use client";

import * as React from "react";
import { CheckCircle2, Loader2, MessageSquare } from "lucide-react";

import type { PublicComment } from "@/lib/blog/types";
import { formatPostDate } from "@/lib/blog/format";
import { submitComment } from "@/app/post/actions";
import { AuthorAvatar } from "./AuthorAvatar";

const fieldCls =
  "w-full rounded-lg border border-white/10 bg-[#121212] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0dcaf0]/50";

/** Approved comments + the form for a new one (held for approval). */
export function Comments({ postId, comments }: { postId: string; comments: PublicComment[] }) {
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);
    const res = await submitComment(new FormData(form));
    setPending(false);
    if (res.ok) {
      setSent(true);
      form.reset();
    } else setError(res.error);
  }

  return (
    <section id="comments" className="mx-auto mt-14 max-w-3xl px-4">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
        <MessageSquare className="h-6 w-6 text-[#0dcaf0]" />
        Comments {comments.length > 0 && <span className="text-white/40">({comments.length})</span>}
      </h2>

      {comments.length === 0 ? (
        <p className="mt-4 text-white/50">No comments yet — start the conversation.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <AuthorAvatar author={{ name: c.name, avatar_url: null }} size={36} />
              <div className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-sm">
                  <span className="font-semibold text-white">{c.name}</span>{" "}
                  <span className="text-white/40">· {formatPostDate(c.created_at)}</span>
                </p>
                <p className="mt-1.5 whitespace-pre-line break-words text-[0.95rem] leading-relaxed text-white/80">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        {sent ? (
          <div className="flex items-start gap-3 text-white/80">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0dcaf0]" />
            <div>
              <p className="font-semibold text-white">Thanks for your comment!</p>
              <p className="mt-1 text-sm text-white/60">It will appear here once our team approves it.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-3 text-sm text-[#0dcaf0] hover:underline">
                Write another comment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Leave a comment</h3>
            <input type="hidden" name="postId" value={postId} />
            {/* Honeypot — hidden from people, filled in by bots. */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label>
                Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required minLength={2} maxLength={80} placeholder="Your name *" className={fieldCls} />
              <input name="email" type="email" required placeholder="Email * (never shown)" className={fieldCls} />
            </div>
            <textarea
              name="body"
              required
              minLength={3}
              maxLength={2000}
              rows={4}
              placeholder="Share your thoughts…"
              className={`${fieldCls} resize-y`}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/40">Comments are reviewed before they appear.</p>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-[#0dcaf0] px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#0dcaf0]/90 disabled:opacity-60"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Post comment
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
