import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Grid3x3, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideDeckProps {
  slides: { title: string; render: () => ReactNode }[];
}

export function SlideDeck({ slides }: SlideDeckProps) {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [scale, setScale] = useState(1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorTimer = useRef<number | null>(null);

  const total = slides.length;
  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  // Compute scale to fit viewport
  useEffect(() => {
    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      setScale(Math.min(w / 1920, h / 1080));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [isFullscreen, showGrid]);

  // Fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "f" || e.key === "F") { toggleFullscreen(); }
      else if (e.key === "g" || e.key === "G") { setShowGrid((g) => !g); }
      else if (e.key === "Escape") { setShowGrid(false); }
      else if (/^[1-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10) - 1;
        if (n < total) setCurrent(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen, total]);

  // Auto-hide cursor in fullscreen
  useEffect(() => {
    if (!isFullscreen) { setCursorVisible(true); return; }
    const onMove = () => {
      setCursorVisible(true);
      if (cursorTimer.current) window.clearTimeout(cursorTimer.current);
      cursorTimer.current = window.setTimeout(() => setCursorVisible(false), 2500);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (cursorTimer.current) window.clearTimeout(cursorTimer.current);
    };
  }, [isFullscreen]);

  if (showGrid) {
    return (
      <div className="fixed inset-0 bg-[#0a1628] z-50 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6 max-w-[1800px] mx-auto">
          <h2 className="text-white text-2xl font-bold">All Slides ({total})</h2>
          <Button variant="ghost" onClick={() => setShowGrid(false)} className="text-white hover:bg-white/10">
            <X className="w-5 h-5 mr-2" /> Close
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-6 max-w-[1800px] mx-auto">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setShowGrid(false); }}
              className={`group relative bg-white rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                i === current ? "border-[#d4a574] ring-4 ring-[#d4a574]/30" : "border-white/10"
              }`}
              style={{ aspectRatio: "16/9" }}
            >
              <div className="absolute inset-0 origin-top-left pointer-events-none" style={{ transform: "scale(0.21)", width: 1920, height: 1080 }}>
                {s.render()}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
                <div className="text-white text-xs font-mono opacity-60">{String(i + 1).padStart(2, "0")}</div>
                <div className="text-white text-sm font-semibold truncate">{s.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-[#0a1628] overflow-hidden"
      style={{ cursor: cursorVisible ? "default" : "none" }}
    >
      {/* Click zones */}
      <button onClick={prev} className="absolute left-0 top-0 w-1/3 h-full z-10" aria-label="Previous" />
      <button onClick={next} className="absolute right-0 top-0 w-1/3 h-full z-10" aria-label="Next" />

      {/* Scaled slide */}
      <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${scale})`, transformOrigin: "center center" }}>
        <div className="pointer-events-auto w-full h-full shadow-2xl">
          {slides[current].render()}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <div className="h-full bg-gradient-to-r from-[#d4a574] to-[#e8c89d] transition-all duration-300" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Controls */}
      {cursorVisible && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-white/10">
          <Button size="sm" variant="ghost" onClick={prev} disabled={current === 0} className="text-white hover:bg-white/10 h-8 w-8 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white text-xs font-mono px-2 min-w-[60px] text-center">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <Button size="sm" variant="ghost" onClick={next} disabled={current === total - 1} className="text-white hover:bg-white/10 h-8 w-8 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button size="sm" variant="ghost" onClick={() => setShowGrid(true)} className="text-white hover:bg-white/10 h-8 w-8 p-0" title="Grid (G)">
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/10 h-8 w-8 p-0" title="Fullscreen (F)">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Hint */}
      {cursorVisible && current === 0 && (
        <div className="absolute top-6 right-6 z-30 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 text-white/70 text-xs">
          <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> navigate · <kbd className="font-mono">F</kbd> fullscreen · <kbd className="font-mono">G</kbd> grid
        </div>
      )}
    </div>
  );
}
