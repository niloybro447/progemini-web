"use client";

import { FaCheckCircle, FaChevronDown, FaChevronUp, FaPlayCircle, FaBriefcase, FaGraduationCap, FaClipboardCheck, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { CourseRichRenderer, isRichContentEmpty } from "@/components/admin/CourseRichEditor";

interface CourseContentProps {
  course: any;
  relatedCourses: any[];
}

// Helper to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url.includes('autoplay=1') ? url : url + '?autoplay=1';
  }
  
  // For other URLs (Vimeo, direct links, etc.), return as-is
  return url;
}

// Video Modal Component
function VideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Video</h2>
          <div className="flex items-center space-x-2">
            {isYouTube && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Open on YouTube
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              title="Close"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="bg-black relative" style={{ paddingBottom: '56.25%' }}>
          {isYouTube ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl || ''}
              title="Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
            />
          ) : embedUrl?.endsWith('.mp4') || embedUrl?.endsWith('.webm') ? (
            <video
              className="absolute top-0 left-0 w-full h-full"
              controls
              autoPlay
            >
              <source src={embedUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl || ''}
              title="Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseContent({ course, relatedCourses }: CourseContentProps) {
  // Parse custom sections once
  let customSections: { id: string; label: string; content: string }[] = [];
  if (course.customSections) {
    try { customSections = JSON.parse(course.customSections); } catch {}
  }

  return (
    <div className="space-y-8">
      {!isRichContentEmpty(course.whatYouLearn) && (
        <div className="card p-6">
          <h2 className="heading-3 mb-6">What You will Learn</h2>
          <div>
            <CourseRichRenderer content={course.whatYouLearn} />
          </div>
        </div>
      )}

      {!isRichContentEmpty(course.introduction) && (
        <div className="card p-6">
          <h2 className="heading-3 mb-4">Introduction</h2>
          <div>
            <CourseRichRenderer content={course.introduction} />
          </div>
        </div>
      )}

      {course.sections?.length > 0 && (
        <div className="card p-6">
          <h2 className="heading-3 mb-4">Course Content</h2>
          <div className="space-y-3">
            {course.sections.map((section: any, index: number) => (
              <CourseSection key={section.id} section={section} isFirst={index === 0} />
            ))}
          </div>
        </div>
      )}

      {!isRichContentEmpty(course.requirements) && (
        <div className="card p-6">
          <h2 className="heading-3 mb-4">Requirements</h2>
          <div>
            <CourseRichRenderer content={course.requirements} />
          </div>
        </div>
      )}

      {!isRichContentEmpty(course.assessmentsVerification) && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaClipboardCheck className="text-brand-primary text-xl" />
            <h2 className="heading-3">Assessments and Verification</h2>
          </div>
          <div>
            <CourseRichRenderer content={course.assessmentsVerification} />
          </div>
        </div>
      )}

      {!isRichContentEmpty(course.academicAchievement) && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaGraduationCap className="text-brand-primary text-xl" />
            <h2 className="heading-3">Academic Achievement</h2>
          </div>
          <div>
            <CourseRichRenderer content={course.academicAchievement} />
          </div>
        </div>
      )}

      {!isRichContentEmpty(course.careerOpportunities) && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaBriefcase className="text-brand-primary text-xl" />
            <h2 className="heading-3">Career Opportunities</h2>
          </div>
          <div>
            <CourseRichRenderer content={course.careerOpportunities} />
          </div>
        </div>
      )}

      {/* Custom sections added by admin */}
      {customSections.filter(s => s.label?.trim() && !isRichContentEmpty(s.content)).map((section) => (
        <div key={section.id} className="card p-6">
          <h2 className="heading-3 mb-4">{section.label}</h2>
          <div>
            <CourseRichRenderer content={section.content} />
          </div>
        </div>
      ))}

      {relatedCourses.length > 0 && (
        <div>
          <h2 className="heading-3 mb-6">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedCourses.map((relatedCourse: any) => (
              <Link key={relatedCourse.id} href={`/courses/${relatedCourse.slug}`} className="card p-4 hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-brand-secondary mb-2 line-clamp-2">{relatedCourse.title}</h3>
                {relatedCourse.award && (
                  <div className="text-xs text-brand-primary font-medium mb-2">{relatedCourse.award}</div>
                )}
                <div className="flex items-center justify-between mt-3">
                  {relatedCourse.credits > 0 && (
                    <span className="text-sm text-gray-600">{relatedCourse.credits} Credits</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseSection({ section, isFirst }: { section: any; isFirst?: boolean }) {
  const [isOpen, setIsOpen] = useState(isFirst ?? false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            <span className="font-semibold text-brand-secondary">{section.title}</span>
          </div>
          <span className="text-sm text-gray-600">{section.lessons.length} modules</span>
        </button>
        {isOpen && (
          <div className="p-4 space-y-2">
            {section.lessons.map((lesson: any) => (
              <button
                key={lesson.id}
                onClick={() => lesson.content && setSelectedVideoUrl(lesson.content)}
                className="w-full flex items-center justify-between py-2 text-sm hover:bg-gray-50 px-2 rounded transition-colors text-left"
                disabled={!lesson.content}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {lesson.content ? (
                    <FaPlayCircle className="text-brand-primary text-lg flex-shrink-0" title="Video available" />
                  ) : (
                    <div className="w-5 flex-shrink-0" />
                  )}
                  <span className={`text-gray-700 ${lesson.content ? 'cursor-pointer hover:text-brand-primary font-medium' : ''}`}>
                    {lesson.title}
                  </span>
                  {lesson.isFree && <span className="badge badge-green text-xs">Free Preview</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedVideoUrl && (
        <VideoModal videoUrl={selectedVideoUrl} onClose={() => setSelectedVideoUrl(null)} />
      )}
    </>
  );
}
