import Header from '@/components/layout/header';
import ReportsClient from '@/components/reports/reports-client';

export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 px-4 py-8">
        <ReportsClient />
      </main>
    </div>
  );
}
