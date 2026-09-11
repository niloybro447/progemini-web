'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaFlagCheckered, FaUserTie, FaLaptopCode, FaHandHoldingHeart, FaChartLine, FaGraduationCap } from 'react-icons/fa';

export default function PathwayPage() {
  const steps = [
    {
      id: 1,
      title: 'Advisory & Admissions Guidance',
      description: 'Personalised consultation to ensure programme suitability and academic preparedness right from the start.',
      icon: <FaUserTie className="w-8 h-8 text-white" />,
      color: 'bg-brand-secondary'
    },
    {
      id: 2,
      title: 'Orientation & Academic Induction',
      description: 'Structured onboarding introducing students to academic expectations, research standards, and our digital learning platforms.',
      icon: <FaLaptopCode className="w-8 h-8 text-white" />,
      color: 'bg-brand-primary'
    },
    {
      id: 3,
      title: 'Engaged Learning Experience',
      description: 'Interactive lectures, seminars, case-based learning, research projects, and applied executive tasks delivered by experienced faculty.',
      icon: <FaHandHoldingHeart className="w-8 h-8 text-white" />,
      color: 'bg-brand-secondary'
    },
    {
      id: 4,
      title: 'Ongoing Academic Support',
      description: 'Continuous access to tutors, supervisors, academic skills guidance, and pastoral support throughout your journey.',
      icon: <FaChartLine className="w-8 h-8 text-white" />,
      color: 'bg-brand-primary'
    },
    {
      id: 5,
      title: 'Assessment & Progression Monitoring',
      description: 'Transparent evaluation aligned with international quality benchmarks to ensure you stay on track.',
      icon: <FaFlagCheckered className="w-8 h-8 text-white" />,
      color: 'bg-brand-secondary'
    },
    {
      id: 6,
      title: 'Graduation & Alumni Integration',
      description: 'Transition into our global professional and academic network as a Progemini graduate.',
      icon: <FaGraduationCap className="w-8 h-8 text-white" />,
      color: 'bg-brand-primary'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-brand-secondary text-white py-16 md:py-24 text-center">
         <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Structured Pathway to Success</h1>
            <p className="text-lg max-w-3xl mx-auto text-gray-300">
               From your first enquiry to your graduation day, every step is designed to support your growth.
            </p>
         </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="flex flex-col relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:-translate-x-1/2 z-0"></div>

            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex flex-col md:flex-row items-center mb-16 relative z-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content Side */}
                <div className="md:w-1/2 w-full pl-24 md:pl-0 md:pr-12 md:text-right group">
                    <div className={`${index % 2 === 0 ? 'md:text-left md:pl-12 md:pr-0' : ''}`}>
                       <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                          {step.title}
                       </h3>
                       <p className="text-gray-600 leading-relaxed">
                          {step.description}
                       </p>
                    </div>
                </div>

                {/* Icon/Circle */}
                <div className={`absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${step.color}`}>
                  {step.icon}
                </div>

                {/* Empty Side for spacing on Desktop */}
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
            
            {/* Final Success Marker */}
             <div className="text-center relative z-10 pt-8">
               <div className="inline-block bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
                  Start Your Journey Today
               </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
