import React from 'react';

export function StatusStrip({ isRunning, remaining, total, current }: { isRunning: boolean, remaining: number, total: number, current: number }) {
  return (
    <div className="w-full bg-mint text-ink font-mono text-xs uppercase tracking-wide py-1 text-center font-bold">
      {isRunning ? (
        <span>Dispatch is running · ${remaining.toFixed(2)} capital remaining · {total - current} tickets left</span>
      ) : (
        <span>Dispatch is idle · Ready to allocate ${remaining.toFixed(2)} across {total} tickets · Start run &rarr;</span>
      )}
    </div>
  );
}
