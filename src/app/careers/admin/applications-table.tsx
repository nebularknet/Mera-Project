"use client";

import * as React from "react";
import {
  ChevronDown,
  FileText,
  Check,
  X as XIcon,
  Clock,
  Loader2,
  Inbox,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import type { Application } from "@/lib/careers/applications";
import type { ApplicationStatus } from "@/lib/careers/schema";
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
  | "experience"
  | "cv_path"
  | "status"
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
        <p className="text-white/60">No applications yet</p>
        <p className="mt-1 text-sm text-white/35">
          Applications submitted through the careers page will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
            <th className="px-4 py-3 font-medium">Applicant</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">City</th>
            <th className="px-4 py-3 font-medium">Applied</th>
            <th className="px-4 py-3 font-medium">Status</th>
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
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<ApplicationStatus>(row.status);
  const [pending, setPending] = React.useState<ApplicationStatus | null>(null);
  const [cvLoading, setCvLoading] = React.useState(false);

  async function changeStatus(next: ApplicationStatus) {
    if (next === status) return;
    setPending(next);
    const res = await setApplicationStatus(row.id, next);
    setPending(null);
    if (res.ok) {
      setStatus(next);
      toast({ title: `Marked ${next}`, description: `${row.full_name} — emailed.` });
    } else {
      toast({ title: "Couldn't update", description: res.error, variant: "destructive" });
    }
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
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 text-left"
          >
            <ChevronDown
              className={`h-4 w-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
            />
            <span>
              <span className="block font-medium text-white">{row.full_name}</span>
              <span className="block text-xs text-white/50">{row.email}</span>
            </span>
          </button>
        </td>
        <td className="px-4 py-3 text-white/80">{row.job_title ?? "—"}</td>
        <td className="px-4 py-3 text-white/80">{row.city}</td>
        <td className="px-4 py-3 text-white/60">{formatDate(row.created_at)}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STATUS_STYLE[status]}`}
          >
            {status}
          </span>
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
              title="Shortlist"
              onClick={() => changeStatus("shortlisted")}
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

      {open && (
        <tr className="border-b border-white/5 bg-white/[0.015]">
          <td colSpan={6} className="px-4 py-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
              <Detail label="Contact" value={row.contact} />
              <Detail label="Gender" value={row.gender} />
              <Detail label="Education" value={row.education} />
              <Detail label="University" value={row.university} />
              <Detail label="Degree" value={`${row.start_date} → ${row.end_date}`} />
              <Detail
                label="Experience"
                value={row.experience || "—"}
                className="col-span-2 sm:col-span-3"
              />
            </dl>
          </td>
        </tr>
      )}
    </>
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
      <dd className="mt-0.5 text-white/85">{value}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
