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
import { Play, StopCircle, Check, ChevronsUpDown, Trash2 } from 'lucide-react';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
const DEFAULT_SETBACK_TYPES = ['Stress', 'Tiredness', 'Social Pressure'];

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

  const [setbackTypes, setSetbackTypes] = useState<string[]>(DEFAULT_SETBACK_TYPES);
  const [selectedSetbackType, setSelectedSetbackType] = useState<string>('');
  
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");

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
      setSetbackTypes(DEFAULT_SETBACK_TYPES);
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
      setNewTypeInput('');
    }
  };

  const handleRecordSetback = () => {
    if (!currentStreakStartTime) return;

    if (!reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for this setback.',
      });
      return;
    }
    if (!selectedSetbackType) {
      toast({
        variant: 'destructive',
        title: 'Type Required',
        description: 'Please select or create a type for this setback.',
      });
      return;
    }

    const now = Date.now();
    const newHistoryEntry: HistoryEntry = {
      id: now,
      startTime: currentStreakStartTime,
      endTime: now,
      reason: reason.trim(),
      type: selectedSetbackType,
    };
    const newHistory = [newHistoryEntry, ...history];

    setHistory(newHistory);
    setIsTimerRunning(false);
    setCurrentStreakStartTime(null);
    handleDialogOpenChange(false)

    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    localStorage.setItem(IS_RUNNING_KEY, 'false');
    localStorage.removeItem(START_TIME_KEY);

    toast({
      title: 'Setback Recorded',
      description: "The timer has been stopped. It's okay, a new chapter begins now.",
    });

    fetchMotivationalMessage();
  };
  
  const handleDeleteSetbackType = (typeToDelete: string) => {
    if (DEFAULT_SETBACK_TYPES.includes(typeToDelete)) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete Default Type',
        description: `"${typeToDelete}" is a default type and cannot be deleted.`,
      });
      return;
    }

    const newTypes = setbackTypes.filter((type) => type !== typeToDelete);
    setSetbackTypes(newTypes);
    localStorage.setItem(SETBACK_TYPES_KEY, JSON.stringify(newTypes));

    if (selectedSetbackType === typeToDelete) {
      setSelectedSetbackType('');
    }

    toast({
      title: 'Type Deleted',
      description: `The type "${typeToDelete}" has been removed.`,
    });
  };

  const handleCreateOrSelectType = () => {
    const newTypeValue = newTypeInput.trim();
    if (!newTypeValue) return;

    let typeToSelect = setbackTypes.find(
      (t) => t.toLowerCase() === newTypeValue.toLowerCase()
    );

    if (!typeToSelect) {
      typeToSelect = newTypeValue;
      const newTypes = [...setbackTypes, typeToSelect];
      setSetbackTypes(newTypes);
      localStorage.setItem(SETBACK_TYPES_KEY, JSON.stringify(newTypes));
      toast({
        title: 'Type Added',
        description: `Successfully created the "${typeToSelect}" type.`,
      });
    }

    setSelectedSetbackType(typeToSelect);
    setIsComboOpen(false);
    setNewTypeInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTypeInput.trim()) {
        handleCreateOrSelectType();
      }
    }
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

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    // Keep custom types, but reset if they were also cleared
    const savedTypes = localStorage.getItem(SETBACK_TYPES_KEY);
    if (!savedTypes) {
      setSetbackTypes(DEFAULT_SETBACK_TYPES);
    }
    toast({
      title: 'History Cleared',
      description: 'All your streak history has been deleted.',
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
                  <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
                    <Label htmlFor="type" className="sm:text-right">
                        Type
                    </Label>
                    <Popover open={isComboOpen} onOpenChange={setIsComboOpen}>
                      <PopoverTrigger asChild>
                          <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isComboOpen}
                              className="col-span-3 justify-between"
                          >
                              {selectedSetbackType || "Select or create a type..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                              <CommandInput
                                  placeholder="Search or add new type..."
                                  value={newTypeInput}
                                  onValueChange={setNewTypeInput}
                                  onKeyDown={handleKeyDown}
                              />
                              <CommandList>
                                  <CommandEmpty>
                                      {newTypeInput.trim() ? (
                                          <CommandItem
                                            onSelect={handleCreateOrSelectType}
                                          >
                                              Create "{newTypeInput}"
                                          </CommandItem>
                                      ) : (
                                          <div className="py-6 text-center text-sm">No type found.</div>
                                      )}
                                  </CommandEmpty>
                                  <CommandGroup>
                                      {setbackTypes.map((type) => (
                                        <CommandItem
                                          key={type}
                                          value={type}
                                          onSelect={() => {
                                            setSelectedSetbackType(selectedSetbackType === type ? '' : type);
                                            setIsComboOpen(false);
                                            setNewTypeInput('');
                                          }}
                                          className="group/item flex items-center justify-between"
                                        >
                                          <div className="flex items-center">
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedSetbackType === type ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <span>{type}</span>
                                          </div>
                                          {!DEFAULT_SETBACK_TYPES.includes(type) && (
                                            <button
                                              className="p-1 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteSetbackType(type);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                              <span className="sr-only">Delete type</span>
                                            </button>
                                          )}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                              </CommandList>
                          </Command>
                      </PopoverContent>
                  </Popover>
                  </div>
                  <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-4 sm:items-center sm:gap-x-4">
                    <Label htmlFor="reason" className="sm:text-right">
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

        <HistoryLog history={history} onDelete={handleDeleteHistoryEntry} onClearAll={handleClearAllHistory} />
      </div>
    </div>
  );
}
