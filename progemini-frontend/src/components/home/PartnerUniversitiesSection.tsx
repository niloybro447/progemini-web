'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUniversity, FaArrowRight, FaGlobe } from 'react-icons/fa';
import { getFileUrl } from '@/lib/utils';

interface PartnerUniversity {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
}

interface PartnerUniversitiesSectionProps {
  partners: PartnerUniversity[];
}

const FALLBACK_PARTNERS: PartnerUniversity[] = [
  {
    id: 'f1',
    name: 'London Graduate School',
    logoUrl: null,
    websiteUrl: 'https://lgs.panoply.ac',
    description: 'A leading institution offering postgraduate and executive education programmes.'
  },
  {
    id: 'f2',
    name: 'University of Chichester',
    logoUrl: null,
    websiteUrl: 'https://www.chi.ac.uk',
    description: 'A prestigious UK university known for high student satisfaction and excellent teaching.'
  },
  {
    id: 'f3',
    name: 'Guglielmo Marconi University',
    logoUrl: null,
    websiteUrl: 'https://www.guglielmomarconi.university',
    description: 'An internationally accredited Italian university offering online and blended learning.'
  },
  {
    id: 'f4',
    name: 'Girne American University',
    logoUrl: null,
    websiteUrl: 'https://www.gau.edu.tr',
    description: 'A global university offering diverse degree programmes with European accreditation.'
  }
];

function getCleanDescription(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return raw;
  }
  try {
    const parsed = JSON.parse(raw);
    const html = parsed.html || '';
    // Strip HTML tags to get plain text
    const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plainText || null;
  } catch {
    return null;
  }
}

export default function PartnerUniversitiesSection({ partners }: PartnerUniversitiesSectionProps) {
  const displayPartners = partners && partners.length > 0 ? partners : FALLBACK_PARTNERS;

  return (
    <section className="relative py-20 bg-[#1a1718] border-t border-white/5 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary opacity-[0.04] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-primary opacity-[0.04] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-brand-primary text-xs font-semibold uppercase tracking-wider">Global Network</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Our Global Partner Universities
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent mx-auto mb-6 rounded-full"></div>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Collaborating with leading academic institutions to create international pathways, executive learning opportunities, and world-class certifications.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPartners.map((partner) => {
            const description = getCleanDescription(partner.description);
            return (
              <div
                key={partner.id}
                className="bg-[#231f20]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-brand-primary/30 hover:bg-[#231f20]/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
              >
                {/* Logo Area */}
                <div className="relative h-36 w-full bg-white rounded-xl flex items-center justify-center p-4 transition-all duration-300 group-hover:bg-gray-50/95 overflow-hidden">
                  {partner.logoUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={getFileUrl(partner.logoUrl)}
                        alt={partner.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                      <FaUniversity className="text-4xl text-gray-300" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest text-center font-semibold">Progemini Partner</span>
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div className="mt-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-md text-center group-hover:text-brand-primary transition-colors duration-200 line-clamp-2 min-h-[48px] flex items-center justify-center">
                      {partner.name}
                    </h3>
                    {description && (
                      <p className="text-gray-400 text-xs text-center mt-2 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5">
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-primary transition-colors"
                      >
                        <FaGlobe /> Website
                      </a>
                    ) : (
                      <div />
                    )}

                    <Link
                      href="/about/partner-universities"
                      className="flex items-center gap-1 text-xs font-semibold text-brand-primary group-hover:text-white transition-colors duration-200"
                    >
                      Details <FaArrowRight className="text-[9px] transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore More Button */}
        <div className="text-center mt-12">
          <Link
            href="/about/partner-universities"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-brand-primary hover:bg-brand-primary/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-black/20"
          >
            Explore All Partners <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
