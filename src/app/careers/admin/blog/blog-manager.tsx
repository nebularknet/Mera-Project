"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RichEditor, type EditorValue } from "@/app/blog/admin/rich-editor";
import { ImageField } from "@/app/blog/admin/image-field";
import {
  deleteBlogPost,
  getBlogPostForEdit,
  saveBlogPost,
  setBlogPostVisible,
} from "./actions";

export type BlogRow = {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  visible: boolean;
  publishedAt: string | null;
  views: number;
};

type Category = { id: string; name: string };

type FormState = {
  id?: string;
  title: string;
  authorName: string;
  categoryId: string;
  coverImageUrl: string;
  excerpt: string;
  tags: string;
  contentJson: unknown;
  visible: boolean;
};

const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";

export function BlogManager({
  rows,
  categories,
  authorNames,
  defaultAuthor,
}: {
  rows: BlogRow[];
  categories: Category[];
  authorNames: string[];
  defaultAuthor: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = React.useState<FormState | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<BlogRow | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function openNew() {
    setForm({
      title: "",
      authorName: defaultAuthor,
      categoryId: "",
      coverImageUrl: "",
      excerpt: "",
      tags: "",
      contentJson: null,
      visible: true,
    });
  }

  async function openEdit(row: BlogRow) {
    setLoadingId(row.id);
    const res = await getBlogPostForEdit(row.id);
    setLoadingId(null);
    if (res.ok) setForm(res.post);
    else toast({ title: "Couldn't open the post", description: res.error, variant: "destructive" });
  }

  async function toggleVisible(row: BlogRow) {
    setLoadingId(row.id);
    const res = await setBlogPostVisible(row.id, !row.visible);
    setLoadingId(null);
    if (res.ok) {
      toast({ title: row.visible ? "Hidden from the website" : "Now showing on the website", description: row.title });
      router.refresh();
    } else toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {rows.length} post{rows.length === 1 ? "" : "s"} · {rows.filter((r) => r.visible).length} on the website
        </p>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-5 py-2 text-sm font-semibold text-black hover:bg-[#0dcaf0]/90"
        >
          <Plus className="h-4 w-4" /> Add blog
        </button>
      </div>

      {notice && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {notice}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-white/25" />
          <p className="text-white/60">No blog posts yet</p>
          <p className="mt-1 text-sm text-white/35">Use &ldquo;Add blog&rdquo; to write the first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Publish date</th>
                <th className="px-4 py-3 font-medium">On website</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="max-w-md px-4 py-3 font-medium text-white">{row.title}</td>
                  <td className="px-4 py-3 text-white/75">{row.authorName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-white/60">
                    {row.publishedAt ? formatDate(row.publishedAt) : "Not published"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        row.visible
                          ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30"
                          : "bg-white/10 text-white/60 ring-white/20"
                      }`}
                    >
                      {row.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {loadingId === row.id && <Loader2 className="mr-1 h-4 w-4 animate-spin text-white/50" />}
                      <ActionBtn title="Edit" onClick={() => openEdit(row)} disabled={loadingId !== null}>
                        <Pencil className="h-4 w-4" />
                      </ActionBtn>
                      <Link
                        href={row.visible ? `/post/${row.slug}` : `/blog/admin/posts/${row.id}/preview`}
                        target="_blank"
                        title={row.visible ? "Open on the website" : "Open preview (hidden post)"}
                        aria-label="Open"
                        className="rounded-md p-1.5 text-white/50 no-underline transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <ActionBtn
                        title={row.visible ? "Hide from the website" : "Show on the website"}
                        onClick={() => toggleVisible(row)}
                        disabled={loadingId !== null}
                      >
                        {row.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </ActionBtn>
                      <ActionBtn title="Delete" onClick={() => setDeleting(row)} disabled={loadingId !== null} danger>
                        <Trash2 className="h-4 w-4" />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <PostDialog
          key={form.id ?? "new"}
          initial={form}
          categories={categories}
          authorNames={authorNames}
          onClose={() => setForm(null)}
          onSaved={(title, visible, isNew) => {
            setForm(null);
            setNotice(
              `"${title}" was ${isNew ? "added" : "updated"}${visible ? " and is showing on the website." : " (hidden from the website)."}`
            );
            toast({ title: isNew ? "Blog post added" : "Blog post updated", description: title });
            router.refresh();
          }}
        />
      )}

      <DeleteDialog
        row={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(title) => {
          setDeleting(null);
          setNotice(`"${title}" was deleted.`);
          toast({ title: "Blog post deleted", description: title });
          router.refresh();
        }}
      />
    </div>
  );
}

function PostDialog({
  initial,
  categories,
  authorNames,
  onClose,
  onSaved,
}: {
  initial: FormState;
  categories: Category[];
  authorNames: string[];
  onClose: () => void;
  onSaved: (title: string, visible: boolean, isNew: boolean) => void;
}) {
  const { toast } = useToast();
  const [f, setF] = React.useState(initial);
  const content = React.useRef<EditorValue>({ json: initial.contentJson, html: "" });
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await saveBlogPost({
      id: f.id,
      title: f.title,
      authorName: f.authorName,
      categoryId: f.categoryId,
      coverImageUrl: f.coverImageUrl,
      excerpt: f.excerpt,
      tags: f.tags,
      contentJson: content.current.json,
      contentHtml: content.current.html,
      visible: f.visible,
    });
    setSaving(false);
    if (res.ok) onSaved(f.title.trim(), f.visible, !f.id);
    else toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{f.id ? "Edit blog post" : "Add blog post"}</DialogTitle>
          <DialogDescription>
            Fill in the details and write the post. Use the toolbar for headings, lists, links, images and videos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title *">
            <Input
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              required
              minLength={3}
              maxLength={200}
              placeholder="Post title"
              className={fieldCls}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Author name *">
              <Input
                value={f.authorName}
                onChange={(e) => set("authorName", e.target.value)}
                required
                list="blog-author-names"
                placeholder="e.g. Maaz Ullah"
                className={fieldCls}
              />
              <datalist id="blog-author-names">
                {authorNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </Field>
            <Field label="Category">
              <select
                value={f.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0dcaf0]/50"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags" hint="Comma-separated">
              <Input
                value={f.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="design, branding"
                className={fieldCls}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
            <ImageField
              label="Image (optional)"
              hint="Cover image, also used when shared."
              value={f.coverImageUrl}
              onChange={(u) => set("coverImageUrl", u)}
            />
            <Field label="Short summary" hint={`${f.excerpt.length}/300 · shown on the blog list`}>
              <Textarea
                value={f.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                maxLength={300}
                rows={5}
                placeholder="One or two sentences about the post"
                className={`${fieldCls} resize-y`}
              />
            </Field>
          </div>

          <Field label="Content *">
            <RichEditor
              initialContent={initial.contentJson}
              onReady={(v) => (content.current = v)}
              onChange={(v) => (content.current = v)}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-white/85">
            <input
              type="checkbox"
              checked={f.visible}
              onChange={(e) => set("visible", e.target.checked)}
              className="h-4 w-4 accent-[#0dcaf0]"
            />
            Show on the website
          </label>

          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#0dcaf0] px-6 font-semibold text-black hover:bg-[#0dcaf0]/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {f.id ? "Save changes" : "Add blog"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  row,
  onClose,
  onDeleted,
}: {
  row: BlogRow | null;
  onClose: () => void;
  onDeleted: (title: string) => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  async function confirm() {
    if (!row) return;
    setBusy(true);
    const res = await deleteBlogPost(row.id);
    setBusy(false);
    if (res.ok) onDeleted(row.title);
    else toast({ title: "Couldn't delete", description: res.error, variant: "destructive" });
  }

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription>
            &ldquo;{row?.title}&rdquo; and its comments will be permanently deleted. To take it off the website
            without deleting it, use Hide instead.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={busy}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="rounded-full bg-red-500 px-6 font-semibold text-white hover:bg-red-500/90"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 disabled:opacity-50 ${
        danger ? "hover:text-red-300" : "hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-white/80">{label}</p>
      {children}
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
