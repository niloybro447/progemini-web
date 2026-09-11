import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/serverApi';
import CourseFormAdmin from '@/components/admin/CourseFormAdmin';

export const metadata: Metadata = {
  title: 'Edit Course - Progemini Admin',
  description: 'Edit course details and content',
};

async function getCourse(id: string) {
  return await serverFetch<any>(`/v1/courses/${id}?include=category,sections`);
}

async function getCategories() {
  return await serverFetch<any[]>('/v1/categories?sort=name&order=asc');
}

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const course = await getCourse(params.id);

  if (!course) {
    redirect('/admin/courses');
  }

  const categories = await getCategories();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="heading-2 mb-2">Edit Course</h1>
        <p className="text-gray-600">Update course details and content</p>
      </div>
      <CourseFormAdmin
        courseId={params.id}
        initialData={course}
        categories={categories}
      />
    </div>
  );
}
