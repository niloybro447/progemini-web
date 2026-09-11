import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { getDashboardPath } from '@/lib/authNavigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect(getDashboardPath(user.role));
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <AdminHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-brand-secondary text-white flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        <div id="admin-mobile-sidebar" className="lg:hidden hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" id="admin-sidebar-overlay"></div>
          <div className="absolute left-0 top-0 h-full w-64 bg-brand-secondary text-white overflow-y-auto">
            <AdminSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
