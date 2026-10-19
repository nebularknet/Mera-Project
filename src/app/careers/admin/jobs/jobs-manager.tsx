"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isPastLastDate, todayDateKey } from "@/lib/careers/dates";
import { createJob, setJobLastDate, toggleJobOpen } from "../actions";

type Job = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  is_open: boolean;
  last_date: string | null;
  applicationCount: number;
};

const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";
const dateCls =
  "h-9 w-[10rem] !px-2.5 border-white/10 bg-[#121212] text-white [color-scheme:dark] focus-visible:ring-[#0dcaf0]/50 " +
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80";

export function JobsManager({ jobs }: { jobs: Job[] }) {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [creating, setCreating] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [savingDateId, setSavingDateId] = React.useState<string | null>(null);
  const today = todayDateKey();

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

  async function onLastDate(job: Job, value: string) {
    // Native date inputs fire onChange with partial values while typing.
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    setSavingDateId(job.id);
    const res = await setJobLastDate(job.id, value);
    setSavingDateId(null);
    if (res.ok) {
      toast({ title: value ? "Last date saved" : "Last date removed", description: job.title });
    } else {
      toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
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
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="title" placeholder="Role title *" className={fieldCls} required />
          <Input name="location" placeholder="Location (e.g. Remote)" className={fieldCls} />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <span className="shrink-0">Closing date</span>
            <Input
              name="lastDate"
              type="date"
              min={today}
              title="Last date to apply (optional)"
              className={dateCls}
            />
          </label>
        </div>
        <FieldLabel htmlFor="role-description">Job Description *</FieldLabel>
        <Textarea
          id="role-description"
          name="description"
          rows={4}
          required
          minLength={10}
          placeholder="What the role is about, the team, and what success looks like."
          className={`${fieldCls} resize-y`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="role-requirements">Requirements</FieldLabel>
            <Textarea
              id="role-requirements"
              name="requirements"
              rows={5}
              placeholder={"One per line, e.g.\n2+ years of UI design experience\nStrong Figma skills"}
              className={`${fieldCls} resize-y`}
            />
          </div>
          <div>
            <FieldLabel htmlFor="role-responsibilities">Key Responsibilities</FieldLabel>
            <Textarea
              id="role-responsibilities"
              name="responsibilities"
              rows={5}
              placeholder={"One per line, e.g.\nDesign user flows and wireframes\nMaintain the design system"}
              className={`${fieldCls} resize-y`}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/40">
          Each line becomes a bullet point on the job page.
        </p>
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
              <th className="px-4 py-3 font-medium">Closing date</th>
              <th className="px-4 py-3 font-medium">Applications</th>
              <th className="px-4 py-3 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                  No roles yet. Add one above.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-white">{job.title}</span>
                  {job.description && (
                    <span className="mt-0.5 line-clamp-1 block max-w-md text-xs text-white/45">{job.description}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">{job.location ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="date"
                      aria-label={`Last date for ${job.title}`}
                      title="Last date to apply (clear for no deadline)"
                      defaultValue={job.last_date ?? ""}
                      disabled={savingDateId === job.id}
                      onChange={(e) => onLastDate(job, e.target.value)}
                      className={`${dateCls} ${
                        isPastLastDate(job.last_date) ? "!text-red-400" : ""
                      }`}
                    />
                    {savingDateId === job.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                    )}
                  </div>
                </td>
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

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 mt-4 block text-sm font-medium text-white/80">
      {children}
    </label>
  );
}
