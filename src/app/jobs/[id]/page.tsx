import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Clock, Star } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobApplyForm } from "./apply-form";
import Footer from "@/components/Footer";

import { Job } from "@/lib/jobs/types";
import { MOCK_JOBS } from "@/lib/jobs/mockData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createAdminClient();

  let job: { title: string; department: string } | null = null;
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === "";

  if (supabase && !isPlaceholder) {
    try {
      const { data } = await supabase
        .from("jobs")
        .select("title, department")
        .eq("id", id)
        .maybeSingle();
      if (data) job = data;
    } catch (e) {
      console.warn("[generateMetadata] failed to query job, checking mock data:", e);
    }
  }

  if (!job) {
    const mock = MOCK_JOBS.find((j) => j.id === id);
    if (mock) {
      job = { title: mock.title, department: mock.department };
    }
  }

  if (!job) {
    return {
      title: "Job Not Found — Nebulark",
    };
  }

  return {
    title: `${job.title} — ${job.department} — Nebulark`,
    description: `Apply for the ${job.title} position in the ${job.department} department at Nebulark.`,
  };
}

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = createAdminClient();
  let job: Job | null = null;
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === "";

  if (supabase && !isPlaceholder) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        job = data as Job;
      }
    } catch (err) {
      console.warn("[JobDetailsPage] Supabase query failed, checking mock data:", err);
    }
  }

  if (!job) {
    job = MOCK_JOBS.find((j) => j.id === id) ?? null;
  }

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
                  <span className="rounded bg-[#0dcaf0]/10 px-2.5 py-1 text-xs font-semibold text-[#0dcaf0]">
                    {job.department}
                  </span>
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
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#0dcaf0]" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={16} className="text-[#0dcaf0]" />
                    {job.employment_type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={16} className="text-[#0dcaf0]" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-[#0dcaf0]" />
                    {job.experience}
                  </span>
                </div>
              </div>

              <div>
                <a
                  href="#apply-form-section"
                  className="more-button m-0 px-8 py-3 inline-flex items-center justify-center font-bold text-center w-full lg:w-auto"
                >
                  Apply Now
                </a>
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
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50">Department</span>
                    <span className="text-white font-medium">{job.department}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50">Location</span>
                    <span className="text-white font-medium">{job.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50">Employment Type</span>
                    <span className="text-white font-medium">{job.employment_type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50">Experience</span>
                    <span className="text-white font-medium">{job.experience}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50">Salary Range</span>
                    <span className="text-white font-medium">{job.salary}</span>
                  </div>
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

              {/* Job Apply Form */}
              {job.status === "Open" ? (
                <JobApplyForm jobId={job.id} jobTitle={job.title} />
              ) : (
                <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-6 text-center">
                  <p className="text-red-400 font-semibold mb-1">Applications Closed</p>
                  <p className="text-xs text-white/50">This position is no longer accepting submissions. Thank you for your interest!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
