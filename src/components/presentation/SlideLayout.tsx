import { ReactNode } from "react";
import { MiCasaLogo } from "@/components/branding/MiCasaLogo";

interface SlideLayoutProps {
  children: ReactNode;
  slideNumber?: number;
  totalSlides?: number;
  variant?: "default" | "title" | "dark";
  hideFooter?: boolean;
}

export function SlideLayout({ children, slideNumber, totalSlides, variant = "default", hideFooter }: SlideLayoutProps) {
  const bg =
    variant === "title"
      ? "bg-gradient-to-br from-[#0a1628] via-[#1a365d] to-[#0a1628]"
      : variant === "dark"
      ? "bg-[#0a1628]"
      : "bg-white";
  const isDark = variant !== "default";

  return (
    <div
      className={`slide-content relative ${bg} overflow-hidden`}
      style={{ width: 1920, height: 1080 }}
    >
      {/* Decorative gradient mesh for non-title slides */}
      {variant === "default" && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-3xl"
               style={{ background: "radial-gradient(circle, #d4a574 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
               style={{ background: "radial-gradient(circle, #1a365d 0%, transparent 70%)" }} />
        </>
      )}

      {/* Content */}
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Footer */}
        {!hideFooter && (
          <div className={`flex items-center justify-between px-16 py-6 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <div className="flex items-center gap-4">
              {isDark ? (
                <span className="text-white font-semibold tracking-[0.2em] text-lg">MI CASA</span>
              ) : (
                <MiCasaLogo width={140} height={28} />
              )}
              <span className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Business Operating System
              </span>
            </div>
            {slideNumber && totalSlides && (
              <div className={`text-sm font-mono ${isDark ? "text-white/50" : "text-gray-400"}`}>
                {String(slideNumber).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable building blocks
export function SlideTitle({ children, kicker, variant = "default" }: { children: ReactNode; kicker?: string; variant?: "default" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <div className="px-16 pt-16 pb-8">
      {kicker && (
        <div className={`text-sm font-semibold tracking-[0.2em] uppercase mb-4 ${isDark ? "text-[#d4a574]" : "text-[#d4a574]"}`}>
          {kicker}
        </div>
      )}
      <h1 className={`text-6xl font-bold leading-tight ${isDark ? "text-white" : "text-[#1a365d]"}`}>
        {children}
      </h1>
    </div>
  );
}

export function GoldDivider() {
  return <div className="h-1 w-24 bg-gradient-to-r from-[#d4a574] to-transparent rounded-full" />;
}
