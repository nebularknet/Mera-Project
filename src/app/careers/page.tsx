import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Briefcase, CalendarClock, DollarSign, ArrowRight } from "lucide-react";
import { RoleIcon } from "./role-icon";
import { StatusCheck } from "./status-check";
import Footer from "@/components/Footer";
import type { Job } from "@/lib/jobs/types";
import { getAllJobs } from "@/lib/jobs/queries";
import { formatDateOnly, isPastLastDate } from "@/lib/careers/dates";

export const metadata: Metadata = {
  title: "Careers — Nebulark",
  description: "Join the Nebulark team. Browse open positions and apply to shape the future with us.",
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  let jobsList: Job[] = [];
  let loadFailed = false;
  try {
    // Roles switched off in the admin are not on the portal at all.
    jobsList = (await getAllJobs()).filter((job) => job.status === "Open");
  } catch (err) {
    console.error("[CareersPage]", err);
    loadFailed = true;
  }

  return (
    <>
      <main style={{ backgroundColor: "#000000", minHeight: "100vh", paddingTop: 100 }}>
        {/* Hero Section */}
        <section className="services-section py-12">
          <div className="container text-center">
            <h1 className="values-title" style={{ fontSize: "3rem" }}>
              Careers at <span className="highlight">Nebulark</span>
            </h1>
            <p className="mx-auto max-w-2xl text-white/70" style={{ fontSize: "1.15rem" }}>
              We build solutions for tomorrow. Discover opportunities to grow, innovate, and shape the future of design and engineering with a globally distributed team.
            </p>
            {jobsList.length > 0 && (
              <div className="mt-6">
                <StatusCheck jobs={jobsList.map((j) => ({ id: j.id, title: j.title }))} />
              </div>
            )}
          </div>
        </section>

        {/* Listings */}
        <section className="py-6">
          <div className="container">
            {loadFailed ? (
              <div className="text-center py-16 border border-white/10 rounded-lg bg-white/[0.02]">
                <h3 className="text-lg font-semibold text-white mb-2">Open positions are unavailable right now</h3>
                <p className="text-white/60 max-w-md mx-auto text-sm">
                  We couldn&apos;t load our job listings. Please try again in a few minutes.
                </p>
              </div>
            ) : jobsList.length > 0 ? (
              <div className="row justify-content-center">
                {jobsList.map((job) => {
                  const closed = isPastLastDate(job.last_date);
                  return (
                    <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card service-card h-100 flex flex-col justify-between border border-white/5 bg-white/[0.03] transition-all hover:border-[#0dcaf0]/30 hover:bg-white/[0.05]">
                        <div className="card-body p-6 flex flex-col h-full justify-between">
                          <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="service-icon m-0 flex items-center justify-center bg-[#121212] rounded-full w-14 h-14 text-[#0dcaf0] text-2xl">
                                <RoleIcon title={job.title} />
                              </div>
                              {closed ? (
                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                                  Applications closed
                                </span>
                              ) : (
                                job.featured && (
                                  <span className="rounded-full bg-[#0dcaf0]/10 px-3 py-1 text-xs font-semibold text-[#0dcaf0]">
                                    Featured
                                  </span>
                                )
                              )}
                            </div>

                            {/* Title */}
                            <h4 className="text-xl font-bold text-white mb-2 text-left">
                              {job.title}
                            </h4>

                            {/* Job Meta */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/60 mb-4 text-left">
                              {job.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin size={14} className="text-[#0dcaf0]" />
                                  {job.location}
                                </span>
                              )}
                              {job.employment_type && (
                                <span className="flex items-center gap-1.5">
                                  <Briefcase size={14} className="text-[#0dcaf0]" />
                                  {job.employment_type}
                                </span>
                              )}
                              {job.salary && (
                                <span className="flex items-center gap-1.5">
                                  <DollarSign size={14} className="text-[#0dcaf0]" />
                                  {job.salary}
                                </span>
                              )}
                            </div>

                            {/* Short Description */}
                            <p className="text-sm text-white/70 line-clamp-3 mb-6 text-left">
                              {job.description}
                            </p>
                          </div>

                          {/* Card Footer Button */}
                          <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
                            <span className="text-xs text-white/50 flex items-center gap-1.5 text-left whitespace-nowrap">
                              <CalendarClock size={14} className="shrink-0 text-[#0dcaf0]" />
                              {job.last_date
                                ? `Last date: ${formatDateOnly(job.last_date)}`
                                : "Open until filled"}
                            </span>
                            <Link href={`/careers/${job.id}`} className="more-button m-0 px-5 py-2 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                              View Details
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-white/10 rounded-lg bg-white/[0.02]">
                <h3 className="text-lg font-semibold text-white mb-2">No open positions right now</h3>
                <p className="text-white/60 max-w-md mx-auto text-sm">
                  We don&apos;t have any openings at the moment. Please check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
