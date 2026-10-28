"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ClipboardList,
  Check,
  X as XIcon,
  Clock,
  Loader2,
  Inbox,
  CalendarClock,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/lib/careers/applications";
import type { ApplicationStatus } from "@/lib/careers/schema";
import { INTERVIEW_WINDOW_DAYS } from "@/lib/careers/dates";
import { setApplicationStatus, viewCv } from "./actions";

type Row = Pick<
  Application,
  | "id"
  | "full_name"
  | "email"
  | "contact"
  | "gender"
  | "education"
  | "university"
  | "start_date"
  | "end_date"
  | "city"
  | "dob"
  | "cnic"
  | "experience"
  | "cv_path"
  | "status"
  | "interview_at"
  | "created_at"
  | "job_title"
>;

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-400/15 text-yellow-300 ring-yellow-400/30",
  shortlisted: "bg-[#0dcaf0]/15 text-[#0dcaf0] ring-[#0dcaf0]/30",
  rejected: "bg-red-400/15 text-red-300 ring-red-400/30",
};

export function ApplicationsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-16 text-center">
        <Inbox className="mb-3 h-10 w-10 text-white/25" />
        <p className="text-white/60">No applications found</p>
        <p className="mt-1 text-sm text-white/35">
          Applications submitted through the careers page will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
            <th className="px-4 py-3 font-medium">Applicant</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">City</th>
            <th className="px-4 py-3 font-medium">Applied</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Interview</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ApplicationRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationRow({ row }: { row: Row }) {
  const { toast } = useToast();
  const router = useRouter();
  const [status, setStatus] = React.useState<ApplicationStatus>(row.status);
  const [interviewAt, setInterviewAt] = React.useState<string | null>(row.interview_at);

  // Keep in sync when the server sends fresh data (after refresh).
  React.useEffect(() => {
    setStatus(row.status);
    setInterviewAt(row.interview_at);
  }, [row.status, row.interview_at]);
  const [pending, setPending] = React.useState<ApplicationStatus | null>(null);
  const [cvLoading, setCvLoading] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);

  async function changeStatus(next: ApplicationStatus, when?: string): Promise<boolean> {
    if (next === status && next !== "shortlisted") return true;
    setPending(next);
    const res = await setApplicationStatus(row.id, next, when);
    setPending(null);
    if (res.ok) {
      setStatus(next);
      setInterviewAt(next === "shortlisted" ? (when ?? null) : null);
      toast({ title: `Marked ${next}`, description: `${row.full_name} — emailed.` });
      // Reload the statistics, filtered list and counts from the server.
      router.refresh();
      return true;
    }
    toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
    return false;
  }

  async function openCv() {
    setCvLoading(true);
    const res = await viewCv(row.cv_path);
    setCvLoading(false);
    if ("url" in res) window.open(res.url, "_blank", "noopener,noreferrer");
    else toast({ title: "Couldn't open CV", description: res.error, variant: "destructive" });
  }

  return (
    <>
      <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
        <td className="px-4 py-3">
          <button type="button" onClick={() => setDetailsOpen(true)} className="text-left">
            <span className="block font-medium text-white hover:text-[#0dcaf0]">{row.full_name}</span>
            <span className="block text-xs text-white/50">{row.email}</span>
          </button>
        </td>
        <td className="px-4 py-3 text-white/80">{row.job_title ?? "—"}</td>
        <td className="px-4 py-3 text-white/80">{row.city}</td>
        <td className="px-4 py-3 whitespace-nowrap text-white/60">{formatDate(row.created_at)}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLE[status]}`}
          >
            {status}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          {status === "shortlisted" && interviewAt ? (
            <button
              type="button"
              title="Reschedule interview"
              onClick={() => setScheduleOpen(true)}
              className="inline-flex items-center gap-1.5 text-white/85 hover:text-[#0dcaf0]"
            >
              <CalendarClock className="h-4 w-4 text-[#0dcaf0]" />
              {formatDateTime(interviewAt)}
            </button>
          ) : (
            <span className="text-white/30">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <ActionBtn
              title="View CV"
              onClick={openCv}
              loading={cvLoading}
              icon={<FileText className="h-4 w-4" />}
            />
            <ActionBtn
              title="View application details"
              onClick={() => setDetailsOpen(true)}
              icon={<ClipboardList className="h-4 w-4" />}
            />
            <ActionBtn
              title={status === "shortlisted" ? "Reschedule interview" : "Shortlist & schedule interview"}
              onClick={() => setScheduleOpen(true)}
              loading={pending === "shortlisted"}
              active={status === "shortlisted"}
              activeCls="text-[#0dcaf0]"
              icon={<Check className="h-4 w-4" />}
            />
            <ActionBtn
              title="Mark pending"
              onClick={() => changeStatus("pending")}
              loading={pending === "pending"}
              active={status === "pending"}
              activeCls="text-yellow-300"
              icon={<Clock className="h-4 w-4" />}
            />
            <ActionBtn
              title="Reject"
              onClick={() => changeStatus("rejected")}
              loading={pending === "rejected"}
              active={status === "rejected"}
              activeCls="text-red-300"
              icon={<XIcon className="h-4 w-4" />}
            />
          </div>
        </td>
      </tr>

      <DetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        row={row}
        status={status}
        interviewAt={interviewAt}
        onViewCv={openCv}
        cvLoading={cvLoading}
      />

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        name={row.full_name}
        current={status === "shortlisted" ? interviewAt : null}
        saving={pending === "shortlisted"}
        onConfirm={async (iso) => {
          if (await changeStatus("shortlisted", iso)) setScheduleOpen(false);
        }}
      />
    </>
  );
}

/** Everything the applicant filled in on the apply form. */
function DetailsDialog({
  open,
  onOpenChange,
  row,
  status,
  interviewAt,
  onViewCv,
  cvLoading,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  row: Row;
  status: ApplicationStatus;
  interviewAt: string | null;
  onViewCv: () => void;
  cvLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{row.full_name}</DialogTitle>
          <DialogDescription>
            Applied for {row.job_title ?? "a role"} on {formatDate(row.created_at)}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <Detail label="Position" value={row.job_title ?? "—"} />
          <Detail label="Status" value={cap(status)} />
          <Detail label="Full name" value={row.full_name} />
          <Detail label="Email" value={row.email} />
          <Detail label="Contact number" value={row.contact} />
          <Detail label="City" value={row.city} />
          <Detail label="Gender" value={row.gender} />
          <Detail label="Date of birth" value={row.dob ? formatDate(`${row.dob}T00:00:00`) : "—"} />
          <Detail label="CNIC number" value={row.cnic ?? "—"} />
          <Detail label="Education" value={row.education} />
          <Detail label="University" value={row.university} />
          <Detail label="Degree period" value={`${formatMonth(row.start_date)} – ${formatMonth(row.end_date)}`} />
          {status === "shortlisted" && (
            <Detail
              label="Interview"
              value={interviewAt ? formatDateTime(interviewAt) : "Not scheduled"}
            />
          )}
          <Detail
            label="Experience"
            value={row.experience || "—"}
            className="sm:col-span-2 whitespace-pre-line"
          />
        </dl>
        <div className="pt-2">
          <Button
            type="button"
            onClick={onViewCv}
            disabled={cvLoading}
            className="rounded-full bg-[#0dcaf0] font-semibold text-black hover:bg-[#0dcaf0]/90"
          >
            {cvLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            View CV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Interview picker: past dates/times are disabled; only the next month is selectable. */
function ScheduleDialog({
  open,
  onOpenChange,
  name,
  current,
  saving,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  name: string;
  current: string | null;
  saving: boolean;
  onConfirm: (iso: string) => void;
}) {
  const [value, setValue] = React.useState("");
  const [bounds, setBounds] = React.useState({ min: "", max: "" });

  // Recompute the allowed window and reset the field each time it opens.
  React.useEffect(() => {
    if (!open) return;
    const now = new Date();
    const max = new Date(now.getTime() + INTERVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    setBounds({ min: toLocalInput(now), max: toLocalInput(max) });
    setValue(current && new Date(current) > now ? toLocalInput(new Date(current)) : "");
  }, [open, current]);

  const outOfRange = value !== "" && (value < bounds.min || value > bounds.max);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{current ? "Reschedule interview" : "Shortlist & schedule interview"}</DialogTitle>
          <DialogDescription>
            Pick the interview date and time for {name}. The applicant is emailed and can also see
            it when they check their application status.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!value || outOfRange) return;
            onConfirm(new Date(value).toISOString());
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor={`interview-${name}`} className="text-sm text-white">
              Interview date &amp; time *
            </label>
            <Input
              id={`interview-${name}`}
              type="datetime-local"
              required
              min={bounds.min}
              max={bounds.max}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border-white/10 bg-[#121212] text-white [color-scheme:dark] focus-visible:ring-[#0dcaf0]/50 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80"
            />
            <p className={`text-xs ${outOfRange ? "text-red-400" : "text-white/45"}`}>
              {outOfRange
                ? "Choose a time between now and one month from today."
                : `Available: now until ${bounds.max ? formatDate(new Date(bounds.max).toISOString()) : "one month ahead"}. Times are in your local time zone.`}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!value || outOfRange || saving}
              className="rounded-full bg-[#0dcaf0] px-6 font-semibold text-black hover:bg-[#0dcaf0]/90"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {current ? "Save new time" : "Shortlist"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActionBtn({
  title,
  onClick,
  loading,
  active,
  activeCls,
  icon,
}: {
  title: string;
  onClick: () => void;
  loading?: boolean;
  active?: boolean;
  activeCls?: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={loading}
      className={`rounded-md p-1.5 transition-colors hover:bg-white/10 disabled:opacity-50 ${
        active ? activeCls ?? "text-white" : "text-white/50 hover:text-white"
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
    </button>
  );
}

function Detail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
      <dd className="mt-0.5 break-words text-white/85">{value || "—"}</dd>
    </div>
  );
}

/** Date → "YYYY-MM-DDTHH:mm" in local time, the format datetime-local expects. */
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2021-09" → "Sep 2021" (degree start/end are stored as month strings). */
function formatMonth(v: string) {
  if (!/^\d{4}-\d{2}$/.test(v ?? "")) return v || "—";
  return new Date(`${v}-01T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    year: "numeric",
  });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
