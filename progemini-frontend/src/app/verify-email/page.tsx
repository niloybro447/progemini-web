'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { apiClient } from '@/lib/apiClient';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification request. Missing token.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const data = await apiClient.post<{ message: string }>('/v1/auth/verify-email', { token });
        setStatus('success');
        setMessage(data.message || 'Your email has been successfully verified!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <FaSpinner className="animate-spin text-brand-primary text-5xl mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Verifying Email</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto text-center flex justify-center" />
          <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
          <p className="text-gray-600">{message}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-primary w-full inline-block text-center font-semibold py-2.5 rounded-lg bg-brand-primary text-white hover:bg-opacity-95"
            >
              Go to Login
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <FaExclamationCircle className="text-red-500 text-5xl mx-auto text-center flex justify-center" />
          <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
          <p className="text-red-600 font-medium">{message}</p>
          <p className="text-sm text-gray-500">
            If this link has expired, you might need to register again or contact support.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/signup"
              className="btn-primary w-full inline-block text-center font-semibold py-2.5 rounded-lg bg-brand-primary text-white hover:bg-opacity-95"
            >
              Sign Up Again
            </Link>
            <Link
              href="/contact"
              className="text-sm text-brand-primary hover:underline font-semibold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <h2 className="mt-6 text-3xl font-bold text-white">Email Verification</h2>
          <p className="mt-2 text-gray-400">ProGemini Learning Management System</p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-xl p-8 text-center space-y-4">
            <FaSpinner className="animate-spin text-brand-primary text-5xl mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">Loading</h2>
            <p className="text-gray-600">Please wait while the page initializes...</p>
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
