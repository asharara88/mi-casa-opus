import { Button } from "@/components/ui/button";
import { Printer, TrendingUp, Shield, Zap, DollarSign, Target, Users, Clock } from "lucide-react";

export const ExecutiveSummary = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Button - Hidden in print */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800">
          <Printer className="w-4 h-4" />
          Save as PDF
        </Button>
      </div>

      {/* Executive Summary Content */}
      <div className="max-w-[1000px] mx-auto p-8 print:p-6 print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">MiCasa BOS</h1>
          </div>
          <p className="text-lg text-slate-600 font-medium">Brokerage Operating System for UAE Real Estate</p>
          <div className="mt-2 inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            Executive Summary
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mb-6 text-white print:break-inside-avoid">
          <h2 className="text-xl font-bold mb-3">The Opportunity</h2>
          <p className="text-slate-300 leading-relaxed">
            Abu Dhabi's real estate market shows <span className="text-amber-400 font-semibold">continued resilience entering 2026</span>, with 
            <span className="text-amber-400 font-semibold"> 2,411 licensed professionals</span> and AED 94B+ in transaction volume (9M 2025). 
            The broader UAE industry recorded AED 680B in transactions in 2025. Apartment rents grew 6-9% YoY as of January 2026, with vacancy rates at just 4-6%. 
            MiCasa BOS is the first purpose-built operating system for ADREC compliance—turning operational friction into competitive advantage.
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Sources: ADREC H1 2025 Report, Abu Dhabi Media Office Nov 2025, January 2026 Market Analysis</p>
        </div>

        {/* Key Metrics Grid - Platform Target Outcomes */}
        <div className="grid grid-cols-4 gap-4 mb-6 print:break-inside-avoid">
          <MetricCard 
            icon={Clock}
            value="1-3 wks"
            label="Target Close"
            subtext="registration to title"
            color="emerald"
          />
          <MetricCard 
            icon={Shield}
            value="Zero"
            label="ADREC Violations"
            subtext="compliance gate"
            color="blue"
          />
          <MetricCard 
            icon={Users}
            value=">80%"
            label="Retention"
            subtext="with training/tools"
            color="purple"
          />
          <MetricCard 
            icon={DollarSign}
            value="<AED 100"
            label="Target CPL"
            subtext="vs AED 50-500 avg"
            color="amber"
          />
        </div>
        <p className="text-[10px] text-slate-400 -mt-4 mb-4 text-right">Industry benchmarks from ADREC, DARI, Executive Search 2024-25</p>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* Competitive Positioning */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              Competitive Positioning
            </h3>
            <div className="space-y-3">
              <CompetitorRow 
                name="Generic CRMs"
                weakness="No UAE compliance, manual workflows"
                position="We automate what they can't"
              />
              <CompetitorRow 
                name="Legacy Systems"
                weakness="Fragmented, expensive integration"
                position="We unify everything in one platform"
              />
              <CompetitorRow 
                name="Manual Processes"
                weakness="62% of agents spend 1+ hr/day on admin"
                position="We free agents to sell"
              />
            </div>
          </div>

          {/* Key Differentiators */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Key Differentiators
            </h3>
            <div className="space-y-3">
              <DifferentiatorRow 
                title="Compliance-First Architecture"
                description="ADREC/DARI rules engine blocks violations before they happen"
              />
              <DifferentiatorRow 
                title="AI-Powered Lead Qualification"
                description="Auto-score and route leads based on intent signals"
              />
              <DifferentiatorRow 
                title="Immutable Audit Trail"
                description="Blockchain-anchored evidence for regulatory assurance"
              />
              <DifferentiatorRow 
                title="Pipeline Intelligence"
                description="Predictive analytics for deal velocity and forecasting"
              />
            </div>
          </div>
        </div>

        {/* Market & Traction - Verified Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6 print:break-inside-avoid">
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">$1.55B</p>
            <p className="text-sm text-slate-600 mt-1">UAE PropTech TAM by 2030</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Source: TechSci Research 2024</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">AED 680B</p>
            <p className="text-sm text-slate-600 mt-1">UAE Total Volume (2025)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Source: UAE RE Market Report</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">6-9%</p>
            <p className="text-sm text-slate-600 mt-1">Apartment Rent Growth</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Jan 2026 YoY</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">4-6%</p>
            <p className="text-sm text-slate-600 mt-1">Vacancy Rate</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Low = Strong Demand</p>
          </div>
        </div>

        {/* Business Model */}
        <div className="border border-slate-200 rounded-xl p-5 mb-6 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Revenue Model
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="font-bold text-slate-900">SaaS License</p>
              <p className="text-sm text-slate-600">Per-seat monthly subscription</p>
              <p className="text-xs text-amber-700 mt-1">~70% of revenue</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-bold text-slate-900">Transaction Fees</p>
              <p className="text-sm text-slate-600">Success-based deal fees</p>
              <p className="text-xs text-blue-700 mt-1">~20% of revenue</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="font-bold text-slate-900">Value-Add Services</p>
              <p className="text-sm text-slate-600">AI insights, integrations</p>
              <p className="text-xs text-emerald-700 mt-1">~10% of revenue</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-4 border-t border-slate-200 print:break-inside-avoid">
          <p className="text-slate-600 text-sm mb-2">Ready to transform your brokerage operations?</p>
          <p className="font-bold text-slate-900">contact@micasa.ae • www.micasa.ae</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const MetricCard = ({ 
  icon: Icon, 
  value, 
  label, 
  subtext, 
  color 
}: { 
  icon: React.ElementType; 
  value: string; 
  label: string; 
  subtext: string; 
  color: string;
}) => {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  }[color] || "bg-slate-50 text-slate-700 border-slate-200";

  const iconColor = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
  }[color] || "text-slate-600";

  return (
    <div className={`rounded-xl p-4 border ${colorClasses} text-center`}>
      <Icon className={`w-6 h-6 mx-auto mb-2 ${iconColor}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-75">{subtext}</p>
    </div>
  );
};

const CompetitorRow = ({ 
  name, 
  weakness, 
  position 
}: { 
  name: string; 
  weakness: string; 
  position: string; 
}) => (
  <div className="border-l-2 border-amber-500 pl-3">
    <p className="font-semibold text-slate-900 text-sm">{name}</p>
    <p className="text-xs text-slate-500">{weakness}</p>
    <p className="text-xs text-amber-700 font-medium mt-0.5">→ {position}</p>
  </div>
);

const DifferentiatorRow = ({ 
  title, 
  description 
}: { 
  title: string; 
  description: string; 
}) => (
  <div className="flex items-start gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
    <div>
      <p className="font-semibold text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  </div>
);
