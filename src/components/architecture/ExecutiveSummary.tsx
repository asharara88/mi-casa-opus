import { Button } from "@/components/ui/button";
import { Printer, TrendingUp, Shield, Zap, DollarSign, Target, Users, Clock } from "lucide-react";

export const ExecutiveSummary = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Button - Hidden (handled by parent Architecture.tsx header) */}

      {/* Executive Summary Content */}
      <div className="max-w-[1000px] mx-auto p-4 md:p-8 print:p-6 print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 print:mb-6">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base md:text-lg">M</span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-slate-900">MiCasa BOS</h1>
          </div>
          <p className="text-sm md:text-lg text-slate-600 font-medium">Brokerage Operating System for UAE Real Estate</p>
          <div className="mt-2 inline-block px-3 md:px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-xs md:text-sm font-medium">
            Executive Summary
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mb-6 text-white print:break-inside-avoid">
          <h2 className="text-xl font-bold mb-3">The Opportunity</h2>
          <p className="text-slate-300 leading-relaxed">
            Abu Dhabi's real estate market shows <span className="text-amber-400 font-semibold">continued resilience entering 2026</span>, with 
            <span className="text-amber-400 font-semibold"> 2,411 licensed professionals</span> and AED 94B+ in transaction volume (9M 2025). 
            The broader UAE combined market recorded <span className="text-amber-400 font-semibold">AED 857B</span> in 2024 (Dubai 761B + Abu Dhabi 96B). 
            Apartment rents grew 6-9% YoY as of January 2026, with vacancy rates at just 4-6%. 
            MiCasa BOS is the first purpose-built operating system for ADREC compliance—turning operational friction into competitive advantage.
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Sources: DLD (Jan 2025), Dubai Media Office (Jul 2025), Abu Dhabi Media Office (Nov 2025)</p>
        </div>

        {/* Key Metrics Grid - Platform Target Outcomes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 print:break-inside-avoid">
          <MetricCard 
            icon={Clock}
            value="<1 day"
            label="Target Close"
            subtext="DLD: 20 min once ready"
            color="emerald"
          />
          <MetricCard 
            icon={Shield}
            value="Designed"
            label="For Compliance"
            subtext="ADREC/RERA gates"
            color="blue"
          />
          <MetricCard 
            icon={Users}
            value=">80%"
            label="Retention Goal"
            subtext="with tools (industry)"
            color="purple"
          />
          <MetricCard 
            icon={DollarSign}
            value="<AED 100"
            label="Target CPL"
            subtext="vs AED 50-500 range"
            color="amber"
          />
        </div>
        <p className="text-[10px] text-slate-400 -mt-4 mb-4 text-right">Platform targets • DLD registration time verified (Jan 2026)</p>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          
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
                weakness="Compliance checks slow every transaction"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 print:break-inside-avoid">
          <div className="bg-slate-50 rounded-xl p-3 md:p-5 text-center">
            <p className="text-xl md:text-3xl font-bold text-slate-900">$1.55B</p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">UAE PropTech TAM by 2030</p>
            <p className="text-[10px] text-slate-400 mt-0.5">TechSci Research (May 2025)</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 md:p-5 text-center">
            <p className="text-xl md:text-3xl font-bold text-slate-900">AED 857B</p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">UAE Combined (2024)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">DLD + AD Media Office</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 md:p-5 text-center">
            <p className="text-xl md:text-3xl font-bold text-slate-900">6-9%</p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">Apartment Rent Growth</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Jan 2026 YoY</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 md:p-5 text-center">
            <p className="text-xl md:text-3xl font-bold text-slate-900">4-6%</p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">Vacancy Rate</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Low = Strong Demand</p>
          </div>
        </div>

        {/* Business Model */}
        <div className="border border-slate-200 rounded-xl p-4 md:p-5 mb-6 print:break-inside-avoid">
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
            Revenue Model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="font-bold text-slate-900 text-sm md:text-base">SaaS License</p>
              <p className="text-xs md:text-sm text-slate-600">Per-seat monthly subscription</p>
              <p className="text-xs text-amber-700 mt-1">~70% of revenue</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-bold text-slate-900 text-sm md:text-base">Transaction Fees</p>
              <p className="text-xs md:text-sm text-slate-600">Success-based deal fees</p>
              <p className="text-xs text-blue-700 mt-1">~20% of revenue</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="font-bold text-slate-900 text-sm md:text-base">Value-Add Services</p>
              <p className="text-xs md:text-sm text-slate-600">AI insights, integrations</p>
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
