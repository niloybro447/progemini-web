import { serverFetch } from '@/lib/serverApi';
import Link from 'next/link';
import { CourseTableRow } from '@/components/admin/CourseTableRow';

async function getCourses() {
  try {
    return await serverFetch<any[]>('/v1/admin/courses');
  } catch {
    return await serverFetch<any[]>('/v1/courses?all=1&sort=createdAt&order=desc&include=category,_count');
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const courses = await getCourses();
  const activeFilter = (searchParams?.filter || 'ALL').toUpperCase();

  const filteredCourses = courses.filter((c) => {
    if (activeFilter === 'DRAFT') return c.status === 'DRAFT';
    if (activeFilter === 'PENDING') return c.status === 'PENDING';
    if (activeFilter === 'APPROVED') return c.status === 'APPROVED';
    if (activeFilter === 'PUBLISHED') return Boolean(c.isPublished);
    return true;
  });

  const tabs = [
    { key: 'ALL', label: `All (${courses.length})`, href: '/admin/courses' },
    { key: 'DRAFT', label: `Draft (${courses.filter((c) => c.status === 'DRAFT').length})`, href: '/admin/courses?filter=DRAFT' },
    { key: 'PENDING', label: `Pending (${courses.filter((c) => c.status === 'PENDING').length})`, href: '/admin/courses?filter=PENDING' },
    { key: 'APPROVED', label: `Approved (${courses.filter((c) => c.status === 'APPROVED').length})`, href: '/admin/courses?filter=APPROVED' },
    { key: 'PUBLISHED', label: `Published (${courses.filter((c) => c.isPublished).length})`, href: '/admin/courses?filter=PUBLISHED' },
  ];

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
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
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
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <CourseTableRow key={course.id} course={course} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No courses found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
