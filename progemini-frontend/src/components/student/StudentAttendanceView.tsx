"use client";

import { useState, useEffect } from "react";
import { FaCalendarCheck, FaChartPie, FaClock, FaEye, FaUsers, FaCalendar, FaTrophy } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";

export default function StudentAttendanceView() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Default to last month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedCourse, startDate, endDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      
      if (selectedCourse) {
        params.append('courseId', selectedCourse);
      }

      const data = await apiClient.get<any>(`/v1/attendance/student?${params}`);
      setAttendanceData(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch attendance data');
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
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">My Attendance</h1>
        <p className="text-xs md:text-sm text-gray-600">Track your attendance across all enrolled courses</p>
      </div>

      {/* Filters */}
      <div className="card p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="">All Courses</option>
              {attendanceData?.enrolledCourses?.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      {attendanceData?.overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="card p-3 md:p-6">
            <div className="flex items-center flex-col md:flex-row gap-2 md:gap-0">
              <div className="p-2 md:p-3 rounded-lg bg-blue-100 flex-shrink-0">
                <FaCalendarCheck className="text-lg md:text-2xl text-blue-600" />
              </div>
              <div className="md:ml-4 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{attendanceData.overallStats.totalClasses}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-3 md:p-6">
            <div className="flex items-center flex-col md:flex-row gap-2 md:gap-0">
              <div className="p-2 md:p-3 rounded-lg bg-green-100 flex-shrink-0">
                <FaUsers className="text-lg md:text-2xl text-green-600" />
              </div>
              <div className="md:ml-4 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium text-gray-600">Present</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{attendanceData.overallStats.presentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-3 md:p-6">
            <div className="flex items-center flex-col md:flex-row gap-2 md:gap-0">
              <div className="p-2 md:p-3 rounded-lg bg-yellow-100 flex-shrink-0">
                <FaClock className="text-lg md:text-2xl text-yellow-600" />
              </div>
              <div className="md:ml-4 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium text-gray-600">Late</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{attendanceData.overallStats.lateCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-3 md:p-6">
            <div className="flex items-center flex-col md:flex-row gap-2 md:gap-0">
              <div className="p-2 md:p-3 rounded-lg bg-red-100 flex-shrink-0">
                <FaEye className="text-lg md:text-2xl text-red-600" />
              </div>
              <div className="md:ml-4 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium text-gray-600">Absent</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{attendanceData.overallStats.absentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-3 md:p-6">
            <div className="flex items-center flex-col md:flex-row gap-2 md:gap-0">
              <div className="p-2 md:p-3 rounded-lg bg-blue-100 flex-shrink-0">
                <FaTrophy className="text-lg md:text-2xl text-blue-600" />
              </div>
              <div className="md:ml-4 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium text-gray-600">Rate</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {attendanceData.overallStats.attendanceRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course-wise Statistics */}
      {attendanceData?.statsByCourse && Object.keys(attendanceData.statsByCourse).length > 0 && (
        <div className="card p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 md:gap-3">
            <FaChartPie className="text-primary text-sm md:text-base" />
            Course-wise Attendance
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left font-semibold text-gray-700">Course</th>
                  <th className="px-1 md:px-6 py-2 md:py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Instructor</th>
                  <th className="px-1 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-700">Total</th>
                  <th className="px-1 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-700 hidden md:table-cell">Present</th>
                  <th className="px-1 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-700 hidden md:table-cell">Late</th>
                  <th className="px-1 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-700 hidden md:table-cell">Absent</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-center font-semibold text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(attendanceData.statsByCourse).map(([courseId, stats]: [string, any]) => {
                  const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
                  
                  return (
                    <tr key={courseId} className="hover:bg-gray-50">
                      <td className="px-2 md:px-6 py-3 font-medium text-gray-900 line-clamp-1">{stats.courseTitle}</td>
                      <td className="px-1 md:px-6 py-3 text-gray-600 hidden md:table-cell">{stats.instructorName}</td>
                      <td className="px-1 md:px-6 py-3 text-center font-semibold">{stats.total}</td>
                      <td className="px-1 md:px-6 py-3 text-center hidden md:table-cell">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs md:text-sm font-semibold">
                          {stats.present}
                        </span>
                      </td>
                      <td className="px-1 md:px-6 py-3 text-center hidden md:table-cell">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs md:text-sm font-semibold">
                          {stats.late}
                        </span>
                      </td>
                      <td className="px-1 md:px-6 py-3 text-center hidden md:table-cell">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs md:text-sm font-semibold">
                          {stats.absent}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-3 text-center font-bold text-base md:text-lg">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Attendance Records */}
      {!attendanceData?.attendances || attendanceData.attendances.length === 0 ? (
        <div className="card p-8 md:p-12 text-center">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">📅</div>
          <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">No Attendance Records Found</h3>
          <p className="text-xs md:text-sm text-gray-600">No attendance records found for the selected period and courses</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {attendanceData.attendances.map((courseData: any) => (
            <div key={courseData.course.id} className="card overflow-hidden">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold line-clamp-1">{courseData.course.title}</h3>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const courseStats = attendanceData.statsByCourse[courseData.course.id];
                      const rate = courseStats && courseStats.total > 0 
                        ? Math.round((courseStats.present / courseStats.total) * 100) 
                        : 0;
                      
                      return (
                        <div>
                          <p className="text-2xl font-bold">{rate}%</p>
                          <p className="text-xs md:text-sm text-gray-200">Attendance Rate</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="p-4 md:p-6">
                <div className="space-y-2 md:space-y-4">
                  {courseData.records
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record: any) => (
                    <div key={record.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2">
                          <FaCalendar className="text-gray-400 text-xs md:text-sm flex-shrink-0" />
                          <span className="font-medium text-gray-900 text-xs md:text-sm line-clamp-1">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        {record.notes && (
                          <span className="text-xs md:text-sm text-gray-600 italic bg-white px-2 md:px-3 py-1 rounded line-clamp-1">
                            "{record.notes}"
                          </span>
                        )}
                        <span className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold border whitespace-nowrap ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)} {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}