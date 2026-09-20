"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaEnvelope,
  FaCalendar,
  FaBook,
  FaEdit,
  FaUser,
  FaPhone,
  FaGraduationCap,
  FaPassport,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserFriends,
  FaSave,
  FaTimes,
  FaUniversity,
  FaSync,
  FaLayerGroup,
  FaIdCard,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import { getFileUrl } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface CourseOption {
  id: string;
  title: string;
  slug?: string;
  categoryId?: string;
  category?: { id: string; name: string };
}

interface StudentProfile {
  id?: string;
  studentId?: string | null;
  program?: string | null;
  startedSemester?: string | null;
  startedYear?: string | null;
  nextOfKinName?: string | null;
  nextOfKinRelationship?: string | null;
  nextOfKinPhone?: string | null;
  nextOfKinEmail?: string | null;
  address?: string | null;
  dateOfBirth?: string | Date | null;
  gender?: string | null;
  nationality?: string | null;
  passport?: string | null;
  isCompleted?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  address?: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  studentProfile?: StudentProfile | null;
  applications?: any[];
  enrollments: any[];
  _count: {
    enrollments: number;
    reviews: number;
  };
}

interface AdminUserDetailClientProps {
  initialUser: User;
}

export default function AdminUserDetailClient({ initialUser }: AdminUserDetailClientProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Course & Category options
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  const sp = user.studentProfile || {};

  const [formData, setFormData] = useState({
    // Academic fields
    studentId: sp.studentId || "",
    program: sp.program || "",
    startedSemester: sp.startedSemester || "",
    startedYear: sp.startedYear || "",

    // Personal & Demographics fields
    name: user.name || "",
    phone: user.phone || "",
    passport: sp.passport || "",
    nationality: sp.nationality || "",
    dateOfBirth: sp.dateOfBirth ? new Date(sp.dateOfBirth).toISOString().split("T")[0] : "",
    gender: sp.gender || "",

    // Next of Kin & Address
    nextOfKinName: sp.nextOfKinName || "",
    nextOfKinRelationship: sp.nextOfKinRelationship || "",
    nextOfKinPhone: sp.nextOfKinPhone || "",
    nextOfKinEmail: sp.nextOfKinEmail || "",
    address: sp.address || user.address || "",

    // Status
    isCompleted: sp.isCompleted ?? false,
  });

  // Fetch all categories and courses on component mount
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const [catsRes, coursesRes] = await Promise.all([
          apiClient.get<any[]>("/v1/categories").catch(() => []),
          apiClient.get<any[]>("/v1/courses").catch(() => []),
        ]);
        if (isMounted) {
          setCategories(Array.isArray(catsRes) ? catsRes : []);
          setCourses(Array.isArray(coursesRes) ? coursesRes : []);
        }
      } catch (err) {
        console.error("Failed to load categories/courses:", err);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const syncCategoryForProgram = useCallback((programName: string, courseList: CourseOption[]) => {
    if (!programName || courseList.length === 0) return;
    const matched = courseList.find(
      (c) => c.title.toLowerCase().trim() === programName.toLowerCase().trim(),
    );
    if (matched?.categoryId) {
      setSelectedCategoryId(matched.categoryId);
    } else if (matched?.category?.id) {
      setSelectedCategoryId(matched.category.id);
    }
  }, []);

  useEffect(() => {
    if (formData.program && courses.length > 0 && !selectedCategoryId) {
      syncCategoryForProgram(formData.program, courses);
    }
  }, [formData.program, courses, selectedCategoryId, syncCategoryForProgram]);

  const triggerAutoGenerateId = async (
    year: string,
    semester: string,
    courseName: string,
    showToast: boolean = false,
  ) => {
    if (!year || !semester || !courseName) {
      if (showToast) {
        toast.error("Please specify Course/Program, Semester, and Year first.");
      }
      return;
    }
    setIsGeneratingId(true);
    try {
      const res = await apiClient.get<{
        success: boolean;
        studentId: string;
        prefix: string;
        sequence: string;
      }>(
        `/v1/admin/students/generate-id?year=${encodeURIComponent(year)}&semester=${encodeURIComponent(semester)}&courseName=${encodeURIComponent(courseName)}&targetUserId=${encodeURIComponent(user.id)}`,
      );
      if (res?.studentId) {
        setFormData((prev) => ({ ...prev, studentId: res.studentId }));
        if (showToast) {
          toast.success(`Generated Student ID: ${res.studentId}`);
        }
      }
    } catch (err: any) {
      console.error("Failed to auto-generate student ID:", err);
      if (showToast) {
        toast.error(err.message || "Failed to generate student ID");
      }
    } finally {
      setIsGeneratingId(false);
    }
  };

  const resetForm = (currentUser: User) => {
    const currentSp = currentUser.studentProfile || {};
    const prog = currentSp.program || "";
    setFormData({
      studentId: currentSp.studentId || "",
      program: prog,
      startedSemester: currentSp.startedSemester || "",
      startedYear: currentSp.startedYear || "",
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      passport: currentSp.passport || "",
      nationality: currentSp.nationality || "",
      dateOfBirth: currentSp.dateOfBirth ? new Date(currentSp.dateOfBirth).toISOString().split("T")[0] : "",
      gender: currentSp.gender || "",
      nextOfKinName: currentSp.nextOfKinName || "",
      nextOfKinRelationship: currentSp.nextOfKinRelationship || "",
      nextOfKinPhone: currentSp.nextOfKinPhone || "",
      nextOfKinEmail: currentSp.nextOfKinEmail || "",
      address: currentSp.address || currentUser.address || "",
      isCompleted: currentSp.isCompleted ?? false,
    });
    if (prog && courses.length > 0) {
      syncCategoryForProgram(prog, courses);
    } else {
      setSelectedCategoryId("");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setSelectedCategoryId(catId);
    if (catId) {
      const coursesInCat = courses.filter((c) => (c.categoryId || c.category?.id) === catId);
      const existsInCat = coursesInCat.some((c) => c.title === formData.program);
      if (!existsInCat) {
        setFormData((prev) => ({ ...prev, program: "" }));
      }
    }
  };

  const handleProgramCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = e.target.value;
    setFormData((prev) => ({ ...prev, program: selectedTitle }));
    if (selectedTitle && formData.startedSemester && formData.startedYear) {
      triggerAutoGenerateId(formData.startedYear, formData.startedSemester, selectedTitle);
    }
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sem = e.target.value;
    setFormData((prev) => ({ ...prev, startedSemester: sem }));
    if (formData.program && sem && formData.startedYear) {
      triggerAutoGenerateId(formData.startedYear, sem, formData.program);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yr = e.target.value;
    setFormData((prev) => ({ ...prev, startedYear: yr }));
    if (formData.program && formData.startedSemester && yr.trim().length >= 4) {
      triggerAutoGenerateId(yr, formData.startedSemester, formData.program);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        studentId: formData.studentId.trim() || null,
        program: formData.program.trim() || null,
        startedSemester: formData.startedSemester || null,
        startedYear: formData.startedYear.trim() || null,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        passport: formData.passport.trim() || null,
        nationality: formData.nationality.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        nextOfKinName: formData.nextOfKinName.trim() || null,
        nextOfKinRelationship: formData.nextOfKinRelationship || null,
        nextOfKinPhone: formData.nextOfKinPhone.trim() || null,
        nextOfKinEmail: formData.nextOfKinEmail.trim() || null,
        address: formData.address.trim() || null,
        isCompleted: formData.isCompleted,
      };

      const res = await apiClient.patch<any>(`/v1/admin/students/${user.id}/profile`, payload);
      const updatedUser = res?.profile || res?.user || res;

      if (updatedUser) {
        setUser((prev) => ({
          ...prev,
          name: updatedUser.name ?? formData.name ?? prev.name,
          phone: updatedUser.phone ?? formData.phone ?? prev.phone,
          address: updatedUser.address ?? formData.address ?? prev.address,
          studentProfile: {
            ...prev.studentProfile,
            ...(updatedUser.studentProfile || updatedUser),
          },
          applications: updatedUser.applications ?? prev.applications,
        }));
      }

      toast.success("Student profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update student profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(date);
    }
  };

  // Digital Student ID Card Clearance evaluation
  const approvedApplications = (user.applications || []).filter(
    (app: any) => app.status === "APPROVED"
  );
  const hasApprovedApp = approvedApplications.length > 0;
  const isProfileComplete = Boolean(sp.isCompleted);
  const hasProgram = Boolean(sp.program && sp.program.trim().length > 0);
  const hasIntake = Boolean(
    sp.startedSemester &&
    sp.startedSemester.trim().length > 0 &&
    sp.startedYear &&
    sp.startedYear.trim().length > 0
  );
  const hasStudentId = Boolean(sp.studentId && sp.studentId.trim().length > 0);
  const isIdCardCleared =
    isProfileComplete && hasApprovedApp && hasProgram && hasIntake && hasStudentId;

  const clearanceMetCount = [
    isProfileComplete,
    hasApprovedApp,
    hasProgram,
    hasIntake,
    hasStudentId,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition shadow-sm"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaUser className="text-brand-primary" />
              {user.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              User ID: <span className="font-mono text-gray-700">{user.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "STUDENT" && (
            <button
              onClick={() => {
                resetForm(user);
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
            >
              <FaEdit />
              Edit Student Records
            </button>
          )}
        </div>
      </div>

      {/* Digital ID Card Clearance Status Banner for Students */}
      {user.role === "STUDENT" && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isIdCardCleared
              ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-200 shadow-sm"
              : "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200 shadow-sm"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${
                  isIdCardCleared ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                }`}
              >
                <FaIdCard />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-base">
                    Digital Student ID Card Status:
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isIdCardCleared
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {isIdCardCleared
                      ? "✓ Cleared & Active (Visible to Student)"
                      : `Locked (${clearanceMetCount}/5 Conditions Cleared)`}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {isIdCardCleared
                    ? "All profile, application approval, academic program, intake, and Student ID criteria are met. The student can view, flip, scan QR, and download their ID card."
                    : "The student will only unlock their digital ID card once all 5 verification conditions are completed and cleared by administration."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              {!isIdCardCleared && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm(user);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <FaEdit />
                  Clear Missing Details
                </button>
              )}
            </div>
          </div>

          {/* Condition Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-black/5 text-xs">
            {/* Condition 1: Profile Completion */}
            <div
              className={`p-2.5 rounded-lg border ${
                isProfileComplete
                  ? "bg-white border-emerald-200 text-emerald-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                {isProfileComplete ? (
                  <FaCheckCircle className="text-emerald-600 text-xs" />
                ) : (
                  <FaTimes className="text-gray-400 text-xs" />
                )}
                1. Profile Complete
              </div>
              <span className="text-[11px] font-medium block mt-0.5 text-gray-700">
                {isProfileComplete ? "Completed (100%)" : "Incomplete"}
              </span>
            </div>

            {/* Condition 2: Application Approval */}
            <div
              className={`p-2.5 rounded-lg border ${
                hasApprovedApp
                  ? "bg-white border-emerald-200 text-emerald-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                {hasApprovedApp ? (
                  <FaCheckCircle className="text-emerald-600 text-xs" />
                ) : (
                  <FaTimes className="text-gray-400 text-xs" />
                )}
                2. App Approved
              </div>
              <span
                className="text-[11px] font-medium block mt-0.5 text-gray-700 truncate"
                title={approvedApplications[0]?.course?.title || ""}
              >
                {hasApprovedApp ? "Approved" : "Pending / None"}
              </span>
            </div>

            {/* Condition 3: Academic Program */}
            <div
              className={`p-2.5 rounded-lg border ${
                hasProgram
                  ? "bg-white border-emerald-200 text-emerald-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                {hasProgram ? (
                  <FaCheckCircle className="text-emerald-600 text-xs" />
                ) : (
                  <FaTimes className="text-gray-400 text-xs" />
                )}
                3. Academic Program
              </div>
              <span
                className="text-[11px] font-medium block mt-0.5 text-gray-700 truncate"
                title={sp.program || ""}
              >
                {sp.program || "Not Cleared"}
              </span>
            </div>

            {/* Condition 4: Started Semester & Year */}
            <div
              className={`p-2.5 rounded-lg border ${
                hasIntake
                  ? "bg-white border-emerald-200 text-emerald-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                {hasIntake ? (
                  <FaCheckCircle className="text-emerald-600 text-xs" />
                ) : (
                  <FaTimes className="text-gray-400 text-xs" />
                )}
                4. Intake & Year
              </div>
              <span className="text-[11px] font-medium block mt-0.5 text-gray-700">
                {hasIntake ? `${sp.startedSemester} ${sp.startedYear}` : "Not Cleared"}
              </span>
            </div>

            {/* Condition 5: Student ID */}
            <div
              className={`p-2.5 rounded-lg border ${
                hasStudentId
                  ? "bg-white border-emerald-200 text-emerald-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                {hasStudentId ? (
                  <FaCheckCircle className="text-emerald-600 text-xs" />
                ) : (
                  <FaTimes className="text-gray-400 text-xs" />
                )}
                5. Student ID
              </div>
              <span className="text-[11px] font-bold block mt-0.5 font-mono text-brand-primary">
                {sp.studentId || "Not Assigned"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Profile Overview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-xl">
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-primary shadow-md bg-gray-100 relative mx-auto mb-3">
                {user.avatar ? (
                  <Image
                    src={getFileUrl(user.avatar)}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-2xl">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1.5">
                <FaEnvelope className="text-xs text-gray-400" />
                <span className="truncate max-w-[220px]" title={user.email}>
                  {user.email}
                </span>
              </p>
            </div>

            <div className="space-y-3.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Role</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Account Status</span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {user.role === "STUDENT" && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Profile Verification</span>
                  {sp.isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <FaCheckCircle className="text-[10px]" /> Verified Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <FaExclamationTriangle className="text-[10px]" /> Incomplete
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <FaCalendar className="text-gray-400 text-xs" />
                  Joined Date
                </span>
                <span className="text-gray-900 font-medium">{formatDate(user.createdAt)}</span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <FaPhone className="text-gray-400 text-xs" />
                    Phone
                  </span>
                  <span className="text-gray-900 font-medium">{user.phone}</span>
                </div>
              )}

              {user.bio && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-xs block font-medium mb-1">Bio</span>
                  <p className="text-gray-700 text-xs leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-2xl font-bold text-brand-primary">
                  {user._count?.enrollments ?? user.enrollments?.length ?? 0}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Enrollments</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-2xl font-bold text-brand-primary">
                  {user._count?.reviews ?? 0}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Reviews</div>
              </div>
            </div>

            {user.role === "STUDENT" && (
              <button
                onClick={() => {
                  resetForm(user);
                  setIsEditModalOpen(true);
                }}
                className="w-full mt-5 py-2 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-brand-primary font-semibold text-xs transition border border-red-200 flex items-center justify-center gap-2"
              >
                <FaEdit />
                Update Student Information
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Student Profile Details & Courses (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {user.role === "STUDENT" && (
            <>
              {/* Section 1: Academic & Institutional Records */}
              <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaGraduationCap className="text-brand-primary" />
                    Institutional & Academic Records
                  </h3>
                  <button
                    onClick={() => {
                      resetForm(user);
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs font-semibold text-brand-primary hover:text-red-700 flex items-center gap-1"
                  >
                    <FaEdit /> Edit Records
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs sm:text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Academic Program</span>
                    {sp.program ? (
                      <span className="font-semibold text-gray-900 mt-0.5 block">{sp.program}</span>
                    ) : (
                      <span className="text-gray-400 italic mt-0.5 block">Not Enrolled</span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Started Semester & Year</span>
                    {sp.startedSemester || sp.startedYear ? (
                      <span className="font-semibold text-gray-900 mt-0.5 block">
                        {`${sp.startedSemester || ""} ${sp.startedYear || ""}`.trim()}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-0.5 block">Not Specified</span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Student ID</span>
                    {sp.studentId ? (
                      <span className="font-bold text-brand-primary mt-0.5 block font-mono tracking-wider">{sp.studentId}</span>
                    ) : (
                      <span className="text-gray-400 italic mt-0.5 block">Not Assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Personal & Identity Details */}
              <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaPassport className="text-brand-primary" />
                    Personal & Identity Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Full Name</span>
                    <span className="font-bold text-gray-900 mt-1 block">{user.name}</span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Verified Contact Phone</span>
                    {user.phone ? (
                      <span className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                        <FaPhone className="text-green-600 text-xs" />
                        {user.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Verified Email</span>
                    <span className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5 truncate" title={user.email}>
                      <FaEnvelope className="text-blue-600 text-xs flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Passport Number</span>
                    {sp.passport ? (
                      <span className="font-bold text-brand-primary mt-1 block">{sp.passport}</span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Nationality</span>
                    {sp.nationality ? (
                      <span className="font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                        <FaGlobe className="text-gray-400 text-xs" />
                        {sp.nationality}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Date of Birth</span>
                    {sp.dateOfBirth ? (
                      <span className="font-medium text-gray-800 mt-1 flex items-center gap-1.5">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        {formatDate(sp.dateOfBirth)}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block">Sex / Gender</span>
                    {sp.gender ? (
                      <span className="font-medium text-gray-800 mt-1 flex items-center gap-1.5">
                        <FaVenusMars className="text-gray-400 text-xs" />
                        {sp.gender}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Next of Kin & Address */}
              <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaUserFriends className="text-brand-primary" />
                    Next of Kin & Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Next of Kin Relationship</span>
                    {sp.nextOfKinRelationship ? (
                      <span className="font-bold text-gray-900 mt-1 block">{sp.nextOfKinRelationship}</span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Next of Kin Name</span>
                    {sp.nextOfKinName ? (
                      <span className="font-bold text-gray-900 mt-1 block">{sp.nextOfKinName}</span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Contact Phone</span>
                    {sp.nextOfKinPhone ? (
                      <span className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                        <FaPhone className="text-brand-primary text-xs" />
                        {sp.nextOfKinPhone}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs block font-medium">Contact Email</span>
                    {sp.nextOfKinEmail ? (
                      <span
                        className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5 truncate"
                        title={sp.nextOfKinEmail}
                      >
                        <FaEnvelope className="text-blue-600 text-xs flex-shrink-0" />
                        <span className="truncate">{sp.nextOfKinEmail}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 sm:col-span-2">
                    <span className="text-gray-500 text-xs block font-medium">Address</span>
                    {sp.address || user.address ? (
                      <span className="font-medium text-gray-900 mt-1 flex items-start gap-1.5">
                        <FaMapMarkerAlt className="text-brand-primary mt-1 text-xs flex-shrink-0" />
                        <span>{sp.address || user.address}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Enrolled Courses Card */}
          <div className="card p-6 bg-white shadow-sm border border-gray-200 rounded-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <FaBook className="mr-2 text-brand-primary" />
              Enrolled Courses ({user.enrollments?.length || 0})
            </h3>
            {user.enrollments && user.enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.enrollments.map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-gray-50/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {enrollment.course?.title || "Untitled Course"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FaCalendarAlt className="text-[10px]" />
                          Enrolled: {formatDate(enrollment.enrolledAt)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          enrollment.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {enrollment.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{enrollment.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-brand-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end">
                      <Link
                        href={`/admin/courses/${enrollment.courseId}`}
                        className="text-xs text-brand-primary hover:underline font-semibold"
                      >
                        View Course →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No courses enrolled yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Edit Student Information Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaEdit className="text-brand-primary" />
                  Edit Student Information (Admin Provisioning)
                </h3>
                <p className="text-xs text-gray-500">
                  Update institutional records, identity, next of kin contact, and address.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Part 1: Institutional & Academic Records */}
              <div>
                <div className="flex items-center justify-between pb-1 mb-3 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaGraduationCap className="text-brand-primary" />
                    Institutional & Academic Records
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                    Automated dynamic ID sequencing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Category Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <FaLayerGroup className="text-gray-400 text-[11px]" />
                      Course Category
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white font-medium text-gray-800"
                    >
                      <option value="">All Categories ({categories.length})</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Academic Program (Course list filtered by category) */}
                  <div className="sm:col-span-1 lg:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between flex-wrap gap-1">
                      <span className="flex items-center gap-1">
                        <FaBook className="text-gray-400 text-[11px]" />
                        Academic Program (Course)
                      </span>
                      <div className="flex items-center gap-2">
                        {approvedApplications.length > 0 &&
                          approvedApplications[0]?.course?.title &&
                          formData.program !== approvedApplications[0].course.title && (
                            <button
                              type="button"
                              onClick={() => {
                                const appCourse = approvedApplications[0].course.title;
                                setFormData((prev) => ({ ...prev, program: appCourse }));
                                syncCategoryForProgram(appCourse, courses);
                                toast.success(`Selected approved course: ${appCourse}`);
                              }}
                              className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-semibold transition"
                            >
                              Auto-fill approved: {approvedApplications[0].course.title.slice(0, 24)}...
                            </button>
                          )}
                        {selectedCategoryId && (
                          <span className="text-[10px] text-brand-primary font-medium">
                            Filtered by category
                          </span>
                        )}
                      </div>
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleProgramCourseChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white font-medium text-gray-900"
                    >
                      <option value="">Select Academic Program / Course</option>
                      {/* Retain current non-matching program if already set */}
                      {formData.program &&
                        !courses.some(
                          (c) => c.title.toLowerCase() === formData.program.toLowerCase(),
                        ) && (
                          <option value={formData.program}>
                            {formData.program} (Current / Custom)
                          </option>
                        )}
                      {courses
                        .filter((c) =>
                          selectedCategoryId
                            ? (c.categoryId || c.category?.id) === selectedCategoryId
                            : true,
                        )
                        .map((c) => (
                          <option key={c.id} value={c.title}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 3. Started Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Started Semester
                    </label>
                    <select
                      name="startedSemester"
                      value={formData.startedSemester}
                      onChange={handleSemesterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white font-medium text-gray-800"
                    >
                      <option value="">Select Semester</option>
                      <option value="Spring">Spring (01)</option>
                      <option value="Summer">Summer (02)</option>
                      <option value="Fall">Fall (03)</option>
                    </select>
                  </div>

                  {/* 4. Started Year */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Started Year
                    </label>
                    <input
                      type="text"
                      name="startedYear"
                      value={formData.startedYear}
                      onChange={handleYearChange}
                      placeholder="e.g. 2026"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none font-medium text-gray-800"
                    />
                  </div>

                  {/* 5. Student ID (Placed AFTER Program, Semester & Year) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <FaIdCard className="text-brand-primary text-[11px]" />
                        Student ID
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          triggerAutoGenerateId(
                            formData.startedYear,
                            formData.startedSemester,
                            formData.program,
                            true,
                          )
                        }
                        disabled={
                          isGeneratingId ||
                          !formData.program ||
                          !formData.startedSemester ||
                          !formData.startedYear
                        }
                        className="text-[11px] text-brand-primary hover:text-red-700 font-semibold flex items-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Auto-generate or refresh student ID"
                      >
                        <FaSync className={isGeneratingId ? "animate-spin" : ""} />
                        {isGeneratingId ? "Generating..." : "⚡ Refresh ID"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="e.g. 2601-MBA-0001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none font-mono font-bold text-brand-primary tracking-wider"
                      />
                      {isGeneratingId && (
                        <div className="absolute right-3 top-2.5">
                          <FaSync className="animate-spin text-brand-primary text-xs" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Format: <span className="font-mono font-medium text-gray-600">YYSEM-COURSE-SEQ</span> (e.g. 2601-MBA-0001). Auto-checked to avoid collisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 2: Personal & Identity Details */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                  <FaPassport className="text-brand-primary" />
                  Personal & Identity Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sikandar Sifat"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Verified Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 01633606911"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      name="passport"
                      value={formData.passport}
                      onChange={handleInputChange}
                      placeholder="Enter passport number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="e.g. Bangladesh"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Sex / Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Part 3: Next of Kin & Address */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                  <FaUserFriends className="text-gray-500" />
                  Next of Kin & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Relationship
                    </label>
                    <select
                      name="nextOfKinRelationship"
                      value={formData.nextOfKinRelationship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Next of Kin Name
                    </label>
                    <input
                      type="text"
                      name="nextOfKinName"
                      value={formData.nextOfKinName}
                      onChange={handleInputChange}
                      placeholder="Next of kin full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      name="nextOfKinPhone"
                      value={formData.nextOfKinPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. 01700000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="nextOfKinEmail"
                      value={formData.nextOfKinEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. nextofkin@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Full residential address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Part 4: Admin Verification Overrides */}
              <div className="pt-4 border-t border-gray-200">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-600" />
                      Official Profile Verification
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Marking as verified and completed acknowledges all institutional and demographic checks.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isCompleted"
                      checked={formData.isCompleted}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <FaSave />
                  {loading ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
