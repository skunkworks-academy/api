import { randomUUID } from "node:crypto";
import type {
  ApplicationRecord,
  ClassInput,
  ClassRegistrationRecord,
  ClassSession,
  CourseRecord,
  JobInput,
  JobPosting,
  NewApplication,
  OnboardingTask,
  PortalProfile,
  PortalProfileInput
} from "./types.js";

const courses: CourseRecord[] = [
  {
    id: "ai-tools",
    title: "Applied AI Tools",
    level: "Short course",
    duration: "4 weeks",
    description: "Prompt workflows, responsible use, automation, and workplace AI productivity.",
    status: "Live"
  },
  {
    id: "cybersecurity",
    title: "Security Analyst Academy",
    level: "Professional track",
    duration: "12 weeks",
    description: "Security fundamentals, labs, incident response, and analyst capstone work.",
    status: "Live"
  },
  {
    id: "cloud",
    title: "Cloud Practitioner Track",
    level: "Foundation",
    duration: "8 weeks",
    description: "Cloud fundamentals, deployment practice, troubleshooting, and exam readiness.",
    status: "Live"
  }
];

const classes: ClassSession[] = [
  {
    id: "cls-ai-june",
    courseId: "ai-tools",
    courseTitle: "Applied AI Tools",
    title: "AI Tools June Cohort",
    schedule: "Tue and Thu, 18:00",
    modality: "Hybrid",
    instructor: "Pending assignment",
    seats: 24,
    enrolled: 0,
    status: "Open"
  },
  {
    id: "cls-sec-july",
    courseId: "cybersecurity",
    courseTitle: "Security Analyst Academy",
    title: "Security Analyst July Cohort",
    schedule: "Mon and Wed, 17:30",
    modality: "Hybrid",
    instructor: "Pending assignment",
    seats: 18,
    enrolled: 0,
    status: "Open"
  },
  {
    id: "cls-cloud-june",
    courseId: "cloud",
    courseTitle: "Cloud Practitioner Track",
    title: "Cloud Practitioner June Cohort",
    schedule: "Saturday, 09:00",
    modality: "Hybrid",
    instructor: "Pending assignment",
    seats: 30,
    enrolled: 0,
    status: "Open"
  }
];

const jobs: JobPosting[] = [
  {
    id: "preset-ai-facilitator",
    title: "AI Tools Facilitator",
    programme: "Applied AI Short Course",
    modality: "Remote",
    rateBand: "To be confirmed",
    closingDate: "",
    status: "Live",
    description: "Guide learners through practical AI tools, prompt workflows, responsible use, and workplace automation.",
    applicants: 0
  },
  {
    id: "preset-cybersecurity-instructor",
    title: "Cybersecurity Instructor",
    programme: "Security Analyst Academy",
    modality: "Hybrid",
    rateBand: "To be confirmed",
    closingDate: "",
    status: "Live",
    description: "Lead security fundamentals, labs, incident response exercises, and learner capstone assessment.",
    applicants: 0
  },
  {
    id: "preset-cloud-labs-coach",
    title: "Cloud Labs Coach",
    programme: "Cloud Practitioner Track",
    modality: "On campus",
    rateBand: "To be confirmed",
    closingDate: "",
    status: "Live",
    description: "Support learners through cloud fundamentals, hands-on deployments, and practical troubleshooting labs.",
    applicants: 0
  }
];

const profiles = new Map<string, PortalProfile>();
const registrations: ClassRegistrationRecord[] = [];
const applications: ApplicationRecord[] = [];
const tasks: OnboardingTask[] = [
  {
    id: "task-instructor-documents",
    title: "Collect instructor onboarding documents",
    candidateName: "Pending candidate",
    owner: "Training Operations",
    dueDate: "",
    status: "Due",
    detail: "Validate identity, CV, certificates, banking details, and availability before class assignment."
  },
  {
    id: "task-demo-lesson",
    title: "Schedule demo lesson review",
    candidateName: "Pending candidate",
    owner: "Academic Lead",
    dueDate: "",
    status: "Due",
    detail: "Confirm technical depth, pacing, lab readiness, and learner engagement before final approval."
  }
];

function now() {
  return new Date().toISOString();
}

function findClass(classId: string) {
  return classes.find((classItem) => classItem.id === classId);
}

function findJob(jobId: string) {
  return jobs.find((job) => job.id === jobId);
}

export const store = {
  courses: () => courses,
  classes: () => classes,
  jobs: () => jobs,
  registrations: () => registrations,
  applications: () => applications,
  profiles: () => Array.from(profiles.values()),
  tasks: () => tasks,

  registerClass(classId: string, user: { objectId: string; name: string; email: string }) {
    const classItem = findClass(classId);
    if (!classItem) return undefined;

    const existing = registrations.find((item) => item.classId === classId && item.studentObjectId === user.objectId);
    if (existing) return existing;

    const status = classItem.enrolled >= classItem.seats ? "Waitlisted" : "Registered";
    if (status === "Registered") classItem.enrolled += 1;
    if (classItem.enrolled >= classItem.seats) classItem.status = "Full";

    const registration: ClassRegistrationRecord = {
      id: randomUUID(),
      classId: classItem.id,
      classTitle: classItem.title,
      courseId: classItem.courseId,
      courseTitle: classItem.courseTitle,
      studentName: user.name,
      studentEmail: user.email,
      studentObjectId: user.objectId,
      status,
      registeredAt: now()
    };
    registrations.push(registration);
    return registration;
  },

  myClasses(objectId: string) {
    return registrations.filter((registration) => registration.studentObjectId === objectId);
  },

  assignInstructor(classId: string, user: { name: string }) {
    const classItem = findClass(classId);
    if (!classItem) return undefined;
    classItem.instructor = user.name;
    return classItem;
  },

  getProfile(objectId: string) {
    return profiles.get(objectId) ?? null;
  },

  updateProfile(objectId: string, email: string, input: PortalProfileInput) {
    const existing = profiles.get(objectId);
    const profile: PortalProfile = {
      id: existing?.id ?? randomUUID(),
      objectId,
      displayName: input.displayName,
      email,
      portalRole: input.portalRole,
      phone: input.phone,
      location: input.location,
      bio: input.bio,
      cvFileName: input.cvFileName ?? existing?.cvFileName ?? "",
      cvDocumentUrl: existing?.cvDocumentUrl,
      cvWebUrl: existing?.cvWebUrl,
      updatedAt: now()
    };
    profiles.set(objectId, profile);
    return profile;
  },

  createApplication(input: NewApplication) {
    const job = findJob(input.jobId);
    if (!job) return undefined;
    job.applicants += 1;
    const application: ApplicationRecord = {
      id: randomUUID(),
      jobId: job.id,
      jobTitle: job.title,
      applicantName: input.applicantName,
      applicantEmail: input.applicantEmail,
      phone: input.phone,
      discipline: input.discipline,
      availability: input.availability,
      experience: input.experience,
      status: "Submitted",
      owner: "Unassigned",
      submittedAt: now(),
      documentUrl: input.resumeFileName ? `pending-upload://${input.resumeFileName}` : undefined
    };
    applications.push(application);
    return application;
  },

  myApplications(email: string) {
    return applications.filter((application) => application.applicantEmail.toLowerCase() === email.toLowerCase());
  },

  updateApplication(id: string, input: Partial<Pick<ApplicationRecord, "status" | "owner">>) {
    const application = applications.find((item) => item.id === id);
    if (!application) return undefined;
    if (input.status) application.status = input.status;
    if (input.owner !== undefined) application.owner = input.owner;
    return application;
  },

  createJob(input: JobInput) {
    const job: JobPosting = { id: randomUUID(), applicants: 0, ...input };
    jobs.unshift(job);
    return job;
  },

  updateJob(id: string, input: Partial<JobInput>) {
    const job = jobs.find((item) => item.id === id);
    if (!job) return undefined;
    Object.assign(job, input);
    return job;
  },

  createClass(input: ClassInput) {
    const classItem: ClassSession = { id: randomUUID(), enrolled: 0, ...input };
    classes.unshift(classItem);
    return classItem;
  },

  updateClass(id: string, input: Partial<ClassInput>) {
    const classItem = classes.find((item) => item.id === id);
    if (!classItem) return undefined;
    Object.assign(classItem, input);
    return classItem;
  },

  updateTask(id: string, input: Partial<OnboardingTask>) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return undefined;
    Object.assign(task, input);
    return task;
  }
};
