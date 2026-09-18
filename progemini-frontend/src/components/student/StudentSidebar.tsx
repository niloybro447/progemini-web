'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaBook, FaShoppingBag, FaCog, FaSignOutAlt, FaComments, FaUser, FaFileAlt, FaCalendarCheck, FaTimes, FaClipboardList } from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

const menuItems = [
  { icon: FaFileAlt, label: 'Applications', href: '/student/applications' },
  { icon: FaUser, label: 'My Profile', href: '/student/profile' },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleNavClick = () => {
    // Close sidebar on mobile/tablet when a link is clicked (below 1024px)
    if (window.innerWidth < 1024) {
      const sidebarEl = document.getElementById('mobile-sidebar');
      sidebarEl?.classList.add('hidden');
    }
  };

  return (
    <div className="w-full bg-brand-secondary text-white flex flex-col h-full">
      {/* Logo - Mobile Close Button */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center bg-brand-secondary justify-between min-h-[76px]">
        <Link href="/student/applications" className="flex items-center">
          <Image
            src="/progemini-logo-white-v2.png"
            alt="ProGemini Logo"
            width={200}
            height={73}
            priority
            className="h-12 sm:h-13 w-auto max-w-[200px] object-contain"
          />
        </Link>
        {/* Close Button - Mobile/Tablet Only */}
        <button
          className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800"
          onClick={() => document.getElementById('mobile-sidebar')?.classList.add('hidden')}
          title="Close menu"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <item.icon className="text-xl flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        {/* Student Profile Section */}
        {session?.user && (
          <div className="px-4 py-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{session.user.name || 'Student'}</p>
                <p className="text-xs text-gray-300 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/"
          onClick={handleNavClick}
          className="block px-4 py-2 text-gray-300 hover:text-white text-sm rounded hover:bg-gray-700"
        >
          ← Back to Website
        </Link>
        <button
          onClick={() => {
            signOut({ callbackUrl: '/' });
            handleNavClick();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors text-sm"
        >
          <FaSignOutAlt className="flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
