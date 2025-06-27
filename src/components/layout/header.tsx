import Logo from './logo';

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="container mx-auto">
        <Logo />
      </div>
    </header>
  );
}
