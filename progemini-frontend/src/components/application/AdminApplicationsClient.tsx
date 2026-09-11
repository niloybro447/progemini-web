"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaEye, FaTrash, FaClock, FaCheck, FaTimes, FaUser } from "react-icons/fa";
import { apiClient } from '@/lib/apiClient';

interface Application {
  id: string;
  status: string;
  createdAt: Date | string;
  adminFeedback: string | null;
  reviewedAt: Date | string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
}

function computeStats(list: Application[]) {
  return {
    total: list.length,
    inReview: list.filter((a) => a.status === "IN_REVIEW").length,
    approved: list.filter((a) => a.status === "APPROVED").length,
    rejected: list.filter((a) => a.status === "REJECTED").length,
  };
}

interface Props {
  /** Pre-fetched data from the SSR RSC parent — eliminates client-side waterfall on initial load. */
  initialData?: any[];
}

export default function AdminApplicationsClient({ initialData = [] }: Props) {
  const [applications, setApplications] = useState<Application[]>(initialData);
  // If SSR data was provided, start in loaded state; otherwise show spinner
  const [loading, setLoading] = useState(initialData.length === 0);
  const [filter, setFilter] = useState<string>("all");
  const [stats, setStats] = useState(computeStats(initialData));

  // Track whether this is the very first render to avoid a redundant fetch when
  // we already have SSR data and the filter hasn't changed from "all".
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Skip the initial fetch if we already have SSR data for the "all" filter
      if (filter === "all" && initialData.length > 0) return;
    }
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const endpoint = filter === "all"
        ? "/v1/applications"
        : `/v1/applications?status=${filter}`;
      const data = await apiClient.get<Application[]>(endpoint);
      setApplications(data);
      setStats(computeStats(data));
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      await apiClient.delete(`/v1/applications/${id}`);

      toast.success("Application deleted");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to delete application");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_REVIEW":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <FaClock /> In Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
            <FaCheck /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
            <FaTimes /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Course Applications</h1>
        <p className="text-gray-600 mt-1">Manage student applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="text-3xl font-bold text-primary mb-2">
            {stats.total}
          </div>
          <div className="text-gray-600">Total Applications</div>
        </div>
        <div className="card p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {stats.inReview}
          </div>
          <div className="text-gray-600">In Review</div>
        </div>
        <div className="card p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.approved}
          </div>
          <div className="text-gray-600">Approved</div>
        </div>
        <div className="card p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats.rejected}
          </div>
          <div className="text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter("IN_REVIEW")}
          className={`px-4 py-2 rounded-lg ${
            filter === "IN_REVIEW"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          In Review ({stats.inReview})
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded-lg ${
            filter === "APPROVED"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-4 py-2 rounded-lg ${
            filter === "REJECTED"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No Applications</h3>
          <p className="text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {app.user.avatar ? (
                        <img
                          src={app.user.avatar}
                          alt={app.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{app.user.name}</div>
                        <div className="text-sm text-gray-600">
                          {app.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{app.course.title}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                      >
                        <FaEye /> Review
                      </Link>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
