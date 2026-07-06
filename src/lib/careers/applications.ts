import "server-only";
import { createAdminClient, CV_BUCKET } from "@/lib/supabase/admin";
import type { ApplicationStatus } from "@/lib/careers/schema";

export type Application = {
  id: string;
  job_id: string;
  full_name: string;
  gender: string;
  education: string;
  university: string;
  start_date: string;
  end_date: string;
  city: string;
  email: string;
  contact: string;
  experience: string | null;
  cv_path: string;
  status: ApplicationStatus;
  created_at: string;
  job_title: string | null;
};

export type ApplicationFilters = {
  jobId?: string;
  status?: ApplicationStatus;
  gender?: string;
  education?: string;
  city?: string;
  university?: string;
  experience?: "yes" | "no";
  dateFrom?: string; // YYYY-MM-DD (applied on/after)
  dateTo?: string; // YYYY-MM-DD (applied on/before)
  search?: string;
};

/**
 * Reads applications for the admin dashboard via the service-role client
 * (applications has no public RLS policy). Joins the job title and applies
 * optional filters. Newest first.
 */
export async function getApplications(
  filters: ApplicationFilters = {}
): Promise<Application[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("applications")
    .select("*, jobs(title)")
    .order("created_at", { ascending: false });

  if (filters.jobId) query = query.eq("job_id", filters.jobId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.education) query = query.eq("education", filters.education);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.university) query = query.eq("university", filters.university);
  if (filters.experience === "yes")
    query = query.not("experience", "is", null).neq("experience", "");
  if (filters.experience === "no")
    query = query.or("experience.is.null,experience.eq.");
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getApplications] failed:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const { jobs, ...rest } = row as Record<string, unknown> & {
      jobs?: { title: string } | null;
    };
    return { ...(rest as Omit<Application, "job_title">), job_title: jobs?.title ?? null };
  });
}

/** Counts grouped by status, for the dashboard summary cards. */
export async function getApplicationCounts(): Promise<{
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
}> {
  const apps = await getApplications();
  return {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };
}

/**
 * Distinct cities and universities present in the data, for filter dropdowns.
 * One query, two derived lists.
 */
export async function getFilterFacets(): Promise<{
  cities: string[];
  universities: string[];
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("city, university");
  if (error || !data) return { cities: [], universities: [] };
  const cities = Array.from(new Set(data.map((r) => r.city).filter(Boolean))).sort();
  const universities = Array.from(
    new Set(data.map((r) => r.university).filter(Boolean))
  ).sort();
  return { cities, universities };
}

/**
 * Generates a short-lived signed URL to view an applicant's CV from the private
 * bucket. Returns null on failure. Default expiry: 5 minutes.
 */
export async function getCvSignedUrl(
  cvPath: string,
  expiresInSeconds = 300
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(CV_BUCKET)
    .createSignedUrl(cvPath, expiresInSeconds);
  if (error || !data) {
    console.error("[getCvSignedUrl] failed:", error);
    return null;
  }
  return data.signedUrl;
}
