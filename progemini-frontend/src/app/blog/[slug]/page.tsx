import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogBlockRenderer from '@/components/blog/BlogBlockRenderer';
import BlogCourseCard from '@/components/blog/BlogCourseCard';
import { BlogPost } from '@/components/blog/types';
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaShareAlt,
  FaGraduationCap,
  FaArrowRight,
  FaUserCheck,
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

  const relatedPosts = await fetchRelatedPosts(post.category?.slug, post.slug);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      {/* Article Hero */}
      <header className="relative bg-gradient-to-b from-[#1a1718] to-[#252223] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            {post.category && (
              <>
                <span>/</span>
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="hover:text-white transition-colors text-red-300"
                >
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-block rounded-full bg-brand-primary px-3.5 py-1 text-xs font-bold text-white shadow">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {/* Metadata bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/30 text-red-300">
                <FaUserCheck className="text-xs" />
              </span>
              <span className="font-semibold text-white">
                {post.author || 'Progemini Academy'}
              </span>
            </div>

            <span className="text-gray-500">•</span>

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

            <span className="text-gray-500">•</span>

            <div className="flex items-center gap-1.5">
              <FaClock className="text-gray-400 text-xs" />
              <span>{post.readMins || 5} min read</span>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-6 text-base sm:text-lg text-gray-200 leading-relaxed font-normal bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md border border-gray-200/80 mb-10">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Connected Academic Programme Card (Dynamic Course Connection) */}
        {post.course && <BlogCourseCard course={post.course} />}

        {/* Modular Content Blocks */}
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

        {/* Connected Course Card (shown at bottom too if long article) */}
        {post.course && post.blocks && post.blocks.length > 2 && (
          <div className="mt-10">
            <BlogCourseCard course={post.course} />
          </div>
        )}

        {/* Share & Back buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaShareAlt className="text-gray-400" />
            <span>Published by Progemini Academy</span>
          </div>
        </div>
      </main>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-200 bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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
                        src={related.featuredImage}
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

