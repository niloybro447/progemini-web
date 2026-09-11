"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaSave } from "react-icons/fa";
import { apiClient } from '@/lib/apiClient';

interface Application {
  id: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  highestEducation: string;
  institutionName: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpa: string | null;
  englishProficiency: string;
  previousCourses: string | null;
  workExperience: string | null;
  passportCopy: string | null;
  academicTranscripts: string | null;
  resume: string | null;
  statementOfPurpose: string | null;
  recommendationLetter: string | null;
  englishTestScore: string | null;
  adminFeedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string;
  };
}

interface Props {
  application: Application;
}

export default function ApplicationReviewForm({ application }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(application.status);
  const [feedback, setFeedback] = useState(application.adminFeedback || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.patch(`/v1/applications/${application.id}`, {
        status,
        adminFeedback: feedback || null,
      });

      toast.success("Application updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <h2 className="text-2xl font-bold">Review Application</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          Application Status *
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input w-full"
          required
        >
          <option value="IN_REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Admin Feedback (Optional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="input w-full"
          rows={5}
          placeholder="Provide feedback to the student about their application..."
        />
        <p className="text-sm text-gray-500 mt-1">
          This feedback will be visible to the student on their application page
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <FaSave /> {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus("APPROVED");
            setTimeout(() => document.querySelector("form")?.requestSubmit(), 100);
          }}
          disabled={loading || status === "APPROVED"}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaCheck /> Quick Approve
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus("REJECTED");
            setTimeout(() => document.querySelector("form")?.requestSubmit(), 100);
          }}
          disabled={loading || status === "REJECTED"}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaTimes /> Quick Reject
        </button>
      </div>
    </form>
  );
}
