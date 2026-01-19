import { Button } from "@/components/ui/button";
import { Printer, TrendingUp, Users, DollarSign, Building2, BarChart3, AlertTriangle, Target, ArrowRight, Zap } from "lucide-react";

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
            <h1 className="text-3xl font-bold text-slate-900">Abu Dhabi Real Estate Market</h1>
          </div>
          <p className="text-lg text-slate-600 font-medium">Primary Market Focus • Dubai Future Expansion</p>
          <div className="mt-2 inline-block px-4 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
            2025-2026 Verified Data
          </div>
        </div>

        {/* Abu Dhabi Primary Market - Full Width */}
        <div className="mb-8 print:break-inside-avoid">
          <div className="border-2 border-emerald-300 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Abu Dhabi — Primary Market
              </h3>
              <p className="text-emerald-100 text-sm">Abu Dhabi Real Estate Centre (ADREC) • DARI Ecosystem</p>
            </div>
            <div className="p-6 bg-emerald-50/30">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <StatBox value="AED 94B+" label="9M 2025 Transaction Volume" note="+43.3% YoY • Strong momentum into 2026" />
                  <StatBox value="AED 61.8B" label="Sales & Purchases (9M 2025)" note="16,887 transactions" />
                  <StatBox value="2,411" label="Licensed RE Professionals" note="+47% licenses issued" />
                </div>
                <div className="space-y-4">
                  <StatBox value="6-9%" label="Apartment Rent Growth (Jan 2026)" note="Year-over-year increase" />
                  <StatBox value="3-6%" label="Villa Rent Growth (Jan 2026)" note="Sustained demand" />
                  <StatBox value="4-6%" label="Vacancy Rate" note="Low vacancy indicates strong demand" />
                </div>
              </div>
              
              {/* Prime Areas Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-2">Prime Demand Areas (2026)</p>
                <div className="flex gap-2 flex-wrap">
                  {["Saadiyat Island", "Yas Island", "Al Reem Island", "Al Khalidiyah"].map((area, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400 pt-4 mt-4 border-t border-slate-200">
                Sources: ADREC H1 2025 Report, Abu Dhabi Media Office Nov 2025, January 2026 Market Analysis
              </div>
            </div>
          </div>
        </div>

        {/* Dubai Future Expansion */}
        <div className="mb-8 print:break-inside-avoid">
          <div className="border border-blue-200 rounded-xl overflow-hidden bg-blue-50/20">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                <h3 className="font-bold text-lg">Phase 2: Dubai Expansion Opportunity</h3>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Future Roadmap</span>
            </div>
            <div className="p-5 grid grid-cols-4 gap-4">
              <div className="text-center p-3">
                <p className="text-xl font-bold text-slate-900">AED 761B</p>
                <p className="text-xs text-slate-500">2024 Transaction Volume</p>
              </div>
              <div className="text-center p-3">
                <p className="text-xl font-bold text-slate-900">~40,000</p>
                <p className="text-xs text-slate-500">Active Brokers</p>
              </div>
              <div className="text-center p-3">
                <p className="text-xl font-bold text-slate-900">7,900+</p>
                <p className="text-xs text-slate-500">Brokerage Firms</p>
              </div>
              <div className="text-center p-3">
                <p className="text-xl font-bold text-slate-900">AED 3.2B</p>
                <p className="text-xs text-slate-500">Broker Commissions H1</p>
              </div>
            </div>
            <div className="px-5 pb-4 text-[10px] text-slate-400">
              Sources: DLD Annual Report 2024, Dubai Media Office • Platform ready for RERA/DLD integration
            </div>
          </div>
        </div>

        {/* Total Addressable Market */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Total Addressable Market (UAE)
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">AED 680B</p>
              <p className="text-slate-300 text-xs mt-1">UAE Total Volume (2025)</p>
              <p className="text-[10px] text-slate-400">Continued market resilience</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">42,400+</p>
              <p className="text-slate-300 text-xs mt-1">Licensed Professionals</p>
              <p className="text-[10px] text-slate-400">Abu Dhabi 2.4K + Dubai ~40K</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">$1.55B</p>
              <p className="text-slate-300 text-xs mt-1">PropTech TAM by 2030</p>
              <p className="text-[10px] text-slate-400">17.5% CAGR • TechSci Research</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">Abu Dhabi First</p>
              <p className="text-slate-300 text-xs mt-1">Go-to-Market Strategy</p>
              <p className="text-[10px] text-slate-400">ADREC → RERA expansion</p>
            </div>
          </div>
        </div>

        {/* PropTech Trends - Technology Tailwinds */}
        <div className="border border-purple-200 rounded-xl overflow-hidden mb-8 print:break-inside-avoid">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Technology Tailwinds (2026)
            </h3>
            <p className="text-purple-100 text-xs">Global PropTech trends validating MiCasa's approach</p>
          </div>
          <div className="p-5 bg-purple-50/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="font-semibold text-slate-900 text-sm">Digital Transaction Platforms</p>
                <p className="text-xs text-slate-500 mt-1">End-to-end online property deals with intelligent matching</p>
                <p className="text-[10px] text-purple-600 mt-2">→ MiCasa: Unified deal workflows</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="font-semibold text-slate-900 text-sm">AI Operational Tools</p>
                <p className="text-xs text-slate-500 mt-1">Lease abstraction, AVMs, CRM automation reducing manual work</p>
                <p className="text-[10px] text-purple-600 mt-2">→ MiCasa: Built-in AI interpretation layer</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="font-semibold text-slate-900 text-sm">Immersive Visualization</p>
                <p className="text-xs text-slate-500 mt-1">Lidar-based 3D tours and floor plans for remote viewing</p>
                <p className="text-[10px] text-purple-600 mt-2">→ MiCasa: Future integration opportunity</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="font-semibold text-slate-900 text-sm">Integrated Ecosystems</p>
                <p className="text-xs text-slate-500 mt-1">Property search, mortgage, transaction in unified platform</p>
                <p className="text-[10px] text-purple-600 mt-2">→ MiCasa: Single system of record</p>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-4 mt-4 border-t border-slate-200">
              Sources: Industry PropTech Trend Reports 2025-2026, OneDome, Giraffe360, Anyone.com analysis
            </div>
          </div>
        </div>

        {/* Regulatory & Challenges */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Regulatory Complexity */}
          <div className="border border-slate-200 rounded-xl p-5 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Regulatory Landscape
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                <div className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold shrink-0">NOW</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Abu Dhabi — ADREC / DMT</p>
                  <p className="text-xs text-slate-500">DARI ecosystem • Madhmoun verification • Tawtheeq tenancy</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg opacity-75">
                <div className="px-2 py-1 bg-blue-400 text-white rounded text-xs font-bold shrink-0">NEXT</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Dubai — RERA / DLD</p>
                  <p className="text-xs text-slate-500">Madmoun QR codes • Ejari registration • AED 50K violation fines</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">Built for Abu Dhabi, ready for UAE-wide expansion</p>
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
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-white font-semibold">ADREC-First Platform</p>
              <p className="text-slate-400 text-sm mt-1">
                Purpose-built for Abu Dhabi compliance with DARI, Madhmoun, Tawtheeq integration
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-500" />
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
            <p>• Abu Dhabi Real Estate Centre (ADREC) H1 2025 Report</p>
            <p>• Abu Dhabi Media Office Nov 2025</p>
            <p>• Dubai Land Department (DLD) Annual Report 2024</p>
            <p>• Dubai Media Office H1 2025 Update</p>
            <p>• TechSci Research UAE PropTech Forecast 2024</p>
            <p>• Executive Search Dubai Broker Report 2025</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 mt-4 border-t border-slate-200 print:break-inside-avoid">
          <p className="font-bold text-slate-900">MiCasa • Brokerage Operating System</p>
          <p className="text-slate-500 text-sm">Abu Dhabi Licensed • contact@micasa.ae • www.micasa.ae</p>
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