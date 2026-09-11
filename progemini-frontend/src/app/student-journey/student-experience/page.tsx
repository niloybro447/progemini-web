'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaChalkboardTeacher, FaBookOpen, FaUserTie, FaHandsHelping, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

export default function StudentExperiencePage() {
  const experiences = [
    {
      title: 'Expert Instruction',
      description: 'Receive high-quality teaching from internationally respected academics.',
      icon: <FaChalkboardTeacher className="text-4xl text-brand-primary mb-4" />
    },
    {
      title: 'Research-Informed',
      description: 'Access curricula shaped by the latest institutional research contributions.',
      icon: <FaBookOpen className="text-4xl text-brand-primary mb-4" />
    },
    {
      title: 'Professional Growth',
      description: 'Benefit from dedicated professional mentoring and career guidance.',
      icon: <FaUserTie className="text-4xl text-brand-primary mb-4" />
    },
    {
      title: 'Inclusive Environment',
      description: 'Thrive in a respectful and culturally diverse academic community.',
      icon: <FaHandsHelping className="text-4xl text-brand-primary mb-4" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-secondary text-white py-24 text-center relative overflow-hidden">
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Student Experience</h1>
          <div className="w-24 h-1 bg-brand-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-xl max-w-3xl mx-auto text-gray-200">
            Higher education that combines intellectual challenge with meaningful support.
          </p>
        </div>
        {/* Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container-custom">
          
          <div className="bg-white rounded-2xl shadow-xl p-10 md:p-16 mb-20 relative overflow-hidden">
             {/* Quote Style */}
             <div className="absolute top-8 left-8 text-brand-secondary opacity-10 text-6xl"><FaQuoteLeft /></div>
             <div className="relative z-10 text-center max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed mb-6">
                   "We are committed to ensuring that every student — whether studying online or through one of our global partner institutions — receives an education defined by excellence and care."
                </h2>
                <div className="text-brand-primary font-bold tracking-widest uppercase text-sm">Progemini Academy Promise</div>
             </div>
             <div className="absolute bottom-8 right-8 text-brand-secondary opacity-10 text-6xl"><FaQuoteRight /></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {experiences.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center group border border-gray-100">
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="md:w-1/2">
               <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Objective is Clear</h2>
               <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  The Progemini student journey is built on strong academic traditions while embracing modern global delivery models.
               </p>
               <p className="text-lg text-gray-700 leading-relaxed">
                  We aim to equip students not only with recognised qualifications, but with the <span className="font-bold text-brand-secondary">confidence</span>, <span className="font-bold text-brand-secondary">competence</span>, and <span className="font-bold text-brand-secondary">global perspective</span> required to lead in an increasingly interconnected world.
               </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
               <div className="relative w-full max-w-sm aspect-square bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-8 border-white shadow-2xl">
                  {/* Decorative Elements inside circle */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-secondary to-brand-primary opacity-90"></div>
                  <div className="text-white text-center relative z-10 p-8">
                     <div className="text-5xl font-bold mb-2">100%</div>
                     <div className="uppercase tracking-widest font-semibold">Commitment</div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
