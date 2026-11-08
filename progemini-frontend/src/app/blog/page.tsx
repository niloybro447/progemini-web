import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BlogPost, BlogCategory } from '@/components/blog/types';
import { FaClock, FaCalendarAlt, FaArrowRight, FaGraduationCap } from 'react-icons/fa';

export const revalidate = 60; // ISR 60 seconds

interface SearchParams {
  category?: string;
  page?: string;
  search?: string;
}

export async function generateMetadata(props: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const category = props.searchParams?.category;
  const suffix = category ? ` — ${category.replace(/-/g, ' ')}` : '';

  return {
    title: `Academy Blog & Educational Insights${suffix} | Progemini Academy`,
    description:
      'Explore UK-standard educational insights, accredited degree guides, research papers, scholarship updates, and virtual campus stories from Progemini Academy.',
    alternates: {
      canonical: `https://progemini.academy/blog${category ? `?category=${category}` : ''}`,
    },
  };
}

async function getBlogData(category = '', page = 1) {
  const base = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const cleanBase = base.replace(/\/+$/, '');

  try {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('limit', '9');
    if (category && category !== 'all') query.set('category', category);

    const [postsRes, catsRes] = await Promise.all([
      fetch(`${cleanBase}/blogs?${query.toString()}`, { next: { revalidate: 60 } }),
      fetch(`${cleanBase}/blog-categories`, { next: { revalidate: 300 } }),
    ]);

    const postsData = postsRes.ok ? await postsRes.json() : null;
    const catsData = catsRes.ok ? await catsRes.json() : null;

    return {
      posts: (postsData?.data?.posts as BlogPost[]) || [],
      pagination: postsData?.data?.pagination || { total: 0, page: 1, limit: 9, totalPages: 1 },
      categories: (catsData?.data as BlogCategory[]) || [],
    };
  } catch (err) {
    console.error('Failed to load blogs for public page:', err);
    return {
      posts: [],
      pagination: { total: 0, page: 1, limit: 9, totalPages: 1 },
      categories: [],
    };
  }
}

export default async function BlogIndexPage(props: { searchParams: SearchParams }) {
  const selectedCategory = props.searchParams?.category || '';
  const page = Math.max(1, parseInt(props.searchParams?.page || '1') || 1);

  const { posts, pagination, categories } = await getBlogData(selectedCategory, page);

  // Core 7 categories fallback if empty
  const defaultCategories: { name: string; slug: string }[] = [
    { name: 'Course', slug: 'course' },
    { name: 'Academic', slug: 'academic' },
    { name: 'Student Journey', slug: 'student-journey' },
    { name: 'Progemini VLE', slug: 'progemini-vle' },
    { name: 'Research', slug: 'research' },
    { name: 'Communication', slug: 'communication' },
    { name: 'Scholarships', slug: 'scholarships' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1a1718] to-[#252223] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 px-4 py-1 text-xs font-semibold text-red-300 mb-4">
            Progemini Academy Journal
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white">
            Insights, Research & Academic Excellence
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Thought leadership, accredited degree pathways, scholarship announcements, and virtual campus updates from our academic leaders.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            <Link
              href="/blog"
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all shadow-sm ${
                !selectedCategory
                  ? 'bg-brand-primary text-white shadow-brand-primary/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              All Articles
            </Link>

            {displayCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="py-24 text-center rounded-3xl bg-white border border-gray-200/80 shadow-sm max-w-2xl mx-auto p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-brand-primary mb-4">
              <FaGraduationCap className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {selectedCategory
                ? 'There are currently no published articles in this category. Check back soon or browse all topics.'
                : 'Our faculty members are currently drafting new research publications and guides.'}
            </p>
            {selectedCategory && (
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow"
              >
                <span>View All Articles</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm hover:shadow-xl hover:border-brand-primary/40 transition-all duration-300"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                      <FaGraduationCap className="text-4xl text-gray-300" />
                    </div>
                  )}

                  {post.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold text-white shadow-md">
                      {post.category.name}
                    </span>
                  )}
                </Link>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        <FaCalendarAlt className="text-gray-400 text-[11px]" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <FaClock className="text-gray-400 text-[11px]" />
                        {post.readMins || 5} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="mt-2.5 text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer / Author & Link */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-gray-700">
                      {post.author || 'Progemini Academy'}
                    </span>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform"
                    >
                      <span>Read Article</span>
                      <FaArrowRight className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/blog?${new URLSearchParams({
                  ...(selectedCategory ? { category: selectedCategory } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                Previous Page
              </Link>
            )}

            <span className="text-xs text-gray-500 font-medium px-2">
              Page {page} of {pagination.totalPages}
            </span>

            {page < pagination.totalPages && (
              <Link
                href={`/blog?${new URLSearchParams({
                  ...(selectedCategory ? { category: selectedCategory } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                Next Page
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
