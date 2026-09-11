'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

interface Slide {
  id: string;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

// Fallback static slides (shown while API loads or on error)
const FALLBACK_SLIDES: Slide[] = [
  { id: '1', eyebrow: 'Learn from the Best', title: 'Empowering Leaders, Inspiring Futures', description: 'Experience an academy built to sharpen leadership, strengthen confidence, and prepare you for meaningful impact.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776613985/WhatsApp_Image_2026-04-18_at_23.30.47_oxq4vc.jpg', order: 1, isActive: true },
  { id: '2', eyebrow: 'Security and Strategy', title: 'Be part of the Global Defence Network', description: 'Join a forward-looking learning environment shaped for defence, investigation, and global security thinking.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776494555/fraud_and_investigation_ag8w7w.jpg', order: 2, isActive: true },
  { id: '3', eyebrow: 'Global Perspective', title: 'Where Great Minds Meet a Legendary City', description: 'Connect with an international academic community in a city known for culture, ambition, and opportunity.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776613985/WhatsApp_Image_2026-04-18_at_23.33.00_psnp1d.jpg', order: 3, isActive: true },
  { id: '4', eyebrow: 'Lead With Purpose', title: 'Bridge the Gap Between Learning and Leading', description: 'Build the practical confidence to transform classroom knowledge into decisive professional leadership.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776614532/529efc58-6d43-4a6a-86c9-910f2a9defb5_dddrmn.jpg', order: 4, isActive: true },
  { id: '5', eyebrow: 'Future Skills', title: 'Rethink Skills Acquisition, the Progemini Way', description: 'Discover a more focused path to capability-building through modern learning designed around real outcomes.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776613985/nav_1_hgnbzu.jpg', order: 5, isActive: true },
  { id: '6', eyebrow: 'Next Generation Leaders', title: 'Empowering Generations to Lead', description: 'Nurture the mindset, discipline, and vision that help emerging leaders grow with purpose and clarity.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776613988/Empowering_Geerations_to_Lead_djudja.png', order: 6, isActive: true },
  { id: '7', eyebrow: 'Ideas Into Impact', title: 'Empowering Minds & Shaping Futures', description: 'Turn ambition into direction with education that develops thinkers, makers, and decision-makers.', imageUrl: 'https://res.cloudinary.com/drgot7znf/image/upload/v1776613988/Empowering_Minds_Shaping_Futures_w4ygnd.png', order: 7, isActive: true },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  // Fetch active slides from API
  useEffect(() => {
    apiClient.get<Slide[]>('/v1/hero-slides')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSlides(data.filter((s: Slide) => s.isActive).sort((a: Slide, b: Slide) => a.order - b.order));
        }
      })
      .catch(() => {}); // keep fallback on error
  }, []);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Touch / swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? nextSlide() : prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative w-full h-[50vh] md:h-[50vh] lg:h-screen bg-black overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <Image
              src={slide.imageUrl}
              alt={slide.title || `Slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />

            {/* Mobile / Tablet: solid dark overlay for text legibility */}
            <div className="absolute inset-0 bg-black/50 lg:hidden" />

            {/* Desktop: gradient overlay left-to-right */}
            <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-black/70 via-black/35 to-white/10" />

            {/* Text content */}
            {slide.title && (
              <div className="absolute inset-0 flex items-center justify-center lg:justify-start">
                <div className="w-full max-w-7xl px-4 sm:px-8 lg:pl-20 lg:pr-10 xl:pl-28 xl:pr-16">
                  <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                    {slide.eyebrow && (
                      <p
                        className={`mb-2 sm:mb-3 text-brand-primary font-semibold tracking-wide uppercase text-[10px] sm:text-xs md:text-sm transition-all duration-700 ${
                          index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                      >
                        {slide.eyebrow}
                      </p>
                    )}

                    <h2
                      className={`font-bold text-white leading-tight transition-all duration-700 text-[18px] md:text-[26px] lg:text-7xl ${
                        index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      {slide.title}
                    </h2>

                    {slide.description && (
                      <p
                        className={`mt-2 sm:mt-4 text-white/90 leading-relaxed transition-all duration-700 text-xs sm:text-sm md:text-base lg:text-xl ${
                          index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                      >
                        {slide.description}
                      </p>
                    )}

                    <div
                      className={`mt-4 sm:mt-6 flex flex-row gap-2 sm:gap-3 justify-center lg:justify-start transition-all duration-700 ${
                        index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <Link
                        href="/courses"
                        className="inline-flex flex-1 sm:flex-none items-center justify-center rounded-md bg-brand-primary px-3 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] whitespace-nowrap"
                      >
                        Explore Courses
                      </Link>
                      <Link
                        href="/student-journey"
                        className="inline-flex flex-1 sm:flex-none items-center justify-center rounded-md border border-white/80 bg-white/10 px-3 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black whitespace-nowrap"
                      >
                        Student Journey
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Left / Right navigation — desktop only */}
      <button
        onClick={prevSlide}
        className="absolute left-5 lg:left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center bg-white/85 hover:bg-white text-black rounded-full transition-all"
        aria-label="Previous slide"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center bg-white/85 hover:bg-white text-black rounded-full transition-all"
        aria-label="Next slide"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators — always visible */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'bg-white w-5 h-1.5 sm:w-6 sm:h-2'
                : 'bg-white/55 hover:bg-white/80 w-1.5 h-1.5 sm:w-2 sm:h-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
