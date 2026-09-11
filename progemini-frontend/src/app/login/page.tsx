'use client';

import { useState, useEffect } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getDashboardPath, normalizeEmail } from '@/lib/authNavigation';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(getDashboardPath(session?.user?.role));
    }
  }, [status, session, router]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
    setIsLoading(true);

    const email = normalizeEmail(formData.email);
    const password = formData.password;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error('[LOGIN] Sign in error:', result.error);
        toast.error(result.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      if (!result?.ok) {
        console.error('[LOGIN] Sign in failed:', result);
        toast.error('Sign in failed. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('[LOGIN] Sign in successful, resolving session...');
      toast.success('Welcome back!');

      const resolvedSession = await waitForSession();
      if (!resolvedSession?.user?.role) {
        throw new Error('Signed in, but session is not ready yet. Please try once more.');
      }

      router.replace(getDashboardPath(resolvedSession.user.role));
      router.refresh();
    } catch (error) {
      console.error('[LOGIN] Unexpected error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-6 md:absolute md:bottom-full md:left-0 md:right-0 md:mb-8 pt-8">
          <Link href="/" className="inline-flex justify-center">
            <Image
              src="/progemini-logo-white.png"
              alt="ProGemini Logo"
              width={150}
              height={80}
              className="h-30 w-auto"
            />
          </Link>
          <h2 className="mt-2 text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="input-field pl-10"
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-brand-primary hover:text-red-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-brand-primary hover:text-red-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
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
