import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Layers, BarChart3, FileText, TrendingUp, CheckCircle2 } from "lucide-react";
import SystemArchitectureDiagram from "@/components/architecture/SystemArchitectureDiagram";
import InvestorArchitectureDiagram from "@/components/architecture/InvestorArchitectureDiagram";
import { ExecutiveSummary } from "@/components/architecture/ExecutiveSummary";
import { MarketContextSlide } from "@/components/architecture/MarketContextSlide";
import { LeadQualificationLogic } from "@/components/architecture/LeadQualificationLogic";
import { Link } from "react-router-dom";

const Architecture = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"technical" | "investor" | "executive" | "market" | "qualification">("investor");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Export Controls - Fixed at top (hidden when printing) */}
<div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="px-2 md:px-3">
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-base md:text-lg font-semibold">MiCasa Architecture</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Export for investor materials</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* View Toggle - Horizontal scroll on mobile */}
            <div className="flex items-center overflow-x-auto scrollbar-thin bg-gray-100 dark:bg-gray-800 rounded-lg p-1 max-w-full">
              <Button
                variant={view === "executive" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("executive")}
                className="gap-1 md:gap-2 whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
              >
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Executive</span>
                <span className="xs:hidden">Exec</span>
              </Button>
              <Button
                variant={view === "market" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("market")}
                className="gap-1 md:gap-2 whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
              >
                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Market</span>
                <span className="xs:hidden">Mkt</span>
              </Button>
              <Button
                variant={view === "investor" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("investor")}
                className="gap-1 md:gap-2 whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
              >
                <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Investor</span>
                <span className="xs:hidden">Inv</span>
              </Button>
              <Button
                variant={view === "technical" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("technical")}
                className="gap-1 md:gap-2 whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
              >
                <Layers className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Technical</span>
                <span className="xs:hidden">Tech</span>
              </Button>
              <Button
                variant={view === "qualification" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("qualification")}
                className="gap-1 md:gap-2 whitespace-nowrap text-xs md:text-sm px-2 md:px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Qualification</span>
                <span className="xs:hidden">Qual</span>
              </Button>
            </div>
            <Button size="sm" onClick={handlePrint} className="whitespace-nowrap px-2 md:px-3">
              <Printer className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Print / Save as PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div ref={diagramRef} className="py-8 print:py-4">
        {view === "executive" ? (
          <ExecutiveSummary />
        ) : view === "market" ? (
          <MarketContextSlide />
        ) : view === "investor" ? (
          <InvestorArchitectureDiagram />
        ) : view === "qualification" ? (
          <LeadQualificationLogic />
        ) : (
          <SystemArchitectureDiagram />
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A3 landscape;
            margin: 0.5cm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Architecture;
