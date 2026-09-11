"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { 
  FaTrash, 
  FaEllipsisV,
  FaEdit,
  FaCheck,
  FaBan,
  FaExternalLinkAlt
} from "react-icons/fa";

interface Course {
  id: string;
  title: string;
  status: string;
  isPublished: boolean;
  price: number;
  rating: number;
  createdAt: string;
  category: { name: string };
  _count: {
    sections: number;
  };
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const url = filter ? `/v1/courses?status=${filter}` : "/v1/courses?status=";
      const data = await apiClient.get<Course[]>(url);
      setCourses(data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      await apiClient.put(`/v1/courses/${courseId}`, { status: "APPROVED", isPublished: true });
      toast.success("Course approved");
      fetchCourses();
    } catch {
      toast.error("Failed to approve course");
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      await apiClient.put(`/v1/courses/${courseId}`, { status: "REJECTED", isPublished: false });
      toast.success("Course rejected");
      fetchCourses();
    } catch {
      toast.error("Failed to reject course");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await apiClient.delete(`/v1/courses/${courseId}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Course Management</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {["", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base whitespace-nowrap ${
                filter === f ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              {f === "" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
              <th className="px-6 py-4 text-left">Course Details</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 group transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      {course.title.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate hover:text-brand-primary transition-colors cursor-pointer" title={course.title}>
                        <Link href={`/admin/courses/${course.id}`}>{course.title}</Link>
                      </p>
                      <p className={`text-[11px] font-medium mt-0.5 ${course.isPublished ? "text-green-600" : "text-amber-600"}`}>
                        {course.isPublished ? "• Published" : "• Draft"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  <span className="bg-gray-100 px-2.5 py-1 rounded-md text-[11px]">{course.category.name}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[course.status as keyof typeof statusColors]}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right overflow-visible">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                      title="View Course Profile"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <FaEllipsisV className="text-xs" />
                      </button>
                      {openMenuId === course.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                            <div className="py-1">
                              <Link
                                href={`/admin/courses/${course.id}/edit`}
                                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                              >
                                <FaEdit className="text-amber-500" /> Edit Details
                              </Link>
                              {course.status === "PENDING" && (
                                <div className="bg-gray-50 border-t border-b border-gray-100 py-1">
                                  <button
                                    onClick={() => { handleApprove(course.id); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-green-600 hover:bg-green-100 flex items-center gap-3 font-semibold"
                                  >
                                    <FaCheck /> Approve Course
                                  </button>
                                  <button
                                    onClick={() => { handleReject(course.id); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-100 flex items-center gap-3 font-semibold"
                                  >
                                    <FaBan /> Reject Course
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => { handleDelete(course.id); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-3"
                              >
                                <FaTrash /> Delete Course
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found</p>
          </div>
        )}
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="lg:hidden space-y-4 px-2">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary/20 group-hover:bg-brand-primary transition-colors" />
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                  {course.title.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">
                    <Link href={`/admin/courses/${course.id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium uppercase mt-1 tracking-wider">{course.category.name}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[course.status as keyof typeof statusColors]}`}>
                {course.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/courses/${course.id}`}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <FaExternalLinkAlt className="text-[10px]" /> Full Profile
              </Link>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                  className="bg-brand-primary text-white p-2.5 rounded-xl hover:opacity-90 transition-all shadow-md shadow-brand-primary/20"
                >
                  <FaEllipsisV className="text-sm" />
                </button>
                {openMenuId === course.id && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-40 overflow-hidden">
                      <div className="p-1">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <FaEdit className="text-amber-500" /> Edit Details
                        </Link>
                        {course.status === "PENDING" && (
                          <div className="bg-gray-50 my-1 py-1 border-t border-b border-gray-100">
                            <button
                              onClick={() => { handleApprove(course.id); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-xs text-green-600 hover:bg-green-100 flex items-center gap-3 font-bold"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => { handleReject(course.id); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-3 text-xs text-red-600 hover:bg-red-100 flex items-center gap-3 font-bold"
                            >
                              <FaBan /> Reject
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => { handleDelete(course.id); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-3 text-xs text-red-600 hover:bg-red-50 flex items-center gap-3"
                        >
                          <FaTrash /> Delete Course
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
