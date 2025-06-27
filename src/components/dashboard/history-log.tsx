'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, Trash2 } from 'lucide-react';
import { format, formatDistanceStrict } from 'date-fns';
import type { HistoryEntry } from './triumph-tracker-client';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


interface HistoryLogProps {
  history: HistoryEntry[];
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

export default function HistoryLog({ history, onDelete, onClearAll }: HistoryLogProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <CardTitle>Streak History</CardTitle>
          </div>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your streak history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <CardDescription>A log of your past streaks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {history.length > 0 ? (
            <div className="space-y-4 pr-4">
              {history.map((entry) => (
                <Card key={entry.id} className="p-4 bg-background/50">
                  <div className="flex justify-between items-start">
                    <div className='flex-1'>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{entry.type}</Badge>
                      </div>
                      <p className="font-semibold text-base pr-2 break-words">{entry.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Streak Duration:{' '}
                        <span className="font-medium text-primary">
                          {formatDistanceStrict(entry.endTime, entry.startTime)}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete entry</span>
                    </Button>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Started:</span>{' '}
                      {format(new Date(entry.startTime), "PPP 'at' p")}
                    </p>
                    <p>
                      <span className="font-medium">Ended:</span>{' '}
                      {format(new Date(entry.endTime), "PPP 'at' p")}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No streaks recorded yet.</p>
              <p className="text-sm">Start the timer to begin your first streak!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
