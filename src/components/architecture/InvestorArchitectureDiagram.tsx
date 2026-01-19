import { TrendingUp, Shield, Zap, BarChart3, DollarSign, Clock, Users, CheckCircle2 } from "lucide-react";

const InvestorArchitectureDiagram = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 print:px-4">
      {/* Header */}
      <div className="text-center mb-12 print:mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 print:text-3xl">
          MiCasa Platform Architecture
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Inventory-agnostic infrastructure for compliant, scalable real estate operations
        </p>
      </div>

      {/* ROI Metrics Bar - Target Platform Outcomes */}
      <div className="grid grid-cols-4 gap-4 mb-12 print:mb-8">
        {[
          { icon: Clock, label: "Registration Time", value: "1-3 wks", color: "text-emerald-600", note: "ADREC benchmark" },
          { icon: Shield, label: "ADREC Violations", value: "Zero", color: "text-blue-600", note: "Compliance gate" },
          { icon: Users, label: "Agent Retention", value: ">80%", color: "text-purple-600", note: "vs 6mo avg tenure" },
          { icon: DollarSign, label: "Target CPL", value: "<AED 100", color: "text-amber-600", note: "vs AED 50-500" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 text-center border border-gray-200 dark:border-gray-800">
            <metric.icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.label}</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">{metric.note}</div>
          </div>
        ))}
      </div>

      {/* 4-Layer Architecture */}
      <div className="space-y-4">
        {/* Layer 1: Acquisition */}
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">1. Lead Acquisition</h2>
                  <p className="text-blue-100 text-sm mt-1">Unified ingestion from all sources</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Property Finder</div>
                <div className="text-blue-200 text-xs">Primary Source • Enterprise API</div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {["Website Forms", "WhatsApp", "Referrals", "Walk-ins"].map((src, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-xs">
                  {src}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-center py-2">
            <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Layer 2: Compliance */}
        <div className="relative">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">2. Regulatory Compliance</h2>
                  <p className="text-red-100 text-sm mt-1">Automated validation before any action</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Hard Gate</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { name: "DARI", desc: "Project Validation" },
                { name: "Madmoun", desc: "Listing Approval" },
                { name: "ADREC", desc: "Broker Authorization" },
              ].map((check, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold">{check.name}</div>
                  <div className="text-red-200 text-xs">{check.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center py-2">
            <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Layer 3: Intelligence */}
        <div className="relative">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">3. Automation & Intelligence</h2>
                  <p className="text-purple-100 text-sm mt-1">Rules execute, AI advises</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-purple-200">AI is advisory only</div>
                <div className="text-purple-200">No autonomous execution</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold mb-2">Workflow Engine</div>
                <div className="flex flex-wrap gap-2">
                  {["Consent Check", "Time Windows", "DNCR", "Templates"].map((rule, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="font-semibold mb-2">AI Interpretation</div>
                <div className="flex flex-wrap gap-2">
                  {["Intent", "Qualify", "Draft", "Summarize"].map((fn, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                      {fn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-2">
            <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Layer 4: Operations */}
        <div className="relative">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">4. Execution & Analytics</h2>
                  <p className="text-emerald-100 text-sm mt-1">Human-approved actions, full auditability</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="font-semibold">Operator UI</div>
                <div className="text-emerald-200 text-xs">Review & Approve</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="font-semibold">Channels</div>
                <div className="text-emerald-200 text-xs">WhatsApp • Voice • Calendar</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="font-semibold">Analytics</div>
                <div className="text-emerald-200 text-xs">Funnel • Compliance • Audit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System of Record Badge */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-full">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-medium">Single System of Record</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300 text-sm">Full Event Traceability</span>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="mt-12 grid grid-cols-3 gap-6 print:mt-8">
        {[
          {
            title: "Regulatory-First",
            desc: "Built for UAE real estate compliance from day one. DARI, Madmoun, ADREC integrated.",
          },
          {
            title: "AI-Bounded",
            desc: "LLMs interpret and suggest. Humans approve. Rules execute. No autonomous AI actions.",
          },
          {
            title: "Audit-Ready",
            desc: "Every action logged. Complete traceability. Regulator-friendly reporting.",
          },
        ].map((prop, idx) => (
          <div key={idx} className="text-center p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{prop.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{prop.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400 print:mt-8">
        <p>MiCasa • Inventory-Agnostic Real Estate Infrastructure • Confidential</p>
      </div>
    </div>
  );
};

export default InvestorArchitectureDiagram;
