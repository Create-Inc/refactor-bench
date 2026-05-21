'use client';

import { useState } from 'react';
import useAuth from '@/utils/useAuth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: '/',
        redirect: true,
      });
    } catch (err) {
      setError('Incorrect email or password. Please try again.');
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
              Welcome back
            </h1>
            <p className="text-[#6B6B6B] dark:text-[#B0B0B0]">
              Sign in to your account
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
                  placeholder="Enter your password"
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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6B6B6B] dark:text-[#B0B0B0]">
                Don't have an account?{' '}
                <a
                  href="/account/signup"
                  className="text-[#8B70F6] hover:text-[#7A5EE5] font-medium"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
