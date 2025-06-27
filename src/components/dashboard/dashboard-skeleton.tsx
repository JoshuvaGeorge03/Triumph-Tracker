import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl">
      <div className="grid gap-8">
        <Card className="text-center shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-baseline gap-4">
              <Skeleton className="h-16 w-20" />
              <Skeleton className="h-16 w-20" />
              <Skeleton className="h-16 w-20" />
              <Skeleton className="h-16 w-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
            <Skeleton className="h-16 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>History Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
