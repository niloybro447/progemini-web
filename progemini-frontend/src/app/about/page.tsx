'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  FaGlobe,
  FaAward,
  FaRocket,
  FaArrowRight,
  FaTimes,
  FaLightbulb,
  FaUniversity,
  FaUserTie,
  FaGraduationCap,
  FaHandshake,
  FaBookOpen,
} from 'react-icons/fa';

export default function AboutPage() {
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);
  const [mapMarkers, setMapMarkers] = useState<boolean[]>([false, false, false]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Animate timeline items based on scroll
      const timelineSection = document.getElementById('timeline-section');
      if (timelineSection) {
        const rect = timelineSection.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setActiveTimeline(4);
        }
      }

      // Animate map markers
      const mapSection = document.getElementById('map-section');
      if (mapSection) {
        const rect = mapSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setMapMarkers([true, true, true]);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Trigger initial animations
    setTimeout(() => setMapMarkers([true, true, true]), 500);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const timelineItems = [
    {
      year: '1993',
      title: 'The Foundation',
      description: 'Founded in London and Dubai by Dr. Syed Kenan Ibrahim Bakht. Progemini emerged as a premier consulting group, providing outcome-based knowledge to the world\'s most influential blue-chip organizations.',
      image: 'https://res.cloudinary.com/drgot7znf/image/upload/v1774985267/dubai_office_image_hrecbr.jpg',
    },
    {
      year: 'The Golden Era',
      title: 'Decades of Excellence',
      description: 'Served as strategic advisors to giants including Emirates Airlines, Dubai International Airport, Cisco, Beverly Hills Polo Club, Cairn Energy, and DUBAL.',
      image: 'https://res.cloudinary.com/drgot7znf/image/upload/v1774985267/golden_era_omryng.jpg',
    },
    {
      year: 'Recent Years',
      title: 'The Academic Shift',
      description: 'Recognizing the need for industry-aligned leadership, we transitioned our focus toward Higher Education Consultancy and Executive Training, establishing a footprint across the UAE, Europe, and the Indian Subcontinent.',
      image: 'https://res.cloudinary.com/drgot7znf/image/upload/v1774985267/The_Academic_Shift_t3qp2b.jpg',
    },
  ];

  const pillars = [
    {
      icon: <FaAward className="text-3xl md:text-4xl" />,
      title: 'Academic Integrity',
      description: 'We uphold the highest standards of British scholarship, governance, and quality assurance. Our programmes aren\'t just qualifications; they are hallmarks of intellectual discipline.',
    },
    {
      icon: <FaRocket className="text-3xl md:text-4xl" />,
      title: 'Professional Relevance',
      description: 'Informed by our consultancy roots, our curriculum is built for the real world. We ensure every student gains practical, executive expertise that meets contemporary global industry demands.',
    },
    {
      icon: <FaGlobe className="text-3xl md:text-4xl" />,
      title: 'Global Perspective',
      description: 'Education without borders. Leveraging our international network, we prepare leaders to navigate a rapidly evolving world with a truly international mindset.',
    },
  ];

  const hubs = [
    { name: 'London', x: 50, y: 30 },
    { name: 'Dubai', x: 55, y: 50 },
    { name: 'India', x: 65, y: 45 },
  ];

  return (
    <div className="w-full overflow-hidden flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Section 1: Hero - "The Genesis of Excellence" */}
        <section className="relative min-h-screen flex items-center overflow-hidden py-12 md:py-0">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-gray-900 to-black" />

          <div className="relative z-10 container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center min-h-auto md:min-h-[600px]">
              {/* Left Side - Content */}
              <div className="text-white space-y-3 md:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif leading-tight font-bold">
                  Progemini Academy: The Evolution of Global Expertise.
                </h1>
                <p className="text-base sm:text-lg md:text-2xl text-gray-300 font-light leading-relaxed">
                  From a 1993 London consultancy to a 21st-century global academic powerhouse. We bridge the gap between high-level strategic counsel and world-class higher education.
                </p>
                <div className="pt-4 md:pt-8">
                  <Link
                    href="/courses"
                    className="inline-flex items-center space-x-2 btn-primary text-sm md:text-base group"
                  >
                    <span>Explore Our Programmes</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Side - Hero Image with Logo */}
              <div className="relative h-[300px] sm:h-[400px] md:h-[600px] rounded-2xl overflow-hidden group">
                {/* Bright Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-50 z-0" />

                {/* Logo Container with bright background */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Image
                      src="/fab-icon.gif"
                      alt="ProGemini Logo"
                      width={250}
                      height={150}
                      priority
                      className="w-32 sm:w-40 md:w-[280px] h-auto object-contain drop-shadow-xl"
                    />
                    <p className="text-xs sm:text-sm md:text-lg text-brand-secondary font-semibold mt-4 md:mt-6">
                      Global Excellence in Education
                    </p>
                  </div>
                </div>

                {/* SVG London Skyline with Red Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 via-brand-primary/20 to-transparent z-20" />
                <svg
                  viewBox="0 0 400 600"
                  className="w-full h-full object-cover"
                  opacity="0.3"
                >
                  {/* Simplified London Skyline */}
                  <rect width="400" height="600" fill="#1a1a2e" />
                  {/* Big Ben & Houses of Parliament */}
                  <rect x="50" y="250" width="30" height="250" fill="#0f3460" />
                  <rect x="55" y="200" width="20" height="50" fill="#e94560" />
                  {/* Tower Bridge towers */}
                  <rect x="150" y="280" width="20" height="220" fill="#0f3460" />
                  <rect x="230" y="280" width="20" height="220" fill="#0f3460" />
                  <line x1="170" y1="300" x2="230" y2="300" stroke="#d7263d" strokeWidth="3" />
                  <line x1="170" y1="330" x2="230" y2="330" stroke="#d7263d" strokeWidth="2" />
                  <line x1="170" y1="360" x2="230" y2="360" stroke="#d7263d" strokeWidth="2" />
                  {/* St. Paul's Cathedral Dome */}
                  <circle cx="300" cy="320" r="40" fill="#0f3460" />
                  <path d="M 300 280 L 310 320 L 290 320 Z" fill="#d7263d" />
                </svg>
                <div className="absolute inset-0 group-hover:bg-brand-primary/10 transition-colors duration-500 z-30" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Legacy Timeline - "Thirty Years in the Making" */}
        <section
          id="timeline-section"
          className="relative py-12 md:py-32 bg-white"
        >
          <div className="container-custom">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-secondary mb-2 md:mb-4">
                Thirty Years in the Making
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-600">
                Our journey from consultancy to global academy
              </p>
            </div>

            {/* Timeline */}
            <div className="relative max-w-4xl mx-auto">
              {/* Center Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-brand-primary to-transparent" />

              {/* Timeline Items */}
              <div className="space-y-8 md:space-y-12">
                {timelineItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${
                      index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}
                    style={{
                      animation:
                        activeTimeline > index
                          ? `slideIn 0.6s ease-out ${index * 0.2}s forwards`
                          : 'none',
                      opacity: activeTimeline > index ? 1 : 0.3,
                    }}
                    // eslint-disable-next-line react/no-inline-styles
                  >
                    {/* Content */}
                    <div
                      className={`w-5/12 ${
                        index % 2 === 0 ? 'text-right pr-4 md:pr-8' : 'text-left pl-4 md:pl-8'
                      }`}
                    >
                      <div className="bg-gray-50 p-3 md:p-6 rounded-lg hover:shadow-xl transition-shadow">
                        <span className="inline-block text-lg md:text-2xl font-bold text-brand-primary mb-1 md:mb-2">
                          {item.year}
                        </span>
                        <h3 className="text-lg md:text-2xl font-bold text-brand-secondary mb-2 md:mb-3">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Center Dot */}
                    <div className="w-2/12 flex justify-center">
                      <div
                        className="w-5 h-5 rounded-full border-4 border-brand-primary bg-white transform hover:scale-150 transition-transform cursor-pointer"
                        onMouseEnter={() => setActiveTimeline(Math.max(activeTimeline, index + 1))}
                      />
                    </div>

                    {/* Image or Empty Space */}
                    <div className="w-5/12 flex justify-center items-center px-2 md:px-4">
                      {item.image && (
                        <button
                          onClick={() => setSelectedImage(item.image)}
                          className="relative rounded-lg overflow-hidden border-2 border-orange-500 hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                          <div className="relative w-32 sm:w-40 md:w-48 h-auto">
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={300}
                              height={300}
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(30px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </section>

        {/* Section 3: The Visionary Pivot - "The Academy Today" */}
        <section className="relative min-h-auto md:min-h-screen flex items-center bg-gradient-to-br from-brand-secondary via-gray-900 to-black py-12 md:py-32">
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-20 right-10 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
            <div className="absolute top-40 left-10 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
          </div>

          <div className="container-custom relative z-10">
            <div className="mx-auto max-w-6xl rounded-[32px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,249,246,0.95)_0%,rgba(255,244,239,0.92)_100%)] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-10">
              <div className="text-center">
                <span className="text-sm font-bold tracking-[0.28em] text-brand-primary md:text-base">
                  THE EVOLUTION
                </span>
                <div className="mx-auto mt-4 h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
                <h2 className="mt-5 text-3xl font-serif font-bold text-brand-secondary md:text-5xl">
                  The Academy Today
                </h2>
                <p className="mt-3 text-lg text-gray-700 md:text-2xl">
                  Building on a Proud Legacy
                </p>
              </div>

              <div className="mt-8 rounded-[28px] border border-brand-primary/10 bg-white/60 p-5 shadow-lg md:mt-10 md:p-8">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary shadow-sm md:h-16 md:w-16">
                      <FaLightbulb className="text-2xl md:text-3xl" />
                    </div>
                    <div className="mt-3 hidden h-20 w-px bg-gradient-to-b from-brand-primary/50 to-transparent md:block" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-bold text-brand-primary md:text-4xl">
                      Natural Evolution
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-xl">
                      Progemini Academy is the natural evolution of our thirty-year history. We have moved from advising the boardroom to shaping the classroom, translating strategic expertise into academic leadership for a new generation of global professionals.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                  <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm ring-1 ring-brand-primary/10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                      <FaUserTie className="text-3xl" />
                    </div>
                    <h4 className="mt-4 text-xl font-serif font-bold text-brand-secondary">
                      Corporate Advisory
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 md:text-base">Boardroom</p>
                  </div>

                  <div className="flex items-center justify-center text-brand-primary md:px-2">
                    <FaArrowRight className="text-2xl md:text-3xl" />
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm ring-1 ring-brand-primary/10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                      <FaHandshake className="text-3xl" />
                    </div>
                    <h4 className="mt-4 text-xl font-serif font-bold text-brand-secondary">
                      Strategic Consultancy
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 md:text-base">Industry Expertise</p>
                  </div>

                  <div className="flex items-center justify-center text-brand-primary md:px-2">
                    <FaArrowRight className="text-2xl md:text-3xl" />
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm ring-1 ring-brand-primary/10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                      <FaGraduationCap className="text-3xl" />
                    </div>
                    <h4 className="mt-4 text-xl font-serif font-bold text-brand-secondary">
                      Academic Leadership
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 md:text-base">Progemini Academy</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center md:mt-12">
                <div className="flex items-center justify-center gap-4 md:gap-8">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-primary/50 md:w-40" />
                  <h3 className="text-2xl font-serif font-bold uppercase tracking-[0.14em] text-brand-secondary md:text-4xl">
                    Our Partnership Model
                  </h3>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-primary/50 md:w-40" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-6">
                <div className="rounded-[24px] border border-brand-primary/10 bg-white/65 p-5 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary">
                      <FaUniversity className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-brand-secondary">
                        Accredited Universities in the UK
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-lg">
                        Partnerships with recognised UK universities delivering validated programmes built on credible academic governance and internationally respected standards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-brand-primary/10 bg-white/65 p-5 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary">
                      <FaGlobe className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-brand-secondary">
                        Global Partnerships Across Continents
                      </h4>
                      <ul className="mt-3 space-y-1 text-sm text-gray-700 md:text-lg">
                        <li>• United Kingdom</li>
                        <li>• Europe</li>
                        <li>• UAE &amp; Middle East</li>
                        <li>• Indian Subcontinent</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-brand-primary/10 bg-white/65 p-5 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary">
                      <FaBookOpen className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-brand-secondary">
                        Industry-Aligned Qualifications
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-lg">
                        Programmes designed with real business relevance across leadership, strategy, innovation, governance, and professional development.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-brand-primary/10 bg-white/65 p-5 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary">
                      <FaGraduationCap className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-brand-secondary">
                        From Undergraduate to Doctoral Programmes
                      </h4>
                      <div className="mt-3 space-y-2 text-sm text-gray-700 md:text-lg">
                        <p>Undergraduate</p>
                        <p>Postgraduate / Masters</p>
                        <p>Doctoral (PhD / DBA)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center md:mt-12">
                <div className="text-center">
                  <Image
                    src="/fab-icon.gif"
                    alt="Progemini Academy"
                    width={110}
                    height={110}
                    className="mx-auto h-20 w-20 object-contain md:h-28 md:w-28"
                  />
                  <p className="mt-4 text-2xl font-serif font-bold tracking-[0.08em] text-brand-secondary md:text-4xl">
                    PROGEMINI
                  </p>
                  <p className="mt-1 text-sm font-semibold tracking-[0.32em] text-brand-primary md:text-base">
                    ACADEMY
                  </p>
                  <p className="mt-3 text-xs font-semibold tracking-[0.22em] text-gray-600 md:text-sm">
                    EDUCATE · EMPOWER · EXCEL
                  </p>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes blob {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
          `}</style>
        </section>

        {/* Section 4: The Core Pillars - "The Progemini Standard" */}
        <section className="py-12 md:py-32 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-secondary mb-2 md:mb-4">
                The Progemini Standard
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-600">
                Three pillars that define our commitment to excellence
              </p>
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredPillar(index)}
                  onMouseLeave={() => setHoveredPillar(null)}
                >
                  {/* Glow Effect */}
                  <div
                    className="absolute -inset-0.5 bg-brand-primary rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"
                    // eslint-disable-next-line
                    style={{
                      opacity: hoveredPillar === index ? 1 : 0,
                    }}
                  />

                  {/* Card */}
                  <div className="relative bg-white rounded-2xl p-4 md:p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 group-hover:border border-transparent group-hover:border-brand-primary">
                    {/* Icon */}
                    <div className="mb-3 md:mb-6 flex justify-center">
                      <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-red-50 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                        {pillar.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg md:text-2xl font-bold text-center text-brand-secondary mb-2 md:mb-4">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Read More Link */}
                    <div className="mt-4 md:mt-6 flex justify-center">
                      <button className="text-xs sm:text-sm md:text-base text-brand-primary font-semibold flex items-center space-x-2 group/link hover:space-x-3 transition-all">
                        <span>Learn More</span>
                        <FaArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Global Footprint (Image Based) */}
        <section
          id="map-section"
          className="relative min-h-auto md:min-h-screen flex items-center bg-gradient-to-br from-brand-secondary via-gray-900 to-black py-12 md:py-32 border-t border-gray-800"
        >
          <div className="container-custom w-full">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-2 md:mb-4">
                Our Global Footprint
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-300">
                A Truly International Institution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Image */}
              <div className="relative h-[250px] sm:h-[350px] md:h-[500px] bg-gray-900 rounded-2xl overflow-hidden border border-brand-primary/30 group">
                <Image
                  src="https://res.cloudinary.com/drgot7znf/image/upload/v1776274915/liverpool_image_u7y8mr.jpg"
                  alt="Global Headquarters"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Right Content */}
              <div className="text-white space-y-4 md:space-y-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 md:mb-6 leading-tight">
                    Headquartered in Liverpool, Operating Globally
                  </h3>
                </div>

                <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
                  Progemini Academy operates at the intersection of tradition and innovation. We empower governments, multinational organizations, and individuals across continents to advance professional excellence and strengthen leadership capacity through education.
                </p>

                <div className="space-y-3 md:space-y-4 pt-4 md:pt-8">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-3 h-3 rounded-full bg-brand-primary mt-1 md:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-base md:text-xl font-bold mb-1">Liverpool Hub</h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-400">
                        Our headquarters serving as the global center of academic excellence
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-3 h-3 rounded-full bg-brand-primary mt-1 md:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-base md:text-xl font-bold mb-1">Jeddah Hub</h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-400">
                        Strategic hub serving the Middle East and South Asia regions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-3 h-3 rounded-full bg-brand-primary mt-1 md:mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-base md:text-xl font-bold mb-1">Dhaka Hub</h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-400">
                        Gateway to South Asian markets and emerging leadership opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Call to Action - "Shape Your Future" */}
        <section className="relative py-16 md:py-40 bg-gradient-to-br from-brand-secondary to-black overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-brand-primary opacity-5 rounded-full -mr-24 sm:-mr-36 md:-mr-48 -mt-24 sm:-mt-36 md:-mt-48" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-brand-primary opacity-5 rounded-full -ml-24 sm:-ml-36 md:-ml-48 -mb-24 sm:-mb-36 md:-mb-48" />

          <div className="container-custom relative z-10 text-center space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-6">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
                Shape Your Future
              </h2>
              <p className="text-lg sm:text-2xl md:text-3xl text-gray-300 font-light">
                Rooted in Tradition. Driving Innovation.
              </p>
            </div>

            <p className="text-sm sm:text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Join an institution that understands the demands of the modern world because we helped build its leaders.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 pt-4 md:pt-8">
              <Link
                href="/courses"
                className="btn-primary text-xs sm:text-base md:text-lg px-6 md:px-10 py-3 md:py-4 inline-flex items-center space-x-3 group hover:shadow-2xl hover:shadow-brand-primary/50 w-full md:w-auto justify-center"
              >
                <span>Explore Our Programmes</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary text-xs sm:text-base md:text-lg px-6 md:px-10 py-3 md:py-4 w-full md:w-auto justify-center"
              >
                Get in Touch
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-8 max-w-2xl mx-auto pt-8 md:pt-16">
              <div className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-brand-primary">
                  30+
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-400">Years of Excellence</p>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-brand-primary">
                  3
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-400">Global Hubs</p>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-brand-primary">
                  100+
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-400">Programmes</p>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-auto bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-brand-primary text-white rounded-full hover:bg-brand-secondary transition-colors"
              aria-label="Close modal"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
              <Image
                src={selectedImage}
                alt="Timeline image"
                width={800}
                height={600}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
