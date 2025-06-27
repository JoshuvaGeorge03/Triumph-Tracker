import Header from '@/components/layout/header';
import TriumphTrackerClient from '@/components/dashboard/triumph-tracker-client';
import { Suspense } from 'react';
import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <TriumphTrackerClient />
        </Suspense>
      </main>
    </div>
  );
}
