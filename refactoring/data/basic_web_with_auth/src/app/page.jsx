'use client';

import { useEffect } from 'react';
import { useUser } from '@/utils/useUser';
import { LogOut } from 'lucide-react';

export default function HomePage() {
  const { data: user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/account/signin';
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />

        <div
          className="min-h-screen bg-[#F7F7F7] dark:bg-[#121212] flex items-center justify-center"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E0E0E0] dark:border-[#404040] border-t-[#8B70F6]" />
            <p className="mt-4 text-[#6B6B6B] dark:text-[#B0B0B0]">
              Loading...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-[#F7F7F7] dark:bg-[#121212]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#E0E0E0] dark:border-[#404040]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-[#111111] dark:text-white">
              Dashboard
            </h1>
            <a
              href="/account/logout"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D9D9DE] dark:border-[#404040] bg-white dark:bg-[#262626] text-[#111111] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#333333] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#404040] p-8 mb-6">
            <h2 className="text-2xl font-semibold text-[#111111] dark:text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-[#6B6B6B] dark:text-[#B0B0B0]">
              You're signed in as{' '}
              <span className="font-medium text-[#111111] dark:text-white">
                {user.email}
              </span>
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#E0E0E0] dark:border-[#404040] p-8">
            <h3 className="text-lg font-semibold text-[#111111] dark:text-white mb-4">
              Your Account Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-[#E0E0E0] dark:border-[#404040]">
                <span className="text-[#6B6B6B] dark:text-[#B0B0B0]">
                  Email
                </span>
                <span className="font-medium text-[#111111] dark:text-white">
                  {user.email}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E0E0E0] dark:border-[#404040]">
                <span className="text-[#6B6B6B] dark:text-[#B0B0B0]">
                  User ID
                </span>
                <span className="font-medium text-[#111111] dark:text-white font-mono text-sm">
                  {user.id}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-[#6B6B6B] dark:text-[#B0B0B0]">
                  Status
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
