"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaSave, FaTimes, FaPlayCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null; // Video URL
  duration: number;
  order: number;
  isFree: boolean;
}

interface CourseContentManagerProps {
  courseId: string;
}

export default function CourseContentManager({ courseId }: CourseContentManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: "", description: "" });
  
  // Lecture form
  const [showLectureForm, setShowLectureForm] = useState<string | null>(null); // sectionId
  const [editingLecture, setEditingLecture] = useState<Lesson | null>(null);
  const [lectureForm, setLectureForm] = useState({
    title: "",
    description: "",
    content: "",
    duration: 0,
    isFree: false,
  });

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
    try {
      const data = await apiClient.get<Section[]>(`/admin/courses/${courseId}/sections`);
      console.log('Fetched sections data:', data);
      // Ensure each section has lessons array
      const sectionsWithLessons = (data || []).map((section: any) => ({
        ...section,
        lessons: section.lessons || [],
      }));
      console.log('Sections with lessons:', sectionsWithLessons);
      setSections(sectionsWithLessons);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Section CRUD
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSection
        ? `/admin/courses/${courseId}/sections/${editingSection.id}`
        : `/admin/courses/${courseId}/sections`;
      
      const body = {
        ...sectionForm,
        order: editingSection?.order || sections.length,
      };

      if (editingSection) {
        await apiClient.put(url, body);
      } else {
        await apiClient.post(url, body);
      }

      toast.success(editingSection ? "Section updated!" : "Section created!");
      
      setSectionForm({ title: "", description: "" });
      setEditingSection(null);
      setShowSectionForm(false);
      
      await fetchSections();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lectures?")) return;

    try {
      await apiClient.delete(`/admin/courses/${courseId}/sections/${sectionId}`);

      toast.success("Section deleted!");
      await fetchSections();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Lecture CRUD
  const handleLectureSubmit = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    
    try {
      const url = editingLecture
        ? `/admin/courses/${courseId}/sections/${sectionId}/lectures/${editingLecture.id}`
        : `/admin/courses/${courseId}/sections/${sectionId}/lectures`;
      
      const section = sections.find((s) => s.id === sectionId);
      const lectureCount = section?.lessons.length || 0;
      
      const body = {
        ...lectureForm,
        order: editingLecture?.order || lectureCount,
      };

      if (editingLecture) {
        await apiClient.put(url, body);
      } else {
        await apiClient.post(url, body);
      }

      toast.success(editingLecture ? "Lecture updated!" : "Lecture created!");
      
      setLectureForm({ title: "", description: "", content: "", duration: 0, isFree: false });
      setEditingLecture(null);
      setShowLectureForm(null);
      
      await fetchSections();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteLecture = async (sectionId: string, lectureId: string) => {
    if (!confirm("Delete this lecture?")) return;

    try {
      await apiClient.delete(
        `/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`
      );

      toast.success("Lecture deleted!");
      await fetchSections();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionForm({ title: section.title, description: section.description || "" });
    setShowSectionForm(true);
  };

  const startEditLecture = (lecture: Lesson, sectionId: string) => {
    setEditingLecture(lecture);
    setLectureForm({
      title: lecture.title,
      description: lecture.description || "",
      content: lecture.content || "",
      duration: Math.floor(lecture.duration / 60), // Convert seconds to minutes for form
      isFree: lecture.isFree,
    });
    setShowLectureForm(sectionId);
  };

  const cancelSectionForm = () => {
    setShowSectionForm(false);
    setEditingSection(null);
    setSectionForm({ title: "", description: "" });
  };

  const cancelLectureForm = () => {
    setShowLectureForm(null);
    setEditingLecture(null);
    setLectureForm({ title: "", description: "", content: "", duration: 0, isFree: false });
  };

  if (loading) {
    return <div className="text-center py-8">Loading course content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Content</h2>
          <p className="text-gray-600 text-sm mt-1">
            Organize your course into sections (topics) and lectures
          </p>
        </div>
        <button
          onClick={() => setShowSectionForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Section</span>
        </button>
      </div>

      {/* Section Form */}
      {showSectionForm && (
        <div className="card p-6 border-2 border-brand-primary">
          <h3 className="text-lg font-semibold mb-4">
            {editingSection ? "Edit Section" : "New Section"}
          </h3>
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Section Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Introduction to React"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Brief description of what this section covers"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <FaSave />
                <span>{editingSection ? "Update" : "Create"} Section</span>
              </button>
              <button
                type="button"
                onClick={cancelSectionForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No sections yet. Add your first section to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="card border-2">
              {/* Section Header */}
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="text-gray-600 hover:text-brand-primary"
                  >
                    {expandedSections.has(section.id) ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  <div>
                    <h3 className="font-semibold">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-600">{section.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {(section.lessons || []).length} lecture{(section.lessons || []).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEditSection(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit section"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete section"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => {
                      setShowLectureForm(section.id);
                      // Ensure section is expanded to show the form
                      if (!expandedSections.has(section.id)) {
                        toggleSection(section.id);
                      }
                    }}
                    className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:bg-brand-primary/90"
                  >
                    + Add Lecture
                  </button>
                </div>
              </div>

              {/* Section Content */}
              {expandedSections.has(section.id) && (
                <div className="p-4">
                  {/* Lecture Form */}
                  {showLectureForm === section.id && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-3">
                        {editingLecture ? "Edit Lecture" : "New Lecture"}
                      </h4>
                      <form
                        onSubmit={(e) => handleLectureSubmit(e, section.id)}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Lecture Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={lectureForm.title}
                            onChange={(e) =>
                              setLectureForm({ ...lectureForm, title: e.target.value })
                            }
                            className="input-field"
                            placeholder="e.g., What is React?"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            value={lectureForm.description}
                            onChange={(e) =>
                              setLectureForm({ ...lectureForm, description: e.target.value })
                            }
                            className="input-field"
                            rows={2}
                            placeholder="Brief description of this lecture"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Video URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={lectureForm.content}
                              onChange={(e) =>
                                setLectureForm({ ...lectureForm, content: e.target.value })
                              }
                              className="input-field"
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              value={lectureForm.duration}
                              onChange={(e) =>
                                setLectureForm({
                                  ...lectureForm,
                                  duration: parseInt(e.target.value) || 0,
                                })
                              }
                              className="input-field"
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={lectureForm.isFree}
                              onChange={(e) =>
                                setLectureForm({ ...lectureForm, isFree: e.target.checked })
                              }
                              className="mr-2"
                            />
                            <span className="text-sm">Free preview (accessible without enrollment)</span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button type="submit" className="btn-primary text-sm">
                            {editingLecture ? "Update" : "Add"} Lecture
                          </button>
                          <button
                            type="button"
                            onClick={cancelLectureForm}
                            className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Lectures List */}
                  {(section.lessons || []).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No lectures yet. Click "Add Lecture" to create one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(section.lessons || []).map((lecture, lectureIndex) => (
                        <div
                          key={lecture.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {lecture.content ? (
                                <FaPlayCircle className="text-brand-primary text-lg flex-shrink-0" title="Has video" />
                              ) : (
                                <span className="text-sm text-gray-500 w-6 text-center">
                                  {lectureIndex + 1}.
                                </span>
                              )}
                              <h4 className="font-medium">{lecture.title}</h4>
                              {lecture.isFree && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Free
                                </span>
                              )}
                            </div>
                            {lecture.description && (
                              <p className="text-sm text-gray-600 mt-1 ml-6">
                                {lecture.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-1 ml-6 text-xs text-gray-500">
                              {lecture.duration > 0 && <span>{Math.floor(lecture.duration / 60)} min</span>}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditLecture(lecture, section.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit lecture"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteLecture(section.id, lecture.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete lecture"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Done Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={() => {
            toast.success("Course content saved!");
            router.push("/admin/courses");
            router.refresh();
          }}
          className="btn-primary"
        >
          Done & Go to Courses
        </button>
      </div>
    </div>
  );
}
