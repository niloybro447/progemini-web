"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FaCertificate,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaLock,
  FaPrint,
  FaQrcode,
  FaRedo,
  FaSave,
  FaShieldAlt,
  FaTimes,
  FaUniversity,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import ProgeminiCertificate from "./ProgeminiCertificate";
import { downloadCertificatePdf } from "@/lib/certificatePdf";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  studentProfile?: {
    studentId?: string | null;
    program?: string | null;
    startedSemester?: string | null;
    startedYear?: string | null;
    isCertified?: boolean;
    certifiedAt?: string | Date | null;
  } | null;
  applications?: any[];
}

interface CertificateData {
  id: string;
  certificateId: string;
  userId: string;
  studentId?: string | null;
  studentName: string;
  courseTitle: string;
  grade?: string | null;
  issueDate: string;
  learningHours?: string | null;
  status: "DRAFT" | "PUBLISHED" | "REVOKED";
  encryptedToken?: string | null;
  verificationUrl?: string | null;
  publishedAt?: string | null;
}

interface AdminCertificateTabProps {
  user: User;
  onUserUpdated?: () => void;
}

const GRADE_OPTIONS = [
  "Upper Second Class",
  "First Class Honours",
  "Lower Second Class",
  "Third Class Honours",
  "Pass with Distinction",
  "Merit",
  "Pass",
  "Completed with Honors",
];

export default function AdminCertificateTab({
  user,
  onUserUpdated,
}: AdminCertificateTabProps) {
  const certificateContainerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);

  const sp = user.studentProfile || {};
  const approvedApp = user.applications?.find((a: any) => a.status === "APPROVED");
  const defaultCourse =
    sp.program || approvedApp?.course?.title || "BSc (Hons) International Business";

  // Form State
  const effectiveStudentId = sp.studentId || "2301-IBM-0001";
  const [formData, setFormData] = useState({
    certificateId: effectiveStudentId,
    studentName: user.name || "Abir Md Rezwan Ahmed",
    courseTitle: defaultCourse,
    grade: "Upper Second Class",
    issueDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    learningHours: "As per programme",
  });

  // Fetch Existing Certificate or Initialize
  useEffect(() => {
    let isMounted = true;

    async function loadCertificate() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(`/v1/certificates/user/${user.id}`);
        const certs = res?.data || (Array.isArray(res) ? res : []);

        if (isMounted && certs.length > 0) {
          const cert = certs[0];
          setActiveCertificate(cert);
          setFormData({
            certificateId: cert.certificateId || effectiveStudentId,
            studentName: cert.studentName || user.name,
            courseTitle: cert.courseTitle || defaultCourse,
            grade: cert.grade || "Upper Second Class",
            issueDate: cert.issueDate
              ? new Date(cert.issueDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            learningHours: cert.learningHours || "As per programme",
          });
        }
      } catch (err) {
        console.error("Failed to load certificate:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCertificate();

    return () => {
      isMounted = false;
    };
  }, [user.id, user.name, defaultCourse, effectiveStudentId]);

  // Handle Form Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save / Update Draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const payload = {
        id: activeCertificate?.id,
        userId: user.id,
        certificateId: sp.studentId || formData.certificateId || "2301-IBM-0001",
        studentName: formData.studentName,
        courseTitle: formData.courseTitle,
        grade: formData.grade,
        issueDate: formData.issueDate,
        learningHours: formData.learningHours,
        status: activeCertificate?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      };

      const res = await apiClient.post<any>("/v1/admin/certificates", payload);
      if (res?.data) {
        setActiveCertificate(res.data);
        toast.success("Certificate saved successfully!");
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  // Publish Certificate (Post Confirmation)
  const handleConfirmPublish = async () => {
    try {
      setSaving(true);
      // First save latest edits
      const savePayload = {
        id: activeCertificate?.id,
        userId: user.id,
        certificateId: sp.studentId || formData.certificateId || "2301-IBM-0001",
        studentName: formData.studentName,
        courseTitle: formData.courseTitle,
        grade: formData.grade,
        issueDate: formData.issueDate,
        learningHours: formData.learningHours,
        status: "PUBLISHED",
      };

      const saveRes = await apiClient.post<any>("/v1/admin/certificates", savePayload);
      const savedCert = saveRes?.data;

      // Ensure publish endpoint executes to lock certification status
      if (savedCert?.id) {
        const pubRes = await apiClient.post<any>(
          `/v1/admin/certificates/${savedCert.id}/publish`
        );
        if (pubRes?.data) {
          setActiveCertificate(pubRes.data);
        } else {
          setActiveCertificate(savedCert);
        }
      }

      setIsPublishModalOpen(false);
      toast.success(
        "🎉 Certificate officially published! Student status is now Certified."
      );
      if (onUserUpdated) onUserUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish certificate");
    } finally {
      setSaving(false);
    }
  };

  // Unpublish Certificate (Revert to Draft)
  const handleUnpublish = async () => {
    if (!activeCertificate?.id) return;
    if (
      !confirm(
        "Are you sure you want to revert this certificate to Draft? The student will no longer be marked as Certified until republished."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient.post<any>(
        `/v1/admin/certificates/${activeCertificate.id}/unpublish`
      );
      if (res?.data) {
        setActiveCertificate(res.data);
        toast.success("Certificate reverted to Draft.");
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to unpublish certificate");
    } finally {
      setSaving(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      toast.loading("Generating high-resolution PDF certificate...", { id: "pdf-toast" });
      const safeName = (formData.studentName || "Student").replace(/\s+/g, "_");
      await downloadCertificatePdf({
        filename: `Progemini_Certificate_${safeName}.pdf`,
        certificateId: activeCertificate?.id,
        certificateData: {
          studentName: formData.studentName || user.name,
          courseTitle: formData.courseTitle,
          grade: formData.grade,
          issueDate: formData.issueDate,
          learningHours: formData.learningHours,
          studentId: sp.studentId || formData.certificateId,
          certificateId: formData.certificateId,
          encryptedToken: activeCertificate?.encryptedToken,
          verificationUrl: activeCertificate?.verificationUrl,
        },
      });
      toast.success("Certificate PDF downloaded successfully!", { id: "pdf-toast" });
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. You can also use the Print button.", {
        id: "pdf-toast",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Print Certificate
  const handlePrint = () => {
    window.print();
  };

  const isCertified =
    activeCertificate?.status === "PUBLISHED" || Boolean(sp.isCertified);

  return (
    <div className="space-y-6">
      {/* ───────────────── Print Stylesheet ───────────────── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #progemini-official-certificate,
          #progemini-official-certificate * {
            visibility: visible !important;
          }
          #progemini-official-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* ───────────────── Top Clearance & Status Banner ───────────────── */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isCertified
            ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-300 shadow-sm"
            : "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-300 shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                isCertified ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
              }`}
            >
              <FaCertificate />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-gray-900 text-lg">
                  Student Certification Status:
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    isCertified
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {isCertified ? "✓ Certified & Published" : "Pending Publication / Uncertified"}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                  ID: {formData.certificateId}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                {isCertified
                  ? "This student is officially certified by ProGemini Academy. The certificate is published and available for student and public QR verification."
                  : "Draft mode. To award this credential and enable student PDF downloads, configure the publication date and click 'Publish Certificate'."}
              </p>
            </div>
          </div>

          {/* Quick Status Action Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {isCertified ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={saving}
                className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 border border-gray-300"
              >
                <FaLock />
                Unpublish Certificate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <FaCertificate />
                Publish Certificate
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <FaDownload />
              {downloading ? "Exporting..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 border border-gray-200"
            >
              <FaPrint />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────── Two Column Layout: Editor Form (Left) & Live Preview (Right) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Certificate CRUD Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FaEdit className="text-brand-primary" />
                Certificate Details & Information
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">
                Live Preview Sync
              </span>
            </div>

            {/* Field 1: Publication Date (Date of Issue) */}
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-100 space-y-1.5">
              <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center justify-between">
                <span>1. Publication Date (Date of Issue) *</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  Admin Specified
                </span>
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-brand-primary outline-none"
              />
              <p className="text-[11px] text-gray-500">
                This date will be printed on the official certificate as the Date of Issue.
              </p>
            </div>

            {/* Field 2: Student Recipient Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Student Recipient Full Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="e.g. Abir Md Rezwan Ahmed"
                className="input-field text-sm font-medium"
              />
            </div>

            {/* Field 3: Course / Academic Programme */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Awarded Programme / Degree Title *
                </label>
                {sp.program && sp.program !== formData.courseTitle && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, courseTitle: sp.program! }))
                    }
                    className="text-[10px] text-brand-primary hover:underline font-semibold"
                  >
                    Use Profile Program
                  </button>
                )}
              </div>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                placeholder="e.g. BSc (Hons) International Business"
                className="input-field text-sm font-medium"
              />
            </div>

            {/* Field 4: Honours / Classification / Grade */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Honours / Classification / Grade
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={
                    GRADE_OPTIONS.includes(formData.grade) ? formData.grade : "Custom"
                  }
                  onChange={(e) => {
                    if (e.target.value !== "Custom") {
                      setFormData((prev) => ({ ...prev, grade: e.target.value }));
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {GRADE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Custom">Custom Text...</option>
                </select>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="Classification"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Field 5: Learning Hours */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Learning Hours
              </label>
              <input
                type="text"
                name="learningHours"
                value={formData.learningHours}
                onChange={handleChange}
                placeholder="As per programme"
                className="input-field text-sm"
              />
            </div>

            {/* Field 6: Certificate ID (Automatically & Uniquely Derived from Student ID) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Certificate ID (Institutional Serial — Student ID)
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-mono text-sm font-bold text-brand-primary tracking-wider">
                  {sp.studentId || formData.certificateId || "2301-IBM-0001"}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  Student ID Serial
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Certificate uniqueness is automatically ensured through the student&apos;s institutional ID.
              </p>
            </div>

            {/* Action Buttons: Save & Publish */}
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center justify-center gap-2 border border-gray-300"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Certificate Details"}
              </button>

              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                disabled={saving}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-brand-primary hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
              >
                <FaCertificate />
                {isCertified ? "Update & Republish" : "Publish Certificate"}
              </button>
            </div>
          </div>

          {/* Institutional Security Notice */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
              <FaShieldAlt className="text-brand-primary" />
              Dynamic Encrypted QR Verification
            </h4>
            <p className="leading-relaxed">
              The QR code embedded in the certificate is encrypted with institutional AES-256
              cryptography. Scanning the code securely queries ProGemini Academy servers to verify
              the recipient’s unique student ID (
              <span className="font-mono font-semibold text-gray-800">
                {sp.studentId || "Student ID"}
              </span>
              ) and publication status.
            </p>
          </div>
        </div>

        {/* Right Column: Live High-Definition Certificate Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FaEye className="text-brand-primary" />
              Live Official Certificate Preview
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">
                Official ProGemini Academy Template
              </span>
            </div>
          </div>

          {/* Certificate Container with Scroll Wrapper */}
          <div
            ref={certificateContainerRef}
            className="w-full overflow-x-auto bg-gray-100/70 p-2 sm:p-4 rounded-2xl border border-gray-200 flex justify-center"
          >
            <ProgeminiCertificate
              studentName={formData.studentName}
              courseTitle={formData.courseTitle}
              grade={formData.grade}
              issueDate={formData.issueDate}
              learningHours={formData.learningHours}
              studentId={sp.studentId || "2301-IBM-0001"}
              certificateId={formData.certificateId}
              encryptedToken={activeCertificate?.encryptedToken}
              verificationUrl={activeCertificate?.verificationUrl}
              isPublished={isCertified}
            />
          </div>
        </div>
      </div>

      {/* ───────────────── Post Confirmation Publish Modal ───────────────── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl">
                <FaCertificate />
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Certificate Publication
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                You are about to officially publish this credential for the student. Please review the
                details below:
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Recipient:</span>
                <span className="font-bold text-gray-900">{formData.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Student ID:</span>
                <span className="font-mono font-bold text-brand-primary">
                  {sp.studentId || "Not Cleared"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Programme:</span>
                <span className="font-semibold text-gray-900 text-right max-w-[240px] truncate">
                  {formData.courseTitle}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Classification:</span>
                <span className="font-semibold text-gray-900">{formData.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 font-medium">Date of Issue:</span>
                <span className="font-bold text-[#7a0019]">{formData.issueDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">Certificate ID:</span>
                <span className="font-mono font-bold text-gray-900">{formData.certificateId}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <FaExclamationTriangle className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
              <span>
                Publishing will mark the student as <strong>Certified</strong> in the backend. The
                student will immediately receive access to view and download their official PDF
                certificate.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={saving}
                className="px-5 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <FaCertificate />
                {saving ? "Publishing..." : "Yes, Publish Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
