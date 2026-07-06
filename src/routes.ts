import { Router } from "express";
import { config, missingSettings } from "./config.js";
import { authenticate, requireScope, requireStaff, userRole } from "./auth.js";
import { store } from "./store.js";
import {
  applicationInputSchema,
  applicationPatchSchema,
  classInputSchema,
  jobInputSchema,
  profileInputSchema,
  taskPatchSchema
} from "./schemas.js";

export const routes = Router();

const routeList = [
  "GET /api/health",
  "GET /api/jobs",
  "GET /api/courses",
  "GET /api/classes",
  "POST /api/classes/:id/register",
  "POST /api/classes/:id/assign-instructor",
  "GET /api/me/classes",
  "GET /api/me/profile",
  "PATCH /api/me/profile",
  "POST /api/applications",
  "GET /api/me/applications",
  "GET /api/admin/profiles",
  "GET /api/admin/class-registrations",
  "GET /api/admin/jobs",
  "POST /api/admin/jobs",
  "PATCH /api/admin/jobs/:id",
  "POST /api/admin/classes",
  "PATCH /api/admin/classes/:id",
  "GET /api/admin/applications",
  "PATCH /api/admin/applications/:id",
  "GET /api/admin/tasks",
  "PATCH /api/admin/tasks/:id"
];

routes.get(["/", "/api"], (_req, res) => {
  res.json({
    ok: true,
    service: config.serviceName,
    baseUrl: config.apiBaseUrl,
    routes: routeList
  });
});

routes.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    ok: missingSettings().length === 0,
    service: config.serviceName,
    missingSettings: missingSettings(),
    allowedOrigins: config.allowedOrigins,
    routes: routeList
  });
});

routes.get(["/jobs", "/api/jobs"], (_req, res) => {
  res.json(store.jobs().filter((job) => job.status === "Live"));
});

routes.get(["/courses", "/api/courses"], (_req, res) => {
  res.json(store.courses().filter((course) => course.status === "Live"));
});

routes.get(["/classes", "/api/classes"], (_req, res) => {
  res.json(store.classes());
});

routes.post(["/classes/:id/register", "/api/classes/:id/register"], authenticate, requireScope(), (req, res) => {
  const registration = store.registerClass(req.params.id, req.user!);
  if (!registration) return res.status(404).json({ error: "class_not_found" });
  return res.status(201).json(registration);
});

routes.post(["/classes/:id/assign-instructor", "/api/classes/:id/assign-instructor"], authenticate, requireScope(), (req, res) => {
  const classItem = store.assignInstructor(req.params.id, req.user!);
  if (!classItem) return res.status(404).json({ error: "class_not_found" });
  return res.json(classItem);
});

routes.get(["/me/classes", "/api/me/classes"], authenticate, requireScope(), (req, res) => {
  res.json(store.myClasses(req.user!.objectId));
});

routes.get(["/me/profile", "/api/me/profile"], authenticate, requireScope(), (req, res) => {
  res.json(store.getProfile(req.user!.objectId));
});

routes.patch(["/me/profile", "/api/me/profile"], authenticate, requireScope(), (req, res) => {
  const input = profileInputSchema.parse(req.body);
  res.json(store.updateProfile(req.user!.objectId, req.user!.email, input));
});

routes.post(["/applications", "/api/applications"], authenticate, requireScope(), (req, res) => {
  const input = applicationInputSchema.parse(req.body);
  const application = store.createApplication(input);
  if (!application) return res.status(404).json({ error: "job_not_found" });
  return res.status(201).json(application);
});

routes.get(["/me/applications", "/api/me/applications"], authenticate, requireScope(), (req, res) => {
  res.json(store.myApplications(req.user!.email));
});

routes.get(["/admin/profiles", "/api/admin/profiles"], authenticate, requireStaff, (req, res) => {
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const profiles = role ? store.profiles().filter((profile) => profile.portalRole === role) : store.profiles();
  res.json(profiles);
});

routes.get(["/admin/class-registrations", "/api/admin/class-registrations"], authenticate, requireStaff, (_req, res) => {
  res.json(store.registrations());
});

routes.get(["/admin/jobs", "/api/admin/jobs"], authenticate, requireStaff, (_req, res) => {
  res.json(store.jobs());
});

routes.post(["/admin/jobs", "/api/admin/jobs"], authenticate, requireStaff, (req, res) => {
  const input = jobInputSchema.parse(req.body);
  res.status(201).json(store.createJob(input));
});

routes.patch(["/admin/jobs/:id", "/api/admin/jobs/:id"], authenticate, requireStaff, (req, res) => {
  const input = jobInputSchema.partial().parse(req.body);
  const job = store.updateJob(req.params.id, input);
  if (!job) return res.status(404).json({ error: "job_not_found" });
  return res.json(job);
});

routes.post(["/admin/classes", "/api/admin/classes"], authenticate, requireStaff, (req, res) => {
  const input = classInputSchema.parse(req.body);
  res.status(201).json(store.createClass(input));
});

routes.patch(["/admin/classes/:id", "/api/admin/classes/:id"], authenticate, requireStaff, (req, res) => {
  const input = classInputSchema.partial().parse(req.body);
  const classItem = store.updateClass(req.params.id, input);
  if (!classItem) return res.status(404).json({ error: "class_not_found" });
  return res.json(classItem);
});

routes.get(["/admin/applications", "/api/admin/applications"], authenticate, requireStaff, (_req, res) => {
  res.json(store.applications());
});

routes.patch(["/admin/applications/:id", "/api/admin/applications/:id"], authenticate, requireStaff, (req, res) => {
  const input = applicationPatchSchema.parse(req.body);
  const application = store.updateApplication(req.params.id, input);
  if (!application) return res.status(404).json({ error: "application_not_found" });
  return res.json(application);
});

routes.get(["/admin/tasks", "/api/admin/tasks"], authenticate, requireStaff, (_req, res) => {
  res.json(store.tasks());
});

routes.patch(["/admin/tasks/:id", "/api/admin/tasks/:id"], authenticate, requireStaff, (req, res) => {
  const input = taskPatchSchema.parse(req.body);
  const task = store.updateTask(req.params.id, input);
  if (!task) return res.status(404).json({ error: "task_not_found" });
  return res.json(task);
});

routes.get(["/me/access", "/api/me/access"], authenticate, requireScope(), (req, res) => {
  res.json({ user: req.user, portalRole: userRole(req) });
});
