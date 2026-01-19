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

      <div className="max-w-[1100px] mx-auto p-8 print:p-6 print:max-w-none">
        
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">UAE Real Estate Market</h1>
          </div>
          <p className="text-lg text-slate-600 font-medium">Dubai & Abu Dhabi Market Context</p>
          <div className="mt-2 inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            2024-2025 Verified Data
          </div>
        </div>

        {/* Dubai vs Abu Dhabi Comparison */}
        <div className="grid grid-cols-2 gap-6 mb-8 print:break-inside-avoid">
          {/* Dubai Column */}
          <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dubai
              </h3>
              <p className="text-blue-100 text-xs">Dubai Land Department (DLD)</p>
            </div>
            <div className="p-5 space-y-4 bg-blue-50/30">
              <StatBox value="AED 761B" label="2024 Transaction Volume" note="+20% YoY • 226K transactions" />
              <StatBox value="AED 431B" label="H1 2025 Volume" note="+25% vs H1 2024" />
              <StatBox value="~40,000" label="Active Brokers" note="+37 new agents/day" />
              <StatBox value="7,900+" label="Brokerage Firms" note="+70% hiring YoY" />
              <StatBox value="AED 3.2B" label="Broker Commissions (H1 2025)" note="Nearly 2x vs 2024" />
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                Sources: DLD Annual Report 2024, Dubai Media Office, Executive Search 2025
              </div>
            </div>
          </div>

          {/* Abu Dhabi Column */}
          <div className="border-2 border-emerald-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Abu Dhabi
              </h3>
              <p className="text-emerald-100 text-xs">Abu Dhabi Real Estate Centre (ADREC)</p>
            </div>
            <div className="p-5 space-y-4 bg-emerald-50/30">
              <StatBox value="AED 94B" label="9M 2025 Transaction Volume" note="+43.3% YoY • 29.4K transactions" />
              <StatBox value="AED 61.8B" label="Sales & Purchases (9M 2025)" note="16,887 transactions" />
              <StatBox value="2,411" label="Licensed RE Professionals" note="+47% licenses issued" />
              <StatBox value="AED 32.2B" label="Mortgage Activity (9M 2025)" note="12,666 transactions" />
              <StatBox value="AED 21.9B" label="Non-Oil GDP Contribution (H1 2025)" note="Real estate sector" />
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                Sources: ADREC H1 2025 Report, Abu Dhabi Media Office Nov 2025
              </div>
            </div>
          </div>
        </div>

        {/* Combined UAE Market */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Combined UAE Market Opportunity
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">AED 855B+</p>
              <p className="text-slate-300 text-xs mt-1">Combined Annual Volume</p>
              <p className="text-[10px] text-slate-400">Dubai + Abu Dhabi 2024</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">42,400+</p>
              <p className="text-slate-300 text-xs mt-1">Licensed Professionals</p>
              <p className="text-[10px] text-slate-400">Dubai ~40K + Abu Dhabi 2.4K</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">$1.55B</p>
              <p className="text-slate-300 text-xs mt-1">PropTech TAM by 2030</p>
              <p className="text-[10px] text-slate-400">17.5% CAGR • TechSci Research</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">2 Regulators</p>
              <p className="text-slate-300 text-xs mt-1">Compliance Complexity</p>
              <p className="text-[10px] text-slate-400">RERA (Dubai) + ADREC (AD)</p>
            </div>
          </div>
        </div>

        {/* Competitive Dynamics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Regulatory Complexity */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Regulatory Landscape
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold shrink-0">Dubai</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">RERA / DLD</p>
                  <p className="text-xs text-slate-500">Madmoun QR codes required • AED 50K violation fines</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold shrink-0">Abu Dhabi</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">ADREC / DMT</p>
                  <p className="text-xs text-slate-500">DARI ecosystem • Madhmoun verification platform</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">Brokerages operating across both emirates face dual compliance requirements</p>
            </div>
          </div>

          {/* Market Challenges */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Competitive Pressure Points
            </h3>
            <div className="space-y-3">
              <ChallengeRow 
                title="High Churn Rate (Dubai)"
                stat="<6 months"
                description="Average broker tenure falling from 12 months"
              />
              <ChallengeRow 
                title="Income Inequality"
                stat="Top 10%"
                description="Earn majority of commissions; most struggle"
              />
              <ChallengeRow 
                title="Lead Costs"
                stat="AED 50-500"
                description="Cost per lead varies 10x by channel quality"
              />
              <ChallengeRow 
                title="Compliance Risk"
                stat="AED 50K+"
                description="Per violation fine across both emirates"
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
              <p className="text-white font-semibold">Dual Compliance</p>
              <p className="text-slate-400 text-sm mt-1">
                No unified platform handles both RERA (Dubai) and ADREC (Abu Dhabi) requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-white font-semibold">Scale Opportunity</p>
              <p className="text-slate-400 text-sm mt-1">
                140,000+ apartments & 30,000+ villas under construction across UAE
              </p>
            </div>
          </div>
        </div>

        {/* Source Citations */}
        <div className="border-t border-slate-200 pt-4 print:break-inside-avoid">
          <p className="text-xs text-slate-500 font-medium mb-2">Data Sources (All Verified):</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <p>• Dubai Land Department (DLD) Annual Report 2024</p>
            <p>• Abu Dhabi Real Estate Centre (ADREC) H1 2025 Report</p>
            <p>• Dubai Media Office H1 2025 Update</p>
            <p>• Abu Dhabi Media Office Nov 2025</p>
            <p>• Executive Search Dubai Broker Report 2025</p>
            <p>• TechSci Research UAE PropTech Forecast 2024</p>
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

const StatBox = ({ value, label, note }: { value: string; label: string; note: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-slate-700 text-sm">{label}</p>
      <p className="text-[10px] text-slate-400">{note}</p>
    </div>
    <p className="font-bold text-slate-900 text-lg">{value}</p>
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
