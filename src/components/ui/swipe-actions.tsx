import React, { useState, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeAction {
  id: string;
  icon: ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface SwipeActionsProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeActionsProps) {
  const isMobile = useIsMobile();
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const maxLeftSwipe = leftActions.length * 72;
  const maxRightSwipe = rightActions.length * 72;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const diff = e.touches[0].clientX - startX.current;
    let newTranslate = currentX.current + diff;

    // Limit the swipe range with rubber band effect
    if (newTranslate > 0) {
      newTranslate = Math.min(maxLeftSwipe, newTranslate * 0.5);
    } else {
      newTranslate = Math.max(-maxRightSwipe, newTranslate * 0.5);
    }

    setTranslateX(newTranslate);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Snap to position or reset
    if (translateX > threshold && leftActions.length > 0) {
      setTranslateX(maxLeftSwipe);
    } else if (translateX < -threshold && rightActions.length > 0) {
      setTranslateX(-maxRightSwipe);
    } else {
      setTranslateX(0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setTranslateX(0);
  };

  const resetPosition = () => {
    setTranslateX(0);
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Left Actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex">
          {leftActions.map(action => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "w-[72px] flex flex-col items-center justify-center gap-1 transition-transform touch-manipulation",
                action.color
              )}
              style={{
                transform: `translateX(${Math.min(0, -maxLeftSwipe + translateX)}px)`,
              }}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex">
          {rightActions.map(action => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "w-[72px] flex flex-col items-center justify-center gap-1 transition-transform touch-manipulation",
                action.color
              )}
              style={{
                transform: `translateX(${Math.max(0, maxRightSwipe + translateX)}px)`,
              }}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={translateX !== 0 ? resetPosition : undefined}
        className={cn(
          "relative bg-card transition-transform",
          isDragging ? "transition-none" : "transition-transform duration-200"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
