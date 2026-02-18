'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

const SheetContext = createContext({
  open: false,
  onOpenChange: () => {},
});

export function Sheet({ open = false, onOpenChange = () => {}, children }) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, asChild = false }) {
  return asChild ? children : <button type="button">{children}</button>;
}

export function SheetContent({ className, side = 'bottom', portal = true, 'aria-label': ariaLabel, ...props }) {
  const { open, onOpenChange } = useContext(SheetContext);
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      const timer = setTimeout(() => {
        if (panelRef.current) {
          const focusable = panelRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) focusable.focus();
          else panelRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open || typeof window === 'undefined') return null;

  const posClass = portal ? 'fixed' : 'absolute';

  const sideClass =
    side === 'left'
      ? 'left-0 top-0 h-full w-[88%] max-w-sm'
      : side === 'right'
        ? 'right-0 top-0 h-full w-[88%] max-w-sm'
        : cn('left-0 right-0 bottom-0 w-full rounded-t-[8px]', portal && 'max-w-[430px] mx-auto');

  const sheet = (
    <>
      <div
        className={cn(posClass, 'inset-0 z-40 bg-black/60')}
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={cn(
          posClass,
          'z-50 bg-[#1E1E1E] text-slate-100 p-4 shadow-xl border border-[#323232]',
          sideClass,
          'pb-[env(safe-area-inset-bottom)]',
          className,
        )}
      >
        {props.children}
      </div>
    </>
  );

  if (!portal) return sheet;
  return createPortal(sheet, document.body);
}

export function SheetHeader({ className, ...props }) {
  return <div className={cn('mb-3 space-y-1', className)} {...props} />;
}

export function SheetTitle({ className, ...props }) {
  return <h3 className={cn('text-base font-semibold text-slate-100', className)} {...props} />;
}

export function SheetDescription({ className, ...props }) {
  return <p className={cn('text-sm text-[#777777]', className)} {...props} />;
}

export function SheetFooter({ className, ...props }) {
  return <div className={cn('mt-4 flex items-center justify-end gap-2', className)} {...props} />;
}
