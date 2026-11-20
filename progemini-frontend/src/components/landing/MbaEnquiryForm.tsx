"use client";

import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

interface MbaEnquiryFormProps {
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

export default function MbaEnquiryForm({
  variant = 'standalone',
  className = '',
}: MbaEnquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+44',
    phone: '',
    highestQualification: "Bachelor's Degree (Honours / UK 2:2 or above / Equivalent)",
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
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);

    try {
      const formattedMessage = [
        `Highest Qualification: ${formData.highestQualification}`,
        `Preferred Start Time: ${formData.preferredStartTime}`,
        '',
        'MBA Enquiry / Candidate Notes:',
        formData.question.trim() || 'Candidate requested MBA prospectus, fee schedule, and intake timetable.',
      ].join('\n');

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode} ${formData.phone.trim()}`,
        country: formData.countryCode,
        submitterType: 'Student',
        enquiryType: 'About a Course',
        courseName: 'Master of Business Administration (MBA)',
        message: formattedMessage,
      };

      await apiClient.post('/v1/enquiries', payload);

      setSubmitted(true);
      toast.success('MBA enquiry submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-white p-8 text-center shadow-lg ${className}`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <FaCheckCircle className="text-2xl" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
          Enquiry Received Successfully
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
          Thank you, <strong className="text-gray-900">{formData.fullName}</strong>. Your MBA enquiry has been registered with the Progemini Academic Admissions Board.
        </p>
        <div className="rounded-xl bg-white border border-emerald-100 p-4 text-xs text-gray-700 max-w-md mx-auto space-y-2 mb-6 text-left">
          <div className="flex justify-between">
            <span className="text-gray-500">Target Programme:</span>
            <span className="font-bold text-gray-900">Master of Business Administration (MBA)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact Email:</span>
            <span className="font-semibold text-gray-900">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Next Step:</span>
            <span className="font-semibold text-emerald-700">Admissions & Eligibility Review</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          An admissions advisor will contact you within 24 hours with the programme prospectus, module schedule, and tuition fees.
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
              highestQualification: "Bachelor's Degree (Honours / UK 2:2 or above / Equivalent)",
              preferredStartTime: 'Immediate / Next Cohort Intake',
              question: '',
            });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
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
      className={`rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-xl ${className}`}
    >
      <div className="mb-6">
        <span className="inline-block rounded-md bg-red-50 border border-red-100 px-2.5 py-1 text-[11px] font-bold text-brand-primary mb-2.5 tracking-wide">
          Direct Admissions Channel
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          {isHero ? 'Register Your MBA Interest' : 'Submit Your MBA Enquiry'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Receive personal eligibility feedback, syllabus breakdown, timetable options, and scholarship details from our UK MBA Admissions Team.
        </p>
      </div>

      <div className={isHero ? "space-y-4" : "space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4"}>
        {/* Full Name */}
        <div className={isHero ? "" : "sm:col-span-2"}>
          <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Alexander Wright"
            required
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
          />
        </div>

        {/* Email Address */}
        <div className="min-w-0">
          <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. alexander@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
          />
        </div>

        {/* Phone with Country Code */}
        <div className="min-w-0">
          <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 min-w-0 w-full">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              aria-label="Country Code"
              className="w-28 sm:w-32 flex-shrink-0 rounded-lg border border-gray-300 bg-gray-50/80 px-2.5 py-2.5 text-xs text-gray-800 font-medium focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
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
              placeholder="Phone number"
              required
              className="flex-1 min-w-0 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Highest Qualification (Tailored for MBA) */}
        <div className="min-w-0">
          <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
            Highest Qualification <span className="text-red-500">*</span>
          </label>
          <select
            name="highestQualification"
            value={formData.highestQualification}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 font-normal"
          >
            <option value="Bachelor's Degree (Honours / UK 2:2 or above / Equivalent)">Bachelor's Degree (Honours / Equivalent)</option>
            <option value="Level 6 Graduate Diploma / Professional Certificate">Level 6 Graduate Diploma / Professional Certificate</option>
            <option value="Higher National Diploma (HND) / Level 5 Diploma">Higher National Diploma (HND) / Level 5 Diploma</option>
            <option value="Master's Degree or Postgraduate Qualification">Master's Degree or Postgraduate Qualification</option>
            <option value="Mature Student / Substantial Work Experience (Non-degree route)">Mature Student / Substantial Work Experience</option>
            <option value="Other Qualification">Other Qualification</option>
          </select>
        </div>

        {/* Preferred Start Time */}
        <div className="min-w-0">
          <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
            Preferred Start Date <span className="text-red-500">*</span>
          </label>
          <select
            name="preferredStartTime"
            value={formData.preferredStartTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 font-normal"
          >
            <option value="Immediate / Next Cohort Intake">Immediate / Next Cohort Intake</option>
            <option value="Within 1-3 Months">Within 1–3 Months</option>
            <option value="Within 3-6 Months">Within 3–6 Months</option>
            <option value="Exploring Options for Later">Exploring Options for Later</option>
          </select>
        </div>

        {/* Message / Enquiry / Question */}
        <div className={isHero ? "min-w-0" : "sm:col-span-2 min-w-0"}>
          <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
            Questions / Career Goals <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <textarea
            name="question"
            rows={3}
            value={formData.question}
            onChange={handleChange}
            placeholder="Share your career goals or any questions regarding scholarships, study timetable, and assessment..."
            className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-primary py-3.5 px-6 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin text-base" />
              <span>Submitting Your Enquiry...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="text-xs" />
              <span>Request MBA Prospectus & Callback</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          🔒 Confidential. Directly delivered to the Progemini Academic Admissions Board.
        </p>
      </div>
    </form>
  );
}
