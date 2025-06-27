// src/components/dashboard/triumph-tracker-client.tsx
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
import { Play, StopCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface HistoryEntry {
  id: number;
  startTime: number;
  endTime: number;
  reason: string;
  type: string;
}

const IS_RUNNING_KEY = 'triumph-tracker-is-running';
const START_TIME_KEY = 'triumph-tracker-start-time';
const HISTORY_KEY = 'triumph-tracker-history-v2';
const SETBACK_TYPES_KEY = 'triumph-tracker-setback-types';

export default function TriumphTrackerClient() {
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [currentStreakStartTime, setCurrentStreakStartTime] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [motivationalMessage, setMotivationalMessage] =
    useState<MotivationalMessageOutput | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const [setbackTypes, setSetbackTypes] = useState<string[]>(['Stress', 'Tiredness', 'Social Pressure']);
  const [selectedSetbackType, setSelectedSetbackType] = useState<string>('');
  const [customSetbackType, setCustomSetbackType] = useState('');

  useEffect(() => {
    try {
      const savedIsRunning = localStorage.getItem(IS_RUNNING_KEY) === 'true';
      const savedStartTime = localStorage.getItem(START_TIME_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      const savedTypes = localStorage.getItem(SETBACK_TYPES_KEY);

      setIsTimerRunning(savedIsRunning);
      setCurrentStreakStartTime(savedStartTime ? parseInt(savedStartTime, 10) : null);
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
      if (savedTypes) {
        setSetbackTypes(JSON.parse(savedTypes));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      setIsTimerRunning(false);
      setCurrentStreakStartTime(null);
      setHistory([]);
      setSetbackTypes(['Stress', 'Tiredness', 'Social Pressure']);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const fetchMotivationalMessage = useCallback(async () => {
    if (!isLoaded) return;
    setIsMessageLoading(true);

    const intervals = history.map((h) => h.endTime - h.startTime);
    const avgInterval =
      intervals.length > 0
        ? intervals.reduce((a, b) => a + b, 0) / intervals.length
        : 0;
    const currentElapsedTime =
      isTimerRunning && currentStreakStartTime
        ? Date.now() - currentStreakStartTime
        : 0;

    let successRate = 0.5;
    if (avgInterval > 0) {
      successRate = currentElapsedTime / (currentElapsedTime + avgInterval);
    } else if (currentElapsedTime > 0) {
      successRate = 1;
    }

    let overallTrend = 'stable';
    if (intervals.length >= 2) {
        const midPoint = Math.ceil(intervals.length / 2);
        const recentStreaks = intervals.slice(0, midPoint);
        const olderStreaks = intervals.slice(midPoint);
        const avgRecent = recentStreaks.reduce((a, b) => a + b, 0) / recentStreaks.length;
        const avgOlder = olderStreaks.length > 0 ? olderStreaks.reduce((a, b) => a + b, 0) / olderStreaks.length : avgRecent;

        if (avgRecent > avgOlder * 1.1) overallTrend = 'improving';
        else if (avgRecent < avgOlder * 0.9) overallTrend = 'worsening';
    }

    const message = await getMotivationalMessageAction({
      elapsedTime: currentElapsedTime / 1000,
      successRate: Math.max(0, Math.min(1, successRate)),
      failureCount: history.length,
      overallTrend,
    });
    setMotivationalMessage(message);
    setIsMessageLoading(false);
  }, [isLoaded, history, currentStreakStartTime, isTimerRunning]);

  useEffect(() => {
    fetchMotivationalMessage();
  }, [fetchMotivationalMessage]);

  const handleStartTimer = () => {
    const now = Date.now();
    setCurrentStreakStartTime(now);
    setIsTimerRunning(true);
    localStorage.setItem(START_TIME_KEY, now.toString());
    localStorage.setItem(IS_RUNNING_KEY, 'true');
    toast({
      title: 'Timer Started',
      description: 'A new streak begins. You got this!',
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setReason('');
      setSelectedSetbackType('');
      setCustomSetbackType('');
    }
  };

  const handleTypeSelect = (value: string) => {
    setSelectedSetbackType(value);
    if (value) {
      setCustomSetbackType('');
    }
  };

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSetbackType(e.target.value);
    if (e.target.value) {
      setSelectedSetbackType('');
    }
  };

  const handleRecordSetback = () => {
    if (!currentStreakStartTime) return;
    const finalSetbackType = customSetbackType.trim() || selectedSetbackType;

    if (!reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for this setback.',
      });
      return;
    }
    if (!finalSetbackType) {
      toast({
        variant: 'destructive',
        title: 'Type Required',
        description: 'Please select or enter a type for this setback.',
      });
      return;
    }

    const now = Date.now();
    const newHistoryEntry: HistoryEntry = {
      id: now,
      startTime: currentStreakStartTime,
      endTime: now,
      reason: reason.trim(),
      type: finalSetbackType,
    };
    const newHistory = [newHistoryEntry, ...history];

    const updatedTypes = [...setbackTypes];
    if (customSetbackType.trim() && !setbackTypes.includes(customSetbackType.trim())) {
        updatedTypes.push(customSetbackType.trim());
        setSetbackTypes(updatedTypes);
        localStorage.setItem(SETBACK_TYPES_KEY, JSON.stringify(updatedTypes));
    }

    setHistory(newHistory);
    setIsTimerRunning(false);
    setCurrentStreakStartTime(null);
    setIsDialogOpen(false);
    setReason('');
    setSelectedSetbackType('');
    setCustomSetbackType('');

    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    localStorage.setItem(IS_RUNNING_KEY, 'false');
    localStorage.removeItem(START_TIME_KEY);

    toast({
      title: 'Setback Recorded',
      description: "The timer has been stopped. It's okay, a new chapter begins now.",
    });

    fetchMotivationalMessage();
  };
  
  const handleDeleteHistoryEntry = (id: number) => {
    const newHistory = history.filter((entry) => entry.id !== id);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    toast({
      title: 'Entry Deleted',
      description: 'The history entry has been removed.',
    });
  };

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="grid gap-8">
        <AbstinenceTimer startTime={currentStreakStartTime} isRunning={isTimerRunning} />
        <MotivationalMessage message={motivationalMessage} isLoading={isMessageLoading} />
        
        <div className="text-center">
          {!isTimerRunning ? (
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto px-12 py-6 text-lg font-semibold shadow-lg"
              onClick={handleStartTimer}
            >
              <Play className="mr-2 h-6 w-6" />
              Start Timer
            </Button>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="destructive"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto px-12 py-6 text-lg font-semibold shadow-lg"
                >
                  <StopCircle className="mr-2 h-6 w-6" />
                  Record a Setback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record a Setback</DialogTitle>
                  <DialogDescription>
                    It's okay. Acknowledging a setback is a step towards progress. What happened?
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                        Type
                    </Label>
                    <Select
                        onValueChange={handleTypeSelect}
                        value={selectedSetbackType}
                        disabled={!!customSetbackType}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {setbackTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="custom-type" className="text-right">
                        Other
                    </Label>
                    <Input
                        id="custom-type"
                        value={customSetbackType}
                        onChange={handleCustomTypeChange}
                        className="col-span-3"
                        placeholder="Or add a new type"
                        disabled={!!selectedSetbackType}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>
                    <Input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Felt stressed"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleRecordSetback}>Confirm Setback</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {isTimerRunning 
              ? "Pressing this will stop your timer."
              : "A new journey awaits."}
          </p>
        </div>

        <HistoryLog history={history} onDelete={handleDeleteHistoryEntry} />
      </div>
    </div>
  );
}
