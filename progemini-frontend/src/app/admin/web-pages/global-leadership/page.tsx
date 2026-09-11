'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CourseRichEditor, { type RichContent } from '@/components/admin/CourseRichEditor';
import {
  FaPlus, FaTrash, FaEdit, FaToggleOn, FaToggleOff,
  FaLinkedin, FaUser, FaLink, FaImage, FaListUl
} from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';

const EMPTY_RICH: RichContent = { json: null, html: '' };

interface SeniorProfile {
  id: string;
  slug: string;
  name: string;
  position: string;
  quality: string;
  description: string;
  imageUrlDesktop: string;
  imageUrlMobile: string;
  objectPos: string;
  linkedin: string;
  heroItems: any; // { label: string, value: string, selected: boolean }[]
  fullDescriptionHTML: string;
  sideDescription1HTML: string;
  sideDescription2HTML: string;
  order: number;
  isActive: boolean;
}

const DEFAULT_HERO_ITEMS = [
  { label: 'EXPERIENCE', value: '30+ Years', selected: true },
  { label: 'REGIONS', value: 'Europe, MENA, Asia', selected: true },
  { label: 'Focus', value: 'TNE & Strategy', selected: true },
  { label: 'Background', value: 'Academia & Consulting', selected: false },
  { label: 'Expertise', value: 'HR & Strategy', selected: false },
  { label: 'Qualification', value: 'MSc Cybersecurity', selected: false },
  { label: 'Institution', value: 'ARU · GMU · MCUK', selected: false }
];

const EMPTY_FORM = {
  name: '',
  slug: '',
  position: '',
  quality: '',
  description: '',
  imageUrlDesktop: '',
  imageUrlMobile: '',
  objectPos: 'object-center',
  linkedin: '#',
  order: 0,
  isActive: true,
  heroItems: DEFAULT_HERO_ITEMS,
};

function toRichContent(html: string | null | undefined): RichContent {
  if (!html) return EMPTY_RICH;
  return { json: null, html };
}

export default function AdminGlobalLeadershipPage() {
  const [profiles, setProfiles] = useState<SeniorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  
  // Rich text editors content
  const [fullDescRich, setFullDescRich] = useState<RichContent>(EMPTY_RICH);
  const [sideDesc1Rich, setSideDesc1Rich] = useState<RichContent>(EMPTY_RICH);
  const [sideDesc2Rich, setSideDesc2Rich] = useState<RichContent>(EMPTY_RICH);

  // Uploading flags
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<SeniorProfile[]>('/v1/admin/senior-profiles');
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load global leadership profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDesktop: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isDesktop) setUploadingDesktop(true);
    else setUploadingMobile(true);
    
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', 'global-leadership');

    try {
      const data = await apiClient.upload<{ url?: string; downloadUrl: string }>('/v1/files/upload', uploadData);
      
      setForm((prev) => ({
        ...prev,
        [isDesktop ? 'imageUrlDesktop' : 'imageUrlMobile']: data.url || data.downloadUrl || ''
      }));
      setSuccess(`${isDesktop ? 'Desktop' : 'Mobile'} image uploaded successfully.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      if (isDesktop) setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      order: profiles.length + 1,
      heroItems: DEFAULT_HERO_ITEMS.map(item => ({ ...item }))
    });
    setFullDescRich(EMPTY_RICH);
    setSideDesc1Rich(EMPTY_RICH);
    setSideDesc2Rich(EMPTY_RICH);
    setShowForm(true);
    clearFeedback();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const openEdit = (profile: SeniorProfile) => {
    setEditId(profile.id);
    let parsedHero = DEFAULT_HERO_ITEMS.map(item => ({ ...item }));
    try {
      if (profile.heroItems) {
        const tempHero = typeof profile.heroItems === 'string' ? JSON.parse(profile.heroItems) : profile.heroItems;
        if (Array.isArray(tempHero) && tempHero.length > 0) {
          parsedHero = tempHero;
        }
      }
    } catch (err) {
      console.error('Failed to parse hero items:', err);
    }

    setForm({
      name: profile.name,
      slug: profile.slug,
      position: profile.position,
      quality: profile.quality ?? '',
      description: profile.description ?? '',
      imageUrlDesktop: profile.imageUrlDesktop ?? '',
      imageUrlMobile: profile.imageUrlMobile ?? '',
      objectPos: profile.objectPos ?? 'object-center',
      linkedin: profile.linkedin ?? '#',
      order: profile.order,
      isActive: profile.isActive,
      heroItems: parsedHero,
    });

    setFullDescRich(toRichContent(profile.fullDescriptionHTML));
    setSideDesc1Rich(toRichContent(profile.sideDescription1HTML));
    setSideDesc2Rich(toRichContent(profile.sideDescription2HTML));
    setShowForm(true);
    clearFeedback();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const toggleStatus = async (profile: SeniorProfile) => {
    clearFeedback();
    try {
      await apiClient.patch(`/v1/admin/senior-profiles/${profile.id}`, { isActive: !profile.isActive });
      setSuccess(`Status for ${profile.name} updated successfully.`);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle visibility.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s profile? This action cannot be undone.`)) {
      return;
    }
    clearFeedback();
    try {
      await apiClient.delete(`/v1/admin/senior-profiles/${id}`);
      setSuccess('Profile deleted successfully.');
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    clearFeedback();

    // Validate hero items: exactly 3 must be selected
    const selectedCount = form.heroItems.filter((i: any) => i.selected).length;
    if (selectedCount !== 3) {
      setError('You must select exactly 3 items to show in the hero section.');
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      fullDescriptionHTML: fullDescRich.html || '',
      sideDescription1HTML: sideDesc1Rich.html || '',
      sideDescription2HTML: sideDesc2Rich.html || '',
    };

    try {
      if (editId) {
        await apiClient.patch(`/v1/admin/senior-profiles/${editId}`, payload);
        setSuccess('Profile updated successfully.');
      } else {
        await apiClient.post('/v1/admin/senior-profiles', payload);
        setSuccess('Profile added successfully.');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setFullDescRich(EMPTY_RICH);
      setSideDesc1Rich(EMPTY_RICH);
      setSideDesc2Rich(EMPTY_RICH);
      await fetchProfiles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save global leadership profile.');
    } finally {
      setSaving(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setFullDescRich(EMPTY_RICH);
    setSideDesc1Rich(EMPTY_RICH);
    setSideDesc2Rich(EMPTY_RICH);
    clearFeedback();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Leadership Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit, and arrange Global Leadership team profiles dynamically shown at <code>/about/global-leadership</code>.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            <FaPlus /> Add New Profile
          </button>
        )}
      </div>

      {/* Feedback Alerts */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* ── Form Section ── */}
      {showForm && (
        <div ref={formRef} className="mb-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 text-lg">
              {editId ? 'Edit Global Leadership Profile' : 'Add New Global Leadership Profile'}
            </h2>
            <button
              type="button"
              onClick={cancelForm}
              className="text-sm text-gray-500 hover:text-gray-700 font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Row 1: Name + Slug + Position */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. Dr Syed K I Bakht"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (URL Path) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. dr-sayed-k-i-bakht"
                  disabled={!!editId}
                />
                <p className="text-[10px] text-gray-400 mt-1">Unique URL identifier, e.g. <code>about2/profile/slug</code></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Position / Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. PRINCIPAL & FOUNDING CEO"
                />
              </div>
            </div>

            {/* Row 2: Badges/Qualities + LinkedIn + Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qualities/Badges <span className="text-gray-400 font-normal">(comma-separated list)</span></label>
                <input
                  type="text"
                  value={form.quality}
                  onChange={(e) => setForm({ ...form, quality: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. Higher Education Leader, Transnational Education Pioneer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="#"
                />
              </div>
            </div>

            {/* Row 3: Hero Description Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Description Paragraph <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Brief summary shown inside the black panel next to the photo..."
              />
            </div>

            {/* Row 4: Image Desktop and Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Desktop Feature Image <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.imageUrlDesktop}
                  onChange={(e) => setForm({ ...form, imageUrlDesktop: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary mb-2 bg-white"
                  placeholder="Paste desktop image URL or upload below..."
                />
                
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-brand-primary cursor-pointer transition-colors bg-white hover:bg-red-50/10 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                    disabled={uploadingDesktop}
                  />
                  {uploadingDesktop ? (
                    <div className="flex flex-col items-center space-y-1.5 py-1">
                      <div className="animate-spin w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full" />
                      <span className="text-xs font-semibold text-gray-500">Uploading to MinIO...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-center py-1">
                      <span className="text-xs font-semibold text-gray-700">Upload Desktop Feature Image (MinIO)</span>
                      <span className="text-[9px] text-gray-400">PNG, JPEG, JPG, WEBP</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Feature Image <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.imageUrlMobile}
                  onChange={(e) => setForm({ ...form, imageUrlMobile: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary mb-2 bg-white"
                  placeholder="Paste mobile image URL or upload below..."
                />
                
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-brand-primary cursor-pointer transition-colors bg-white hover:bg-red-50/10 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                    disabled={uploadingMobile}
                  />
                  {uploadingMobile ? (
                    <div className="flex flex-col items-center space-y-1.5 py-1">
                      <div className="animate-spin w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full" />
                      <span className="text-xs font-semibold text-gray-500">Uploading to MinIO...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-center py-1">
                      <span className="text-xs font-semibold text-gray-700">Upload Mobile Feature Image (MinIO)</span>
                      <span className="text-[9px] text-gray-400">PNG, JPEG, JPG, WEBP</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Previews */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                {form.imageUrlDesktop && (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      <Image src={form.imageUrlDesktop} alt="Desktop Preview" fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">Desktop Image Selected</p>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, imageUrlDesktop: '' }))}
                        className="mt-1 text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                {form.imageUrlMobile && (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      <Image src={form.imageUrlMobile} alt="Mobile Preview" fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">Mobile Image Selected</p>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, imageUrlMobile: '' }))}
                        className="mt-1 text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Hero grid items selection (Check exactly 3) */}
            <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-sm font-semibold text-gray-700">Hero Section Highlights <span className="text-red-500">*</span></span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${form.heroItems.filter((i: any) => i.selected).length === 3 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  Selected: {form.heroItems.filter((i: any) => i.selected).length} / 3
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {form.heroItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <input
                      type="checkbox"
                      id={`hero-item-${idx}`}
                      checked={item.selected}
                      onChange={(e) => {
                        const updated = [...form.heroItems];
                        updated[idx].selected = e.target.checked;
                        setForm({ ...form, heroItems: updated });
                      }}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`hero-item-${idx}`} className="block text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer mb-0.5">{item.label}</label>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const updated = [...form.heroItems];
                          updated[idx].value = e.target.value;
                          setForm({ ...form, heroItems: updated });
                        }}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-brand-primary focus:outline-none"
                        placeholder={`Value for ${item.label}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 6: Sort Order and Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order (Sort ascending)</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Card Photo Alignment (Crop positioning)</label>
                <select
                  value={form.objectPos}
                  onChange={(e) => setForm({ ...form, objectPos: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                >
                  <option value="object-center">Center (Default)</option>
                  <option value="object-top">Top (Recommend for vertical portraits)</option>
                  <option value="center 15%">Top-Center Offset (15% - recommended for Syed & Roksana)</option>
                  <option value="object-bottom">Bottom</option>
                </select>
              </div>

              <div className="flex items-center gap-3 h-full pt-6">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="flex items-center gap-2 text-sm font-semibold focus:outline-none"
                >
                  {form.isActive ? (
                    <FaToggleOn className="text-3xl text-green-500" />
                  ) : (
                    <FaToggleOff className="text-3xl text-gray-400" />
                  )}
                  <span className="text-gray-700">Profile Active / Visible on Live Website</span>
                </button>
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Rich Text Editor 1: Full Description Narrative */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Left Column Narrative (Full Description) <span className="text-red-500">*</span></label>
              <CourseRichEditor
                value={fullDescRich}
                onChange={setFullDescRich}
                placeholder="Write current role, qualifications, and detailed narrative sections..."
              />
            </div>

            {/* Rich Text Editor 2: Side Description 1 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Right Sidebar: Card 1 (Expertise Description) <span className="text-red-500">*</span></label>
              <CourseRichEditor
                value={sideDesc1Rich}
                onChange={setSideDesc1Rich}
                placeholder="Enter core areas of expertise or qualification bullets..."
              />
            </div>

            {/* Rich Text Editor 3: Side Description 2 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Right Sidebar: Card 2 (Perspective/Quote Box) <span className="text-red-500">*</span></label>
              <CourseRichEditor
                value={sideDesc2Rich}
                onChange={setSideDesc2Rich}
                placeholder="Enter highlight quotes, perspectives, or closing thoughts..."
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-bold flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Profile Table Listing ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl">
          <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full mb-3" />
          <span className="text-sm font-semibold text-gray-500">Loading profiles...</span>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
          <FaUser className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No profiles found</h3>
          <p className="text-sm text-gray-400 mt-1">Start by adding a global leadership profile.</p>
          <button
            onClick={openAdd}
            className="mt-4 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold inline-flex items-center gap-2"
          >
            <FaPlus /> Add New Profile
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold border-b border-gray-200">
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Photo</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">
                      {profile.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                        {profile.imageUrlDesktop ? (
                          <Image src={profile.imageUrlDesktop} alt={profile.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <FaUser />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {profile.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {profile.position}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {profile.slug}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(profile)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          profile.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(profile)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit profile"
                        >
                          <FaEdit className="text-base" />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id, profile.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete profile"
                        >
                          <FaTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
