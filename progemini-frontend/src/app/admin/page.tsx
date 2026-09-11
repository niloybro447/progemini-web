import { serverFetch } from '@/lib/serverApi';
import { FaUsers, FaBook, FaDollarSign, FaChartLine, FaFileAlt } from 'react-icons/fa';
import Link from 'next/link';

async function getStats() {
  const [users, courses, orders, pendingCourses, applications, inReviewApplications, revenueData] = await Promise.all([
    serverFetch<any[]>('/v1/users'),
    serverFetch<any[]>('/v1/courses?isPublished=true'),
    serverFetch<any[]>('/v1/orders?status=COMPLETED'),
    serverFetch<any[]>('/v1/courses?status=PENDING'),
    serverFetch<any[]>('/v1/applications'),
    serverFetch<any[]>('/v1/applications?status=IN_REVIEW'),
    serverFetch<any>('/v1/orders?status=COMPLETED&aggregate=revenue'),
  ]);

  return {
    totalUsers: users.length,
    totalCourses: courses.length,
    totalOrders: orders.length,
    pendingCourses: pendingCourses.length,
    totalApplications: applications.length,
    inReviewApplications: inReviewApplications.length,
    revenue: revenueData?.total || 0,
  };
}

async function getRecentUsers() {
  return await serverFetch<any[]>('/v1/users?limit=5&sort=createdAt&order=desc');
}

async function getRecentOrders() {
  return await serverFetch<any[]>('/v1/orders?limit=5&sort=createdAt&order=desc&include=student,course');
}

async function getRecentApplications() {
  return await serverFetch<any[]>('/v1/applications?limit=5&sort=createdAt&order=desc&include=user,course');
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentUsers = await getRecentUsers();
  const recentOrders = await getRecentOrders();
  const recentApplications = await getRecentApplications();

  const statCards = [
    { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'blue', href: '/admin/users' },
    { icon: FaBook, label: 'Total Courses', value: stats.totalCourses, color: 'green', href: '/admin/courses' },
    { icon: FaFileAlt, label: 'Applications', value: stats.totalApplications, color: 'purple', href: '/admin/applications' },
    { icon: FaChartLine, label: 'Pending Courses', value: stats.pendingCourses, color: 'red', href: '/admin/courses?status=pending' },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="heading-2 mb-2">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Welcome back! Here's what's happening with Progemini Academy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.href} className="card p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gray-600 text-xs md:text-sm mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-brand-secondary line-clamp-1">{stat.value}</p>
              </div>
              <div className={`p-3 md:p-4 rounded-lg bg-${stat.color}-100 flex-shrink-0`}>
                <stat.icon className={`text-xl md:text-2xl text-${stat.color}-600`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Users */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
            <h2 className="heading-3 text-lg md:text-xl">Recent Users</h2>
            <Link href="/admin/users" className="text-brand-primary hover:text-red-700 text-xs md:text-sm font-semibold whitespace-nowrap">
              View All →
            </Link>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-start md:items-center justify-between py-2 md:py-3 border-b last:border-b-0 gap-2">
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br from-brand-primary to-red-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-secondary text-sm md:text-base truncate">{user.name}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 whitespace-nowrap">
                  <span className={`badge ${user.role === 'ADMIN' ? 'badge-red' : 'bg-blue-100 text-blue-700'} text-xs py-1 px-2`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        {/* <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
            <h2 className="heading-3 text-lg md:text-xl">Recent Orders</h2>
            <Link href="/admin/finances" className="text-brand-primary hover:text-red-700 text-xs md:text-sm font-semibold whitespace-nowrap">
              View All →
            </Link>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-2 md:py-3 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
                  <p className="font-semibold text-brand-secondary text-sm md:text-base truncate">{order.student.name}</p>
                  <span className="text-brand-primary font-bold text-sm md:text-base flex-shrink-0">${order.total.toFixed(2)}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-1 line-clamp-1">{order.course.title}</p>
                <div className="flex items-center justify-between">
                  <span className={`badge text-xs px-2 py-1 ${
                    order.status === 'COMPLETED' ? 'badge-green' : 
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Recent Applications */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
            <h2 className="heading-3 text-lg md:text-xl">Recent Applications</h2>
            <Link href="/admin/applications" className="text-brand-primary hover:text-red-700 text-xs md:text-sm font-semibold whitespace-nowrap">
              View All →
            </Link>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentApplications.map((application) => (
              <div key={application.id} className="py-2 md:py-3 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
                  <p className="font-semibold text-brand-secondary text-sm md:text-base truncate">{application.user.name}</p>
                  <span className={`badge text-xs px-2 py-1 flex-shrink-0 ${application.status === 'APPROVED' ? 'badge-green' :
                      application.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {application.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-1 line-clamp-1">{application.course.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
