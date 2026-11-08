# Chat History & Navigator Courses Audit

**Date:** 2026-11-09  
**User Query:** "check all the courses are listed on this Navigator, Few courses are live.. and some courses doesnt have any dynmic content.. first remove these navigation option from mobile and menu (advanced-diploma-fraud-investigation-management) , bsc-business-hospitality-management."

---

## 1. Removed Navigation Options (Desktop MegaMenu & Mobile Menu)
Removed the following two courses from [`progemini-frontend/src/components/CoursesMegaMenu.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/CoursesMegaMenu.tsx) (which powers both the desktop MegaMenu and the mobile menu in [`Navbar.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/Navbar.tsx)):
- `bsc-business-hospitality-management` (`BSc ( Hons) Business Hospitality Management`)
- `advanced-diploma-fraud-investigation-management` (`Advanced Diploma Fraud Investigation Management`)

---

## 2. Full Live Audit of All Courses in the Navigator (`CoursesMegaMenu.tsx`)

### A. Undergraduate Courses

| Department | Navigator Title | Slug | Live DB Status | Dynamic Content & Study Modules |
| :--- | :--- | :--- | :--- | :--- |
| **Business** | BSc (Hons) International Business Management | `bsc-international-business-management` | **LIVE** (`APPROVED`) | Full rich content + **4 module sections** |
| **Business** | BSc (Hons) Business and Human Resource Management | `bsc-business-hrm` | **LIVE** (`APPROVED`) | Full rich content + **3 module sections** |
| **Business** | BSc (Hons) Business, Hospitality and Events Management | `bsc-business-hospitality-events` | **LIVE** (`APPROVED`) | Full rich content + **3 module sections** |
| **Business** | BSc (Hons) Business and Tourism Management | `bsc-business-tourism-management` | **LIVE** (`APPROVED`) | Full rich content + **3 module sections** |
| **Business** | ~~BSc (Hons) Business Hospitality Management~~ | ~~`bsc-business-hospitality-management`~~ | **REMOVED** (Was 404) | Removed from Desktop & Mobile Nav |
| **Health** | BSc (Hons) Health and Social Care | `bsc-health-social-care` | **LIVE** (`APPROVED`) | Has rich text (`intro`, `learn`, `req`), **0 module sections** |
| **Health** | Diploma in Health & Wellness | `diploma-health-wellness` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| **Law** | BSc (Hons) Cyber Security and Forensic Computing | `bsc-cyber-security-forensic-computing` | **LIVE** (`APPROVED`) | Full rich content + **3 module sections** |
| **Law** | BSc (Hons) Business Law | `bsc-business-law` | **LIVE** (`APPROVED`) | Full rich content + **3 module sections** |
| **Law** | LLB (Hons) Law | `llb-law` | **LIVE** (`APPROVED`) | Full rich content + **4 module sections** |
| **Law** | BSc (Hons) Fraud Investigation Management | `bsc-fraud-investigation-management` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| **Law** | Diploma in Fraud Investigation Management | `diploma-fraud-investigation-management` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| **Law** | ~~Advanced Diploma Fraud Investigation Management~~ | ~~`advanced-diploma-fraud-investigation-management`~~ | **REMOVED** (Was 404) | Removed from Desktop & Mobile Nav |

### B. Postgraduate Courses

| Department | Navigator Title | Slug | Live DB Status | Dynamic Content & Study Modules |
| :--- | :--- | :--- | :--- | :--- |
| **Business** | Master of Business Administration (MBA) | `mba` | **LIVE** (`APPROVED`) | Full rich content + **1 module section** |
| **Business** | Level 7 Postgraduate Diploma in Business and Management | `level7-diploma-business-management` | **LIVE** (`APPROVED`) | Full rich content + **2 module sections** |
| **Business** | Doctor in Strategic Management and Leadership Practice (Level 8) | `level8-doctorate-strategic-management` | **LIVE** (`APPROVED`) | Full rich content + **1 module section** |
| **Business** | MSc International Project Management | `msc-international-project-management` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| **Business** | MSc International Hospitality and Tourism Management | `msc-international-hospitality-tourism-management` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| **Business** | MSc International Marketing | `msc-international-marketing` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| **Business** | MSc Accounting and Financial Management | `msc-accounting-financial-management` | **LIVE** (`APPROVED`) | Has rich text (`intro`, `learn`, `req`), **0 module sections** |
| **Health** | MSc Global Health and Well-being | `msc-global-health-wellbeing` | **LIVE** (`APPROVED`) | Full rich content + **1 module section** |
| **Health** | MBA Health and Social Care | `mba-health-social-care` | **LIVE** (`APPROVED`) | Has rich text (`intro`, `learn`, `req`), **0 module sections** |
| **Health** | Master of Public Health | `master-public-health` | **LIVE** (`APPROVED`) | Has rich text (`intro`, `learn`, `req`), **0 module sections** |
| **Law** | LLM International Law: Advanced legal studies for global practice | `llm-international-criminal-law-justice` | **LIVE** (`APPROVED`) | Full rich content + **1 module section** |
| **Law** | MSc Cyber Security | `msc-cyber-security` | **LIVE** (`APPROVED`) | Full rich content + **1 module section** |
| **Law** | Postgraduate Diploma Fraud Investigation & Financial Crime | `msc-management-fraud-investigations` | **LIVE** (`APPROVED`) | Full rich content + **6 module sections** |

### C. Executive Education Courses

| Navigator Title | Slug | Live DB Status | Dynamic Content & Study Modules |
| :--- | :--- | :--- | :--- |
| Leadership and Organisational Behaviour | `leadership-organisational-behaviour` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| Digital Transformation and Technology Leadership | `digital-transformation-tech-leadership` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| Global Business and Geopolitics | `global-business-geopolitics` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| Fraud & Compliance Residential Courses | `fraud-compliance-residential` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| Professional Health Courses | `professional-health-courses` | **NOT IN DB (404)** | Missing dynamic content / not created in DB |
| AI‑Informed Systems Leadership for Sustainability programme | `ai-informed-systems-leadership-for-sustainability` | **LIVE** (`APPROVED`) | Has `intro` & `learn` (missing `requirements`) + **1 module section** |



---

## 3. Structured Static Content Created for All 11 Missing Courses

**Date:** 2026-11-09  
**User Query:** "For other courses which are showing currently 404, Create static content for them. the static page shold contain structured content like dynamic pages.. the course content should UK standard content. International student can apply for these course. For feature images use free stock university images."

### Solution Architecture:
1. **Created Static Data Store:** [`progemini-frontend/src/data/staticCourses.ts`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/data/staticCourses.ts)
   - Contains complete UK-standard curricula, credit weightings, learning hours, multi-semester modules, entry requirements (domestic & international IELTS/equivalent pathways), and career progression routes for all 11 courses.
   - Assigned high-resolution Unsplash university stock images for feature headers.
2. **Updated Dynamic Course Page Route:** [`progemini-frontend/src/app/courses/[slug]/page.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/courses/[slug]/page.tsx)
   - When a requested slug is not yet in the live database, it automatically falls back to `getStaticCourse(slug)`.
   - Renders the exact same structured components (`CourseHeader`, `CourseContent` with interactive module accordion, and `CourseSidebar` with "Apply Now" application flow).
   - If an administrator later creates/publishes a course in the admin dashboard with the same slug, the live database record seamlessly supersedes the static fallback without any code changes.
3. **Updated Course Catalogue:** [`progemini-frontend/src/app/courses/page.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/courses/page.tsx)
   - Merges static courses with database courses so that visitors browsing the catalogue or filtering by category can discover and apply for these courses.
4. **Updated Image Whitelist:** [`progemini-frontend/next.config.js`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/next.config.js)
   - Added `images.unsplash.com` to `remotePatterns`.
5. **Compilation & Typecheck Verification:**
   - Ran `npm run typecheck` (`tsc --noEmit`), exiting with **code 0 (zero errors)**.

### Covered Courses:
1. `diploma-health-wellness` — *Diploma in Health & Wellness* (Level 5 Diploma, 120 Credits)
2. `bsc-fraud-investigation-management` — *BSc (Hons) Fraud Investigation Management* (360 Credits)
3. `diploma-fraud-investigation-management` — *Diploma in Fraud Investigation Management* (Level 5 Diploma, 120 Credits)
4. `msc-international-project-management` — *MSc International Project Management* (Level 7 Master of Science, 180 Credits)
5. `msc-international-hospitality-tourism-management` — *MSc International Hospitality and Tourism Management* (180 Credits)
6. `msc-international-marketing` — *MSc International Marketing* (180 Credits)
7. `leadership-organisational-behaviour` — *Executive Certificate in Leadership and Organisational Behaviour* (60 Credits)
8. `digital-transformation-tech-leadership` — *Executive Certificate in Digital Transformation & Technology Leadership* (60 Credits)
9. `global-business-geopolitics` — *Executive Certificate in Global Business and Geopolitics* (60 Credits)
10. `fraud-compliance-residential` — *Executive Certificate in Advanced Fraud & Compliance (Residential)* (60 Credits)
11. `professional-health-courses` — *Professional Certificate in Healthcare Leadership and Clinical Governance* (60 Credits)


---

## 4. Blog & CMS Module Implementation (Kratos AU Architecture Adaptation)

**Date:** 2026-11-09  
**User Query:**  
`D:\Sikku works\Kratos AU\web\kratos-energy`  
`D:\Sikku works\Kratos AU\web\kratos-energy-backend`  
Study and understand Kratos project's Blogging module which circulates from backend and renders on frontend, and CRM. Implement this on ProGemini, make database changes, and create CRM.  
Categories: `Course` (dynamic course list connected), `Academic`, `Student Journey`, `Progemini VLE`, `Research`, `Communication`, `Scholarships`.  
Blog URLs: `progemini.academy/blog/{title/slug}`.  
Storage: MinIO with image optimization.

### Key Implementation Details:
1. **Database Architecture (`progemini-backend/prisma/schema.prisma`):**
   - Added `BlogCategory` model (`id`, `name`, `slug`, `description`, `order`, relations).
   - Upgraded `Blog` model:
     - Full metadata: `title`, `slug` (unique), `excerpt`, `content`, `featuredImage`, `thumbnail`, `author`, `authorAvatar`, `readMins`, `tags`, `blocks` (Json array), `isPublished`, `publishedAt`, `views`.
     - `categoryId` / `category` relation to `BlogCategory`.
     - `courseId` / `course` dynamic relation to `Course` model.
     - SEO fields: `metaTitle`, `metaDescription`, `metaKeywords`, `canonicalUrl`.
     - Synced to live PostgreSQL via `prisma db push` and regenerated Prisma Client.
   - Seeded all 7 required categories: `Course`, `Academic`, `Student Journey`, `Progemini VLE`, `Research`, `Communication`, `Scholarships`.

2. **Backend API (`progemini-backend`):**
   - [`src/services/blog.service.ts`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/blog.service.ts):
     - CRUD for blog posts & categories.
     - Dynamic auto-calculation of reading time (`calculateReadMins`).
     - Image uploader service leveraging MinIO bucket storage (`blogs/`) and Sharp WebP compression.
   - [`src/controllers/blog.controller.ts`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/controllers/blog.controller.ts): Public & Admin handlers.
   - [`src/routes/blog.routes.ts`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/routes/blog.routes.ts):
     - Public: `GET /blogs`, `GET /blogs/:slug`, `GET /blog-categories`.
     - Admin: Full CRUD under `/admin/blogs`, `/admin/blogs/categories`, and `/admin/blogs/upload-image`.
   - Built and tested with zero TypeScript errors.

3. **Admin CRM Frontend (`progemini-frontend`):**
   - Added **Blogs & CMS** collapsible navigation to [`AdminSidebar.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/admin/AdminSidebar.tsx).
   - [`/admin/blogs`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/blogs/page.tsx): Management table with All/Published/Draft tabs, search, category filter, instant publish status switch, view/edit/delete actions.
   - [`/admin/blogs/create`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/blogs/create/page.tsx) & [`/admin/blogs/[id]/edit`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/blogs/[id]/edit/page.tsx):
     - Auto-slug generator from title.
     - Dynamic Category selector.
     - **Dynamic Course Selector**: When category is `Course` (or any article), admin can link any active course from `/v1/courses`.
     - Modular block editor ([`BlockEditor.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/admin/blogs/BlockEditor.tsx)) supporting Rich Text HTML, Images with direct MinIO upload, FAQ Accordions, Info Cards, CTA Buttons, and Quotes.
     - MinIO Featured Cover Image uploader with live preview.
     - SEO drawer with Meta Title, Meta Description, and Canonical URL.
   - [`/admin/blogs/categories`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/admin/blogs/categories/page.tsx): Full category manager.

4. **Public Frontend Pages (`progemini-frontend`):**
   - [`/blog`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/blog/page.tsx):
     - British academic journal header.
     - Category filter pills (`All`, `Course`, `Academic`, `Student Journey`, `Progemini VLE`, `Research`, `Communication`, `Scholarships`).
     - Responsive grid cards showing cover image, category badge, publish date, read time, title, excerpt, and author.
   - [`/blog/[slug]`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/blog/[slug]/page.tsx):
     - Dynamic OpenGraph and SEO metadata generator (`generateMetadata`).
     - Breadcrumb navigation (`Home > Blog > Category > Title`).
     - **Connected Academic Programme Spotlight card** ([`BlogCourseCard.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/blog/BlogCourseCard.tsx)): High-converting card displaying course details with a direct link to `/courses/${course.slug}`.
     - Modular block renderer ([`BlogBlockRenderer.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/blog/BlogBlockRenderer.tsx)).
     - Related articles section and social sharing.

5. **Verification & Quality Checks:**
   - Database schema synchronized and verified.
   - Initial sample blog post successfully created and tested live via API.
   - Backend `npm run lint` and `npm run build` passed with 0 errors.
   - Frontend `npm run typecheck` passed with 0 errors.


---

## 5. Supporting Blog Articles & Admin Course-Blog Connection

**Date:** 2026-11-09  
**User Query:**  
"supporting pages for mba , doctrate and fraude course. Create these blogs dynamically from bloggins site. with proper format.. content shouldnt be irrelevant .. For our faculty or supervisors you can mention: Jonathan Hibberd and Dr Syed K I Bakht , for them collect infromation from linkdn from their profile. In admin editing Course information add a option to mention any blog with course which will be used"

### Solution Overview:
1. **Created 9 High-Quality, UK-Standard Supporting Articles in the Database:**
   - **MBA Articles (Linked to `mba` - Master of Business Administration):**
     1. `How to Study for an Online MBA While Working Full-Time` (`/blog/how-to-study-for-an-online-mba-while-working-full-time`)
     2. `Can You Apply for an MBA After a Study Gap?` (`/blog/can-you-apply-for-an-mba-after-a-study-gap`)
     3. `What an MBA Final Project Looks Like for a Working Manager` (`/blog/what-an-mba-final-project-looks-like-for-a-working-manager`)
   - **Doctorate Articles (Linked to `level8-doctorate-strategic-management` - Doctoral Programmes):**
     4. `DBA vs PhD for Working Professionals` (`/blog/dba-vs-phd-for-working-professionals`)
     5. `How to Write a Doctoral Research Proposal in Strategic Management` (`/blog/how-to-write-a-doctoral-research-proposal-in-strategic-management`)
     6. `How Online Doctoral Supervision Works` (`/blog/how-online-doctoral-supervision-works`) — *Specifically highlighting faculty supervisors **Dr. Syed K I Bakht** (PhD, Ed.D, MBA, SFHEA, 30+ yrs transnational academic experience) and **Jonathan Hibberd** (University of Nottingham doctoral researcher, MA Sussex European Institute, FHEA, international relations scholar).*
   - **Fraud Articles (Linked to `msc-management-fraud-investigations` - Postgraduate Diploma Fraud Investigation & Financial Crime):**
     7. `How to Move from Banking into Fraud Investigation and Financial Crime` (`/blog/how-to-move-from-banking-into-fraud-investigation-and-financial-crime`)
     8. `Fraud Investigation vs AML Compliance vs Internal Audit` (`/blog/fraud-investigation-vs-aml-compliance-vs-internal-audit`)
     9. `How a Bank Investigates a Suspicious Payment` (`/blog/how-a-bank-investigates-a-suspicious-payment`)

2. **Added Course-Blog Linking in Admin Course Editor:**
   - Updated [`progemini-frontend/src/components/admin/CourseFormAdmin.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/admin/CourseFormAdmin.tsx):
     - Added dedicated **"Linked Supporting Blogs & Academic Guides"** card.
     - Displays all currently mentioned/linked blog articles with quick remove action.
     - Provides an interactive dropdown populated with all published CMS blog articles to attach additional articles.
     - Emits `blogIds` in the course update payload.
   - Updated [`progemini-backend/src/services/course.service.ts`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-backend/src/services/course.service.ts):
     - `getCourseById` & `getCourseBySlug` include `blogs` relation.
     - `updateCourse` automatically synchronizes the relational `courseId` foreign key across linked and unlinked blogs.

3. **Rendered Supporting Guides on Public Course Pages:**
   - Updated [`progemini-frontend/src/components/courses/CourseContent.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/courses/CourseContent.tsx):
     - Automatically renders an **"Academic Guides & Supporting Insights"** card on course pages containing linked articles with reading times, excerpts, and direct links to `/blog/{slug}`.

4. **Testing & Verification:**
   - Backend API verified: `/api/courses/slug/mba`, `/api/courses/slug/level8-doctorate-strategic-management`, and `/api/courses/slug/msc-management-fraud-investigations` return all linked blogs.
   - Frontend and backend compile with 0 errors (`npm run typecheck` & `npm run lint`).
