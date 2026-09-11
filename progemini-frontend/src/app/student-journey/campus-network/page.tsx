'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaBuilding, FaGlobe, FaHandshake, FaUserGraduate, FaLaptopHouse } from 'react-icons/fa';

export default function CampusNetworkPage() {
  const commitments = [
    {
      title: 'Academic Excellence',
      description: 'Standards of teaching and integrity that mirror our central governance.',
      icon: <FaUserGraduate className="text-3xl text-brand-secondary" />
    },
    {
      title: 'Modern Environments',
      description: 'State-of-the-art facilities designed for collaborative learning.',
      icon: <FaLaptopHouse className="text-3xl text-brand-secondary" />
    },
    {
      title: 'Student Services',
      description: 'Comprehensive welfare systems supporting personal and academic growth.',
      icon: <FaHandshake className="text-3xl text-brand-secondary" />
    },
    {
      title: 'Industry Engagement',
      description: 'Local partnerships providing career development opportunities.',
      icon: <FaBuilding className="text-3xl text-brand-secondary" />
    },
    {
      title: 'Vibrant Culture',
      description: 'An international academic community fostering diversity and inclusion.',
      icon: <FaGlobe className="text-3xl text-brand-secondary" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary to-black opacity-90 z-0"></div>
        <div className="container-custom relative z-10 text-center">
          <span className="text-brand-primary font-bold tracking-widest uppercase mb-4 block">Strategic Vision</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Expanding Our Global Footprint</h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            Building physical bridges to knowledge through international campuses and academic hubs.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container-custom">
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-xl group">
               {/* Campus Image with Overlay */}
               <Image
                 src="https://res.cloudinary.com/drgot7znf/image/upload/v1777199654/b9a0554a-e574-41d0-bb33-1d68484614f1_nfzlap.jpg"
                 alt="Future Campus Concept"
                 fill
                 className="object-cover group-hover:scale-105 transition-transform duration-700"
                 priority
                 sizes="(max-width: 768px) 100vw, 50vw"
               />
               <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-30 transition-opacity"></div>
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent text-white">
                  <p className="font-bold text-lg">Future Campus Concept</p>
               </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Beyond Digital Boundaries
              </h2>
              <div className="w-20 h-1 bg-brand-primary mb-8 rounded-full"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                While our digital and partnership model ensures global accessibility, Progemini Academy is also forward-looking in its ambition to develop physical campuses and academic hubs abroad.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our expansion strategy aims to strengthen regional presence while maintaining central academic governance and quality assurance standards.
              </p>
            </div>
          </div>

          {/* Commitments Section */}
          <div className="bg-gray-50 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-16">
              Each campus and partner centre will reflect our core values, ensuring a consistent Progemini experience worldwide.
            </p>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {commitments.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-brand-primary">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
