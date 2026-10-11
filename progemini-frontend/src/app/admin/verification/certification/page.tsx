"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaCertificate,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaExternalLinkAlt,
  FaFileAlt,
  FaFilter,
  FaGraduationCap,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaUser,
  FaUserGraduate,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import { downloadCertificatePdf } from "@/lib/certificatePdf";

interface CertificateItem {
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
  publishedAt?: string | null;
  encryptedToken?: string | null;
  verificationUrl?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    studentProfile?: {
      studentId?: string | null;
      program?: string | null;
      isCertified?: boolean;
      certifiedAt?: string | null;
    } | null;
  };
}

export default function AdminCertificationVerificationPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch certificates from admin endpoint with fallback
      let res: any;
      try {
        res = await apiClient.get<any>("/v1/admin/certificates");
      } catch {
        res = await apiClient.get<any>("/v1/certificates/user/all");
      }

      const data = res?.data || (Array.isArray(res) ? res : []);
      setCertificates(data);
    } catch (err) {
      console.error("Failed to load certificates:", err);
      toast.error("Failed to load certificate records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadPdf = async (cert: CertificateItem) => {
    try {
      setDownloadingId(cert.id);
      toast.loading("Generating official certificate PDF...", { id: "cert-pdf" });
      const safeName = (cert.studentName || "Student").replace(/\s+/g, "_");
      await downloadCertificatePdf({
        certificateId: cert.id,
        filename: `Progemini_Certificate_${safeName}.pdf`,
        certificateData: {
          studentName: cert.studentName,
          courseTitle: cert.courseTitle,
          grade: cert.grade,
          issueDate: cert.issueDate,
          learningHours: cert.learningHours,
          studentId: cert.studentId || cert.certificateId,
          certificateId: cert.certificateId,
          encryptedToken: cert.encryptedToken,
          verificationUrl: cert.verificationUrl,
        },
      });
      toast.success("Certificate PDF downloaded successfully!", { id: "cert-pdf" });
    } catch (err: any) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download certificate PDF", { id: "cert-pdf" });
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      c.studentName?.toLowerCase().includes(q) ||
      c.certificateId?.toLowerCase().includes(q) ||
      c.studentId?.toLowerCase().includes(q) ||
      c.courseTitle?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPublished = certificates.filter((c) => c.status === "PUBLISHED").length;
  const totalDraft = certificates.filter((c) => c.status === "DRAFT").length;

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <FaCertificate className="text-brand-primary" />
            Institutional Certification &amp; Certified Students
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Centrally manage, verify, audit, and export official degree certificates for certified students.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
            title="Refresh List"
          >
            <FaRedo className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-brand-primary hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <FaUserGraduate />
            Issue via User Management
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Total Certificates
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {certificates.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-primary flex items-center justify-center text-xl">
              <FaCertificate />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Published &amp; Certified
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {totalPublished}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <FaCheckCircle />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Drafts / Pending Review
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {totalDraft}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <FaClock />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card p-4 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, degree, email, or ID..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FaFilter className="text-gray-400 text-xs" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-brand-primary font-medium text-gray-700"
          >
            <option value="ALL">All Statuses ({certificates.length})</option>
            <option value="PUBLISHED">Published &amp; Certified ({totalPublished})</option>
            <option value="DRAFT">Draft Only ({totalDraft})</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="card bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student Recipient</th>
                <th className="py-3 px-4">Awarded Programme</th>
                <th className="py-3 px-4">Date of Issue</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading certified student records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-gray-500 text-xs space-y-2">
                    <FaCertificate className="text-4xl text-gray-300 mx-auto" />
                    <p className="font-semibold text-gray-700 text-sm">No certificate records found</p>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Visit a student profile in User Management to configure, generate mark sheets, and issue degree certificates.
                    </p>
                    <Link
                      href="/admin/users"
                      className="inline-block mt-3 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 transition"
                    >
                      Go to User Management
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => {
                  const isDownloading = downloadingId === cert.id;
                  const displayDate = cert.issueDate
                    ? new Date(cert.issueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={cert.id} className="hover:bg-gray-50/80 transition">
                      {/* Certificate ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-primary">
                        <div className="flex items-center gap-1.5">
                          <FaCertificate className="text-amber-500 text-xs" />
                          <span>{cert.certificateId}</span>
                        </div>
                      </td>

                      {/* Student Recipient */}
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        <div className="font-bold text-gray-900 text-sm">{cert.studentName}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                          {cert.studentId && (
                            <span className="font-mono bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                              {cert.studentId}
                            </span>
                          )}
                          {cert.user?.email && (
                            <span className="truncate max-w-[200px]" title={cert.user.email}>
                              {cert.user.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Awarded Programme */}
                      <td className="py-3.5 px-4 text-gray-700">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <FaGraduationCap className="text-gray-400 text-xs" />
                          <span>{cert.courseTitle}</span>
                        </div>
                        {cert.grade && (
                          <div className="text-[11px] font-medium text-amber-700 mt-0.5">
                            {cert.grade}
                          </div>
                        )}
                      </td>

                      {/* Date of Issue */}
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {displayDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cert.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {cert.status === "PUBLISHED" ? (
                            <>
                              <FaCheckCircle className="text-[10px]" /> Certified
                            </>
                          ) : (
                            <>
                              <FaClock className="text-[10px]" /> Draft
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Manage Certificate */}
                          <Link
                            href={`/admin/users/${cert.userId}?tab=certification`}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-brand-primary rounded-lg text-xs font-semibold transition"
                            title="Manage Certificate"
                          >
                            Certificate
                          </Link>

                          {/* Manage Mark Sheet */}
                          <Link
                            href={`/admin/users/${cert.userId}?tab=marksheet`}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="View / Edit Mark Sheet"
                          >
                            <FaFileAlt className="text-[10px]" />
                            Mark Sheet
                          </Link>

                          {/* Download High-Res PDF */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(cert)}
                            disabled={isDownloading}
                            className="p-1.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            title="Download Vector A4 PDF"
                          >
                            {isDownloading ? (
                              <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaDownload className="text-xs" />
                            )}
                          </button>

                          {/* Public Verification Link */}
                          <Link
                            href={`/credentials/verify?id=${cert.certificateId}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition"
                            title="Verify Digital Credential"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
