"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface ProgeminiCertificateProps {
  id?: string;
  studentName: string;
  courseTitle: string;
  grade?: string | null;
  issueDate: string | Date;
  learningHours?: string | null;
  studentId?: string | null;
  certificateId?: string | null;
  encryptedToken?: string | null;
  verificationUrl?: string | null;
  isPublished?: boolean;
  className?: string;
}

/**
 * Format date like "28 September 2026"
 */
function formatCertificateDate(dateInput: string | Date): string {
  try {
    if (!dateInput) return "28 September 2026";
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
 * Decorative Filigree Flourish SVG Ornament (Gold)
 * Exact replication of the ornamental flourish dividers from the official certificate reference
 */
function GoldOrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center w-[78%] mx-auto text-[#c59b27] ${className}`}>
      <svg
        viewBox="0 0 340 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-[2.2cqw] max-h-[22px]"
      >
        {/* Left gold flourish line */}
        <path
          d="M10 12H130M50 9C75 9 100 12 130 12M90 15C110 15 120 12 130 12"
          stroke="url(#goldGrad)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Center emblem: 4-petal floral / diamond crest with scrollwork */}
        <g transform="translate(170, 12)">
          {/* Central diamond */}
          <path
            d="M0 -9L3.5 -3L9.5 0L3.5 3L0 9L-3.5 3L-9.5 0L-3.5 -3Z"
            fill="url(#goldGrad)"
          />
          <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
          {/* Side ornamental leaf curves */}
          <path
            d="M-4 -3.5C-10 -8 -18 -4.5 -19 0C-18 4.5 -10 8 -4 3.5"
            stroke="url(#goldGrad)"
            strokeWidth="1.1"
            fill="none"
          />
          <path
            d="M4 -3.5C10 -8 18 -4.5 19 0C18 4.5 10 8 4 3.5"
            stroke="url(#goldGrad)"
            strokeWidth="1.1"
            fill="none"
          />
          {/* Accent side dots */}
          <circle cx="-26" cy="0" r="2" fill="url(#goldGrad)" />
          <circle cx="-35" cy="0" r="1.3" fill="url(#goldGrad)" />
          <circle cx="26" cy="0" r="2" fill="url(#goldGrad)" />
          <circle cx="35" cy="0" r="1.3" fill="url(#goldGrad)" />
        </g>

        {/* Right gold flourish line */}
        <path
          d="M210 12H330M210 12C240 12 265 9 290 9M210 12C220 12 230 15 250 15"
          stroke="url(#goldGrad)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8c6218" />
            <stop offset="0.25" stopColor="#d4af37" />
            <stop offset="0.5" stopColor="#f7e599" />
            <stop offset="0.75" stopColor="#d4af37" />
            <stop offset="1" stopColor="#8c6218" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export const ProgeminiCertificate = forwardRef<HTMLDivElement, ProgeminiCertificateProps>(
  (
    {
      id = "progemini-official-certificate",
      studentName,
      courseTitle,
      grade = "Upper Second Class",
      issueDate,
      learningHours = "As per programme",
      studentId = "2301-IBM-0001",
      certificateId = "PG4673109",
      encryptedToken,
      verificationUrl,
      isPublished = true,
      className = "",
    },
    ref
  ) => {
    const formattedDate = formatCertificateDate(issueDate);

    // Compute live verification URL to encode in QR code
    const liveDomain = (
      process.env.NEXT_PUBLIC_LIVE_URL ||
      (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_APP_URL
        : "https://progemini.academy")
    ).replace(/\/+$/, "");

    // Encrypted verification URL encoded in the QR code:
    // Outsiders cannot guess or dial URLs manually without scanning the QR code,
    // while keeping the payload compact (~45 chars) for rapid, effortless mobile scanning.
    const token =
      encryptedToken ||
      (verificationUrl && verificationUrl.includes("token=")
        ? verificationUrl.split("token=")[1].split("&")[0]
        : null);

    const targetUrl = token
      ? `${liveDomain}/credentials/verify?token=${encodeURIComponent(decodeURIComponent(token))}`
      : `${liveDomain}/credentials/verify?token=${encodeURIComponent(studentId || certificateId || "PG-CERT")}`;

    return (
      <div
        ref={ref}
        id={id}
        className={`cert-container relative mx-auto bg-white overflow-hidden select-none print:shadow-none ${className}`}
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "800 / 1131.42", // Exact standard A4 portrait ratio (1 : 1.41428)
          backgroundImage: "url('/certitifacte/progemini certificate templete.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.22)",
        }}
      >
        {/* Container-Query & Typography Styles */}
        <style jsx global>{`
          .cert-container {
            container-type: inline-size;
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
        `}</style>

        {/* 1. Background Template Image with Gold Borders and Burgundy Corners (Ensures exact fit in PDF & canvas) */}
        <img
          src="/certitifacte/progemini certificate templete.png"
          alt="Certificate Border Template"
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "fill",
            display: "block",
          }}
          crossOrigin="anonymous"
        />

        {/* 2. Certificate Content Layer - Evenly distributed without large dead spaces */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between px-[7.5cqw] pt-[5.2cqw] pb-[12.5cqw] text-center">
          {/* ───────────────── TOP HEADER & CREST ───────────────── */}
          <div className="flex flex-col items-center">
            {/* Progemini Logo / Crest Icon (Enlarged and grand) */}
            <div className="w-[13.5cqw] h-[13.5cqw] max-w-[108px] max-h-[108px] relative mb-[0.8cqw]">
              <img
                src="/certitifacte/fab-icon.gif"
                alt="Progemini Academy Crest"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Institution Title */}
            <h1 className="cert-cinzel font-extrabold text-[#7a0019] text-[4.5cqw] tracking-[0.16em] uppercase leading-none">
              PROGEMINI
            </h1>
            <p className="cert-cinzel font-bold text-[#7a0019] text-[1.95cqw] tracking-[0.36em] uppercase mt-[0.5cqw]">
              ACADEMY
            </p>
            <p className="cert-montserrat font-medium text-[#4b5563] text-[1.3cqw] tracking-[0.26em] uppercase mt-[0.4cqw]">
              EDUCATE &middot; EMPOWER &middot; EXCEL
            </p>
          </div>

          {/* ───────────────── TITLE SECTION WITH BALANCED GOLD ORNAMENTS ───────────────── */}
          <div className="flex flex-col items-center justify-center my-[1.0cqw]">
            {/* Top Ornamental Divider */}
            <div className="w-full flex items-center justify-center mb-[0.9cqw]">
              <GoldOrnamentDivider />
            </div>

            {/* Certificate of Completion Heading */}
            <h2 className="cert-playfair font-black text-[#7a0019] text-[6.5cqw] tracking-[0.07em] uppercase leading-none">
              CERTIFICATE
            </h2>
            <p className="cert-cinzel font-bold text-[#b8860b] text-[2.3cqw] tracking-[0.30em] uppercase mt-[1.4cqw] leading-tight">
              OF COMPLETION
            </p>

            {/* Bottom Ornamental Divider (Equidistant from OF COMPLETION) */}
            <div className="w-full flex items-center justify-center mt-[1.2cqw]">
              <GoldOrnamentDivider />
            </div>
          </div>

          {/* ───────────────── CERTIFICATION BODY (Generous Spacing & Balanced Breathing Room) ───────────────── */}
          <div className="mt-[2.4cqw] mb-auto py-[0.5cqw]">
            {/* "THIS IS TO CERTIFY THAT" with generous spacing above and below */}
            <p className="cert-montserrat font-semibold text-[#374151] text-[1.45cqw] tracking-[0.28em] uppercase mb-[3.4cqw]">
              THIS IS TO CERTIFY THAT
            </p>

            {/* Student Full Name & Clean Gold Underline - Fully Visible Headroom, Zero Clipping */}
            <div className="w-full max-w-[90%] mx-auto">
              <h3 className="cert-playfair font-black text-[#7a0019] text-[4.8cqw] tracking-wide leading-[1.35] pb-[0.4cqw] whitespace-nowrap">
                {studentName || "Abir Md Rezwan Ahmed"}
              </h3>
              {/* Official Gold Accent Rule with generous vertical margins */}
              <div className="w-[74%] h-[2px] bg-[#c59b27] mx-auto mt-[2.5cqw] mb-[3.8cqw]" />
            </div>

            {/* Accompanying statement (3px larger for enhanced legibility and presence) */}
            <p
              id="cert-coursework-statement"
              className="cert-cormorant cert-statement italic text-[#374151] text-[2.48cqw] max-w-[72cqw] mx-auto leading-[1.65]"
              style={{ fontSize: "calc(2.1cqw + 3px)" }}
            >
              has successfully completed the required coursework and demonstrated outstanding
              dedication and performance in
            </p>

            {/* Course / Degree Title with generous spacing */}
            <div className="mt-[3.2cqw]">
              <h4 className="cert-playfair font-bold text-[#7a0019] text-[3.4cqw] tracking-wide leading-snug">
                {courseTitle || "BSc (Hons) International Business"}
              </h4>
              {/* Honors / Classification */}
              {grade && (
                <p className="cert-playfair font-semibold text-[#7a0019] text-[2.2cqw] mt-[0.8cqw]">
                  {grade}
                </p>
              )}
            </div>
          </div>

          {/* ───────────────── METADATA & SIGNATURES SECTION (Elevated Higher) ───────────────── */}
          <div className="pt-[0.6cqw]">
            {/* Row 1: Issue Date & Learning Hours */}
            <div className="flex items-center justify-between px-[6cqw] text-center mb-[2cqw]">
              {/* Date of Issue */}
              <div className="flex-1 text-center">
                <p className="cert-montserrat font-bold text-[#4b5563] text-[1.3cqw] tracking-[0.20em] uppercase">
                  DATE OF ISSUE
                </p>
                <p className="cert-playfair font-bold text-[#7a0019] text-[2.2cqw] mt-[0.4cqw]">
                  {formattedDate}
                </p>
              </div>

              {/* Vertical Divider */}
              <div className="h-[3.4cqw] w-[1px] bg-[#d1d5db]" />

              {/* Learning Hours */}
              <div className="flex-1 text-center">
                <p className="cert-montserrat font-bold text-[#4b5563] text-[1.3cqw] tracking-[0.20em] uppercase">
                  LEARNING HOURS
                </p>
                <p className="cert-playfair font-bold text-[#7a0019] text-[2.2cqw] mt-[0.4cqw]">
                  {learningHours || "As per programme"}
                </p>
              </div>
            </div>

            {/* Row 2: Signatures with Large Dynamic QR Code (Raised Upwards with High Clearance) */}
            <div className="flex items-end justify-between px-[4.5cqw] pt-[0.4cqw]">
              {/* Left Signature: Academic Director (david.png) */}
              <div className="flex-1 flex flex-col items-center max-w-[26cqw]">
                <div className="h-[5.8cqw] max-h-[54px] w-full relative mb-[0.6cqw]">
                  <img
                    src="/certitifacte/david.png"
                    alt="Academic Director Signature"
                    className="w-full h-full object-contain object-bottom"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="w-full border-t border-[#1f2937] pt-[0.5cqw] text-center">
                  <p className="cert-montserrat font-semibold text-[#1f2937] text-[1.15cqw] tracking-[0.12em] uppercase whitespace-nowrap">
                    ACADEMIC DIRECTOR
                  </p>
                </div>
              </div>

              {/* Middle: Official Verification QR Code (Clean, High-Scannability Structure) */}
              <div className="flex flex-col items-center justify-center px-[1.5cqw]">
                <div className="p-[0.5cqw] bg-white border border-[#b8860b]/40 rounded-[0.8cqw] shadow-xs">
                  <QRCodeSVG
                    value={targetUrl}
                    size={100}
                    level="M"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    className="w-[12.5cqw] h-[12.5cqw] max-w-[98px] max-h-[98px]"
                  />
                </div>
                <p className="cert-montserrat font-bold text-[#7a0019] text-[1.1cqw] tracking-[0.16em] uppercase mt-[0.5cqw] whitespace-nowrap">
                  OFFICIAL VERIFICATION
                </p>
              </div>

              {/* Right Signature: Chief Executive Officer (s.bakth.png) - strictly 1 line */}
              <div className="flex-1 flex flex-col items-center max-w-[26cqw]">
                <div className="h-[5.8cqw] max-h-[54px] w-full relative mb-[0.6cqw]">
                  <img
                    src="/certitifacte/s.bakth.png"
                    alt="Chief Executive Officer Signature"
                    className="w-full h-full object-contain object-bottom"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="w-full border-t border-[#1f2937] pt-[0.5cqw] text-center">
                  <p className="cert-montserrat font-semibold text-[#1f2937] text-[1.12cqw] tracking-[0.08em] uppercase whitespace-nowrap">
                    CHIEF EXECUTIVE OFFICER
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProgeminiCertificate.displayName = "ProgeminiCertificate";

export default ProgeminiCertificate;
