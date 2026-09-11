'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CourseRichEditor, { type RichContent } from '@/components/admin/CourseRichEditor';
import {
  FaPlus, FaTrash, FaEdit, FaToggleOn, FaToggleOff,
  FaLinkedin, FaEnvelope, FaUser, FaGripVertical,
} from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';

const EMPTY_RICH: RichContent = { json: null, html: '' };

interface AcademicMember {
  id: string;
  name: string;
  designation: string;
  extensions: string | null;
  email: string | null;
  linkedIn: string | null;
  imageUrl: string | null;
  profile: string | null;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: '',
  designation: '',
  extensions: '',
  email: '',
  linkedIn: '',
  imageUrl: '',
  order: 0,
  isActive: true,
};

function parseProfile(raw: string | null | undefined): RichContent {
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

export default function AdminAcademicTeamPage() {
  const [members, setMembers] = useState<AcademicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [richProfile, setRichProfile] = useState<RichContent>(EMPTY_RICH);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfileImage(true);
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', 'academic-team');

    try {
      const data = await apiClient.upload<{ downloadUrl: string }>('/v1/files/upload', uploadData);
      setForm((prev) => ({ ...prev, imageUrl: data.downloadUrl }));
      setSuccess('Profile image uploaded successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload profile image.');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const formRef = useRef<HTMLDivElement>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<AcademicMember[]>('/v1/academic-team?all=1');
      setMembers(Array.isArray(data) ? data.sort((a: AcademicMember, b: AcademicMember) => a.order - b.order) : []);
    } catch {
      setError('Failed to load academic team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const clearFeedback = () => { setError(''); setSuccess(''); };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, order: members.length + 1 });
    setRichProfile(EMPTY_RICH);
    setShowForm(true);
    clearFeedback();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const openEdit = (member: AcademicMember) => {
    setEditId(member.id);
    setForm({
      name: member.name,
      designation: member.designation,
      extensions: member.extensions ?? '',
      email: member.email ?? '',
      linkedIn: member.linkedIn ?? '',
      imageUrl: member.imageUrl ?? '',
      order: member.order,
      isActive: member.isActive,
    });
    setRichProfile(parseProfile(member.profile));
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
      extensions: form.extensions || null,
      email: form.email || null,
      linkedIn: form.linkedIn || null,
      imageUrl: form.imageUrl || null,
      profile: richProfile,
    };

    try {
      if (editId) {
        await apiClient.patch(`/v1/academic-team/${editId}`, payload);
        setSuccess('Member updated successfully.');
      } else {
        await apiClient.post('/v1/academic-team', payload);
        setSuccess('Member added successfully.');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setRichProfile(EMPTY_RICH);
      await fetchMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this academic team member? This cannot be undone.')) return;
    clearFeedback();
    try {
      await apiClient.delete(`/v1/academic-team/${id}`);
      setSuccess('Member deleted.');
      await fetchMembers();
    } catch {
      setError('Failed to delete member.');
    }
  };

  const handleToggle = async (member: AcademicMember) => {
    clearFeedback();
    try {
      await apiClient.patch(`/v1/academic-team/${member.id}`, { isActive: !member.isActive });
      await fetchMembers();
    } catch {
      setError('Failed to toggle visibility.');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setRichProfile(EMPTY_RICH);
    clearFeedback();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage lecturer profiles shown on the public <strong>Academic Team</strong> page under About.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
        >
          <FaPlus /> Add Member
        </button>
      </div>

      {/* Feedback */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div ref={formRef} className="mb-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-800 text-lg">
              {editId ? 'Edit Member' : 'Add New Member'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Row 1: Name + Extensions + Designation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. Dr. John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extensions <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  value={form.extensions}
                  onChange={(e) => setForm({ ...form, extensions: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. PhD, Ed.D, MBA, FHEA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="e.g. Senior Lecturer"
                />
              </div>
            </div>

            {/* Row 2: Email + LinkedIn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="lecturer@progemini.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={form.linkedIn}
                  onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            {/* Row 3: Image URL and Upload options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option 1: Profile Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl || ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="https://res.cloudinary.com/..."
                />
                <p className="text-xs text-gray-400 mt-1">Direct link to an externally hosted image.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option 2: Direct File Upload (MinIO)</label>
                <div className="flex flex-col space-y-2">
                  <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-brand-primary cursor-pointer transition-colors bg-white hover:bg-red-50/10 group">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      disabled={uploadingProfileImage}
                    />
                    {uploadingProfileImage ? (
                      <div className="flex flex-col items-center space-y-1.5 py-1">
                        <div className="animate-spin w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full" />
                        <span className="text-xs font-semibold text-gray-500">Uploading to MinIO...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1 text-center py-1">
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">Click to upload photo</span>
                        <span className="text-[9px] text-gray-400">PNG, JPEG, JPG, WEBP (Max 10MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {form.imageUrl && (
                <div className="col-span-1 md:col-span-2 flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                    <Image src={form.imageUrl} alt="Profile Preview" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">Selected Profile Image:</p>
                    <p className="text-[11px] text-gray-500 font-mono break-all mt-0.5 truncate">{form.imageUrl}</p>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="mt-1 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                    >
                      Clear Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Row 4: Order + Active */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.order}
                  min={0}
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
                <label htmlFor="isActiveForm" className="text-sm text-gray-700">Active (visible on public site)</label>
              </div>
            </div>

            {/* Row 5: Rich Profile Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Described Profile <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Write a detailed biography, academic background, and expertise. This appears in the lecturer's detail popup on the public site.
              </p>
              <CourseRichEditor
                value={richProfile}
                onChange={setRichProfile}
                placeholder="Dr. Smith is a distinguished academic with over 15 years of experience in..."
                minHeight="min-h-[200px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving…' : editId ? 'Update Member' : 'Save Member'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Members List ── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-3" />
          Loading members…
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <FaUser className="mx-auto text-4xl mb-3 opacity-30" />
          <p className="font-medium">No academic team members yet.</p>
          <p className="text-sm mt-1">Click <span className="font-semibold text-brand-primary">Add Member</span> to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className={`flex gap-4 items-center bg-white border rounded-xl p-4 shadow-sm transition-all ${
                member.isActive ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              {/* Drag handle placeholder */}
              <FaGripVertical className="text-gray-300 flex-shrink-0 text-lg" />

              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                {member.imageUrl ? (
                  <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FaUser className="text-2xl" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">
                  {member.name}
                  {member.extensions && (
                    <span className="text-xs text-gray-500 font-normal ml-1.5">
                      ({member.extensions})
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{member.designation}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {member.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FaEnvelope className="text-[10px]" /> {member.email}
                    </span>
                  )}
                  {member.linkedIn && (
                    <span className="flex items-center gap-1 text-xs text-blue-400">
                      <FaLinkedin className="text-[10px]" /> LinkedIn
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {member.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-xs text-gray-400">Order: {member.order}</span>
                  {member.profile && (
                    <span className="text-xs text-brand-primary bg-red-50 px-2 py-0.5 rounded-full">
                      Has Profile
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(member)}
                  title={member.isActive ? 'Hide from public site' : 'Show on public site'}
                  className="text-gray-400 hover:text-brand-primary transition-colors text-xl"
                >
                  {member.isActive ? <FaToggleOn className="text-brand-primary" /> : <FaToggleOff />}
                </button>
                <button
                  onClick={() => openEdit(member)}
                  title="Edit member"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  title="Delete member"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
