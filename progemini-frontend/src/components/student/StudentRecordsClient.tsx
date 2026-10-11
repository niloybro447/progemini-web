"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaCertificate,
  FaFileAlt,
  FaDownload,
  FaPrint,
  FaGraduationCap,
  FaClock,
  FaShieldAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import ProgeminiCertificate from "@/components/certificate/ProgeminiCertificate";
import ProgeminiMarkSheet, { MarksheetModule } from "@/components/marksheet/ProgeminiMarkSheet";
import { downloadCertificatePdf } from "@/lib/certificatePdf";
import { downloadMarkSheetPdf } from "@/lib/marksheetPdf";
import { apiClient } from "@/lib/apiClient";

const DEFAULT_MARK_SHEET_MODULES: MarksheetModule[] = [
  {
    code: "CIM6",
    subject: "Contemporary Issues in Management",
    level: "6",
    marks: 64,
    ukCredits: 20,
    ectsCredits: 10,
  },
  {
    code: "CS3",
    subject: "Corporate Strategy",
    level: "6",
    marks: 58,
    ukCredits: 20,
    ectsCredits: 10,
  },
  {
    code: "ITM6",
    subject: "Strategic Information Technology Management",
    level: "6",
    marks: 63,
    ukCredits: 20,
    ectsCredits: 10,
  },
  {
    code: "KB301",
    subject: "Global Marketing",
    level: "6",
    marks: 66,
    ukCredits: 20,
    ectsCredits: 10,
  },
  {
    code: "ITPM3",
    subject: "Information Technology Management",
    level: "6",
    marks: 55,
    ukCredits: 20,
    ectsCredits: 10,
  },
  {
    code: "HFC",
    subject: "Human Factors in Computing",
    level: "6",
    marks: 70,
    ukCredits: 20,
    ectsCredits: 10,
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  studentProfile?: {
    studentId?: string | null;
    program?: string | null;
    isCertified?: boolean;
    certifiedAt?: string | Date | null;
  } | null;
  applications?: any[];
}

interface StudentRecordsClientProps {
  user: User;
  initialCertificates?: any[];
  initialMarksheet?: any | null;
}

export default function StudentRecordsClient({
  user,
  initialCertificates = [],
  initialMarksheet = null,
}: StudentRecordsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"certificate" | "marksheet">(
    tabParam === "marksheet" ? "marksheet" : "certificate"
  );

  const [certificates, setCertificates] = useState<any[]>(initialCertificates);
  const [marksheet, setMarksheet] = useState<any | null>(initialMarksheet);
  const [loading, setLoading] = useState(initialCertificates.length === 0);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingMarksheet, setDownloadingMarksheet] = useState(false);

  // Sync tab with URL parameter if it changes
  useEffect(() => {
    if (tabParam === "marksheet") {
      setActiveTab("marksheet");
    } else if (tabParam === "certificate") {
      setActiveTab("certificate");
    }
  }, [tabParam]);

  // Load records from API if not preloaded
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [certRes, msRes] = await Promise.allSettled([
          apiClient.get<any>(`/v1/certificates/user/${user.id}`),
          apiClient.get<any>(`/v1/marksheets/user/${user.id}`),
        ]);

        if (isMounted) {
          if (certRes.status === "fulfilled" && certRes.value?.data) {
            const certData = Array.isArray(certRes.value.data)
              ? certRes.value.data
              : [certRes.value.data];
            // Only keep published certificates
            const published = certData.filter(
              (c: any) => c.status === "PUBLISHED"
            );
            setCertificates(published);
          }

          if (msRes.status === "fulfilled" && msRes.value?.data) {
            const msData = Array.isArray(msRes.value.data)
              ? msRes.value.data[0]
              : msRes.value.data;
            setMarksheet(msData || null);
          }
        }
      } catch (err) {
        console.error("Failed to load student records:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const activeCert = certificates.find((c) => c.status === "PUBLISHED") || certificates[0];
  const isPublished = Boolean(activeCert && activeCert.status === "PUBLISHED");

  const sp = user.studentProfile || {};
  const studentId =
    marksheet?.studentId ||
    activeCert?.studentId ||
    sp.studentId ||
    activeCert?.certificateId ||
    "2301-IBM-0101";

  const qualification =
    marksheet?.courseTitle ||
    activeCert?.courseTitle ||
    sp.program ||
    "BSc (Hons) International Business Management";

  const mainFieldOfStudy =
    marksheet?.mainFieldOfStudy || "Business and Management";

  const issueDate =
    marksheet?.issueDate || activeCert?.issueDate || new Date().toISOString();

  const modules: MarksheetModule[] =
    marksheet?.modules && Array.isArray(marksheet.modules) && marksheet.modules.length > 0
      ? marksheet.modules
      : DEFAULT_MARK_SHEET_MODULES;

  const totalUkCredits =
    marksheet?.totalUkCredits ||
    modules.reduce((acc, m) => acc + (Number(m.ukCredits) || 0), 0);

  const totalEctsCredits =
    marksheet?.totalEctsCredits ||
    modules.reduce((acc, m) => acc + (Number(m.ectsCredits) || 0), 0);

  // Download Certificate PDF
  const handleDownloadCertificate = async () => {
    if (!activeCert) return;
    try {
      setDownloadingCert(true);
      toast.loading("Generating official degree certificate PDF...", { id: "std-cert-pdf" });
      const safeName = (user.name || "Student").replace(/\s+/g, "_");
      await downloadCertificatePdf({
        filename: `Progemini_Certificate_${safeName}.pdf`,
        certificateId: activeCert.id,
        certificateData: {
          studentName: activeCert.studentName || user.name,
          courseTitle: activeCert.courseTitle || qualification,
          grade: activeCert.grade,
          issueDate: activeCert.issueDate,
          learningHours: activeCert.learningHours,
          studentId: studentId,
          certificateId: activeCert.certificateId,
          encryptedToken: activeCert.encryptedToken,
          verificationUrl: activeCert.verificationUrl,
        },
      });
      toast.success("Certificate PDF downloaded successfully!", { id: "std-cert-pdf" });
    } catch (err: any) {
      console.error("Certificate PDF error:", err);
      toast.error("Failed to generate PDF. You can also use Print.", { id: "std-cert-pdf" });
    } finally {
      setDownloadingCert(false);
    }
  };

  // Download Marksheet PDF
  const handleDownloadMarksheet = async () => {
    try {
      setDownloadingMarksheet(true);
      toast.loading("Generating official academic marksheet PDF...", { id: "std-ms-pdf" });
      const safeName = (user.name || "Student").replace(/\s+/g, "_");
      await downloadMarkSheetPdf({
        elementId: "progemini-official-marksheet",
        filename: `${safeName}_Official_Academic_Mark_Sheet.pdf`,
        marksheetId: marksheet?.id,
        marksheetData: {
          studentName: user.name || "Student",
          studentId: studentId,
          qualification: qualification,
          mainFieldOfStudy: mainFieldOfStudy,
          level: marksheet?.level || "Level 6 - Bachelor's Degree",
          language: marksheet?.language || "English",
          modeOfStudy: marksheet?.modeOfStudy || "Online / Campus",
          programmeLength: marksheet?.programmeLength || "3 Years",
          creditRequirement: marksheet?.creditRequirement || "120 UK Credits / 60 ECTS Credits",
          overallAverage: marksheet?.overallAverage || "62%",
          classification: marksheet?.classification || "Upper Second Class",
          totalUkCredits: totalUkCredits,
          totalEctsCredits: totalEctsCredits,
          issueDate: issueDate,
          modules: modules,
          encryptedToken: activeCert?.encryptedToken,
          verificationUrl: activeCert?.verificationUrl,
        },
      });
      toast.success("Official Mark Sheet PDF generated successfully!", { id: "std-ms-pdf" });
    } catch (err: any) {
      console.error("Marksheet PDF error:", err);
      toast.error("Failed to generate PDF. You can also use Print.", { id: "std-ms-pdf" });
    } finally {
      setDownloadingMarksheet(false);
    }
  };

  const handleTabSwitch = (tab: "certificate" | "marksheet") => {
    setActiveTab(tab);
    router.push(`/student/records?tab=${tab}`);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#7a0019] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-600">Loading academic records...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STATE A: CERTIFICATE NOT PUBLISHED -> FINAL PROGRESS NOT ACHIEVED
  // ─────────────────────────────────────────────────────────────
  if (!isPublished) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="card p-8 sm:p-12 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl shadow-sm mb-6 border border-amber-200/80">
            <FaClock />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            Final Progress is not achieved
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
            Official degree certificates and academic marksheets are released following administrative
            graduation clearance and official publication. Your records have not yet been published by
            ProGemini Academy Administration.
          </p>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 max-w-lg mx-auto text-left flex items-start gap-3">
            <FaShieldAlt className="text-gray-400 mt-1 flex-shrink-0 text-base" />
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Clearance & Award Verification</p>
              <p>
                Once all required coursework modules are graded and approved by the academic board, your
                official degree certificate and comprehensive academic marksheet will be unlocked here for
                viewing and vector PDF export.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STATE B: CERTIFICATE PUBLISHED -> RECORDS HUB (CERTIFICATE & MARKSHEET)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <FaGraduationCap className="text-[#7a0019]" />
            Official Academic Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Student: <span className="font-semibold text-gray-800">{user.name}</span> • ID:{" "}
            <span className="font-mono font-semibold text-gray-800">{studentId}</span>
          </p>
        </div>

        {/* Tab Controls: Certificate vs Academic Marksheet */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => handleTabSwitch("certificate")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "certificate"
                ? "bg-[#7a0019] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
            }`}
          >
            <FaCertificate />
            Certificate
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("marksheet")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "marksheet"
                ? "bg-[#7a0019] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
            }`}
          >
            <FaFileAlt />
            Academic Marksheet
          </button>
        </div>
      </div>

      {/* ───────────────── VIEW: DEGREE CERTIFICATE ───────────────── */}
      {activeTab === "certificate" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Bar: Title & Download PDF Button Only (No Extra Clutter) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FaCertificate className="text-[#c59b27]" />
                Certificate of Completion
              </h2>
              <p className="text-xs text-gray-500">
                Official Authenticated Digital Credential • Certificate ID: {activeCert.certificateId}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadCertificate}
                disabled={downloadingCert}
                className="px-5 py-2.5 bg-[#7a0019] hover:bg-[#600014] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <FaDownload />
                {downloadingCert ? "Generating PDF..." : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <FaPrint />
                Print
              </button>
            </div>
          </div>

          {/* Clean Certificate Component (No Extra Things) */}
          <div className="bg-gray-100/70 p-4 sm:p-8 rounded-2xl border border-gray-200 overflow-x-auto flex justify-center">
            <div className="shadow-2xl rounded-sm">
              <ProgeminiCertificate
                id="progemini-official-certificate"
                studentName={activeCert.studentName || user.name}
                courseTitle={activeCert.courseTitle || qualification}
                grade={activeCert.grade}
                issueDate={activeCert.issueDate}
                learningHours={activeCert.learningHours}
                studentId={studentId}
                certificateId={activeCert.certificateId}
                encryptedToken={activeCert.encryptedToken}
                verificationUrl={activeCert.verificationUrl}
                isPublished={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── VIEW: ACADEMIC MARKSHEET ───────────────── */}
      {activeTab === "marksheet" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Bar: Title & Download PDF Button Only */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FaFileAlt className="text-[#7a0019]" />
                Official Academic Mark Sheet
              </h2>
              <p className="text-xs text-gray-500">
                UK & ECTS Credit Transcript • Awarded by ProGemini Academy
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadMarksheet}
                disabled={downloadingMarksheet}
                className="px-5 py-2.5 bg-[#7a0019] hover:bg-[#600014] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <FaDownload />
                {downloadingMarksheet ? "Rendering PDF..." : "Download Marksheet PDF"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <FaPrint />
                Print
              </button>
            </div>
          </div>

          {/* Clean Marksheet Component */}
          <div className="bg-gray-100/70 p-4 sm:p-8 rounded-2xl border border-gray-200 overflow-x-auto flex justify-center">
            <div className="shadow-2xl rounded-sm">
              <ProgeminiMarkSheet
                id="progemini-official-marksheet"
                studentName={user.name || "Student"}
                studentId={studentId}
                qualification={qualification}
                mainFieldOfStudy={mainFieldOfStudy}
                level={marksheet?.level || "Level 6 - Bachelor's Degree"}
                language={marksheet?.language || "English"}
                modeOfStudy={marksheet?.modeOfStudy || "Online / Campus"}
                programmeLength={marksheet?.programmeLength || "3 Years"}
                creditRequirement={marksheet?.creditRequirement || "120 UK Credits / 60 ECTS Credits"}
                overallAverage={marksheet?.overallAverage || "62%"}
                classification={marksheet?.classification || "Upper Second Class"}
                totalUkCredits={totalUkCredits}
                totalEctsCredits={totalEctsCredits}
                issueDate={issueDate}
                modules={modules}
                encryptedToken={activeCert?.encryptedToken}
                verificationUrl={activeCert?.verificationUrl}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
