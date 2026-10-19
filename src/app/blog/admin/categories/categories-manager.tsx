"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminFieldCls } from "../field-styles";
import { deleteCategory, saveCategory } from "../actions";

type Cat = { id: string; name: string; slug: string; description: string | null; postCount: number };

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = React.useState<Cat | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);

  function startEdit(c: Cat | null) {
    setEditing(c);
    setName(c?.name ?? "");
    setDescription(c?.description ?? "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    const res = await saveCategory({ id: editing?.id, name, description });
    setBusy(null);
    if (res.ok) {
      toast({ title: editing ? "Category updated" : "Category added" });
      startEdit(null);
      router.refresh();
    } else toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
  }

  async function onDelete(c: Cat) {
    const msg = c.postCount
      ? `Delete "${c.name}"? Its ${c.postCount} post(s) will be kept but have no category.`
      : `Delete "${c.name}"?`;
    if (!window.confirm(msg)) return;
    setBusy(c.id);
    const res = await deleteCategory(c.id);
    setBusy(null);
    if (res.ok) {
      toast({ title: "Category deleted" });
      if (editing?.id === c.id) startEdit(null);
      router.refresh();
    } else toast({ title: "Couldn't delete", description: res.error, variant: "destructive" });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <form onSubmit={onSubmit} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">{editing ? `Edit "${editing.name}"` : "Add a category"}</h2>
          {editing && (
            <button type="button" onClick={() => startEdit(null)} className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name *" required className={adminFieldCls} />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (shown on the category page)"
            className={adminFieldCls}
          />
        </div>
        <button
          type="submit"
          disabled={busy !== null}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-4 py-2 text-sm font-semibold text-black hover:bg-[#0dcaf0]/90 disabled:opacity-50"
        >
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editing ? "Save changes" : "Add category"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/50">No categories yet.</td>
              </tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-white">{c.name}</span>
                  {c.description && <span className="mt-0.5 block text-xs text-white/45">{c.description}</span>}
                </td>
                <td className="px-4 py-3 text-white/55">/category/{c.slug}</td>
                <td className="px-4 py-3 text-white/70">{c.postCount}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" title="Edit" aria-label="Edit" onClick={() => startEdit(c)} className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" title="Delete" aria-label="Delete" onClick={() => onDelete(c)} disabled={busy !== null} className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-red-300 disabled:opacity-50">
                      {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
