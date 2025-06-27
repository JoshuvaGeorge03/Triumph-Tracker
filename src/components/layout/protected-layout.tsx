'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './header';
import DashboardSkeleton from '../dashboard/dashboard-skeleton';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setIsAuthenticating(false);
      }
    } catch (error) {
        // If localStorage is not available (e.g. server-side or private browsing), redirect
        console.error('Could not access localStorage. Redirecting to login.');
        router.replace('/login');
    }
  }, [router]);

  if (isAuthenticating) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Render a simplified header or none at all for the loading state */}
            <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Simplified logo or placeholder */}
                </div>
            </header>
            <main className="flex-1 px-4 py-8">
                <DashboardSkeleton />
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
