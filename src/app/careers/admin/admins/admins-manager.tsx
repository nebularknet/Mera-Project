"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Trash2, UserPlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addAdmin, changeAdminPassword, removeAdmin } from "./actions";

export type AdminRow = {
  email: string;
  addedAt: string;
  lastSignInAt: string | null;
  hasLogin: boolean;
  isMe: boolean;
};

const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";

export function AdminsManager({ rows }: { rows: AdminRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [dialog, setDialog] = React.useState<
    { kind: "add" } | { kind: "password"; email: string } | { kind: "remove"; email: string } | null
  >(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function done(message: string, title: string) {
    setDialog(null);
    setNotice(message);
    toast({ title });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {rows.length} admin{rows.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setDialog({ kind: "add" })}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-5 py-2 text-sm font-semibold text-black hover:bg-[#0dcaf0]/90"
        >
          <UserPlus className="h-4 w-4" /> Add admin
        </button>
      </div>

      {notice && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {notice}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.email} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-white">{a.email}</span>
                  {a.isMe && (
                    <span className="ml-2 rounded-full bg-[#0dcaf0]/15 px-2 py-0.5 text-xs text-[#0dcaf0]">You</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-white/60">{formatDate(a.addedAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-white/60">
                  {a.lastSignInAt ? formatDate(a.lastSignInAt) : a.hasLogin ? "Never" : "No password set"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDialog({ kind: "password", email: a.email })}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Change password
                    </button>
                    {!a.isMe && rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDialog({ kind: "remove", email: a.email })}
                        className="inline-flex items-center gap-1 rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/40">
        Share new passwords with the admin directly. They can sign in at /careers/admin/login.
      </p>

      {dialog?.kind === "add" && (
        <PasswordDialog
          title="Add admin"
          description="They'll be able to sign in with this email and password."
          askEmail
          submitLabel="Add admin"
          onClose={() => setDialog(null)}
          onSubmit={async (email, password) => {
            const res = await addAdmin(email, password);
            if (res.ok) done(`${email.trim().toLowerCase()} was added as an admin.`, "Admin added");
            return res;
          }}
        />
      )}
      {dialog?.kind === "password" && (
        <PasswordDialog
          title="Change password"
          description={`Set a new password for ${dialog.email}.`}
          fixedEmail={dialog.email}
          submitLabel="Save password"
          onClose={() => setDialog(null)}
          onSubmit={async (email, password) => {
            const res = await changeAdminPassword(email, password);
            if (res.ok) done(`Password changed for ${email}.`, "Password changed");
            return res;
          }}
        />
      )}
      {dialog?.kind === "remove" && (
        <RemoveDialog
          email={dialog.email}
          onClose={() => setDialog(null)}
          onRemoved={() => done(`${dialog.email} no longer has admin access.`, "Admin removed")}
        />
      )}
    </div>
  );
}

function PasswordDialog({
  title,
  description,
  askEmail,
  fixedEmail,
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  description: string;
  askEmail?: boolean;
  fixedEmail?: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [email, setEmail] = React.useState(fixedEmail ?? "");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    setError(null);
    const res = await onSubmit(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {askEmail && (
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm text-white">
                Email *
              </label>
              <Input
                id="admin-email"
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nebulark.net"
                className={fieldCls}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-sm text-white">
              Password * <span className="text-white/40">(8+ characters)</span>
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={show ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldCls} px-[0.75rem] pr-10`}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="admin-password-confirm" className="text-sm text-white">
              Confirm password *
            </label>
            <Input
              id="admin-password-confirm"
              type={show ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldCls}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
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
              type="submit"
              disabled={busy}
              className="rounded-full bg-[#0dcaf0] px-6 font-semibold text-black hover:bg-[#0dcaf0]/90"
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveDialog({ email, onClose, onRemoved }: { email: string; onClose: () => void; onRemoved: () => void }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove admin?</DialogTitle>
          <DialogDescription>
            {email} will no longer be able to sign in to the admin dashboards. You can add them again later.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-400">{error}</p>}
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
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const res = await removeAdmin(email);
              setBusy(false);
              if (res.ok) onRemoved();
              else setError(res.error);
            }}
            className="rounded-full bg-red-500 px-6 font-semibold text-white hover:bg-red-500/90"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
