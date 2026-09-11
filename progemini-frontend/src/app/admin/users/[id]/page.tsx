import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/serverApi';
import Link from 'next/link';
import { FaArrowLeft, FaEnvelope, FaCalendar, FaBook } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'User Details - Progemini Admin',
  description: 'View user profile and enrollment details',
};

async function getUser(id: string) {
  return await serverFetch<any>(`/v1/users/${id}?include=enrollments,_count`);
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const user = await getUser(params.id);

  if (!user) {
    redirect('/admin/users');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users/manage"
          className="inline-flex items-center text-brand-primary hover:text-red-700 mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 flex items-center justify-center mt-2">
                <FaEnvelope className="mr-2" />
                {user.email}
              </p>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <FaCalendar className="mr-2" />
                  Joined
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {user.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="mt-1 text-gray-900">{user.phone}</p>
                </div>
              )}

              {user.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bio</label>
                  <p className="mt-1 text-gray-700 text-sm">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-brand-primary">{user._count.enrollments}</div>
                <div className="text-xs text-gray-600">Enrollments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-primary">{user._count.reviews}</div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          {user.role === 'STUDENT' && (
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FaBook className="mr-2 text-brand-primary" />
                Enrolled Courses ({user.enrollments.length})
              </h3>

              {user.enrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No enrollments yet</p>
              ) : (
                <div className="space-y-4">
                  {user.enrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-red-600 rounded flex items-center justify-center text-white font-bold flex-shrink-0">
                        {enrollment.course.title.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{enrollment.course.title}</h4>
                        <p className="text-sm text-gray-600">
                          Progemini
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${enrollment.progress === 100
                              ? 'bg-green-100 text-green-700'
                              : enrollment.progress > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                            Progress: {enrollment.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-brand-primary">
                          ${enrollment.course.price}
                        </div>
                        <Link
                          href={`/admin/courses/${enrollment.course.id}/edit`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
