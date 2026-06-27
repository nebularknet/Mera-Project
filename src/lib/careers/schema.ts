import { z } from "zod";

export const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_CV_TYPES = ["application/pdf"];

export const APPLICATION_STATUSES = ["pending", "shortlisted", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/**
 * Validates the apply-form fields. Shared between the client (react-hook-form
 * via zodResolver) and the server action (re-validated — never trust the client).
 *
 * The CV file itself is validated separately (see cvFileSchema) because a
 * File/Blob crosses the client/server boundary differently than plain fields.
 */
export const applicationSchema = z.object({
  jobId: z.string().uuid({ message: "Please select a position." }),
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
  gender: z.enum(["Male", "Female"], { message: "Please select a gender." }),
  education: z.enum(["Bachelor's Degree", "Master's Degree", "MPhil", "PhD"], {
    message: "Please select your education.",
  }),
  university: z.string().trim().min(2, "University name is required.").max(160),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, "Enter a valid start month."),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, "Enter a valid end month."),
  city: z.string().trim().min(2, "City is required.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  contact: z.string().trim().min(7, "Enter a valid contact number.").max(20),
  experience: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** Validates the uploaded CV file (server-side, on the parsed FormData entry). */
export const cvFileSchema = z
  .instanceof(File, { message: "Please attach your CV." })
  .refine((f) => f.size > 0, "Please attach your CV.")
  .refine((f) => f.size <= MAX_CV_BYTES, "CV must be 5 MB or smaller.")
  .refine(
    (f) => ACCEPTED_CV_TYPES.includes(f.type),
    "CV must be a PDF file."
  );
