"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface MarksheetModule {
  code: string;
  subject: string;
  level: string | number;
  marks: number;
  ukCredits: number;
  ectsCredits: number;
}

export interface ProgeminiMarkSheetProps {
  id?: string;
  // Dynamic fields from Student Profile
  studentName: string;
  studentId: string;
  qualification: string;
  mainFieldOfStudy: string;
  issueDate?: string | Date | null; // Date of Award & Certification Date (Unified)

  // Marksheet specifics (managed by admin, stored in DB)
  level?: string;
  language?: string;
  modeOfStudy?: string;
  programmeLength?: string;
  creditRequirement?: string;
  overallAverage?: string;
  classification?: string;
  totalUkCredits?: number;
  totalEctsCredits?: number;
  modules?: MarksheetModule[];

  // Verification & QR code props
  encryptedToken?: string | null;
  verificationUrl?: string | null;

  className?: string;
}

/**
 * Format date like "30 September 2026"
 */
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

/**
 * Format date like "30/09/2026"
 */
function formatCertificationDateSlash(dateInput?: string | Date | null): string {
  if (!dateInput) return "30/09/2026";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      // If already in DD/MM/YYYY or similar
      return String(dateInput);
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

export const ProgeminiMarkSheet = forwardRef<HTMLDivElement, ProgeminiMarkSheetProps>(
  (
    {
      id = "progemini-official-marksheet",
      studentName,
      studentId,
      qualification,
      mainFieldOfStudy,
      issueDate,
      level = "Level 6 - Bachelor's Degree",
      language = "English",
      modeOfStudy = "Online / Campus",
      programmeLength = "3 Years",
      creditRequirement = "120 UK Credits / 60 ECTS Credits",
      overallAverage,
      classification,
      totalUkCredits,
      totalEctsCredits,
      modules = [],
      encryptedToken,
      verificationUrl,
      className = "",
    },
    ref
  ) => {
    // Compute live verification URL to encode in QR code
    const liveDomain = (
      process.env.NEXT_PUBLIC_LIVE_URL ||
      (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_APP_URL
        : "https://progemini.academy")
    ).replace(/\/+$/, "");

    const token =
      encryptedToken ||
      (verificationUrl && verificationUrl.includes("token=")
        ? verificationUrl.split("token=")[1].split("&")[0]
        : null);

    const targetUrl = token
      ? `${liveDomain}/credentials/verify?token=${encodeURIComponent(decodeURIComponent(token))}`
      : `${liveDomain}/credentials/verify?token=${encodeURIComponent(studentId || "PG-MARKSHEET")}`;

    // Calculate defaults if not explicitly provided
    const computedTotalUk =
      totalUkCredits !== undefined && totalUkCredits !== null
        ? totalUkCredits
        : modules.reduce((acc, m) => acc + (Number(m.ukCredits) || 0), 0);

    const computedTotalEcts =
      totalEctsCredits !== undefined && totalEctsCredits !== null
        ? totalEctsCredits
        : modules.reduce((acc, m) => acc + (Number(m.ectsCredits) || 0), 0);

    const computedAvgNum =
      modules.length > 0
        ? Math.round(modules.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) / modules.length)
        : 62;

    const displayAverage = overallAverage || `${computedAvgNum}%`;

    const getClassificationFromAvg = (avgStr: string) => {
      const num = parseInt(avgStr.replace(/[^0-9]/g, ""), 10);
      if (isNaN(num)) return "Upper Second Class";
      if (num >= 70) return "First Class";
      if (num >= 60) return "Upper Second Class";
      if (num >= 50) return "Lower Second Class";
      if (num >= 40) return "Third Class";
      return "Pass";
    };

    const displayClassification =
      classification || getClassificationFromAvg(displayAverage);

    const dateOfAwardFormatted = formatDateOfAward(issueDate);
    const certDateSlashFormatted = formatCertificationDateSlash(issueDate);

    return (
      <div
        ref={ref}
        id={id}
        className={`marksheet-container relative mx-auto bg-white text-gray-900 overflow-hidden select-none print:shadow-none ${className}`}
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "800 / 1131.42", // Canonical A4 portrait ratio
          boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.22)",
        }}
      >
        {/* Container Query & Font Styles */}
        <style jsx global>{`
          .marksheet-container {
            container-type: inline-size;
          }
          .marksheet-serif {
            font-family: 'Playfair Display', 'Cinzel', Georgia, 'Times New Roman', serif;
          }
          .marksheet-cinzel {
            font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
          }
          .marksheet-sans {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        {/* Outer Golden Perimeter Border */}
        <div className="absolute inset-[1.6cqw] border-[2px] border-[#c59b27] pointer-events-none z-20" />

        {/* Inner Content Layer with Standard A4 Insets */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between px-[3.6cqw] pt-[2.4cqw] pb-[2.2cqw]">
          {/* ════════════════════ TOP HEADER & CREST ════════════════════ */}
          <div className="flex flex-col items-center text-center">
            {/* Progemini Academy Crest */}
            <div className="w-[10cqw] max-w-[80px] h-[10cqw] max-h-[80px] mb-[0.4cqw]">
              <img
                src="/logo.png"
                alt="Progemini Academy"
                className="w-full h-full object-contain mx-auto"
                crossOrigin="anonymous"
              />
            </div>

            {/* Institution Typography */}
            <h1 className="marksheet-serif font-black text-[#7a0019] text-[3.4cqw] tracking-[0.16em] uppercase leading-tight">
              PROGEMINI
            </h1>
            <p className="marksheet-serif font-bold text-[#7a0019] text-[1.75cqw] tracking-[0.32em] uppercase mt-[0.2cqw] leading-tight">
              ACADEMY
            </p>
            <p className="marksheet-sans font-semibold text-[#1f2937] text-[1.02cqw] tracking-[0.24em] uppercase mt-[0.25cqw] leading-tight">
              EDUCATE &middot; EMPOWER &middot; EXCEL
            </p>

            {/* Document Title */}
            <h2 className="marksheet-serif font-black text-[#7a0019] text-[3.6cqw] tracking-[0.06em] uppercase mt-[1.0cqw] leading-tight">
              OFFICIAL MARK SHEET
            </h2>

            {/* Programme / Qualification Subtitle */}
            <p className="marksheet-serif font-bold text-[#b8860b] text-[2.4cqw] tracking-[0.02em] mt-[0.2cqw] leading-tight">
              {qualification || "BSc (Hons) International Business"}
            </p>
          </div>

          {/* ════════════════════ SECTION 1: STUDENT & AWARD DETAILS ════════════════════ */}
          <div className="mt-[1.2cqw]">
            {/* Gold Header Bar */}
            <div className="w-full bg-[#b8860b] py-[0.5cqw] px-[1.2cqw]">
              <h3 className="marksheet-sans font-bold text-white text-[1.7cqw] tracking-[0.05em] uppercase leading-snug">
                STUDENT & AWARD DETAILS
              </h3>
            </div>

            {/* Solid HTML Table - Eliminates grid overlap and clipping in html2canvas */}
            <table className="w-full border-collapse text-[1.3cqw] leading-[1.4] border-b border-[#e5e7eb]">
              <tbody>
                <tr className="border-b border-[#e5e7eb]">
                  <td className="w-[18%] py-[0.4cqw] pr-[0.4cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle">
                    Student Name
                  </td>
                  <td className="w-[32%] py-[0.4cqw] pr-[1cqw] font-medium text-[#111827] align-middle">
                    {studentName || "Abir Md Rezwan Ahmed"}
                  </td>
                  <td className="w-[20%] py-[0.4cqw] px-[0.6cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle border-l border-[#e5e7eb]">
                    Student / Certificate ID
                  </td>
                  <td className="w-[30%] py-[0.4cqw] pl-[0.6cqw] font-medium text-[#111827] font-mono align-middle">
                    {studentId || "PG4673109"}
                  </td>
                </tr>
                <tr className="border-b border-[#e5e7eb]">
                  <td className="py-[0.4cqw] pr-[0.4cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle">
                    Qualification
                  </td>
                  <td className="py-[0.4cqw] pr-[1cqw] font-medium text-[#111827] align-middle">
                    {qualification || "BSc (Hons) International Business"}
                  </td>
                  <td className="py-[0.4cqw] px-[0.6cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle border-l border-[#e5e7eb]">
                    Level
                  </td>
                  <td className="py-[0.4cqw] pl-[0.6cqw] font-medium text-[#111827] align-middle">
                    {level || "Level 6 - Bachelor's Degree"}
                  </td>
                </tr>
                <tr className="border-b border-[#e5e7eb]">
                  <td className="py-[0.4cqw] pr-[0.4cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle">
                    Main Field of Study
                  </td>
                  <td className="py-[0.4cqw] pr-[1cqw] font-medium text-[#111827] align-middle">
                    {mainFieldOfStudy || "Business Studies"}
                  </td>
                  <td className="py-[0.4cqw] px-[0.6cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle border-l border-[#e5e7eb]">
                    Language
                  </td>
                  <td className="py-[0.4cqw] pl-[0.6cqw] font-medium text-[#111827] align-middle">
                    {language || "English"}
                  </td>
                </tr>
                <tr className="border-b border-[#e5e7eb]">
                  <td className="py-[0.4cqw] pr-[0.4cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle">
                    Mode of Study
                  </td>
                  <td className="py-[0.4cqw] pr-[1cqw] font-medium text-[#111827] align-middle">
                    {modeOfStudy || "Online / Campus"}
                  </td>
                  <td className="py-[0.4cqw] px-[0.6cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle border-l border-[#e5e7eb]">
                    Programme Length
                  </td>
                  <td className="py-[0.4cqw] pl-[0.6cqw] font-medium text-[#111827] align-middle">
                    {programmeLength || "3 Years"}
                  </td>
                </tr>
                <tr className="border-b border-[#e5e7eb]">
                  <td className="py-[0.4cqw] pr-[0.4cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle">
                    Credit Requirement
                  </td>
                  <td className="py-[0.4cqw] pr-[1cqw] font-medium text-[#111827] align-middle">
                    {creditRequirement || "120 UK Credits / 60 ECTS Credits"}
                  </td>
                  <td className="py-[0.4cqw] px-[0.6cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle border-l border-[#e5e7eb]">
                    Date of Award
                  </td>
                  <td className="py-[0.4cqw] pl-[0.6cqw] font-medium text-[#111827] align-middle">
                    {dateOfAwardFormatted}
                  </td>
                </tr>
                <tr>
                  <td className="py-[0.4cqw] pr-[0.4cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle">
                    Overall Average
                  </td>
                  <td className="py-[0.4cqw] pr-[1cqw] font-medium text-[#111827] align-middle">
                    {displayAverage}
                  </td>
                  <td className="py-[0.4cqw] px-[0.6cqw] font-bold text-[#7a0019] whitespace-nowrap align-middle border-l border-[#e5e7eb]">
                    Classification
                  </td>
                  <td className="py-[0.4cqw] pl-[0.6cqw] font-medium text-[#111827] align-middle">
                    {displayClassification}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ════════════════════ SECTION 2: RECORD OF LEARNING AND ACHIEVEMENT ════════════════════ */}
          <div className="mt-[1.3cqw]">
            {/* Red Serif Section Heading */}
            <h3 className="marksheet-serif font-black text-[#7a0019] text-[2.1cqw] tracking-[0.05em] uppercase mb-[0.6cqw]">
              RECORD OF LEARNING AND ACHIEVEMENT
            </h3>

            {/* Modules Table */}
            <div className="w-full border border-[#7a0019] overflow-hidden">
              <table className="w-full text-left border-collapse">
                {/* Burgundy Header Row */}
                <thead>
                  <tr className="bg-[#7a0019] text-white text-[1.28cqw] font-bold">
                    <th className="py-[0.55cqw] px-[0.8cqw] w-[11%]">Module Code</th>
                    <th className="py-[0.55cqw] px-[0.8cqw] w-[51%]">Subject</th>
                    <th className="py-[0.55cqw] px-[0.8cqw] w-[8%] text-center">Level</th>
                    <th className="py-[0.55cqw] px-[0.8cqw] w-[10%] text-center">Marks (%)</th>
                    <th className="py-[0.55cqw] px-[0.8cqw] w-[10%] text-center">UK Credits</th>
                    <th className="py-[0.55cqw] px-[0.8cqw] w-[10%] text-center">ECTS Credits</th>
                  </tr>
                </thead>
                {/* Modular Rows */}
                <tbody className="divide-y divide-[#e5e7eb] text-[1.28cqw] text-[#1f2937]">
                  {modules.map((m, idx) => (
                    <tr
                      key={m.code || idx}
                      className={idx % 2 === 1 ? "bg-[#fbfbfb]" : "bg-white"}
                    >
                      <td className="py-[0.45cqw] px-[0.8cqw] font-semibold text-[#111827] border-r border-[#e5e7eb]">
                        {m.code}
                      </td>
                      <td className="py-[0.45cqw] px-[0.8cqw] font-medium border-r border-[#e5e7eb]">
                        {m.subject}
                      </td>
                      <td className="py-[0.45cqw] px-[0.8cqw] text-center border-r border-[#e5e7eb]">
                        {m.level}
                      </td>
                      <td className="py-[0.45cqw] px-[0.8cqw] text-center font-bold text-[#111827] border-r border-[#e5e7eb]">
                        {m.marks}
                      </td>
                      <td className="py-[0.45cqw] px-[0.8cqw] text-center border-r border-[#e5e7eb]">
                        {m.ukCredits}
                      </td>
                      <td className="py-[0.45cqw] px-[0.8cqw] text-center">{m.ectsCredits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Gold Summary Row */}
              <div className="bg-[#b8860b] text-white py-[0.5cqw] px-[1.2cqw] border-t-2 border-[#b8860b]">
                <div className="grid grid-cols-4 text-center">
                  <div>
                    <p className="text-[1.05cqw] font-medium leading-tight">Overall Award Average</p>
                    <p className="text-[1.7cqw] font-extrabold leading-tight mt-[0.15cqw]">
                      {displayAverage}
                    </p>
                  </div>
                  <div>
                    <p className="text-[1.05cqw] font-medium leading-tight">Overall Classification</p>
                    <p className="text-[1.7cqw] font-extrabold leading-tight mt-[0.15cqw]">
                      {displayClassification}
                    </p>
                  </div>
                  <div>
                    <p className="text-[1.05cqw] font-medium leading-tight">Total UK Credits</p>
                    <p className="text-[1.7cqw] font-extrabold leading-tight mt-[0.15cqw]">
                      {computedTotalUk}
                    </p>
                  </div>
                  <div>
                    <p className="text-[1.05cqw] font-medium leading-tight">Total ECTS Credits</p>
                    <p className="text-[1.7cqw] font-extrabold leading-tight mt-[0.15cqw]">
                      {computedTotalEcts}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Underline accent beneath summary */}
            <div className="w-full h-[1.5px] bg-[#b8860b] mt-[0.2cqw]" />
          </div>

          {/* ════════════════════ SECTION 3: DEGREE GRADING SCHEME ════════════════════ */}
          <div className="mt-[1.3cqw] text-center">
            {/* Heading */}
            <h4 className="marksheet-serif font-black text-[#7a0019] text-[1.95cqw] tracking-[0.06em] uppercase">
              DEGREE GRADING SCHEME
            </h4>

            {/* Scheme Thresholds */}
            <p className="marksheet-sans text-[1.2cqw] font-medium text-[#374151] mt-[0.25cqw]">
              70-100% First Class &nbsp;|&nbsp; 60-69% Upper Second Class &nbsp;|&nbsp; 50-59% Lower Second Class &nbsp;|&nbsp; 40-49% Third Class
            </p>

            {/* Cream Bar Information Grid */}
            <div className="w-full bg-[#fbf7ee] py-[0.5cqw] px-[2cqw] mt-[0.5cqw]">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-[#7a0019] font-bold text-[1.25cqw]">Access to Further Study</p>
                  <p className="text-[#1f2937] font-medium text-[1.3cqw] mt-[0.15cqw]">
                    Postgraduate
                  </p>
                </div>
                <div>
                  <p className="text-[#7a0019] font-bold text-[1.25cqw]">Certification Date</p>
                  <p className="text-[#1f2937] font-medium text-[1.3cqw] mt-[0.15cqw]">
                    {certDateSlashFormatted}
                  </p>
                </div>
                <div>
                  <p className="text-[#7a0019] font-bold text-[1.25cqw]">Capacity</p>
                  <p className="text-[#1f2937] font-medium text-[1.3cqw] mt-[0.15cqw]">
                    Chairperson
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════ SECTION 4: AUTHORISED SIGNATURE, VERIFICATION QR & OFFICIAL STAMP ════════════════════ */}
          <div className="mt-[1.2cqw] flex items-end justify-between px-[1.2cqw]">
            {/* Left: Authorised Signature (Pushed left) */}
            <div className="flex flex-col items-center text-center w-[30%]">
              <div className="h-[6.5cqw] max-h-[55px] flex items-end justify-center mb-[0.3cqw]">
                <img
                  src="/certitifacte/e.marphy.png"
                  alt="Authorised Signature"
                  className="max-h-full max-w-[155px] object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="marksheet-sans font-bold text-[#7a0019] text-[1.3cqw] tracking-wide whitespace-nowrap">
                Authorised Signature
              </p>
            </div>

            {/* Middle: Official Verification QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-[0.38cqw] bg-white border border-[#b8860b]/40 rounded-[0.6cqw] shadow-xs">
                <QRCodeSVG
                  value={targetUrl}
                  size={90}
                  level="M"
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  className="w-[10.5cqw] h-[10.5cqw] max-w-[82px] max-h-[82px]"
                />
              </div>
              <p className="marksheet-sans font-bold text-[#7a0019] text-[0.98cqw] tracking-[0.14em] uppercase mt-[0.35cqw] whitespace-nowrap">
                OFFICIAL VERIFICATION
              </p>
            </div>

            {/* Right: Official Stamp (Pushed right) */}
            <div className="flex flex-col items-center text-center w-[30%]">
              <div className="h-[11cqw] max-h-[92px] w-[11cqw] max-w-[92px] flex items-center justify-center mb-[0.25cqw]">
                <img
                  src="/certitifacte/academy-seal.png"
                  alt="Official Stamp"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="marksheet-sans font-bold text-[#7a0019] text-[1.3cqw] tracking-wide whitespace-nowrap">
                Official Stamp
              </p>
            </div>
          </div>

          {/* ════════════════════ BOTTOM FOOTER ════════════════════ */}
          <div className="mt-[1.2cqw] pt-[0.8cqw] border-t border-[#e5e7eb] text-center">
            <p className="marksheet-sans text-[1.12cqw] font-medium text-[#4b5563] tracking-wide">
              Progemini Academy &nbsp;|&nbsp; www.progemini.academy
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ProgeminiMarkSheet.displayName = "ProgeminiMarkSheet";
export default ProgeminiMarkSheet;
