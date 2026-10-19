"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageSquare, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { formatPostDate } from "@/lib/blog/format";
import { approveComment, deleteComment } from "../actions";

export type CommentRow = {
  id: string;
  name: string;
  email: string;
  body: string;
  status: "pending" | "approved";
  createdAt: string;
  postTitle: string;
  postSlug: string | null;
};

export function CommentsManager({ rows }: { rows: CommentRow[] }) {
  const [tab, setTab] = React.useState<"pending" | "approved">("pending");
  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const list = tab === "pending" ? pending : approved;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex gap-2">
        {(["pending", "approved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              tab === t ? "border-[#0dcaf0] bg-[#0dcaf0]/10 text-white" : "border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {t === "pending" ? "Awaiting approval" : "Approved"}
            <span
              className={`rounded-full px-1.5 text-xs ${
                t === "pending" && pending.length ? "bg-yellow-400/20 text-yellow-300" : "bg-white/10 text-white/60"
              }`}
            >
              {t === "pending" ? pending.length : approved.length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-white/25" />
          <p className="text-white/60">{tab === "pending" ? "No comments waiting for approval." : "No approved comments yet."}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <CommentItem key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentItem({ c }: { c: CommentRow }) {
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = React.useState<"approve" | "delete" | null>(null);

  async function act(op: "approve" | "delete") {
    if (op === "delete" && !window.confirm("Delete this comment?")) return;
    setBusy(op);
    const res = op === "approve" ? await approveComment(c.id) : await deleteComment(c.id);
    setBusy(null);
    if (res.ok) {
      toast({ title: op === "approve" ? "Comment approved" : "Comment deleted" });
      router.refresh();
    } else toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
  }

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm">
            <span className="font-semibold text-white">{c.name}</span>{" "}
            <span className="text-white/45">&lt;{c.email}&gt; · {formatPostDate(c.createdAt)}</span>
          </p>
          <p className="mt-0.5 text-xs text-white/45">
            on{" "}
            {c.postSlug ? (
              <Link href={`/post/${c.postSlug}#comments`} target="_blank" className="text-[#0dcaf0] hover:underline">
                {c.postTitle}
              </Link>
            ) : (
              c.postTitle
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {c.status === "pending" && (
            <button
              type="button"
              onClick={() => act("approve")}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-3.5 py-1.5 text-sm font-semibold text-black hover:bg-[#0dcaf0]/90 disabled:opacity-50"
            >
              {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Approve
            </button>
          )}
          <button
            type="button"
            onClick={() => act("delete")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/75 hover:border-red-400/50 hover:text-red-300 disabled:opacity-50"
          >
            {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-white/80">{c.body}</p>
    </li>
  );
}
