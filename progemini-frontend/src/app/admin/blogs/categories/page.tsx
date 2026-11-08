'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaCheck,
  FaFolder,
} from 'react-icons/fa';
import { BlogCategory } from '@/components/blog/types';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: BlogCategory[] }>(
        '/admin/blogs/categories'
      );
      if (res.data) setCategories(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setOrder(categories.length + 1);
    setShowModal(true);
  };

  const openEditModal = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setOrder(cat.order || 0);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await apiClient.put(`/admin/blogs/categories/${editingCategory.id}`, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || null,
          order: Number(order) || 0,
        });
        toast.success('Category updated');
      } else {
        await apiClient.post('/admin/blogs/categories', {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || null,
          order: Number(order) || 0,
        });
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await apiClient.delete(`/admin/blogs/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Organize articles across Academic, Course, Research, Scholarships, and more.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
        >
          <FaPlus className="text-xs" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <FaSpinner className="animate-spin text-2xl text-brand-primary mr-3" />
          <span className="text-sm font-semibold">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-brand-primary">
                      <FaFolder className="text-xs" />
                    </span>
                    <h3 className="font-bold text-gray-900 text-base">{cat.name}</h3>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-mono text-gray-600">
                    Order: {cat.order}
                  </span>
                </div>

                <div className="font-mono text-xs text-gray-400 mb-2">/blog?category={cat.slug}</div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-gray-500 font-medium">
                  {cat._count?.blogs || 0} {cat._count?.blogs === 1 ? 'article' : 'articles'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Edit Category"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete Category"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(
                      e.target.value
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    );
                  }
                }}
                placeholder="e.g. Student Journey"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-brand-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="student-journey"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-mono text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of articles in this category..."
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 p-2 text-xs text-gray-900 focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting && <FaSpinner className="animate-spin text-xs" />}
                <span>{submitting ? 'Saving...' : 'Save Category'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

