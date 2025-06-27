'use client';
import Logo from './logo';
import MainNav from './main-nav';
import MobileNav from './mobile-nav';
import { ThemeToggle } from './theme-toggle';
import InstallPWAButton from './install-pwa-button';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.replace('/login');
  };

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          <MainNav />
          <div className="hidden md:flex items-center gap-2">
            <InstallPWAButton />
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
