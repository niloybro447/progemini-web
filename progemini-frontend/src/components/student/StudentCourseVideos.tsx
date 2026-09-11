"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaVideo, FaPlay } from "react-icons/fa";
import { format } from "date-fns";
import { apiClient } from "@/lib/apiClient";

interface CourseVideo {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: number | null;
  recordedAt: string | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface StudentCourseVideosProps {
  courseId: string;
  studySectionId?: string;
}

export default function StudentCourseVideos({ courseId, studySectionId }: StudentCourseVideosProps) {
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [courseId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = `/api/courses/${courseId}/videos`;
      if (studySectionId) url += `?studySectionId=${studySectionId}`;
      const data = await apiClient.get<{ videos: CourseVideo[] }>(url);
      setVideos(data.videos || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Videos Available</h3>
        <p className="text-gray-600">Your instructor hasn't uploaded any class recordings yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Class Record Videos</h3>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Recorded On</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Uploaded By</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{video.title}</p>
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDuration(video.duration)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {video.recordedAt
                    ? format(new Date(video.recordedAt), "MMM d, yyyy")
                    : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {video.uploadedBy.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(video.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                    >
                      <FaPlay />
                      Watch
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
