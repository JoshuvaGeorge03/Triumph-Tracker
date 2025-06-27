'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History } from 'lucide-react';
import { format, formatDistanceStrict } from 'date-fns';

interface HistoryLogProps {
  history: number[];
}

export default function HistoryLog({ history }: HistoryLogProps) {
  const reversedHistory = [...history].reverse();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <CardTitle>Setback History</CardTitle>
        </div>
        <CardDescription>A log of your recorded setbacks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          {reversedHistory.length > 0 ? (
            <div className="space-y-4 pr-4">
              {reversedHistory.map((timestamp, index) => {
                const previousTimestamp = reversedHistory[index + 1] || null;
                const duration = previousTimestamp
                  ? formatDistanceStrict(timestamp, previousTimestamp, {
                      addSuffix: false,
                    })
                  : null;

                return (
                  <React.Fragment key={timestamp}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(timestamp), "PPP 'at' p")}
                      </span>
                      {duration ? (
                        <span className="font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                          Streak: {duration}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">First record</span>
                      )}
                    </div>
                    {index < reversedHistory.length - 1 && <Separator />}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No setbacks recorded yet.</p>
              <p className="text-sm">Keep up the great work!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
