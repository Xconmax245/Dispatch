import React from 'react';

export function CornerCrosshairs() {
  return (
    <>
      <span className="absolute -top-2 -left-2 text-lineLight text-xs pointer-events-none">+</span>
      <span className="absolute -top-2 -right-2 text-lineLight text-xs pointer-events-none">+</span>
      <span className="absolute -bottom-2 -left-2 text-lineLight text-xs pointer-events-none">+</span>
      <span className="absolute -bottom-2 -right-2 text-lineLight text-xs pointer-events-none">+</span>
    </>
  );
}

export function CornerCrosshairsDark() {
  return (
    <>
      <span className="absolute -top-2 -left-2 text-line text-xs pointer-events-none">+</span>
      <span className="absolute -top-2 -right-2 text-line text-xs pointer-events-none">+</span>
      <span className="absolute -bottom-2 -left-2 text-line text-xs pointer-events-none">+</span>
      <span className="absolute -bottom-2 -right-2 text-line text-xs pointer-events-none">+</span>
    </>
  );
}
