'use client';

import { useState } from 'react';
import useAuth from '@/utils/useAuth';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: '/',
        redirect: true,
      });
    } catch (err) {
      setError(
        'This email may already be registered. Please try signing in instead.'
      );
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-[#F7F7F7] dark:bg-[#121212] flex items-center justify-center px-6"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[#111111] dark:text-white mb-2">
              Create an account
            </h1>
            <p className="text-[#6B6B6B] dark:text-[#B0B0B0]">
              Get started with your free account
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#404040] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#111111] dark:text-white mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D9D9DE] dark:border-[#404040] bg-white dark:bg-[#262626] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#111111] dark:text-white mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D9D9DE] dark:border-[#404040] bg-white dark:bg-[#262626] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent"
                  placeholder="At least 8 characters"
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#111111] dark:text-white mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D9D9DE] dark:border-[#404040] bg-white dark:bg-[#262626] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-[#8B70F6] hover:bg-[#7A5EE5] dark:bg-[#9D7DFF] dark:hover:bg-[#8B70F6] text-white font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B6B6B] dark:text-[#B0B0B0]">
                Already have an account?{' '}
                <a
                  href="/account/signin"
                  className="text-[#8B70F6] hover:text-[#7A5EE5] font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
