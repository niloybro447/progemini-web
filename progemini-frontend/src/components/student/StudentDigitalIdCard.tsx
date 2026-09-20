"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  FaCheckCircle,
  FaQrcode,
  FaPrint,
  FaShieldAlt,
  FaGraduationCap,
  FaCalendarAlt,
  FaIdCard,
  FaUser,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaUniversity,
} from "react-icons/fa";
import { getFileUrl } from "@/lib/utils";

interface StudentDigitalIdCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    studentProfile?: {
      studentId?: string | null;
      program?: string | null;
      startedSemester?: string | null;
      startedYear?: string | null;
      nationality?: string | null;
    } | null;
  };
  onPhotoClick?: () => void;
}

export default function StudentDigitalIdCard({ user, onPhotoClick }: StudentDigitalIdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const sp = user.studentProfile || {};
  const studentId = sp.studentId || "PG-STUDENT";
  const program = sp.program || "Academic Programme";
  const intake = `${sp.startedSemester || ""} ${sp.startedYear || ""}`.trim() || "Enrolled";

  // Official live domain for credential verification
  const liveDomain = (
    process.env.NEXT_PUBLIC_LIVE_URL ||
    (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://progemini.academy")
  ).replace(/\/+$/, "");

  // Verification URL dynamically encoded in the QR code
  const verificationUrl = `${liveDomain}/credentials/verify?id=${encodeURIComponent(studentId)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print-specific style to isolate ID card */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-student-id-card, #printable-student-id-card * {
            visibility: visible !important;
          }
          #printable-student-id-card {
            position: absolute !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 380px !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>

      {/* Card Header Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
            Verified Digital Credential
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            title="Flip card for institutional details"
          >
            <FaSyncAlt className="text-[10px]" /> {isFlipped ? "Front" : "Back"}
          </button>
          <button
            onClick={handlePrint}
            className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            title="Print or Save ID Card as PDF"
          >
            <FaPrint className="text-[10px]" /> Print
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div
        id="printable-student-id-card"
        ref={cardRef}
        className="relative bg-gradient-to-br from-gray-950 via-slate-900 to-red-950 rounded-2xl text-white shadow-2xl overflow-hidden border border-amber-500/30 transition-all duration-300 select-none"
      >
        {/* Holographic / Security Gradient Accents */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Metallic Border Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-red-500 to-amber-300" />

        {!isFlipped ? (
          /* ── FRONT FACE ─────────────────────────────────── */
          <div className="p-4 sm:p-6 relative z-10 flex flex-col justify-between min-h-[440px] sm:min-h-[460px]">
            {/* Header: Institution Branding */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/15 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/fab-icon.gif"
                      alt="ProGemini"
                      width={26}
                      height={26}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs font-black tracking-wider sm:tracking-widest text-white uppercase block leading-none">
                      PROGEMINI ACADEMY
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-amber-400/90 uppercase block mt-0.5">
                      OFFICIAL DIGITAL STUDENT ID
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md flex-shrink-0">
                  <FaShieldAlt className="text-amber-400 text-[10px]" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 tracking-wider">VERIFIED</span>
                </div>
              </div>

              {/* Student Photo & Name Area */}
              <div className="mt-4 sm:mt-5 flex flex-row items-center sm:items-start gap-3.5 sm:gap-4 text-left">
                {/* Photo */}
                <div className="relative group flex-shrink-0">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-md bg-gray-900 relative">
                    {user.avatar ? (
                      <Image
                        src={getFileUrl(user.avatar)}
                        alt={user.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                        <FaUser className="text-2xl sm:text-3xl mb-1 text-gray-600" />
                        <span className="text-[8px] sm:text-[9px]">Photo Required</span>
                      </div>
                    )}
                  </div>
                  {onPhotoClick && (
                    <button
                      onClick={onPhotoClick}
                      className="absolute bottom-1 right-1 bg-black/70 hover:bg-black text-amber-300 p-1 rounded-md text-[9px] transition opacity-0 group-hover:opacity-100"
                      title="Update photo"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Name & ID Badge */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wide break-words leading-snug" title={user.name}>
                    {user.name}
                  </h3>

                  {/* Student ID Pill */}
                  <div className="mt-1.5 inline-flex items-center gap-1.5 bg-red-950/80 border border-red-500/40 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg max-w-full">
                    <FaIdCard className="text-amber-400 text-xs flex-shrink-0" />
                    <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wider text-amber-300 truncate">
                      {studentId}
                    </span>
                  </div>

                  {sp.nationality && (
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1.5 truncate">
                      Nationality: <span className="text-gray-200 font-medium">{sp.nationality}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Programme & Intake Metadata */}
              <div className="mt-3.5 sm:mt-5 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-0.5 sm:gap-2">
                  <span className="text-gray-400 flex items-center gap-1 flex-shrink-0 text-xs">
                    <FaGraduationCap className="text-amber-400 text-xs flex-shrink-0" /> Programme:
                  </span>
                  <span
                    className="font-bold text-gray-100 sm:text-right flex-1 break-words leading-snug text-xs sm:text-sm"
                    title={program}
                  >
                    {program}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 flex items-center gap-1 flex-shrink-0 text-xs">
                    <FaCalendarAlt className="text-amber-400 text-xs flex-shrink-0" /> Intake / Started:
                  </span>
                  <span className="font-semibold text-gray-200 text-right text-xs">
                    {intake}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 flex items-center gap-1 flex-shrink-0 text-xs">
                    <FaCheckCircle className="text-green-400 text-xs flex-shrink-0" /> Status:
                  </span>
                  <span className="font-semibold text-green-400 text-right text-xs flex items-center gap-1">
                    Active Registered Student
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Dynamic QR Code & Barcode Band */}
            <div className="mt-3.5 sm:mt-5 pt-3 border-t border-white/15 flex items-center justify-between gap-3">
              {/* Institutional Micro-text & Barcode */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[8px] sm:text-[9px] tracking-widest text-amber-200/70 select-none overflow-hidden text-ellipsis whitespace-nowrap">
                  ||| | |||| || | ||| |||| | || ||||| ||
                </div>
                <p className="text-[8px] sm:text-[9px] text-gray-400 mt-1 leading-tight">
                  Issued by ProGemini Academy Registry.
                  <br />
                  Scan QR code for live authenticity verification.
                </p>
              </div>

              {/* Dynamic Scannable QR Code */}
              <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-md flex-shrink-0 text-center">
                <QRCodeSVG
                  value={verificationUrl}
                  size={68}
                  level="M"
                  includeMargin={false}
                  className="mx-auto w-[64px] h-[64px] sm:w-[76px] sm:h-[76px]"
                />
                <span className="text-[7px] sm:text-[8px] font-black text-gray-900 block mt-1 tracking-wider uppercase">
                  VERIFY ID
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ── BACK FACE ──────────────────────────────────── */
          <div className="p-4 sm:p-6 relative z-10 flex flex-col justify-between min-h-[440px] sm:min-h-[460px] text-xs">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-white/15">
                <FaUniversity className="text-amber-400 text-base" />
                <span className="font-bold uppercase tracking-wider text-sm text-gray-100">
                  Credential Details & Terms
                </span>
              </div>

              <div className="mt-4 space-y-3 text-gray-300 leading-relaxed text-[11px]">
                <p>
                  This digital credential confirms that the named student is officially admitted and actively registered at ProGemini Academy.
                </p>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Institutional ID:</span>
                    <span className="font-mono font-bold text-amber-300">{studentId}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">Programme:</span>
                    <span className="font-medium text-gray-200 text-right break-words">{program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registered Email:</span>
                    <span className="font-medium text-gray-200">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Academic Intake:</span>
                    <span className="font-medium text-gray-200">{intake}</span>
                  </div>
                </div>

                <div className="space-y-1 text-gray-400 text-[10px]">
                  <p>• This card remains the property of ProGemini Academy.</p>
                  <p>• Unauthorized duplication or alteration is strictly prohibited.</p>
                  <p>• Scan the front QR code for real-time validation via the official registry.</p>
                </div>
              </div>
            </div>

            {/* Official Signature Mock / Stamp */}
            <div className="pt-4 border-t border-white/15 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-gray-400">Academic Registry</p>
                <p className="font-serif italic text-amber-300 text-sm mt-0.5">Office of Admissions</p>
                <span className="text-[9px] text-gray-500 block">ProGemini Academy London</span>
              </div>

              <div className="w-14 h-14 rounded-full border border-amber-400/40 flex items-center justify-center text-center p-1 bg-amber-500/10">
                <span className="text-[7px] font-bold text-amber-300 uppercase tracking-tighter leading-tight">
                  OFFICIAL SEAL
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
