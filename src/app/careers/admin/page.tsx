import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getAdminEmail } from "@/lib/auth/session";
import {
  getApplications,
  getApplicationCounts,
  getFilterFacets,
  type ApplicationFilters,
} from "@/lib/careers/applications";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/careers/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { FiltersBar } from "./filters-bar";
import { ApplicationsTable } from "./applications-table";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Applications — Nebulark Careers Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.length ? s : undefined;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const email = await getAdminEmail();
  if (!email) redirect("/careers/admin/login");

  const sp = await searchParams;
  const statusParam = pick(sp.status);
  const expParam = pick(sp.experience);
  const filters: ApplicationFilters = {
    jobId: pick(sp.jobId),
    status: APPLICATION_STATUSES.includes(statusParam as ApplicationStatus)
      ? (statusParam as ApplicationStatus)
      : undefined,
    gender: pick(sp.gender),
    education: pick(sp.education),
    city: pick(sp.city),
    university: pick(sp.university),
    experience: expParam === "yes" || expParam === "no" ? expParam : undefined,
    dateFrom: pick(sp.dateFrom),
    dateTo: pick(sp.dateTo),
    search: pick(sp.search),
  };

  // All jobs (open and closed) for the role filter.
  const supabase = createAdminClient();
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("id, title")
    .order("created_at", { ascending: false });

  const [applications, counts, facets] = await Promise.all([
    getApplications(filters),
    getApplicationCounts(),
    getFilterFacets(),
  ]);

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      {/* Sticky header bar — spans full width */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Applications <span style={{ color: "#0dcaf0" }}>Dashboard</span>
            </h1>
            <p className="mt-0.5 text-sm text-white/50">Signed in as {email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/careers/admin/jobs"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Briefcase className="h-4 w-4" /> Manage roles
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="w-full px-6 py-8 lg:px-10">
        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total" value={counts.total} icon={Users} accent="#ffffff" />
          <StatCard label="Pending" value={counts.pending} icon={Clock} accent="#facc15" />
          <StatCard label="Shortlisted" value={counts.shortlisted} icon={CheckCircle2} accent="#0dcaf0" />
          <StatCard label="Rejected" value={counts.rejected} icon={XCircle} accent="#f87171" />
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <FiltersBar
            jobs={allJobs ?? []}
            cities={facets.cities}
            universities={facets.universities}
          />
        </div>

        {/* Result count */}
        <p className="mb-3 text-sm text-white/45">
          {applications.length} application{applications.length === 1 ? "" : "s"}
        </p>

        {/* Table */}
        <ApplicationsTable rows={applications} />
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "#ffffff",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-3xl font-bold leading-none text-white">{value}</div>
        <div className="mt-1.5 text-xs font-medium uppercase tracking-wider text-white/45">
          {label}
        </div>
      </div>
    </div>
  );
}
