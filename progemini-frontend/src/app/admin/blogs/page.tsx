'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaGraduationCap,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTags,
} from 'react-icons/fa';
import { BlogPost, BlogCategory } from '@/components/blog/types';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch categories
  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: BlogCategory[] }>('/admin/blogs/categories')
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await apiClient.get<{
        success: boolean;
        data: { posts: BlogPost[]; pagination: { total: number; totalPages: number } };
      }>(`/admin/blogs?${params.toString()}`);

      if (res.data) {
        setBlogs(res.data.posts || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, statusFilter, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const handleTogglePublish = async (blog: BlogPost) => {
    const nextState = !blog.isPublished;
    try {
      await apiClient.patch(`/admin/blogs/${blog.id}/publish`, {
        isPublished: nextState,
      });
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id
            ? { ...b, isPublished: nextState, publishedAt: nextState ? new Date().toISOString() : null }
            : b
        )
      );
      toast.success(nextState ? 'Blog published live' : 'Blog reverted to draft');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update publish state');
    }
  };

  const handleDeleteBlog = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/blogs/${deleteTarget.id}`);
      setBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success('Blog deleted successfully');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete blog');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management CRM</h1>
          <p className="text-xs text-gray-500 mt-1">
            Author and manage UK-standard educational articles, connected programmes, and announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs/categories"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaTags className="text-gray-500" />
            <span>Manage Categories</span>
          </Link>

          <Link
            href="/admin/blogs/create"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            <FaPlus className="text-xs" />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => {
              setStatusFilter('published');
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'published'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => {
              setStatusFilter('draft');
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'draft'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center gap-3 justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-brand-primary focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author..."
              className="w-full rounded-xl border border-gray-300 pl-8 pr-3 py-2 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
            />
            <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
          </form>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <FaSpinner className="animate-spin text-2xl text-brand-primary mr-3" />
            <span className="text-sm font-semibold">Loading articles...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-gray-700">No blog articles found</p>
            <p className="text-xs text-gray-500 mt-1">
              Start by creating your first article using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Article</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Linked Course</th>
                  <th className="px-3 py-3.5">Author</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5 text-center">Views</th>
                  <th className="px-3 py-3.5">Created</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Title & Cover */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                          {blog.featuredImage ? (
                            <Image
                              src={blog.featuredImage}
                              alt={blog.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                              No cover
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <Link
                            href={`/admin/blogs/${blog.id}/edit`}
                            className="font-bold text-gray-900 hover:text-brand-primary line-clamp-1 text-sm"
                          >
                            {blog.title}
                          </Link>
                          <span className="font-mono text-[10px] text-gray-400 block truncate">
                            /blog/{blog.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-4">
                      {blog.category ? (
                        <span className="inline-block rounded-full bg-red-50 text-brand-primary border border-red-100 px-2.5 py-0.5 text-[11px] font-semibold">
                          {blog.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Linked Course */}
                    <td className="px-3 py-4">
                      {blog.course ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold max-w-[140px] truncate">
                          <FaGraduationCap className="text-[10px] flex-shrink-0" />
                          <span className="truncate">{blog.course.title}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Author */}
                    <td className="px-3 py-4 text-gray-700">
                      {blog.author || 'Progemini Academy'}
                    </td>

                    {/* Status switch */}
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(blog)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                          blog.isPublished
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {blog.isPublished ? (
                          <>
                            <FaCheckCircle className="text-[10px]" /> Published
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-[10px]" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Views */}
                    <td className="px-3 py-4 text-center font-mono text-gray-700">
                      {blog.views || 0}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(blog.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          title="View on site"
                        >
                          <FaEye className="text-xs" />
                        </Link>
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(blog)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Confirm Article Deletion</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-gray-900">&ldquo;{deleteTarget.title}&rdquo;</strong>? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteBlog}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && <FaSpinner className="animate-spin text-xs" />}
                <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

