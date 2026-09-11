'use client';

import CourseProfileTabs from '@/components/student/CourseProfileTabs';

interface CourseProfileClientProps {
  courseId: string;
  studySectionId?: string;
}

export default function CourseProfileClient({
  courseId,
  studySectionId,
}: CourseProfileClientProps) {
  return (
    <CourseProfileTabs
      courseId={courseId}
      studySectionId={studySectionId}
    />
  );
}
