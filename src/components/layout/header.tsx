import Logo from './logo';
import MainNav from './main-nav';

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <MainNav />
      </div>
    </header>
  );
}
