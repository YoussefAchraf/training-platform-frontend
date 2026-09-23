import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';

const ANCHOR_MARGIN = 8;
const VIEWPORT_PADDING = 12;

interface AnchoredPopoverProps {
  
  anchorRef: RefObject<HTMLElement | null>;
  
  align: 'own' | 'other';
  onClose: () => void;
  
  className?: string;
  children: ReactNode;
}


export function AnchoredPopover({ anchorRef, align, onClose, className, children }: AnchoredPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ position: 'fixed', top: 0, left: 0, visibility: 'hidden' });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    let top = anchorRect.top - popoverRect.height - ANCHOR_MARGIN;
    if (top < VIEWPORT_PADDING) {
      top = anchorRect.bottom + ANCHOR_MARGIN;
    }
    top = Math.min(top, window.innerHeight - popoverRect.height - VIEWPORT_PADDING);
    top = Math.max(top, VIEWPORT_PADDING);

    let left = align === 'own' ? anchorRect.right - popoverRect.width : anchorRect.left;
    left = Math.min(left, window.innerWidth - popoverRect.width - VIEWPORT_PADDING);
    left = Math.max(left, VIEWPORT_PADDING);

    setStyle({ position: 'fixed', top, left, visibility: 'visible' });
  }, [anchorRef, align]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) onClose();
    }
    function handleDismiss() {
      onClose();
    }
    document.addEventListener('mousedown', handlePointerDown);
    
    
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [onClose]);

  return createPortal(
    <div ref={popoverRef} className={className} style={style}>
      {children}
    </div>,
    document.body,
  );
}
