// src/components/layout/install-pwa-button.tsx
'use client';

import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function InstallPWAButton() {
  const { installPrompt, handleInstall } = usePWAInstall();

  if (!installPrompt) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleInstall} 
      title="Install App"
      aria-label="Install Triumph Tracker App"
    >
      <Download className="h-5 w-5" />
      <span className="sr-only">Install App</span>
    </Button>
  );
}
