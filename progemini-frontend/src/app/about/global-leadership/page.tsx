import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getFileUrl } from '@/lib/utils';
import { FaLinkedin, FaChevronRight } from 'react-icons/fa';
import { serverFetch } from '@/lib/serverApi';

export const dynamic = 'force-dynamic';

export default async function DynamicGlobalLeadershipPage() {
  const profiles = await serverFetch<any[]>('/v1/senior-profiles');

  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-black to-[#231f20] border-b border-gray-800">
          <div className="container-custom relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">GLOBAL LEADERSHIP TEAM</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The Global Leadership Team provides strategic leadership and operational direction for Progemini, ensuring excellence in academic quality and student experience globally.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-20">
          <div className="container-custom">
            {profiles.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-lg">No profiles currently available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {profiles.map((member) => (
                  <div 
                    key={member.id} 
                    className="bg-[#2a2627] rounded-xl overflow-hidden group hover:bg-[#322e2f] transition-all duration-300 border border-gray-800 hover:border-brand-primary flex flex-col h-full"
                  >
                    {/* Image Container */}
                    <div className="relative h-96 md:h-72 w-full bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Link href={`/about/profile/${member.slug}`} className="absolute inset-0 block">
                        <Image 
                          src={getFileUrl(member.imageUrlMobile || member.imageUrlDesktop)} 
                          alt={member.name} 
                          fill 
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          style={{ objectPosition: member.objectPos || 'center' }}
                          className="object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </Link>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6 flex-grow min-h-[40px]">
                        {member.position}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-auto">
                        <Link 
                          href={member.linkedin || '#'}
                          className="p-2 bg-gray-800 rounded-full hover:bg-[#0077b5] hover:text-white transition-all duration-300 text-[#0077b5]"
                          target="_blank"
                        >
                          <FaLinkedin size={20} />
                        </Link>
                        <Link
                          href={`/about/profile/${member.slug}`}
                          className="flex items-center space-x-2 text-sm font-semibold text-brand-primary hover:text-white transition-colors group/btn"
                        >
                          <span>View Profile</span>
                          <FaChevronRight className="text-[10px] transform group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Global Footprint */}
        <section
          id="map-section"
          className="relative min-h-auto md:min-h-screen flex items-center bg-gradient-to-br from-[#161314] via-gray-900 to-black py-12 md:py-32 border-t border-gray-800"
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
              {/* Liverpool Image */}
              <div className="relative h-[250px] sm:h-[350px] md:h-[500px] bg-gray-900 rounded-2xl overflow-hidden border border-brand-primary/30 group">
                <Image
                  src="https://res.cloudinary.com/drgot7znf/image/upload/v1776274915/liverpool_image_u7y8mr.jpg"
                  alt="Liverpool Headquarters"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Right Content */}
              <div className="text-white space-y-4 md:space-y-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 md:mb-6 leading-tight">
                    Headquartered in Liverpool, United Kingdom, Operating Globally
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
      </main>

      <Footer />
    </div>
  );
}
