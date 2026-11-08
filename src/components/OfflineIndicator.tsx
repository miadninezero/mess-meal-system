import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Cached local data is being used.</span>
    </div>
  );
};
