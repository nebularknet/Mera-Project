"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobApplicationSchema, resumeFileSchema } from "@/lib/jobs/schema";

export type SubmitResult = { ok: true } | { ok: false; error: string };

const RESUME_BUCKET = "resumes";

/**
 * Handles a public job application submission.
 * Validates form fields and uploads the resume file to Supabase Storage.
 */
export async function submitJobApplication(formData: FormData): Promise<SubmitResult> {
  try {
    // 1. Validate fields using Zod
    const parsed = jobApplicationSchema.safeParse({
      jobId: formData.get("jobId"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      linkedin: formData.get("linkedin") || undefined,
      portfolio: formData.get("portfolio") || undefined,
      cover_letter: formData.get("cover_letter") || undefined,
      message: formData.get("message") || undefined,
    });

    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form data." };
    }

    const input = parsed.data;

    // 2. Validate resume file
    const resumeFile = formData.get("resume");
    const resumeParsed = resumeFileSchema.safeParse(resumeFile);
    if (!resumeParsed.success) {
      return { ok: false, error: resumeParsed.error.issues[0]?.message ?? "Invalid resume file." };
    }
    const file = resumeParsed.data;

    const supabase = createAdminClient();

    if (!supabase) {
      return { ok: false, error: "The database connection is not configured. Please contact the administrator." };
    }

    // 3. Verify that the job exists and is open
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("id", input.jobId)
      .maybeSingle();

    if (jobErr || !job) {
      return { ok: false, error: "The selected position was not found." };
    }

    if (job.status !== "Open") {
      return { ok: false, error: "This position is no longer accepting applications." };
    }

    // 4. Upload resume to the private bucket "resumes"
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const resumePath = `${randomUUID()}-${safeName}`;
    const { error: uploadErr } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(resumePath, file, { 
        contentType: "application/pdf", 
        upsert: false 
      });

    if (uploadErr) {
      console.error("[submitJobApplication] Resume upload failed:", uploadErr);
      return { ok: false, error: "Could not upload your resume. Please try again." };
    }

    // 5. Insert the application row into the database
    const { error: insertErr } = await supabase.from("applications").insert({
      job_id: input.jobId,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      linkedin: input.linkedin || null,
      portfolio: input.portfolio || null,
      resume_url: resumePath,
      cover_letter: input.cover_letter || null,
      message: input.message || null,
      status: "pending",
    });

    if (insertErr) {
      console.error("[submitJobApplication] Database insert failed:", insertErr);
      // Clean up orphaned resume file
      await supabase.storage.from(RESUME_BUCKET).remove([resumePath]);
      return { ok: false, error: "Something went wrong submitting your application. Please try again." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[submitJobApplication] Uncaught error:", err);
    return { ok: false, error: "An unexpected error occurred. Please try again." };
  }
}
