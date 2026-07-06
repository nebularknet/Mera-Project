"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createJob, toggleJobOpen } from "../actions";

type Job = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  is_open: boolean;
  applicationCount: number;
};

const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";

export function JobsManager({ jobs }: { jobs: Job[] }) {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [creating, setCreating] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const res = await createJob(new FormData(e.currentTarget));
    setCreating(false);
    if (res.ok) {
      formRef.current?.reset();
      toast({ title: "Role created" });
    } else {
      toast({ title: "Couldn't create", description: res.error, variant: "destructive" });
    }
  }

  async function onToggle(job: Job) {
    setTogglingId(job.id);
    const res = await toggleJobOpen(job.id, !job.is_open);
    setTogglingId(null);
    if (!res.ok) {
      toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8">
      {/* New role */}
      <form
        ref={formRef}
        onSubmit={onCreate}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
      >
        <h2 className="mb-4 text-lg font-medium text-white">Post a new role</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="title" placeholder="Role title *" className={fieldCls} required />
          <Input name="location" placeholder="Location (e.g. Remote)" className={fieldCls} />
        </div>
        <Textarea
          name="description"
          rows={2}
          placeholder="Short description (optional)"
          className={`${fieldCls} mt-3 resize-y`}
        />
        <Button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-full bg-[#0dcaf0] font-semibold text-black hover:bg-[#0dcaf0]/90"
        >
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add role
        </Button>
      </form>

      {/* Existing roles */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Applications</th>
              <th className="px-4 py-3 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                  No roles yet. Add one above.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-white">{job.title}</span>
                  {job.description && (
                    <span className="mt-0.5 block text-xs text-white/45">{job.description}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">{job.location ?? "—"}</td>
                <td className="px-4 py-3 text-white/70">{job.applicationCount}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggle(job)}
                    disabled={togglingId === job.id}
                    aria-pressed={job.is_open}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      job.is_open ? "bg-[#0dcaf0]" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        job.is_open ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
