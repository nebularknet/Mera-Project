"use client";

import * as React from "react";
import { Search, Loader2, Clock, CheckCircle2, XCircle, CalendarClock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { checkApplicationStatus, type StatusResult } from "./actions";

type JobOption = { id: string; title: string };

const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";
const triggerCls =
  "border-white/10 bg-[#121212] text-white data-[placeholder]:text-white/40 focus:ring-[#0dcaf0]/50";
const contentCls = "border-white/10 bg-[#121212] text-white";
const itemCls = "focus:bg-white/10 focus:text-white";

/**
 * "Check application status" button + popup. Applicants enter their email and
 * pick the role they applied for; only roles currently on the portal are listed.
 */
export function StatusCheck({
  jobs,
  defaultJobId,
  variant = "primary",
}: {
  jobs: JobOption[];
  defaultJobId?: string;
  variant?: "primary" | "outline";
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {variant === "primary" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="more-button inline-flex items-center gap-2"
        >
          <Search size={16} /> Check application status
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0dcaf0]/50 px-5 py-2.5 text-sm font-semibold text-[#0dcaf0] transition-colors hover:bg-[#0dcaf0]/10"
        >
          <Search size={16} /> Check application status
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check application status</DialogTitle>
            <DialogDescription>
              Enter the email you applied with and the role you applied for.
            </DialogDescription>
          </DialogHeader>
          {/* key resets the form each time the popup opens */}
          <StatusForm key={String(open)} jobs={jobs} defaultJobId={defaultJobId} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusForm({ jobs, defaultJobId }: { jobs: JobOption[]; defaultJobId?: string }) {
  const [email, setEmail] = React.useState("");
  const [jobId, setJobId] = React.useState(defaultJobId ?? "");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<StatusResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("email", email);
    fd.append("jobId", jobId);
    setResult(await checkApplicationStatus(fd));
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status-email" className="text-white">
            Email Address *
          </Label>
          <Input
            id="status-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldCls}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Job Applied For *</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className={triggerCls}>
              <SelectValue placeholder="Select Position" />
            </SelectTrigger>
            <SelectContent className={contentCls}>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id} className={itemCls}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={loading || !email || !jobId}
          className="w-full rounded-full bg-[#0dcaf0] font-semibold text-black hover:bg-[#0dcaf0]/90"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Check status
        </Button>
      </form>

      {result && <StatusResultCard result={result} />}
    </div>
  );
}

function StatusResultCard({ result }: { result: StatusResult }) {
  if (!result.ok) {
    return (
      <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
        {result.error}
      </p>
    );
  }

  const view = {
    pending: {
      icon: <Clock className="h-6 w-6 text-yellow-300" />,
      label: "Under review",
      text: "Your application has been received and is being reviewed by our team.",
      cls: "border-yellow-400/30 bg-yellow-400/10",
    },
    shortlisted: {
      icon: <CheckCircle2 className="h-6 w-6 text-[#0dcaf0]" />,
      label: "Shortlisted",
      text: "Congratulations! You have been shortlisted for an interview.",
      cls: "border-[#0dcaf0]/30 bg-[#0dcaf0]/10",
    },
    rejected: {
      icon: <XCircle className="h-6 w-6 text-red-300" />,
      label: "Not selected",
      text: "Thank you for your interest. We've decided not to move forward with your application at this time.",
      cls: "border-red-400/30 bg-red-400/10",
    },
  }[result.status];

  return (
    <div className={`rounded-lg border px-4 py-4 text-left ${view.cls}`}>
      <div className="flex items-center gap-3">
        {view.icon}
        <div>
          <p className="font-semibold text-white">{view.label}</p>
          <p className="text-xs text-white/55">
            {result.jobTitle} · Applied {new Date(result.appliedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-white/75">{view.text}</p>
      {result.status === "shortlisted" && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-black/30 px-3 py-2.5 text-sm">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[#0dcaf0]" />
          {result.interviewAt ? (
            <span className="text-white">
              <span className="text-white/60">Interview: </span>
              {new Date(result.interviewAt).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span className="text-white/70">Your interview date and time will be shared soon.</span>
          )}
        </div>
      )}
    </div>
  );
}
