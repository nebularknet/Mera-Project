"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Loader2,
  MessageSquareWarning,
  Save,
  Send,
  Globe,
  EyeOff,
  Undo2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { STATUS_LABEL, type Category, type EditablePost, type PostStatus } from "@/lib/blog/types";
import { RichEditor, type EditorValue } from "./rich-editor";
import { ImageField } from "./image-field";
import { savePost, type PostIntent } from "./actions";
import { STATUS_STYLE } from "./posts-table";
import { adminFieldCls } from "./field-styles";

type Props = {
  post: EditablePost | null;
  categories: Pick<Category, "id" | "name">[];
  role: "admin" | "writer";
  authorName: string;
};

export function PostEditor({ post, categories, role, authorName }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = role === "admin";
  const status: PostStatus = post?.status ?? "draft";
  // Writers can only change drafts; admins can always edit.
  const locked = !isAdmin && status !== "draft";

  const [title, setTitle] = React.useState(post?.title ?? "");
  const [slug, setSlug] = React.useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(!!post);
  const [excerpt, setExcerpt] = React.useState(post?.excerpt ?? "");
  const [cover, setCover] = React.useState(post?.cover_image_url ?? "");
  const [categoryId, setCategoryId] = React.useState(post?.category_id ?? "");
  const [tags, setTags] = React.useState((post?.tags ?? []).join(", "));
  const [seoTitle, setSeoTitle] = React.useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = React.useState(post?.seo_description ?? "");
  const content = React.useRef<EditorValue>({ json: post?.content_json ?? null, html: "" });
  const [busy, setBusy] = React.useState<PostIntent | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [sendBackOpen, setSendBackOpen] = React.useState(false);
  const [note, setNote] = React.useState("");

  // Mark unsaved changes and warn before leaving.
  const touch = () => setDirty(true);
  React.useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function run(intent: PostIntent, reviewNote?: string) {
    setBusy(intent);
    const res = await savePost({
      id: post?.id,
      title,
      slug,
      excerpt,
      contentJson: content.current.json,
      contentHtml: content.current.html,
      coverImageUrl: cover,
      categoryId,
      tags,
      seoTitle,
      seoDescription,
      intent,
      reviewNote,
    });
    setBusy(null);
    if (!res.ok) {
      toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
      return;
    }
    setDirty(false);
    setSlug(res.slug);
    const messages: Record<PostIntent, string> = {
      save: "Saved",
      submit: "Submitted for review",
      publish: status === "published" ? "Published changes" : "Published",
      unpublish: "Unpublished — moved back to drafts",
      send_back: "Sent back to the writer",
    };
    toast({ title: messages[intent] });
    if (!post) router.replace(`/blog/admin/posts/${res.id}`);
    else router.refresh();
  }

  const statusBadge = (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );

  return (
    <div className="mx-auto max-w-6xl">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/blog/admin"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
          {statusBadge}
          {dirty && <span className="text-xs text-white/40">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {post && (
            <Link
              href={status === "published" ? `/post/${post.slug}` : `/blog/admin/posts/${post.id}/preview`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              <Eye className="h-4 w-4" /> {status === "published" ? "View live" : "Preview"}
            </Link>
          )}
          {!locked && (
            <ActionButton
              onClick={() => run("save")}
              busy={busy === "save"}
              disabled={busy !== null}
              icon={<Save className="h-4 w-4" />}
              variant="ghost"
            >
              {post ? "Save" : "Save draft"}
            </ActionButton>
          )}
          {!isAdmin && status === "draft" && (
            <ActionButton
              onClick={() => run("submit")}
              busy={busy === "submit"}
              disabled={busy !== null}
              icon={<Send className="h-4 w-4" />}
            >
              Submit for review
            </ActionButton>
          )}
          {isAdmin && status === "in_review" && (
            <ActionButton
              onClick={() => setSendBackOpen(true)}
              disabled={busy !== null}
              icon={<Undo2 className="h-4 w-4" />}
              variant="ghost"
            >
              Send back
            </ActionButton>
          )}
          {isAdmin && status === "published" && (
            <ActionButton
              onClick={() => run("unpublish")}
              busy={busy === "unpublish"}
              disabled={busy !== null}
              icon={<EyeOff className="h-4 w-4" />}
              variant="ghost"
            >
              Unpublish
            </ActionButton>
          )}
          {isAdmin && (
            <ActionButton
              onClick={() => run("publish")}
              busy={busy === "publish"}
              disabled={busy !== null}
              icon={<Globe className="h-4 w-4" />}
            >
              {status === "published" ? "Update live post" : "Publish"}
            </ActionButton>
          )}
        </div>
      </div>

      {/* Workflow notices */}
      {post?.review_note && status === "draft" && (
        <Notice tone="warn" icon={<MessageSquareWarning className="h-4 w-4" />}>
          <strong>Changes requested:</strong> {post.review_note}
        </Notice>
      )}
      {locked && (
        <Notice tone="info">
          {status === "in_review"
            ? "This post is waiting for an admin to review it. You can't edit it while it's in review."
            : "This post is published. Ask an admin if it needs changes."}
        </Notice>
      )}
      {isAdmin && status === "in_review" && (
        <Notice tone="info">
          Submitted by {post ? authorName : "a writer"} for review. Edit if needed, then publish or send it back with a note.
        </Notice>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-5">
          <Textarea
            value={title}
            disabled={locked}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(autoSlug(e.target.value));
              touch();
            }}
            rows={1}
            placeholder="Post title"
            className="min-h-0 resize-none border-0 bg-transparent px-0 text-3xl font-bold text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-4xl"
          />
          <RichEditor
            initialContent={post?.content_json ?? null}
            editable={!locked}
            onReady={(v) => (content.current = v)}
            onChange={(v) => {
              content.current = v;
              touch();
            }}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Panel title="Post details">
            <ImageField
              label="Cover image"
              hint="Shown on the blog and when the post is shared. 1200×630 works best."
              value={cover}
              disabled={locked}
              onChange={(u) => {
                setCover(u);
                touch();
              }}
            />
            <Field label="Excerpt" hint={`${excerpt.length}/300 · shown on post cards`}>
              <Textarea
                value={excerpt}
                disabled={locked}
                maxLength={300}
                rows={3}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  touch();
                }}
                placeholder="A one- or two-sentence summary"
                className={`${adminFieldCls} resize-y`}
              />
            </Field>
            <Field label="Category">
              <select
                value={categoryId}
                disabled={locked}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  touch();
                }}
                className="h-10 w-full rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0dcaf0]/50 disabled:opacity-50"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags" hint="Comma-separated, e.g. ui, figma, branding">
              <Input
                value={tags}
                disabled={locked}
                onChange={(e) => {
                  setTags(e.target.value);
                  touch();
                }}
                placeholder="design, ux"
                className={adminFieldCls}
              />
            </Field>
          </Panel>

          <Panel title="SEO & sharing">
            <Field label="URL" hint={`nebulark.net/post/${slug || "your-post"}`}>
              <Input
                value={slug}
                disabled={locked}
                onChange={(e) => {
                  setSlug(autoSlug(e.target.value));
                  setSlugTouched(true);
                  touch();
                }}
                placeholder="post-url"
                className={adminFieldCls}
              />
            </Field>
            <Field label="SEO title" hint={`${seoTitle.length}/70 · defaults to the post title`}>
              <Input
                value={seoTitle}
                disabled={locked}
                maxLength={70}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  touch();
                }}
                className={adminFieldCls}
              />
            </Field>
            <Field label="SEO description" hint={`${seoDescription.length}/160 · defaults to the excerpt`}>
              <Textarea
                value={seoDescription}
                disabled={locked}
                maxLength={160}
                rows={3}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  touch();
                }}
                className={`${adminFieldCls} resize-y`}
              />
            </Field>
          </Panel>

          {post && (
            <Panel title="Stats">
              <p className="text-sm text-white/70">
                <span className="text-2xl font-bold text-white">{post.view_count.toLocaleString()}</span>{" "}
                views
              </p>
              <p className="text-xs text-white/40">By {authorName}</p>
            </Panel>
          )}
        </aside>
      </div>

      {/* Send back dialog */}
      <Dialog open={sendBackOpen} onOpenChange={setSendBackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send back to the writer</DialogTitle>
            <DialogDescription>
              The post returns to their drafts with your note so they can make changes and resubmit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="What should be changed?"
            className={`${adminFieldCls} resize-y`}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSendBackOpen(false)}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!note.trim() || busy !== null}
              onClick={async () => {
                await run("send_back", note);
                setSendBackOpen(false);
                setNote("");
              }}
              className="rounded-full bg-[#0dcaf0] px-6 font-semibold text-black hover:bg-[#0dcaf0]/90"
            >
              {busy === "send_back" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  busy,
  disabled,
  icon,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        variant === "primary"
          ? "bg-[#0dcaf0] text-black hover:bg-[#0dcaf0]/90"
          : "border border-white/15 text-white/85 hover:bg-white/10"
      }`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-white/80">{label}</p>
      {children}
      {hint && <p className="mt-1.5 break-all text-xs text-white/40">{hint}</p>}
    </div>
  );
}

function Notice({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone: "warn" | "info";
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`mb-5 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
        tone === "warn"
          ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-100"
          : "border-[#0dcaf0]/30 bg-[#0dcaf0]/10 text-white/85"
      }`}
    >
      {icon && <span className="mt-0.5">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
