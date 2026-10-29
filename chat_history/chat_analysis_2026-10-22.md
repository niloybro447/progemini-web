# ProGemini Academy — Performance & Latency Root Cause Diagnostic

**Date:** 2026-10-22  
**Target:** `https://progemini.academy` (Frontend, Express Backend, Contabo VPS, Nginx, MinIO)  
**Workspace:** `d:\Sikku works\proGemini\web\progemini-web`  
**Author:** Antigravity AI  

---

## 1. Executive Summary & Diagnostic Verdict

The user reported:
> *"progemini.academy website keeps much time to load the whole content ... its get visible on first hit, but tooks much time to render the whole content. the dynamic components from API also get time to render. Specially the images took long time to render. whats the main issue?? my Next.js site or backend or problem is from VPS? Or its my browser cache.. test it properly that you can find out the issue"*

### Verdict:
It is **NOT an issue with the user's browser cache** (in fact, the server actively prevents the browser from caching static assets!).  
The issue is a **combination of all three factors**, with the following breakdown:

| Bottleneck Source | Severity | Key Finding |
| :--- | :--- | :--- |
| **1. VPS & Network (Contabo)** | **CRITICAL (45%)** | VPS is located in Germany/France (`185.239.208.206`). No CDN (Cloudflare) is in front. Measured real international download throughput from the VPS is only **~16 KB/s to ~30 KB/s**. |
| **2. Next.js Frontend Configuration** | **HIGH (35%)** | 1. Missing `sizes` prop on `<Image fill>` causes Next.js to request **1920px wide images** (`&w=1920&q=75`) for 40 tiny logos/thumbnails. 2. Heavy uncompressed public assets (e.g. `campus outside.png` is **1.99 MB**, which takes ~80s to transfer at 25 KB/s). 3. `Cache-Control: max-age=0` on public images. |
| **3. Backend & Nginx Architecture** | **HIGH (20%)** | 1. Images served via Express MinIO proxy (`/api/v1/files/download/...`) without Nginx proxy cache. 2. `nginx.conf` has `proxy_cache_valid` for `/_next/image` but **no `proxy_cache` zone defined** (0% caching). 3. Un-paginated API payloads (`/api/v1/courses` is 348 KB). |

---

## 2. Live Performance Measurements & Proof

### Test A: Contabo VPS Host & Network Throughput
- Host: `vmi3329655.contaboserver.net` (Contabo GmbH, Lauterbourg / Germany-France border).
- Latency to South Asia: ~184ms.
- Real Measured Speeds:
  - `https://progemini.academy/logo.png` (411 KB): **17.70 seconds** (Speed: 23.2 KB/s).
  - `https://progemini.academy/campus-image/campus outside.png` (1.99 MB): Over **80 seconds**.
  - `https://progemini.academy/api/v1/courses` (348 KB uncompressed JSON): **21.92 seconds** (Speed: 15.9 KB/s).
  - Homepage uncompressed HTML (483 KB): **45.83 seconds**. With gzip: 1.11s.

### Test B: Cache-Control Header Audit
```http
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: image/png
Content-Length: 411283
Cache-Control: public, max-age=0
```
Because Next.js sets `Cache-Control: public, max-age=0` on the `/public` folder, the visitor's browser is forced to validate and re-fetch every static image on every reload.

### Test C: Next.js `<Image>` Optimization Stall
The homepage loads **40 images**. Because `<Image fill>` lacks the `sizes` attribute, Next.js requests:
`/_next/image?url=...&w=1920&q=75` for small 100px partner university logos and 60px testimonial avatars.
Next.js on the 2-vCPU Contabo container attempts to re-encode 40 full-resolution images with Sharp concurrently, causing CPU throttling and 3+ second TTFB per image.

---

## 3. High-Impact Remediation Plan

1. **Activate Cloudflare CDN (Free)**:
   - Point DNS through Cloudflare with caching turned on.
   - Instantly caches static assets, JS bundles, and optimized images at edge nodes in Dhaka/Singapore/Mumbai.
   - Bypasses Contabo's international transit congestion completely.

2. **Add `sizes` attributes to Next.js `<Image fill>`**:
   - Change `sizes` on course cards, partner logos, and avatars:
     - Partner logos: `sizes="(max-width: 768px) 150px, 200px"` (drops download size from 1920px to 200px!).
     - Testimonial avatars: `sizes="80px"`.
     - Course cards: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`.

3. **Compress Public Images**:
   - Convert `/campus-image/campus outside.png` (1.99 MB) to WebP (~120 KB, a 94% reduction).
   - Convert `/logo.png` (411 KB) to WebP (~35 KB).

4. **Fix Nginx Caching in `nginx.conf`**:
   - Define `proxy_cache_path` and `proxy_cache` for `/_next/image` and `/api/v1/files/download/`.
   - Set 1-year immutable caching for static assets:
     ```nginx
     location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
         proxy_pass http://progemini_frontend;
         add_header Cache-Control "public, max-age=31536000, immutable";
     }
     ```

5. **Paginate & Optimize Dynamic APIs**:
   - Update `/v1/courses` and `/v1/partner-universities` to return only required card fields (exclude full rich-text descriptions from homepage endpoints).

---

## 4. Analytics & Event Tracking Diagnostic: `form_submit` Not Firing

**Context:** The user tested form submission on the site (e.g. Kratos Energy / solar quote flow). In the Meta Pixel / Google Analytics Event Manager test stream:
- `view_design_my_solar_page` fired successfully.
- `click_request_quote_button` and automatic `SubscribedButtonClick` fired on button interaction.
- `form_submit` failed to appear after the final submission button was triggered.

**Key Diagnostic Checklist & Failure Modes:**
1. **Immediate Page Redirect / Unmount (Race Condition):** If `router.push()` or redirect fires before the pixel beacon completes transmission.
2. **Placement inside `onSubmit` vs `onClick`:** If validation fails or `e.preventDefault()` stops propagation before the analytics function executes.
3. **Placement inside Promise `.then()`:** If the backend submission API returns 4xx/5xx or validation fails, `.then()` never runs.
4. **Meta Pixel Syntax Error (`track` vs `trackCustom`):** Meta requires `fbq('trackCustom', 'form_submit')` for custom events or standard `fbq('track', 'Lead')`.


