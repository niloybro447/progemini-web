"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ReactPlayer from "react-player";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  content: string | null;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Enrollment {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
  instructor?: { name: string };
    sections: Section[];
  };
}

export default function CourseViewerPage({
  params,
}: {
  params: { enrollmentId: string };
}) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [playing, setPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollment();
  }, []);

  const fetchEnrollment = async () => {
    try {
      const res = await fetch(`/api/enrollments/${params.enrollmentId}`);
      const data = await res.json();
      setEnrollment(data);

      // Set first lesson as default
      if (data.course.sections.length > 0) {
        const firstLesson = data.course.sections[0].lessons[0];
        if (firstLesson) setCurrentLesson(firstLesson);
      }
    } catch (error) {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    setWatchTime(Math.floor(state.playedSeconds));
  };

  const handleLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      const res = await fetch(
        `/api/enrollments/${params.enrollmentId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: currentLesson.id,
            isCompleted: true,
            watchTime,
          }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Lesson marked as complete!");
      fetchEnrollment(); // Refresh enrollment data
    } catch (error) {
      toast.error("Failed to mark lesson complete");
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setWatchTime(0);
    setPlaying(true);
  };

  if (loading || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Video Player */}
        <div className="lg:col-span-3 bg-black">
          <div className="sticky top-0">
            {currentLesson?.videoUrl ? (
              <div className="aspect-video">
                <ReactPlayer
                  url={currentLesson.videoUrl}
                  width="100%"
                  height="100%"
                  playing={playing}
                  controls
                  onProgress={handleProgress}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <p className="text-white">No video available</p>
              </div>
            )}

            {/* Lesson Info */}
            <div className="bg-white p-6">
              <h1 className="text-2xl font-bold mb-2">
                {currentLesson?.title || "Select a lesson"}
              </h1>
              <p className="text-gray-600 mb-4">
                Progemini
              </p>

              {currentLesson?.content && (
                <div className="prose max-w-none">
                  <p>{currentLesson.content}</p>
                </div>
              )}

              <button
                onClick={handleLessonComplete}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark as Complete
              </button>
            </div>
          </div>
        </div>

        {/* Curriculum Sidebar */}
        <div className="bg-white border-l overflow-y-auto max-h-screen">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">{enrollment.course.title}</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {enrollment.progress}%
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {enrollment.course.sections.map((section) => (
              <div key={section.id}>
                <h3 className="font-semibold mb-2">{section.title}</h3>
                <div className="space-y-1">
                  {section.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        currentLesson?.id === lesson.id
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{lesson.title}</span>
                        <span className="text-xs">
                          {lesson.duration} min
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
