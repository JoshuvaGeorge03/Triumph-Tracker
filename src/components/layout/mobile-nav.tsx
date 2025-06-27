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
import { Menu } from 'lucide-react';
import Link, { type LinkProps } from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Logo from './logo';
import { ThemeToggle } from './theme-toggle';

const routes = [
  { href: '/', label: 'Dashboard' },
  { href: '/reports', label: 'Reports' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

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
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="mb-8 pl-6 flex justify-between items-center">
          <Logo />
        </div>
        <div className="flex flex-col gap-4 pl-6">
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
        <div className="absolute bottom-4 left-6">
          <ThemeToggle />
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
        'transition-colors hover:text-foreground',
        pathname === href ? 'text-foreground font-semibold' : 'text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
