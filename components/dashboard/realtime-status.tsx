'use client';

import { formatDistanceToNow, isValid } from 'date-fns';
import { Activity, RefreshCw } from 'lucide-react';

interface RealtimeStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
}

export default function RealtimeStatus({ isConnected, lastUpdated }: RealtimeStatusProps) {
  // Helper function to safely format the date
  const formatLastUpdated = () => {
    if (!lastUpdated || !isValid(lastUpdated)) {
      return 'Just now';
    }
    
    try {
      return formatDistanceToNow(lastUpdated, { addSuffix: true });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Just now';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
      isConnected 
        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
        : 'bg-amber-100 text-amber-700 border border-amber-200'
    }`}>
      <div className="relative">
        {isConnected ? (
          <Activity className="h-3 w-3" />
        ) : (
          <RefreshCw className="h-3 w-3 animate-spin" />
        )}
        {isConnected && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <span>
        {isConnected ? 'Live' : 'Connecting'} • {formatLastUpdated()}
      </span>
    </div>
  );
}
