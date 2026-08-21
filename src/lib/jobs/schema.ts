import { z } from "zod";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_RESUME_TYPES = ["application/pdf"];

export const jobApplicationSchema = z.object({
  jobId: z.string().uuid({ message: "Please select a valid position." }),
  first_name: z.string().trim().min(2, "First name must be at least 2 characters.").max(100),
  last_name: z.string().trim().min(2, "Last name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number (at least 7 digits).").max(20),
  linkedin: z
    .string()
    .trim()
    .url("Please enter a valid LinkedIn URL.")
    .or(z.literal(""))
    .optional(),
  portfolio: z
    .string()
    .trim()
    .url("Please enter a valid portfolio URL.")
    .or(z.literal(""))
    .optional(),
  cover_letter: z.string().trim().max(5000).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export const resumeFileSchema = z
  .instanceof(File, { message: "Please upload your resume." })
  .refine((f) => f.size > 0, "Please upload your resume.")
  .refine((f) => f.size <= MAX_RESUME_BYTES, "Resume must be 5 MB or smaller.")
  .refine(
    (f) => ACCEPTED_RESUME_TYPES.includes(f.type),
    "Resume must be a PDF file."
  );
