"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Upload, AlertCircle } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import {
  jobApplicationSchema,
  type JobApplicationInput,
  MAX_RESUME_BYTES,
} from "@/lib/jobs/schema";
import { submitJobApplication } from "../actions";

const labelCls = "text-white font-medium text-sm";
const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50 h-11 transition-all focus:border-[#0dcaf0]/50";
const textareaCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50 resize-y min-h-[100px] transition-all focus:border-[#0dcaf0]/50";

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
}

export function JobApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [resumeError, setResumeError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    mode: "onTouched",
    defaultValues: {
      jobId,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      linkedin: "",
      portfolio: "",
      cover_letter: "",
      message: "",
    },
  });

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      setSelectedFile(null);
      setResumeError("Please upload your resume.");
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setResumeError("Resume must be a PDF file.");
      return;
    }

    if (file.size > MAX_RESUME_BYTES) {
      setSelectedFile(null);
      setResumeError("Resume must be 5 MB or smaller.");
      return;
    }

    setSelectedFile(file);
    setResumeError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (values: JobApplicationInput) => {
    if (!selectedFile) {
      setResumeError("Please upload your resume.");
      return;
    }

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      fd.append(k, v ?? "");
    });
    fd.append("resume", selectedFile);

    try {
      const res = await submitJobApplication(fd);
      if (res.ok) {
        setSubmitted(true);
        toast({
          title: "Application Submitted!",
          description: `You have successfully applied for the ${jobTitle} position.`,
        });
      } else {
        toast({
          title: "Submission Failed",
          description: res.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="py-12 px-6 text-center border border-[#0dcaf0]/20 rounded-lg bg-white/[0.02]">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#0dcaf0] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
        <p className="mx-auto mt-2 max-w-md text-white/70">
          Thanks for applying for the <strong>{jobTitle}</strong> position. Our recruiting team will review your application and resume shortly. We will reach out to you via email if your profile matches the role.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 lg:p-8">
      <h3 className="text-xl font-bold text-white mb-2">Apply for this Position</h3>
      <p className="text-sm text-white/60 mb-6">
        Submit your details and CV/Resume to start your application process.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Hidden JobId */}
          <input type="hidden" {...form.register("jobId")} value={jobId} />

          {/* Name Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          {/* Links Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>LinkedIn Profile URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/username" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Portfolio or Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://myportfolio.com" className={fieldCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          {/* Resume Upload Drag & Drop Area */}
          <div className="space-y-2">
            <FormLabel className={labelCls}>Attach Resume (PDF Only, Max 5MB) *</FormLabel>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onTriggerFileSelect}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
                dragActive
                  ? "border-[#0dcaf0] bg-[#0dcaf0]/5"
                  : selectedFile
                  ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                  : "border-white/10 hover:border-white/20 bg-[#121212]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              <Upload
                className={`h-8 w-8 mb-2 transition-colors ${
                  selectedFile ? "text-emerald-500" : "text-white/40"
                }`}
              />
              {selectedFile ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-emerald-400 truncate max-w-[280px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-white/80">
                    Click to upload or drag & drop file
                  </p>
                  <p className="text-xs text-white/40 mt-1">PDF format only</p>
                </div>
              )}
            </div>
            {resumeError && (
              <p className="text-sm font-medium text-red-400 flex items-center gap-1.5 mt-1">
                <AlertCircle size={14} />
                {resumeError}
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <FormField
            control={form.control}
            name="cover_letter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Cover Letter</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a brief cover letter or introduce yourself..."
                    className={textareaCls}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Message / Additional Information */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Additional Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any other details you'd like to share..."
                    className={textareaCls}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 rounded-full bg-[#0dcaf0] text-black hover:bg-[#0dcaf0]/90 font-bold transition-all text-base border-none hover:shadow-[0_0_15px_rgba(13,202,240,0.4)]"
            >
              {form.formState.isSubmitting ? "Submitting Application..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
