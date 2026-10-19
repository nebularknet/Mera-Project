"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Link2,
  ImagePlus,
  Youtube as YoutubeIcon,
  Minus,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { uploadBlogImage } from "./actions";

export type EditorValue = { json: unknown; html: string };

/**
 * Word-like editor for post bodies. Stores Tiptap JSON (reopens exactly) and
 * emits HTML, which the server sanitizes before it's shown publicly.
 * Markdown shortcuts work while typing (## heading, - list, **bold**).
 */
export function RichEditor({
  initialContent,
  onChange,
  onReady,
  editable = true,
}: {
  initialContent: unknown;
  /** Called on every user edit. */
  onChange?: (value: EditorValue) => void;
  /** Called once with the loaded content, so unedited bodies still have HTML. */
  onReady?: (value: EditorValue) => void;
  editable?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      Placeholder.configure({ placeholder: "Start writing your post…" }),
    ],
    content: isDoc(initialContent) ? (initialContent as JSONContent) : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[420px] px-5 py-4 focus:outline-none blog-editor-content",
      },
    },
    onCreate: ({ editor }) => onReady?.({ json: editor.getJSON(), html: editor.getHTML() }),
    onUpdate: ({ editor }) => onChange?.({ json: editor.getJSON(), html: editor.getHTML() }),
  });

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className="overflow-clip rounded-xl border border-white/10 bg-[#0d0d0d]">
      {editable && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      {!editor && <div className="min-h-[420px]" />}
    </div>
  );
}

function isDoc(v: unknown): boolean {
  return !!v && typeof v === "object" && (v as { type?: string }).type === "doc";
}

function Toolbar({ editor }: { editor: Editor }) {
  const { toast } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  // Re-render the toolbar when the selection's formatting changes.
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove the link)", prev ?? "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function addYoutube() {
    const url = window.prompt("YouTube video URL");
    if (!url) return;
    const ok = editor.commands.setYoutubeVideo({ src: url.trim() });
    if (!ok) toast({ title: "That doesn't look like a YouTube link", variant: "destructive" });
  }

  async function onImagePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadBlogImage(fd);
    setUploading(false);
    if (!res.ok) {
      toast({ title: "Upload failed", description: res.error, variant: "destructive" });
      return;
    }
    const alt = window.prompt("Describe the image (alt text, helps SEO and accessibility)", "") ?? "";
    chain().setImage({ src: res.url, alt: alt.trim() }).run();
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-[#121212] px-2 py-1.5">
      <Btn title="Heading 2" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} icon={<Heading2 />} />
      <Btn title="Heading 3" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} icon={<Heading3 />} />
      <Btn title="Heading 4" active={s.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()} icon={<Heading4 />} />
      <Sep />
      <Btn title="Bold (Ctrl+B)" active={s.bold} onClick={() => chain().toggleBold().run()} icon={<Bold />} />
      <Btn title="Italic (Ctrl+I)" active={s.italic} onClick={() => chain().toggleItalic().run()} icon={<Italic />} />
      <Btn title="Underline (Ctrl+U)" active={s.underline} onClick={() => chain().toggleUnderline().run()} icon={<Underline />} />
      <Btn title="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()} icon={<Strikethrough />} />
      <Btn title="Inline code" active={s.code} onClick={() => chain().toggleCode().run()} icon={<Code />} />
      <Sep />
      <Btn title="Bulleted list" active={s.bullet} onClick={() => chain().toggleBulletList().run()} icon={<List />} />
      <Btn title="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()} icon={<ListOrdered />} />
      <Btn title="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()} icon={<Quote />} />
      <Btn title="Code block" active={s.codeBlock} onClick={() => chain().toggleCodeBlock().run()} icon={<SquareCode />} />
      <Btn title="Divider" onClick={() => chain().setHorizontalRule().run()} icon={<Minus />} />
      <Sep />
      <Btn title="Link" active={s.link} onClick={setLink} icon={<Link2 />} />
      <Btn
        title="Insert image"
        onClick={() => fileRef.current?.click()}
        icon={uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        disabled={uploading}
      />
      <Btn title="Embed YouTube video" onClick={addYoutube} icon={<YoutubeIcon />} />
      <Sep />
      <Btn title="Undo (Ctrl+Z)" onClick={() => chain().undo().run()} icon={<Undo2 />} disabled={!s.canUndo} />
      <Btn title="Redo (Ctrl+Y)" onClick={() => chain().redo().run()} icon={<Redo2 />} disabled={!s.canRedo} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onImagePicked}
      />
    </div>
  );
}

function Btn({
  title,
  icon,
  onClick,
  active,
  disabled,
}: {
  title: string;
  icon: React.ReactElement<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-30 ${
        active ? "bg-[#0dcaf0]/20 text-[#0dcaf0]" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {React.cloneElement(icon, { className: `h-4 w-4 ${icon.props.className ?? ""}` })}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />;
}
