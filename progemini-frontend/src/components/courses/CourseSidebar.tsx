"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaClock, FaInfinity, FaMobile, FaCertificate, FaTrophy, FaMedal, FaBook } from "react-icons/fa";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

interface CourseSidebarProps {
  course: any;
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      try {
        const data = await apiClient.get<any[]>(
          `/api/courses?category=${course.category?.slug}&search=&status=PUBLISHED`
        );
        // Filter out the current course and get first 3
        const filtered = data.filter((c: any) => c.id !== course.id).slice(0, 3);
        setRelatedCourses(filtered);
      } catch (error) {
        console.error("Error fetching related courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (course.category?.slug) {
      fetchRelatedCourses();
    }
  }, [course.id, course.category?.slug]);

  const handleEnroll = () => {
    if (status === "unauthenticated") {
      router.push("/signup?callbackUrl=/student/applications");
    } else {
      router.push("/student/apply");
    }
  };

  return (
    <div className="sticky top-24 space-y-6">
      <div className="card p-6">
        {course.credits > 0 && (
          <div className="mb-5 flex items-center space-x-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <FaTrophy className="text-yellow-500 text-2xl flex-shrink-0" />
            <div>
              <div className="text-xs text-yellow-700 font-medium uppercase tracking-wide">Total Credits</div>
              <div className="text-2xl font-bold text-yellow-600">{course.credits}</div>
            </div>
          </div>
        )}
        {(course.award || course.awardedBy) && (
          <div className="mb-5 flex items-center space-x-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl px-4 py-3">
            <FaMedal className="text-brand-primary text-2xl flex-shrink-0" />
            <div>
              {course.award && <div className="font-semibold text-brand-secondary text-sm">{course.award}</div>}
              {course.awardedBy && <div className="text-xs text-gray-500">Awarded by {course.awardedBy}</div>}
            </div>
          </div>
        )}
        <div className="mb-6">
          <button
            onClick={handleEnroll}
            className="btn-primary w-full flex items-center justify-center space-x-2 text-lg py-3"
          >
            <span>Apply Now</span>
          </button>
        </div>
      </div>

      {/* Related Courses Section */}
      {relatedCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Related Courses</h3>
          {relatedCourses.map((relatedCourse) => (
            <Link
              key={relatedCourse.id}
              href={`/courses/${relatedCourse.slug}`}
              className="card p-4 hover:shadow-lg hover:border-brand-primary transition-all border-2 border-transparent group"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary to-red-600 flex items-center justify-center">
                    <FaBook className="text-white text-lg" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 group-hover:text-brand-primary transition-colors line-clamp-2 text-sm">
                    {relatedCourse.title}
                  </h4>
                  {relatedCourse.award && (
                    <p className="text-xs text-brand-primary font-medium mt-1">{relatedCourse.award}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    {relatedCourse.credits > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        {relatedCourse.credits} Credits
                      </span>
                    )}
                    {relatedCourse._count?.enrollments && (
                      <span className="text-xs text-gray-500">
                        {relatedCourse._count.enrollments} students
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
