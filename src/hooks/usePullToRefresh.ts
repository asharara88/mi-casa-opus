import { useState, useRef, useCallback, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const isMobile = useIsMobile();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || isRefreshing) return;
    
    const target = e.currentTarget;
    scrollTop.current = target.scrollTop;
    
    // Only enable pull-to-refresh when scrolled to top
    if (scrollTop.current <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isMobile, isRefreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only track downward pulls when at top of scroll
    if (diff > 0 && scrollTop.current <= 0) {
      // Apply resistance
      const resistance = 0.4;
      const adjustedDiff = Math.min(diff * resistance, maxPull);
      setPullDistance(adjustedDiff);
    }
  }, [isPulling, isRefreshing, maxPull]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  // Reset on desktop
  useEffect(() => {
    if (!isMobile) {
      setPullDistance(0);
      setIsRefreshing(false);
      setIsPulling(false);
    }
  }, [isMobile]);

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
