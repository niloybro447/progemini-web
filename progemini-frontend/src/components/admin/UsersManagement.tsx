"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    courses: number;
    enrollments: number;
  };
}

export default function UsersClientPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  
  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // Form states
  const [studentForm, setStudentForm] = useState({ name: "", email: "", password: "" });
  const [creatingStudent, setCreatingStudent] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const url = filter ? `/v1/users?role=${filter}` : "/v1/users";
      const data = await apiClient.get<User[] | { users: User[] }>(url);
      
      // Ensure data is an array, handle both direct array and nested structure
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.users)) {
        setUsers(data.users);
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


  // Create Student
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


  const roleColors: Record<string, string> = {
    STUDENT: "bg-green-100 text-green-800",
    ADMIN: "bg-purple-100 text-purple-800",
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
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
              <th className="px-6 py-3 text-left text-sm font-semibold">Courses</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Enrollments</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
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
                <td className="px-6 py-4 text-sm">{user._count.courses}</td>
                <td className="px-6 py-4 text-sm">{user._count.enrollments}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline text-sm"
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
