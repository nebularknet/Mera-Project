"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RoleIcon } from "./role-icon";
import { ApplyForm } from "./apply-form";

type Job = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
};

export function CareersApply({ jobs }: { jobs: Job[] }) {
  const [open, setOpen] = React.useState(false);
  const [selectedJobId, setSelectedJobId] = React.useState<string | undefined>();

  const openWith = (jobId?: string) => {
    setSelectedJobId(jobId);
    setOpen(true);
  };

  const selectedTitle = jobs.find((j) => j.id === selectedJobId)?.title;

  return (
    <>
      {/* Hero CTA */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => openWith(undefined)}
          className="more-button"
          style={{ display: "inline-block" }}
        >
          Apply Now
        </button>
      </div>

      {/* Open positions */}
      {jobs.length > 0 && (
        <section className="services-section">
          <div className="container">
            <div className="row text-center mb-4">
              <div className="col">
                <h1 className="values-title">
                  Open <span className="highlight">Positions</span>
                </h1>
              </div>
            </div>
            <div className="row justify-content-center">
              {jobs.map((job) => (
                <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card service-card h-100">
                    <div className="card-body text-center">
                      <div className="service-icon">
                        <RoleIcon title={job.title} />
                      </div>
                      <h5 className="card-title">{job.title}</h5>
                      <p className="card-text">
                        <MapPin
                          size={14}
                          style={{
                            display: "inline",
                            marginRight: 6,
                            verticalAlign: "-2px",
                            color: "var(--pink)",
                          }}
                        />
                        {job.location || "Remote"}
                        {job.description ? ` — ${job.description}` : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => openWith(job.id)}
                        className="more-button"
                        style={{ display: "inline-block" }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Application modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Apply{selectedTitle ? ` — ${selectedTitle}` : ""}
            </DialogTitle>
            <DialogDescription>
              Fill in your details and attach your CV. We&apos;ll be in touch by email.
            </DialogDescription>
          </DialogHeader>
          {/* key remounts the wizard fresh each time the modal opens */}
          <ApplyForm
            key={`${selectedJobId ?? "none"}-${open}`}
            jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
            defaultJobId={selectedJobId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
