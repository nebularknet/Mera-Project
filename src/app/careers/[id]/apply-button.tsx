"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApplyForm } from "@/app/careers/apply-form";

export function JobApplyButton({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="more-button"
        style={{ display: "inline-block" }}
      >
        Apply Now
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply — {jobTitle}</DialogTitle>
            <DialogDescription>
              Fill in your details and attach your CV. We&apos;ll be in touch by email.
            </DialogDescription>
          </DialogHeader>
          <ApplyForm
            key={String(open)}
            jobs={[{ id: jobId, title: jobTitle }]}
            defaultJobId={jobId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
