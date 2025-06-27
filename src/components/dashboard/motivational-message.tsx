'use client';

import type { MotivationalMessageOutput } from '@/ai/flows/generate-motivational-message';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BrainCircuit, PartyPopper, ShieldAlert, Sparkles } from 'lucide-react';
import * as React from 'react';

interface MotivationalMessageProps {
  message: MotivationalMessageOutput | null;
  isLoading: boolean;
}

const sentimentConfig = {
  motivational: {
    icon: Sparkles,
    className: 'border-blue-500/50',
    iconClassName: 'text-blue-500',
  },
  cautionary: {
    icon: ShieldAlert,
    className: 'border-yellow-500/50',
    iconClassName: 'text-yellow-500',
  },
  celebratory: {
    icon: PartyPopper,
    className: 'border-green-500/50',
    iconClassName: 'text-green-500',
  },
};

export default function MotivationalMessage({ message, isLoading }: MotivationalMessageProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (!message) {
    return null;
  }

  const config = sentimentConfig[message.sentiment] || sentimentConfig.motivational;
  const Icon = config.icon || Sparkles;

  return (
    <Card className={cn('shadow-lg transition-all duration-300 border-2', config.className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <span className="p-2 bg-muted rounded-full">
            <Icon className={cn('h-6 w-6', config.iconClassName)} />
          </span>
          <div>
            <p className="font-semibold text-card-foreground">AI Coach</p>
            <p className="text-muted-foreground">{message.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
