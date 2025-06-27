'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import Link, { type LinkProps } from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Logo from './logo';
import { ThemeToggle } from './theme-toggle';
import InstallPWAButton from './install-pwa-button';

const routes = [
  { href: '/', label: 'Dashboard' },
  { href: '/reports', label: 'Reports' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setOpen(false);
    router.replace('/login');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="mb-8 pl-6 flex justify-between items-center">
          <Logo />
        </div>
        <div className="flex flex-col gap-y-2 px-4">
          {routes.map((route) => (
            <MobileLink
              key={route.href}
              href={route.href}
              onOpenChange={setOpen}
            >
              {route.label}
            </MobileLink>
          ))}
        </div>
        <div className="mt-auto p-4 space-y-4 border-t">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
            <div className="flex items-center justify-center gap-2">
                <InstallPWAButton />
                <ThemeToggle />
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(
        'text-base font-medium transition-colors hover:text-foreground p-2 rounded-md',
        pathname === href ? 'bg-secondary text-foreground' : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
