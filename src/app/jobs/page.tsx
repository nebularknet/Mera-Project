import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Briefcase, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobsFilters } from "./jobs-filters";
import { RoleIcon } from "../careers/role-icon";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Careers — Nebulark",
  description: "Join the Nebulark team. Browse open positions and apply to shape the future with us.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    department?: string;
    location?: string;
    employmentType?: string;
    featured?: string;
    openOnly?: string;
  }>;
}

import { Job } from "@/lib/jobs/types";
import { MOCK_JOBS } from "@/lib/jobs/mockData";

export default async function JobsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const supabase = createAdminClient();

  let jobsList: Job[] = [];
  let departments: string[] = [];
  let locations: string[] = [];
  let employmentTypes: string[] = [];

  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === "";
  let useMock = isPlaceholder;

  if (supabase && !isPlaceholder) {
    try {
      // 1. Fetch all distinct values for filters from ALL jobs (so users always see all options)
      const { data: allJobsData, error: allJobsError } = await supabase
        .from("jobs")
        .select("department, location, employment_type");

      if (allJobsError) {
        console.warn("[JobsPage] Supabase filter query failed:", allJobsError.message);
        useMock = true;
      } else {
        departments = Array.from(new Set((allJobsData ?? []).map((j) => j.department))).filter(Boolean);
        locations = Array.from(new Set((allJobsData ?? []).map((j) => j.location))).filter(Boolean);
        employmentTypes = Array.from(new Set((allJobsData ?? []).map((j) => j.employment_type))).filter(Boolean);

        // 2. Query jobs matching search parameters
        let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });

        // Filter: Open roles only (defaults to true)
        if (resolvedParams.openOnly !== "false") {
          query = query.eq("status", "Open");
        }

        // Filter: Featured
        if (resolvedParams.featured === "true") {
          query = query.eq("featured", true);
        }

        // Filter: Department
        if (resolvedParams.department) {
          query = query.eq("department", resolvedParams.department);
        }

        // Filter: Location
        if (resolvedParams.location) {
          query = query.eq("location", resolvedParams.location);
        }

        // Filter: Employment Type
        if (resolvedParams.employmentType) {
          query = query.eq("employment_type", resolvedParams.employmentType);
        }

        // Filter: Search Term (title or description)
        if (resolvedParams.search) {
          const searchVal = resolvedParams.search.trim();
          query = query.or(`title.ilike.%${searchVal}%,description.ilike.%${searchVal}%`);
        }

        const { data: jobs, error: fetchErr } = await query;

        if (fetchErr) {
          console.warn("[JobsPage] Supabase jobs query failed:", fetchErr.message);
          useMock = true;
        } else {
          jobsList = (jobs ?? []) as Job[];
        }
      }
    } catch (err) {
      console.warn("[JobsPage] Supabase query failed, falling back to mock data:", err);
      useMock = true;
    }
  }

  if (useMock) {
    // Generate filter lists from all mock jobs
    departments = Array.from(new Set(MOCK_JOBS.map((j) => j.department))).filter(Boolean);
    locations = Array.from(new Set(MOCK_JOBS.map((j) => j.location))).filter(Boolean);
    employmentTypes = Array.from(new Set(MOCK_JOBS.map((j) => j.employment_type))).filter(Boolean);

    // Apply memory filters on mock data
    jobsList = MOCK_JOBS.filter((job) => {
      // Open roles only (defaults to true)
      if (resolvedParams.openOnly !== "false" && job.status !== "Open") {
        return false;
      }
      // Featured
      if (resolvedParams.featured === "true" && !job.featured) {
        return false;
      }
      // Department
      if (resolvedParams.department && job.department !== resolvedParams.department) {
        return false;
      }
      // Location
      if (resolvedParams.location && job.location !== resolvedParams.location) {
        return false;
      }
      // Employment Type
      if (resolvedParams.employmentType && job.employment_type !== resolvedParams.employmentType) {
        return false;
      }
      // Search
      if (resolvedParams.search) {
        const term = resolvedParams.search.toLowerCase().trim();
        const inTitle = job.title.toLowerCase().includes(term);
        const inDesc = job.description.toLowerCase().includes(term);
        if (!inTitle && !inDesc) {
          return false;
        }
      }
      return true;
    });
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
          </div>
        </section>

        {/* Filter and Listings */}
        <section className="py-6">
          <div className="container">
            <JobsFilters
              departments={departments}
              locations={locations}
              employmentTypes={employmentTypes}
            />

            {/* Job Grid / List */}
            {jobsList.length > 0 ? (
              <div className="row justify-content-center">
                {jobsList.map((job) => (
                  <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card service-card h-100 flex flex-col justify-between border border-white/5 bg-white/[0.03] transition-all hover:border-[#0dcaf0]/30 hover:bg-white/[0.05]">
                      <div className="card-body p-6 flex flex-col h-full justify-between">
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="service-icon m-0 flex items-center justify-center bg-[#121212] rounded-full w-14 h-14 text-[#0dcaf0] text-2xl">
                              <RoleIcon title={job.title} />
                            </div>
                            {job.featured && (
                              <span className="rounded-full bg-[#0dcaf0]/10 px-3 py-1 text-xs font-semibold text-[#0dcaf0]">
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-xl font-bold text-white mb-2 text-left">
                            {job.title}
                          </h4>

                          {/* Job Meta */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/60 mb-4 text-left">
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#0dcaf0]" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Briefcase size={14} className="text-[#0dcaf0]" />
                              {job.employment_type}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <DollarSign size={14} className="text-[#0dcaf0]" />
                              {job.salary}
                            </span>
                          </div>

                          {/* Short Description */}
                          <p className="text-sm text-white/70 line-clamp-3 mb-6 text-left">
                            {job.description}
                          </p>
                        </div>

                        {/* Card Footer Button */}
                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-xs text-white/40 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(job.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <Link href={`/jobs/${job.id}`} className="more-button m-0 px-5 py-2 inline-flex items-center gap-1.5 text-sm font-semibold">
                            View Details
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-white/10 rounded-lg bg-white/[0.02]">
                <h3 className="text-lg font-semibold text-white mb-2">No matching positions found</h3>
                <p className="text-white/60 max-w-md mx-auto text-sm">
                  We couldn&apos;t find any roles matching your current search criteria. Try modifying your filters or check back later!
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
