import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CourseFormAdmin from "@/components/admin/CourseFormAdmin";
import { serverFetch } from "@/lib/serverApi";

export const metadata = {
  title: "Create Course | Progemini Admin",
};

async function getCategories() {
  return await serverFetch<any[]>('/v1/categories?isActive=true&sort=name&order=asc');
}

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const categories = await getCategories();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="heading-2 mb-2">Create New Course</h1>
        <p className="text-gray-600">Fill in the course details below</p>
      </div>

      <CourseFormAdmin 
        categories={categories}
      />
    </div>
  );
}
