'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaSave,
  FaUpload,
  FaSpinner,
  FaTrash,
  FaGraduationCap,
  FaEye,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { BlogPost, BlogBlock, BlogCategory, ConnectedCourse } from '@/components/blog/types';
import BlockEditor from './BlockEditor';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

interface BlogFormProps {
  initialData?: Partial<BlogPost>;
  isEdit?: boolean;
}

export default function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();

  // Core Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugEditedManually, setSlugEditedManually] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [author, setAuthor] = useState(initialData?.author || 'Progemini Academy');
  const [authorAvatar, setAuthorAvatar] = useState(initialData?.authorAvatar || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [courseId, setCourseId] = useState(initialData?.courseId || '');
  const [isPublished, setIsPublished] = useState(Boolean(initialData?.isPublished));
  const [readMins, setReadMins] = useState(initialData?.readMins || 5);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [blocks, setBlocks] = useState<BlogBlock[]>(
    Array.isArray(initialData?.blocks) ? (initialData.blocks as BlogBlock[]) : []
  );

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '');

  // Aux state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [courses, setCourses] = useState<ConnectedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-slug generator
  const generateSlug = (val: string) => {
    return val
      .trim()
      .toLowerCase()
      .replace(/['"’]/g, '')
      .replace(/\/+$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  useEffect(() => {
    if (!slugEditedManually && !isEdit && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugEditedManually, isEdit]);

  // Load categories and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await apiClient.get<{ success: boolean; data: BlogCategory[] }>(
          '/admin/blogs/categories'
        );
        if (catRes.data) {
          setCategories(catRes.data);
          if (!categoryId && catRes.data.length > 0) {
            setCategoryId(catRes.data[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load blog categories', e);
      }

      try {
        setLoadingCourses(true);
        const courseRes = await apiClient.get<any>('/courses');
        const courseList = Array.isArray(courseRes?.courses)
          ? courseRes.courses
          : Array.isArray(courseRes?.data?.courses)
          ? courseRes.data.courses
          : Array.isArray(courseRes)
          ? courseRes
          : [];
        setCourses(courseList);
      } catch (e) {
        console.error('Failed to load courses', e);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, []);

  // Tag helper
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // MinIO featured image upload
  const handleFeaturedImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);
    try {
      const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
        '/admin/blogs/upload-image',
        formData
      );
      if (res.data?.url) {
        setFeaturedImage(res.data.url);
        toast.success('Featured image uploaded to MinIO');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Article title is required');
      return;
    }

    const cleanSlug = generateSlug(slug || title);
    if (!cleanSlug) {
      toast.error('Valid slug is required');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: cleanSlug,
      excerpt: excerpt.trim() || null,
      featuredImage: featuredImage || null,
      thumbnail: featuredImage || null,
      author: author.trim() || 'Progemini Academy',
      authorAvatar: authorAvatar.trim() || null,
      readMins: Number(readMins) || 5,
      tags,
      blocks,
      categoryId: categoryId || null,
      courseId: courseId || null,
      isPublished,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || excerpt.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
    };

    try {
      if (isEdit && initialData?.id) {
        await apiClient.put(`/admin/blogs/${initialData.id}`, payload);
        toast.success('Blog article updated successfully');
      } else {
        await apiClient.post('/admin/blogs', payload);
        toast.success('Blog article created successfully');
      }
      router.push('/admin/blogs');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  // Check if current category is "Course"
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const isCourseCategory = selectedCategoryObj?.slug === 'course';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Blog Article' : 'Create New Blog Article'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Follow UK educational standards with structured modular blocks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {slug && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FaEye className="text-xs" /> Preview
            </Link>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-all"
          >
            {saving ? <FaSpinner className="animate-spin text-sm" /> : <FaSave className="text-sm" />}
            <span>{saving ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Guide to MSc Data Analytics & AI for Global Executives"
                className="w-full rounded-xl border border-gray-300 p-3 text-base font-semibold text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
                <span className="text-xs text-gray-400 select-none">progemini.academy/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugEditedManually(true);
                    setSlug(generateSlug(e.target.value));
                  }}
                  className="w-full bg-transparent p-1 font-mono text-sm text-gray-900 focus:outline-none"
                  placeholder="msc-data-analytics-guide"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Excerpt / Summary
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A compelling 1-2 sentence overview shown in blog cards and search engines..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Dynamic Course Connection Box */}
          <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50/50 via-white to-gray-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FaGraduationCap className="text-brand-primary text-lg" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Connected Academic Programme (Dynamic Course Link)
              </h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Connect this blog article to an accredited course. When connected, a rich interactive
              programme card is displayed on the article page encouraging student applications.
            </p>

            <div className="space-y-3">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-medium text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">-- No Connected Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.level || 'Degree'} {c.duration ? `• ${c.duration}` : ''})
                  </option>
                ))}
              </select>

              {courseId && (
                <div className="flex items-center justify-between rounded-lg bg-red-100/70 px-3.5 py-2 text-xs text-brand-primary font-semibold">
                  <span>Linked: {courses.find((c) => c.id === courseId)?.title}</span>
                  <button
                    type="button"
                    onClick={() => setCourseId('')}
                    className="hover:underline flex items-center gap-1"
                  >
                    <FaTimes className="text-[10px]" /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Block Editor */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* Right Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          {/* Publishing Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Publishing Status
            </h3>

            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 border border-gray-200">
              <div>
                <span className="text-sm font-bold text-gray-900 block">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-500">
                  {isPublished ? 'Visible to public at /blog' : 'Only visible to administrators'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-900 focus:border-brand-primary focus:outline-none"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Read Time (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={readMins}
                onChange={(e) => setReadMins(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Featured Image (MinIO) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Featured Cover Image
            </h3>

            {featuredImage ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <Image
                    src={featuredImage}
                    alt="Featured Image Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaTrash className="text-xs" /> Remove Image
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-brand-primary transition-colors">
                <label className="flex cursor-pointer flex-col items-center justify-center">
                  {uploadingImage ? (
                    <FaSpinner className="animate-spin text-2xl text-brand-primary mb-2" />
                  ) : (
                    <FaUpload className="text-2xl text-gray-400 mb-2" />
                  )}
                  <span className="text-xs font-bold text-gray-700">
                    {uploadingImage ? 'Uploading to MinIO...' : 'Upload Featured Image'}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1">
                    JPEG, PNG, WebP (Max 10MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFeaturedImageUpload(f);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Author & Tags */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Author & Tags
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Author Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Progemini Academy"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-semibold text-brand-primary"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-red-400 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
                className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              SEO & Metadata
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || 'Custom SEO Title'}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Concise Google search snippet description..."
                className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Canonical URL</label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://progemini.academy/blog/..."
                className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

