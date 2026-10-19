"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Trash2, Eye, Pencil, Loader2, FileText, MessageSquareWarning } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { STATUS_LABEL, type PostStatus } from "@/lib/blog/types";
import { formatPostDate } from "@/lib/blog/format";
import { deletePost, setFeatured } from "./actions";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  status: PostStatus;
  featured: boolean;
  viewCount: number;
  updatedAt: string;
  reviewNote: string | null;
  authorName: string;
  categoryName: string | null;
  isOwn: boolean;
};

export const STATUS_STYLE: Record<PostStatus, string> = {
  draft: "bg-white/10 text-white/70 ring-white/20",
  in_review: "bg-yellow-400/15 text-yellow-300 ring-yellow-400/30",
  published: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
};

export function PostsTable({ rows, isAdmin }: { rows: PostRow[]; isAdmin: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-white/25" />
        <p className="text-white/60">No posts here yet</p>
        <p className="mt-1 text-sm text-white/35">Use &ldquo;New post&rdquo; to start writing.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Author</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Views</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row key={row.id} row={row} isAdmin={isAdmin} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row, isAdmin }: { row: PostRow; isAdmin: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = React.useState<"feature" | "delete" | null>(null);
  const canDelete = isAdmin || (row.isOwn && row.status === "draft");

  async function toggleFeatured() {
    setBusy("feature");
    const res = await setFeatured(row.id, !row.featured);
    setBusy(null);
    if (res.ok) router.refresh();
    else toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
  }

  async function remove() {
    if (!window.confirm(`Delete "${row.title}"? This can't be undone.`)) return;
    setBusy("delete");
    const res = await deletePost(row.id);
    setBusy(null);
    if (res.ok) {
      toast({ title: "Post deleted" });
      router.refresh();
    } else toast({ title: "Couldn't delete", description: res.error, variant: "destructive" });
  }

  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
      <td className="max-w-md px-4 py-3">
        <Link href={`/blog/admin/posts/${row.id}`} className="font-medium text-white hover:text-[#0dcaf0]">
          {row.title}
        </Link>
        {row.featured && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#0dcaf0]/15 px-2 py-0.5 text-xs text-[#0dcaf0]">
            <Star className="h-3 w-3" fill="currentColor" /> Featured
          </span>
        )}
        {row.reviewNote && row.status === "draft" && (
          <span className="mt-1 flex items-start gap-1.5 text-xs text-yellow-200/80">
            <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">Changes requested: {row.reviewNote}</span>
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-white/75">{row.authorName}</td>
      <td className="px-4 py-3 text-white/60">{row.categoryName ?? "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[row.status]}`}
        >
          {STATUS_LABEL[row.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-white/75">{row.viewCount.toLocaleString()}</td>
      <td className="whitespace-nowrap px-4 py-3 text-white/55">{formatPostDate(row.updatedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <IconLink href={`/blog/admin/posts/${row.id}`} title="Edit / review" icon={<Pencil className="h-4 w-4" />} />
          {row.status === "published" ? (
            <IconLink href={`/post/${row.slug}`} title="View live post" icon={<Eye className="h-4 w-4" />} newTab />
          ) : (
            <IconLink href={`/blog/admin/posts/${row.id}/preview`} title="Preview" icon={<Eye className="h-4 w-4" />} newTab />
          )}
          {isAdmin && row.status === "published" && (
            <button
              type="button"
              title={row.featured ? "Remove from featured" : "Make featured post"}
              aria-label={row.featured ? "Remove from featured" : "Make featured post"}
              onClick={toggleFeatured}
              disabled={busy !== null}
              className={`rounded-md p-1.5 transition-colors hover:bg-white/10 disabled:opacity-50 ${
                row.featured ? "text-[#0dcaf0]" : "text-white/50 hover:text-white"
              }`}
            >
              {busy === "feature" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className="h-4 w-4" fill={row.featured ? "currentColor" : "none"} />
              )}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              title="Delete"
              aria-label="Delete"
              onClick={remove}
              disabled={busy !== null}
              className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-red-300 disabled:opacity-50"
            >
              {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function IconLink({
  href,
  title,
  icon,
  newTab,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      target={newTab ? "_blank" : undefined}
      className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
    >
      {icon}
    </Link>
  );
}
