'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMotivationalMessageAction } from '@/app/actions';
import type { MotivationalMessageOutput } from '@/ai/flows/generate-motivational-message';
import AbstinenceTimer from './abstinence-timer';
import HistoryLog from './history-log';
import MotivationalMessage from './motivational-message';
import DashboardSkeleton from './dashboard-skeleton';
import { AlertCircle } from 'lucide-react';

const LAST_FAILURE_KEY = 'triumph-tracker-last-failure';
const HISTORY_KEY = 'triumph-tracker-history';

export default function TriumphTrackerClient() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [motivationalMessage, setMotivationalMessage] =
    useState<MotivationalMessageOutput | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedStartTime = localStorage.getItem(LAST_FAILURE_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);

      const initialStartTime = savedStartTime ? parseInt(savedStartTime, 10) : Date.now();
      const initialHistory = savedHistory ? JSON.parse(savedHistory) : [];

      setStartTime(initialStartTime);
      if (!savedStartTime) {
          localStorage.setItem(LAST_FAILURE_KEY, initialStartTime.toString());
      }
      setHistory(initialHistory);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Set to default state if localStorage is corrupt or unavailable
      const now = Date.now();
      setStartTime(now);
      setHistory([]);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const fetchMotivationalMessage = useCallback(async () => {
    if (!isLoaded || startTime === null) return;
    setIsMessageLoading(true);

    const intervals = history.slice(1).map((h, i) => h - history[i]);
    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const currentElapsedTime = (Date.now() - startTime) / 1000;
    
    let successRate = 1;
    if (avgInterval > 0) {
      successRate = currentElapsedTime / (currentElapsedTime + avgInterval/1000);
    }

    let overallTrend = 'stable';
    if (intervals.length >= 2) {
      const firstHalf = intervals.slice(0, Math.floor(intervals.length / 2));
      const secondHalf = intervals.slice(Math.floor(intervals.length / 2));
      const avgFirstHalf = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
      const avgSecondHalf = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

      if (avgSecondHalf > avgFirstHalf * 1.1) overallTrend = 'improving';
      else if (avgSecondHalf < avgFirstHalf * 0.9) overallTrend = 'worsening';
    }

    const message = await getMotivationalMessageAction({
      elapsedTime: currentElapsedTime,
      successRate: Math.max(0, Math.min(1, successRate)),
      failureCount: history.length,
      overallTrend,
    });
    setMotivationalMessage(message);
    setIsMessageLoading(false);
  }, [isLoaded, history, startTime]);

  useEffect(() => {
    fetchMotivationalMessage();
  }, [fetchMotivationalMessage]);

  const handleRecordFailure = () => {
    const now = Date.now();
    const newHistory = [...history, now];

    setHistory(newHistory);
    setStartTime(now);

    localStorage.setItem(LAST_FAILURE_KEY, now.toString());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

    toast({
      title: 'Instance Recorded',
      description: 'The timer has been reset. You can do this!',
    });

    fetchMotivationalMessage();
  };

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="grid gap-8">
        <AbstinenceTimer startTime={startTime} />
        <MotivationalMessage message={motivationalMessage} isLoading={isMessageLoading} />
        <div className="text-center">
          <Button
            size="lg"
            variant="destructive"
            className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto px-12 py-6 text-lg font-semibold shadow-lg"
            onClick={handleRecordFailure}
          >
            <AlertCircle className="mr-2 h-6 w-6" />
            Record a Setback
          </Button>
          <p className="text-sm text-muted-foreground mt-2">Pressing this will reset your timer.</p>
        </div>
        <HistoryLog history={history} />
      </div>
    </div>
  );
}
