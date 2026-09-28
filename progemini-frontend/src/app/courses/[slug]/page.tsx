import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { serverFetch } from '@/lib/serverApi';
import { getFileUrl } from '@/lib/utils';
import CourseHeader from '@/components/courses/CourseHeader';
import CourseContent from '@/components/courses/CourseContent';
import CourseSidebar from '@/components/courses/CourseSidebar';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface CoursePageProps {
  params: {
    slug: string;
  };
}

async function getCourse(slug: string) {
  try {
    const course = await serverFetch<any>(`/v1/courses/slug/${slug}`);
    return course;
  } catch (error: any) {
    if (error?.message !== 'Course not found' && !error?.message?.includes('404')) {
      console.error(`Error fetching course for slug "${slug}":`, error);
    }
    return null;
  }
}

async function getRelatedCourses(categoryId?: string, currentCourseId?: string) {
  if (!categoryId) return [];
  try {
    const courses = await serverFetch<any[]>(`/v1/courses?categoryId=${categoryId}`);
    if (!Array.isArray(courses)) return [];
    return courses.filter((c: any) => c.id !== currentCourseId).slice(0, 4);
  } catch (error) {
    console.error('Error fetching related courses:', error);
    return [];
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  const relatedCourses = await getRelatedCourses(course.categoryId, course.id);

  return (
    <main>
      <Navbar />
      <CourseHeader course={course} />

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseContent course={course} relatedCourses={relatedCourses} />
          </div>
          <div className="lg:col-span-1">
            <CourseSidebar course={course} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export async function generateMetadata({ params }: CoursePageProps) {
  const course = await getCourse(params.slug);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: course.metaTitle || course.title,
    description: course.metaDescription || course.shortDescription,
    keywords: course.metaKeywords,
    openGraph: {
      title: course.title,
      description: course.shortDescription || '',
      type: 'website',
      images: [getFileUrl(course.featureImage) || ''],
    },
  };
}

