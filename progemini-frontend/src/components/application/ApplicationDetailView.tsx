"use client";

import React from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaClock,
  FaCheck,
  FaTimes,
  FaUser,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaDownload,
  FaGraduationCap,
  FaBookOpen,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaCalendarAlt,
} from "react-icons/fa";
import ApplicationReviewForm from "./ApplicationReviewForm";
import { getFileUrl } from "@/lib/utils";

interface ApplicationDetailViewProps {
  application: any;
  onBack?: () => void;
  onBackHref?: string;
  onUpdated?: (updated: any) => void;
  showReviewForm?: boolean;
}

export default function ApplicationDetailView({
  application,
  onBack,
  onBackHref,
  onUpdated,
  showReviewForm = true,
}: ApplicationDetailViewProps) {
  if (!application) {
    return (
      <div className="p-8 text-center text-gray-500">
        No application details available.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_REVIEW":
        return (
          <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1.5">
            <FaClock className="text-yellow-600" /> In Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1.5">
            <FaCheck className="text-green-600" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1.5">
            <FaTimes className="text-red-600" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getFileIcon = (mimeType: string = "") => {
    const lower = mimeType.toLowerCase();
    if (lower.includes("pdf")) return <FaFilePdf className="text-red-500 text-xl" />;
    if (lower.includes("image") || lower.includes("png") || lower.includes("jpg") || lower.includes("jpeg")) {
      return <FaFileImage className="text-blue-500 text-xl" />;
    }
    if (lower.includes("word") || lower.includes("document") || lower.includes("msword")) {
      return <FaFileWord className="text-blue-600 text-xl" />;
    }
    return <FaDownload className="text-gray-500 text-xl" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const userObj = application.user || {};
  const courseObj = application.course || {};
  const filesList = application.files || [];

  return (
    <div className="space-y-6">
      {/* Navigation / Back */}
      {(onBack || onBackHref) && (
        <div className="flex items-center justify-between pb-2">
          {onBackHref ? (
            <Link
              href={onBackHref}
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              <FaArrowLeft /> Back to Applications
            </Link>
          ) : (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              <FaArrowLeft /> Back
            </button>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className={`grid grid-cols-1 ${showReviewForm ? "lg:grid-cols-3" : ""} gap-6`}>
        {/* Left Column (Span 2) */}
        <div className={`${showReviewForm ? "lg:col-span-2" : "w-full"} space-y-6`}>
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  Submitted on{" "}
                  {application.createdAt
                    ? new Date(application.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>{getStatusBadge(application.status)}</div>
            </div>

            {/* Student & Course Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Student Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                {userObj.avatar ? (
                  <img
                    src={userObj.avatar}
                    alt={userObj.name || "Student"}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {userObj.name ? userObj.name.charAt(0).toUpperCase() : <FaUser />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Applicant
                  </span>
                  <h3 className="font-bold text-gray-900 truncate">
                    {userObj.name || `${application.firstName || ""} ${application.lastName || ""}`.trim() || "Student"}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{userObj.email || application.email}</p>
                  {userObj.id && (
                    <Link
                      href={`/admin/users/${userObj.id}`}
                      className="text-primary text-xs font-medium hover:underline inline-block mt-1"
                    >
                      View Student Profile →
                    </Link>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl flex-shrink-0">
                  <FaBookOpen />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Target Programme
                  </span>
                  <h3 className="font-bold text-gray-900 truncate">
                    {courseObj.title || "Selected Course"}
                  </h3>
                  {courseObj.id && (
                    <Link
                      href={`/courses/${courseObj.slug || courseObj.id}`}
                      target="_blank"
                      className="text-primary text-xs font-medium hover:underline inline-block mt-1"
                    >
                      View Course Page →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FaUser className="text-primary text-sm" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">First Name</label>
                <p className="font-semibold text-gray-800">{application.firstName || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Last Name</label>
                <p className="font-semibold text-gray-800">{application.lastName || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email Address</label>
                <p className="font-semibold text-gray-800">{application.email || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</label>
                <p className="font-semibold text-gray-800">{application.phone || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Date of Birth</label>
                <p className="font-semibold text-gray-800">
                  {application.dateOfBirth
                    ? new Date(application.dateOfBirth).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Gender</label>
                <p className="font-semibold text-gray-800">{application.gender || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Nationality</label>
                <p className="font-semibold text-gray-800">{application.nationality || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Country of Residence</label>
                <p className="font-semibold text-gray-800">{application.country || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Residential Address</label>
                <p className="font-semibold text-gray-800">
                  {[application.address, application.city, application.state, application.zipCode]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FaGraduationCap className="text-primary text-base" /> Academic Background & Experience
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Highest Education</label>
                <p className="font-semibold text-gray-800">{application.highestEducation || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Institution Name</label>
                <p className="font-semibold text-gray-800">{application.institutionName || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Field of Study</label>
                <p className="font-semibold text-gray-800">{application.fieldOfStudy || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Graduation Year</label>
                <p className="font-semibold text-gray-800">{application.graduationYear || "—"}</p>
              </div>
              {application.gpa && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">GPA / Result</label>
                  <p className="font-semibold text-gray-800">{application.gpa}</p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">English Proficiency</label>
                <p className="font-semibold text-gray-800">{application.englishProficiency || "—"}</p>
              </div>
              {application.previousCourses && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Previous Relevant Courses</label>
                  <p className="font-semibold text-gray-800 whitespace-pre-line">{application.previousCourses}</p>
                </div>
              )}
              {application.workExperience && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Work Experience</label>
                  <p className="font-semibold text-gray-800 whitespace-pre-line">{application.workExperience}</p>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaFilePdf className="text-red-500" /> Submitted Documents
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {filesList.length} {filesList.length === 1 ? "document" : "documents"}
              </span>
            </div>

            {filesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filesList.map((file: any) => {
                  const downloadLink = getFileUrl(file.fullUrl || `/api/v1/files/download/${file.slug}`);

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl bg-gray-50/70 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-xs flex-shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-gray-900 truncate" title={file.originalName || file.fileName}>
                            {file.originalName || file.fileName}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {formatFileSize(file.fileSize)}
                            {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <a
                        href={downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs"
                      >
                        <FaDownload className="text-[10px]" /> Download
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 italic bg-gray-50 rounded-lg">
                No submitted documents attached to this application.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Application Review Form */}
        {showReviewForm && (
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <ApplicationReviewForm application={application} onUpdated={onUpdated} />

              {application.reviewedAt && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-600">
                  <p className="font-semibold text-gray-700 mb-1">Audit Record</p>
                  <p>
                    Last reviewed on{" "}
                    {new Date(application.reviewedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
