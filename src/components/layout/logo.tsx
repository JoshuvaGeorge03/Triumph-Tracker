import { Trophy } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Trophy className="w-6 h-6" />
      <h1 className="text-xl font-bold text-foreground">Triumph Tracker</h1>
    </div>
  );
}
