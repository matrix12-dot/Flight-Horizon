import { AIRLINES } from '@/src/data/aviationData';
import { Plane } from 'lucide-react';

interface AirlineEmblemProps {
  airlineCode: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AirlineEmblem({ airlineCode, size = 'md' }: AirlineEmblemProps) {
  const airline = AIRLINES[airlineCode];
  const dimensions =
    size === 'sm'
      ? 'w-9 h-9 text-xs'
      : size === 'lg'
        ? 'w-12 h-12 text-sm'
        : 'w-10 h-10 text-xs';

  return (
    <div
      className={`${dimensions} rounded-xl flex flex-col items-center justify-center shrink-0 border border-white/10 font-mono-tabular font-semibold tracking-wider`}
      style={{
        backgroundColor: airline?.bgTint || 'rgba(56, 189, 248, 0.14)',
        color: airline?.accentColor || '#38BDF8',
      }}
      aria-hidden="true"
    >
      {airlineCode === 'OQ' ? (
        <Plane className="w-4 h-4 -rotate-45" />
      ) : (
        <span>{airlineCode}</span>
      )}
    </div>
  );
}
