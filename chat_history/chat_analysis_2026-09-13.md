# Architecture & Codebase Analysis: `pg-next` vs `progemini-web`

**Date:** 2026-09-13  
**Target Projects:**
- Main/Original Monolith: `d:\Sikku works\proGemini\web\pg-next`
- Redesigned Split Repo: `d:\Sikku works\proGemini\web\progemini-web`
  - Frontend: `progemini-frontend` (Next.js 14)
  - Backend: `progemini-backend` (Express.js + Prisma + TypeScript)

---

## 1. Quick Answers to Your Immediate Terminal Errors

### A. Why `npx generate prisma` failed in backend
* **Wrong Command Syntax:** The command you ran was `npx generate prisma`. In npm, this tries to execute a third-party package named `generate`.
* **Correct Command:**
  ```bash
  npx prisma generate
  # OR using package.json script:
  npm run db:generate
  ```

### B. Why `npm start` failed in backend (`Cannot find module .../dist/server.js`)
* **Missing Build Output:** The backend is written in TypeScript (`src/server.ts`). `npm start` runs `node dist/server.js`, which only exists *after* building with `npm run build`.
* **For Local Development:** Run:
  ```bash
  npm run dev
  ```
  (This runs `ts-node-dev` and watches for TypeScript changes without requiring manual builds).

---

## 2. High-Level Architectural Structure

| Aspect | Original Monolith (`pg-next`) | Redesigned Repo (`progemini-web`) |
| :--- | :--- | :--- |
| **Architecture** | Fullstack Next.js (App Router) | Decoupled Client-Server (Next.js + Express) |
| **Backend** | Internal API Routes (`/src/app/api/...`) | Standalone Express Server (`progemini-backend`) |
| **Database** | Prisma directly in Next.js server actions / API | Prisma in Express backend only |
| **Port Mapping** | Next.js on `3000` (Docker `3010`) | Frontend on `3000`, Backend on `5000` |
| **Env Files** | Single root `.env` | Separated `.env` in frontend and backend |

---

## 3. Critical Flaws & What Your Intern Did Wrong

### 1. Fatal Authentication Breakdown (Showstopper)
* **JWE vs. JWT Mismatch:** Backend middleware ([authenticate.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/middlewares/authenticate.ts#L18-L31)) attempts to decode NextAuth session cookies (`next-auth.session-token`) using `jwt.verify()`. NextAuth encrypts its cookies via JWE (AES-GCM / HKDF), which `jsonwebtoken` cannot verify. It throws a token error on every request.
* **Frontend `apiClient` Sends No Bearer Token:** In [apiClient.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/lib/apiClient.ts#L18-L21), client-side requests only specify `credentials: "include"`. They **do not attach** `Authorization: Bearer <accessToken>`. Because the Express backend does not set its own auth cookie upon login, all client-side authenticated requests are rejected with `401 Unauthorized`.
* **Missing `JWT_SECRET` in Backend `.env`:** The backend [.env](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/.env) file has `NEXTAUTH_SECRET` but lacks `JWT_SECRET`. It silently defaults to the fallback `"change-me-in-production"` in `config/index.ts`.

### 2. Chaotic API Routing & Broken URL Paths (Constant 404s)
The backend mounts all controllers under `/api/v1/...` (via `app.use("/api", routes)` and `router.use("/v1", ...)`). However, the frontend has multiple contradictory calling conventions:
1. **Missing `/v1` Prefix:** Calls such as `apiClient.get('/admin/courses/...')`, `apiClient.get('/users?role=STUDENT')`, and `apiClient.patch('/enquiries/${id}')` omit `/v1`, resulting in calls to `/api/admin/...` instead of `/api/v1/admin/...` (**404 Not Found**).
2. **Stray Monolith Calls:** Components like `CourseSidebar.tsx` still execute `fetch('/api/courses')`, hitting the Next.js frontend directly where API routes were deleted (**404 Not Found**).
3. **Double Prefixing:** In `StudentCourseVideos.tsx`, the code sets `url = '/api/courses/...'` and passes it to `apiClient.get(url)`, producing `/api/api/courses/...` (**404 Not Found**).
4. **Incomplete Proxy Rewrite:** [next.config.js](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/next.config.js#L43-L50) only rewrites `/api/files/:path*` to the backend, leaving all other `/api/*` requests unhandled by Next.js.

### 3. Missing Feature: Email Marketing System Deleted
In `pg-next`, there was a complete Email Marketing system (`EmailCampaign`, `EmailLog`, `EmailContactList`, and `/src/app/admin/email-marketing`). The intern **completely omitted** these models from `progemini-backend/prisma/schema.prisma` and removed the admin UI pages from `progemini-frontend`.

### 4. Docker & Production Nginx Are Out of Sync
* **Backend Omitted from Docker:** [docker-compose.yml](file:///d:/Sikku%20works/proGemini/web/progemini-web/docker-compose.yml) only defines `progemini-app-prod` (frontend). `progemini-backend` has **no Dockerfile** and is completely absent from docker-compose.
* **Nginx Still Pointing to Monolith:** [nginx.conf](file:///d:/Sikku%20works/proGemini/web/progemini-web/nginx.conf#L8-L10) proxies all `/api/*` traffic to port `3010` (the frontend container). The Express backend on port `5000` is never proxied.

### 5. Bloated Frontend Dependencies
`progemini-frontend/package.json` still installs server-side heavy libraries (`minio`, `multer`, `nodemailer`, `pg`, `resend`, `stripe`). These belong exclusively to `progemini-backend`.

---

## 4. Where and How to Set the Environment Variables

Because the project is split into two independent runtimes, you **cannot** use a single root `.env`. You must maintain two `.env` files:

### Location 1: `progemini-backend/.env`
Place this in `d:\Sikku works\proGemini\web\progemini-web\progemini-backend\.env`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL="postgresql://progemini_sikku:Progemini2026sikku@185.239.208.206:5434/pro_gemini_prod?schema=public"

# Auth Secrets (CRITICAL: set JWT_SECRET for Express token generation)
JWT_SECRET="fF77er23GzXZy73zBDR+pqwiUJdgFOoT+CJG/c11nbo="
NEXTAUTH_SECRET="fF77er23GzXZy73zBDR+pqwiUJdgFOoT+CJG/c11nbo="

# MinIO Storage
MINIO_ENDPOINT="185.239.208.206"
MINIO_PORT=9000
MINIO_ACCESS_KEY="pg-minio"
MINIO_SECRET_KEY="Progemini321sikku"
MINIO_BUCKET_NAME="progemini-main-website-files"
MINIO_USE_SSL=false
MINIO_CONSOLE_URL="http://185.239.208.206:9001"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Resend / Email
RESEND_API_KEY="re_your_resend_api_key_placeholder"
SMTP_FROM="Progemini Academy <noreply@progemini.academy>"

# Misc
CLEANUP_API_KEY="cleanup_key_2024_secure_random_string"
```

### Location 2: `progemini-frontend/.env.local`
Create this file in `d:\Sikku works\proGemini\web\progemini-web\progemini-frontend\.env.local` (it was missing):

```env
# Backend API Base URL
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api"

# NextAuth configuration for Frontend
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fF77er23GzXZy73zBDR+pqwiUJdgFOoT+CJG/c11nbo="

# Public App Info
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ProGemini Academy"

# Public Stripe Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"
```

---

## 5. Required Action Items to Fix the Redesign

1. **Fix `apiClient.ts`:** Update it to retrieve the session token (via `getSession()`) and set `Authorization: Bearer <token>` on all requests.
2. **Standardize API URLs:** Ensure all frontend requests use the `/v1/` prefix (e.g., `/v1/admin/courses`, `/v1/enquiries`).
3. **Backend Auth Middleware:** Add `JWT_SECRET` to backend `.env`. In `authenticate.ts`, rely on the `Bearer` token passed from the frontend.
4. **DevOps & Production:**
   - Create a `Dockerfile` inside `progemini-backend`.
   - Update `docker-compose.yml` to include `progemini-backend` exposed on port 5000.
   - Update `nginx.conf` so `/api/` passes to the Express backend upstream (`127.0.0.1:5000`), while frontend pages pass to Next.js (`127.0.0.1:3010`).

---

## Update: Created `EXPLANATION_FOR_INTERN.html`

Created a rich, styled, interactive HTML document at:
`d:\Sikku works\proGemini\web\progemini-web\EXPLANATION_FOR_INTERN.html`

It includes:
- Friendly guidance and mental model comparisons.
- Easy-to-understand breakdown of terminal errors (`npx prisma generate`, `npm run dev`).
- Code fixes for `apiClient.ts` with copy buttons.
- Complete ready-to-copy `.env` and `.env.local` snippets.
- An interactive checkbox action list with localStorage persistence for tracking fixes.

---

## Update: Created Comprehensive Implementation Plan for Decoupling `pg-next`

**Artifact Path:** `implementation_plan.md`
**Scope:** Full-fidelity architectural decoupling of `pg-next` into:
- **Frontend:** Next.js 14 App Router UI, client `apiClient` with `Bearer` token attachment, server `serverFetch` for SSR, Next.js rewrite proxy.
- **Backend:** Express.js + TypeScript + Prisma with all 752 lines of schema (including Email Marketing, MinIO, Stripe, attendance, admissions).
- **Environment Variables:** Secure separation protecting live production credentials in backend `.env` only.
- **DevOps:** Backend Dockerfile, unified `docker-compose.yml`, and updated `nginx.conf` reverse proxy.

---

## Update: Execution & Verification Completed

**Artifact Path:** `walkthrough.md`
**Results:**
- Restored 752-line Prisma schema in backend (`npm run db:generate` passed).
- Restored complete Email Marketing subsystem (`emailMarketing.service.ts`, `emailSender.service.ts`, `email.controller.ts`, `email.routes.ts`, and frontend admin UI).
- Fixed `apiClient.ts` with `Bearer` token attachment and endpoint normalization.
- Configured Next.js catch-all rewrite proxy in `next.config.js`.
- Backend typecheck and build passed (`tsc --noEmit` and `npm run build` both code 0).
- Frontend typecheck passed (`tsc --noEmit` code 0).
- Created backend `Dockerfile`, updated `docker-compose.yml`, and updated `nginx.conf`.

---

## Update: Resolved `Cannot find module 'uuid'` Runtime Error

**Time:** 2026-09-13T22:38:00+06:00  
**Issue:**
Backend crash during `npm run dev` in `progemini-backend`:
```
Error: Cannot find module 'uuid'
Require stack:
- D:\Sikku works\proGemini\web\progemini-web\progemini-backend\src\utils\minio.ts
- D:\Sikku works\proGemini\web\progemini-web\progemini-backend\src\services\file.service.ts
...
```

**Root Cause:**
1. `progemini-backend/package.json` had `@types/uuid` in `devDependencies`, but `uuid` was missing from `dependencies`.
2. Furthermore, modern `uuid` (v11+) is pure ESM, which causes `ERR_REQUIRE_ESM` under Node's CommonJS runtime used by `ts-node-dev`.

**Resolution Applied:**
1. Updated [minio.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/utils/minio.ts) to use Node.js's built-in, native `randomUUID` from `"crypto"` (`import { randomUUID } from "crypto"`). This produces standard RFC 4122 v4 UUIDs without depending on any external package or risking ESM/CJS conflicts.
2. Installed CommonJS-compatible `uuid@^9.0.1` in [package.json](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/package.json) so any other tools or scripts expecting `uuid` will resolve smoothly.
3. Verified TypeScript compilation (`npm run lint` / `tsc --noEmit`) and confirmed `src/utils/minio` executes successfully without errors.

---

## Update: Created Dedicated Development Database `pro_gemini_dev` Cloned From Production

**Time:** 2026-09-13T23:00:00+06:00  
**User Requirement:**
- Create an independent development database on PostgreSQL server `185.239.208.206:5434`.
- Clone full structure and records from production (`pro_gemini_prod`).
- **Strict Constraint:** Zero `INSERT`, `UPDATE`, or `DELETE` operations on production database.

**Actions Executed:**
1. **Server Inspection & Role Permissions:**
   - Discovered existing PostgreSQL databases: `hand4helpdb`, `pg-prod-db`, `postgres`, `pro_gemini_prod`, `progemini-vle`, `tasky_db`.
   - Used superuser `sikku-pg` to grant `CREATEDB` and full database privileges to user `progemini_sikku`.
   - Created new database `pro_gemini_dev` owned by `progemini_sikku`.
2. **Read-Only Dump (Safe from Prod Writes):**
   - Executed `pg_dump` with `--no-owner --no-acl` via read-only transactions on `pro_gemini_prod`. Not a single write or modification was performed on production.
3. **Full Schema & Data Restore into Dev:**
   - Restored dump file into `pro_gemini_dev` via `psql`.
   - Restored all 28 tables, custom enums, sequences, constraints, and 21,000+ records.
4. **Verification & Parity Check:**
   - Ran automated validation comparing table row counts between `pro_gemini_prod` and `pro_gemini_dev`: 28 out of 28 tables matched 100%.
   - Production database remained untouched with zero mutations.
5. **Configuration Updated:**
   - Updated `progemini-backend/.env`:
     ```env
     # Database (Development database cloned from production)
     DATABASE_URL="postgresql://progemini_sikku:Progemini2026sikku@185.239.208.206:5434/pro_gemini_dev?schema=public"
     # Production Database Reference:
     # DATABASE_URL="postgresql://progemini_sikku:Progemini2026sikku@185.239.208.206:5434/pro_gemini_prod?schema=public"
     ```
   - Verified `@prisma/client` connects and queries `pro_gemini_dev` without issue.

---

## Update: Fixed Partner University Images, Enquiries API, and Email Marketing Hub

**Time:** 2026-09-13T23:23:00+06:00  
**Issues Reported:**
1. University partner images were broken / not visible.
2. Enquiries data was not being fetched from the backend.
3. Marketing data was not being fetched from the backend.

**Root Causes & Solutions Applied:**

### 1. Partner University Images Fix
* **Root Cause 1 (Backend 500 Error):** In [file.controller.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/controllers/file.controller.ts), `downloadFileBySlug` accessed `req.params.slug.map(...)`. In Express 4, route wildcards (`/files/download/*`) store the wildcard in `req.params[0]`, leaving `req.params.slug` undefined. This threw `TypeError: Cannot read properties of undefined (reading 'map')` and returned `500 Internal Server Error` on every image request.
  * **Fix:** Robust slug extraction parsing `req.params[0]`, route params, or URL path with URI decoding.
* **Root Cause 2 (Frontend Double `/api`):** In [utils.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/lib/utils.ts), `getFileUrl` prepended `NEXT_PUBLIC_API_BASE_URL` (`http://localhost:5000/api`) to stored URLs (`/api/files/download/...`), generating duplicate `/api/api/files/...`.
  * **Fix:** Cleaned base URL handling in `getFileUrl` to strip trailing `/api` before appending relative paths.
* **Root Cause 3 (Next.js Image Optimization):** In [next.config.js](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/next.config.js), `remotePatterns` lacked explicit port `5000` for `localhost` and `127.0.0.1`.
  * **Fix:** Added `port: '5000'` and `port: '3000'` for `localhost` and `127.0.0.1` in `remotePatterns`.

### 2. Enquiries Fetching Fix
* **Root Cause:** In [application.routes.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/routes/application.routes.ts), enquiry management routes were only mounted at `/admin/enquiries`. The frontend client component [EnquiriesClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/admin/enquiries/EnquiriesClient.tsx) requested `/enquiries?page=...`, `/enquiries/:id`, etc., resulting in `404 Not Found`.
* **Fix:** Mounted `GET`, `PATCH`, and `DELETE` routes on both `/enquiries` and `/admin/enquiries` with admin authorization.

### 3. Email Marketing Fetching Fix
* **Root Cause:** In the frontend email marketing admin pages (`page.tsx`, `contacts/page.tsx`, `campaigns/page.tsx`, `campaigns/new/page.tsx`), requests were made via raw browser `fetch()` without `Authorization: Bearer <token>` headers. The backend Express routes required admin authentication (`authenticate, authorize("ADMIN")`), rejecting every request with `401 Unauthorized`.
* **Fix:** Converted all email marketing requests across the hub to use [apiClient](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/lib/apiClient.ts), which automatically retrieves the NextAuth session `accessToken` and attaches `Authorization: Bearer <token>`.
* **Backend Addition:** Added `PATCH /campaigns` handler to [email.controller.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/controllers/email.controller.ts) and [email.routes.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/routes/email.routes.ts) to support campaign cancellation, pause, and resume.

### 4. Verification Results
- Direct backend image download: **200 OK (image/png)**
- Proxied frontend image download: **200 OK (image/png)**
- Next.js Image Optimization (`/_next/image`): **200 OK (image/png)**
- Enquiries API: **200 OK (returned 2 enquiries)**
- Email Marketing Analytics: **200 OK (returned 24 campaigns, 21,107 sent emails, analytics data)**
- TypeScript typechecks passed on both backend (`npm run lint`) and frontend (`npx tsc --noEmit`).

---

## Update: Resolved Student Profile `TypeError: Cannot read properties of undefined (reading 'length')`

**Time:** 2026-09-14T00:04:00+06:00  
**Issue:**
Navigating to `http://localhost:3000/student/profile` triggered an Unhandled Runtime Error:
```
TypeError: Cannot read properties of undefined (reading 'length')
at StudentProfileClient (StudentProfileClient.tsx:646:62)
```

**Root Cause:**
1. **Frontend Assumption:**
   In [StudentProfileClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentProfileClient.tsx), the component assumed `user.enrollments` was always an array and attempted to read `user.enrollments.length` and iterate over `user.enrollments.map(...)`.
2. **Backend Payload Incompleteness:**
   The page [page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/student/profile/page.tsx) fetches profile data via `serverFetch<any>(`/v1/users/${user.id}`)`. In the backend [user.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/user.service.ts), `getUserById` selected only flat user columns and did **not** include the `enrollments` relation or `_count` metrics. As a result, `user.enrollments` was `undefined`, crashing the page on load.

**Resolution Applied:**
1. **Backend Enhancement ([user.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/user.service.ts)):**
   - Updated `getUserById` and `getProfile` to include the `enrollments` relation:
     ```typescript
     include: {
       enrollments: {
         include: {
           course: {
             select: {
               id: true,
               title: true,
               thumbnail: true,
             },
           },
         },
         orderBy: { enrolledAt: "desc" },
       },
       _count: {
         select: {
           enrollments: true,
           reviews: true,
         },
       },
     }
     ```
2. **Frontend Defensive Fallback ([StudentProfileClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentProfileClient.tsx)):**
   - Added safe array fallback: `const enrollments = user?.enrollments || [];`
   - Replaced fragile direct property accesses with safe navigation:
     - `enrollments.length`
     - `user?._count?.enrollments ?? enrollments.length`
     - `user?._count?.reviews ?? 0`
     - `enrollment.course?.thumbnail` and `enrollment.course?.title`
3. **Verification:**
   - Backend `npm run lint` (`tsc --noEmit`): 0 errors.
   - Frontend `npx tsc --noEmit`: 0 errors.
   - Student profile page renders cleanly with active enrollments and zero crash if data is empty or loading.

---

## Update: Student Information Analysis & Implementation Plan for Student Profile CRUD

**Time:** 2026-09-14T00:39:00+06:00  
**User Request:**
1. Analyze what student information is currently collected and determine what is needed.
2. Create an implementation plan for the Student Profile CRUD feature with:
   - New students welcomed with a notification banner to complete their profile.
   - Comprehensive profile schema (Student ID, Program, Department, Core, Major, Second Major, Minor, Elective, Father Name, Mother Name, Present Address, Permanent Address, Verified Contact, Verified Email, DOB, Sex, Nationality, Passport, Religion, Marital Status, Blood Group, Admission Date, Graduation Date, Student Image).
   - Standard photo upload via MinIO for digital ID card usage.
   - Required fields: Name, Phone, Email, Passport, Nationality, Present Address.
   - Removal of the "Browse Courses" tab/button from the student profile.

**Key Findings:**
- Currently, student registration collects only `name`, `email`, and `password`.
- Course applications collect demographic and previous academic history, but store it in the transient `applications` table, not on the student's profile.
- The `users` table only has `name`, `email`, `phone`, `bio`, `avatar`, and `address`, missing all institutional and family fields.
- Created `implementation_plan.md` detailing the new `StudentProfile` Prisma model, backend CRUD and MinIO photo integration, completion status logic, and frontend digital ID profile interface.

---

## Update: Student Profile CRUD & Digital ID Card Feature Execution

**Time:** 2026-09-14T00:49:00+06:00  
**Actions Executed:**
1. **Database Schema & Dev Migration:**
   - Extended [schema.prisma](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/prisma/schema.prisma) with `StudentProfile` model (26 columns covering institutional, personal, demographic, and family data).
   - Migrated safely to `pro_gemini_dev` (`npx prisma db push`); verified all 26 columns in PostgreSQL.
   - Strict zero-mutation constraint maintained on `pro_gemini_prod`.
2. **Backend API Endpoints:**
   - Created [studentProfile.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/studentProfile.service.ts) with auto-initialization from course applications, profile completion check (`name`, `phone`, `passport`, `nationality`, `presentAddress`), and standard MinIO portrait upload (`fileType: PROFILE_PICTURE`).
   - Created [studentProfile.controller.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/controllers/studentProfile.controller.ts) & [studentProfile.routes.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/routes/studentProfile.routes.ts).
   - Mounted routes in [routes/index.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/routes/index.ts).
3. **Frontend Experience & Portal UI:**
   - Created [StudentWelcomeBanner.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentWelcomeBanner.tsx) in [student/layout.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/student/layout.tsx) with completion percentage bar and direct profile completion button.
   - Redesigned [StudentProfileClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentProfileClient.tsx):
     - **Removed "Browse Courses" tab completely**.
     - Created **Digital Student ID Card** with avatar overlay, Student ID (`20-43143-1`), Program, Blood Group (`Bpos`), status badge, and barcode.
     - Implemented direct MinIO photo upload with 5MB/standard ratio checks.
     - Built modal for student profile updates with required validation.
4. **Verification:**
   - Backend `npm run lint` (`tsc --noEmit`): 0 errors.
   - Frontend `npx tsc --noEmit`: 0 errors.
   - Both backend (port 5000) and frontend (port 3000) verified healthy and operational.

---

## Update: Automatic Student Profile Synchronization with Course Applications

**Time:** 2026-09-14T00:51:00+06:00  
**User Request:**
When a student starts a course application, automatically sync the common personal and demographic data from their student profile into the application form.

**Actions Executed:**
1. **Frontend Server Fetch ([apply/page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/student/apply/page.tsx)):**
   - Pre-fetches the current student's profile via `serverFetch('/v1/student/profile')` and passes it to `ApplicationForm` as `initialProfile`.
2. **Form State Auto-Population ([ApplicationForm.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/application/ApplicationForm.tsx)):**
   - Automatically populates:
     - `firstName` & `lastName` (parsed from `user.name`)
     - `email` & `phone` (from `user`)
     - `dateOfBirth` (formatted to `YYYY-MM-DD` from `studentProfile.dateOfBirth`)
     - `gender` (from `studentProfile.gender`)
     - `nationality` & `country` (from `studentProfile.nationality`)
     - `address`, `city`, `state`, `zipCode` (parsed from `studentProfile.presentAddress`)
   - Added visual auto-sync badge and informative banner notifying the student that their profile data was pre-filled.
3. **Backend Bidirectional Synchronization ([application.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/application.service.ts)):**
   - In `createApplication`, enriched `studentProfile` with submitted application demographics if the student profile was previously incomplete.
4. **Verification:**
   - Backend `npm run lint` (`tsc --noEmit`): 0 errors.
   - Frontend `npx tsc --noEmit`: 0 errors.

---

## Update: UI Label Clean-up (MinIO Reference Removed)

**Time:** 2026-09-14T00:53:00+06:00  
**User Request:**
Do not mention the name of "MinIO" in the button: "Upload ID Standard Photo (MinIO)".

**Actions Executed:**
- Updated the button label in [StudentProfileClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentProfileClient.tsx) to **"Upload ID Standard Photo"**.
- Updated upload status overlay text to **"Uploading photo..."**.
- Updated toast notification to **"Profile photo uploaded successfully!"**.
- Verified zero remaining references to "MinIO" across user-facing student components.
- Frontend typecheck (`npx tsc --noEmit`): passed with 0 errors.

---

## Update: Removed Default Mock Fallbacks from Student Profile

**Time:** 2026-09-14T00:58:00+06:00  
**User Request:**
Remove default mock information from student profile view. Only show information actually provided by the student, and make the progress bar strictly relative to real student-entered data.

**Actions Executed:**
1. **Removed All Hardcoded Sample Fallbacks:**
   - Digital Student ID card: replaced `20-43143-1` with real ID or `"ID: Pending Assignment"`, `BSc in CSE` with `"Not Enrolled"`, `FACULTY OF SCI & TECH` with `"Not Assigned"`, and `Bpos` with real blood group or `"Not Provided"`.
   - Academic & Institutional card: replaced sample curriculum with `"Pending Assignment"` / `"Not Assigned"` / `"Not Specified"`.
   - Personal & Identity card: removed fake strings (`A12345678`, `01633606911`). Missing required fields now show a clear **`Not Provided (Add)`** badge that directly triggers the edit modal.
   - Family & Address card: removed fake parent names (`MD. JALAL UDDIN`, `SHIULY AKTER`).
2. **True Data-Driven Progress Bar:**
   - Completion percentage strictly measures non-empty student fields (`user.name`, `user.phone`, `user.email`, `sp.passport`, `sp.nationality`, `sp.presentAddress`, `user.avatar`).
3. **Form Clean Initialization:**
   - In `formData` and modal selects, empty fields start truly blank without defaulting to "Male", "Islam", "Single", or "Bpos".
4. **Verification:**
   - Frontend typecheck `npx tsc --noEmit`: passed with 0 errors.

---

## Update: Passport Only Specification (NID Removed)

**Time:** 2026-09-14T01:00:00+06:00  
**User Request:**
Only gather passport from student, not NID.

**Actions Executed:**
1. **Frontend Labels & Modals ([StudentProfileClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentProfileClient.tsx)):**
   - Changed profile card label from `"Passport / NID *"` to **`"Passport *"`**.
   - Changed edit modal label from `"Passport / National ID *"` to **`"Passport Number *"`** with placeholder `"Enter passport number"`.
   - Updated checklist item to **`"Passport"`**.
   - Updated validation toast to `"Passport number is required"`.
2. **Student Welcome Banner ([StudentWelcomeBanner.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentWelcomeBanner.tsx)):**
   - Updated missing required checks label from `"Passport/NID"` to **`"Passport"`**.
---

## Update: Added Emergency Contact Phone & Email to Profile & Database

**Time:** 2026-09-14T01:06:00+06:00  
**User Request:**
Add two fields: Emergency Contact Phone Number and Emergency Contact Email in the "Family & Contact Addresses" section, and persist them in the database.

**Actions Executed:**
1. **Database Schema & Migration (`pro_gemini_dev`):**
   - Added `emergencyContactPhone String? @map("emergency_contact_phone")` and `emergencyContactEmail String? @map("emergency_contact_email")` to `StudentProfile` model in [schema.prisma](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/prisma/schema.prisma).
   - Migrated changes to `pro_gemini_dev` database using `npx prisma db push`.
   - Verified columns `emergency_contact_phone` (text) and `emergency_contact_email` (text) added to `student_profiles` table on PostgreSQL server.
   - Updated Prisma Client types in `node_modules/.prisma/client`.
2. **Backend Validation & Services:**
   - Updated [studentProfile.schema.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/validations/studentProfile.schema.ts) with `emergencyContactPhone` and `emergencyContactEmail` in `updateStudentProfileSchema` and `adminUpdateStudentProfileSchema`.
   - Updated [studentProfile.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/studentProfile.service.ts) to persist and retrieve both fields in `updateStudentProfile` and `adminUpdateStudentProfile`.
3. **Frontend UI ([StudentProfileClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentProfileClient.tsx)):**
   - Updated `StudentProfile` interface to include `emergencyContactPhone?: string | null;` and `emergencyContactEmail?: string | null;`.
   - Added both fields to form state and cancel reset handler.
   - Added two cards to the **"Family & Contact Addresses"** section:
     - **Emergency Contact Phone** (with phone icon and real student value, or `"Not Provided"`).
     - **Emergency Contact Email** (with email icon and real student value, or `"Not Provided"`).
   - Added editable input fields in the "Edit Student Profile" modal under demographic & family information:
     - `Emergency Contact Phone Number` (`type="tel"`, placeholder `"e.g. 01700000000"`)
     - `Emergency Contact Email` (`type="email"`, placeholder `"emergency@example.com"`)
4. **Verification:**
   - Verified database columns exist in PostgreSQL `student_profiles` table.
   - Backend `npm run lint` (`tsc --noEmit`): passed with 0 errors.
   - Frontend `npx tsc --noEmit`: passed with 0 errors.

---

## Update: Admin Dashboard Student Profile View & Edit Modal

**Time:** 2026-09-14T01:08:00+06:00  
**User Request:**
Student info update feature or modal is not created on admin dashboard in student profile view (`/admin/users/[id]`).

**Actions Executed:**
1. **Frontend Component Creation ([AdminUserDetailClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/admin/AdminUserDetailClient.tsx)):**
   - Built a comprehensive, interactive client component for the admin user details view (`/admin/users/[id]`).
   - For students (`user.role === 'STUDENT'`), displays:
     - **Institutional & Academic Records:** Student ID, Academic Program, Department, Core Curriculum, Major, Second Major, Minor, Elective Stream, Admission Date, and Expected Graduation Date.
     - **Personal & Identity Details:** Full Name, Verified Phone, Verified Email, Passport Number, Nationality, Date of Birth, Sex/Gender, Religion, Marital Status, and Blood Group.
     - **Family & Contact Addresses:** Father's Name, Mother's Name, Emergency Contact Phone Number, Emergency Contact Email, Present Address, and Permanent Address.
     - **Verification Status:** Verified Completed vs. Incomplete badge.
     - **Course Enrollments:** Retains interactive enrolled courses cards with progress bars and direct edit links.
   - Built an **"Edit Student Information"** admin modal with full editing capability across all academic, personal, and family records, plus an administrative override to mark the profile as officially verified & completed.
   - Form submission connects directly to `apiClient.patch('/v1/admin/students/${user.id}/profile', payload)` and updates client state in real time upon save.
2. **Page Integration ([page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/users/[id]/page.tsx)):**
   - Updated the server component to render `<AdminUserDetailClient initialUser={user} />`.
3. **Backend Date Parsing Safety ([studentProfile.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/studentProfile.service.ts)):**
   - Added `parseSafeDate` helper to gracefully handle empty string dates from form submissions without PostgreSQL type conversion errors.
4. **Verification:**
   - Backend `npm run lint` (`tsc --noEmit`): passed with 0 errors.
   - Frontend `npx tsc --noEmit`: passed with 0 errors.

---

## Update: Student Card & Information Management Operational Workflow

**Time:** 2026-09-14T01:15:00+06:00  
**User Request:**
Enrich the operational workflow description for Student Card & Student Information Management on the Progemini platform.

**Operational Flow Documented:**
1. **Stage 1 (Student):** Profile Onboarding & Verification Readiness (personal info, identity document, and ID standard photo upload).
2. **Stage 2 (Student):** Course Application Submission (automated bi-directional sync between profile and application form).
3. **Stage 3 (Admission Officer):** Application Review (academic vetting, document validation, approve / reject decision).
4. **Stage 4 (Admission Officer):** Institutional Data Provisioning (assign Student ID, Program, Department, Core/Major/Elective streams, Admission/Graduation dates, official `isCompleted` verification toggle).
5. **Stage 5 (Student):** Digital Student ID Card Unlocking (student profile unlocks official Digital ID card with QR code, verified badge, and institutional credentials).

---

## Update: Student Profile Schema Streamlining & Next of Kin Integration Planning

**Time:** 2026-09-18T16:14:00+06:00  
**User Request:**
- From student profile, update Prisma and database structure of student profile, views on student profile portal, and admin student profile view & edit modal:
  - **Academic & Institutional Records:** Only keep Student ID, Academic Program, Started Semester (Fall, Summer, Spring), and Year. Remove department, core, major, secondMajor, minor, elective, admissionDate, graduationDate.
  - **Personal & Identity Details:** Remove religion, marital status, blood group. Keep full name, contact, email, passport, nationality, DOB, gender.
- Implementation plan created and submitted for review.

---

## Update: Student Profile Schema Streamlining & Next of Kin Integration Executed

**Time:** 2026-09-18T16:26:00+06:00  
**Actions Executed:**
1. **Prisma & PostgreSQL Schema:**
   - Modified `StudentProfile` model in `progemini-backend/prisma/schema.prisma`.
   - Applied schema push to development database `pro_gemini_dev` (`npx prisma db push --accept-data-loss`).
   - Regenerated Prisma Client (`npm run db:generate`).
   - Verified exact column layout in PostgreSQL `student_profiles`:
     `id`, `user_id`, `student_id`, `program`, `started_semester`, `started_year`, `next_of_kin_name`, `next_of_kin_relationship`, `next_of_kin_phone`, `next_of_kin_email`, `address`, `date_of_birth`, `gender`, `nationality`, `passport`, `is_completed`, `created_at`, `updated_at`.
2. **Backend Validations & Services:**
   - Updated `studentProfile.schema.ts` (Zod validation schemas for student update and admin update).
   - Updated `studentProfile.service.ts` (`getStudentProfile`, `updateStudentProfile`, `adminUpdateStudentProfile`).
   - Updated `application.service.ts` to sync with `StudentProfile.address`.
   - Verified backend typechecks: `npm run lint` (`tsc --noEmit`) passed with 0 errors.
   - Restarted backend dev server (`npm run dev`) on port 5000.
3. **Frontend Views & Modals:**
   - Updated `StudentProfileClient.tsx`:
     - Updated Digital Student ID Card to show Student ID, Program, Started Semester & Year, Verification Status, and Barcode.
     - Streamlined Academic & Institutional card to only show Student ID, Program, Started Semester & Year.
     - Removed Religion, Marital Status, and Blood Group from Personal & Identity card.
     - Replaced Family & Contact Addresses with Next of Kin & Address card (Next of Kin Relationship, Name, Contact Phone, Contact Email, Address).
     - Updated Edit Profile Modal with matching required fields and Next of Kin options.
   - Updated `AdminUserDetailClient.tsx`:
     - Updated Institutional & Academic Records card, Personal & Identity card, Next of Kin & Address card.
     - Updated Admin Edit Student Information Modal with Started Semester dropdown (Fall, Summer, Spring), Started Year, Next of Kin Relationship dropdown, Next of Kin Name, Contact Phone, Contact Email, Address, and Verification Toggle.
   - Verified frontend typecheck: `npx tsc --noEmit` passed with 0 errors.

---

## Update: Student Portal Top-Left Sidebar Background & White Logo

**Time:** 2026-09-18T16:30:00+06:00  
**User Request:**
- Remove the red background from the top-left logo area of the dashboard sidebar, keep it black/charcoal (`bg-brand-secondary`, matching the left sidebar).
- Add the white logo from `D:\Sikku works\proGemini\progenimi logo\progemini-logo-white.png`.

**Actions Executed:**
1. Copied `D:\Sikku works\proGemini\progenimi logo\progemini-logo-white.png` to `progemini-frontend/public/progemini-logo-white.png`.
2. Updated [StudentSidebar.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentSidebar.tsx):
   - Replaced `bg-brand-primary` with `bg-brand-secondary` in the logo header container to match the rest of the sidebar.
   - Replaced `/logo.png` with `/progemini-logo-white.png` (`h-9 w-auto object-contain`).
3. Updated [StudentHeader.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentHeader.tsx):
   - Replaced red background with `bg-brand-secondary` and updated logo to `/progemini-logo-white.png`.
4. Verified frontend typecheck: `npx tsc --noEmit` passed with 0 errors.

---

## Update: Trimmed Transparent Padding & Resized Top-Left Sidebar Logo

**Time:** 2026-09-18T16:34:00+06:00  
**User Feedback:**
- The logo looked too small in the top-left corner.

**Root Cause & Actions Applied:**
1. **Empty Transparent Padding Trimmed:**
   - The original image file had 1920x1080 dimensions with over 440px of transparent empty padding above and below the actual logo (trimming reduced it from 1920x1080 to 1737x636, a 2.73:1 aspect ratio).
   - Processed and saved the tightly trimmed image to `public/progemini-logo-white.png` and `public/progemini-logo-white-v2.png` for instant cache busting.
2. **Component Resizing ([StudentSidebar.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentSidebar.tsx)):**
   - Increased display size to `h-12 sm:h-13 w-auto max-w-[200px]` with `min-h-[76px]` container, allowing the logo artwork and lettering to fill the sidebar header prominently.
   - Updated [StudentHeader.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentHeader.tsx) with trimmed asset.
3. **Verification:**
   - `npx tsc --noEmit` passed with 0 errors.

---

## Update: Dynamic Course Selection & Automated Unique Student ID Generation in Admin View

**Time:** 2026-09-18T17:10:00+06:00  
**User Request:**
1. In the admin view, the Student ID will be generated automatically after selecting Academic Program, Started Semester, and Started Year.
2. Place the Student ID field after Academic Program, Started Semester, and Started Year.
3. In Academic Program, display two dynamic cascading dropdowns:
   - **Category**
   - **Course list** (filtered according to category selection).
   - Only the Course name (`course.title`) is sent as `program` to the student profile.
4. Student ID format chosen:
   - `2601-MBA-0001`
   - `26` = 2-digit intake year
   - `01` = semester code (`01` = Spring, `02` = Summer, `03` = Fall)
   - `MBA` = 3-letter course shortcode
   - `0001` = 4-digit sequential counter
5. Maintain the ID dynamically, verify sequence against database, and guarantee zero duplicate collisions.

**Architecture & Actions Executed:**

1. **Backend Dynamic ID Generation Algorithm ([studentProfile.service.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/studentProfile.service.ts)):**
   - Implemented `getCourseShortCode(courseName: string): string`:
     - Recognizes standard curriculum: MBA (`MBA`), Cyber Security (`CSY`), Fraud Investigation (`FIF`), Accounting & Finance (`AFM`), Systems Leadership (`AIS`), International Business (`IBM`), Hospitality/Events (`BHM`), Human Resources (`HRM`), Tourism (`BTM`), Global Health (`GHW`), Computer Science (`CSE`), Software Engineering (`SWE`), Data Science / AI (`DAT`), Law/Criminology (`LAW`).
     - Extracts bracketed acronyms e.g. `(MBA)`.
     - Intelligently derives 3-letter abbreviations from degree names.
   - Implemented `generateDynamicStudentId({ year, semester, courseName, targetUserId })`:
     - Parses 2-digit year code (e.g. `2026` -> `26`).
     - Maps semester (`Spring` -> `01`, `Summer` -> `02`, `Fall` -> `03`).
     - Builds prefix: e.g. `2601-MBA-`.
     - Queries Prisma `studentProfile.findMany` matching `startsWith: prefix` (excluding current student ID if editing).
     - Calculates `max(sequence) + 1` and pads to 4 digits (e.g. `0001`).
     - Executes collision loop with `studentProfile.findUnique` to guarantee zero collisions.
     - Returns `{ studentId, prefix, courseCode, yearCode, semCode, sequence }`.

2. **Backend Controller & Admin API Endpoint:**
   - In [studentProfile.controller.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/controllers/studentProfile.controller.ts), added `generateStudentId` handler.
   - In [studentProfile.routes.ts](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/routes/studentProfile.routes.ts), mounted:
     `GET /admin/students/generate-id` (protected by `authenticate` and `authorize("ADMIN")`).
   - Verified via unit execution: `2601-MBA-0001`, `2602-CSY-0001`, `2603-FIF-0001`.

3. **Frontend Admin UI Restructuring ([AdminUserDetailClient.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/admin/AdminUserDetailClient.tsx)):**
   - Fetched `/v1/categories` and `/v1/courses` dynamically on mount via `apiClient`.
   - Auto-detected and synchronized existing student program with its category.
   - Implemented cascading Category -> Course dropdowns:
     - Selecting a category filters the Course dropdown to courses belonging to that category.
     - Selecting a course assigns `course.title` to `formData.program`.
   - Reordered fields in Edit Modal:
     1. Course Category (Select)
     2. Academic Program / Course (Select - filtered)
     3. Started Semester (Select: Spring 01, Summer 02, Fall 03)
     4. Started Year (Input: e.g. 2026)
     5. Student ID (Placed after program, semester & year)
   - Integrated automatic ID generation: whenever Program, Semester, or 4-digit Year is selected/changed, the system automatically fetches the next available sequential ID and populates `formData.studentId`.
   - Added manual `⚡ Refresh ID` button with loading spinner (`FaSync`) for on-demand generation.
   - Reordered the read-only overview cards to match: Academic Program -> Started Semester & Year -> Student ID.

4. **Verification & Quality Checks:**
   - Backend TypeScript build (`npx tsc --noEmit`): 0 errors.
   - Frontend TypeScript build (`npx tsc --noEmit`): 0 errors.
   - Backend Dev Server: running on port 5000, actively processing requests.
   - Frontend Dev Server: running on port 3000.

---

## Update: Git Push Resolution & Secret Protection Remediation

**Time:** 2026-09-18T23:45:00+06:00  
**User Request:**
- Not able to push on main branch. Check current remote changes, merge them with local changes, and push to main branch.

**Diagnosis & Root Cause:**
1. Checked remote repository status: `git fetch origin`. Remote `origin/main` was at `0e3344e`, with no divergent remote commits.
2. Attempted `git push origin main`, which failed due to GitHub Push Protection rule `GH013`:
   - Blocked secret: Resend API Key in local commit `2064bf0` (`EXPLANATION_FOR_INTERN.html:725` and `chat_history/chat_analysis_2026-09-13.md:105`).
   - Although subsequent edits replaced the key with placeholders, the earlier commit in local git history still retained the secret snapshot.
3. Created safety backup branch `backup-before-squash`.
4. Squashed local commits cleanly on top of `origin/main` without any secret leaks in tree or git history.
5. Pushed cleanly to `origin/main`.


