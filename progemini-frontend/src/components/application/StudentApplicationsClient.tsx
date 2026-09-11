"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaEye, FaTrash, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import { apiClient } from '@/lib/apiClient';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  adminFeedback: string | null;
  reviewedAt: string | null;
  course: {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    discountPrice: number | null;
  };
}

export default function StudentApplicationsClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const endpoint = filter === "all"
        ? "/v1/applications"
        : `/v1/applications?status=${filter}`;
      const data = await apiClient.get<Application[]>(endpoint);
      setApplications(data);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-gray-600 mt-1">Track your course applications</p>
        </div>
        <Link href="/student/apply" className="btn-primary">
          + New Application
        </Link>
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
          All
        </button>
        <button
          onClick={() => setFilter("IN_REVIEW")}
          className={`px-4 py-2 rounded-lg ${
            filter === "IN_REVIEW"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          In Review
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded-lg ${
            filter === "APPROVED"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-4 py-2 rounded-lg ${
            filter === "REJECTED"
              ? "bg-primary text-white"
              : "bg-white border hover:bg-gray-50"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-6">
            Start your learning journey by applying for a course
          </p>
          <Link href="/student/apply" className="btn-primary inline-block">
            Apply Now
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="card p-6">
              {/* Application Details */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {app.course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Applied on:{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>

                {/* Admin Feedback */}
                {app.adminFeedback && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Admin Feedback:
                    </p>
                    <p className="text-sm text-blue-800">{app.adminFeedback}</p>
                    {app.reviewedAt && (
                      <p className="text-xs text-blue-600 mt-2">
                        Reviewed on:{" "}
                        {new Date(app.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/student/applications/${app.id}`}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <FaEye /> View Details
                  </Link>
                  {app.status === "IN_REVIEW" && (
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
