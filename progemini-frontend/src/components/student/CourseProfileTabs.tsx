"use client";

import { useState, useEffect } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";

interface CourseProfileTabsProps {
  courseId: string;
  studySectionId?: string;
}

export default function CourseProfileTabs({
  courseId,
  studySectionId,
}: CourseProfileTabsProps) {
  return (
    <div className="min-h-[400px]">
      <CourseAttendanceTab courseId={courseId} studySectionId={studySectionId} />
    </div>
  );
}
function CourseAttendanceTab({ courseId, studySectionId }: { courseId: string; studySectionId?: string }) {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseAttendance();
  }, [courseId, studySectionId]);

  const fetchCourseAttendance = async () => {
    try {
      setLoading(true);
      let url = `/v1/attendance/student?courseId=${courseId}`;
      if (studySectionId) url += `&studySectionId=${studySectionId}`;
      const data = await apiClient.get<any>(url);
      console.log('Attendance data:', data);
      setAttendanceData(data);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return '✅';
      case 'LATE':
        return '⏰';
      case 'ABSENT':
        return '❌';
      default:
        return '❓';
    }
  };



  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Find course attendance data from the array
  const courseData = attendanceData?.attendances?.[0];
  const courseStats = attendanceData?.statsByCourse?.[courseId];

  if (!courseData && !courseStats) {
    return (
      <div className="card p-8">
        <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
          <FaCalendarCheck className="text-base md:text-lg text-primary" />
          In-Class Attendance
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center border-2 border-dashed border-gray-200">
          <div className="text-2xl md:text-4xl mb-2">📅</div>
          <p className="text-sm md:text-base text-gray-600 font-medium">No attendance data available</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Your instructor hasn't recorded any attendance yet</p>
        </div>
      </div>
    );
  }

  const attendanceRate = courseStats?.total > 0
    ? Math.round((courseStats.present / courseStats.total) * 100)
    : 0;

  return (
    <div className="card p-4 md:p-6">
      <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <FaCalendarCheck className="text-base md:text-lg text-primary" />
        In-Class Attendance
      </h2>

      {courseStats && courseStats.total > 0 ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-2 md:p-4 rounded-lg text-center">
              <div className="text-xl md:text-3xl font-bold text-blue-600">{courseStats.total}</div>
              <div className="text-xs md:text-sm text-gray-700 mt-1 font-medium">Total Classes</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-2 md:p-4 rounded-lg text-center">
              <div className="text-xl md:text-3xl font-bold text-green-600">{courseStats.present}</div>
              <div className="text-xs md:text-sm text-gray-700 mt-1 font-medium">Present</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-2 md:p-4 rounded-lg text-center">
              <div className="text-xl md:text-3xl font-bold text-yellow-600">{courseStats.late}</div>
              <div className="text-xs md:text-sm text-gray-700 mt-1 font-medium">Late</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-2 md:p-4 rounded-lg text-center">
              <div className="text-xl md:text-3xl font-bold text-red-600">{courseStats.absent}</div>
              <div className="text-xs md:text-sm text-gray-700 mt-1 font-medium">Absent</div>
            </div>
          </div>

          {/* Attendance Rate */}
          {courseStats && courseStats.total > 0 && (
            <div className="mb-6 md:mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6">
                <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Overall Attendance Rate</p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{attendanceRate}%</p>
              </div>
            </div>
          )}

          {/* Attendance Records */}
          {courseData && courseData.records && courseData.records.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              <h3 className="font-bold text-base md:text-lg text-gray-900 mb-3 md:mb-4">Attendance History</h3>
              <div className="bg-white rounded-lg border divide-y max-h-96 overflow-y-auto">
                {courseData.records
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record: any) => (
                    <div key={record.id} className="p-2 md:p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                          <div className="text-gray-500 min-w-fit text-xs md:text-sm">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          {record.notes && (
                            <span className="text-xs md:text-sm text-gray-600 italic bg-gray-100 px-2 py-1 rounded line-clamp-1">
                              "{record.notes}"
                            </span>
                          )}
                        </div>
                        <span className={`px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold border ${getStatusColor(record.status)} whitespace-nowrap ml-2 flex-shrink-0`}>
                          {getStatusIcon(record.status)} {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 md:p-6 text-center border-2 border-dashed border-gray-200">
              <div className="text-3xl md:text-4xl mb-2">📋</div>
              <p className="text-sm md:text-base text-gray-600 font-medium">No attendance records yet</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Attendance records will appear here once your instructor marks them</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-600 font-medium">No attendance records yet</p>
          <p className="text-sm text-gray-500 mt-1">Your instructor hasn't recorded any attendance yet for this course</p>
        </div>
      )}
    </div>
  );
}
