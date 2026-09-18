'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaUsers, FaBook, FaCog, FaSignOutAlt, FaFileAlt, FaCalendarCheck, FaTimes, FaChevronDown, FaGlobe, FaImage, FaEnvelope, FaChalkboardTeacher, FaUniversity, FaPaperPlane, FaAddressBook, FaPlusCircle } from 'react-icons/fa';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const menuItems = [
  { icon: FaTachometerAlt, label: 'Dashboard', href: '/admin' },
  { icon: FaUsers, label: 'User Management', href: '/admin/users/manage' },
  { icon: FaFileAlt, label: 'Applications', href: '/admin/applications' },
  { icon: FaEnvelope, label: 'Enquiries', href: '/admin/enquiries' },
  { icon: FaBook, label: 'All Courses', href: '/admin/courses' },
];

const emailMarketingItems = [
  { icon: FaPaperPlane, label: 'Dashboard', href: '/admin/email-marketing' },
  { icon: FaEnvelope, label: 'All Campaigns', href: '/admin/email-marketing/campaigns' },
  { icon: FaPlusCircle, label: 'Create Campaign', href: '/admin/email-marketing/campaigns/new' },
  { icon: FaAddressBook, label: 'Contact Lists', href: '/admin/email-marketing/contacts' },
];

const webPagesItems = [
  { icon: FaImage, label: 'Homepage Slider', href: '/admin/web-pages/homepage-slider' },
  { icon: FaChalkboardTeacher, label: 'Academic Team', href: '/admin/web-pages/academic-team' },
  { icon: FaUsers, label: 'Global Leadership', href: '/admin/web-pages/global-leadership' },
  { icon: FaUsers, label: 'Consultants', href: '/admin/web-pages/consultants' },
  { icon: FaUniversity, label: 'Partner Universities', href: '/admin/web-pages/partner-universities' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [emailMarketingOpen, setEmailMarketingOpen] = useState(
    pathname.startsWith('/admin/email-marketing')
  );
  const [webPagesOpen, setWebPagesOpen] = useState(
    pathname.startsWith('/admin/web-pages')
  );

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      document.getElementById('admin-mobile-sidebar')?.classList.add('hidden');
    }
  };

  return (
    <div className="w-full bg-brand-secondary text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b bg-brand-primary border-gray-700 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="ProGemini Logo"
            width={120}
            height={50}
            priority
            className="object-contain hidden lg:block"
          />
          <div className="text-xs text-white">Admin Panel</div>
        </Link>
        <button
          className="lg:hidden text-gray-400 hover:text-white"
          title="Close sidebar"
          aria-label="Close sidebar"
          onClick={() => document.getElementById('admin-mobile-sidebar')?.classList.add('hidden')}
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <item.icon className="text-xl flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Email Marketing accordion */}
        <div>
          <button
            onClick={() => setEmailMarketingOpen((o) => !o)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${pathname.startsWith('/admin/email-marketing')
                ? 'bg-brand-primary text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <span className="flex items-center gap-3">
              <FaPaperPlane className="text-xl flex-shrink-0" />
              <span>Email Marketing</span>
            </span>
            <FaChevronDown className={`text-xs transition-transform ${emailMarketingOpen ? 'rotate-180' : ''}`} />
          </button>

          {emailMarketingOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l border-gray-600 pl-3">
              {emailMarketingItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                        ? 'bg-brand-primary text-white font-semibold'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                  >
                    <item.icon className="flex-shrink-0 text-sm" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Web Pages accordion */}
        <div>
          <button
            onClick={() => setWebPagesOpen((o) => !o)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${pathname.startsWith('/admin/web-pages')
                ? 'bg-brand-primary text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <span className="flex items-center gap-3">
              <FaGlobe className="text-xl flex-shrink-0" />
              <span>Web Pages</span>
            </span>
            <FaChevronDown className={`text-xs transition-transform ${webPagesOpen ? 'rotate-180' : ''}`} />
          </button>

          {webPagesOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l border-gray-600 pl-3">
              {webPagesItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                  >
                    <item.icon className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          className="block px-4 py-2 text-gray-300 hover:text-white mb-2"
        >
          ← Back to Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
