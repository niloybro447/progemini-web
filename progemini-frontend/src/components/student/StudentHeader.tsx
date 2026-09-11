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
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 lg:hidden">
     <div className="px-4 py-0 flex items-center justify-between gap-4 bg-[#990014]">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/drgot7znf/image/upload/v1774958634/Progemini-trans-logo_fm1kzg.gif"
            alt="ProGemini Logo"
            width={200}
            height={80}
            priority
            className="object-contain"
          />
          <span className="text-xs text-white font-medium">Student</span>
        </Link>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-700 transition flex-shrink-0"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>
    </header>
  );
}
