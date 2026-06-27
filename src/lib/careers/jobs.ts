import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Job = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  is_open: boolean;
  created_at: string;
};

/** Open roles for the public careers page and the apply-form dropdown. */
export async function getOpenJobs(): Promise<Job[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_open", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getOpenJobs] failed:", error);
    return [];
  }
  return (data ?? []) as Job[];
}
