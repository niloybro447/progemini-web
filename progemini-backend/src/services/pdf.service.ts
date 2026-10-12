import fs from "fs";
import path from "path";
import QRCode from "qrcode";

async function getPuppeteer() {
  const dynamicImport = new Function("specifier", "return import(specifier)");
  const mod = await dynamicImport("puppeteer-core");
  return (mod as any).default || mod;
}

// Locate Chrome or Chromium executable on Windows / Linux / macOS
export function getChromeExecutablePath(): string {
  const customBin = process.env.CHROME_BIN || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (customBin && fs.existsSync(customBin)) {
    return customBin;
  }

  const candidatePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "Google\\Chrome\\Application\\chrome.exe")
      : "",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "Could not find Chrome or Chromium executable. Please configure CHROME_BIN environment variable."
  );
}

// In-memory cache for Base64 assets so they are only read from disk once
const assetBase64Cache = new Map<string, string>();

export function getAssetAsBase64(relativeAssetPath: string): string {
  if (assetBase64Cache.has(relativeAssetPath)) {
    return assetBase64Cache.get(relativeAssetPath)!;
  }

  // Look in backend assets folder first, then frontend public as fallback
  const candidateLocations = [
    path.resolve(__dirname, "../../assets", relativeAssetPath),
    path.resolve(__dirname, "../../../progemini-frontend/public", relativeAssetPath),
    path.resolve(process.cwd(), "assets", relativeAssetPath),
  ];

  for (const filePath of candidateLocations) {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      let mimeType = "image/png";
      if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".gif") mimeType = "image/gif";
      else if (ext === ".svg") mimeType = "image/svg+xml";

      const fileBuffer = fs.readFileSync(filePath);
      const dataUri = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      assetBase64Cache.set(relativeAssetPath, dataUri);
      return dataUri;
    }
  }

  return "";
}

// Render arbitrary HTML to high-resolution A4 PDF Buffer
export async function renderHtmlToPdf(
  html: string,
  options?: { landscape?: boolean }
): Promise<Buffer> {
  const executablePath = getChromeExecutablePath();
  const puppeteer = await getPuppeteer();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
      "--no-first-run",
      "--no-zygote",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: ["load", "domcontentloaded"],
    });

    // Ensure all Google WebFonts are fully loaded and rendered before generating PDF
    try {
      await page.evaluateHandle("document.fonts.ready");
    } catch {
      // Continue if fonts.ready evaluation fails
    }

    const pdfUint8Array = await page.pdf({
      format: "A4",
      landscape: !!options?.landscape,
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfUint8Array);
  } finally {
    await browser.close();
  }
}

// Format date helpers
function formatDateOfAward(dateInput?: string | Date | null): string {
  if (!dateInput) return "30 September 2026";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

function formatCertificationDateSlash(dateInput?: string | Date | null): string {
  if (!dateInput) return "30/09/2026";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

// ─────────────────────────────────────────────────────────────
// 1. OFFICIAL ACADEMIC MARK SHEET HTML TEMPLATE
// ─────────────────────────────────────────────────────────────
export interface MarksheetPdfData {
  studentName: string;
  studentId: string;
  qualification: string;
  mainFieldOfStudy: string;
  level?: string;
  language?: string;
  modeOfStudy?: string;
  programmeLength?: string;
  creditRequirement?: string;
  overallAverage?: string;
  classification?: string;
  totalUkCredits?: number;
  totalEctsCredits?: number;
  issueDate?: string | Date | null;
  modules?: Array<{
    code: string;
    subject: string;
    level: string | number;
    marks: number;
    ukCredits: number;
    ectsCredits: number;
  }>;
  encryptedToken?: string | null;
  verificationUrl?: string | null;
}

export async function generateMarksheetHtml(data: MarksheetPdfData): Promise<string> {
  const logoDataUri =
    getAssetAsBase64("certitifacte/fab-icon.gif") ||
    getAssetAsBase64("logo.png") ||
    getAssetAsBase64("certitifacte/logo.png");
  const signDataUri = getAssetAsBase64("certitifacte/e.marphy.png");
  const sealDataUri = getAssetAsBase64("certitifacte/academy-seal.png");

  const modules = data.modules || [];
  const totalUk =
    data.totalUkCredits !== undefined && data.totalUkCredits !== null
      ? data.totalUkCredits
      : modules.reduce((acc, m) => acc + (Number(m.ukCredits) || 0), 0);

  const totalEcts =
    data.totalEctsCredits !== undefined && data.totalEctsCredits !== null
      ? data.totalEctsCredits
      : modules.reduce((acc, m) => acc + (Number(m.ectsCredits) || 0), 0);

  const computedAvg =
    modules.length > 0
      ? Math.round(modules.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) / modules.length)
      : 62;

  const displayAverage = data.overallAverage || `${computedAvg}%`;

  const getClassification = (avgStr: string) => {
    const num = parseInt(avgStr.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return "Upper Second Class";
    if (num >= 70) return "First Class";
    if (num >= 60) return "Upper Second Class";
    if (num >= 50) return "Lower Second Class";
    if (num >= 40) return "Third Class";
    return "Pass";
  };

  const displayClassification = data.classification || getClassification(displayAverage);
  const dateAward = formatDateOfAward(data.issueDate);
  const certDateSlash = formatCertificationDateSlash(data.issueDate);

  // Compute live verification URL & generate high-res QR code Base64
  const liveDomain = (
    process.env.LIVE_URL ||
    process.env.APP_URL ||
    "https://progemini.academy"
  ).replace(/\/+$/, "");

  const token =
    data.encryptedToken ||
    (data.verificationUrl && data.verificationUrl.includes("token=")
      ? data.verificationUrl.split("token=")[1].split("&")[0]
      : null);

  const targetUrl = token
    ? `${liveDomain}/credentials/verify?token=${encodeURIComponent(decodeURIComponent(token))}`
    : `${liveDomain}/credentials/verify?token=${encodeURIComponent(data.studentId || "PG-MARKSHEET")}`;

  const qrDataUri = await QRCode.toDataURL(targetUrl, {
    width: 260,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const moduleRowsHtml = modules
    .map(
      (m, idx) => `
      <tr style="background-color: ${idx % 2 === 1 ? "#fafafa" : "#ffffff"};">
        <td style="padding: 4.5px 8px; font-weight: 600; color: #111827; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${m.code}</td>
        <td style="padding: 4.5px 8px; font-weight: 500; color: #1f2937; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${m.subject}</td>
        <td style="padding: 4.5px 8px; text-align: center; color: #1f2937; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${m.level}</td>
        <td style="padding: 4.5px 8px; text-align: center; font-weight: 700; color: #111827; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${m.marks}</td>
        <td style="padding: 4.5px 8px; text-align: center; color: #1f2937; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${m.ukCredits}</td>
        <td style="padding: 4.5px 8px; text-align: center; color: #1f2937; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${m.ectsCredits}</td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Academic Mark Sheet - Progemini Academy</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,400&family=Montserrat:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
      overflow: hidden;
    }

    .sheet-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 210mm;
      height: 297mm;
      padding: 10mm 14mm 8mm 14mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    /* Golden perimeter border */
    .golden-border {
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 6mm;
      border: 2px solid #c59b27;
      pointer-events: none;
      z-index: 5;
    }

    .serif-title {
      font-family: 'Playfair Display', 'Cinzel', Georgia, serif;
    }

    .header-crest {
      width: 90px;
      height: 90px;
      object-fit: contain;
      margin: 0 auto 5px auto;
      display: block;
    }

    .header-inst-title {
      font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
      font-weight: 800;
      color: #7a0019;
      font-size: 28px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      line-height: 1.05;
      text-align: center;
    }

    .header-inst-sub {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      color: #7a0019;
      font-size: 14px;
      letter-spacing: 0.34em;
      text-transform: uppercase;
      margin-top: 2px;
      text-align: center;
    }

    .header-motto {
      font-weight: 600;
      color: #1f2937;
      font-size: 8.5px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      margin-top: 2px;
      text-align: center;
    }

    .doc-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      color: #7a0019;
      font-size: 25px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 6px;
      text-align: center;
      line-height: 1.15;
    }

    .qualification-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      color: #b8860b;
      font-size: 17px;
      letter-spacing: 0.02em;
      margin-top: 2px;
      text-align: center;
      line-height: 1.2;
    }

    /* Section 1: Student Details Table */
    .gold-bar {
      background-color: #b8860b;
      padding: 4px 10px;
      margin-top: 8px;
    }

    .gold-bar h3 {
      font-weight: 700;
      color: #ffffff;
      font-size: 12.5px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      border-bottom: 1px solid #e5e7eb;
    }

    .details-table td {
      padding: 3.5px 4px;
      vertical-align: middle;
      line-height: 1.35;
    }

    .details-table tr {
      border-bottom: 1px solid #e5e7eb;
    }

    .label-col {
      font-weight: 700;
      color: #7a0019;
      white-space: nowrap;
    }

    .value-col {
      font-weight: 500;
      color: #111827;
    }

    .border-left-divider {
      border-left: 1px solid #e5e7eb;
      padding-left: 8px !important;
    }

    /* Section 2: Modules Table */
    .record-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      color: #7a0019;
      font-size: 15px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 9px;
      margin-bottom: 4px;
    }

    .modules-table-container {
      width: 100%;
      border: 1px solid #7a0019;
      overflow: hidden;
    }

    .modules-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .modules-table th {
      background-color: #7a0019;
      color: #ffffff;
      font-weight: 700;
      font-size: 10.5px;
      padding: 5px 8px;
    }

    .summary-bar {
      background-color: #b8860b;
      color: #ffffff;
      padding: 4px 10px;
      border-top: 2px solid #b8860b;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .summary-item p:first-child {
      font-size: 8.5px;
      font-weight: 500;
      line-height: 1.1;
    }

    .summary-item p:last-child {
      font-size: 13.5px;
      font-weight: 800;
      line-height: 1.1;
      margin-top: 1px;
    }

    /* Section 3: Grading Scheme */
    .scheme-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      color: #7a0019;
      font-size: 14px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: center;
      margin-top: 8px;
    }

    .scheme-thresholds {
      font-size: 9.5px;
      font-weight: 500;
      color: #374151;
      text-align: center;
      margin-top: 1.5px;
    }

    .cream-info-bar {
      background-color: #fbf7ee;
      padding: 4px 12px;
      margin-top: 3px;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .cream-col p:first-child {
      color: #7a0019;
      font-weight: 700;
      font-size: 9.5px;
    }

    .cream-col p:last-child {
      color: #1f2937;
      font-weight: 500;
      font-size: 10px;
      margin-top: 1px;
    }

    /* Section 4: Bottom Signatures & QR */
    .bottom-signatures {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 8px;
      padding: 0 8px;
    }

    .sig-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 28%;
      text-align: center;
    }

    .sig-img {
      max-height: 48px;
      max-width: 130px;
      object-fit: contain;
      margin-bottom: 2px;
    }

    .seal-img {
      width: 72px;
      height: 72px;
      object-fit: contain;
      margin-bottom: 2px;
    }

    .sig-label {
      font-weight: 700;
      color: #7a0019;
      font-size: 10.5px;
      white-space: nowrap;
    }

    .qr-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .qr-box {
      background: #ffffff;
      border: 1px solid rgba(184, 134, 11, 0.4);
      border-radius: 4px;
      padding: 3px;
    }

    .qr-img {
      width: 68px;
      height: 68px;
      display: block;
    }

    .qr-label {
      font-weight: 700;
      color: #7a0019;
      font-size: 7.8px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-top: 3px;
      white-space: nowrap;
    }

    /* Footer */
    .bottom-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 4px;
      text-align: center;
      font-size: 9px;
      font-weight: 500;
      color: #4b5563;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="golden-border"></div>
  <div class="sheet-wrapper">
    <!-- Top Header -->
    <div>
      <img src="${logoDataUri}" alt="Progemini Academy" class="header-crest">
      <h1 class="header-inst-title">PROGEMINI</h1>
      <p class="header-inst-sub">ACADEMY</p>
      <p class="header-motto">EDUCATE &middot; EMPOWER &middot; EXCEL</p>
      <h2 class="doc-title">OFFICIAL MARK SHEET</h2>
      <p class="qualification-title">${data.qualification || "BSc (Hons) International Business"}</p>
    </div>

    <!-- Section 1: Student Details -->
    <div>
      <div class="gold-bar">
        <h3>STUDENT &amp; AWARD DETAILS</h3>
      </div>
      <table class="details-table">
        <tbody>
          <tr>
            <td class="label-col" style="width: 18%;">Student Name</td>
            <td class="value-col" style="width: 32%;">${data.studentName || "Abir Md Rezwan Ahmed"}</td>
            <td class="label-col border-left-divider" style="width: 22%;">Student / Certificate ID</td>
            <td class="value-col" style="width: 28%; font-family: monospace;">${data.studentId || "PG4673109"}</td>
          </tr>
          <tr>
            <td class="label-col">Qualification</td>
            <td class="value-col">${data.qualification || "BSc (Hons) International Business"}</td>
            <td class="label-col border-left-divider">Level</td>
            <td class="value-col">${data.level || "Level 6 - Bachelor's Degree"}</td>
          </tr>
          <tr>
            <td class="label-col">Main Field of Study</td>
            <td class="value-col">${data.mainFieldOfStudy || "Business Studies"}</td>
            <td class="label-col border-left-divider">Language</td>
            <td class="value-col">${data.language || "English"}</td>
          </tr>
          <tr>
            <td class="label-col">Mode of Study</td>
            <td class="value-col">${data.modeOfStudy || "Online / Campus"}</td>
            <td class="label-col border-left-divider">Programme Length</td>
            <td class="value-col">${data.programmeLength || "3 Years"}</td>
          </tr>
          <tr>
            <td class="label-col">Credit Requirement</td>
            <td class="value-col">${data.creditRequirement || "120 UK Credits / 60 ECTS Credits"}</td>
            <td class="label-col border-left-divider">Date of Award</td>
            <td class="value-col">${dateAward}</td>
          </tr>
          <tr>
            <td class="label-col">Overall Average</td>
            <td class="value-col">${displayAverage}</td>
            <td class="label-col border-left-divider">Classification</td>
            <td class="value-col">${displayClassification}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 2: Modules Table -->
    <div>
      <h3 class="record-heading">RECORD OF LEARNING AND ACHIEVEMENT</h3>
      <div class="modules-table-container">
        <table class="modules-table">
          <thead>
            <tr>
              <th style="width: 12%;">Module Code</th>
              <th style="width: 50%;">Subject</th>
              <th style="width: 8%; text-align: center;">Level</th>
              <th style="width: 10%; text-align: center;">Marks (%)</th>
              <th style="width: 10%; text-align: center;">UK Credits</th>
              <th style="width: 10%; text-align: center;">ECTS Credits</th>
            </tr>
          </thead>
          <tbody>
            ${moduleRowsHtml}
          </tbody>
        </table>
        <div class="summary-bar">
          <div class="summary-item">
            <p>Overall Award Average</p>
            <p>${displayAverage}</p>
          </div>
          <div class="summary-item">
            <p>Overall Classification</p>
            <p>${displayClassification}</p>
          </div>
          <div class="summary-item">
            <p>Total UK Credits</p>
            <p>${totalUk}</p>
          </div>
          <div class="summary-item">
            <p>Total ECTS Credits</p>
            <p>${totalEcts}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Grading Scheme -->
    <div>
      <h4 class="scheme-heading">DEGREE GRADING SCHEME</h4>
      <p class="scheme-thresholds">
        70-100% First Class &nbsp;|&nbsp; 60-69% Upper Second Class &nbsp;|&nbsp; 50-59% Lower Second Class &nbsp;|&nbsp; 40-49% Third Class
      </p>
      <div class="cream-info-bar">
        <div class="cream-col">
          <p>Access to Further Study</p>
          <p>Postgraduate</p>
        </div>
        <div class="cream-col">
          <p>Certification Date</p>
          <p>${certDateSlash}</p>
        </div>
        <div class="cream-col">
          <p>Capacity</p>
          <p>Chairperson</p>
        </div>
      </div>
    </div>

    <!-- Section 4: Signatures, QR & Seal -->
    <div class="bottom-signatures">
      <div class="sig-block">
        <img src="${signDataUri}" alt="Authorised Signature" class="sig-img">
        <p class="sig-label">Authorised Signature</p>
      </div>

      <div class="qr-block">
        <div class="qr-box">
          <img src="${qrDataUri}" alt="Verification QR" class="qr-img">
        </div>
        <p class="qr-label">OFFICIAL VERIFICATION</p>
      </div>

      <div class="sig-block">
        <img src="${sealDataUri}" alt="Official Stamp" class="seal-img">
        <p class="sig-label">Official Stamp</p>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="bottom-footer">
      Progemini Academy &nbsp;|&nbsp; www.progemini.academy
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// 2. OFFICIAL CERTIFICATE OF COMPLETION HTML TEMPLATE
// ─────────────────────────────────────────────────────────────
export interface CertificatePdfData {
  studentName: string;
  courseTitle: string;
  grade?: string | null;
  issueDate?: string | Date | null;
  learningHours?: string | null;
  studentId?: string | null;
  certificateId?: string | null;
  encryptedToken?: string | null;
  verificationUrl?: string | null;
}

export async function generateCertificateHtml(data: CertificatePdfData): Promise<string> {
  const bgDataUri = getAssetAsBase64("certitifacte/progemini certificate templete.png");
  const crestDataUri = getAssetAsBase64("certitifacte/fab-icon.gif");
  const davidDataUri = getAssetAsBase64("certitifacte/david.png");
  const bakthDataUri = getAssetAsBase64("certitifacte/s.bakth.png");

  const formattedDate = formatDateOfAward(data.issueDate);

  const liveDomain = (
    process.env.LIVE_URL ||
    process.env.APP_URL ||
    "https://progemini.academy"
  ).replace(/\/+$/, "");

  const token =
    data.encryptedToken ||
    (data.verificationUrl && data.verificationUrl.includes("token=")
      ? data.verificationUrl.split("token=")[1].split("&")[0]
      : null);

  const targetUrl = token
    ? `${liveDomain}/credentials/verify?token=${encodeURIComponent(decodeURIComponent(token))}`
    : `${liveDomain}/credentials/verify?token=${encodeURIComponent(data.studentId || data.certificateId || "PG-CERT")}`;

  const qrDataUri = await QRCode.toDataURL(targetUrl, {
    width: 280,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const ornamentSvg = `
    <div style="display: flex; align-items: center; justify-content: center; width: 78%; margin: 0 auto; color: #c59b27;">
      <svg viewBox="0 0 340 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 20px;">
        <path d="M10 12H130M50 9C75 9 100 12 130 12M90 15C110 15 120 12 130 12" stroke="url(#goldGrad)" stroke-width="1.3" stroke-linecap="round"/>
        <g transform="translate(170, 12)">
          <path d="M0 -9L3.5 -3L9.5 0L3.5 3L0 9L-3.5 3L-9.5 0L-3.5 -3Z" fill="url(#goldGrad)"/>
          <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
          <path d="M-4 -3.5C-10 -8 -18 -4.5 -19 0C-18 4.5 -10 8 -4 3.5" stroke="url(#goldGrad)" stroke-width="1.1" fill="none"/>
          <path d="M4 -3.5C10 -8 18 -4.5 19 0C18 4.5 10 8 4 3.5" stroke="url(#goldGrad)" stroke-width="1.1" fill="none"/>
          <circle cx="-26" cy="0" r="2" fill="url(#goldGrad)" />
          <circle cx="-35" cy="0" r="1.3" fill="url(#goldGrad)" />
          <circle cx="26" cy="0" r="2" fill="url(#goldGrad)" />
          <circle cx="35" cy="0" r="1.3" fill="url(#goldGrad)" />
        </g>
        <path d="M210 12H330M210 12C240 12 265 9 290 9M210 12C220 12 230 15 250 15" stroke="url(#goldGrad)" stroke-width="1.3" stroke-linecap="round"/>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8c6218" />
            <stop offset="0.25" stop-color="#d4af37" />
            <stop offset="0.5" stop-color="#f7e599" />
            <stop offset="0.75" stop-color="#d4af37" />
            <stop offset="1" stop-color="#8c6218" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Certificate of Completion - Progemini Academy</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,400&family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Montserrat', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
      overflow: hidden;
    }

    .bg-template {
      position: absolute;
      top: 0;
      left: 0;
      width: 210mm;
      height: 297mm;
      object-fit: fill;
      z-index: 1;
      pointer-events: none;
    }

    .cert-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 210mm;
      height: 297mm;
      z-index: 10;
      padding: 16mm 18mm 32mm 18mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      box-sizing: border-box;
    }

    .cert-cinzel {
      font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
    }
    .cert-playfair {
      font-family: 'Playfair Display', Georgia, serif;
    }
    .cert-cormorant {
      font-family: 'Cormorant Garamond', Georgia, serif;
    }
    .cert-montserrat {
      font-family: 'Montserrat', sans-serif;
    }

    .cert-crest {
      width: 86px;
      height: 86px;
      object-fit: contain;
      margin: 0 auto 6px auto;
      display: block;
    }

    .cert-inst-title {
      font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
      font-weight: 800;
      color: #7a0019;
      font-size: 34px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      line-height: 1;
    }

    .cert-inst-sub {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      color: #7a0019;
      font-size: 15px;
      letter-spacing: 0.36em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .cert-motto {
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      color: #4b5563;
      font-size: 9.8px;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      margin-top: 3px;
    }

    .cert-main-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      color: #7a0019;
      font-size: 48px;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      line-height: 1;
    }

    .cert-completion-sub {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      color: #b8860b;
      font-size: 17px;
      letter-spacing: 0.30em;
      text-transform: uppercase;
      margin-top: 9px;
      line-height: 1.1;
    }

    .certify-statement {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      color: #374151;
      font-size: 11px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      margin-top: 18px;
      margin-bottom: 22px;
    }

    .student-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 900;
      color: #7a0019;
      font-size: 36px;
      letter-spacing: 0.02em;
      line-height: 1.25;
      padding-bottom: 2px;
      white-space: nowrap;
    }

    .gold-underline {
      width: 72%;
      height: 2px;
      background-color: #c59b27;
      margin: 16px auto 22px auto;
    }

    .coursework-text {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic;
      color: #374151;
      font-size: 21px; /* explicitly 3px larger for optimal presence and elegance */
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.55;
    }

    .course-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      color: #7a0019;
      font-size: 25px;
      letter-spacing: 0.01em;
      line-height: 1.25;
      margin-top: 20px;
    }

    .grade-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 600;
      color: #7a0019;
      font-size: 16px;
      margin-top: 5px;
    }

    /* Meta details */
    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      margin-bottom: 16px;
    }

    .meta-col {
      flex: 1;
      text-align: center;
    }

    .meta-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      color: #4b5563;
      font-size: 9.5px;
      letter-spacing: 0.20em;
      text-transform: uppercase;
    }

    .meta-val {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      color: #7a0019;
      font-size: 16px;
      margin-top: 3px;
    }

    .meta-divider {
      height: 24px;
      width: 1px;
      background: #d1d5db;
    }

    /* Signatures & Dynamic QR */
    .signatures-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 28px;
    }

    .cert-sig-block {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 180px;
    }

    .cert-sig-img {
      height: 44px;
      width: 100%;
      object-fit: contain;
      object-position: bottom;
      margin-bottom: 4px;
    }

    .cert-sig-line {
      width: 100%;
      border-top: 1px solid #1f2937;
      padding-top: 4px;
      text-align: center;
    }

    .cert-sig-text {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      color: #1f2937;
      font-size: 8.8px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .cert-qr-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
    }

    .cert-qr-box {
      padding: 3px;
      background: #ffffff;
      border: 1px solid rgba(184, 134, 11, 0.4);
      border-radius: 4px;
    }

    .cert-qr-img {
      width: 78px;
      height: 78px;
      display: block;
    }

    .cert-qr-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      color: #7a0019;
      font-size: 7.8px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      margin-top: 3px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <img src="${bgDataUri}" alt="Border Template" class="bg-template">
  
  <div class="cert-content">
    <!-- Header Crest & Institution -->
    <div>
      <img src="${crestDataUri}" alt="Progemini Crest" class="cert-crest">
      <h1 class="cert-inst-title">PROGEMINI</h1>
      <p class="cert-inst-sub">ACADEMY</p>
      <p class="cert-motto">EDUCATE &middot; EMPOWER &middot; EXCEL</p>
    </div>

    <!-- Title Section with Gold Ornaments -->
    <div style="margin: 8px 0;">
      <div style="margin-bottom: 7px;">${ornamentSvg}</div>
      <h2 class="cert-main-title">CERTIFICATE</h2>
      <p class="cert-completion-sub">OF COMPLETION</p>
      <div style="margin-top: 9px;">${ornamentSvg}</div>
    </div>

    <!-- Certification Body -->
    <div style="margin-top: 14px; margin-bottom: auto;">
      <p class="certify-statement">THIS IS TO CERTIFY THAT</p>
      <div>
        <h3 class="student-name">${data.studentName || "Abir Md Rezwan Ahmed"}</h3>
        <div class="gold-underline"></div>
      </div>
      <p class="coursework-text">
        has successfully completed the required coursework and demonstrated outstanding dedication and performance in
      </p>
      <div style="margin-top: 20px;">
        <h4 class="course-title">${data.courseTitle || "BSc (Hons) International Business"}</h4>
        ${data.grade ? `<p class="grade-text">${data.grade}</p>` : ""}
      </div>
    </div>

    <!-- Metadata & Signatures -->
    <div>
      <div class="meta-row">
        <div class="meta-col">
          <p class="meta-label">DATE OF ISSUE</p>
          <p class="meta-val">${formattedDate}</p>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-col">
          <p class="meta-label">LEARNING HOURS</p>
          <p class="meta-val">${data.learningHours || "As per programme"}</p>
        </div>
      </div>

      <div class="signatures-row">
        <!-- Academic Director -->
        <div class="cert-sig-block">
          <img src="${davidDataUri}" alt="Academic Director Signature" class="cert-sig-img">
          <div class="cert-sig-line">
            <p class="cert-sig-text">ACADEMIC DIRECTOR</p>
          </div>
        </div>

        <!-- Verification QR Code -->
        <div class="cert-qr-block">
          <div class="cert-qr-box">
            <img src="${qrDataUri}" alt="Verification QR" class="cert-qr-img">
          </div>
          <p class="cert-qr-label">OFFICIAL VERIFICATION</p>
        </div>

        <!-- Chief Executive Officer - strictly 1 line -->
        <div class="cert-sig-block">
          <img src="${bakthDataUri}" alt="Chief Executive Officer Signature" class="cert-sig-img">
          <div class="cert-sig-line">
            <p class="cert-sig-text">CHIEF EXECUTIVE OFFICER</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
