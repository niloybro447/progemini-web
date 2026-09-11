import { getCurrentUser } from '@/lib/session';
import { serverFetch } from '@/lib/serverApi';
import Link from 'next/link';
import { FaClock, FaBook, FaChartLine, FaLayerGroup } from 'react-icons/fa';

async function getStudentSections(studentId: string) {
  return serverFetch<any[]>('/v1/enrollments');
}

export default async function StudentCoursesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await getStudentSections(user.id);

  // Group enrollments by course
  const courseMap = new Map<string, { course: any; enrollments: typeof enrollments }>();
  for (const enrollment of enrollments) {
    const courseId = enrollment.courseId;
    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, { course: enrollment.course, enrollments: [] });
    }
    courseMap.get(courseId)!.enrollments.push(enrollment);
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="heading-2 text-2xl md:text-3xl mb-1 md:mb-2">My Courses</h1>
        <p className="text-xs md:text-sm text-gray-600">Continue your learning journey</p>
      </div>

      {/* Courses */}
      {courseMap.size === 0 ? (
        <div className="text-center py-8 md:py-12 card">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">📚</div>
          <h3 className="text-lg md:text-xl font-bold text-brand-secondary mb-2">No courses yet</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">Start your learning journey by enrolling in a course</p>
          <Link href="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from(courseMap.entries()).map(([courseId, { course, enrollments: sectionEnrollments }]) => {
            // Find the first enrolled section for this course
            const firstSection = sectionEnrollments[0]?.studySection;
            // Section profile link (assuming /student/sections/[sectionId])
            const sectionProfileUrl = firstSection ? `/student/sections/${firstSection.id}` : undefined;
            return (
              <Link
                key={courseId}
                href={sectionProfileUrl || '#'}
                className="card overflow-hidden transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                {/* Course Header */}
                <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 md:p-6">
                  <div className="flex items-center gap-3">
                  
                    <div className="flex-1 min-w-0">
                      <div className="text-xs opacity-90 mb-1">{course.category?.name}</div>
                      <h2 className="text-lg md:text-xl font-bold ">{course.title}</h2>

                      {firstSection ? (
                        <p className="text-xs md:text-sm opacity-90 mt-1 underline hover:text-brand-accent transition-colors block">
                          Section: {firstSection.name}
                        </p>
                      ) : (
                        <span className="text-xs md:text-sm opacity-90 mt-1 block">Section: N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
