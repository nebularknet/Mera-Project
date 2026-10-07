import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "./types";

/**
 * The live `jobs` table uses the original careers schema
 * (id, title, description, location, is_open, created_at). The portal fields
 * from jobs-portal-schema.sql (department, salary, requirements, …) may not
 * exist yet, so rows are selected with `*` and normalized: missing text fields
 * become "" and missing lists become [], and the UI hides empty values. If the
 * extra columns are added later they are picked up automatically.
 */
type JobRow = Partial<Job> & {
  id: string;
  title: string;
  created_at: string;
  is_open?: boolean | null;
};

const text = (v: unknown) => (typeof v === "string" ? v : "");
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function normalize(row: JobRow): Job {
  const status: Job["status"] =
    row.status === "Open" || row.status === "Closed"
      ? row.status
      : row.is_open === false
        ? "Closed"
        : "Open";

  return {
    id: row.id,
    title: row.title,
    department: text(row.department),
    location: text(row.location),
    employment_type: text(row.employment_type),
    experience: text(row.experience),
    salary: text(row.salary),
    description: text(row.description),
    requirements: list(row.requirements),
    responsibilities: list(row.responsibilities),
    benefits: list(row.benefits),
    featured: row.featured === true,
    status,
    created_at: row.created_at,
    updated_at: text(row.updated_at) || row.created_at,
  };
}

/** All jobs, newest first. Throws if Supabase is unreachable or misconfigured. */
export async function getAllJobs(): Promise<Job[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`[jobs] query failed: ${error.message}`);
  return ((data ?? []) as JobRow[]).map(normalize);
}

/** One job by id, or null if it doesn't exist. */
export async function getJobById(id: string): Promise<Job | null> {
  // Non-UUID ids would make Postgres error on the uuid column; treat as not found.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`[jobs] query failed: ${error.message}`);
  return data ? normalize(data as JobRow) : null;
}
