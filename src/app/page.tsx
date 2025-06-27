import ProtectedLayout from '@/components/layout/protected-layout';
import TriumphTrackerClient from '@/components/dashboard/triumph-tracker-client';
import { Suspense } from 'react';
import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton';

export default function Home() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <TriumphTrackerClient />
      </Suspense>
    </ProtectedLayout>
  );
}
