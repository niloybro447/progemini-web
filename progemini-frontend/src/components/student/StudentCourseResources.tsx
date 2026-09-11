"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaFile, FaDownload } from "react-icons/fa";
import { format } from "date-fns";
import { apiClient } from "@/lib/apiClient";

interface CourseResource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface StudentCourseResourcesProps {
  courseId: string;
  studySectionId?: string;
}

export default function StudentCourseResources({ courseId, studySectionId }: StudentCourseResourcesProps) {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let url = `/api/courses/${courseId}/resources`;
      if (studySectionId) url += `?studySectionId=${studySectionId}`;
      const data = await apiClient.get<{ resources: CourseResource[] }>(url);
      setResources(data.resources || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FaFile className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Resources Available</h3>
        <p className="text-gray-600">Your instructor hasn't uploaded any course resources yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Course Resources</h3>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Uploaded By</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{resource.title}</p>
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                    {resource.fileType || "File"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatFileSize(resource.fileSize)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {resource.uploadedBy.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(resource.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                    >
                      <FaDownload />
                      Download
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
