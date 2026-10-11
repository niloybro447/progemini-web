"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  FaBook,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaGraduationCap,
  FaPlus,
  FaPrint,
  FaRedo,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import ProgeminiMarkSheet, {
  MarksheetModule,
} from "@/components/marksheet/ProgeminiMarkSheet";
import { downloadMarkSheetPdf } from "@/lib/marksheetPdf";

interface MarksheetData {
  id?: string;
  userId: string;
  studentId?: string | null;
  courseTitle: string;
  mainFieldOfStudy?: string | null;
  level?: string | null;
  language?: string | null;
  modeOfStudy?: string | null;
  programmeLength?: string | null;
  creditRequirement?: string | null;
  overallAverage?: string | null;
  classification?: string | null;
  totalUkCredits?: number | null;
  totalEctsCredits?: number | null;
  issueDate?: string | Date | null;
  semester?: string | null;
  academicYear?: string | null;
  gpa?: string | null;
  status?: string;
  modules: MarksheetModule[];
  remarks?: string | null;
}

interface AdminMarksheetTabProps {
  user: {
    id: string;
    name: string;
    studentProfile?: {
      studentId?: string | null;
      program?: string | null;
      startedSemester?: string | null;
      startedYear?: string | null;
    } | null;
    applications?: Array<{
      status: string;
      course?: {
        id?: string;
        title?: string;
        category?: {
          name?: string;
        };
      };
    }>;
    certificates?: Array<{
      id?: string;
      issueDate?: string | Date;
    }>;
  };
}

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

export default function AdminMarksheetTab({ user }: AdminMarksheetTabProps) {
  const marksheetRef = useRef<HTMLDivElement>(null);
  const sp = user.studentProfile || {};

  // Find approved course category or default
  const approvedApp = user.applications?.find((a) => a.status === "APPROVED");
  const firstApp = user.applications?.[0];
  const detectedCategory =
    approvedApp?.course?.category?.name ||
    firstApp?.course?.category?.name ||
    "Business Studies";

  const detectedProgram =
    sp.program ||
    approvedApp?.course?.title ||
    firstApp?.course?.title ||
    "BSc (Hons) International Business";

  const detectedStudentId = sp.studentId || "PG4673109";

  const detectedDate =
    user.certificates?.[0]?.issueDate
      ? new Date(user.certificates[0].issueDate).toISOString().split("T")[0]
      : "2026-09-30";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [marksheet, setMarksheet] = useState<MarksheetData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: detectedStudentId,
    qualification: detectedProgram,
    mainFieldOfStudy: detectedCategory,
    level: "Level 6 - Bachelor's Degree",
    language: "English",
    modeOfStudy: "Online / Campus",
    programmeLength: "3 Years",
    creditRequirement: "120 UK Credits / 60 ECTS Credits",
    issueDate: detectedDate, // Single unified date for Date of Award & Certification Date
    overallAverage: "62%",
    classification: "Upper Second Class",
    status: "PUBLISHED",
    remarks: "",
  });

  const [modules, setModules] = useState<MarksheetModule[]>(DEFAULT_MARK_SHEET_MODULES);

  // Auto-calculated statistics
  const totalUkCredits = modules.reduce((acc, m) => acc + (Number(m.ukCredits) || 0), 0);
  const totalEctsCredits = modules.reduce((acc, m) => acc + (Number(m.ectsCredits) || 0), 0);
  const calculatedAvgNum =
    modules.length > 0
      ? Math.round(
          modules.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) / modules.length
        )
      : 62;

  // Auto calculate classification according to static scheme
  const getSchemeClassification = (avg: number) => {
    if (avg >= 70) return "First Class";
    if (avg >= 60) return "Upper Second Class";
    if (avg >= 50) return "Lower Second Class";
    if (avg >= 40) return "Third Class";
    return "Pass";
  };

  // Load existing marksheet
  useEffect(() => {
    let isMounted = true;
    async function loadMarksheet() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(`/v1/marksheets/user/${user.id}`);
        const sheets = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && sheets.length > 0) {
          const s = sheets[0];
          setMarksheet(s);

          // Populate with saved data
          setFormData({
            studentId: s.studentId || sp.studentId || "PG4673109",
            qualification: s.courseTitle || detectedProgram,
            mainFieldOfStudy: s.mainFieldOfStudy || detectedCategory,
            level: s.level || "Level 6 - Bachelor's Degree",
            language: s.language || "English",
            modeOfStudy: s.modeOfStudy || "Online / Campus",
            programmeLength: s.programmeLength || "3 Years",
            creditRequirement:
              s.creditRequirement || "120 UK Credits / 60 ECTS Credits",
            issueDate: s.issueDate
              ? new Date(s.issueDate).toISOString().split("T")[0]
              : detectedDate,
            overallAverage: s.overallAverage || `${calculatedAvgNum}%`,
            classification:
              s.classification || getSchemeClassification(calculatedAvgNum),
            status: s.status || "PUBLISHED",
            remarks: s.remarks || "",
          });

          if (Array.isArray(s.modules) && s.modules.length > 0) {
            setModules(s.modules);
          }
        }
      } catch (err) {
        console.error("Failed to load marksheet:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMarksheet();
    return () => {
      isMounted = false;
    };
  }, [user.id, sp.studentId, detectedProgram, detectedCategory, detectedDate]);

  // Handle module updates
  const handleUpdateModule = (
    index: number,
    field: keyof MarksheetModule,
    val: any
  ) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], [field]: val };
    setModules(updated);

    // Recompute average and classification automatically
    const newAvg = Math.round(
      updated.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) /
        (updated.length || 1)
    );
    setFormData((prev) => ({
      ...prev,
      overallAverage: `${newAvg}%`,
      classification: getSchemeClassification(newAvg),
    }));
  };

  const handleAddModule = () => {
    const newMod: MarksheetModule = {
      code: `MOD${modules.length + 1}0`,
      subject: "New Modular Subject",
      level: "6",
      marks: 65,
      ukCredits: 20,
      ectsCredits: 10,
    };
    const updated = [...modules, newMod];
    setModules(updated);

    const newAvg = Math.round(
      updated.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) / updated.length
    );
    setFormData((prev) => ({
      ...prev,
      overallAverage: `${newAvg}%`,
      classification: getSchemeClassification(newAvg),
    }));
  };

  const handleDeleteModule = (index: number) => {
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated);

    if (updated.length > 0) {
      const newAvg = Math.round(
        updated.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) / updated.length
      );
      setFormData((prev) => ({
        ...prev,
        overallAverage: `${newAvg}%`,
        classification: getSchemeClassification(newAvg),
      }));
    }
  };

  const handleResetDefaultModules = () => {
    setModules(DEFAULT_MARK_SHEET_MODULES);
    setFormData((prev) => ({
      ...prev,
      overallAverage: "62%",
      classification: "Upper Second Class",
    }));
    toast.success("Reset to official reference modules");
  };

  // Save Marksheet to Database
  const handleSaveMarksheet = async () => {
    try {
      setSaving(true);
      const payload = {
        id: marksheet?.id,
        userId: user.id,
        studentId: formData.studentId,
        courseTitle: formData.qualification,
        mainFieldOfStudy: formData.mainFieldOfStudy,
        level: formData.level,
        language: formData.language,
        modeOfStudy: formData.modeOfStudy,
        programmeLength: formData.programmeLength,
        creditRequirement: formData.creditRequirement,
        overallAverage: formData.overallAverage,
        classification: formData.classification,
        totalUkCredits: totalUkCredits,
        totalEctsCredits: totalEctsCredits,
        issueDate: formData.issueDate,
        status: formData.status,
        modules,
        remarks: formData.remarks,
      };

      const res = await apiClient.post<any>("/v1/admin/marksheets", payload);
      if (res?.data) {
        setMarksheet(res.data);
        toast.success("Official Mark Sheet saved and synced with student profile!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save marksheet");
    } finally {
      setSaving(false);
    }
  };

  // Download High-Resolution A4 PDF
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const cleanName = (user.name || "Student").replace(/\s+/g, "_");
      await downloadMarkSheetPdf({
        elementId: "progemini-official-marksheet",
        filename: `${cleanName}_Official_Mark_Sheet_Progemini.pdf`,
        marksheetId: marksheet?.id,
        marksheetData: {
          studentName: user.name || "Student",
          studentId: formData.studentId,
          qualification: formData.qualification,
          mainFieldOfStudy: formData.mainFieldOfStudy,
          level: formData.level,
          language: formData.language,
          modeOfStudy: formData.modeOfStudy,
          programmeLength: formData.programmeLength,
          creditRequirement: formData.creditRequirement,
          overallAverage: formData.overallAverage,
          classification: formData.classification,
          totalUkCredits: totalUkCredits,
          totalEctsCredits: totalEctsCredits,
          issueDate: formData.issueDate,
          modules,
        },
      });
      toast.success("Official Mark Sheet PDF generated successfully!");
    } catch (err: any) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF. You can also use Print.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ───────────────── ACTION BAR & BANNER ───────────────── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-red-50 to-amber-50 border border-amber-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#7a0019] text-[#c59b27] flex items-center justify-center text-3xl shadow-md">
            <FaFileAlt />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">
              Official Academic Mark Sheet
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveMarksheet}
            disabled={saving}
            className="px-5 py-2.5 bg-[#7a0019] hover:bg-[#600014] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave />
            {saving ? "Saving..." : "Save Mark Sheet"}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2.5 bg-[#c59b27] hover:bg-[#a88424] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaDownload />
            {downloading ? "Rendering PDF..." : "Download A4 PDF"}
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

      {/* ───────────────── 2-COLUMN LAYOUT: EDITABLE CONTROLS & LIVE A4 PREVIEW ───────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & MODULE EDITOR (xl:col-span-6) */}
        <div className="xl:col-span-6 space-y-6">
          {/* Card: Student & Award Details Controls */}
          <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FaGraduationCap className="text-[#7a0019]" />
                Student & Award Information
              </h4>
              <span className="text-[11px] font-medium text-gray-500">
                Synced from profile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Student Name */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="input-field text-xs bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                />
              </div>

              {/* Student ID */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Student Unique ID
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="input-field text-xs font-mono font-semibold"
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Main Field of Study */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Main Field of Study
                </label>
                <input
                  type="text"
                  value={formData.mainFieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, mainFieldOfStudy: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Date of Award & Certification Date */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date of Award
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="input-field text-xs font-medium"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Formatted as Date of Award (e.g. 30 September 2026) and Certification Date (30/09/2026).
                </p>
              </div>

              {/* Level */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Level</label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Mode of Study */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mode of Study</label>
                <input
                  type="text"
                  value={formData.modeOfStudy}
                  onChange={(e) => setFormData({ ...formData, modeOfStudy: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Programme Length */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Programme Length</label>
                <input
                  type="text"
                  value={formData.programmeLength}
                  onChange={(e) => setFormData({ ...formData, programmeLength: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Credit Requirement */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Credit Requirement</label>
                <input
                  type="text"
                  value={formData.creditRequirement}
                  onChange={(e) => setFormData({ ...formData, creditRequirement: e.target.value })}
                  className="input-field text-xs font-medium"
                />
              </div>

              {/* Overall Average */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Overall Average</label>
                <input
                  type="text"
                  value={formData.overallAverage}
                  onChange={(e) => setFormData({ ...formData, overallAverage: e.target.value })}
                  className="input-field text-xs font-bold text-[#7a0019]"
                />
              </div>

              {/* Classification */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Overall Classification</label>
                <input
                  type="text"
                  value={formData.classification}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  className="input-field text-xs font-bold text-amber-700"
                />
              </div>
            </div>
          </div>

          {/* Card: Modular Curriculum & Learning Achievement */}
          <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FaBook className="text-[#7a0019]" />
                  Record of Learning & Achievement ({modules.length} Modules)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Modular grades calculate average ({calculatedAvgNum}%) and total credits automatically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaultModules}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  title="Reset to official template modules"
                >
                  <FaRedo className="text-[10px]" /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-3 py-1.5 bg-[#7a0019] hover:bg-[#600014] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <FaPlus className="text-[10px]" /> Add Module
                </button>
              </div>
            </div>

            {/* Modules Table Editor */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#7a0019] text-white uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Subject Title</th>
                    <th className="py-2.5 px-2 text-center w-14">Lvl</th>
                    <th className="py-2.5 px-2 text-center w-16">Marks (%)</th>
                    <th className="py-2.5 px-2 text-center w-16">UK Cr.</th>
                    <th className="py-2.5 px-2 text-center w-16">ECTS</th>
                    <th className="py-2.5 px-2 text-center w-12">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {modules.map((m, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/40 transition">
                      {/* Code */}
                      <td className="py-2 px-2.5">
                        <input
                          type="text"
                          value={m.code}
                          onChange={(e) => handleUpdateModule(idx, "code", e.target.value)}
                          className="w-20 px-1.5 py-1 border border-gray-300 rounded font-mono text-xs font-bold"
                        />
                      </td>
                      {/* Subject */}
                      <td className="py-2 px-2.5">
                        <input
                          type="text"
                          value={m.subject}
                          onChange={(e) => handleUpdateModule(idx, "subject", e.target.value)}
                          className="w-full min-w-[180px] px-2 py-1 border border-gray-300 rounded text-xs font-medium"
                        />
                      </td>
                      {/* Level */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="text"
                          value={m.level}
                          onChange={(e) => handleUpdateModule(idx, "level", e.target.value)}
                          className="w-10 px-1 py-1 border border-gray-300 rounded text-center text-xs"
                        />
                      </td>
                      {/* Marks */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          value={m.marks}
                          onChange={(e) =>
                            handleUpdateModule(idx, "marks", parseInt(e.target.value, 10) || 0)
                          }
                          className="w-14 px-1 py-1 border border-gray-300 rounded text-center text-xs font-extrabold text-[#7a0019]"
                        />
                      </td>
                      {/* UK Credits */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          value={m.ukCredits}
                          onChange={(e) =>
                            handleUpdateModule(idx, "ukCredits", parseInt(e.target.value, 10) || 0)
                          }
                          className="w-14 px-1 py-1 border border-gray-300 rounded text-center text-xs font-semibold"
                        />
                      </td>
                      {/* ECTS Credits */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          value={m.ectsCredits}
                          onChange={(e) =>
                            handleUpdateModule(idx, "ectsCredits", parseInt(e.target.value, 10) || 0)
                          }
                          className="w-14 px-1 py-1 border border-gray-300 rounded text-center text-xs font-semibold"
                        />
                      </td>
                      {/* Delete */}
                      <td className="py-2 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                          title="Remove module"
                        >
                          <FaTrash className="text-[11px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Summary Table Footer */}
                <tfoot className="bg-[#b8860b] text-white font-bold text-xs">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-right">
                      Aggregated Totals:
                    </td>
                    <td className="py-2.5 px-2 text-center text-sm font-extrabold">
                      {formData.overallAverage}
                    </td>
                    <td className="py-2.5 px-2 text-center text-sm font-extrabold">
                      {totalUkCredits}
                    </td>
                    <td className="py-2.5 px-2 text-center text-sm font-extrabold">
                      {totalEctsCredits}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE OFFICIAL A4 MARK SHEET PREVIEW (xl:col-span-6) */}
        <div className="xl:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FaEye className="text-[#c59b27]" />
              Official Mark Sheet Live A4 Preview
            </h4>
            <span className="text-xs text-gray-500 font-mono">
              Aspect Ratio 1 : 1.414 (A4 Standard)
            </span>
          </div>

          {/* Mark Sheet Document Wrapper */}
          <div className="p-3 bg-gray-100/70 border border-gray-300 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
            <ProgeminiMarkSheet
              ref={marksheetRef}
              studentName={user.name}
              studentId={formData.studentId}
              qualification={formData.qualification}
              mainFieldOfStudy={formData.mainFieldOfStudy}
              issueDate={formData.issueDate}
              level={formData.level}
              language={formData.language}
              modeOfStudy={formData.modeOfStudy}
              programmeLength={formData.programmeLength}
              creditRequirement={formData.creditRequirement}
              overallAverage={formData.overallAverage}
              classification={formData.classification}
              totalUkCredits={totalUkCredits}
              totalEctsCredits={totalEctsCredits}
              modules={modules}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
