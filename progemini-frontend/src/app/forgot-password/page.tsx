'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaSpinner, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/v1/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Reset link sent!');
    } catch (err: any) {
      toast.error(err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <Image
              src="/logo.png"
              alt="ProGemini Logo"
              width={150}
              height={80}
              className="h-16 w-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">Request a link to change your password</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-gray-600">
                Enter your email address below, and we will send you a secure link to reset your password.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 w-full rounded-md border border-gray-300 py-2 focus:border-brand-primary focus:ring-brand-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center bg-brand-primary text-white py-2.5 rounded-lg font-semibold hover:bg-opacity-95"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-red-700 font-semibold"
                >
                  <FaArrowLeft className="text-xs" /> Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto flex justify-center text-center" />
              <h3 className="text-xl font-bold text-gray-800">Check Your Email</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                If an account exists with email <strong className="text-gray-900">{email}</strong>, we have sent a secure password reset link. Please check your inbox and spam folder.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="btn-primary w-full inline-block text-center font-semibold py-2.5 rounded-lg bg-brand-primary text-white hover:bg-opacity-95"
                >
                  Return to Login
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm text-brand-primary hover:underline font-semibold"
                >
                  Try another email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
