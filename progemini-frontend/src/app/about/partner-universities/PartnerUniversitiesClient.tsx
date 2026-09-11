'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaGlobe, FaChevronRight, FaTimes, FaUniversity } from 'react-icons/fa';
import { CourseRichRenderer } from '@/components/admin/CourseRichEditor';
import { getFileUrl } from '@/lib/utils';

interface PartnerUniversity {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
}

function parseDescription(raw: string | null | undefined) {
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

interface UniversityModalProps {
  partner: PartnerUniversity;
  onClose: () => void;
}

function UniversityModal({ partner, onClose }: UniversityModalProps) {
  const description = parseDescription(partner.description);

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
          {/* Logo */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-brand-primary/40 bg-white p-2 flex items-center justify-center">
            {partner.logoUrl ? (
              <Image src={getFileUrl(partner.logoUrl)} alt={partner.name} fill className="object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <FaUniversity className="text-3xl" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">{partner.name}</h2>
            {partner.websiteUrl && (
              <a
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:text-white transition-colors mt-2"
              >
                <FaGlobe /> Visit Website
              </a>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            aria-label="Close details"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {description ? (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-li:text-gray-300
              prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-brand-primary prose-blockquote:text-gray-400
              prose-table:border-collapse prose-td:border prose-td:border-gray-600 prose-td:px-3 prose-td:py-2
              prose-th:border prose-th:border-gray-600 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-800">
              <CourseRichRenderer content={description} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic text-center py-8">No detailed description available for this partner university.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PartnerUniversitiesClientProps {
  partners: PartnerUniversity[];
}

export default function PartnerUniversitiesClient({ partners }: PartnerUniversitiesClientProps) {
  const [selectedPartner, setSelectedPartner] = useState<PartnerUniversity | null>(null);

  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-black to-[#231f20] border-b border-gray-800">
          <div className="container-custom relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-brand-primary text-xs font-semibold uppercase tracking-wider">Our Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Global Partner Universities</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore our collaborations with world-class academic institutions. Together, we provide advanced academic pathways and collaborative programs to elevate student opportunities.
            </p>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-20">
          <div className="container-custom">
            {partners.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Partner universities information coming soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className="bg-[#2a2627] rounded-xl overflow-hidden group hover:bg-[#322e2f] transition-all duration-300 border border-gray-800 hover:border-brand-primary flex flex-col cursor-pointer"
                  >
                    {/* Logo Container */}
                    <div className="relative h-48 w-full bg-white flex items-center justify-center p-6 transition-all duration-300 group-hover:bg-gray-50">
                      {partner.logoUrl ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={getFileUrl(partner.logoUrl)}
                            alt={partner.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUniversity className="text-5xl text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <h3 className="text-md font-bold text-white group-hover:text-brand-primary transition-colors text-center line-clamp-2 min-h-[48px] flex items-center justify-center">
                        {partner.name}
                      </h3>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-4">
                        {partner.websiteUrl ? (
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaGlobe /> Website
                          </a>
                        ) : (
                          <div />
                        )}

                        {/* Details Link */}
                        <div className="flex items-center space-x-1 text-xs font-semibold text-brand-primary group-hover:text-white transition-colors">
                          <span>Details</span>
                          <FaChevronRight className="text-[9px] transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* University Modal */}
      {selectedPartner && (
        <UniversityModal
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}
    </div>
  );
}
