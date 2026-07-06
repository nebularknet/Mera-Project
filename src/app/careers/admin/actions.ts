"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmail } from "@/lib/auth/session";
import { getCvSignedUrl } from "@/lib/careers/applications";
import { emailStatusChanged } from "@/lib/resend";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/careers/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Updates an application's status. Records an audit row in
 * application_status_history (old → new, who, when) and emails the applicant.
 * Every admin action re-checks authorization server-side — never trust the
 * client to have stayed on an authorized page.
 */
export async function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return { ok: false, error: "Not authorized." };

  if (!APPLICATION_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const supabase = createAdminClient();

  const { data: app, error: readErr } = await supabase
    .from("applications")
    .select("id, status, full_name, email, jobs(title)")
    .eq("id", applicationId)
    .maybeSingle();

  if (readErr || !app) {
    return { ok: false, error: "Application not found." };
  }

  const oldStatus = app.status as ApplicationStatus;
  if (oldStatus === status) return { ok: true }; // no-op

  const { error: updateErr } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);
  if (updateErr) {
    console.error("[setApplicationStatus] update failed:", updateErr);
    return { ok: false, error: "Could not update the status." };
  }

  // Audit trail (best-effort — don't fail the action if history insert fails).
  const { error: histErr } = await supabase.from("application_status_history").insert({
    application_id: applicationId,
    old_status: oldStatus,
    new_status: status,
    changed_by: adminEmail,
  });
  if (histErr) console.error("[setApplicationStatus] history insert failed:", histErr);

  // Notify the applicant (fire-and-forget; never blocks the result).
  // Supabase types the joined relation as an array; the actual shape is a
  // single related row, so normalize both.
  const joined = (app as unknown as { jobs?: { title: string } | { title: string }[] | null })
    .jobs;
  const jobTitle =
    (Array.isArray(joined) ? joined[0]?.title : joined?.title) ?? "the role";
  await emailStatusChanged(app.email as string, app.full_name as string, jobTitle, status);

  revalidatePath("/careers/admin");
  return { ok: true };
}

/** Returns a short-lived signed URL for viewing a CV. */
export async function viewCv(cvPath: string): Promise<{ url: string } | { error: string }> {
  if (!(await getAdminEmail())) return { error: "Not authorized." };
  const url = await getCvSignedUrl(cvPath);
  return url ? { url } : { error: "Could not open the CV." };
}

/** Toggles a job open/closed. */
export async function toggleJobOpen(
  jobId: string,
  isOpen: boolean
): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  const supabase = createAdminClient();
  const { error } = await supabase.from("jobs").update({ is_open: isOpen }).eq("id", jobId);
  if (error) {
    console.error("[toggleJobOpen] failed:", error);
    return { ok: false, error: "Could not update the role." };
  }
  revalidatePath("/careers/admin/jobs");
  revalidatePath("/careers");
  return { ok: true };
}

/** Creates a new job posting. */
export async function createJob(formData: FormData): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (title.length < 2) return { ok: false, error: "Enter a role title." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("jobs").insert({
    title,
    location: location || null,
    description: description || null,
    is_open: true,
  });
  if (error) {
    console.error("[createJob] failed:", error);
    return { ok: false, error: "Could not create the role." };
  }
  revalidatePath("/careers/admin/jobs");
  revalidatePath("/careers");
  return { ok: true };
}

/** Signs the current admin out and returns to the login page. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/careers/admin/login");
}
