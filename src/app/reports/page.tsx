import ProtectedLayout from '@/components/layout/protected-layout';
import ReportsClient from '@/components/reports/reports-client';

export default function ReportsPage() {
  return (
    <ProtectedLayout>
      <ReportsClient />
    </ProtectedLayout>
  );
}
