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
  certificateId?: string;
  grade?: string | null;
  learningHours?: string | null;
  isCertificateAward?: boolean;
}

interface VerifiedCertificateData {
  id?: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  grade?: string | null;
  issueDate: string | Date;
  learningHours?: string | null;
  publishedAt?: string | Date | null;
  status: string;
  institution: string;
  institutionUrl: string;
  accreditation: string;
  verificationUrl?: string | null;
  avatar?: string | null;
}

interface EnrolledStudentData {
  studentName: string;
  studentId: string;
  courseTitle: string;
  grade?: string | null;
  avatar?: string | null;
  institution: string;
}

function CredentialVerificationContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || searchParams.get("id") || "";

  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);
  const [certificate, setCertificate] = useState<VerifiedCertificateData | null>(null);
  const [enrolledStudent, setEnrolledStudent] = useState<EnrolledStudentData | null>(null);
  const [unpublishedMessage, setUnpublishedMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      verifyToken(tokenParam);
    }
  }, [tokenParam]);

  const verifyToken = async (rawToken: string) => {
    const cleanToken = rawToken.trim();
    if (!cleanToken) return;

    setLoading(true);
    setError(null);
    setIsPublished(null);
    setCertificate(null);
    setEnrolledStudent(null);
    setUnpublishedMessage("");

    try {
      const res = await apiClient.get<any>(
        `/v1/certificates/verify/${encodeURIComponent(cleanToken)}`
      );

      if (res?.verified) {
        if (res.isPublished && res.certificate) {
          // ─── Published Certificate Award ───
          setIsPublished(true);
          setCertificate(res.certificate);
        } else {
          // ─── Enrolled Student But Certificate Not Published ───
          setIsPublished(false);
          setUnpublishedMessage(
            res.message ||
              "Student is enrolled on this course but not gained the certificate."
          );
          setEnrolledStudent(res.student);
        }
      } else {
        setError(
          res?.message ||
            "No official institutional certificate or student record found for this token."
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Unable to verify token against the ProGemini Academy Registry. Please scan the official QR code."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyStudentId = (idToCopy: string) => {
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return "Official Record";
    try {
      return new Date(dateVal).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
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
            Official Encrypted Credential Verification Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#7a0019] tracking-tight">
            ProGemini Academy
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Central Institutional Registry for Academic Award Authentication & Verification.
          </p>
        </div>

        {/* ─── State 0: No Token In URL (Direct Access Protection) ─── */}
        {!tokenParam && !loading && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-amber-200 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center text-3xl shadow-sm">
              <FaLock />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-extrabold text-gray-900">
                Encrypted QR Verification Required
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                For institutional security and student privacy, certificate verification is restricted to official cryptographic tokens.
              </p>
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs text-left">
                <p className="font-semibold mb-1">How to verify:</p>
                <p className="text-amber-800">
                  Please scan the official encrypted QR code embedded at the bottom of the physical or digital ProGemini Academy Certificate of Completion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Loading State ─── */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-amber-200 border-t-[#7a0019] animate-spin" />
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base">
                Verifying Cryptographic Credential...
              </h3>
              <p className="text-xs text-gray-500">
                Decrypting token and querying the ProGemini Academy Central Academic Registry
              </p>
            </div>
          </div>
        )}

        {/* ─── State 1: Enrolled in Course But Certificate NOT Published ─── */}
        {!loading && isPublished === false && enrolledStudent && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-400 overflow-hidden relative">
            {/* Top Amber Status Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  <FaShieldAlt className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    Student Enrollment Verified
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-100 border border-amber-300/40">
                      Uncertified
                    </span>
                  </h2>
                  <p className="text-xs text-amber-100">
                    Official ProGemini Academy Academic Registry
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Prominent Notice Required By User */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3.5">
                <FaAward className="text-amber-600 text-2xl mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                    Certification Status: Not Awarded
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed">
                    {unpublishedMessage ||
                      "Student is enrolled on this course but not gained the certificate."}
                  </p>
                  <p className="text-[11px] text-amber-700 pt-1">
                    This student is an active registered learner in the programme. An official Certificate of Completion has not been gained or published by academic administration.
                  </p>
                </div>
              </div>

              {/* Student Identity Information Card */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">
                      Student Full Name
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-gray-900">
                      {enrolledStudent.studentName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-semibold">Student ID:</span>
                    <span className="font-mono font-bold text-sm text-[#7a0019] bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                      {enrolledStudent.studentId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyStudentId(enrolledStudent.studentId)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition"
                      title="Copy Student ID"
                    >
                      {copied ? <FaCheck className="text-emerald-600 text-xs" /> : <FaCopy className="text-xs" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
                  <div className="space-y-1">
                    <span className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                      <FaGraduationCap className="text-[#7a0019]" /> Enrolled Course / Programme
                    </span>
                    <span className="font-bold text-gray-900 block text-sm">
                      {enrolledStudent.courseTitle}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                      <FaUniversity className="text-amber-600" /> Academic Institution
                    </span>
                    <span className="font-bold text-gray-900 block text-sm">
                      {enrolledStudent.institution || "ProGemini Academy"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Seal Bar */}
            <div className="bg-gray-900 text-gray-300 px-6 py-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <FaUniversity className="text-amber-400" />
                ProGemini Academy • Office of the Registrar
              </span>
              <span className="text-gray-400 text-[11px]">
                Cryptographic Token Verification Complete
              </span>
            </div>
          </div>
        )}

        {/* ─── State 2: Certificate IS Published (Verified Award) ─── */}
        {!loading && isPublished === true && certificate && (
          <div
            id="printable-credential-certificate"
            className="bg-white rounded-3xl shadow-xl border-2 border-emerald-500 overflow-hidden relative"
          >
            {/* Top Emerald Status Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  <FaCheckCircle className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    Verified Certificate Award
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-100 border border-emerald-300/40">
                      Officially Published
                    </span>
                  </h2>
                  <p className="text-xs text-emerald-100">
                    Official ProGemini Academy Institutional Award
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                <FaPrint className="text-xs" /> Print Verification
              </button>
            </div>

            {/* Certificate Award Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Recipient & Award Presentation Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-gray-50 border-2 border-amber-300/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Authentic Academic Award
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    Serial: {certificate.studentId}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    THIS IS TO CERTIFY THAT
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#7a0019] tracking-tight">
                    {certificate.studentName}
                  </h3>
                </div>

                {/* Course Name & Certificate Published Day (Explicitly requested by user) */}
                <div className="pt-2 border-t border-gray-200 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">
                      Awarded Course / Degree Programme:
                    </span>
                    <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-0.5">
                      {certificate.courseTitle}
                    </h4>
                    {certificate.grade && (
                      <span className="inline-block mt-1 font-bold text-sm text-[#7a0019] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                        {certificate.grade}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-0.5">
                      <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                        <FaCalendarAlt className="text-[#7a0019]" /> Certificate Published Date
                      </span>
                      <span className="font-extrabold text-gray-900 text-sm block">
                        {formatDate(certificate.publishedAt || certificate.issueDate)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-0.5">
                      <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                        <FaIdCard className="text-amber-600" /> Certificate ID (Student ID)
                      </span>
                      <span className="font-mono font-extrabold text-brand-primary text-sm block">
                        {certificate.studentId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Trust Footer & Authenticity Notice */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
                <FaShieldAlt className="text-emerald-700 text-base mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold block">Institutional Cryptographic Clearance</span>
                  <p className="text-emerald-900 text-[11px] leading-relaxed">
                    This official credential was authenticated in real time from the ProGemini Academy registry via an encrypted token. It certifies that the recipient has satisfactorily completed all institutional requirements and earned the official qualification.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Seal Bar */}
            <div className="bg-gray-900 text-gray-300 px-6 py-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <FaUniversity className="text-amber-400" />
                ProGemini Academy • Office of the Academic Registrar
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

        {/* ─── Error / Not Found State ─── */}
        {!loading && error && (
          <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-8 text-center space-y-4">
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
                Please ensure you scanned the authentic QR code on the official ProGemini Certificate.
              </p>
            </div>
          </div>
        )}

        {/* Return to Home */}
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
