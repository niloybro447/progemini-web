'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaGlobeAmericas, FaRoute, FaUniversity, FaUserGraduate, FaArrowRight } from 'react-icons/fa';

export default function StudentJourneyPage() {
  const journeys = [
    {
      title: 'Global Learning Experience',
      description: 'Access high-quality education regardless of location through our international partnerships and online delivery models.',
      icon: <FaGlobeAmericas className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/global-experience',
    },
    {
      title: 'Structured Pathway',
      description: 'A clear, guided progression from advisory and admissions through to graduation and alumni integration.',
      icon: <FaRoute className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/pathway',
    },
    {
      title: 'Campus Network',
      description: 'Our expanding physical presence and academic hubs designed to strengthen regional access to excellence.',
      icon: <FaUniversity className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/campus-network',
    },
    {
      title: 'Student Experience',
      description: 'A commitment to intellectual challenge, professional mentoring, and a culturally diverse academic environment.',
      icon: <FaUserGraduate className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/student-experience',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-secondary text-white py-20 relative overflow-hidden">
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Student Journey with Progemini</h1>
          <div className="w-24 h-1 bg-brand-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-xl max-w-3xl mx-auto text-gray-200 leading-relaxed">
            At Progemini Academy, the student journey is designed to be rigorous, supportive, 
            and globally connected from first enquiry to graduation and beyond.
          </p>
        </div>
        {/* Abstract shapes/bg */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute left-0 bottom-0 w-72 h-72 bg-brand-primary rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                United by Ambition, <span className="text-brand-primary">Connected Globally</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We welcome a diverse body of learners from across the world, united by a shared 
                ambition for academic excellence and professional advancement. Our model is built 
                understanding that modern education must be accessible without compromising on quality or rigor.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you are joining us for a professional certificate or a comprehensive degree pathway, 
                you become part of a global academic community that values integrity, innovation, and impact.
              </p>
            </div>
            <div className="md:w-1/2 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
              <Image
                src="https://res.cloudinary.com/drgot7znf/image/upload/v1777197809/527811c2-8d91-465d-a9e1-baad37b1dd0c_hjm0x9.jpg"
                alt="Progemini Academy"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {journeys.map((item, idx) => (
              <Link 
                href={item.link} 
                key={idx}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-brand-primary group flex flex-col"
              >
                <div>{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  {item.description}
                </p>
                <div className="flex items-center text-brand-primary font-semibold mt-auto">
                  Explore <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
