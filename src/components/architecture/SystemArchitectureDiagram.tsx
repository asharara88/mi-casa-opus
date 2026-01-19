import { 
  Building2, 
  Globe, 
  MessageSquare, 
  Users,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Workflow,
  FileText,
  Monitor,
  Send,
  BarChart3,
  FileSearch,
  ArrowDown,
  X,
  Check,
  Target,
  Sparkles,
  Languages,
  Brain
} from "lucide-react";

interface LayerProps {
  number: number;
  title: string;
  subtitle?: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
}

const Layer = ({ number, title, subtitle, color, borderColor, children }: LayerProps) => (
  <div className={`relative rounded-xl border-2 ${borderColor} bg-gradient-to-br ${color} p-6 shadow-lg`}>
    <div className="absolute -top-3 left-6 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border-2 border-current shadow-sm">
      <span className="text-xs font-bold tracking-wider uppercase">Layer {number}</span>
    </div>
    <div className="mt-2 mb-4">
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

interface ComponentBoxProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  items?: string[];
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'purple' | 'neutral';
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ComponentBox = ({ 
  icon, 
  title, 
  subtitle, 
  items, 
  variant = 'neutral',
  badge,
  size = 'md'
}: ComponentBoxProps) => {
  const variantStyles = {
    primary: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    secondary: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700',
    danger: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    purple: 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800',
    neutral: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700',
  };

  const iconStyles = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-violet-600 dark:text-violet-400',
    neutral: 'text-slate-600 dark:text-slate-400',
  };

  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div className={`relative rounded-lg border ${variantStyles[variant]} ${sizeStyles[size]} shadow-sm`}>
      {badge && (
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconStyles[variant]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {items && items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {items.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const FlowArrow = ({ label, blocked }: { label?: string; blocked?: boolean }) => (
  <div className="flex flex-col items-center py-3">
    <div className={`w-0.5 h-6 ${blocked ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
    {label && (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
        blocked 
          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' 
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      }`}>
        {label}
      </span>
    )}
    <div className={`w-0.5 h-6 ${blocked ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
    <ArrowDown className={`w-4 h-4 ${blocked ? 'text-red-400' : 'text-gray-400'}`} />
  </div>
);

const GateIndicator = ({ type }: { type: 'block' | 'pass' }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
    type === 'block' 
      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800' 
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
  }`}>
    {type === 'block' ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
    {type === 'block' ? 'BLOCKED' : 'PROCEED'}
  </div>
);

export const SystemArchitectureDiagram = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-4 bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MiCasa Platform Architecture</h1>
        </div>
        <p className="text-muted-foreground">Inventory-agnostic, conversation-first operating system for compliant Abu Dhabi real estate sales operations</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            Hard Gate (Blocks)
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            Rules Execute
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-violet-500" />
            AI Advises
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            System of Record
          </span>
        </div>
      </div>

      {/* Layer 1: Lead Acquisition */}
      <Layer 
        number={1} 
        title="Lead Acquisition" 
        subtitle="Unified ingestion from all sources (no manual re-entry)"
        color="from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-950/30"
        borderColor="border-blue-200 dark:border-blue-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComponentBox
            icon={<Building2 className="w-6 h-6" />}
            title="Property Finder"
            subtitle="PRIMARY trigger"
            items={[
              "Enterprise API + webhooks",
              "Structured lead metadata",
              "Full context on ingestion"
            ]}
            variant="primary"
            badge="Primary"
            size="lg"
          />
          <div className="space-y-3">
            <ComponentBox
              icon={<Globe className="w-5 h-5" />}
              title="Bayut"
              subtitle="Secondary source (where integration exists)"
              variant="secondary"
              size="sm"
            />
            <ComponentBox
              icon={<MessageSquare className="w-5 h-5" />}
              title="WhatsApp Inbound"
              subtitle="Direct messaging inquiries"
              variant="secondary"
              size="sm"
            />
            <ComponentBox
              icon={<Users className="w-5 h-5" />}
              title="Website Forms • Referrals • Walk-ins"
              subtitle="Other lead sources"
              variant="secondary"
              size="sm"
            />
          </div>
        </div>
      </Layer>

      <FlowArrow label="All leads must pass validation" />

      {/* Layer 2: Regulatory Verification & Enforcement */}
      <Layer 
        number={2} 
        title="Regulatory Verification & Enforcement" 
        subtitle="HARD GATE — Deterministic validation before any action"
        color="from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30"
        borderColor="border-red-300 dark:border-red-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ComponentBox
            icon={<Shield className="w-5 h-5" />}
            title="DARI"
            subtitle="Project / unit status verification"
            items={["Verify project registration", "Confirm unit availability"]}
            variant="danger"
          />
          <ComponentBox
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Madhmoun"
            subtitle="Listing reference & status verification (not approval)"
            items={["MLS verification", "Authentic advertising check"]}
            variant="danger"
          />
          <ComponentBox
            icon={<BadgeCheck className="w-5 h-5" />}
            title="ADREC"
            subtitle="Broker / advertiser license status verification"
            items={["License validation", "Credential check"]}
            variant="danger"
          />
        </div>
        <div className="p-2 mb-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700 text-center">
          <span className="text-xs text-amber-700 dark:text-amber-400">Property Finder listings assumed advertising-compliant upstream</span>
        </div>
        <div className="flex items-center justify-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
          <GateIndicator type="block" />
          <span className="text-xs text-muted-foreground">validation fails → blocked, logged for audit</span>
          <GateIndicator type="pass" />
          <span className="text-xs text-muted-foreground">all pass → proceed to automation</span>
        </div>
      </Layer>

      <FlowArrow label="Only validated leads proceed" />

      {/* Layer 3: Automation & Intelligence */}
      <Layer 
        number={3} 
        title="Automation & Intelligence" 
        subtitle="Rules execute, AI advises — No autonomous execution"
        color="from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
        borderColor="border-amber-300 dark:border-amber-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Workflow Engine (non-AI rules) */}
          <div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wide">Workflow Engine (non-AI rules)</div>
            <ComponentBox
              icon={<Workflow className="w-5 h-5" />}
              title="Deterministic Rules"
              subtitle="Rules re-checked at send-time (cannot be overridden)"
              items={[
                "Consent Check",
                "Time Windows",
                "DNCR",
                "Templates (speed shortcuts)"
              ]}
              variant="warning"
              size="lg"
            />
          </div>
          {/* AI Interpretation (drafts only) */}
          <div>
            <div className="text-xs font-semibold text-violet-700 dark:text-violet-400 mb-2 uppercase tracking-wide">AI Interpretation (drafts only)</div>
            <div className="grid grid-cols-2 gap-3">
              <ComponentBox
                icon={<Target className="w-4 h-4" />}
                title="Intent"
                variant="purple"
                size="sm"
              />
              <ComponentBox
                icon={<Sparkles className="w-4 h-4" />}
                title="Qualify"
                variant="purple"
                size="sm"
              />
              <ComponentBox
                icon={<FileText className="w-4 h-4" />}
                title="Draft"
                variant="purple"
                size="sm"
              />
              <ComponentBox
                icon={<Languages className="w-4 h-4" />}
                title="Summarize"
                variant="purple"
                size="sm"
              />
            </div>
            <div className="mt-3 p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg border border-dashed border-violet-300 dark:border-violet-700 text-center">
              <span className="text-xs text-violet-700 dark:text-violet-300 font-medium">AI is advisory only • No autonomous AI actions</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
          <GateIndicator type="block" />
          <span className="text-xs text-muted-foreground">rule fails → blocked & logged</span>
          <GateIndicator type="pass" />
          <span className="text-xs text-muted-foreground">rules pass → proceed to execution</span>
        </div>
      </Layer>

      <FlowArrow label="Human-approved actions only" />

      {/* Layer 4: Execution & Analytics */}
      <Layer 
        number={4} 
        title="Execution & Analytics" 
        subtitle="Conversation-first CRM: lead timeline + next action"
        color="from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
        borderColor="border-emerald-300 dark:border-emerald-800"
      >
        <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700 text-center">
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Human-approved actions via single Execution Gateway (PDP)</span>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Company channels auto-log: WhatsApp (WABA) • Voice • Calendar</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComponentBox
            icon={<Monitor className="w-5 h-5" />}
            title="Operator UI"
            subtitle="Conversation Timeline • Next Action • Blockers visible"
            variant="success"
          />
          <ComponentBox
            icon={<Send className="w-5 h-5" />}
            title="Channels"
            subtitle="Company WhatsApp (WABA) • Voice • Calendar"
            variant="success"
          />
          <ComponentBox
            icon={<BarChart3 className="w-5 h-5" />}
            title="Analytics"
            subtitle="Funnel • Compliance • Audit"
            variant="success"
          />
        </div>
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Single system of record with full audit trail
          </span>
        </div>
      </Layer>

      {/* Core Principles Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-bold text-red-900 dark:text-red-100">Regulatory-First</h4>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
            Built for Abu Dhabi brokerage compliance. DARI, Madhmoun, ADREC verification logged before any outreach. 
            ADGM vs non-ADGM workflow auto-applied; wrong path blocked.
          </p>
        </div>
        <div className="p-5 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h4 className="font-bold text-violet-900 dark:text-violet-100">AI-Bounded</h4>
          </div>
          <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
            LLMs draft and summarize to reduce typing. Humans review and approve. 
            No AI sending or compliance decisions. No autonomous AI actions yet.
          </p>
        </div>
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <FileSearch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Audit-Ready</h4>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
            Immutable conversation timeline per lead: company WhatsApp thread, calls + recordings, 
            approvals, failures, actor attribution.
          </p>
        </div>
      </div>

      {/* Version footer */}
      <div className="text-center text-xs text-muted-foreground pt-6 mt-4 border-t">
        MiCasa • Abu Dhabi Licensed Brokerage • Confidential
      </div>
    </div>
  );
};

export default SystemArchitectureDiagram;
