import { Button } from "@/components/ui/button";
import { Printer, TrendingUp, Users, DollarSign, Building2, BarChart3, AlertTriangle, Target } from "lucide-react";

export const MarketContextSlide = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Button */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800">
          <Printer className="w-4 h-4" />
          Save as PDF
        </Button>
      </div>

      <div className="max-w-[1000px] mx-auto p-8 print:p-6 print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Dubai Real Estate Market</h1>
          </div>
          <p className="text-lg text-slate-600 font-medium">Market Context & Competitive Dynamics</p>
          <div className="mt-2 inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            2024-2025 Data
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 print:break-inside-avoid">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <p className="text-4xl font-bold">AED 761B</p>
            <p className="text-blue-100 text-sm mt-1">2024 Transaction Volume</p>
            <p className="text-[10px] text-blue-200 mt-2">+20% YoY • 226K transactions</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <p className="text-4xl font-bold">AED 3.2B</p>
            <p className="text-emerald-100 text-sm mt-1">Broker Commissions (H1 2025)</p>
            <p className="text-[10px] text-emerald-200 mt-2">Nearly 2x vs 2024 levels</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white text-center">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-80" />
            <p className="text-4xl font-bold">~40,000</p>
            <p className="text-purple-100 text-sm mt-1">Active Brokers</p>
            <p className="text-[10px] text-purple-200 mt-2">+37 new agents per day</p>
          </div>
        </div>

        {/* Market Dynamics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Growth Metrics */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Market Growth Indicators
            </h3>
            <div className="space-y-4">
              <MetricRow 
                label="Brokerage Firms"
                value="7,900+"
                change="+70% hiring YoY"
                source="Executive Search 2025"
              />
              <MetricRow 
                label="H1 2025 Volume"
                value="AED 431B"
                change="+25% vs H1 2024"
                source="Dubai Media Office"
              />
              <MetricRow 
                label="PropTech Market"
                value="$610M → $1.55B"
                change="17.5% CAGR to 2030"
                source="TechSci Research"
              />
              <MetricRow 
                label="Avg Broker Commission"
                value="AED 18K/mo"
                change="Top performers >AED 1M/yr"
                source="Executive Search 2025"
              />
            </div>
          </div>

          {/* Competitive Challenges */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Competitive Pressure Points
            </h3>
            <div className="space-y-4">
              <ChallengeRow 
                title="High Churn Rate"
                stat="<6 months"
                description="Average broker tenure falling from 12 months"
              />
              <ChallengeRow 
                title="Income Inequality"
                stat="Top 10%"
                description="Earn majority of commissions; most struggle"
              />
              <ChallengeRow 
                title="Compliance Risk"
                stat="AED 50K"
                description="Per violation fine (30 companies fined Feb 2024)"
              />
              <ChallengeRow 
                title="Lead Costs"
                stat="AED 50-500"
                description="Cost per lead varies 10x by channel quality"
              />
            </div>
          </div>
        </div>

        {/* The Opportunity */}
        <div className="bg-slate-900 rounded-xl p-6 mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            The MiCasa Opportunity
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-white font-semibold">Retention Crisis</p>
              <p className="text-slate-400 text-sm mt-1">
                Brokerages with training & tools achieve 80-90% retention vs industry avg of &lt;50%
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-white font-semibold">Fragmented Tech</p>
              <p className="text-slate-400 text-sm mt-1">
                No unified platform for UAE compliance, CRM, and transaction management
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-white font-semibold">Scale Opportunity</p>
              <p className="text-slate-400 text-sm mt-1">
                140,000+ apartments & 30,000+ villas under construction need brokerage support
              </p>
            </div>
          </div>
        </div>

        {/* Source Citations */}
        <div className="border-t border-slate-200 pt-4 print:break-inside-avoid">
          <p className="text-xs text-slate-500 font-medium mb-2">Data Sources:</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <p>• Dubai Land Department (DLD) Annual Report 2024</p>
            <p>• Dubai Media Office H1 2025 Update</p>
            <p>• Executive Search Dubai Broker Report 2025</p>
            <p>• TechSci Research UAE PropTech Forecast 2024</p>
            <p>• RERA Enforcement Announcements Feb 2024</p>
            <p>• Tasc Group UAE Hiring Analysis 2025</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 mt-4 border-t border-slate-200 print:break-inside-avoid">
          <p className="font-bold text-slate-900">MiCasa • Brokerage Operating System</p>
          <p className="text-slate-500 text-sm">contact@micasa.ae • www.micasa.ae</p>
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

const MetricRow = ({ 
  label, 
  value, 
  change, 
  source 
}: { 
  label: string; 
  value: string; 
  change: string; 
  source: string;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <div>
      <p className="font-medium text-slate-900 text-sm">{label}</p>
      <p className="text-[10px] text-slate-400">{source}</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-slate-900">{value}</p>
      <p className="text-xs text-emerald-600">{change}</p>
    </div>
  </div>
);

const ChallengeRow = ({ 
  title, 
  stat, 
  description 
}: { 
  title: string; 
  stat: string; 
  description: string;
}) => (
  <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold shrink-0">
      {stat}
    </div>
    <div>
      <p className="font-medium text-slate-900 text-sm">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </div>
);

export default MarketContextSlide;
