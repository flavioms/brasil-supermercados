'use client';

import { useRef, useState } from 'react';

interface SwipeContainerProps {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  rightLabel: string;
  leftLabel: string;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 80;
const EDGE_GUARD = 20;

export function SwipeContainer({
  onSwipeRight,
  onSwipeLeft,
  rightLabel,
  leftLabel,
  children,
}: SwipeContainerProps) {
  const [deltaX, setDeltaX] = useState(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    if (touch.clientX < EDGE_GUARD) return;
    startXRef.current = touch.clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const diff = touch.clientX - startXRef.current;
    setDeltaX(Math.max(-120, Math.min(120, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (deltaX > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
    setDeltaX(0);
  };

  const showRight = deltaX > 20;
  const showLeft = deltaX < -20;

  return (
    <div className="relative overflow-hidden">
      {/* Right action (swipe right) */}
      <div
        className={`bg-primary absolute inset-y-0 left-0 flex items-center justify-start pl-4 transition-opacity ${
          showRight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: Math.max(0, deltaX) }}
        aria-hidden="true"
      >
        <span className="text-sm font-medium text-white">{rightLabel}</span>
      </div>

      {/* Left action (swipe left) */}
      <div
        className={`bg-danger absolute inset-y-0 right-0 flex items-center justify-end pr-4 transition-opacity ${
          showLeft ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: Math.max(0, -deltaX) }}
        aria-hidden="true"
      >
        <span className="text-sm font-medium text-white">{leftLabel}</span>
      </div>

      {/* Content */}
      <div
        style={{ transform: `translateX(${deltaX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white transition-transform duration-100"
      >
        {children}
      </div>
    </div>
  );
}
