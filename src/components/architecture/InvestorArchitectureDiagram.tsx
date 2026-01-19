import { 
  TrendingUp, Shield, Zap, BarChart3, DollarSign, Clock, Users, CheckCircle2,
  Building2, Globe, MessageSquare, Bot, FileText, Search, UserCheck, BookOpen, Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const InvestorArchitectureDiagram = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 print:px-4">
      {/* Header */}
      <div className="text-center mb-10 print:mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 print:text-3xl">
          MiCasa Platform Architecture
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
          Abu Dhabi Sales Brokerage
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 max-w-3xl mx-auto">
          Inventory-agnostic, conversation-first operating system for compliant Abu Dhabi real estate sales operations
        </p>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-4 gap-4 mb-10 print:mb-8">
        {[
          { icon: Clock, label: "Time to Close", value: "—" },
          { icon: Shield, label: "Compliance", value: "—" },
          { icon: UserCheck, label: "Agent Capacity", value: "—" },
          { icon: DollarSign, label: "Cost per Lead", value: "—" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800">
            <metric.icon className="w-5 h-5 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* 4-Layer Architecture */}
      <div className="space-y-4">
        {/* Layer 1: Lead Acquisition */}
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">1. Lead Acquisition</h2>
                  <p className="text-blue-100 text-xs">Unified ingestion from all sources (no manual re-entry)</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-3">
              {/* Property Finder - Primary */}
              <div className="col-span-5 bg-white/15 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="font-semibold">Property Finder</span>
                  <Badge className="bg-white text-blue-700 text-[10px] px-1.5 py-0 font-semibold">PRIMARY</Badge>
                </div>
                <p className="text-[11px] text-blue-100">Enterprise API + webhooks • Structured lead metadata</p>
              </div>
              
              {/* Bayut - Secondary */}
              <div className="col-span-3 bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-blue-200" />
                  <span className="font-medium text-blue-100">Bayut</span>
                </div>
                <p className="text-[10px] text-blue-200">Secondary source (where integration exists)</p>
              </div>
              
              {/* Other Sources */}
              <div className="col-span-4 bg-white/10 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Website Forms', icon: Globe },
                    { name: 'WhatsApp Inbound', icon: MessageSquare },
                    { name: 'Referrals', icon: Users },
                    { name: 'Walk-ins', icon: Users },
                  ].map((source, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-blue-100">
                      <source.icon className="w-3 h-3" />
                      {source.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-2">
            <div className="w-0.5 h-5 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Layer 2: Regulatory Verification & Enforcement */}
        <div className="relative">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">2. Regulatory Verification & Enforcement</h2>
                  <p className="text-red-100 text-xs">Deterministic validation before any action</p>
                </div>
              </div>
              <Badge className="bg-white text-red-700 font-bold px-3 py-1">Hard Gate</Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { name: "DARI", desc: "Project / unit status verification" },
                { name: "Madmoun", desc: "Listing reference & status verification (not approval)" },
                { name: "ADREC", desc: "Broker / advertiser license status verification" },
              ].map((check, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">{check.name}</span>
                  </div>
                  <p className="text-[10px] text-red-100">{check.desc}</p>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] text-red-200 italic">
              Property Finder listings assumed advertising-compliant upstream
            </p>
          </div>
          <div className="flex justify-center py-2">
            <div className="w-0.5 h-5 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Layer 3: Automation & Intelligence */}
        <div className="relative">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">3. Automation & Intelligence</h2>
                  <p className="text-purple-100 text-xs">Rules execute, AI advises</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-white/40 text-white text-[10px]">AI is advisory only</Badge>
                <Badge variant="outline" className="border-white/40 text-white text-[10px]">No autonomous execution</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Workflow Engine */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="font-semibold">Workflow Engine (non-AI rules)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {['Consent Check', 'Time Windows', 'DNCR', 'Templates'].map((rule, i) => (
                    <div key={i} className="bg-white/10 rounded px-2 py-1.5 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      {rule}
                      {rule === 'Templates' && <span className="text-[9px] text-purple-200">(speed shortcuts)</span>}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-amber-300 font-medium">
                  Rules re-checked at send-time (cannot be overridden)
                </p>
              </div>
              
              {/* AI Interpretation */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-purple-200" />
                  <span className="font-semibold">AI Interpretation (drafts only)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Intent', icon: Search },
                    { name: 'Qualify', icon: UserCheck },
                    { name: 'Draft', icon: FileText },
                    { name: 'Summarize', icon: BookOpen },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 rounded px-2 py-1.5 text-xs flex items-center gap-1.5">
                      <item.icon className="w-3 h-3 text-purple-200" />
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center py-2">
            <div className="w-0.5 h-5 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Layer 4: Execution & Analytics */}
        <div className="relative">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">4. Execution & Analytics</h2>
                  <p className="text-emerald-100 text-xs">Conversation-first CRM: lead timeline + next action</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 mb-4 text-center">
              <p className="text-sm">
                Human-approved actions via single <span className="text-emerald-200 font-semibold">Execution Gateway (PDP)</span>
              </p>
              <p className="text-[10px] text-emerald-200 mt-1">
                Company channels auto-log: WhatsApp (WABA) • Voice • Calendar
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-2" />
                <div className="font-semibold text-sm">Operator UI</div>
                <p className="text-[10px] text-emerald-100 mt-1">Conversation Timeline • Next Action • Blockers visible</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <MessageSquare className="w-5 h-5 mx-auto mb-2" />
                <div className="font-semibold text-sm">Channels</div>
                <p className="text-[10px] text-emerald-100 mt-1">Company WhatsApp (WABA) • Voice • Calendar</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <BarChart3 className="w-5 h-5 mx-auto mb-2" />
                <div className="font-semibold text-sm">Analytics</div>
                <p className="text-[10px] text-emerald-100 mt-1">Funnel • Compliance • Audit</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System of Record Badge */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Single system of record with full audit trail
        </p>
      </div>

      {/* Value Proposition - Detailed Boxes */}
      <div className="mt-8 grid grid-cols-3 gap-4 print:mt-6">
        {/* Regulatory-First */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 rounded-xl p-4 border border-red-200 dark:border-red-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-bold text-red-900 dark:text-red-300">Regulatory-First</h3>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Built for Abu Dhabi brokerage compliance.
            DARI, Madmoun, ADREC verification logged
            before any outreach. ADGM vs non-ADGM
            workflow auto-applied; wrong path blocked.
          </p>
        </div>
        
        {/* AI-Bounded */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-purple-900 dark:text-purple-300">AI-Bounded</h3>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            LLMs draft and summarize to reduce typing.
            Humans review and approve. No AI sending
            or compliance decisions. No autonomous
            AI actions yet.
          </p>
        </div>
        
        {/* Audit-Ready */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Audit-Ready</h3>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Immutable conversation timeline per lead:
            company WhatsApp thread, calls + recordings,
            approvals, failures, actor attribution.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400 print:mt-8">
        <p>MiCasa • Abu Dhabi Licensed Brokerage • Confidential</p>
      </div>
    </div>
  );
};

export default InvestorArchitectureDiagram;
