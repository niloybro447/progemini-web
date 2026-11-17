"use client";

import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner, FaCheckCircle, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaCommentDots } from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

interface DoctoralEnquiryFormProps {
  variant?: 'hero' | 'standalone';
  className?: string;
}

const COUNTRY_CODES = [
  { code: '+44', country: 'UK (+44)' },
  { code: '+1', country: 'US / CA (+1)' },
  { code: '+971', country: 'UAE (+971)' },
  { code: '+966', country: 'Saudi Arabia (+966)' },
  { code: '+974', country: 'Qatar (+974)' },
  { code: '+965', country: 'Kuwait (+965)' },
  { code: '+968', country: 'Oman (+968)' },
  { code: '+973', country: 'Bahrain (+973)' },
  { code: '+234', country: 'Nigeria (+234)' },
  { code: '+233', country: 'Ghana (+233)' },
  { code: '+254', country: 'Kenya (+254)' },
  { code: '+27', country: 'South Africa (+27)' },
  { code: '+91', country: 'India (+91)' },
  { code: '+92', country: 'Pakistan (+92)' },
  { code: '+880', country: 'Bangladesh (+880)' },
  { code: '+65', country: 'Singapore (+65)' },
  { code: '+60', country: 'Malaysia (+60)' },
  { code: '+61', country: 'Australia (+61)' },
  { code: '+353', country: 'Ireland (+353)' },
  { code: '+49', country: 'Germany (+49)' },
  { code: '+33', country: 'France (+33)' },
  { code: '+39', country: 'Italy (+39)' },
  { code: '+34', country: 'Spain (+34)' },
  { code: '+41', country: 'Switzerland (+41)' },
  { code: '+31', country: 'Netherlands (+31)' },
  { code: '+90', country: 'Turkey (+90)' },
  { code: '+86', country: 'China (+86)' },
  { code: '+81', country: 'Japan (+81)' },
  { code: '+82', country: 'South Korea (+82)' },
  { code: '+55', country: 'Brazil (+55)' },
];

export default function DoctoralEnquiryForm({
  variant = 'standalone',
  className = '',
}: DoctoralEnquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+44',
    phone: '',
    highestQualification: 'Master\'s Degree (MBA / MSc / MA)',
    professionalExperience: '5-10 Years (Senior Manager / Consultant)',
    preferredStartTime: 'Immediate / Next Cohort Intake',
    question: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please provide a valid email address');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number with country code');
      return;
    }

    setLoading(true);

    try {
      const formattedMessage = [
        `Highest Qualification: ${formData.highestQualification}`,
        `Professional Experience: ${formData.professionalExperience}`,
        `Preferred Start Time: ${formData.preferredStartTime}`,
        '',
        'Doctoral Enquiry / Question / Research Area:',
        formData.question.trim() || 'Candidate requested detailed doctoral prospectus and fee schedule.',
      ].join('\n');

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode} ${formData.phone.trim()}`,
        country: formData.countryCode,
        submitterType: 'Student',
        enquiryType: 'About a Course',
        courseName: 'Doctoral Programmes (DBA / PhD)',
        message: formattedMessage,
      };

      await apiClient.post('/v1/enquiries', payload);

      setSubmitted(true);
      toast.success('Doctoral enquiry submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white p-8 text-center shadow-lg ${className}`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <FaCheckCircle className="text-3xl" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          Enquiry Received Successfully!
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
          Thank you, <strong className="text-gray-900">{formData.fullName}</strong>. Your doctoral enquiry has been registered directly with the Progemini Academic Admissions Board.
        </p>
        <div className="rounded-2xl bg-white border border-emerald-100 p-4 text-xs text-gray-700 max-w-md mx-auto space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Target Programme:</span>
            <span className="font-bold text-gray-900">Doctoral Programmes (DBA / PhD)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact Email:</span>
            <span className="font-semibold text-gray-900">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Next Step:</span>
            <span className="font-semibold text-emerald-700">Supervisor & Eligibility Review</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          An admissions advisor will contact you within 24 hours with the programme prospectus and fee schedule.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({
              fullName: '',
              email: '',
              countryCode: '+44',
              phone: '',
              highestQualification: 'Master\'s Degree (MBA / MSc / MA)',
              professionalExperience: '5-10 Years (Senior Manager / Consultant)',
              preferredStartTime: 'Immediate / Next Cohort Intake',
              question: '',
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-xl ${className}`}
    >
      <div className="mb-6">
        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-primary mb-2">
          Direct Admissions Channel
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          {isHero ? 'Register Your Doctoral Interest' : 'Submit Your Doctoral Enquiry'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Get personal eligibility feedback, syllabus breakdown, and tuition schedule from our UK Doctoral Admissions Team.
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FaUser className="text-gray-400 text-xs" /> Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Dr. / Mr. / Ms. Alexander Wright"
            required
            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>

        {/* Email & Phone in 2-col on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FaEnvelope className="text-gray-400 text-xs" /> Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
            />
          </div>

          {/* Phone Number with Country Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FaPhone className="text-gray-400 text-xs" /> Phone with Country Code <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-28 rounded-xl border border-gray-300 bg-gray-50 px-2.5 py-2.5 text-xs text-gray-800 font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="7123 456789"
                required
                className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Highest Qualification & Professional Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FaGraduationCap className="text-gray-400 text-xs" /> Highest Qualification <span className="text-red-500">*</span>
            </label>
            <select
              name="highestQualification"
              value={formData.highestQualification}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
            >
              <option value="Master's Degree (MBA / MSc / MA)">Master's Degree (MBA / MSc / MA / MPhil)</option>
              <option value="Postgraduate Diploma (Level 7 / Executive)">Postgraduate Diploma (Level 7 / Executive)</option>
              <option value="Bachelor's Degree with Honours">Bachelor's Degree (Hons)</option>
              <option value="Senior Executive / Professional Certification">Senior Executive / Professional Fellow</option>
              <option value="Other Qualification">Other Qualification</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FaBriefcase className="text-gray-400 text-xs" /> Professional Experience <span className="text-red-500">*</span>
            </label>
            <select
              name="professionalExperience"
              value={formData.professionalExperience}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
            >
              <option value="3-5 Years (Mid-level Management)">3–5 Years (Managerial Experience)</option>
              <option value="5-10 Years (Senior Manager / Consultant)">5–10 Years (Senior Management / Consultant)</option>
              <option value="10-15 Years (Director / Business Head)">10–15 Years (Director / Business Head)</option>
              <option value="15+ Years (Executive / C-Suite / Founder)">15+ Years (Executive / C-Suite / Founder)</option>
            </select>
          </div>
        </div>

        {/* Preferred Start Time */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FaCalendarAlt className="text-gray-400 text-xs" /> Preferred Start Time <span className="text-red-500">*</span>
          </label>
          <select
            name="preferredStartTime"
            value={formData.preferredStartTime}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
          >
            <option value="Immediate / Next Cohort Intake">Immediate / Next Cohort Intake</option>
            <option value="Within 1-3 Months">Within 1–3 Months</option>
            <option value="Within 3-6 Months">Within 3–6 Months</option>
            <option value="Exploring Options for Later">Exploring Options for Later</option>
          </select>
        </div>

        {/* Message / Enquiry / Question */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FaCommentDots className="text-gray-400 text-xs" /> Message / Proposed Research Topic / Questions
          </label>
          <textarea
            name="question"
            rows={3}
            value={formData.question}
            onChange={handleChange}
            placeholder="Tell us about your target research domain (e.g. Strategic Management, Leadership, Supply Chain, AI Transformation) or any questions regarding fees and supervision..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-primary py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-brand-primary/25 hover:bg-red-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin text-base" />
              <span>Submitting Your Enquiry...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="text-xs" />
              <span>Request Doctoral Prospectus & Callback</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          🔒 Your information is confidential. Directly delivered to the Progemini Academic Admissions Board.
        </p>
      </div>
    </form>
  );
}
