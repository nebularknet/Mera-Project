"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { uploadBlogImage } from "./actions";

/** Upload-and-preview field for a single image URL (cover image, profile photo). */
export function ImageField({
  value,
  onChange,
  label,
  hint,
  aspect = "aspect-[16/9]",
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  aspect?: string;
  disabled?: boolean;
}) {
  const { toast } = useToast();
  const ref = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadBlogImage(fd);
    setUploading(false);
    if (res.ok) onChange(res.url);
    else toast({ title: "Upload failed", description: res.error, variant: "destructive" });
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-white/80">{label}</p>
      {value ? (
        <div className={`group relative overflow-hidden rounded-lg border border-white/10 ${aspect}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => ref.current?.click()}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500/40"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => ref.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 text-sm text-white/50 transition-colors hover:border-[#0dcaf0]/50 hover:text-white disabled:opacity-50 ${aspect}`}
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      )}
      {hint && <p className="mt-1.5 text-xs text-white/40">{hint}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
