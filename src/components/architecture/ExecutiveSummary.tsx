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
            UAE real estate brokerages lose <span className="text-amber-400 font-semibold">30-40% of potential revenue</span> to 
            compliance delays, manual processes, and fragmented systems. MiCasa BOS is the first purpose-built 
            operating system that unifies lead management, regulatory compliance, and transaction execution—turning 
            operational friction into competitive advantage.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6 print:break-inside-avoid">
          <MetricCard 
            icon={Clock}
            value="45%"
            label="Faster Close"
            subtext="vs. industry avg"
            color="emerald"
          />
          <MetricCard 
            icon={Shield}
            value="99.2%"
            label="Compliance Rate"
            subtext="RERA/DLD aligned"
            color="blue"
          />
          <MetricCard 
            icon={Users}
            value="3x"
            label="Agent Capacity"
            subtext="deals per agent"
            color="purple"
          />
          <MetricCard 
            icon={DollarSign}
            value="60%"
            label="Lower CPL"
            subtext="cost per lead"
            color="amber"
          />
        </div>

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
                weakness="40% time lost to admin tasks"
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
                description="RERA/DLD rules engine blocks violations before they happen"
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

        {/* Market & Traction */}
        <div className="grid grid-cols-3 gap-4 mb-6 print:break-inside-avoid">
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">$8.2B</p>
            <p className="text-sm text-slate-600 mt-1">UAE PropTech TAM</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">2,500+</p>
            <p className="text-sm text-slate-600 mt-1">Licensed Brokerages</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">AED 450B</p>
            <p className="text-sm text-slate-600 mt-1">Annual Transaction Volume</p>
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
