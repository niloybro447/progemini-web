import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { serverFetch } from '@/lib/serverApi';
import { getFileUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface HeroItem {
  label: string;
  value: string;
  selected: boolean;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await serverFetch<any>(`/v1/senior-profiles/slug/${params.slug}`);

  if (!profile) {
    return {
      title: 'Profile Not Found | Progemini Academy',
    };
  }

  const title = `${profile.name} - ${profile.position} | Progemini Academy`;
  const description = profile.description || `Read the professional profile of ${profile.name}, ${profile.position} at Progemini Academy.`;
  const shareImage = profile.imageUrlMobile || profile.imageUrlDesktop || '/Progemini-trans-logo.gif';

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      title,
      description,
      images: [
        {
          url: shareImage,
          alt: profile.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage],
    },
  };
}

export default async function DynamicSeniorProfileDetailPage({ params }: { params: { slug: string } }) {
  const profile = await serverFetch<any>(`/v1/senior-profiles/slug/${params.slug}`);

  if (!profile) {
    notFound();
  }

  // Parse qualities
  const qualities = profile.quality
    ? profile.quality.split(',').map((q: string) => q.trim()).filter(Boolean)
    : [];

  // Parse selected hero items (expecting exactly 3)
  let heroItems: HeroItem[] = [];
  try {
    if (profile.heroItems) {
      const parsed = typeof profile.heroItems === 'string' 
        ? JSON.parse(profile.heroItems) 
        : profile.heroItems;
      if (Array.isArray(parsed)) {
        heroItems = parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse hero items:', err);
  }
  const selectedHeroItems = heroItems.filter((i) => i.selected).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-white">
      <Navbar />

      <main className="flex-grow">
        {/* Top Hero Section with Mobile Background Image */}
        <div className="block md:hidden w-full h-[70vh] relative overflow-hidden">
          <Image
            src={getFileUrl(profile.imageUrlMobile || profile.imageUrlDesktop)}
            alt={profile.name}
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
          {/* Top Gradient Overlay (30% height, transparent) */}
          <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-black/40 to-transparent z-10" />
          
          {/* Bottom Gradient Overlay (Transparent/Faded) */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#070709] via-[#070709]/60 to-transparent z-10" />
        </div>

        {/* Top Hero Section with Image Background */}
        <section className="relative border-b border-white/10 overflow-hidden min-h-[70vh] md:min-h-[85vh] flex items-center">
          {/* Background Image - Aligned Right (Hidden on Mobile) */}
          <div className="absolute inset-0 z-0 hidden md:block">
            <Image
              src={getFileUrl(profile.imageUrlDesktop || profile.imageUrlMobile)}
              alt={profile.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-right"
            />
          </div>

          {/* Gradient Overlay (Right to Left) - Fades specifically to allow image visibility */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000000] via-[#000000]/70 to-transparent/30 hidden md:block" />
          <div className="absolute inset-0 z-10 md:bg-transparent lg:bg-[#070709]/20 md:hidden" />

          {/* Content - Positioned on Left */}
          <div className="container-custom relative z-20 w-full py-16 md:py-24">
            {/* Text Content - Left Side */}
            <div className="max-w-2xl bg-black/10 md:backdrop-blur-0 backdrop-blur-[2px] p-4 rounded-3xl">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <p className="uppercase tracking-[0.25em] text-[10px] sm:text-xs text-gray-300 mb-3">{profile.position}</p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white">
                    {profile.name}
                  </h1>
                </div>
                
                {qualities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {qualities.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className={`px-4 py-2 rounded-full text-[11px] sm:text-xs border border-white/30 bg-white/10 backdrop-blur-md ${
                          idx % 2 === 1 ? 'border-brand-primary/50 bg-brand-primary/15 text-brand-primary' : ''
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm sm:text-base leading-relaxed text-gray-100 max-w-xl pt-4">
                  {profile.description}
                </p>

                {selectedHeroItems.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] sm:text-xs text-gray-200 pt-6">
                    {selectedHeroItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-3 ${
                          idx === 2 ? 'col-span-2 sm:col-span-1' : ''
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wide text-gray-300">{item.label}</div>
                        <div className="text-sm sm:text-base font-semibold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Breadcrumb - Positioned Absolutely at Top */}
          <div className="absolute top-6 md:top-8 left-0 right-0 z-30 container-custom">
            <div className="text-xs md:text-sm text-gray-300 flex items-center space-x-2">
              <Link href="/about" className="hover:text-brand-primary transition-colors">About</Link>
              <span>/</span>
              <Link href="/about/global-leadership" className="hover:text-brand-primary transition-colors">Global Leadership</Link>
              <span>/</span>
              <span className="text-white font-medium">Profile</span>
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <section className="py-12 md:py-20 bg-[#0b0b0d]">
          <div className="container-custom grid grid-cols-1 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] gap-10 md:gap-14">
            
            {/* Left: Narrative Sections */}
            <div className="space-y-10 md:space-y-12">
              <div 
                className="dynamic-prose text-gray-200 space-y-8"
                dangerouslySetInnerHTML={{ __html: profile.fullDescriptionHTML }}
              />
            </div>

            {/* Right: Side Panel */}
            <aside className="space-y-6 md:space-y-8">
              {profile.sideDescription1HTML && (
                <div 
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-5 py-6 sm:px-6 sm:py-7 dynamic-prose-sidebar"
                  dangerouslySetInnerHTML={{ __html: profile.sideDescription1HTML }}
                />
              )}

              {profile.sideDescription2HTML && (
                <div 
                  className="rounded-3xl border border-brand-primary/30 bg-brand-primary/5 px-5 py-6 sm:px-6 sm:py-7 dynamic-prose-sidebar-quote"
                  dangerouslySetInnerHTML={{ __html: profile.sideDescription2HTML }}
                />
              )}

              {/* Back link */}
              <div className="text-xs sm:text-sm text-gray-400">
                <p className="mb-1">Explore more leadership profiles:</p>
                <Link
                  href="/about/global-leadership"
                  className="inline-flex items-center gap-2 text-brand-primary hover:text-white transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  Back to Global Leadership Team
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        /* Dynamic prose formatting for content injected from TipTap rich text editor */
        .dynamic-prose h1, .dynamic-prose h2, .dynamic-prose h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: #ffffff !important;
          margin-top: 2rem !important;
          margin-bottom: 0.75rem !important;
          display: block !important;
          border-left: 4px solid #d7263d !important;
          padding-left: 1rem !important;
        }
        .dynamic-prose h4 {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #ffffff !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
        }
        .dynamic-prose h1:first-of-type, .dynamic-prose h2:first-of-type, .dynamic-prose h3:first-of-type {
          margin-top: 0 !important;
        }
        @media (min-width: 768px) {
          .dynamic-prose h1, .dynamic-prose h2, .dynamic-prose h3 {
            font-size: 1.5rem !important;
          }
        }
        .dynamic-prose p {
          font-size: 0.875rem !important;
          line-height: 1.625 !important;
          color: #d1d5db !important;
          margin-bottom: 1rem !important;
        }
        @media (min-width: 640px) {
          .dynamic-prose p {
            font-size: 1rem !important;
          }
        }
        .dynamic-prose ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-bottom: 1.25rem !important;
          margin-top: 0.5rem !important;
        }
        .dynamic-prose li {
          font-size: 0.875rem !important;
          line-height: 1.625 !important;
          color: #d1d5db !important;
          margin-bottom: 0.375rem !important;
        }
        @media (min-width: 640px) {
          .dynamic-prose li {
            font-size: 1rem !important;
          }
        }
        
        /* Sidebar Card 1 style override (Expertise) */
        .dynamic-prose-sidebar h1, .dynamic-prose-sidebar h2, .dynamic-prose-sidebar h3 {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          margin-bottom: 1rem !important;
          color: #ffffff !important;
          display: block !important;
        }
        @media (min-width: 640px) {
          .dynamic-prose-sidebar h1, .dynamic-prose-sidebar h2, .dynamic-prose-sidebar h3 {
            font-size: 1rem !important;
          }
        }
        @media (min-width: 768px) {
          .dynamic-prose-sidebar h1, .dynamic-prose-sidebar h2, .dynamic-prose-sidebar h3 {
            font-size: 1.125rem !important;
          }
        }
        .dynamic-prose-sidebar ul {
          margin-top: 0.5rem !important;
          list-style-type: none !important;
          padding-left: 0 !important;
        }
        .dynamic-prose-sidebar li {
          position: relative !important;
          padding-left: 1.25rem !important;
          font-size: 0.75rem !important;
          line-height: 1.5 !important;
          color: #d1d5db !important;
          margin-bottom: 0.5rem !important;
        }
        @media (min-width: 640px) {
          .dynamic-prose-sidebar li {
            font-size: 0.875rem !important;
          }
        }
        .dynamic-prose-sidebar li::before {
          content: "" !important;
          position: absolute !important;
          left: 0 !important;
          top: 0.45rem !important;
          width: 0.375rem !important;
          height: 0.375rem !important;
          border-radius: 9999px !important;
          background-color: #d7263d !important;
        }
        
        /* Sidebar Card 2 style override (Quote Box) */
        .dynamic-prose-sidebar-quote p:first-of-type,
        .dynamic-prose-sidebar-quote h1:first-of-type,
        .dynamic-prose-sidebar-quote h2:first-of-type,
        .dynamic-prose-sidebar-quote h3:first-of-type {
          font-size: 0.75rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.25em !important;
          color: #d7263d !important;
          margin-bottom: 0.75rem !important;
          font-weight: 600 !important;
          display: block !important;
        }
        .dynamic-prose-sidebar-quote p:last-of-type {
          font-size: 0.875rem !important;
          line-height: 1.625 !important;
          color: #f3f4f6 !important;
        }
        @media (min-width: 640px) {
          .dynamic-prose-sidebar-quote p:last-of-type {
            font-size: 1rem !important;
          }
        }
      ` }} />
    </div>
  );
}
