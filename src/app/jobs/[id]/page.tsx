import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Clock, Star } from "lucide-react";
import Footer from "@/components/Footer";
import { getJobById } from "@/lib/jobs/queries";
import { JobApplyButton } from "./apply-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id).catch(() => null);

  if (!job) {
    return { title: "Job Not Found — Nebulark" };
  }

  const where = job.department ? ` in the ${job.department} department` : "";
  return {
    title: job.department ? `${job.title} — ${job.department} — Nebulark` : `${job.title} — Nebulark`,
    description: `Apply for the ${job.title} position${where} at Nebulark.`,
  };
}

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return notFound();
  }

  return (
    <>
      <main style={{ backgroundColor: "#000000", minHeight: "100vh", paddingTop: 100 }}>
        <div className="container py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to open positions
            </Link>
          </div>

          {/* Job Details Header */}
          <div className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  {job.department && (
                    <span className="rounded bg-[#0dcaf0]/10 px-2.5 py-1 text-xs font-semibold text-[#0dcaf0]">
                      {job.department}
                    </span>
                  )}
                  {job.featured && (
                    <span className="rounded bg-[#0dcaf0]/20 px-2.5 py-1 text-xs font-semibold text-[#0dcaf0] flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Featured
                    </span>
                  )}
                  {job.status === "Open" ? (
                    <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      Open & Accepting Applications
                    </span>
                  ) : (
                    <span className="rounded bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                      Closed
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 text-left">
                  {job.title}
                </h1>

                {/* Job Meta Info */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65 text-left">
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-[#0dcaf0]" />
                      {job.location}
                    </span>
                  )}
                  {job.employment_type && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={16} className="text-[#0dcaf0]" />
                      {job.employment_type}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={16} className="text-[#0dcaf0]" />
                      {job.salary}
                    </span>
                  )}
                  {job.experience && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-[#0dcaf0]" />
                      {job.experience}
                    </span>
                  )}
                </div>
              </div>


            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start mb-12">
            {/* Left Content Column (Description & Details) */}
            <div className="lg:col-span-2 space-y-8 text-left">
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white border-l-2 border-[#0dcaf0] pl-3">
                  Job Description
                </h3>
                <p className="text-white/70 leading-relaxed whitespace-pre-line text-base">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white border-l-2 border-[#0dcaf0] pl-3">
                    Requirements
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-white/70 text-base">
                    {job.requirements.map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white border-l-2 border-[#0dcaf0] pl-3">
                    Key Responsibilities
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-white/70 text-base">
                    {job.responsibilities.map((resp: string, i: number) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white border-l-2 border-[#0dcaf0] pl-3">
                    What We Offer & Benefits
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-white/70 text-base">
                    {job.benefits.map((benefit: string, i: number) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar Summary & Apply Form) */}
            <div id="apply-form-section" className="space-y-6 lg:sticky lg:top-[120px]">
              {/* Job Info Summary Box */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-left">
                <h4 className="text-lg font-bold text-white mb-4">Role Overview</h4>
                <div className="space-y-3.5 text-sm">
                  {job.department && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50">Department</span>
                      <span className="text-white font-medium">{job.department}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50">Location</span>
                      <span className="text-white font-medium">{job.location}</span>
                    </div>
                  )}
                  {job.employment_type && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50">Employment Type</span>
                      <span className="text-white font-medium">{job.employment_type}</span>
                    </div>
                  )}
                  {job.experience && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50">Experience</span>
                      <span className="text-white font-medium">{job.experience}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-white/50">Salary Range</span>
                      <span className="text-white font-medium">{job.salary}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-white/50">Posted Date</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(job.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
                {job.status === "Open" ? (
                  <>
                    <p className="text-white/80 font-semibold mb-3">Interested in this role?</p>
                    <JobApplyButton jobId={job.id} jobTitle={job.title} />
                  </>
                ) : (
                  <>
                    <p className="text-white/80 font-semibold mb-1">Applications Closed</p>
                    <p className="text-xs text-white/50">
                      We are not accepting applications for this position at the moment. Thank you for your interest!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
