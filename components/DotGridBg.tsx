import React from 'react';

export function DotGridBg({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 dot-grid-bg opacity-30 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
