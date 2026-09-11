"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaEye,
  FaTrash,
  FaClock,
  FaCheck,
  FaPhone,
  FaUserTie,
  FaSpinner,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";

interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  submitterType: string | null;
  enquiryType: string;
  courseName: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function EnquiriesClient() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEnquiries();
  }, [filter, pagination.page]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const url =
        filter === "all"
          ? `/enquiries?page=${pagination.page}`
          : `/enquiries?status=${filter}&page=${pagination.page}`;
      const data = await apiClient.get<{ enquiries: Enquiry[]; pagination: PaginationInfo }>(url);
      setEnquiries(data.enquiries || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiClient.patch(`/enquiries/${id}`, { status: newStatus });

      toast.success("Status updated successfully");
      fetchEnquiries();
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      await apiClient.delete(`/enquiries/${id}`);

      toast.success("Enquiry deleted");
      setShowModal(false);
      setSelectedEnquiry(null);
      fetchEnquiries();
    } catch (error) {
      toast.error("Failed to delete enquiry");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { icon: any; className: string; label: string }
    > = {
      Pending: {
        icon: FaClock,
        className: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      "In progress": {
        icon: FaSpinner,
        className: "bg-blue-100 text-blue-800",
        label: "In Progress",
      },
      Done: {
        icon: FaCheck,
        className: "bg-green-100 text-green-800",
        label: "Done",
      },
      "Need Sales to talk": {
        icon: FaPhone,
        className: "bg-purple-100 text-purple-800",
        label: "Need Sales",
      },
      "Need admission officer to talk": {
        icon: FaUserTie,
        className: "bg-orange-100 text-orange-800",
        label: "Need Admission",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span
        className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${config.className}`}
      >
        <Icon /> {config.label}
      </span>
    );
  };

  const viewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-brand-primary text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            All Enquiries
          </button>
          <button
            onClick={() => setFilter("Pending")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "Pending"
                ? "bg-brand-primary text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("In progress")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "In progress"
                ? "bg-brand-primary text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("Done")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "Done"
                ? "bg-brand-primary text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Done
          </button>
          <button
            onClick={() => setFilter("Need Sales to talk")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "Need Sales to talk"
                ? "bg-brand-primary text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Need Sales
          </button>
          <button
            onClick={() => setFilter("Need admission officer to talk")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "Need admission officer to talk"
                ? "bg-brand-primary text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Need Admission
          </button>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="card p-6">
        {enquiries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2">No Enquiries Found</h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No enquiries have been submitted yet"
                : `No enquiries with status "${filter}"`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Enquiry Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium">
                        {enquiry.fullName}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {enquiry.email}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div>
                          <div className="font-medium">{enquiry.enquiryType}</div>
                          {enquiry.courseName && (
                            <div className="text-xs text-gray-500">
                              {enquiry.courseName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(enquiry.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewEnquiry(enquiry)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDelete(enquiry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Enquiry Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <FaUser /> Full Name
                    </label>
                    <p className="mt-1">{selectedEnquiry.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <FaEnvelope /> Email
                    </label>
                    <p className="mt-1">{selectedEnquiry.email}</p>
                  </div>
                </div>

                {selectedEnquiry.phone && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <FaPhone /> Phone
                    </label>
                    <p className="mt-1">{selectedEnquiry.phone}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Country
                    </label>
                    <p className="mt-1">{selectedEnquiry.country || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Submitter Type
                    </label>
                    <p className="mt-1">{selectedEnquiry.submitterType || "Not specified"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Enquiry Type
                  </label>
                  <p className="mt-1">{selectedEnquiry.enquiryType}</p>
                </div>

                {selectedEnquiry.courseName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Course Name
                    </label>
                    <p className="mt-1">{selectedEnquiry.courseName}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Message
                  </label>
                  <p className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {selectedEnquiry.message}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Current Status
                  </label>
                  <div className="mt-2">{getStatusBadge(selectedEnquiry.status)}</div>
                </div>

                <div>
                  <label htmlFor="status-select" className="text-sm font-semibold text-gray-600 mb-2 block">
                    Update Status
                  </label>
                  <select
                    id="status-select"
                    value={selectedEnquiry.status}
                    onChange={(e) =>
                      handleStatusChange(selectedEnquiry.id, e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Need Sales to talk">Need Sales to talk</option>
                    <option value="Need admission officer to talk">
                      Need admission officer to talk
                    </option>
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Submitted:{" "}
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                  <p>
                    Last Updated:{" "}
                    {new Date(selectedEnquiry.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Enquiry
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
