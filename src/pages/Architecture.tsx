import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Layers, BarChart3 } from "lucide-react";
import SystemArchitectureDiagram from "@/components/architecture/SystemArchitectureDiagram";
import InvestorArchitectureDiagram from "@/components/architecture/InvestorArchitectureDiagram";
import { Link } from "react-router-dom";

const Architecture = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"technical" | "investor">("investor");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Export Controls - Fixed at top (hidden when printing) */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">MiCasa Architecture</h1>
              <p className="text-xs text-muted-foreground">Export for investor materials</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={view === "investor" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("investor")}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Investor
              </Button>
              <Button
                variant={view === "technical" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("technical")}
                className="gap-2"
              >
                <Layers className="w-4 h-4" />
                Technical
              </Button>
            </div>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div ref={diagramRef} className="py-8 print:py-4">
        {view === "investor" ? <InvestorArchitectureDiagram /> : <SystemArchitectureDiagram />}
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
