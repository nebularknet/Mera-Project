import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAdminEmail } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobsManager } from "./jobs-manager";

export const metadata: Metadata = {
  title: "Manage roles — Nebulark Careers Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ManageJobsPage() {
  if (!(await getAdminEmail())) redirect("/careers/admin/login");

  const supabase = createAdminClient();
  const [{ data: jobs }, { data: apps }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, location, description, is_open")
      .order("created_at", { ascending: false }),
    supabase.from("applications").select("job_id"),
  ]);

  const countByJob = new Map<string, number>();
  for (const a of apps ?? []) {
    countByJob.set(a.job_id, (countByJob.get(a.job_id) ?? 0) + 1);
  }

  const rows = (jobs ?? []).map((j) => ({
    ...j,
    applicationCount: countByJob.get(j.id) ?? 0,
  }));

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur lg:px-10">
        <Link
          href="/careers/admin"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to applications
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Manage <span style={{ color: "#0dcaf0" }}>Roles</span>
        </h1>
        <p className="mt-0.5 text-sm text-white/50">
          Closed roles disappear from the public careers page and the apply form.
        </p>
      </header>

      <div className="w-full px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <JobsManager jobs={rows} />
        </div>
      </div>
    </main>
  );
}
