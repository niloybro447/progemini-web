'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const validatePasswordStrength = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    setPasswordErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing from URL.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error('Password does not meet complexity requirements.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/v1/auth/reset-password', { token, password: formData.password });
      setIsSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Invalid Link</h2>
        <p className="text-red-500 font-semibold text-center flex justify-center">The password reset token is missing.</p>
        <Link
          href="/forgot-password"
          className="btn-primary w-full inline-block text-center font-semibold bg-brand-primary text-white py-2 rounded-lg"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-gray-600">
            Create a secure, strong new password for your ProGemini Academy account.
          </p>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  validatePasswordStrength(e.target.value);
                }}
                className="input-field pl-10 w-full rounded-md border border-gray-300 py-2 focus:border-brand-primary focus:ring-brand-primary"
                placeholder="••••••••"
              />
            </div>
            {formData.password && passwordErrors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <p className="font-semibold mb-1">Password must include:</p>
                <ul className="list-disc list-inside space-y-1">
                  {passwordErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.password && passwordErrors.length === 0 && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                ✓ Password meets requirements
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-field pl-10 w-full rounded-md border border-gray-300 py-2 focus:border-brand-primary focus:ring-brand-primary"
                placeholder="••••••••"
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
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6 text-center">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto flex justify-center text-center" />
          <h3 className="text-xl font-bold text-gray-800">Password Changed!</h3>
          <p className="text-sm text-gray-600">
            Your password has been successfully updated. You can now log in using your new credentials.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-primary w-full inline-block text-center font-semibold py-2.5 rounded-lg bg-brand-primary text-white hover:bg-opacity-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <h2 className="mt-6 text-3xl font-bold text-white">Create New Password</h2>
          <p className="mt-2 text-gray-400">Choose a new, strong password</p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-xl p-8 text-center space-y-4">
            <FaSpinner className="animate-spin text-brand-primary text-5xl mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">Loading</h2>
            <p className="text-gray-600">Please wait while the page initializes...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
