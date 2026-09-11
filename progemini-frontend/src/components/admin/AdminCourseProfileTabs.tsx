"use client";

import { useState, useEffect } from "react";
import { FaBook, FaFile, FaVideo, FaClipboardList, FaCalendar, FaHistory, FaEdit, FaCalendarCheck, FaClipboard } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import StudySectionsManager from "./StudySectionsManager";

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isPublished: boolean;
  price: number;
  instructor?: {
    name: string;
  } | null;
  category: {
    name: string;
  };
  _count: {
    enrollments: number;
    reviews: number;
  };
}

interface AdminCourseProfileTabsProps {
  course: Course;
}

export default function AdminCourseProfileTabs({
  course,
}: AdminCourseProfileTabsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="font-semibold">{course.category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Students:</span>
                <span className="font-semibold">{course._count.enrollments}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  course.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : course.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">Admin View:</span> Create study sections first, then manage attendance within each section.
        </p>
      </div>

      {/* Study Sections Manager */}
      <StudySectionsManager
        course={course}
        userRole="ADMIN"
        AttendanceTab={AdminAttendanceTab}
      />
    </div>
  );
}

// Admin Attendance Tab Component
function AdminAttendanceTab({ courseId, studySectionId }: { courseId: string; studySectionId?: string }) {
  const [currentView, setCurrentView] = useState<'take' | 'history'>('take');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({});
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyAttendance, setHistoryAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchEnrolledStudents();
  }, [courseId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate, courseId]);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<any[]>(`/admin/courses/${courseId}/students`);
      setStudents(data);
      
      // Initialize attendance state
      const initialAttendance: any = {};
      data.forEach((enrollment: any) => {
        initialAttendance[enrollment.student.id] = {
          status: 'ABSENT',
          notes: '',
        };
      });
      setAttendance(initialAttendance);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date: string) => {
    try {
      const dateObj = new Date(date + 'T00:00:00Z');
      const isoDate = dateObj.toISOString().split('T')[0];
      
      const params = `date=${isoDate}${studySectionId ? `&studySectionId=${studySectionId}` : ''}`;
      const data = await apiClient.get<any[]>(`/admin/courses/${courseId}/attendance?${params}`);
      setExistingAttendance(data);
      
      if (data.length > 0) {
        const existingData: any = {};
        data.forEach((record: any) => {
          existingData[record.student.id] = {
            id: record.id,
            status: record.status,
            notes: record.notes || '',
          };
        });
        setAttendance((prev: any) => ({ ...prev, ...existingData }));
      } else {
        const resetData: any = {};
        students.forEach((enrollment: any) => {
          resetData[enrollment.student.id] = {
            status: 'ABSENT',
            notes: '',
          };
        });
        setAttendance(resetData);
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const params = `startDate=${thirtyDaysAgo.toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}${studySectionId ? `&studySectionId=${studySectionId}` : ''}`;
      const data = await apiClient.get<any[]>(`/admin/courses/${courseId}/attendance?${params}`);
      setHistoryAttendance(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, field: 'status' | 'notes', value: string) => {
    setAttendance((prev: any) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceRecords = students.map((enrollment: any) => ({
        studentId: enrollment.student.id,
        status: attendance[enrollment.student.id]?.status || 'ABSENT',
        notes: attendance[enrollment.student.id]?.notes || '',
      }));

      await apiClient.post(`/admin/courses/${courseId}/attendance`, {
        date: selectedDate,
        attendanceRecords,
        ...(studySectionId ? { studySectionId } : {}),
      });

      toast.success('Attendance saved successfully!');
      fetchAttendanceForDate(selectedDate);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
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

  if (loading && students.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <FaCalendarCheck className="text-blue-600" />
          Attendance Management
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('take')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                currentView === 'take'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaCalendar className="mr-2 inline" />
              Take Attendance
            </button>
            <button
              onClick={() => {
                setCurrentView('history');
                fetchAttendanceHistory();
              }}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                currentView === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaHistory className="mr-2 inline" />
              History
            </button>
          </div>
        </div>
      </div>

      {currentView === 'take' ? (
        <>
          {/* Date Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {existingAttendance.length > 0 && (
                <div className="text-sm text-amber-600 flex items-center gap-2">
                  <FaEdit />
                  <span>Editing existing attendance</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Attendance List */}
          {students.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Students Enrolled</h3>
              <p className="text-gray-600">No students are currently enrolled in this course</p>
            </div>
          ) : (
            <>
              <div className="bg-white border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((enrollment: any) => (
                      <tr key={enrollment.student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                              {enrollment.student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{enrollment.student.name}</p>
                              <p className="text-sm text-gray-600">{enrollment.student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {['PRESENT', 'LATE', 'ABSENT'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleAttendanceChange(enrollment.student.id, 'status', status)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                                  attendance[enrollment.student.id]?.status === status
                                    ? getStatusColor(status)
                                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={attendance[enrollment.student.id]?.notes || ''}
                            onChange={(e) => handleAttendanceChange(enrollment.student.id, 'notes', e.target.value)}
                            placeholder="Add notes..."
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* History View */
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : historyAttendance.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Attendance Records</h3>
              <p className="text-gray-600">No attendance has been recorded for this course yet</p>
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historyAttendance.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                            {record.student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{record.student.name}</p>
                            <p className="text-xs text-gray-600">{record.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
