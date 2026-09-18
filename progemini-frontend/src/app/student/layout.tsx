import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentHeader from '@/components/student/StudentHeader';
import StudentWelcomeBanner from '@/components/student/StudentWelcomeBanner';
import { getDashboardPath } from '@/lib/authNavigation';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'STUDENT') {
    redirect(getDashboardPath(user.role));
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Mobile/Tablet Header - Hidden on desktop (lg+) */}
      <div className="lg:hidden">
        <StudentHeader />
      </div>
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Visible on lg+ only */}
        <div className="hidden lg:block w-64 bg-brand-secondary text-white flex-shrink-0">
          <StudentSidebar />
        </div>
        
        {/* Mobile/Tablet Sidebar - Drawer overlay (lg:hidden) */}
        <div id="mobile-sidebar" className="lg:hidden hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" id="sidebar-overlay"></div>
          <div className="absolute left-0 top-0 h-full w-64 bg-brand-secondary text-white overflow-y-auto">
            <StudentSidebar />
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          <StudentWelcomeBanner />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
