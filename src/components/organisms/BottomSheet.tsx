'use client';

import { useEffect, useRef } from 'react';
import { BottomSheetHandle } from '@/components/atoms/BottomSheetHandle';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, label, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      if (sheetRef.current) {
        const offsetFromBottom = window.innerHeight - (vv.height + vv.offsetTop);
        sheetRef.current.style.paddingBottom = `${offsetFromBottom}px`;
      }
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-label={label}
        aria-modal="true"
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[var(--size-app-max-w)] rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <BottomSheetHandle />
        {children}
      </div>
    </>
  );
}
