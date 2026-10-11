"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  FaTimes,
  FaFileAlt,
  FaExternalLinkAlt,
  FaSpinner,
  FaSearch,
  FaUserPlus,
  FaGraduationCap,
  FaCheckCircle,
  FaClock,
  FaUserSlash,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import ApplicationDetailView from "@/components/application/ApplicationDetailView";

interface ApplicationItem {
  id: string;
  status: string;
  createdAt: string;
  course?: {
    id: string;
    title: string;
  } | null;
}

interface StudentProfileItem {
  id: string;
  studentId: string | null;
  program: string | null;
  isCompleted?: boolean;
  isCertified?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string | null;
  studentProfile?: StudentProfileItem | null;
  applications?: ApplicationItem[];
  _count?: { enrollments: number };
}

type TabFilter = "all" | "enrolled" | "pending" | "not_applied";

/**
 * Categorize students into the 3 requested segments:
 * 1. Enrolled students: Approved application and profile got academic program assigned, or got proper Student ID
 * 2. Pending students: Applied for application, but not confirmed/approved yet
 * 3. Not Applied students: Signed up students without any application
 */
function getStudentCategory(user: User): "enrolled" | "pending" | "not_applied" {
  const hasProperStudentId = Boolean(
    user.studentProfile?.studentId && user.studentProfile.studentId.trim().length > 0
  );
  const hasApprovedApp = Boolean(
    user.applications?.some((app) => app.status === "APPROVED")
  );
  const hasAssignedProgram = Boolean(
    user.studentProfile?.program && user.studentProfile.program.trim().length > 0
  );

  if (hasProperStudentId || (hasApprovedApp && hasAssignedProgram) || hasApprovedApp) {
    return "enrolled";
  }

  const hasApplications = Boolean(user.applications && user.applications.length > 0);
  if (hasApplications) {
    return "pending";
  }

  return "not_applied";
}

export default function UsersClientPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("enrolled");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for Create Student
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", email: "", password: "" });
  const [creatingStudent, setCreatingStudent] = useState(false);

  // Modal states for Applications View
  const [selectedUserForApps, setSelectedUserForApps] = useState<User | null>(null);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<User[] | { users: User[] }>("/v1/users");

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && typeof data === "object" && Array.isArray((data as any).users)) {
        setUsers((data as any).users);
      } else {
        setUsers([]);
        toast.error("Invalid response format from server");
      }
    } catch (error) {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/v1/users/${userId}`, { isActive: !currentStatus });
      toast.success("User status updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiClient.delete(`/v1/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStudent(true);

    try {
      if (!studentForm.name || !studentForm.email || !studentForm.password) {
        toast.error("Please fill all fields");
        setCreatingStudent(false);
        return;
      }

      await apiClient.post("/v1/users/create", {
        ...studentForm,
        role: "STUDENT",
      });

      toast.success("Student created successfully");
      setShowStudentModal(false);
      setStudentForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create student");
    } finally {
      setCreatingStudent(false);
    }
  };

  // Applications Handler
  const handleOpenApplications = async (user: User) => {
    setSelectedUserForApps(user);
    setLoadingApps(true);
    setUserApplications([]);
    setSelectedAppId(null);

    try {
      const data = await apiClient.get<any[]>(`/v1/applications?userId=${user.id}`);
      const apps = Array.isArray(data) ? data : [];
      setUserApplications(apps);
      if (apps.length > 0) {
        setSelectedAppId(apps[0].id);
      }
    } catch (error) {
      toast.error("Failed to load student applications");
      setUserApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleCloseApplications = () => {
    setSelectedUserForApps(null);
    setUserApplications([]);
    setSelectedAppId(null);
  };

  // Category counts
  const counts = useMemo(() => {
    let allStudents = 0;
    let enrolled = 0;
    let pending = 0;
    let notApplied = 0;

    users.forEach((u) => {
      if (u.role === "STUDENT") {
        allStudents++;
        const cat = getStudentCategory(u);
        if (cat === "enrolled") enrolled++;
        else if (cat === "pending") pending++;
        else if (cat === "not_applied") notApplied++;
      }
    });

    return {
      all: allStudents,
      enrolled,
      pending,
      not_applied: notApplied,
    };
  }, [users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // If role is ADMIN, only show under "all" tab
      if (user.role === "ADMIN") {
        if (activeTab !== "all") return false;
      } else {
        const cat = getStudentCategory(user);
        if (activeTab !== "all" && cat !== activeTab) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = user.name?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        const matchesStudentId = user.studentProfile?.studentId?.toLowerCase().includes(q);
        const matchesProgram = user.studentProfile?.program?.toLowerCase().includes(q);
        const matchesApp = user.applications?.some((a) =>
          a.course?.title?.toLowerCase().includes(q)
        );
        return matchesName || matchesEmail || matchesStudentId || matchesProgram || matchesApp;
      }

      return true;
    });
  }, [users, activeTab, searchQuery]);

  const tabs: Array<{
    id: TabFilter;
    label: string;
    count: number;
    icon: any;
    activeClasses: string;
    badgeActive: string;
    badgeInactive: string;
  }> = [
    {
      id: "enrolled",
      label: "Enrolled Students",
      count: counts.enrolled,
      icon: FaCheckCircle,
      activeClasses: "bg-emerald-600 text-white shadow-xs",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "pending",
      label: "Pending Students",
      count: counts.pending,
      icon: FaClock,
      activeClasses: "bg-amber-600 text-white shadow-xs",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-amber-100 text-amber-800",
    },
    {
      id: "not_applied",
      label: "Not Applied Students",
      count: counts.not_applied,
      icon: FaUserSlash,
      activeClasses: "bg-slate-700 text-white shadow-xs",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-slate-200 text-slate-700",
    },
    {
      id: "all",
      label: "All Students",
      count: counts.all,
      icon: FaGraduationCap,
      activeClasses: "bg-gray-900 text-white shadow-xs",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-gray-200 text-gray-700",
    },
  ];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 gap-3">
        <FaSpinner className="animate-spin text-4xl text-primary" />
        <p className="text-sm font-medium">Loading user management...</p>
      </div>
    );
  }

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track student enrollments, admission applications, and registered profiles.
          </p>
        </div>

        <button
          onClick={() => setShowStudentModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <FaUserPlus className="text-sm" />
          <span>+ Create Student</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? tab.activeClasses
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`text-xs ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive ? tab.badgeActive : tab.badgeInactive
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full xl:w-72 shrink-0">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Student / User</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Student ID</th>
                <th className="px-5 py-3.5">Academic Program</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Admission Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Account</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Joined</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.map((user) => {
                const category = getStudentCategory(user);
                const studentId = user.studentProfile?.studentId?.trim();
                const assignedProgram =
                  user.studentProfile?.program?.trim() ||
                  user.applications?.find((a) => a.status === "APPROVED")?.course?.title ||
                  (user.applications && user.applications[0]?.course?.title);

                return (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="px-5 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                            {user.role === "ADMIN" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {studentId ? (
                        <span className="inline-flex items-center font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap">
                          {studentId}
                        </span>
                      ) : category === "enrolled" ? (
                        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                          Pending ID
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Academic Program */}
                    <td className="px-5 py-4 max-w-[220px]">
                      {assignedProgram ? (
                        <span
                          className="font-medium text-gray-800 truncate block"
                          title={assignedProgram}
                        >
                          {assignedProgram}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No program assigned</span>
                      )}
                    </td>

                    {/* Admission Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Staff
                        </span>
                      ) : category === "enrolled" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Enrolled
                        </span>
                      ) : category === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Not Applied
                        </span>
                      )}
                    </td>

                    {/* Account Status Toggle */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        title="Click to toggle user active status"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenApplications(user)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                        title="View submitted course applications and documents"
                      >
                        <FaFileAlt className="text-[10px]" />
                        <span>
                          App
                          {user.applications && user.applications.length > 0
                            ? ` (${user.applications.length})`
                            : ""}
                        </span>
                      </button>

                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-semibold hover:underline bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-md transition-colors"
                        title="View full user details, verification & certificates"
                      >
                        <FaEye className="text-[10px]" />
                        <span>View</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold hover:underline bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                        title="Delete user"
                      >
                        <FaTrash className="text-[10px]" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3 text-xl">
              <FaGraduationCap />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No Students Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? `No students matching "${searchQuery}" in this view.`
                : activeTab === "enrolled"
                ? "No enrolled students found with approved applications or assigned student IDs."
                : activeTab === "pending"
                ? "No students currently awaiting application confirmation."
                : activeTab === "not_applied"
                ? "No registered students without an application found."
                : "No users found in the system."}
            </p>
          </div>
        )}
      </div>

      {/* Student Applications Modal */}
      {selectedUserForApps && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseApplications();
          }}
        >
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  {selectedUserForApps.name ? selectedUserForApps.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Applications — {selectedUserForApps.name}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedUserForApps.email}</p>
                </div>
              </div>

              <button
                onClick={handleCloseApplications}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200/60 transition-colors"
                title="Close"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              {loadingApps ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
                  <FaSpinner className="animate-spin text-3xl text-primary" />
                  <p className="text-sm font-medium">Loading applications...</p>
                </div>
              ) : userApplications.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                    <FaFileAlt />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-1">No Applications Found</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {selectedUserForApps.name} has not submitted any course admission applications yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Multiple applications selector tabs */}
                  {userApplications.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
                        Select Application:
                      </span>
                      {userApplications.map((app, index) => {
                        const isSelected = (selectedAppId || userApplications[0].id) === app.id;
                        return (
                          <button
                            key={app.id}
                            onClick={() => setSelectedAppId(app.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                              isSelected
                                ? "bg-primary text-white shadow-xs"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <span>
                              {app.course?.title ? app.course.title : `Application #${index + 1}`}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : app.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : app.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {app.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Reused Application Detail View */}
                  {(() => {
                    const currentApp =
                      userApplications.find((a) => a.id === selectedAppId) || userApplications[0];

                    return (
                      <div>
                        <div className="flex items-center justify-end mb-3">
                          <Link
                            href={`/admin/applications/${currentApp.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/5 px-3 py-1 rounded-md border border-primary/20"
                          >
                            Open in Full Page <FaExternalLinkAlt className="text-[10px]" />
                          </Link>
                        </div>
                        <ApplicationDetailView
                          application={currentApp}
                          onUpdated={(updated) => {
                            setUserApplications((prev) =>
                              prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
                            );
                          }}
                          showReviewForm={true}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={handleCloseApplications}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create Student</h2>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingStudent}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creatingStudent ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
