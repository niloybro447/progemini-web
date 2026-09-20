"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaGraduationCap,
  FaCalendarAlt,
  FaIdCard,
  FaUniversity,
  FaTimesCircle,
  FaSearch,
  FaPrint,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaLock,
  FaAward,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import { getFileUrl } from "@/lib/utils";

interface CredentialData {
  studentId: string;
  name: string;
  avatar: string | null;
  program: string;
  startedSemester: string;
  startedYear: string;
  nationality?: string | null;
  status: string;
  issuedAt: string | Date;
  institution: string;
  institutionUrl: string;
  accreditation: string;
  approvedCourseTitle?: string;
}

function CredentialVerificationContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || "";

  const [studentIdInput, setStudentIdInput] = useState(queryId);
  const [activeQuery, setActiveQuery] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState<CredentialData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (queryId) {
      setStudentIdInput(queryId);
      setActiveQuery(queryId);
      verifyCredential(queryId);
    }
  }, [queryId]);

  const verifyCredential = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setCredential(null);

    try {
      const cleanId = idToVerify.trim();
      const res = await apiClient.get<any>(
        `/v1/credentials/verify/${encodeURIComponent(cleanId)}`
      );

      if (res?.verified && res?.credential) {
        setCredential(res.credential);
      } else {
        setError(
          res?.message ||
            `No official student record found matching credential ID "${cleanId}".`
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Unable to verify credential against the official registry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentIdInput.trim()) {
      setActiveQuery(studentIdInput.trim());
      verifyCredential(studentIdInput.trim());
    }
  };

  const copyStudentId = () => {
    if (!credential?.studentId) return;
    navigator.clipboard.writeText(credential.studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return "Official Record";
    try {
      return new Date(dateVal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-credential-certificate,
          #printable-credential-certificate * {
            visibility: visible !important;
          }
          #printable-credential-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 2px solid #b45309 !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Institutional Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
            <FaLock className="text-emerald-600 text-xs" />
            Official Public Credential Registry
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            ProGemini Academy
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Official institutional verification portal for student identification credentials and academic clearance.
          </p>
        </div>

        {/* Verification Lookup Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="Enter Student ID (e.g. PG-2026-0042)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-sm font-medium text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !studentIdInput.trim()}
              className="px-6 py-2.5 bg-brand-primary hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaShieldAlt />
              )}
              Verify Credential
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-amber-200 border-t-brand-primary animate-spin" />
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base">
                Verifying Institutional Record...
              </h3>
              <p className="text-xs text-gray-500">
                Checking against ProGemini official student database & academic registry
              </p>
            </div>
          </div>
        )}

        {/* Verified Credential Certificate Display */}
        {!loading && credential && (
          <div
            id="printable-credential-certificate"
            className="bg-white rounded-3xl shadow-xl border-2 border-amber-300/80 overflow-hidden relative"
          >
            {/* Top Status Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  <FaCheckCircle className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    Verified Student Credential
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/25">
                      Authenticated
                    </span>
                  </h2>
                  <p className="text-xs text-emerald-100">
                    Official ProGemini Academy Digital Record
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <FaPrint className="text-xs" />
                  Print Record
                </button>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Student Identity Card Presentation */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-gray-50 border border-amber-200/60 shadow-xs">
                {/* Photo */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md bg-gray-100 flex-shrink-0">
                  {credential.avatar ? (
                    <Image
                      src={getFileUrl(credential.avatar)}
                      alt={credential.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-3xl">
                      {credential.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold text-center py-0.5">
                    VERIFIED PHOTO
                  </div>
                </div>

                {/* Main Details */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    {credential.status}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {credential.name}
                  </h3>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <span className="text-xs text-gray-500 font-semibold">Student ID:</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-brand-primary bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                      {credential.studentId}
                    </span>
                    <button
                      type="button"
                      onClick={copyStudentId}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                      title="Copy Student ID"
                    >
                      {copied ? (
                        <FaCheck className="text-emerald-600 text-xs" />
                      ) : (
                        <FaCopy className="text-xs" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                    <FaUniversity className="text-amber-600 text-xs" />
                    {credential.institution} • Office of the Registrar
                  </p>
                </div>
              </div>

              {/* Official Academic Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                    <FaGraduationCap className="text-brand-primary text-sm" />
                    Academic Programme
                  </span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {credential.program}
                  </span>
                  {credential.approvedCourseTitle &&
                    credential.approvedCourseTitle !== credential.program && (
                      <span className="text-[11px] text-gray-500 block">
                        Course: {credential.approvedCourseTitle}
                      </span>
                    )}
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                    <FaCalendarAlt className="text-amber-600 text-sm" />
                    Enrolled Intake
                  </span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {credential.startedSemester} {credential.startedYear}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Admitted to formal study
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                    <FaAward className="text-emerald-600 text-sm" />
                    Credential Clearance
                  </span>
                  <span className="font-bold text-emerald-700 text-sm block">
                    Cleared & Approved
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    {credential.accreditation}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                    <FaIdCard className="text-blue-600 text-sm" />
                    Registry Authentication Date
                  </span>
                  <span className="font-bold text-gray-900 text-sm block">
                    {formatDate(credential.issuedAt)}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Verified Digital ID Card
                  </span>
                </div>
              </div>

              {/* Digital Trust Footer & Authenticity Notice */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <FaShieldAlt className="text-amber-600 text-base mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold block">Authenticity Verification Statement</span>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    This public record confirms the holder is a registered, active student in good standing at ProGemini Academy. This verification is generated electronically directly from institutional databases and requires no physical seal to be valid.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Seal Bar */}
            <div className="bg-gray-900 text-gray-300 px-6 py-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <FaUniversity className="text-amber-400" />
                ProGemini Academy • Central Records
              </span>
              <Link
                href="/"
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
              >
                progemini.academy <FaExternalLinkAlt className="text-[10px]" />
              </Link>
            </div>
          </div>
        )}

        {/* Not Found / Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl">
              <FaTimesCircle />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900">
                Credential Verification Notice
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {error}
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please ensure you scanned the correct QR code or contact the{" "}
                <Link href="/contact" className="text-brand-primary font-semibold underline">
                  ProGemini Registrar Office
                </Link>.
              </p>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            ← Return to ProGemini Academy Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CredentialVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CredentialVerificationContent />
    </Suspense>
  );
}
