'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaUser, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getSession, signIn, useSession } from 'next-auth/react';
import { getDashboardPath, normalizeEmail, sanitizeCallbackPath } from '@/lib/authNavigation';
import { apiClient } from '@/lib/apiClient';

function SignupForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeCallbackUrl = sanitizeCallbackPath(searchParams.get('callbackUrl'), '/student');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(getDashboardPath(session?.user?.role));
    }
  }, [status, session, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password validation rules
  const validatePasswordStrength = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    setPasswordErrors(errors);
  };

  const waitForSession = async () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const nextSession = await getSession();

      if (nextSession?.user?.role) {
        return nextSession;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = normalizeEmail(formData.email);
    const password = formData.password;
    
    if (!name) {
      toast.error('Full name is required');
      return;
    }

    if (name.length < 2) {
      toast.error('Full name must be at least 2 characters');
      return;
    }

    if (password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/v1/auth/signup', {
        name,
        email,
        password,
      });

      toast.success('Account created successfully! Please verify your email.');
      setIsRegistered(true);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.');
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
          <h2 className="mt-6 text-3xl font-bold text-white">Create Your Account</h2>
          <p className="mt-2 text-gray-400">Start your learning journey today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {!isRegistered ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field pl-10 w-full rounded-md border border-gray-300 py-2 focus:border-brand-primary focus:ring-brand-primary"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field pl-10 w-full rounded-md border border-gray-300 py-2 focus:border-brand-primary focus:ring-brand-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
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
                    Confirm Password
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

                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-brand-primary hover:text-red-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-brand-primary hover:text-red-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center bg-brand-primary text-white py-2.5 rounded-lg font-semibold hover:bg-opacity-95"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-primary hover:text-red-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <FaEnvelope className="text-brand-primary text-5xl mx-auto flex justify-center text-center" />
              <h3 className="text-xl font-bold text-gray-800">Verify Your Email</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We have sent a secure verification link to <strong className="text-gray-900">{formData.email}</strong>. 
                Please check your inbox and click the link to activate your account.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="btn-primary w-full inline-block text-center font-semibold py-2.5 rounded-lg bg-brand-primary text-white hover:bg-opacity-95"
                >
                  Return to Sign In
                </Link>
                <button
                  onClick={() => {
                    setIsRegistered(false);
                    setFormData({ ...formData, password: '', confirmPassword: '' });
                  }}
                  className="text-sm text-brand-primary hover:underline font-semibold"
                >
                  Back to Registration
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-gray-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
