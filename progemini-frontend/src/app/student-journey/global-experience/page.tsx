'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaGlobeEurope, FaUniversity, FaChalkboardTeacher, FaHandsHelping } from 'react-icons/fa';

export default function GlobalExperiencePage() {
  const experiences = [
    {
      title: 'Accredited Qualifications',
      description: 'Awards delivered in partnership with recognized universities ensuring global validity.',
      icon: <FaUniversity className="text-4xl text-brand-secondary" />
    },
    {
      title: 'Local Support',
      description: 'Dedicated academic and administrative assistance available in your region.',
      icon: <FaHandsHelping className="text-4xl text-brand-secondary" />
    },
    {
      title: 'International Faculty',
      description: 'Learn from experts bringing diverse perspectives and global industry insights.',
      icon: <FaChalkboardTeacher className="text-4xl text-brand-secondary" />
    },
    {
      title: 'Cross-Cultural Exposure',
      description: 'Collaborate with peers from different continents, fostering global citizenship.',
      icon: <FaGlobeEurope className="text-4xl text-brand-secondary" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/world-map-dots.png')] opacity-10 bg-center bg-no-repeat bg-contain"></div>
        <div className="container-custom text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">A Truly Global Learning Experience</h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            Education without borders. Qualification without compromise.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Connected Across Continents
              </h2>
              <div className="w-20 h-1 bg-brand-primary mb-8 rounded-full"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our students enrol on a wide range of online programmes and collaborative awards delivered in partnership with universities and institutional partners across Europe, Southeast Asia, the Middle East, and South America.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                This international structure allows learners to access high-quality education regardless of geographical location, while benefiting from a global academic network that transcends traditional boundaries.
              </p>
            </div>
            
            {/* Visual Representation of Network */}
            <div className="bg-gray-100 hover:scale-110 p-8 rounded-2xl relative h-full min-h-[300px] flex items-center justify-center overflow-hidden transition-transform duration-300">
              <Image
                src="https://res.cloudinary.com/drgot7znf/image/upload/v1777198021/40238f5d-2232-40b3-942d-a9f71cc0afac_mlflfm.jpg"
                alt="Global Learning Network"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What Our Students Experience</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Through our satellite institutional partnerships, we deliver more than just content.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {experiences.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow border-b-4 border-transparent hover:border-brand-primary text-center group">
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-brand-secondary mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Flexible Model Section */}
          <div className="bg-brand-secondary text-white rounded-3xl p-12 md:p-20 relative overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Academic Depth with Flexibility</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Our online delivery model combines academic depth with flexibility, enabling working professionals and international learners to balance study with career and personal commitments — without compromising academic standards.
              </p>
              <button className="bg-brand-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
                Explore Programmes
              </button>
            </div>
            {/* Background Accent */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
