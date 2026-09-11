"use client";

import { useState, useEffect } from "react";
import { FaCalendarCheck, FaChartLine, FaDownload, FaFilter, FaUsers, FaEye, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";

export default function AdminAttendanceReports() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last week
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    fetchAttendanceReports();
  }, [selectedCourse, startDate, endDate]);

  const fetchAttendanceReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      
      if (selectedCourse) {
        params.append('courseId', selectedCourse);
      }

      const data = await apiClient.get<any>(`/v1/attendance/admin?${params}`);
      setAttendanceData(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch attendance reports');
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

  const calculateAttendanceRate = (present: number, total: number) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const exportToCSV = () => {
    if (!attendanceData || !attendanceData.attendances) return;

    const csvData = [];
    const headers = ['Course', 'Instructor', 'Student', 'Date', 'Status', 'Notes'];
    csvData.push(headers);

    attendanceData.attendances.forEach((courseData: any) => {
      courseData.records.forEach((record: any) => {
        csvData.push([
          courseData.course.title,
          'ProGemini',
          record.student.name,
          new Date(record.date).toLocaleDateString(),
          record.status,
          record.notes || '',
        ]);
      });
    });

    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-report-${startDate}-to-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Reports</h1>
        <p className="text-gray-600">Monitor student attendance across all courses</p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="font-semibold text-gray-700">Filters:</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              title="Select a course"
              aria-label="Select a course to view attendance"
            >
              <option value="">All Courses</option>
              {attendanceData?.courses?.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              title="Start date"
              placeholder="Start date"
              aria-label="Start date for attendance report"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              title="End date"
              placeholder="End date"
              aria-label="End date for attendance report"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {attendanceData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <FaCalendarCheck className="text-2xl text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.stats.totalRecords}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <FaUsers className="text-2xl text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.stats.presentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <FaEye className="text-2xl text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.stats.absentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <FaClock className="text-2xl text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.stats.lateCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Type Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('summary')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              viewType === 'summary'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaChartLine className="mr-2 inline" />
            Summary View
          </button>
          <button
            onClick={() => setViewType('detailed')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              viewType === 'detailed'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaEye className="mr-2 inline" />
            Detailed View
          </button>
        </div>
      </div>

      {/* Attendance Data */}
      {!attendanceData?.attendances || attendanceData.attendances.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Attendance Data Found</h3>
          <p className="text-gray-600">No attendance records found for the selected period and filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {attendanceData.attendances.map((courseData: any) => (
            <div key={courseData.course.id} className="card overflow-hidden">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{courseData.course.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {calculateAttendanceRate(
                        courseData.records.filter((r: any) => r.status === 'PRESENT').length,
                        courseData.records.length
                      )}%
                    </p>
                    <p className="text-sm opacity-90">Attendance Rate</p>
                  </div>
                </div>
              </div>

              {viewType === 'summary' ? (
                /* Summary View */
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-lg font-bold text-green-800">
                        {courseData.records.filter((r: any) => r.status === 'PRESENT').length}
                      </p>
                      <p className="text-sm text-green-600">Present</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-lg font-bold text-yellow-800">
                        {courseData.records.filter((r: any) => r.status === 'LATE').length}
                      </p>
                      <p className="text-sm text-yellow-600">Late</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-lg font-bold text-red-800">
                        {courseData.records.filter((r: any) => r.status === 'ABSENT').length}
                      </p>
                      <p className="text-sm text-red-600">Absent</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Total Records: {courseData.records.length} • 
                    Period: {new Date(attendanceData.period.startDate).toLocaleDateString()} - {new Date(attendanceData.period.endDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                /* Detailed View */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {courseData.records.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                                {record.student.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{record.student.name}</p>
                                <p className="text-sm text-gray-600">{record.student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)} {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.notes ? `"${record.notes}"` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}