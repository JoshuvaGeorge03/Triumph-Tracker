'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';

interface AbstinenceTimerProps {
  startTime: number | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (startTime: number | null): TimeLeft => {
  if (startTime === null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const difference = Date.now() - startTime;
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds };
};

export default function AbstinenceTimer({ startTime }: AbstinenceTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatUnit = (value: number) => value.toString().padStart(2, '0');

  return (
    <Card className="text-center shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-center space-x-2">
        <Timer className="h-6 w-6 text-primary" />
        <CardTitle className="text-2xl font-semibold">Time of Abstinence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-end gap-2 sm:gap-4">
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-5xl sm:text-7xl font-bold tracking-tighter text-primary">
                {timeLeft.days}
              </span>
              <span className="text-sm text-muted-foreground">DAYS</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl font-bold tracking-tighter">
              {formatUnit(timeLeft.hours)}
            </span>
            <span className="text-sm text-muted-foreground">HOURS</span>
          </div>
          <div className="text-5xl sm:text-7xl font-bold pb-1 text-muted-foreground">:</div>
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl font-bold tracking-tighter">
              {formatUnit(timeLeft.minutes)}
            </span>
            <span className="text-sm text-muted-foreground">MINUTES</span>
          </div>
          <div className="text-5xl sm:text-7xl font-bold pb-1 text-muted-foreground">:</div>
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-7xl font-bold tracking-tighter animate-pulse">
              {formatUnit(timeLeft.seconds)}
            </span>
            <span className="text-sm text-muted-foreground">SECONDS</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
