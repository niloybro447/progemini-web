# Chat History Analysis — 2026-11-17

## 1. Blog Page Enhancements: Hero Feature Image Background & Course JSON Leak Fix

**Date:** 2026-11-17  
**User Query:**  
"[How to Study for an Online MBA While Working Full-Time | Progemini Academy](http://localhost:3000/blog/online-mba-while-working-full-time)  
Need to do some change on blog page strucutre .. Move the feature image into landing hero section background .. and some JSON text are visible under course program. on the right div"

### Issues Addressed:

1. **Move Feature Image into Hero Landing Section Background:**
   - **Previous State:** The hero section had a static dark gradient, while the featured cover image was rendered as a standalone box in the left body column above the text blocks.
   - **Update:** Moved the high-resolution featured image into the background of the hero landing header. Applied a multi-layer gradient overlay (`bg-gradient-to-t from-[#100d0e] via-[#141112]/92 to-[#120f10]/80` and `bg-gradient-to-r from-[#100d0e]/95 via-[#141112]/85 to-transparent`) and a subtle backdrop blur. This provides a luxury cinematic presentation while maintaining strong text contrast for breadcrumbs, titles, author metadata, tags, and the executive summary.
   - Removed the redundant duplicate featured image box from the left body column so the article blocks begin cleanly.

2. **Fix Raw JSON Text Leak in Connected Course Card:**
   - **Root Cause:** In Progemini, `course.introduction` can be stored as a TipTap RichContent JSON string (`{"json":{...},"html":"..."}`). The sidebar card ran a simple `.replace(/<[^>]*>/g, '')` directly on the raw string, which left the raw JSON brackets and syntax (`{"json":{"type":"doc",...`) visible on the webpage under the course title.
   - **Fix:** Created `extractCourseIntroText` in [`progemini-frontend/src/components/blog/types.ts`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/blog/types.ts). It detects stringified JSON, parses `html` or `json` trees, and safely extracts clean, formatted plain text with all HTML/JSON stripped away.
   - Updated both [`progemini-frontend/src/app/blog/[slug]/page.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/app/blog/[slug]/page.tsx) and [`progemini-frontend/src/components/blog/BlogCourseCard.tsx`](file:///d:/Sikku%20works/proGemini/web/progemini-web/progemini-frontend/src/components/blog/BlogCourseCard.tsx).

### Verification:
- Ran `npm run typecheck` (`tsc --noEmit`) in `progemini-frontend` — passed with **0 errors**.
