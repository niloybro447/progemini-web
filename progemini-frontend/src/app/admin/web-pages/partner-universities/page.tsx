'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CourseRichEditor, { type RichContent } from '@/components/admin/CourseRichEditor';
import {
  FaPlus, FaTrash, FaEdit, FaToggleOn, FaToggleOff,
  FaGlobe, FaUniversity, FaGripVertical,
} from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';

const EMPTY_RICH: RichContent = { json: null, html: '' };

interface PartnerUniversity {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  order: 0,
  isActive: true,
};

function parseDescription(raw: string | null | undefined): RichContent {
  if (!raw) return EMPTY_RICH;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.json !== undefined || parsed.html !== undefined)) {
      return { json: parsed.json ?? null, html: typeof parsed.html === 'string' ? parsed.html : '' };
    }
    return EMPTY_RICH;
  } catch {
    return { json: null, html: raw };
  }
}

export default function AdminPartnerUniversitiesPage() {
  const [partners, setPartners] = useState<PartnerUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [richDescription, setRichDescription] = useState<RichContent>(EMPTY_RICH);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', 'partner-universities');

    try {
      const data = await apiClient.upload<{ downloadUrl: string }>('/v1/files/upload', uploadData);
      setForm((prev) => ({ ...prev, logoUrl: data.downloadUrl }));
      setSuccess('Logo uploaded successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const formRef = useRef<HTMLDivElement>(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<PartnerUniversity[]>('/v1/partner-universities?all=1');
      setPartners(Array.isArray(data) ? data.sort((a: PartnerUniversity, b: PartnerUniversity) => a.order - b.order) : []);
    } catch {
      setError('Failed to load partner universities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const clearFeedback = () => { setError(''); setSuccess(''); };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, order: partners.length + 1 });
    setRichDescription(EMPTY_RICH);
    setShowForm(true);
    clearFeedback();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const openEdit = (partner: PartnerUniversity) => {
    setEditId(partner.id);
    setForm({
      name: partner.name,
      logoUrl: partner.logoUrl ?? '',
      websiteUrl: partner.websiteUrl ?? '',
      order: partner.order,
      isActive: partner.isActive,
    });
    setRichDescription(parseDescription(partner.description));
    setShowForm(true);
    clearFeedback();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    clearFeedback();

    const payload = {
      ...form,
      logoUrl: form.logoUrl || null,
      websiteUrl: form.websiteUrl || null,
      description: richDescription,
    };

    try {
      if (editId) {
        await apiClient.patch(`/v1/partner-universities/${editId}`, payload);
        setSuccess('Partner university updated successfully.');
      } else {
        await apiClient.post('/v1/partner-universities', payload);
        setSuccess('Partner university added successfully.');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setRichDescription(EMPTY_RICH);
      await fetchPartners();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save partner university.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner university? This cannot be undone.')) return;
    clearFeedback();
    try {
      await apiClient.delete(`/v1/partner-universities/${id}`);
      setSuccess('Partner university deleted.');
      await fetchPartners();
    } catch {
      setError('Failed to delete partner university.');
    }
  };

  const handleToggle = async (partner: PartnerUniversity) => {
    clearFeedback();
    const updatedStatus = !partner.isActive;
    try {
      await apiClient.patch(`/v1/partner-universities/${partner.id}`, { isActive: updatedStatus });
      setPartners((prev) =>
        prev
          .map((m) => (m.id === partner.id ? { ...m, isActive: updatedStatus } : m))
          .sort((a, b) => a.order - b.order)
      );
      setSuccess(`${partner.name} status updated.`);
    } catch {
      setError('Failed to toggle status.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaUniversity className="text-brand-primary" /> Global Partner Universities
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the international partner universities displayed on the public website.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-lg hover:bg-opacity-95 font-semibold transition-colors"
          >
            <FaPlus size={14} /> Add Partner University
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium border border-green-200">
          {success}
        </div>
      )}

      {/* Editor Form */}
      {showForm && (
        <div ref={formRef} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              {editId ? 'Edit Partner University' : 'Add New Partner University'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setRichDescription(EMPTY_RICH); }}
              className="text-gray-500 hover:text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  University Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Harvard University"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://example.edu"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Sort Order
                </label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="flex items-center mt-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className="text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-2"
                  >
                    {form.isActive ? (
                      <FaToggleOn className="text-3xl text-green-600" />
                    ) : (
                      <FaToggleOff className="text-3xl text-gray-400" />
                    )}
                    <span className="text-sm font-medium">{form.isActive ? 'Active (Displayed)' : 'Inactive (Hidden)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Logo Image Upload */}
            <div className="border-t pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University Logo
              </label>
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 border rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.logoUrl ? (
                    <Image src={form.logoUrl} alt="Logo preview" fill className="object-contain p-2" />
                  ) : (
                    <FaUniversity className="text-3xl text-gray-300" />
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="partner-logo-upload"
                  />
                  <label
                    htmlFor="partner-logo-upload"
                    className="inline-block bg-white border border-gray-300 rounded-lg px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {uploadingLogo ? 'Uploading...' : 'Choose File'}
                  </label>
                  <p className="text-xs text-gray-400">
                    Recommended dimensions: 300x300px. PNG, JPG or WebP format. Max file size: 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Description (TipTap Editor) */}
            <div className="border-t pt-6 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Detailed Description (Rich Text Editor)
              </label>
              <div className="border rounded-lg bg-white overflow-hidden">
                <CourseRichEditor
                  value={richDescription}
                  onChange={setRichDescription}
                  placeholder="Provide background, programs offered, details of collaboration..."
                />
              </div>
            </div>

            <div className="border-t pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setRichDescription(EMPTY_RICH); }}
                className="bg-white border rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-primary text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-opacity-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save University'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Partners List */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-gray-50 font-bold text-gray-800">
          Partner Universities List ({partners.length})
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading partner universities...</div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm italic">
            No partner universities added yet. Click &quot;Add Partner University&quot; above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100/70 border-b text-gray-600 font-semibold">
                  <th className="p-4 w-12 text-center">Order</th>
                  <th className="p-4">Logo</th>
                  <th className="p-4">University Name</th>
                  <th className="p-4">Website</th>
                  <th className="p-4 w-24 text-center">Status</th>
                  <th className="p-4 w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center text-gray-500 font-medium">
                      <div className="flex items-center justify-center gap-1.5">
                        <FaGripVertical className="text-gray-300" />
                        {partner.order}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative w-12 h-12 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                        {partner.logoUrl ? (
                          <Image src={partner.logoUrl} alt={partner.name} fill className="object-contain p-1" />
                        ) : (
                          <FaUniversity className="text-lg text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">{partner.name}</td>
                    <td className="p-4 text-gray-500">
                      {partner.websiteUrl ? (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-primary hover:underline text-xs"
                        >
                          <FaGlobe /> Website
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Not Provided</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(partner)}
                        title={partner.isActive ? 'Mark Inactive' : 'Mark Active'}
                        className="transition-transform hover:scale-105"
                      >
                        {partner.isActive ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">Active</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-semibold">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(partner)}
                          className="p-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Partner"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Partner"
                        >
                          <FaTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
