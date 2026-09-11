'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaLinkedin, FaEnvelope, FaChevronRight, FaTimes, FaUser } from 'react-icons/fa';
import { CourseRichRenderer } from '@/components/admin/CourseRichEditor';
import { getFileUrl } from '@/lib/utils';

interface Consultant {
  id: string;
  name: string;
  designation: string;
  extensions: string | null;
  email: string | null;
  linkedIn: string | null;
  imageUrl: string | null;
  profile: string | null;
}

function parseProfile(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.json !== undefined || parsed.html !== undefined)) {
      return { json: parsed.json ?? null, html: typeof parsed.html === 'string' ? parsed.html : '' };
    }
    return null;
  } catch {
    return null;
  }
}

interface ProfileModalProps {
  consultant: Consultant;
  onClose: () => void;
}

function ProfileModal({ consultant, onClose }: ProfileModalProps) {
  const profile = parseProfile(consultant.profile);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1718] border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative flex items-center gap-5 p-6 border-b border-gray-700 bg-gradient-to-r from-brand-primary/10 to-transparent flex-shrink-0">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-brand-primary/40 bg-gray-800">
            {consultant.imageUrl ? (
              <Image src={getFileUrl(consultant.imageUrl)} alt={consultant.name} fill className="object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <FaUser className="text-3xl" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">{consultant.name}</h2>
            {consultant.extensions && (
              <p className="text-xs text-gray-400 font-semibold mt-0.5">{consultant.extensions}</p>
            )}
            <p className="text-sm text-brand-primary mt-1 font-medium">{consultant.designation}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {consultant.email && (
                <a
                  href={`mailto:${consultant.email}`}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <FaEnvelope className="text-[11px]" /> {consultant.email}
                </a>
              )}
              {consultant.linkedIn && (
                <a
                  href={consultant.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#0077b5] hover:text-white transition-colors"
                >
                  <FaLinkedin /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            aria-label="Close profile"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {profile ? (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-li:text-gray-300
              prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-brand-primary prose-blockquote:text-gray-400
              prose-table:border-collapse prose-td:border prose-td:border-gray-600 prose-td:px-3 prose-td:py-2
              prose-th:border prose-th:border-gray-600 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-800">
              <CourseRichRenderer content={profile} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic text-center py-8">No detailed profile available for this consultant.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConsultantsClientProps {
  consultants: Consultant[];
}

export default function ConsultantsClient({ consultants }: ConsultantsClientProps) {
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-black to-[#231f20] border-b border-gray-800">
          <div className="container-custom relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-brand-primary text-xs font-semibold uppercase tracking-wider">About Progemini</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Consultants</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Meet our distinguished consultants, strategic advisors, and industry professionals who support
              academic guidance, career development, and strategic growth at Progemini Academy.
            </p>
          </div>
        </section>

        {/* Consultants Grid */}
        <section className="py-20">
          <div className="container-custom">
            {consultants.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Consultant information coming soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {consultants.map((consultant) => (
                  <div
                    key={consultant.id}
                    className="bg-[#2a2627] rounded-xl overflow-hidden group hover:bg-[#322e2f] transition-all duration-300 border border-gray-800 hover:border-brand-primary flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative h-96 sm:h-80 md:h-72 w-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {consultant.imageUrl ? (
                        <Image
                          src={getFileUrl(consultant.imageUrl)}
                          alt={consultant.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
                          <FaUser className="text-6xl text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">
                        {consultant.name}
                      </h3>
                      {consultant.extensions && (
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">
                          {consultant.extensions}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 mt-2 mb-4 min-h-[40px] flex-1">
                        {consultant.designation}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-auto">
                        {/* Social Icons */}
                        <div className="flex items-center gap-2">
                          {consultant.linkedIn && (
                            <Link
                              href={consultant.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-gray-800 rounded-full hover:bg-[#0077b5] hover:text-white transition-all duration-300 text-[#0077b5]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaLinkedin size={18} />
                            </Link>
                          )}
                          {consultant.email && (
                            <a
                              href={`mailto:${consultant.email}`}
                              className="p-2 bg-gray-800 rounded-full hover:bg-brand-primary hover:text-white transition-all duration-300 text-gray-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaEnvelope size={16} />
                            </a>
                          )}
                          {!consultant.linkedIn && !consultant.email && <div />}
                        </div>

                        {/* Details Button */}
                        <button
                          onClick={() => setSelectedConsultant(consultant)}
                          className="flex items-center space-x-2 text-sm font-semibold text-brand-primary hover:text-white transition-colors group/btn"
                        >
                          <span>Details</span>
                          <FaChevronRight className="text-[10px] transform group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 border-t border-gray-800">
          <div className="container-custom text-center">
            <div className="bg-gradient-to-r from-brand-primary/10 to-transparent border border-brand-primary/20 rounded-3xl p-12">
              <h2 className="text-2xl font-bold mb-4">Interested in joining our consultancy team?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Progemini Academy is always looking for distinguished consultants and industry experts to enrich our academic and strategic networks.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-brand-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all hover:-translate-y-1"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Profile Modal */}
      {selectedConsultant && (
        <ProfileModal
          consultant={selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
        />
      )}
    </div>
  );
}
