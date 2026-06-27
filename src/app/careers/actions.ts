"use server";

import { randomUUID } from "crypto";
import { createAdminClient, CV_BUCKET } from "@/lib/supabase/admin";
import { applicationSchema, cvFileSchema } from "@/lib/careers/schema";
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

  // 3. Confirm the selected job exists and is open.
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id, title, is_open")
    .eq("id", input.jobId)
    .maybeSingle();
  if (jobErr || !job || !job.is_open) {
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
