"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  FaEnvelope,
  FaPhone,
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaIdCard,
  FaGraduationCap,
  FaPassport,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserFriends,
  FaQrcode,
  FaClock,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import { getFileUrl } from "@/lib/utils";

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
  createdAt: Date | string;
  studentProfile?: StudentProfile | null;
  enrollments?: any[];
  _count?: {
    enrollments?: number;
    reviews?: number;
  };
}

interface StudentProfileClientProps {
  user: User;
}

export default function StudentProfileClient({ user: initialUser }: StudentProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const sp = user?.studentProfile || {};

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    passport: sp?.passport || "",
    nationality: sp?.nationality || "",
    address: sp?.address || user?.address || "",
    nextOfKinName: sp?.nextOfKinName || "",
    nextOfKinRelationship: sp?.nextOfKinRelationship || "",
    nextOfKinPhone: sp?.nextOfKinPhone || "",
    nextOfKinEmail: sp?.nextOfKinEmail || "",
    dateOfBirth: sp?.dateOfBirth ? new Date(sp.dateOfBirth).toISOString().split("T")[0] : "",
    gender: sp?.gender || "",
    bio: user?.bio || "",
  });

  const formatDate = (val: string | Date | null | undefined) => {
    if (!val) return null;
    try {
      return new Date(val).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(val);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for required fields
    if (!formData.name.trim()) return toast.error("Full Name is required");
    if (!formData.phone.trim()) return toast.error("Contact phone number is required");
    if (!formData.passport.trim()) return toast.error("Passport number is required");
    if (!formData.nationality.trim()) return toast.error("Nationality is required");
    if (!formData.address.trim()) return toast.error("Address is required");

    setLoading(true);

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        passport: formData.passport.trim(),
        nationality: formData.nationality.trim(),
        address: formData.address.trim(),
        nextOfKinName: formData.nextOfKinName.trim() || null,
        nextOfKinRelationship: formData.nextOfKinRelationship || null,
        nextOfKinPhone: formData.nextOfKinPhone.trim() || null,
        nextOfKinEmail: formData.nextOfKinEmail.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
      };

      const res = await apiClient.put<any>("/v1/student/profile", payload);
      const updated = res?.profile || res;
      setUser(updated);
      toast.success("Student profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      toast.error("Please select a valid image (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be less than 5MB for ID standards.");
      return;
    }

    setUploadingPhoto(true);
    const photoForm = new FormData();
    photoForm.append("file", file);

    try {
      const res = await apiClient.upload<any>("/v1/student/profile/avatar", photoForm);
      if (res?.avatarUrl) {
        setUser((prev) => ({
          ...prev,
          avatar: res.avatarUrl,
        }));
        toast.success("Profile photo uploaded successfully!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      passport: sp?.passport || "",
      nationality: sp?.nationality || "",
      address: sp?.address || user?.address || "",
      nextOfKinName: sp?.nextOfKinName || "",
      nextOfKinRelationship: sp?.nextOfKinRelationship || "",
      nextOfKinPhone: sp?.nextOfKinPhone || "",
      nextOfKinEmail: sp?.nextOfKinEmail || "",
      dateOfBirth: sp?.dateOfBirth ? new Date(sp.dateOfBirth).toISOString().split("T")[0] : "",
      gender: sp?.gender || "",
      bio: user?.bio || "",
    });
    setIsEditing(false);
  };

  // Real student-provided data completeness calculation
  const requiredFields = [
    { label: "Full Name", value: user?.name },
    { label: "Verified Contact", value: user?.phone },
    { label: "Verified Email", value: user?.email },
    { label: "Passport", value: sp?.passport },
    { label: "Nationality", value: sp?.nationality },
    { label: "Address", value: sp?.address || user?.address },
    { label: "Profile Photo", value: user?.avatar },
  ];

  const completedFields = requiredFields.filter((f) => Boolean(f.value?.trim?.() || f.value)).length;
  const isProfileComplete = completedFields === requiredFields.length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  return (
    <div className="container mx-auto px-3 sm:px-6 py-6 max-w-7xl">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaIdCard className="text-brand-primary" />
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Official institutional records, verified student credentials, and Digital Student ID.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-red-700 text-white font-medium text-sm transition shadow-sm"
        >
          <FaEdit />
          Edit Profile Information
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Student ID Card & Photo Upload (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Official Digital Student ID Card */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-secondary rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-700">
            {/* Holographic / decorative background accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold block">
                  ProGemini Academy
                </span>
                <span className="text-xs font-semibold tracking-wider text-gray-300">
                  DIGITAL STUDENT ID
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                <FaQrcode className="text-yellow-400 text-lg" />
              </div>
            </div>

            {/* Photo & Identity Hero */}
            <div className="text-center">
              <div className="relative inline-block mx-auto mb-3">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-brand-primary shadow-lg bg-gray-800 relative mx-auto">
                  {user.avatar ? (
                    <Image
                      src={getFileUrl(user.avatar)}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                      <FaUser className="text-3xl mb-1 text-gray-500" />
                      <span className="text-[10px]">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Upload Action Overlay */}
                <div className="mt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="text-[11px] font-semibold text-yellow-300 hover:text-yellow-200 inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full border border-white/20 transition disabled:opacity-50"
                  >
                    <FaCamera className="text-[10px]" />
                    {user.avatar ? "Change Photo" : "Upload Photo"}
                  </button>
                </div>

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center text-xs text-yellow-300 font-semibold">
                    Uploading photo...
                  </div>
                )}
              </div>

              <h2 className="text-lg font-bold text-white tracking-wide">{user.name}</h2>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  sp?.studentId
                    ? "bg-red-600/30 text-red-300 border border-red-500/30"
                    : "bg-gray-700/60 text-gray-400 border border-gray-600/30"
                }`}
              >
                {sp?.studentId ? `ID: ${sp.studentId}` : "ID: Pending Assignment"}
              </span>
            </div>

            {/* ID Card Metadata */}
            <div className="mt-4 pt-3 border-t border-gray-700/60 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">Program:</span>
                <span
                  className={`font-semibold text-right max-w-[200px] truncate ${
                    sp?.program ? "text-gray-100" : "text-gray-500 italic"
                  }`}
                  title={sp?.program || "Not Enrolled"}
                >
                  {sp?.program || "Not Enrolled"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">Started:</span>
                <span
                  className={`font-medium text-right truncate max-w-[200px] ${
                    sp?.startedSemester || sp?.startedYear ? "text-gray-200" : "text-gray-500 italic"
                  }`}
                >
                  {sp?.startedSemester || sp?.startedYear
                    ? `${sp?.startedSemester || ""} ${sp?.startedYear || ""}`.trim()
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-400">Status:</span>
                {isProfileComplete ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-green-400">
                    <FaCheckCircle className="text-[10px]" /> Verified Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                    <FaClock className="text-[10px]" /> Incomplete Profile
                  </span>
                )}
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-center">
              <div className="font-mono tracking-widest text-[9px] text-gray-400">
                || | ||| |||| | ||| || ||||| ||| || | ||
              </div>
              <span className="text-[9px] text-gray-500 block mt-0.5">
                Official Digital Credential • ProGemini Academy
              </span>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="card p-5 bg-white shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <FaCheckCircle className={isProfileComplete ? "text-green-500" : "text-yellow-500"} />
                Profile Completion
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {completionPercentage}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isProfileComplete ? "bg-green-500" : "bg-brand-primary"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              {requiredFields.map((field) => {
                const filled = Boolean(field.value?.trim?.() || field.value);
                return (
                  <div key={field.label} className="flex items-center justify-between">
                    <span className="text-gray-600">{field.label}</span>
                    {filled ? (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <FaCheckCircle className="text-[10px]" /> Complete
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold flex items-center gap-1">
                        <FaExclamationTriangle className="text-[10px]" /> Required
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
            >
              <FaCamera className="text-brand-primary" />
              Upload ID Standard Photo
            </button>
          </div>
        </div>

        {/* Right Column: Institutional & Identity Details Sections (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Academic & Institutional Records */}
          <div className="card p-5 sm:p-6 bg-white shadow-sm border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaGraduationCap className="text-brand-primary" />
                Academic & Institutional Records
              </h2>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                Admin Managed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 text-xs block font-medium">Student ID</span>
                {sp?.studentId ? (
                  <span className="font-bold text-brand-primary mt-0.5 block text-sm">{sp.studentId}</span>
                ) : (
                  <span className="text-gray-400 italic mt-0.5 block">Pending Assignment</span>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 text-xs block font-medium">Academic Program</span>
                {sp?.program ? (
                  <span className="font-semibold text-gray-900 mt-0.5 block">{sp.program}</span>
                ) : (
                  <span className="text-gray-400 italic mt-0.5 block">Pending Admission</span>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 text-xs block font-medium">Started Semester & Year</span>
                {sp?.startedSemester || sp?.startedYear ? (
                  <span className="font-semibold text-gray-900 mt-0.5 block">
                    {`${sp?.startedSemester || ""} ${sp?.startedYear || ""}`.trim()}
                  </span>
                ) : (
                  <span className="text-gray-400 italic mt-0.5 block">Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Identity Details */}
          <div className="card p-5 sm:p-6 bg-white shadow-sm border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaPassport className="text-brand-primary" />
                Personal & Identity Details
              </h2>
              <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                Required Info
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 text-xs font-medium block">Full Name *</span>
                <span className="font-bold text-gray-900 mt-1 block">{user.name}</span>
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block">Verified Contact *</span>
                {user.phone ? (
                  <span className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                    <FaPhone className="text-green-600 text-xs" />
                    {user.phone}
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-500 hover:text-red-700 font-semibold mt-1 flex items-center gap-1 text-xs"
                  >
                    <FaExclamationTriangle className="text-[10px]" /> Not Provided (Add)
                  </button>
                )}
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block">Verified Email *</span>
                <span className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5 truncate" title={user.email}>
                  <FaEnvelope className="text-blue-600 text-xs flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block">Passport *</span>
                {sp?.passport ? (
                  <span className="font-bold text-brand-primary mt-1 block">{sp.passport}</span>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-500 hover:text-red-700 font-semibold mt-1 flex items-center gap-1 text-xs"
                  >
                    <FaExclamationTriangle className="text-[10px]" /> Not Provided (Add)
                  </button>
                )}
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block">Nationality *</span>
                {sp?.nationality ? (
                  <span className="font-semibold text-gray-800 mt-1 flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-xs" />
                    {sp.nationality}
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-500 hover:text-red-700 font-semibold mt-1 flex items-center gap-1 text-xs"
                  >
                    <FaExclamationTriangle className="text-[10px]" /> Not Provided (Add)
                  </button>
                )}
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block">Date of Birth</span>
                {sp?.dateOfBirth ? (
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
                {sp?.gender ? (
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
          <div className="card p-5 sm:p-6 bg-white shadow-sm border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaUserFriends className="text-brand-primary" />
                Next of Kin & Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 text-xs block font-medium">Next of Kin Relationship</span>
                {sp?.nextOfKinRelationship ? (
                  <span className="font-bold text-gray-900 mt-1 block">{sp.nextOfKinRelationship}</span>
                ) : (
                  <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 text-xs block font-medium">Next of Kin Name</span>
                {sp?.nextOfKinName ? (
                  <span className="font-bold text-gray-900 mt-1 block">{sp.nextOfKinName}</span>
                ) : (
                  <span className="text-gray-400 italic mt-1 block">Not Provided</span>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-500 text-xs block font-medium">Contact Phone Number</span>
                {sp?.nextOfKinPhone ? (
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
                {sp?.nextOfKinEmail ? (
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
                <span className="text-gray-500 text-xs block font-medium">Address *</span>
                {sp?.address || user?.address ? (
                  <span className="font-medium text-gray-900 mt-1 flex items-start gap-1.5">
                    <FaMapMarkerAlt className="text-brand-primary mt-1 text-xs flex-shrink-0" />
                    <span>{sp?.address || user?.address}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-500 hover:text-red-700 font-semibold mt-1 flex items-center gap-1 text-xs"
                  >
                    <FaExclamationTriangle className="text-[10px]" /> Not Provided (Add)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Student Profile</h3>
                <p className="text-xs text-gray-500">
                  Update your official identity, next of kin contact, and address.
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Required Information Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Required Information (Mandatory for Profile Completion)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Sikandar Sifat"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Verified Contact (Phone) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 01633606911"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Passport Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="passport"
                      value={formData.passport}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter passport number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Bangladesh"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      placeholder="Full residential address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Next of Kin Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div>
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
                </div>
              </div>

              {/* Personal & Demographic Details */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Demographic Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
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
