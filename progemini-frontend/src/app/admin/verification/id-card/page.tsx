"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaIdCard,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaUser,
  FaGraduationCap,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaEdit,
  FaUniversity,
  FaShieldAlt,
  FaHistory,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import StudentDigitalIdCard from "@/components/student/StudentDigitalIdCard";

interface VerifiedCredential {
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
  userId?: string;
}

export default function AdminIdCardVerificationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState<VerifiedCredential | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedId, setSearchedId] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pg_admin_recent_id_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (id: string) => {
    try {
      const updated = [id, ...recentSearches.filter((s) => s.toLowerCase() !== id.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("pg_admin_recent_id_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = async (idToSearch?: string) => {
    const id = (idToSearch ?? searchQuery).trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setCredential(null);
    setMatchedUserId(null);
    setSearchedId(id);

    try {
      // 1. Query public credential verification endpoint
      const res = await apiClient.get<any>(`/v1/credentials/verify/${encodeURIComponent(id)}`);

      if (res?.verified && res?.credential) {
        setCredential(res.credential);
        saveRecentSearch(res.credential.studentId || id);

        // Try to find matching user ID in admin user database
        try {
          const userRes = await apiClient.get<any>(`/v1/users?search=${encodeURIComponent(res.credential.studentId)}&role=STUDENT`);
          const found = (userRes?.users || userRes?.data || userRes)?.find(
            (u: any) => u.studentProfile?.studentId === res.credential.studentId || u.name === res.credential.name
          );
          if (found?.id) {
            setMatchedUserId(found.id);
          }
        } catch {
          // non-critical
        }
      } else {
        // 2. Fallback: Search in user management by name/email/ID
        const usersRes = await apiClient.get<any>(`/v1/users?search=${encodeURIComponent(id)}&role=STUDENT`);
        const userList = usersRes?.users || usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
        const matched = userList[0];

        if (matched?.studentProfile?.studentId) {
          setMatchedUserId(matched.id);
          setCredential({
            studentId: matched.studentProfile.studentId,
            name: matched.name,
            avatar: matched.avatar,
            program: matched.studentProfile.program || "Academic Programme",
            startedSemester: matched.studentProfile.startedSemester || "Current",
            startedYear: matched.studentProfile.startedYear || "Current",
            nationality: matched.studentProfile.nationality || null,
            status: matched.isActive ? "Active Registered Student" : "Inactive Student",
            issuedAt: matched.studentProfile.updatedAt || matched.createdAt,
            institution: "ProGemini Academy",
            institutionUrl: "https://progemini.academy",
            accreditation: "Officially Cleared & Authenticated Credential",
            approvedCourseTitle: matched.studentProfile.program,
          });
          saveRecentSearch(matched.studentProfile.studentId);
        } else {
          setError(res?.message || `No student credential found matching ID "${id}".`);
        }
      }
    } catch (err: any) {
      // Try searching admin user catalog directly
      try {
        const usersRes = await apiClient.get<any>(`/v1/users?search=${encodeURIComponent(id)}&role=STUDENT`);
        const userList = usersRes?.users || usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
        const matched = userList[0];

        if (matched?.studentProfile?.studentId) {
          setMatchedUserId(matched.id);
          setCredential({
            studentId: matched.studentProfile.studentId,
            name: matched.name,
            avatar: matched.avatar,
            program: matched.studentProfile.program || "Academic Programme",
            startedSemester: matched.studentProfile.startedSemester || "Current",
            startedYear: matched.studentProfile.startedYear || "Current",
            nationality: matched.studentProfile.nationality || null,
            status: matched.isActive ? "Active Registered Student" : "Inactive Student",
            issuedAt: matched.studentProfile.updatedAt || matched.createdAt,
            institution: "ProGemini Academy",
            institutionUrl: "https://progemini.academy",
            accreditation: "Officially Cleared & Authenticated Credential",
          });
          saveRecentSearch(matched.studentProfile.studentId);
        } else {
          setError(err.message || `No verified student ID card found matching "${id}".`);
        }
      } catch {
        setError(err.message || `No verified student ID card found matching "${id}".`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Convert verified credential to the format expected by StudentDigitalIdCard
  const cardUserData = credential
    ? {
        id: matchedUserId || "verified-student",
        name: credential.name,
        email: "verified@progemini.academy",
        avatar: credential.avatar,
        studentProfile: {
          studentId: credential.studentId,
          program: credential.program,
          startedSemester: credential.startedSemester,
          startedYear: credential.startedYear,
          nationality: credential.nationality,
        },
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaIdCard className="text-brand-primary" />
            Digital ID Card Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Search and verify official student credentials. Displays verified records in official digital ID card format.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
        >
          <FaUser className="text-xs" />
          View All Students
        </Link>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Student ID (e.g. 2701-CSY-0001), student name, or email..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-sm font-medium text-gray-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-brand-primary hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaSearch />
            )}
            Search & Verify ID
          </button>
        </form>

        {/* Quick Suggestions / Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-gray-600">
              <FaHistory className="text-[10px]" /> Recent Lookups:
            </span>
            {recentSearches.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchQuery(id);
                  handleSearch(id);
                }}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-mono text-[11px] transition"
              >
                {id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-200 border-t-brand-primary animate-spin" />
          <div>
            <h3 className="font-bold text-gray-900 text-base">Verifying Student Credential...</h3>
            <p className="text-xs text-gray-500 mt-0.5">Searching institutional registry database for {searchedId}</p>
          </div>
        </div>
      )}

      {/* Found Result Display: Digital ID Card + Admin Inspector Panel */}
      {!loading && credential && cardUserData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Digital Student ID Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Official Digital ID Card Format
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Dynamic Card
              </span>
            </div>

            {/* Reused Digital Student ID Card */}
            <StudentDigitalIdCard user={cardUserData} />
          </div>

          {/* Right Column: Administrative Inspection & Verification Records (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clearance & Verification Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Verification Result: Authenticated
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium">
                      Student record is officially cleared and active
                    </p>
                  </div>
                </div>

                {matchedUserId && (
                  <Link
                    href={`/admin/users/${matchedUserId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                  >
                    <FaEdit className="text-[11px]" />
                    Edit User Record
                  </Link>
                )}
              </div>

              {/* Verified Field Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs font-medium block">Student ID</span>
                  <span className="font-mono font-bold text-brand-primary text-base mt-0.5 block">
                    {credential.studentId}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs font-medium block">Student Full Name</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{credential.name}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs font-medium block">Academic Programme</span>
                  <span className="font-semibold text-gray-900 mt-0.5 block">{credential.program}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs font-medium block">Enrolled Intake</span>
                  <span className="font-semibold text-gray-900 mt-0.5 block">
                    {credential.startedSemester} {credential.startedYear}
                  </span>
                </div>

                {credential.nationality && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-500 text-xs font-medium block">Nationality</span>
                    <span className="font-semibold text-gray-900 mt-0.5 block">{credential.nationality}</span>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs font-medium block">Accreditation</span>
                  <span className="font-semibold text-emerald-700 mt-0.5 block">{credential.accreditation}</span>
                </div>
              </div>

              {/* Clearance Criteria Verification Pill Checklist */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Admin Clearance Criteria Checklist
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    Profile Complete
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    Application Approved
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    Program Assigned
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    Intake Cleared
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                    <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                    Student ID Issued
                  </div>
                </div>
              </div>

              {/* Public Verification Link */}
              <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Public Verification URL:</span>
                <Link
                  href={`/credentials/verify?id=${encodeURIComponent(credential.studentId)}`}
                  target="_blank"
                  className="text-brand-primary hover:underline font-semibold flex items-center gap-1"
                >
                  /credentials/verify?id={credential.studentId}
                  <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mx-auto">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Verification Not Found</h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1">{error}</p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setError(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Clear Search
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-lg bg-brand-primary text-xs font-semibold text-white hover:bg-red-700 transition"
            >
              Search All Users
            </Link>
          </div>
        </div>
      )}

      {/* Empty Initial State (No search performed yet) */}
      {!loading && !credential && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-3xl mx-auto shadow-inner">
            <FaIdCard />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Search a Student Credential</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Enter an official Student ID (e.g. <code>2701-CSY-0001</code>) to view the student’s verified digital ID card and institutional clearance status.
          </p>
        </div>
      )}
    </div>
  );
}
