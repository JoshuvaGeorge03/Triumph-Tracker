'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const routes = [
  { href: '/', label: 'Dashboard' },
  { href: '/reports', label: 'Reports' },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-2">
      {routes.map((route) => (
        <Button
          key={route.href}
          asChild
          variant={pathname === route.href ? 'secondary' : 'ghost'}
          className={cn(
            'transition-colors',
            pathname === route.href ? '' : 'text-muted-foreground'
          )}
        >
          <Link href={route.href}>{route.label}</Link>
        </Button>
      ))}
    </nav>
  );
}
