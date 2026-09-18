'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

export default function StudentHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const sidebarEl = document.getElementById('mobile-sidebar');
    const overlayEl = document.getElementById('sidebar-overlay');

    if (isSidebarOpen) {
      sidebarEl?.classList.remove('hidden');
      overlayEl?.addEventListener('click', () => setIsSidebarOpen(false));
    } else {
      sidebarEl?.classList.add('hidden');
    }

    return () => {
      overlayEl?.removeEventListener('click', () => setIsSidebarOpen(false));
    };
  }, [isSidebarOpen]);

  return (
    <header className="bg-brand-secondary border-b border-gray-700 shadow-sm sticky top-0 z-30 lg:hidden">
      <div className="px-4 py-2.5 flex items-center justify-between gap-4 bg-brand-secondary">
        <Link href="/student/applications" className="flex items-center gap-2">
          <Image
            src="/progemini-logo-white-v2.png"
            alt="ProGemini Logo"
            width={160}
            height={58}
            priority
            className="h-9 w-auto object-contain"
          />
          <span className="text-xs text-gray-400 font-medium">Student</span>
        </Link>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-700 transition flex-shrink-0 text-white"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>
    </header>
  );
}
