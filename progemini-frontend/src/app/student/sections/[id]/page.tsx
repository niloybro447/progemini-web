import { getCurrentUser } from '@/lib/session';
import { serverFetch } from '@/lib/serverApi';
import { redirect } from 'next/navigation';
import CourseProfileClient from './ClientWrapper';

async function getSectionCourseData(sectionId: string, studentId: string) {
  const enrollments = await serverFetch<any[]>(`/v1/enrollments?sectionId=${sectionId}`);
  const enrollment = enrollments[0];

  if (!enrollment) {
    redirect('/student/courses');
  }

  const courseId = enrollment.courseId;

  return { enrollment, courseId };
}

export default async function SectionProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { enrollment, courseId } = await getSectionCourseData(params.id, user.id);

  const sectionName = enrollment.studySection?.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="text-xs md:text-sm mb-2 opacity-90">
                {enrollment.course.category.name}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {enrollment.course.title}
              </h1>
              {sectionName && (
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold mb-4">
                  Section: {sectionName}
                </div>
              )}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - With proper max-width container like admin dashboard */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <CourseProfileClient
          courseId={courseId}
          studySectionId={params.id}
        />
      </div>
    </div>
  );
}
