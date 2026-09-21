# Digital Student ID Card Planning & Architecture Analysis

**Date:** 2026-09-21  
**Target:** Student Portal & Admin Clearance (`/student/profile` & `/admin/users/[id]`)  
**Workspace:** `d:\Sikku works\proGemini\web\progemini-web` (Frontend + Backend)  
**Author:** Antigravity AI Pair Programmer  

---

## 1. Requirement Summary

The user requested a digital ID card for every student profile that is dynamic and conditional:
- **Conditions for Visibility:**
  1. Profile is 100% completed by student.
  2. Student applied for an application.
  3. Application is approved by admin.
  4. Academic Program, Started Semester & Year, and Student ID are available and cleared by admin.
- **Card Features:**
  - Dynamic QR code displaying the student's unique ID and credential verification URL.
  - Interactive flip/turn for front and back credential verification.
  - Print/save functionality.
  - Interactive clearance checklist for students whose credentials are not yet fully cleared.
  - Admin clearance status banner with one-click course auto-fill on `/admin/users/[id]`.

---

## 2. Technical Implementation Summary

### Backend (`progemini-backend`):
1. **Student Profile Query (`src/services/studentProfile.service.ts`)**:
   - Updated `getStudentProfile(userId)` to include `applications` (status, course, createdAt) directly in the student's profile payload.
2. **User Admin Query (`src/services/user.service.ts`)**:
   - Updated `getUserById(id)` to include `applications` with `course` relations.
3. **Public Credential Verification Service & Endpoints (`src/routes/studentProfile.routes.ts`)**:
   - Implemented public endpoints: `GET /api/v1/credentials/verify/:studentId` and `GET /api/credentials/verify/:studentId`.
   - Evaluates whether the student record is cleared and active, returning verified institutional metadata (studentId, name, avatar, program, semester, year, status, accreditation) without exposing sensitive private details (passport, address, phone).
4. **Build Status**:
   - `npm run build` compiled cleanly with `0 errors`.

### Frontend (`progemini-frontend`):
1. **Dynamic QR Code Engine**:
   - Installed `qrcode.react` (lightweight SVG/Canvas QR generator).
2. **`StudentDigitalIdCard.tsx` (`src/components/student/StudentDigitalIdCard.tsx`)**:
   - Implements front and back views with 3D flip card toggle.
   - Dynamic SVG QR code cleanly encoding the official verification link (`https://progemini.academy/credentials/verify?id=...`).
   - Official ProGemini gold & crimson branding, verified badge, photo upload overlay, print stylesheet.
   - Full Programme Name: Removed truncation (`truncate max-w-[220px]`) and applied `flex-1 break-words leading-snug` so full degree names (e.g. "MSc / Postgraduate Diploma Cyber Security") are completely visible without `...`. Added Programme to back face as well.
   - Fully Mobile Responsive: Responsive padding (`p-4 sm:p-6`), side-by-side photo and identity metadata layout (`flex-row items-center sm:items-start`), flexible stacked metadata rows for programme and intake, responsive barcode, and adaptive QR code dimensions (`64px` on mobile, `76px` on desktop).
3. **`StudentProfileClient.tsx` (`src/components/student/StudentProfileClient.tsx`)**:
   - Evaluates the 5 conditions dynamically.
   - Mobile Responsive: Outer container padding (`px-3 sm:px-6 py-4 sm:py-6`), header with full-width mobile action button (`w-full sm:w-auto`), adaptive card grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4`), full-width address cards, and mobile-optimized modal dialog with finger-friendly touch targets.
4. **Public Verification Page (`src/app/credentials/verify/page.tsx` & `/verify-id/page.tsx`)**:
   - Authenticated and unauthenticated public verification page with verified shield badge, student avatar, institution seal, copyable Student ID, intake information, and print-ready verification letter/certificate.
5. **`IdCardEligibilityTracker.tsx` (`src/components/student/IdCardEligibilityTracker.tsx`)**:
   - Live 5-step checklist with progress bar and actionable guidance.
6. **`AdminUserDetailClient.tsx` (`src/components/admin/AdminUserDetailClient.tsx`)**:
   - Displays a Digital ID Card Clearance Status Banner indicating locked/cleared status with condition breakdown.
   - Added auto-fill button to quickly populate the approved application course into the Academic Program field.
7. **Typecheck Status**:
   - `npm run typecheck` (`tsc --noEmit`) succeeded with `0 errors`.

---

## 3. Bug Fixes & UI Cleanups

### Admin Update Student Profile 500 Error
- Fixed `src/middlewares/validate.ts` so `req.params`, `req.body`, and `req.query` are only assigned if defined in the Zod parsed result.
- Added explicit `params: z.object({ userId: z.string().min(1) })` to `adminUpdateStudentProfileSchema`.

### Full Programme Name Display (Removed `...` Truncation)
- Replaced `truncate max-w-[220px]` in [StudentDigitalIdCard.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/student/StudentDigitalIdCard.tsx#L231-L241) with `flex-1 break-words leading-snug`.
- Added the complete programme title to the back credential face as well.

### Removed All Test Verification Widgets from UI
- Completely removed the test verification action bar, localhost test button, and QR target switch widget from below the student card.
- Cleaned up the QR code to be a clean, authentic QR code element with "VERIFY ID".

### Mobile Responsiveness Across Student Profile & ID Card
- Responsive card padding and dimensions for all screen sizes (down to 320px width).
- Kept photo and student name side-by-side (`flex-row`) with responsive photo sizing (`w-20 h-24` on mobile, `w-24 h-28` on desktop).
- Mobile-friendly programme & intake layout preventing horizontal overflow.
- Adaptive grid layouts on all profile sections (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`).
- Optimized edit profile modal with full-width touch buttons on mobile.

---

## 4. Admin Verification Menu & Digital ID Card Search

### Admin Sidebar (`AdminSidebar.tsx`)
- Added a collapsible **Verification** dropdown section under main navigation with `FaShieldAlt` icon.
- Sub-menus:
  - **Digital ID Card** (`/admin/verification/id-card`) with `FaIdCard`.
  - **Certification** (`/admin/verification/certification`) with `FaCertificate`.
- Automatically expands when visiting any `/admin/verification/*` route, with active menu item highlight and smooth accordion transitions.

### Admin Digital ID Card Search & Verification Page (`src/app/admin/verification/id-card/page.tsx`)
- Search input bar accepting Student ID (e.g. `2701-CSY-0001`), student name, or email.
- Displays recent lookups for fast re-verification.
- Seamlessly queries `/v1/credentials/verify/:id` and falls back to user management search.
- When found:
  - Renders the student credential in the exact format of the dynamic, interactive **`StudentDigitalIdCard`** (front/back 3D flip, untruncated full program, dynamic QR code).
  - Displays an administrative inspection card with:
    - 5-step clearance criteria checklist (Profile, Application, Program, Intake, Student ID).
    - Quick link to edit student record (`/admin/users/[id]`).
    - Public verification link (`/credentials/verify?id=...`).
- Handles error states with clear alert messaging and user recovery actions.

### Certification Page (`src/app/admin/verification/certification/page.tsx`)
- Clean placeholder page kept blank for future certification implementation as requested.

---

## 5. Admin Container Padding & Layout Spacing Fix

### Issue
- On `/admin/verification/id-card`, the page container lacked outer padding (`className="space-y-6"`), causing:
  - Header and icons to collide directly with the red admin sidebar on the left (`0px` left margin).
  - Header to touch the top window boundary (`0px` top padding).
  - Search input box and "Search & Verify ID" button to cut off or push directly against the right viewport edge.

### Resolution
- **Digital ID Card Verification Page ([src/app/admin/verification/id-card/page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/verification/id-card/page.tsx))**:
  - Updated root wrapper from `<div className="space-y-6">` to `<div className="p-6 md:p-8 space-y-6 w-full">`, providing generous 24px/32px breathing room on all 4 sides in line with other modern admin pages.
- **Certification Page ([src/app/admin/verification/certification/page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/verification/certification/page.tsx))**:
  - Updated root wrapper to `<div className="p-6 md:p-8 space-y-6 w-full">`.
- **User Detail Page ([src/app/admin/users/[id]/page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/users/%5Bid%5D/page.tsx))**:
  - Wrapped `AdminUserDetailClient` inside `<div className="p-6 md:p-8 w-full">`.
- **Enquiries Page ([src/app/admin/enquiries/page.tsx](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/enquiries/page.tsx))**:
  - Standardized to `<div className="p-6 md:p-8 space-y-6 w-full">`.

---

---

## 7. VPS Deployment Infrastructure & Dual Scripts

### VPS Diagnostics Analysis
- **Old Services Found**:
  - `progemini_app_prod` on port `3010` (old Next.js container).
  - `progemini-backend` on port `5001` (old unused backend).
  - `postgres:16-alpine` on port `5434`.
  - `minio` on ports `9000` & `9001`.
  - Nginx currently proxying `progemini.academy` to `127.0.0.1:3010`.
- **Target Architecture**:
  - Express API Backend: Port `5000` (container: `progemini_backend`).
  - Next.js Frontend: Port `3010` &rarr; container `3000` (container: `progemini_app_prod`).
  - Internal Docker Network: Frontend communicates with Backend at `http://progemini-backend:5000/api` (`INTERNAL_API_URL`).
  - Public Client Network: Browser calls `https://progemini.academy/api` (`NEXT_PUBLIC_API_BASE_URL`).
  - Production Database: PostgreSQL on port `5434` with auto Prisma schema sync.

### Files Created & Updated
1. **[docker-entrypoint.sh](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/docker-entrypoint.sh)**:
   - Automated Prisma schema sync (`npx prisma db push --skip-generate`) on backend container startup.
2. **[progemini-backend/Dockerfile](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/Dockerfile)**:
   - Configured `ENTRYPOINT ["./docker-entrypoint.sh"]`.
3. **[docker-compose.yml](file:///d:/Sikku%20works/proGemini/web/progemini-web/docker-compose.yml)**:
   - Added `INTERNAL_API_URL` and `NEXT_PUBLIC_API_BASE_URL` to frontend environment.
4. **[nginx.conf](file:///d:/Sikku%20works/proGemini/web/progemini-web/nginx.conf)**:
   - Added `/api/auth/` location block routing to `progemini_frontend` so NextAuth remains with Next.js.
   - Routed `/api/` to `progemini_backend` (port 5000).
5. **[deploy-first-time.sh](file:///d:/Sikku%20works/proGemini/web/progemini-web/deploy-first-time.sh)**:
   - First-time deployment script: environment validation, port conflict resolution, initial build, Prisma database sync, and container launch.
6. **[deploy.sh](file:///d:/Sikku%20works/proGemini/web/progemini-web/deploy.sh)**:
   - Subsequent update deployment script: builds images first while old containers stay alive, syncs Prisma database, then stops and replaces old containers, followed by health verification.

- Path Verification: Confirmed `/root/progemini/progemini-web` requires zero code or configuration changes. All paths in scripts and compose files are dynamic and relative.
- Legacy Project Retention: Keep `/root/progemini/pg-next` files intact on VPS disk as a safe backup. Only the running Docker container (`progemini_app_prod`) needs to be stopped to free port 3010.
- First-Time Deploy Hotfixes:
  1. `DATABASE_URL` Quote Sanitization: Docker `--env-file` parses double quotes as literal string characters, causing Prisma error P1012 (`URL must start with postgresql://`). Added regex unquoting in `docker-entrypoint.sh`, `deploy-first-time.sh`, `deploy.sh`, and `src/config/index.ts`.
  2. Module Alias Resolution (`Cannot find module '@/config'`): Standard `tsc` leaves TypeScript `@/*` alias imports intact in compiled `dist/*.js`. Integrated `tsc-alias` into `npm run build` (`tsc && tsc-alias`) to rewrite all aliases to native Node.js relative paths (`./config`, `./utils/logger`), ensuring zero runtime dependency overhead.
  3. Entrypoint Command Passthrough: Updated `docker-entrypoint.sh` to check `$# -gt 0` and execute custom command arguments (e.g. `npx prisma db push --skip-generate`) directly without starting the HTTP server.

---

## 8. Artifacts & Documentation
- Implementation Plan: [implementation_plan.md](file:///C:/Users/USER/.gemini/antigravity-ide/brain/66912cf9-a246-4686-9b74-51deeeb7bfa5/implementation_plan.md)
- Walkthrough: [walkthrough.md](file:///C:/Users/USER/.gemini/antigravity-ide/brain/66912cf9-a246-4686-9b74-51deeeb7bfa5/walkthrough.md)







