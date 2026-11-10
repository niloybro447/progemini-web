import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogBlockRenderer from '@/components/blog/BlogBlockRenderer';
import { BlogPost } from '@/components/blog/types';
import { getFileUrl } from '@/lib/utils';
import { serverFetch } from '@/lib/serverApi';
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaShareAlt,
  FaGraduationCap,
  FaArrowRight,
  FaUserCheck,
  FaAward,
  FaTrophy,
  FaCheckCircle,
  FaBookOpen,
  FaHome,
} from 'react-icons/fa';

export const revalidate = 60; // ISR 60 seconds

type Params = { params: { slug: string } };

async function fetchPost(slug: string): Promise<BlogPost | null> {
  const base = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const cleanBase = base.replace(/\/+$/, '');

  try {
    const res = await fetch(`${cleanBase}/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data as BlogPost) || null;
  } catch (err) {
    console.error(`Failed to fetch blog ${slug}:`, err);
    return null;
  }
}

async function fetchRelatedPosts(categorySlug?: string, currentSlug?: string): Promise<BlogPost[]> {
  const base = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const cleanBase = base.replace(/\/+$/, '');

  try {
    const query = new URLSearchParams();
    query.set('limit', '4');
    if (categorySlug) query.set('category', categorySlug);

    const res = await fetch(`${cleanBase}/blogs?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const list = (json.data?.posts as BlogPost[]) || [];
    return list.filter((p) => p.slug !== currentSlug).slice(0, 3);
  } catch (err) {
    console.error('Failed to fetch related posts:', err);
    return [];
  }
}

async function fetchFeaturedCourses(): Promise<any[]> {
  try {
    const all = await serverFetch<any[]>('/v1/courses', { next: { revalidate: 300 } });
    if (!all || !Array.isArray(all)) return [];
    return all
      .filter((c: any) => c.isFeatured && c.isPublished)
      .sort(
        (a: any, b: any) =>
          (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch featured courses for blog sidebar:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) {
    return {
      title: 'Article Not Found | Progemini Academy',
    };
  }

  const title = post.metaTitle || `${post.title} | Progemini Academy`;
  const description =
    post.metaDescription || post.excerpt || 'UK standard accredited education and research from Progemini Academy.';
  const canonical = post.canonicalUrl || `https://progemini.academy/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Progemini Academy',
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.author || 'Progemini Academy'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogPostDetailPage({ params }: Params) {
  const post = await fetchPost(params.slug);
  if (!post) {
    notFound();
  }

  const [relatedPosts, featuredCourses] = await Promise.all([
    fetchRelatedPosts(post.category?.slug, post.slug),
    !post.course ? fetchFeaturedCourses() : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      {/* Article Hero — Full Width with Controlled Margins */}
      <header className="relative bg-gradient-to-br from-[#121011] via-[#1a1617] to-[#261f22] text-white pt-28 sm:pt-32 pb-16 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-white/5 overflow-hidden">
        {/* Subtle decorative glows & pattern */}
        <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        <div className="max-w-[1536px] mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap font-medium">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <FaHome className="text-xs" /> Home
            </Link>
            <span className="text-gray-600">/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              Journal & Blog
            </Link>
            {post.category && (
              <>
                <span className="text-gray-600">/</span>
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="hover:text-white transition-colors text-red-300 font-semibold"
                >
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Category Badge & Read Time */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {post.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-brand-primary/20 uppercase tracking-wider">
                <FaBookOpen className="text-[11px]" />
                {post.category.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300 backdrop-blur-xs">
              <FaClock className="text-xs text-red-300" />
              {post.readMins || 5} min read
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14] max-w-6xl">
            {post.title}
          </h1>

          {/* Metadata bar */}
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-red-300 border border-brand-primary/30">
                <FaUserCheck className="text-xs" />
              </span>
              <div>
                <span className="font-semibold text-white block">
                  {post.author || 'Progemini Academic Faculty'}
                </span>
                <span className="text-[11px] text-gray-400">UK Standard Academic Publication</span>
              </div>
            </div>

            <span className="hidden sm:inline text-gray-600">•</span>

            <div className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-gray-400 text-xs" />
              <span>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Excerpt Summary Callout */}
          {post.excerpt && (
            <div className="mt-8 rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 backdrop-blur-sm max-w-5xl border-l-4 border-l-brand-primary">
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-300 mb-1.5">
                Executive Summary & Key Takeaways
              </div>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-medium text-gray-300 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Body — Two Columns (8 / 4) */}
      <main className="flex-grow w-full max-w-[1536px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Main Blog Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Featured Cover Image */}
            {post.featuredImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md border border-gray-200/80">
                <Image
                  src={getFileUrl(post.featuredImage)}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 960px"
                />
              </div>
            )}

            {/* Modular Content Blocks (Notice: NO top or bottom dynamic course card in the content stream) */}
            {post.blocks && post.blocks.length > 0 ? (
              <article className="rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-gray-200/80">
                <BlogBlockRenderer blocks={post.blocks} postTitle={post.title} />
              </article>
            ) : post.content ? (
              <article
                className="prose prose-lg max-w-none rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-gray-200/80 leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : null}

            {/* Share & Back buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FaArrowLeft className="text-xs" />
                <span>Back to All Articles</span>
              </Link>

              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <FaShareAlt className="text-gray-400" />
                <span>Published by Progemini Academy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* If dynamic course is available on this blog, ONLY display that course */}
            {post.course ? (
              <div className="rounded-3xl overflow-hidden border border-gray-200/90 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-brand-secondary via-[#241f21] to-brand-primary text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <FaGraduationCap className="text-red-400 text-sm" /> Connected Programme
                  </div>
                  {post.course.level && (
                    <span className="text-[11px] bg-white/20 text-white font-medium px-2 py-0.5 rounded-full">
                      {post.course.level}
                    </span>
                  )}
                </div>

                {/* Course Feature Image */}
                {post.course.featureImage && (
                  <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={getFileUrl(post.course.featureImage)}
                      alt={post.course.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 420px"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug hover:text-brand-primary transition-colors">
                      <Link href={`/courses/${post.course.slug}`}>{post.course.title}</Link>
                    </h3>
                    {post.course.introduction && (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {post.course.introduction.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-700">
                    {post.course.award && (
                      <div className="flex items-center gap-2">
                        <FaAward className="text-yellow-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-800 line-clamp-1">
                          {post.course.award}
                        </span>
                      </div>
                    )}
                    {post.course.duration && (
                      <div className="flex items-center gap-2">
                        <FaClock className="text-brand-primary flex-shrink-0" />
                        <span>{post.course.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                      <span>UK Accredited International Pathway</span>
                    </div>
                  </div>

                  {/* Apply CTA */}
                  <Link
                    href={`/courses/${post.course.slug}`}
                    className="btn-primary w-full text-center py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm mt-4 text-xs sm:text-sm"
                  >
                    <span>Explore Programme & Apply</span>
                    <FaArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            ) : (
              /* If NO dynamic course on this blog, display the featured courses from the homepage */
              <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-brand-primary flex items-center justify-center">
                      <FaTrophy className="text-sm" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Featured Programmes</h3>
                      <p className="text-[11px] text-gray-500">Flagship UK degree & executive courses</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {featuredCourses.map((c: any) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      className="group flex gap-3 p-2.5 rounded-2xl hover:bg-red-50/50 border border-transparent hover:border-red-100 transition-all"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {c.featureImage ? (
                          <Image
                            src={getFileUrl(c.featureImage)}
                            alt={c.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <FaGraduationCap className="text-xl" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors text-xs leading-snug line-clamp-2">
                            {c.title}
                          </h4>
                          {c.award && (
                            <span className="text-[10px] text-gray-500 mt-1 line-clamp-1 block">
                              {c.award}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-brand-primary inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-1">
                          <span>Learn More</span>
                          <FaArrowRight className="text-[9px]" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/courses"
                    className="w-full py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Explore All Programmes</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Academic Admissions Assistance Card */}
            <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50/60 to-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-xs">
                  <FaUserCheck />
                </span>
                <h4 className="text-xs font-bold text-gray-900">Need Admissions Guidance?</h4>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Connect with a Progemini academic advisor for personal guidance on UK degree enrolment, eligibility, and scholarships.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
              >
                <span>Speak to an Advisor</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-200 bg-white py-16 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="max-w-[1536px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Further educational reading in {post.category?.name || 'Academic Studies'}
                </p>
              </div>

              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
              >
                <span>Browse All</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <article
                  key={related.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all"
                >
                  <Link
                    href={`/blog/${related.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100"
                  >
                    {related.featuredImage ? (
                      <Image
                        src={getFileUrl(related.featuredImage)}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        <FaGraduationCap className="text-3xl text-gray-300" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="text-[11px] text-gray-400 mb-2 font-medium">
                        {related.readMins || 5} min read
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors text-sm line-clamp-2">
                        <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                      </h3>
                      {related.excerpt && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                          {related.excerpt}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/blog/${related.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-primary"
                    >
                      <span>Read Article</span>
                      <FaArrowRight className="text-[10px]" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
