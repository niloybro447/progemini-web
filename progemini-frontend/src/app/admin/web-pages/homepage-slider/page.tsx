'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaGripVertical } from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';

interface Slide {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = { title: '', eyebrow: '', description: '', imageUrl: '', order: 0, isActive: true };

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Slide[]>('/v1/hero-slides?all=1');
      setSlides(Array.isArray(data) ? data.sort((a: Slide, b: Slide) => a.order - b.order) : []);
    } catch {
      setError('Failed to load slides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post('/v1/hero-slides', { ...form, order: form.order || slides.length + 1 });
      setSuccess('Slide added successfully.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchSlides();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add slide.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await apiClient.delete(`/v1/hero-slides/${id}`);
      setSuccess('Slide deleted.');
      await fetchSlides();
    } catch {
      setError('Failed to delete slide.');
    }
  };

  const handleToggle = async (slide: Slide) => {
    try {
      await apiClient.patch(`/v1/hero-slides/${slide.id}`, { isActive: !slide.isActive });
      await fetchSlides();
    } catch {
      setError('Failed to update slide.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Slider</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the hero slider shown on the homepage.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
        >
          <FaPlus /> Add Slide
        </button>
      </div>

      {/* Feedback */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg">New Slide</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="e.g. Empowering Leaders, Inspiring Futures"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Eyebrow (small label)</label>
              <input
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="e.g. Learn from the Best"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL *</label>
            <input
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              placeholder="Short supporting text under the title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="isActiveForm"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-brand-primary"
              />
              <label htmlFor="isActiveForm" className="text-sm text-gray-700">Active (visible on site)</label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Slide'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Slides List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading slides…</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          No slides yet. Click <span className="font-semibold">Add Slide</span> to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`flex gap-4 items-start bg-white border rounded-xl p-4 shadow-sm transition-all ${slide.isActive ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'}`}
            >
              {/* Thumbnail */}
              <div className="relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                {slide.eyebrow && (
                  <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">{slide.eyebrow}</span>
                )}
                <h3 className="font-bold text-gray-900 text-sm mt-0.5 leading-snug truncate">{slide.title}</h3>
                {slide.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{slide.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">Order: {slide.order}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(slide)}
                  title={slide.isActive ? 'Hide slide' : 'Show slide'}
                  className="text-gray-400 hover:text-brand-primary transition-colors text-xl"
                >
                  {slide.isActive ? <FaToggleOn className="text-brand-primary" /> : <FaToggleOff />}
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  title="Delete slide"
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
