"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FaTimes, FaFileAlt, FaExternalLinkAlt, FaSpinner } from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";
import ApplicationDetailView from "@/components/application/ApplicationDetailView";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersClientPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

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
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const url = filter ? `/v1/users?role=${filter}` : "/v1/users";
      const data = await apiClient.get<User[] | { users: User[] }>(url);

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

  const roleColors: Record<string, string> = {
    STUDENT: "bg-green-100 text-green-800",
    ADMIN: "bg-purple-100 text-purple-800",
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading user management...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-lg ${
              filter === "" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("ADMIN")}
            className={`px-4 py-2 rounded-lg ${
              filter === "ADMIN" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setFilter("STUDENT")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === "STUDENT" ? "bg-primary text-white" : "bg-gray-100"
            }`}
          >
            Students
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStudentModal(true);
              }}
              className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              + Create Student
            </button>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roleColors[user.role as keyof typeof roleColors]
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => handleOpenApplications(user)}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                    title="View submitted course applications and documents"
                  >
                    Application
                  </button>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
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
