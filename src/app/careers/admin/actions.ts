"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmail } from "@/lib/auth/session";
import { getCvSignedUrl } from "@/lib/careers/applications";
import { emailStatusChanged } from "@/lib/resend";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/careers/schema";
import { INTERVIEW_WINDOW_DAYS, isDateOnly } from "@/lib/careers/dates";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Updates an application's status. Records an audit row in
 * application_status_history (old → new, who, when) and emails the applicant.
 * Every admin action re-checks authorization server-side — never trust the
 * client to have stayed on an authorized page.
 */
export async function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  interviewAt?: string
): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return { ok: false, error: "Not authorized." };

  if (!APPLICATION_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  // Shortlisting requires an interview slot from now up to INTERVIEW_WINDOW_DAYS ahead.
  let interviewIso: string | null = null;
  if (status === "shortlisted") {
    const when = interviewAt ? new Date(interviewAt) : null;
    const now = Date.now();
    const max = now + INTERVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    // 5-minute grace for the time spent filling in the dialog.
    if (!when || Number.isNaN(when.getTime()) || when.getTime() < now - 5 * 60 * 1000 || when.getTime() > max) {
      return { ok: false, error: "Pick an interview date and time within the next month." };
    }
    interviewIso = when.toISOString();
  }

  const supabase = createAdminClient();

  const { data: app, error: readErr } = await supabase
    .from("applications")
    .select("*, jobs(title)")
    .eq("id", applicationId)
    .maybeSingle();

  if (readErr || !app) {
    return { ok: false, error: "Application not found." };
  }

  const oldStatus = app.status as ApplicationStatus;
  const oldInterview = (app.interview_at as string | null | undefined) ?? null;
  const sameInterview =
    (oldInterview ? new Date(oldInterview).toISOString() : null) === interviewIso;
  if (oldStatus === status && sameInterview) return { ok: true }; // no-op

  // interview_at is only written when shortlisting or when clearing an old
  // slot, so status changes keep working before the column exists.
  const update: { status: ApplicationStatus; interview_at?: string | null } = { status };
  if (status === "shortlisted") update.interview_at = interviewIso;
  else if (oldInterview) update.interview_at = null;

  const { error: updateErr } = await supabase
    .from("applications")
    .update(update)
    .eq("id", applicationId);
  if (updateErr) {
    console.error("[setApplicationStatus] update failed:", updateErr);
    const missingColumn = /interview_at/.test(updateErr.message ?? "");
    return {
      ok: false,
      error: missingColumn
        ? "Interview scheduling isn't set up yet — run supabase/careers-last-date-interview.sql in Supabase."
        : "Could not update the status.",
    };
  }

  // Audit trail (best-effort — don't fail the action if history insert fails).
  if (oldStatus !== status) {
    const { error: histErr } = await supabase.from("application_status_history").insert({
      application_id: applicationId,
      old_status: oldStatus,
      new_status: status,
      changed_by: adminEmail,
    });
    if (histErr) console.error("[setApplicationStatus] history insert failed:", histErr);
  }

  // Notify the applicant (fire-and-forget; never blocks the result).
  // Supabase types the joined relation as an array; the actual shape is a
  // single related row, so normalize both.
  const joined = (app as unknown as { jobs?: { title: string } | { title: string }[] | null })
    .jobs;
  const jobTitle =
    (Array.isArray(joined) ? joined[0]?.title : joined?.title) ?? "the role";
  await emailStatusChanged(
    app.email as string,
    app.full_name as string,
    jobTitle,
    status,
    interviewIso
  );

  revalidatePath("/careers/admin");
  return { ok: true };
}

/** Sets (or clears, with "") a role's last date to apply, as YYYY-MM-DD. */
export async function setJobLastDate(jobId: string, lastDate: string): Promise<ActionResult> {
  if (!(await getAdminEmail())) return { ok: false, error: "Not authorized." };
  if (lastDate && !isDateOnly(lastDate)) return { ok: false, error: "Invalid date." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("jobs")
    .update({ last_date: lastDate || null })
    .eq("id", jobId);
  if (error) {
    console.error("[setJobLastDate] failed:", error);
    return { ok: false, error: lastDateError(error.message) };
  }
  revalidatePath("/careers/admin/jobs");
  revalidatePath("/careers");
  return { ok: true };
}

/** Textarea → list: one item per line, leading bullets ("-", "*", "•", "1.") stripped. */
function toList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 30);
}

function lastDateError(message: string | undefined) {
  return /last_date/.test(message ?? "")
    ? "Last dates aren't set up yet — run supabase/careers-last-date-interview.sql in Supabase."
    : "Could not save the last date.";
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
  const lastDate = String(formData.get("lastDate") ?? "").trim();
  const requirements = toList(formData.get("requirements"));
  const responsibilities = toList(formData.get("responsibilities"));

  if (title.length < 2) return { ok: false, error: "Enter a role title." };
  if (description.length < 10) return { ok: false, error: "Enter a job description." };
  if (lastDate && !isDateOnly(lastDate)) return { ok: false, error: "Invalid closing date." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("jobs").insert({
    title,
    location: location || null,
    description,
    requirements,
    responsibilities,
    is_open: true,
    ...(lastDate ? { last_date: lastDate } : {}),
  });
  if (error) {
    console.error("[createJob] failed:", error);
    return {
      ok: false,
      error: /last_date|requirements|responsibilities/.test(error.message ?? "")
        ? "The roles table needs updating — run supabase/careers-last-date-interview.sql in Supabase."
        : "Could not create the role.",
    };
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
