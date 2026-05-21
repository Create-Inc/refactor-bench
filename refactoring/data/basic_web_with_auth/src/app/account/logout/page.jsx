'use client';

import { useEffect } from 'react';
import useAuth from '@/utils/useAuth';

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      await signOut({
        callbackUrl: '/account/signin',
        redirect: true,
      });
    };
    performLogout();
  }, [signOut]);

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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#E0E0E0] dark:border-[#404040] border-t-[#8B70F6]" />
          <p className="mt-4 text-[#6B6B6B] dark:text-[#B0B0B0]">
            Signing out...
          </p>
        </div>
      </div>
    </>
  );
}
