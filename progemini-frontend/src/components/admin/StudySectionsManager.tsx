"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaLayerGroup,
  FaCalendarCheck,
  FaArrowLeft,
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";

interface StudySection {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  _count: {
    attendances: number;
    enrollments: number;
  };
}

interface Course {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  isPublished?: boolean;
  price?: number;
  instructor?: { name: string } | null;
  category?: { name: string };
  _count?: { enrollments: number; reviews: number };
}

interface StudySectionsManagerProps {
  course: Course;
  userRole: "ADMIN" | "STUDENT";
  AttendanceTab?: React.ComponentType<{ courseId: string; studySectionId?: string }>;
  hideEnrollmentsTab?: boolean;
}

export default function StudySectionsManager({
  course,
  userRole,
  AttendanceTab,
  hideEnrollmentsTab,
}: StudySectionsManagerProps) {
  const [sections, setSections] = useState<StudySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<StudySection | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Selected section for viewing its content
  const [selectedSection, setSelectedSection] = useState<StudySection | null>(null);
  const defaultTab = hideEnrollmentsTab ? "attendance" : "enrollments";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchSections();
  }, [course.id]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<StudySection[]>(`/admin/courses/${course.id}/study-sections`);
      setSections(data);
    } catch (error) {
      toast.error("Failed to load study sections");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    try {
      const url = editingSection
        ? `/admin/courses/${course.id}/study-sections/${editingSection.id}`
        : `/admin/courses/${course.id}/study-sections`;

      if (editingSection) {
        await apiClient.put(url, formData);
      } else {
        await apiClient.post(url, formData);
      }

      toast.success(`Section ${editingSection ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingSection(null);
      setFormData({ name: "", description: "" });
      fetchSections();
    } catch (error) {
      toast.error("Failed to save section");
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm("Delete this section and all its content (modules, assignments, etc.)?")) return;

    try {
      await apiClient.delete(`/admin/courses/${course.id}/study-sections/${sectionId}`);

      toast.success("Section deleted successfully");
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
      }
      fetchSections();
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  const startEdit = (section: StudySection) => {
    setEditingSection(section);
    setFormData({ name: section.name, description: section.description || "" });
    setShowForm(true);
  };

  const tabs = [
    ...(hideEnrollmentsTab ? [] : [{ id: "enrollments", label: "Enrollments", icon: FaUsers }]),
    { id: "attendance", label: "Attendance", icon: FaCalendarCheck },
  ];

  // If a section is selected, show section content with tabs
  if (selectedSection) {
    return (
      <div>
        {/* Back button + Section title */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <button
            onClick={() => {
              setSelectedSection(null);
              if (!hideEnrollmentsTab) {
                setActiveTab("enrollments");
              } else {
                setActiveTab("attendance");
              }
              setIsDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition w-fit"
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Back to Sections</span>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{selectedSection.name}</h2>
            {selectedSection.description && (
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">{selectedSection.description}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop tab bar */}
          <div className="hidden md:flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === tab.id
                      ? "text-primary border-primary bg-blue-50"
                      : "text-gray-600 border-transparent hover:text-gray-900"
                    }`}
                >
                  <Icon className="text-base" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile dropdown - floats over content */}
          <div className="md:hidden border-b border-gray-200 relative z-20">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const currentTab = tabs.find((t) => t.id === activeTab);
                  const Icon = currentTab?.icon;
                  return (
                    <>
                      {Icon && <Icon className="text-base" />}
                      <span className="text-sm">{currentTab?.label || "Select Tab"}</span>
                    </>
                  );
                })()}
              </div>
              <FaChevronDown
                className={`text-xs transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-b-lg z-30">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition ${activeTab === tab.id
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                        } border-b last:border-b-0`}
                    >
                      <Icon className="text-base flex-shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 md:p-8">
            {activeTab === "enrollments" && (
              <SectionEnrollments
                courseId={course.id}
                studySectionId={selectedSection.id}
                sectionName={selectedSection.name}
                userRole={userRole}
              />
            )}

            {activeTab === "attendance" && AttendanceTab && (
              <AttendanceTab courseId={course.id} studySectionId={selectedSection.id} />
            )}

            {activeTab === "attendance" && !AttendanceTab && (
              <div className="text-center py-12 text-gray-500">
                Attendance is not available for this view.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sections list view
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaLayerGroup className="text-blue-600" />
            Study Sections
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage study sections, student enrollments, and attendance for this course.
          </p>
        </div>
        {userRole === "ADMIN" && (
          <button
            onClick={() => {
              setEditingSection(null);
              setFormData({ name: "", description: "" });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-semibold"
          >
            <FaPlus /> Add Section
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {editingSection ? "Edit Section" : "Create New Section"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingSection(null);
                setFormData({ name: "", description: "" });
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Section A, Morning Batch, Group 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this section"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSection(null);
                  setFormData({ name: "", description: "" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSection ? "Update" : "Create"} Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaLayerGroup className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Study Sections Yet</h3>
          <p className="text-gray-600 mb-4">
            Create study sections to organize course content into separate groups.
          </p>
          {userRole === "ADMIN" && (
            <button
              onClick={() => {
                setFormData({ name: "", description: "" });
                setShowForm(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="inline mr-2" />
              Create First Section
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => setSelectedSection(section)}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaLayerGroup className="text-xl text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {section.name}
                        {!section.isActive && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{section._count.enrollments} Enrolled</span>
                        <span>{section._count.attendances} Attendance Records</span>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>

                  {userRole === "ADMIN" && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(section);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit section"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(section.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete section"
                      >
                        <FaTrash />
                      </button>
                    </div>
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

// ─── Section Enrollments Component ──────────────────────────────────────────────

interface SectionEnrollmentsProps {
  courseId: string;
  studySectionId: string;
  sectionName: string;
  userRole: "ADMIN" | "STUDENT";
}

interface EnrollmentRecord {
  id: string;
  progress: number;
  enrolledAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

function SectionEnrollments({ courseId, studySectionId, sectionName, userRole }: SectionEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [enrollingStudentId, setEnrollingStudentId] = useState<string | null>(null);
  const [removingEnrollmentId, setRemovingEnrollmentId] = useState<string | null>(null);

  // Track if students have been fetched to avoid redundant API calls
  const studentsFetchedRef = useRef(false);

  useEffect(() => {
    fetchEnrollments();
  }, [courseId, studySectionId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<EnrollmentRecord[]>(`/admin/courses/${courseId}/enrollments?studySectionId=${studySectionId}`);
      setEnrollments(data);
    } catch {
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    // Skip if already fetched to avoid redundant API calls
    if (studentsFetchedRef.current && students.length > 0) {
      return;
    }

    try {
      const data = await apiClient.get<StudentRecord[]>("/users?role=STUDENT");
      setStudents(data);
      studentsFetchedRef.current = true;
    } catch {
      toast.error("Failed to load students");
    }
  };

  const handleEnroll = async (studentId: string) => {
    try {
      // Optimistic update: immediately show the student as enrolling
      setEnrollingStudentId(studentId);

      const newEnrollment = await apiClient.post<EnrollmentRecord>(`/admin/courses/${courseId}/enrollments`, { studentId, studySectionId });

      // Update enrollments optimistically without full refetch
      setEnrollments((prev) => [...prev, newEnrollment]);

      // Remove from available students
      setStudents((prev) => prev.filter((s) => s.id !== studentId));

      toast.success("Student enrolled successfully");
      setStudentSearch("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEnrollingStudentId(null);
    }
  };

  const handleRemove = async (enrollmentId: string) => {
    if (!confirm("Remove this student from the section?")) return;

    let removedEnrollment: (typeof enrollments)[number] | undefined;
    try {
      // Optimistic update: immediately remove from UI
      removedEnrollment = enrollments.find((e) => e.id === enrollmentId);
      setRemovingEnrollmentId(enrollmentId);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));

      await apiClient.delete(`/admin/courses/${courseId}/enrollments/${enrollmentId}`);

      // Add student back to available students if they exist
      const restored = removedEnrollment;
      if (restored) {
        setStudents((prev) => [...prev, restored.student]);
      }

      toast.success("Student removed");
    } catch {
      // Revert optimistic update on error
      setEnrollments((prev) => {
        if (removedEnrollment) {
          return [...prev, removedEnrollment];
        }
        return prev;
      });
      toast.error("Failed to remove student");
    } finally {
      setRemovingEnrollmentId(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = studentSearch.toLowerCase();
    const isEnrolled = enrollments.some((e) => e.student.id === student.id);
    return (
      !isEnrolled &&
      (student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <FaUsers className="text-blue-600" />
          Enrolled Students ({enrollments.length})
        </h3>
        {userRole === "ADMIN" && (
          <button
            onClick={() => {
              // When opening the Add Student form, fetch students if not already loaded
              if (!showAddStudent) {
                fetchStudents();
              }
              setShowAddStudent(!showAddStudent);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaUserPlus /> Add Student
          </button>
        )}
      </div>

      {/* Add Student Section */}
      {showAddStudent && userRole === "ADMIN" && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {studentSearch && (
            <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
              {students.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Loading students...
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="divide-y">
                  {filteredStudents.slice(0, 10).map((student) => (
                    <div
                      key={student.id}
                      className="p-3 hover:bg-gray-50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{student.name}</p>
                          <p className="text-xs text-gray-600 truncate">{student.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnroll(student.id)}
                        disabled={enrollingStudentId === student.id}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex-shrink-0"
                      >
                        {enrollingStudentId === student.id ? "Enrolling..." : "Enroll"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500 text-sm">No students found</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enrolled Students List */}
      {enrollments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Students Enrolled</h3>
          <p className="text-gray-600 text-sm">Add students to this section to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className={`p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between gap-3 transition ${removingEnrollmentId === enrollment.id ? 'opacity-50' : ''
                }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {enrollment.student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{enrollment.student.name}</p>
                  <p className="text-sm text-gray-600 truncate">{enrollment.student.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {userRole === "ADMIN" && (
                <button
                  onClick={() => handleRemove(enrollment.id)}
                  disabled={removingEnrollmentId === enrollment.id}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1 flex-shrink-0"
                >
                  <FaTrash className="text-xs" />
                  {removingEnrollmentId === enrollment.id ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
