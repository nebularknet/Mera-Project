"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { createAdminClient, CV_BUCKET } from "@/lib/supabase/admin";
import {
  applicationSchema,
  cvFileSchema,
  type ApplicationStatus,
} from "@/lib/careers/schema";
import { isPastLastDate } from "@/lib/careers/dates";
import {
  emailApplicationReceived,
  emailTeamNewApplication,
} from "@/lib/resend";

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Handles a public job-application submission.
 *
 * Trust nothing from the client: every field is re-validated server-side, the
 * CV is re-checked for type/size, and all DB/storage writes use the service-role
 * client (the browser has no access to the applications table or CV bucket).
 */
export async function submitApplication(formData: FormData): Promise<SubmitResult> {
  // 1. Validate scalar fields.
  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    fullName: formData.get("fullName"),
    gender: formData.get("gender"),
    education: formData.get("education"),
    university: formData.get("university"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    city: formData.get("city"),
    dob: formData.get("dob"),
    cnic: formData.get("cnic"),
    email: formData.get("email"),
    contact: formData.get("contact"),
    experience: formData.get("experience") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }
  const input = parsed.data;

  // 2. Validate the CV file (type + size).
  const cv = formData.get("cv");
  const cvParsed = cvFileSchema.safeParse(cv);
  if (!cvParsed.success) {
    return { ok: false, error: cvParsed.error.issues[0]?.message ?? "Invalid CV file." };
  }
  const file = cvParsed.data;

  const supabase = createAdminClient();

  // 3. Confirm the selected job exists, is open, and its last date hasn't passed.
  //    `*` so this keeps working before the last_date column is added.
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", input.jobId)
    .maybeSingle();
  if (jobErr || !job || !job.is_open || isPastLastDate(job.last_date)) {
    return { ok: false, error: "That position is no longer accepting applications." };
  }

  // 4. Upload the CV to the private bucket.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const cvPath = `${randomUUID()}-${safeName}`;
  const { error: uploadErr } = await supabase.storage
    .from(CV_BUCKET)
    .upload(cvPath, file, { contentType: "application/pdf", upsert: false });
  if (uploadErr) {
    console.error("[submitApplication] CV upload failed:", uploadErr);
    return { ok: false, error: "Could not upload your CV. Please try again." };
  }

  // 5. Insert the application row.
  const { error: insertErr } = await supabase.from("applications").insert({
    job_id: input.jobId,
    full_name: input.fullName,
    gender: input.gender,
    education: input.education,
    university: input.university,
    start_date: input.startDate,
    end_date: input.endDate,
    city: input.city,
    dob: input.dob,
    cnic: input.cnic,
    email: input.email,
    contact: input.contact,
    experience: input.experience || null,
    cv_path: cvPath,
    status: "pending",
  });
  if (insertErr) {
    console.error("[submitApplication] insert failed:", insertErr);
    // Best-effort cleanup of the orphaned CV.
    await supabase.storage.from(CV_BUCKET).remove([cvPath]);
    return { ok: false, error: "Something went wrong submitting your application." };
  }

  // 6. Fire-and-forget emails (failures are logged, never block the response).
  await Promise.allSettled([
    emailApplicationReceived(input.email, input.fullName, job.title),
    emailTeamNewApplication(input.fullName, job.title, input.email),
  ]);

  return { ok: true };
}

export type StatusResult =
  | {
      ok: true;
      status: ApplicationStatus;
      appliedAt: string;
      interviewAt: string | null;
      jobTitle: string;
    }
  | { ok: false; error: string };

const statusLookupSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  jobId: z.string().uuid({ message: "Please select the role you applied for." }),
});

/**
 * Public status lookup by email + role. Only roles currently on the portal
 * (is_open) can be checked; applications for removed roles are never returned.
 * Returns the minimum the applicant needs — no other personal details.
 */
export async function checkApplicationStatus(formData: FormData): Promise<StatusResult> {
  const parsed = statusLookupSchema.safeParse({
    email: formData.get("email"),
    jobId: formData.get("jobId"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  const { email, jobId } = parsed.data;

  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, is_open")
    .eq("id", jobId)
    .maybeSingle();
  if (!job || !job.is_open) {
    return { ok: false, error: "This role is no longer listed, so its status can't be checked." };
  }

  // Case-insensitive exact match; escape LIKE wildcards in the address.
  const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data: rows, error } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .ilike("email", pattern)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("[checkApplicationStatus] failed:", error);
    return { ok: false, error: "Couldn't check your status right now. Please try again." };
  }

  const app = rows?.[0] as
    | { status: ApplicationStatus; created_at: string; interview_at?: string | null }
    | undefined;
  if (!app) {
    return {
      ok: false,
      error: "We couldn't find an application with that email for this role.",
    };
  }

  return {
    ok: true,
    status: app.status,
    appliedAt: app.created_at,
    interviewAt: app.status === "shortlisted" ? (app.interview_at ?? null) : null,
    jobTitle: job.title as string,
  };
}
