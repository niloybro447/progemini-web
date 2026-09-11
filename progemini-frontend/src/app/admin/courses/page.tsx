import { serverFetch } from '@/lib/serverApi';
import Link from 'next/link';
import { CourseTableRow } from '@/components/admin/CourseTableRow';

async function getCourses() {
  return await serverFetch<any[]>('/v1/courses?sort=createdAt&order=desc&include=category,_count');
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-2 mb-2">Course Management</h1>
          <p className="text-gray-600">Manage all courses and approve new submissions</p>
        </div>
        <Link 
          href="/admin/courses/create"
          className="btn-primary flex items-center gap-2"
        >
          <span>+ Create Course</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-brand-primary text-white rounded-lg">All ({courses.length})</button>
          <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Pending ({courses.filter(c => c.status === 'PENDING').length})
          </button>
          <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Approved ({courses.filter(c => c.status === 'APPROVED').length})
          </button>
          <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Published ({courses.filter(c => c.isPublished).length})
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <CourseTableRow key={course.id} course={course} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
