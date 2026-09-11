'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaArrowRight, FaBook, FaChartBar, FaLightbulb, FaUsers, FaEnvelope } from 'react-icons/fa';

export default function ResearchPage() {
  const [animatedMetrics, setAnimatedMetrics] = useState<boolean[]>([false, false, false, false]);
  const [expandedBox, setExpandedBox] = useState<number | null>(null);
  const [networkNodes, setNetworkNodes] = useState<boolean>(false);

  useEffect(() => {
    // Trigger animations on scroll
    const handleScroll = () => {
      const metricsSection = document.getElementById('metrics-section');
      if (metricsSection) {
        const rect = metricsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setAnimatedMetrics([true, true, true, true]);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(() => setNetworkNodes(true), 300);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const facultyMembers = [
    {
      name: 'Dr Syed K I Bakht',
      discipline: 'Leadership, Culture & Management',
      areas: ['Business Strategy', 'Higher Education Leadership', 'Organisational Development', 'Innovation-Driven Management'],
      image: '/profile-image/kenan updated.png',
    },
    {
      name: 'Prof. Peter Hastings',
      discipline: 'Law & Linguistics',
      areas: ['International Law', 'Applied Linguistics', 'Governance', 'Cross-Cultural Communication'],
      image: '/profile-image/peter hastings.png',
    },
    {
      name: 'Dr David Graves',
      discipline: 'Fraud & Risk Management',
      areas: ['Fraud Investigation', 'Financial Crime', 'Corporate Compliance', 'Forensic Risk Management'],
      image: '/profile-image/david (2).png',
    },
    {
      name: 'Dr Addo Anyani-Boadum',
      discipline: 'Management & Finance',
      areas: ['Strategic Finance', 'Corporate Management', 'Investment Analysis', 'Financial Governance'],
      image: '/profile-image/adddo.png',
    },
  ];

  const metrics = [
    { value: '100%', label: 'Evidence-Based Research' },
    { value: '500+', label: 'Peer-Reviewed Publications' },
    { value: '50+', label: 'Global Institutional Partners' },
    { value: '30+', label: 'Years of Scholarly Excellence' },
  ];

  const researchOutputs = [
    {
      title: 'Business & Management Strategy',
      icon: <FaBook className="text-3xl md:text-4xl" />,
      description:
        'Led by Dr Syed K I Bakht, this stream explores strategic leadership, organizational behavior, and business development frameworks that keep institutions agile in volatile markets.',
      examples: ['Strategic Business Plans', 'Organizational Development', 'Management Innovation'],
    },
    {
      title: 'Legal Research & Linguistic Insight',
      icon: <FaChartBar className="text-3xl md:text-4xl" />,
      description:
        'Prof. Peter Hastings combines corporate law scholarship with linguistic analysis to decode governance language, regulatory compliance, and policy discourse.',
      examples: ['Corporate Law Analysis', 'Regulatory Compliance', 'Discourse Analysis'],
    },
    {
      title: 'Fraud Detection & Financial Crime Research',
      icon: <FaLightbulb className="text-3xl md:text-4xl" />,
      description:
        'Dr David Graves directs forensic accounting and fraud investigation research that strengthens internal controls and exposes complex financial crime patterns.',
      examples: ['Fraud Prevention Frameworks', 'Forensic Analysis', 'Financial Crime Detection'],
    },
    {
      title: 'Financial Management & Investment Strategy',
      icon: <FaUsers className="text-3xl md:text-4xl" />,
      description:
        'Dr Addo Anyani-Boadum delivers research on capital management, investment strategy, and financial stewardship that anchors long-term institutional growth.',
      examples: ['Portfolio Strategy', 'Capital Allocation', 'Investment Analysis'],
    },
  ];

  return (
    <div className="w-full overflow-hidden flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Section 1: Header - "Global Scholarly Authority" */}
        <section className="relative min-h-screen flex items-center overflow-hidden py-12 md:py-0">
          {/* Network Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-gray-900 to-black">
            <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
              {/* Generate network nodes and connections */}
              {networkNodes && (
                <>
                  {/* Connection lines */}
                  <line x1="100" y1="200" x2="400" y2="300" stroke="#d7263d" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                  <line x1="400" y1="300" x2="700" y2="150" stroke="#d7263d" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                  <line x1="700" y1="150" x2="900" y2="400" stroke="#d7263d" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                  <line x1="900" y1="400" x2="600" y2="700" stroke="#d7263d" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                  <line x1="600" y1="700" x2="200" y2="600" stroke="#d7263d" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                  <line x1="200" y1="600" x2="100" y2="200" stroke="#d7263d" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                  <line x1="400" y1="300" x2="600" y2="700" stroke="#d7263d" strokeWidth="1" opacity="0.2" />
                  <line x1="700" y1="150" x2="200" y2="600" stroke="#d7263d" strokeWidth="1" opacity="0.2" />

                    {/* Network nodes */}
                    <circle cx="100" cy="200" r="8" fill="#d7263d" opacity="0.8" className="animate-pulse delay-0" />
                    <circle cx="400" cy="300" r="10" fill="#d7263d" opacity="0.8" className="animate-pulse delay-200" />
                    <circle cx="700" cy="150" r="8" fill="#d7263d" opacity="0.8" className="animate-pulse delay-400" />
                    <circle cx="900" cy="400" r="9" fill="#d7263d" opacity="0.8" className="animate-pulse delay-600" />
                    <circle cx="600" cy="700" r="10" fill="#d7263d" opacity="0.8" className="animate-pulse delay-800" />
                    <circle cx="200" cy="600" r="8" fill="#d7263d" opacity="0.8" className="animate-pulse delay-1000" />
                </>
              )}
            </svg>
          </div>

          <div className="relative z-10 container-custom">
            <div className="text-center space-y-4 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
                Research: The Heart of Progemini
              </h1>
              <p className="text-base sm:text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                At Progemini Academy, research is not an adjunct to teaching—it is central to our intellectual identity. We are staffed by highly accomplished academics and professors drawn from leading universities across the United Kingdom, North America, Southeast Asia, and the Middle East. Our faculty bring with them decades of scholarly experience, international recognition, and a strong tradition of rigorous academic inquiry.
              </p>
              <div className="pt-4 md:pt-8">
                <Link
                  href="#faculty-section"
                  className="inline-flex items-center space-x-2 btn-primary text-sm md:text-base group"
                >
                  <span>Explore Our Faculty</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Faculty Carousel - "The Global Brain Trust" */}
        <section id="faculty-section" className="py-12 md:py-32 bg-white">
          <div className="container-custom">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-secondary mb-2 md:mb-4">
                The Global Brain Trust
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-600">
                Our academic team has contributed extensively to peer-reviewed journals, scholarly books, professional publications, and international conferences. Their work spans disciplines including business and management, finance, leadership, public policy, communication, technology, energy, and global development. Many of our professors are recognised authorities in their fields, known for producing research of high analytical depth and practical relevance.
              </p>
            </div>

            {/* Faculty Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
              {facultyMembers.map((faculty, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl w-full max-w-[240px]"
                >
                  {/* Background circle representing avatar */}
                  <div className="relative w-full h-[340px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                    {/* Faculty Image */}
                    <Image
                      src={faculty.image}
                      alt={faculty.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Red Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/50 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-end p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 text-center">{faculty.name}</h3>
                      <h4 className="text-xs md:text-sm font-semibold text-gray-100 mb-3">{faculty.discipline}</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {faculty.areas.map((area, idx) => (
                          <span
                            key={idx}
                            className="bg-white/20 text-white text-xs px-2 py-1 rounded-full border border-white/40"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Faculty Info */}
                  <div className="bg-gray-50 p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-brand-secondary mb-1">{faculty.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600">{faculty.discipline}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Disciplines of Impact */}
            <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-red-50 p-4 md:p-6 rounded-lg border border-brand-primary/30">
                <h4 className="text-sm md:text-base font-bold text-brand-secondary mb-2">Business, Finance & Management</h4>
                <p className="text-xs md:text-sm text-gray-600">Corporate strategy, financial analysis, and organizational leadership</p>
              </div>
              <div className="bg-red-50 p-4 md:p-6 rounded-lg border border-brand-primary/30">
                <h4 className="text-sm md:text-base font-bold text-brand-secondary mb-2">Public Policy & Global Development</h4>
                <p className="text-xs md:text-sm text-gray-600">Policy analysis, governance frameworks, and development economics</p>
              </div>
              <div className="bg-red-50 p-4 md:p-6 rounded-lg border border-brand-primary/30">
                <h4 className="text-sm md:text-base font-bold text-brand-secondary mb-2">Technology, Energy & Communication</h4>
                <p className="text-xs md:text-sm text-gray-600">Digital innovation, renewable energy, and strategic communications</p>
              </div>
              <div className="bg-red-50 p-4 md:p-6 rounded-lg border border-brand-primary/30">
                <h4 className="text-sm md:text-base font-bold text-brand-secondary mb-2">Leadership & Executive Practice</h4>
                <p className="text-xs md:text-sm text-gray-600">Executive development, change management, and talent strategy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Scholarly Standard - "Methodological Rigour" */}
        <section
          id="metrics-section"
          className="py-12 md:py-32 bg-gradient-to-br from-brand-secondary via-gray-900 to-black"
        >
          <div className="container-custom">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-2 md:mb-4">
                A Tradition of Scholarly Excellence
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
                We uphold the enduring values of serious scholarship, ensuring that our faculty's publications are characterised by robust theoretical foundations combined with applied insight.
              </p>
            </div>

            {/* Animated Metric Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="border-2 border-brand-primary rounded-xl p-6 md:p-8 text-center backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <div
                    className={`text-4xl md:text-5xl font-bold text-brand-primary mb-3 transition-all duration-700 ${
                      animatedMetrics[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                  >
                    {metric.value}
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-300">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Four Pillars */}
            <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Intellectual Discipline & Methodological Rigour</h3>
                <p className="text-sm md:text-base text-gray-300">Unwavering commitment to rigorous academic inquiry across all research initiatives and scholarly endeavours.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Evidence-Based Analysis</h3>
                <p className="text-sm md:text-base text-gray-300">Data-driven and empirical research that informs policy, industry practice, and executive decision-making.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Ethical Research Practice</h3>
                <p className="text-sm md:text-base text-gray-300">Research conducted with the highest integrity and professional standards, advancing knowledge responsibly.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Contribution to Theory & Application</h3>
                <p className="text-sm md:text-base text-gray-300">Bridging the gap between academic theory and professional application for lasting impact.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Institutional Contributions - "Knowledge Without Borders" */}
        <section className="py-12 md:py-32 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-secondary mb-2 md:mb-4">
                Institutional Research Contributions
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
                Beyond individual scholarship, Progemini produces commissioned academic and research papers for global universities and institutional partners. Our research outputs reflect a global outlook while maintaining the scholarly standards traditionally associated with leading academic institutions.
              </p>
            </div>

            {/* Bento Box Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {researchOutputs.map((output, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl cursor-pointer group"
                  onMouseEnter={() => setExpandedBox(index)}
                  onMouseLeave={() => setExpandedBox(null)}
                >
                  {/* Card */}
                  <div className="bg-white hover:shadow-xl transition-all duration-300 p-6 md:p-8 h-full border-l-4 border-brand-primary hover:border-brand-primary group-hover:bg-red-50">
                    <div className="text-brand-primary mb-4">{output.icon}</div>
                    <h3 className="text-base md:text-lg font-bold text-brand-secondary mb-2">{output.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-4">{output.description}</p>

                    {/* Examples - Visible on Hover */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        expandedBox === index ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs font-semibold text-brand-primary mb-2">Examples:</p>
                        <ul className="space-y-1">
                          {output.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                              <span className="text-brand-primary mr-2">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Areas */}
            <div className="mt-12 md:mt-16 bg-white rounded-2xl p-6 md:p-12 border-l-4 border-brand-primary">
              <h3 className="text-xl md:text-2xl font-bold text-brand-secondary mb-6">Our Research Supports:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-brand-primary mb-2">University Research Initiatives</h4>
                  <p className="text-sm text-gray-600">Supporting institutional strategy and policy development for leading universities worldwide.</p>
                </div>
                <div>
                  <h4 className="font-bold text-brand-primary mb-2">Industry & Sectoral Analysis</h4>
                  <p className="text-sm text-gray-600">Sector-specific research and industry analysis informing executive decision-making.</p>
                </div>
                <div>
                  <h4 className="font-bold text-brand-primary mb-2">Professional Education Frameworks</h4>
                  <p className="text-sm text-gray-600">Executive and professional education frameworks grounded in contemporary scholarship.</p>
                </div>
                <div>
                  <h4 className="font-bold text-brand-primary mb-2">Curriculum Development</h4>
                  <p className="text-sm text-gray-600">Programme validation and curriculum development ensuring international academic standards.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Research-to-Classroom Bridge */}
        <section className="py-12 md:py-32 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left: Research Manuscript */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 md:p-12 border-2 border-gray-300">
                  <FaBook className="text-5xl md:text-6xl text-brand-secondary mb-4 opacity-80" />
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-secondary mb-3">The Theory</h3>
                  <p className="text-sm md:text-base text-gray-600">Research Manuscript</p>
                  <div className="mt-6 space-y-2 text-xs md:text-sm text-gray-600">
                    <p>• Peer-reviewed findings</p>
                    <p>• Emerging global debates</p>
                    <p>• Latest scholarly contributions</p>
                  </div>
                </div>
              </div>

              {/* Center Arrow */}
              <div className="hidden md:flex justify-center">
                <div className="text-5xl text-brand-primary animate-bounce">
                  <FaArrowRight />
                </div>
              </div>

              {/* Right: Lecture Hall */}
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-primary/10 rounded-2xl p-6 md:p-12 border-2 border-brand-primary">
                  <FaUsers className="text-5xl md:text-6xl text-brand-primary mb-4 opacity-80" />
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-secondary mb-3">The Practice</h3>
                  <p className="text-sm md:text-base text-gray-600">Lecture Hall & Boardroom</p>
                  <div className="mt-6 space-y-2 text-xs md:text-sm text-gray-600">
                    <p>• Applied learning</p>
                    <p>• Real-world case studies</p>
                    <p>• Executive implementation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 md:mt-16 text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-secondary mb-4">
                Research-Informed Education
              </h2>
              <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
                At Progemini Academy, research directly informs our teaching. Academic programmes and executive education courses are underpinned by contemporary scholarship, ensuring that students engage not only with established theory but also with emerging global debates and applied research findings from our faculty's peer-reviewed contributions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Final CTA - "Access the Archive" */}
        <section className="relative py-16 md:py-32 bg-brand-primary overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48" />

          <div className="container-custom relative z-10">
            <div className="text-center space-y-4 md:space-y-8">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
                A Centre for High-Level Scholarship
              </h2>
              <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto">
                By combining internationally recognised faculty expertise with a strong publication record and institutional research partnerships, Progemini Academy continues to strengthen its role as a centre for scholarly excellence and impactful academic contribution worldwide.
              </p>
              <div className="pt-4 md:pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-brand-primary hover:bg-gray-100 font-bold px-8 py-3 md:py-4 rounded-lg transition-colors duration-300 group text-sm md:text-base"
                >
                  <FaEnvelope />
                  <span>Contact Our Research Office</span>
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center space-x-2 bg-transparent text-white border-2 border-white hover:bg-white hover:text-brand-primary font-bold px-8 py-3 md:py-4 rounded-lg transition-all duration-300 text-sm md:text-base"
                >
                  <span>Explore Our Programmes</span>
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
