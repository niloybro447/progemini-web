'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaChevronDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import CoursesMegaMenu, { undergraduateCourses, graduateCourses, executiveCourses } from './CoursesMegaMenu';

// Mobile menu data
const departments = {
  undergraduate: [
    { name: 'School of Business, Management & Entrepreneurship', slug: 'business-and-management' },
    { name: 'School of Health, Social Care & Wellness', slug: 'health-and-social-care' },
    { name: 'School of Law & Criminology', slug: 'criminology-and-law' }
  ],
  graduate: [
    { name: 'School of Business, Management & Entrepreneurship', slug: 'business-and-management' },
    { name: 'School of Health, Social Care & Wellness', slug: 'health-and-social-care' },
    { name: 'School of Law & Criminology', slug: 'criminology-and-law' }
  ],
};

const coursesData = {
  undergraduate: undergraduateCourses,
  graduate: graduateCourses,
  executive: executiveCourses,
};

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileCoursesCategory, setMobileCoursesCategory] = useState<'undergraduate' | 'graduate' | 'executive' | null>('undergraduate');
  const [openMobileDepartment, setOpenMobileDepartment] = useState<string | null>(null);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const coursesRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coursesRef.current && !coursesRef.current.contains(event.target as Node)) {
        setIsCoursesOpen(false);
      }
      if (journeyRef.current && !journeyRef.current.contains(event.target as Node)) {
        setIsJourneyOpen(false);
      }
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setIsAboutOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!session?.user) return '/';
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin';
      case 'STUDENT':
        return '/student';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://res.cloudinary.com/drgot7znf/image/upload/v1774958634/Progemini-trans-logo_fm1kzg.gif"
              alt="ProGemini Logo"
              width={150}
              height={80}
              priority
              className="w-[100px] h-auto md:w-[150px] object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm lg:text-[15px] xl:text-base leading-none">
            <Link href="/" className="shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">
              Home
            </Link>
            
            {/* Courses Dropdown */}
            <div 
              ref={coursesRef}
              className="relative"
            >
              <button 
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="flex items-center space-x-1 shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap"
              >
                <span>Courses</span>
                <FaChevronDown className={`text-sm transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCoursesOpen && (
                <CoursesMegaMenu onClose={() => setIsCoursesOpen(false)} />
              )}
            </div>

            {/* Student Journey Dropdown */}
            <div 
              ref={journeyRef}
              className="relative"
            >
              <button 
                onClick={() => setIsJourneyOpen(!isJourneyOpen)}
                className="flex items-center space-x-1 shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap"
              >
                <span>Student Journey</span>
                <FaChevronDown className={`text-sm transition-transform ${isJourneyOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isJourneyOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl rounded-lg py-2 block">
                  <Link href="/student-journey" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsJourneyOpen(false)}>Overview</Link>
                  <Link href="/student-journey/global-experience" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsJourneyOpen(false)}>Global Experience</Link>
                  <Link href="/student-journey/pathway" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsJourneyOpen(false)}>Your Pathway</Link>
                  <Link href="/student-journey/campus-network" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsJourneyOpen(false)}>Campus Network</Link>
                  <Link href="/student-journey/student-experience" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsJourneyOpen(false)}>Student Experience</Link>
                </div>
              )}
            </div>

            {/* About Dropdown */}
            <div 
              ref={aboutRef}
              className="relative"
            >
              <button 
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className="flex items-center space-x-1 shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap"
              >
                <span>About</span>
                <FaChevronDown className={`text-sm transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAboutOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl rounded-lg py-2 block">
                  <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsAboutOpen(false)}>
                    About Progemini
                  </Link>
                  <Link href="/about/global-leadership" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsAboutOpen(false)}>
                    Global Leadership Team
                  </Link>
                  <Link href="/about/academic-team" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsAboutOpen(false)}>
                    Academic Team
                  </Link>
                  <Link href="/about/consultants" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsAboutOpen(false)}>
                    Consultants
                  </Link>
                  <Link href="/about/partner-universities" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-sm" onClick={() => setIsAboutOpen(false)}>
                    Global Partner Universities
                  </Link>
                </div>
              )}
            </div>

            <Link href="/research" className="shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">
              Research
            </Link>
            <Link href="/blog" className="shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">
              Blog
            </Link>
            <Link href="/contact" className="shrink-0 text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">
              Contact
            </Link>
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3 sm:gap-4 lg:gap-6 ml-4 lg:ml-6 shrink-0">
            {session?.user ? (
              <>
                <a href="https://vle.progemini.academy/login" className="btn-primary shrink-0 whitespace-nowrap px-4 py-2 text-sm lg:text-[15px]">
                  Portal
                </a>
                <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-brand-primary"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-red-600 flex items-center justify-center text-white font-semibold">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                  <FaChevronDown className="text-sm" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold text-brand-secondary">{session.user.name}</p>
                      <p className="text-sm text-gray-600">{session.user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-red-100 text-brand-primary">
                        {session.user.role}
                      </span>
                    </div>
                    <Link 
                      href={getDashboardLink()} 
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-brand-primary"
                    >
                      Dashboard
                    </Link>
                    {session.user.role !== 'STUDENT' && (
                      <>
                        <Link 
                          href="/student/courses" 
                          className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-brand-primary"
                        >
                          My Courses
                        </Link>
                        <Link 
                          href="/student/settings" 
                          className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-brand-primary"
                        >
                          Settings
                        </Link>
                      </>
                    )}
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link href="/login" className="shrink-0 whitespace-nowrap text-gray-700 hover:text-brand-primary font-medium text-sm lg:text-[15px]">
                  Log In
                </Link>
                <a href="https://vle.progemini.academy/login" className="btn-primary shrink-0 whitespace-nowrap px-4 py-2 text-sm lg:text-[15px]">
                  Portal
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-2xl text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t px-4 max-h-[85vh] overflow-y-auto overflow-x-hidden bg-white shadow-inner w-full max-w-full">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-800 hover:text-brand-primary font-semibold text-lg py-1" onClick={() => setIsMenuOpen(false)}>Home</Link>
              
              {/* Mobile Courses Section - Accordion Style */}
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-800">Courses & Programmes</span>
                  <Link href="/courses" className="text-xs font-bold text-brand-primary uppercase tracking-wider" onClick={() => setIsMenuOpen(false)}>View All</Link>
                </div>
                
                {/* Category Tabs */}
                <div className="mb-3 pb-3 border-b border-gray-200 overflow-x-auto whitespace-nowrap no-scrollbar">
                  <div className="flex w-max min-w-full gap-2">
                  <button
                    onClick={() => {
                      setMobileCoursesCategory('undergraduate');
                      setOpenMobileDepartment(null);
                    }}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      mobileCoursesCategory === 'undergraduate'
                        ? 'bg-brand-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                    }`}
                  >
                    UNDERGRAD
                  </button>
                  <button
                    onClick={() => {
                      setMobileCoursesCategory('graduate');
                      setOpenMobileDepartment(null);
                    }}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      mobileCoursesCategory === 'graduate'
                        ? 'bg-brand-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                    }`}
                  >
                    POSTGRADUATE
                  </button>
                  <button
                    onClick={() => {
                      setMobileCoursesCategory('executive');
                      setOpenMobileDepartment(null);
                    }}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      mobileCoursesCategory === 'executive'
                        ? 'bg-brand-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-primary'
                    }`}
                  >
                    EXECUTIVE
                  </button>
                  </div>
                </div>

                {/* Departments/Courses List */}
                {mobileCoursesCategory === 'executive' ? (
                  /* Executive Education - Direct Courses */
                  <div className="space-y-1.5">
                    {(coursesData.executive as any[]).map((course) => (
                      <Link
                        key={course.slug}
                        href={`/courses/${course.slug}`}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMobileCoursesCategory(null);
                        }}
                        className="block px-3 py-2 text-sm text-gray-700 hover:text-brand-primary hover:bg-white rounded transition-colors"
                      >
                        {course.title}
                      </Link>
                    ))}
                  </div>
                ) : mobileCoursesCategory ? (
                  /* Undergraduate/Graduate - Schools as Dropdowns */
                  <div className="space-y-1">
                    {departments[mobileCoursesCategory].map((dept) => (
                      <div key={dept.slug}>
                        <button
                          onClick={() => setOpenMobileDepartment(openMobileDepartment === dept.slug ? null : dept.slug)}
                          className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-200 hover:border-brand-primary hover:bg-red-50 transition-all text-sm font-medium text-gray-700"
                        >
                          <span className="text-left">{dept.name}</span>
                          <FaChevronDown
                            className={`text-xs transition-transform flex-shrink-0 ${
                              openMobileDepartment === dept.slug ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Courses under this department */}
                        {openMobileDepartment === dept.slug && (
                          <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg py-2 px-3 space-y-1.5">
                            {(
                              mobileCoursesCategory === 'undergraduate' || mobileCoursesCategory === 'graduate'
                                ? (coursesData[mobileCoursesCategory] as any)?.[dept.slug] || []
                                : []
                            ).map((course: any) => (
                              <Link
                                key={course.slug}
                                href={`/courses/${course.slug}`}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setMobileCoursesCategory(null);
                                  setOpenMobileDepartment(null);
                                }}
                                className="block px-2 py-1.5 text-xs text-gray-600 hover:text-brand-primary hover:bg-red-50 rounded transition-colors pl-4 border-l-2 border-gray-200"
                              >
                                {course.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Select a category to view programmes</p>
                )}
              </div>

              <Link href="/student-journey" className="text-gray-700 hover:text-brand-primary font-medium py-1" onClick={() => setIsMenuOpen(false)}>Student Journey</Link>
              
              {/* Mobile About Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
                  className={`flex items-center space-x-1 font-medium py-1 transition-colors ${isMobileAboutOpen ? 'text-brand-primary' : 'text-black'}`}
                >
                  <span>About</span>
                  <FaChevronDown
                    className={`text-xs transition-transform ${isMobileAboutOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isMobileAboutOpen && (
                  <div className="space-y-2 pl-4 mt-2">
                    <Link
                      href="/about"
                      className="block text-sm text-gray-600 hover:text-brand-primary py-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileAboutOpen(false);
                      }}
                    >
                      About Progemini
                    </Link>
                    <Link
                      href="/about/global-leadership"
                      className="block text-sm text-gray-600 hover:text-brand-primary py-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileAboutOpen(false);
                      }}
                    >
                      Global Leadership Team
                    </Link>
                    <Link
                      href="/about/academic-team"
                      className="block text-sm text-gray-600 hover:text-brand-primary py-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileAboutOpen(false);
                      }}
                    >
                      Academic Team
                    </Link>
                    <Link
                      href="/about/consultants"
                      className="block text-sm text-gray-600 hover:text-brand-primary py-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileAboutOpen(false);
                      }}
                    >
                      Consultants
                    </Link>
                    <Link
                      href="/about/partner-universities"
                      className="block text-sm text-gray-600 hover:text-brand-primary py-1"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileAboutOpen(false);
                      }}
                    >
                      Global Partner Universities
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/research" className="text-gray-700 hover:text-brand-primary font-medium py-1" onClick={() => setIsMenuOpen(false)}>Research</Link>
              <Link href="/blog" className="text-gray-700 hover:text-brand-primary font-medium py-1" onClick={() => setIsMenuOpen(false)}>Blog</Link>
              <Link href="/contact" className="text-gray-700 hover:text-brand-primary font-medium py-1" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <hr className="border-gray-100 my-2" />
              {session?.user ? (
                <>
                  <div className="flex items-center space-x-3 pb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {session.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-secondary line-clamp-1">{session.user.name}</p>
                      <p className="text-xs text-brand-primary font-medium">{session.user.role}</p>
                    </div>
                  </div>
                  <Link 
                    href={getDashboardLink()} 
                    className="text-gray-700 hover:text-brand-primary font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {session.user.role !== 'STUDENT' && (
                    <Link 
                      href="/student/courses" 
                      className="text-gray-700 hover:text-brand-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Courses
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-red-600 text-left font-medium flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                  <a 
                    href="https://vle.progemini.academy/login" 
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Portal
                  </a>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-brand-primary" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                  <a href="https://vle.progemini.academy/login" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                    Portal
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
