import { z } from "zod";

export const portalRoleSchema = z.enum(["Student", "Instructor", "Staff"]);
export const classStatusSchema = z.enum(["Scheduled", "Open", "Full", "InProgress", "Complete", "Cancelled"]);
export const jobStatusSchema = z.enum(["Draft", "Live", "Closed"]);
export const applicationStatusSchema = z.enum(["Submitted", "Screening", "Interview", "Offer", "Rejected"]);
export const taskStatusSchema = z.enum(["Due", "InProgress", "Ready", "Complete"]);

export const profileInputSchema = z.object({
  displayName: z.string().trim().min(1).max(160),
  portalRole: portalRoleSchema,
  phone: z.string().trim().max(80).default(""),
  location: z.string().trim().max(160).default(""),
  bio: z.string().trim().max(2000).default(""),
  cvFileName: z.string().trim().max(255).optional(),
  cvBase64: z.string().optional()
});

export const applicationInputSchema = z.object({
  jobId: z.string().trim().min(1),
  applicantName: z.string().trim().min(1).max(160),
  applicantEmail: z.string().trim().email(),
  phone: z.string().trim().max(80).default(""),
  discipline: z.string().trim().max(160).default(""),
  availability: z.string().trim().max(320).default(""),
  experience: z.string().trim().min(1).max(5000),
  resumeFileName: z.string().trim().max(255).optional(),
  resumeBase64: z.string().optional()
});

export const jobInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  programme: z.string().trim().max(180).default(""),
  modality: z.string().trim().max(80).default("Hybrid"),
  rateBand: z.string().trim().max(120).default(""),
  closingDate: z.string().trim().max(40).default(""),
  status: jobStatusSchema.default("Draft"),
  description: z.string().trim().max(5000).default("")
});

export const classInputSchema = z.object({
  courseId: z.string().trim().min(1).max(120),
  courseTitle: z.string().trim().min(1).max(180),
  title: z.string().trim().min(1).max(180),
  schedule: z.string().trim().max(180).default(""),
  modality: z.string().trim().max(80).default("Hybrid"),
  instructor: z.string().trim().max(160).default("Pending assignment"),
  seats: z.coerce.number().int().min(1).max(1000).default(20),
  status: classStatusSchema.default("Open")
});

export const applicationPatchSchema = z.object({
  status: applicationStatusSchema.optional(),
  owner: z.string().trim().max(160).optional()
});

export const taskPatchSchema = z.object({
  title: z.string().trim().max(180).optional(),
  candidateName: z.string().trim().max(160).optional(),
  owner: z.string().trim().max(160).optional(),
  dueDate: z.string().trim().max(40).optional(),
  status: taskStatusSchema.optional(),
  detail: z.string().trim().max(2000).optional(),
  assignee: z.string().trim().max(160).optional()
});
