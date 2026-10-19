"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, UserPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminFieldCls } from "../field-styles";
import { createWriter, resetWriterPassword, setWriterActive } from "../actions";

export type WriterRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "writer";
  active: boolean;
  posts: number;
  published: number;
};

export function WritersManager({ rows }: { rows: WriterRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [creating, setCreating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setCreating(true);
    const res = await createWriter({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setCreating(false);
    if (res.ok) {
      formRef.current?.reset();
      toast({ title: "Writer added", description: "Share their email and temporary password with them directly." });
      router.refresh();
    } else toast({ title: "Couldn't add writer", description: res.error, variant: "destructive" });
  }

  async function toggleActive(w: WriterRow) {
    if (w.active && !window.confirm(`Remove ${w.name}'s access? Their posts stay on the blog.`)) return;
    setBusyId(w.id);
    const res = await setWriterActive(w.id, !w.active);
    setBusyId(null);
    if (res.ok) router.refresh();
    else toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
  }

  async function resetPassword(w: WriterRow) {
    const pw = window.prompt(`New temporary password for ${w.name} (at least 8 characters)`);
    if (!pw) return;
    setBusyId(w.id);
    const res = await resetWriterPassword(w.id, pw);
    setBusyId(null);
    if (res.ok) toast({ title: "Password changed", description: `Share the new password with ${w.name} directly.` });
    else toast({ title: "Couldn't change password", description: res.error, variant: "destructive" });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <form ref={formRef} onSubmit={onCreate} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-lg font-medium text-white">Add a writer</h2>
        <p className="mb-4 mt-1 text-sm text-white/50">
          Writers can draft posts and submit them for review. They sign in at the admin login page and only see the
          blog dashboard.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="name" placeholder="Full name *" required className={adminFieldCls} />
          <Input name="email" type="email" placeholder="Email *" required className={adminFieldCls} />
          <Input
            name="password"
            type="text"
            placeholder="Temporary password * (8+ chars)"
            required
            minLength={8}
            autoComplete="off"
            className={adminFieldCls}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-4 py-2 text-sm font-semibold text-black hover:bg-[#0dcaf0]/90 disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Add writer
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <span className="block font-medium text-white">{w.name}</span>
                  <span className="block text-xs text-white/50">{w.email}</span>
                </td>
                <td className="px-4 py-3 capitalize text-white/75">{w.role}</td>
                <td className="px-4 py-3 text-white/70">
                  {w.posts} <span className="text-white/40">({w.published} published)</span>
                </td>
                <td className="px-4 py-3">
                  {w.role === "admin" ? (
                    <span className="text-xs text-white/45">Careers admin list</span>
                  ) : (
                    <span className={`text-xs font-medium ${w.active ? "text-emerald-300" : "text-red-300"}`}>
                      {w.active ? "Active" : "Removed"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {w.role === "writer" && (
                    <div className="flex items-center justify-end gap-2">
                      {busyId === w.id && <Loader2 className="h-4 w-4 animate-spin text-white/50" />}
                      <button
                        type="button"
                        onClick={() => resetPassword(w)}
                        disabled={busyId !== null}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/75 hover:bg-white/10 disabled:opacity-50"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(w)}
                        disabled={busyId !== null}
                        className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${
                          w.active
                            ? "border-red-400/30 text-red-300 hover:bg-red-400/10"
                            : "border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10"
                        }`}
                      >
                        {w.active ? "Remove access" : "Restore access"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
