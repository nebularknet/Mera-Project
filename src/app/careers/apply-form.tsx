"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  applicationSchema,
  type ApplicationInput,
  MAX_CV_BYTES,
} from "@/lib/careers/schema";
import { submitApplication } from "./actions";

type JobOption = { id: string; title: string };

// Nebulark theme: black surfaces, white text, cyan (#0dcaf0) accent.
const labelCls = "text-white";
const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";
const triggerCls =
  "border-white/10 bg-[#121212] text-white data-[placeholder]:text-white/40 focus:ring-[#0dcaf0]/50";
const contentCls = "border-white/10 bg-[#121212] text-white";
const itemCls = "focus:bg-white/10 focus:text-white";

const STEPS = ["Position", "About you", "Education & CV"];

// Fields validated before leaving each step (CV is checked at final submit).
const STEP_FIELDS: (keyof ApplicationInput)[][] = [
  ["jobId"],
  ["fullName", "gender", "email", "contact", "city"],
  ["education", "university", "startDate", "endDate"],
];

export function ApplyForm({
  jobs,
  defaultJobId,
}: {
  jobs: JobOption[];
  defaultJobId?: string;
}) {
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [cvError, setCvError] = React.useState<string | null>(null);
  const cvRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: {
      jobId: defaultJobId ?? "",
      fullName: "",
      gender: undefined,
      education: undefined,
      university: "",
      startDate: "",
      endDate: "",
      city: "",
      email: "",
      contact: "",
      experience: "",
    },
  });

  const next = async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: ApplicationInput) => {
    const file = cvRef.current?.files?.[0];
    if (!file) return setCvError("Please attach your CV.");
    if (file.type !== "application/pdf") return setCvError("CV must be a PDF file.");
    if (file.size > MAX_CV_BYTES) return setCvError("CV must be 5 MB or smaller.");
    setCvError(null);

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
    fd.append("cv", file);

    const res = await submitApplication(fd);
    if (res.ok) setSubmitted(true);
    else toast({ title: "Couldn't submit", description: res.error, variant: "destructive" });
  };

  if (submitted) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#0dcaf0]" />
        <h2 className="mt-4 text-xl font-semibold text-white">Application submitted</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          Thanks for applying! We&apos;ve emailed you a confirmation and our team
          will review your application. You&apos;ll hear from us by email.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i <= step ? "bg-[#0dcaf0] text-black" : "bg-white/10 text-white/50"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-10 rounded transition-colors ${
                    i < step ? "bg-[#0dcaf0]" : "bg-white/10"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-white/60">
          Step {step + 1} of {STEPS.length} — <span className="text-white">{STEPS[step]}</span>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1 — Position */}
        {step === 0 && (
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Which role are you applying for? *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={triggerCls}>
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={contentCls}>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id} className={itemCls}>
                        {j.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* STEP 2 — About you */}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className={labelCls}>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Contact Number *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+92xxxxxxxxxx" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your city" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Gender *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={triggerCls}>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={contentCls}>
                      <SelectItem value="Male" className={itemCls}>Male</SelectItem>
                      <SelectItem value="Female" className={itemCls}>Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* STEP 3 — Education & CV */}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Education *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={triggerCls}>
                        <SelectValue placeholder="Select Degree" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={contentCls}>
                      <SelectItem value="Bachelor's Degree" className={itemCls}>Bachelor&apos;s Degree</SelectItem>
                      <SelectItem value="Master's Degree" className={itemCls}>Master&apos;s Degree</SelectItem>
                      <SelectItem value="MPhil" className={itemCls}>MPhil</SelectItem>
                      <SelectItem value="PhD" className={itemCls}>PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>University Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your university" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Degree Start *</FormLabel>
                  <FormControl>
                    <Input type="month" className={`${fieldCls} [color-scheme:dark]`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Degree End *</FormLabel>
                  <FormControl>
                    <Input type="month" className={`${fieldCls} [color-scheme:dark]`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="sm:col-span-2">
              <FormLabel className={labelCls}>Attach CV (PDF Only) *</FormLabel>
              <FormControl>
                <Input
                  ref={cvRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={() => setCvError(null)}
                  className={`${fieldCls} file:text-white`}
                />
              </FormControl>
              {cvError && <p className="text-sm font-medium text-red-400">{cvError}</p>}
            </FormItem>
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className={labelCls}>Experience (if any)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Mention company name, designation and duration"
                      className={`${fieldCls} resize-y`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              className="rounded-full bg-[#0dcaf0] px-8 font-semibold text-black hover:bg-[#0dcaf0]/90"
            >
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="rounded-full bg-[#0dcaf0] px-8 font-semibold text-black hover:bg-[#0dcaf0]/90"
            >
              {form.formState.isSubmitting ? "Submitting…" : "Submit Application"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
