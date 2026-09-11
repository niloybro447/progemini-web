'use client';

import Link from 'next/link';
import { FaAward, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { getFileUrl } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  description?: string;
}

export default function FeaturesSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Only render after client hydration to avoid mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch courses when modal opens
  useEffect(() => {
    if (isCoursesModalOpen && courses.length === 0) {
      fetchCourses();
    }
  }, [isCoursesModalOpen]);

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const data = await apiClient.get<Course[]>('/v1/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Ensure videos play and set playback rate
  useEffect(() => {
    if (!isMounted) return;

    const playVideo = (el: HTMLVideoElement | null) => {
      try {
        if (!el) return;
        el.playbackRate = 0.7;
        el.play().catch(() => {
          // Auto-play might be blocked, that's okay
        });
      } catch (e) {
        // ignore
      }
    };

    // Play immediately
    playVideo(videoRef.current);
    playVideo(mobileVideoRef.current);

    // Also try after a small delay for slower loads
    const t = setTimeout(() => {
      playVideo(videoRef.current);
      playVideo(mobileVideoRef.current);
    }, 500);

    return () => clearTimeout(t);
  }, [isMounted]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCoursesModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <section className="bg-white pt-8 pb-8 lg:pt-12 lg:pb-8 overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          {/* Left Column - Main Content (Takes 7/12 cols) */}
          <div className="lg:col-span-5 z-10">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-brand-secondary leading-tight mb-6 md:text-center lg:text-left">
             Your Pathway to   <br />
              Global Academic & Professional <span className="text-brand-primary">E</span>xce<span className="text-brand-primary">ll</span>ence <br />
            </h1>

            <p className="text-lg md:text-xl lg:text-base xl:text-xl text-gray-700 font-medium mb-10 max-w-lg md:text-center md:mx-auto lg:mx-0 lg:text-left">
            From undergraduate and postgraduate degrees in the UK and Europe to executive corporate learning, Progemini Academy equips you with the expert-led skills to lead.
            </p>

            {/* Video for Mobile (Visible only on mobile, below title) */}
            <div className="md:block lg:hidden mb-8 rounded-2xl md:max-w-[400px] md:mx-auto" suppressHydrationWarning>
              <video
                ref={mobileVideoRef}
                className="w-full h-auto object-cover md:h-[400px]"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                preload="metadata"
                onLoadedMetadata={() => {
                  if (mobileVideoRef.current) {
                    mobileVideoRef.current.playbackRate = 0.7;
                    mobileVideoRef.current.play().catch(() => {});
                  }
                }}
              >
                <source src="https://res.cloudinary.com/drgot7znf/video/upload/v1773314643/hero_landing_video_ifkjkw.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Certification Badge - Only show on desktop */}
            <div className="hidden xl:inline-flex items-center space-x-3 bg-[#F5F1FF] px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-2">
                <Image
                  src="/logo.png"
                  alt="UK Certified"
                  width={30}
                  height={30}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">UK Certified</div>
                <div className="text-xs font-bold text-brand-secondary">Accreditation</div>
              </div>
            </div>
          </div>

          {/* Right Column - Large Video + Feature Cards (Takes 6/12 cols) */}
          <div className="lg:col-span-7" suppressHydrationWarning>
            <div className="flex flex-col gap-4 mt-6 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] lg:gap-6 lg:items-start">
              {/* Center / Right Illustration */}
              <div className="hidden lg:block w-full">
                <div className="rounded-3xl overflow-hidden w-full max-w-[540px]">
                  <video
                    ref={videoRef}
                    className="w-full h-auto object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    preload="metadata"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.playbackRate = 0.7;
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                  >
                    <source src="https://res.cloudinary.com/drgot7znf/video/upload/v1773314643/hero_landing_video_ifkjkw.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              {/* Promo Cards Stack */}
              <div className="flex w-full flex-col gap-4 max-w-xs lg:max-w-[240px] xl:max-w-[280px] lg:justify-self-end">
                <button
                  onClick={() => setIsCoursesModalOpen(true)}
                  className="w-full bg-[#d7263d] rounded-2xl p-5 lg:p-6 text-white shadow-2xl hover:shadow-3xl hover:scale-105 transition-all cursor-pointer group border-none"
                >
                  <h3 className="text-xl lg:text-2xl font-bold mb-0 leading-tight group-hover:underline text-left">Browse Our Courses</h3>
                  <div className="mt-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-16 lg:w-12 lg:h-20">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                </button>
                <div
                  onClick={() => window.location.href = '/signup'}
                  className="w-full bg-black rounded-2xl p-5 lg:p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group"
                >
                  <h3 className="text-lg lg:text-xl font-bold mb-2 leading-tight group-hover:underline">Sign up & <br />Check Eligibility</h3>
                  <div className="flex items-center justify-end">
                    <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 font-bold">✧</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Modal */}
      {isCoursesModalOpen && (
        <>
          {/* Backdrop (No Blur) */}
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setIsCoursesModalOpen(false)}
          />

          {/* Modal */}
          <style>{`
            @keyframes lightSpeedInRight {
              from {
                opacity: 0;
                transform: translateX(1000px) skewX(-20deg);
              }
              to {
                opacity: 1;
                transform: translateX(0) skewX(0);
              }
            }
            .light-speed-in-right {
              animation: lightSpeedInRight 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);
            }
            .modal-arrow {
              position: absolute;
              top: 40px;
              right: -15px;
              width: 0;
              height: 0;
              border-top: 15px solid transparent;
              border-bottom: 15px solid transparent;
              border-left: 15px solid #0f172a; /* Matches header start color */
              z-index: 51;
            }
            @media (max-width: 1024px) {
              .modal-arrow { display: none; }
            }
          `}</style>
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pr-64 pointer-events-none">
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto light-speed-in-right relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Arrow pointing to the button */}
              <div className="modal-arrow" />

              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-brand-secondary to-brand-primary p-6 md:p-8 flex items-center justify-between z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Explore Our Courses</h2>
                <button
                  onClick={() => setIsCoursesModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Close modal"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                {isLoadingCourses ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-2"
                      >
                        {course.thumbnail && (
                          <div className="relative h-48 bg-gray-200 overflow-hidden">
                            <Image
                              src={getFileUrl(course.thumbnail)}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                          <div className="mt-4 flex items-center text-brand-primary font-semibold text-sm">
                            View Course <span className="ml-2">→</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No courses available at the moment.</p>
                    <Link href="/courses" className="text-brand-primary font-bold hover:underline">
                      Browse All Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
