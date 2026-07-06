# Skunkworks Academy API

Backend API for `api.skunkworksacademy.com`, designed to support `portal.skunkworksacademy.com` and the Skunkworks Academy Student, Instructor, and Staff workspaces.

## Current implementation

- Node.js 20 + Express + TypeScript.
- Microsoft Entra ID JWT validation using the Skunkworks Academy tenant.
- CORS allow-list for:
  - `https://portal.skunkworksacademy.com`
  - `https://login.skunkworksacademy.com`
  - `https://verify.skunkworksacademy.com`
  - local development origins.
- Portal-compatible routes for courses, classes, jobs, applications, profiles, registrations, and staff operations.
- Health endpoint at both `/health` and `/api/health`.
- Route aliases support both root-hosted API paths and `/api/*` paths.
- Vercel, Docker, and generic Node runtime support.
- GitHub Actions CI for install, typecheck, build, and test.

## Microsoft Entra configuration

Canonical tenant and API settings:

```text
ENTRA_TENANT_ID=972e8de4-e365-43a3-99ec-c86a0cc249e8
API_CLIENT_ID=8b1e77b3-3017-4c54-8ab3-0e4864511b55
API_AUDIENCE=api://8b1e77b3-3017-4c54-8ab3-0e4864511b55
```

The portal should request:

```text
api://8b1e77b3-3017-4c54-8ab3-0e4864511b55/access_as_user
```

Supported app roles:

- `Portal.Student`
- `Portal.Instructor`
- `Portal.Staff`
- `Portal.Admin`

Staff/admin routes require `Portal.Staff` or `Portal.Admin`.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Health check:

```bash
curl http://localhost:8080/api/health
```

For local protected-route development only, set:

```text
DISABLE_AUTH=true
NODE_ENV=development
```

Never disable auth in production.

## Build and test

```bash
npm run typecheck
npm run build
npm test
```

## Production environment variables

```text
NODE_ENV=production
PORT=8080
API_BASE_URL=https://api.skunkworksacademy.com
ALLOWED_ORIGINS=https://portal.skunkworksacademy.com,https://login.skunkworksacademy.com,https://verify.skunkworksacademy.com
ENTRA_TENANT_ID=972e8de4-e365-43a3-99ec-c86a0cc249e8
API_CLIENT_ID=8b1e77b3-3017-4c54-8ab3-0e4864511b55
API_AUDIENCE=api://8b1e77b3-3017-4c54-8ab3-0e4864511b55
DISABLE_AUTH=false
```

## Public routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | API health/config metadata |
| GET | `/api/jobs` | Live instructor jobs |
| GET | `/api/courses` | Live course catalogue |
| GET | `/api/classes` | Class schedule |

## Protected user routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/classes/:id/register` | Register current user for a class |
| POST | `/api/classes/:id/assign-instructor` | Assign current instructor to a class |
| GET | `/api/me/classes` | Current user's class registrations |
| GET | `/api/me/profile` | Current user's portal profile |
| PATCH | `/api/me/profile` | Update current user's portal profile |
| POST | `/api/applications` | Submit instructor application |
| GET | `/api/me/applications` | Current user's instructor applications |
| GET | `/api/me/access` | Current user's resolved access profile |

## Staff/admin routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/profiles` | List portal profiles |
| GET | `/api/admin/class-registrations` | List class registrations |
| GET | `/api/admin/jobs` | List all jobs |
| POST | `/api/admin/jobs` | Create job |
| PATCH | `/api/admin/jobs/:id` | Update job |
| POST | `/api/admin/classes` | Create class |
| PATCH | `/api/admin/classes/:id` | Update class |
| GET | `/api/admin/applications` | List instructor applications |
| PATCH | `/api/admin/applications/:id` | Update application status/owner |
| GET | `/api/admin/tasks` | List onboarding tasks |
| PATCH | `/api/admin/tasks/:id` | Update onboarding task |

## Deployment options

### Vercel

The repo includes `vercel.json` and `api/index.ts`. Link the repository to Vercel, set the production environment variables, and assign the custom domain:

```text
api.skunkworksacademy.com
```

### Azure App Service / Container Apps

Use the included `Dockerfile` or deploy the Node runtime directly:

```bash
npm install
npm run build
npm start
```

## Persistence note

The first implementation uses an in-memory store to unblock the portal API surface and interaction flow. Replace `src/store.ts` with durable persistence before production use, for example Azure Table Storage, Cosmos DB, PostgreSQL, or SharePoint Lists depending on the operating model.
