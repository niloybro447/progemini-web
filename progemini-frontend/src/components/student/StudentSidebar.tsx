'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  FaTimes,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaAward,
  FaCertificate,
  FaClipboardList,
  FaLaptopCode,
} from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';
import { apiClient } from '@/lib/apiClient';

export default function StudentSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [isCertified, setIsCertified] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function checkCertificationStatus() {
      if (!session?.user?.id) return;
      try {
        const queryUserId = searchParams.get('userId');
        const effectiveId =
          session.user.role === 'ADMIN' && queryUserId
            ? queryUserId
            : session.user.id;
        const res = await apiClient.get<any>(`/v1/certificates/user/${effectiveId}`);
        const certs = res?.data || (Array.isArray(res) ? res : []);
        const published = certs.some((c: any) => c.status === 'PUBLISHED');
        if (isMounted) setIsCertified(published);
      } catch (err) {
        // silent fallback
      }
    }
    checkCertificationStatus();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, searchParams]);

  const handleNavClick = () => {
    // Close sidebar on mobile/tablet when a link is clicked (below 1024px)
    if (window.innerWidth < 1024) {
      const sidebarEl = document.getElementById('mobile-sidebar');
      sidebarEl?.classList.add('hidden');
    }
  };

  const isApplicationsActive = pathname.startsWith('/student/applications');
  const isRecordsActive = pathname.startsWith('/student/records');
  const isProfileActive = pathname === '/student/profile';
  const isVleActive = pathname.startsWith('/student/vle');

  const activeTab = searchParams.get('tab');
  const isCertSubActive = isRecordsActive && (activeTab === 'certificate' || (!activeTab && pathname.includes('certificate')));
  const isMarksheetSubActive = isRecordsActive && (activeTab === 'marksheet' || pathname.includes('marksheet'));

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
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {/* 1. Applications */}
        <Link
          href="/student/applications"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isApplicationsActive
              ? 'bg-brand-primary text-white font-semibold'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FaFileAlt className="text-xl flex-shrink-0" />
          <span className="text-sm">Applications</span>
        </Link>

        {/* 2. Records (Under Applications) */}
        <div className="space-y-1">
          <Link
            href="/student/records"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isRecordsActive && !isCertSubActive && !isMarksheetSubActive
                ? 'bg-brand-primary text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FaAward className="text-xl flex-shrink-0" />
            <span className="text-sm">Records</span>
          </Link>

          {/* Sub-options: Only visible if student certificate is published */}
          {isCertified && (
            <div className="pl-6 space-y-1">
              <Link
                href="/student/records?tab=certificate"
                onClick={handleNavClick}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isCertSubActive
                    ? 'bg-brand-primary text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FaCertificate className="text-sm flex-shrink-0 text-amber-400" />
                <span>Certificate</span>
              </Link>

              <Link
                href="/student/records?tab=marksheet"
                onClick={handleNavClick}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isMarksheetSubActive
                    ? 'bg-brand-primary text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FaClipboardList className="text-sm flex-shrink-0 text-amber-200" />
                <span>Academic Marksheet</span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. My Profile */}
        <Link
          href="/student/profile"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isProfileActive
              ? 'bg-brand-primary text-white font-semibold'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FaUser className="text-xl flex-shrink-0" />
          <span className="text-sm">My Profile</span>
        </Link>

        {/* 4. VLE (Under Profile) */}
        <Link
          href="/student/vle"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isVleActive
              ? 'bg-brand-primary text-white font-semibold'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FaLaptopCode className="text-xl flex-shrink-0" />
          <span className="text-sm">VLE</span>
        </Link>
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
