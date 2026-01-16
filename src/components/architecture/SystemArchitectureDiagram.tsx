import { 
  Building2, 
  Globe, 
  MessageSquare, 
  Users,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Workflow,
  CheckCircle2,
  Clock,
  Ban,
  FileCheck,
  MessageCircle,
  Brain,
  Sparkles,
  Languages,
  Target,
  FileText,
  Phone,
  Database,
  Lock,
  UserCheck,
  Monitor,
  Eye,
  ClipboardCheck,
  Send,
  PhoneCall,
  Calendar,
  BarChart3,
  TrendingUp,
  FileSearch,
  ArrowDown,
  ArrowRight,
  X,
  Check
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">MiCasa System Architecture</h1>
        <p className="text-muted-foreground">Production-Grade Real Estate Operating System</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            Hard Gate (Blocks)
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            Deterministic Rules
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-violet-500" />
            AI Advisory Only
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            System of Record
          </span>
        </div>
      </div>

      {/* Layer 1: Lead Sources */}
      <Layer 
        number={1} 
        title="Lead & Event Sources" 
        subtitle="Entry points into the system"
        color="from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-950/30"
        borderColor="border-blue-200 dark:border-blue-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComponentBox
            icon={<Building2 className="w-6 h-6" />}
            title="Property Finder"
            subtitle="Primary Lead Source"
            items={[
              "Enterprise API Integration",
              "Webhooks: lead.created, lead.assigned, lead.updated",
              "Structured metadata with full context"
            ]}
            variant="primary"
            badge="Primary"
            size="lg"
          />
          <div className="space-y-3">
            <ComponentBox
              icon={<Globe className="w-5 h-5" />}
              title="Website Forms"
              subtitle="Direct inquiries"
              variant="secondary"
              size="sm"
            />
            <ComponentBox
              icon={<MessageSquare className="w-5 h-5" />}
              title="WhatsApp Inbound"
              subtitle="Messaging inquiries"
              variant="secondary"
              size="sm"
            />
            <ComponentBox
              icon={<Users className="w-5 h-5" />}
              title="Referrals & Manual Entry"
              subtitle="Agent-sourced leads"
              variant="secondary"
              size="sm"
            />
          </div>
        </div>
      </Layer>

      <FlowArrow label="All leads must pass validation" />

      {/* Layer 2: Regulatory Validation */}
      <Layer 
        number={2} 
        title="Regulatory Validation" 
        subtitle="HARD GATE — Failure blocks all downstream processing"
        color="from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30"
        borderColor="border-red-300 dark:border-red-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ComponentBox
            icon={<Shield className="w-5 h-5" />}
            title="DARI"
            subtitle="Project & Unit Validation"
            items={["Verify project registration", "Confirm unit availability"]}
            variant="danger"
          />
          <ComponentBox
            icon={<ShieldCheck className="w-5 h-5" />}
            title="MADMOUN"
            subtitle="Listing Approval"
            items={["Listing authenticity check", "Price validation"]}
            variant="danger"
          />
          <ComponentBox
            icon={<BadgeCheck className="w-5 h-5" />}
            title="ADREC"
            subtitle="Broker Authorization"
            items={["License verification", "Advertiser credentials"]}
            variant="danger"
          />
        </div>
        <div className="flex items-center justify-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
          <GateIndicator type="block" />
          <span className="text-xs text-muted-foreground">if validation fails → workflow blocked, logged for audit</span>
          <GateIndicator type="pass" />
          <span className="text-xs text-muted-foreground">if all pass → proceed to automation</span>
        </div>
      </Layer>

      <FlowArrow label="Only validated leads proceed" />

      {/* Layer 3: Automation & Guardrails */}
      <Layer 
        number={3} 
        title="Automation & Guardrails" 
        subtitle="DETERMINISTIC — Rule-based, non-AI enforcement"
        color="from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
        borderColor="border-amber-300 dark:border-amber-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComponentBox
            icon={<Workflow className="w-6 h-6" />}
            title="n8n Workflow Engine"
            subtitle="Orchestration Layer"
            items={[
              "Workflow state management",
              "Conditional routing",
              "Integration orchestration"
            ]}
            variant="warning"
            size="lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <ComponentBox
              icon={<CheckCircle2 className="w-4 h-4" />}
              title="Consent Check"
              variant="warning"
              size="sm"
            />
            <ComponentBox
              icon={<Clock className="w-4 h-4" />}
              title="Time Windows"
              variant="warning"
              size="sm"
            />
            <ComponentBox
              icon={<Ban className="w-4 h-4" />}
              title="DNCR Check"
              variant="warning"
              size="sm"
            />
            <ComponentBox
              icon={<FileCheck className="w-4 h-4" />}
              title="Data Validation"
              variant="warning"
              size="sm"
            />
            <div className="col-span-2">
              <ComponentBox
                icon={<MessageCircle className="w-4 h-4" />}
                title="WhatsApp Template Enforcement"
                subtitle="Only approved templates allowed"
                variant="warning"
                size="sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
          <GateIndicator type="block" />
          <span className="text-xs text-muted-foreground">any rule fails → blocked & logged</span>
          <GateIndicator type="pass" />
          <span className="text-xs text-muted-foreground">all rules pass → proceed to AI layer</span>
        </div>
      </Layer>

      <FlowArrow label="Only compliant leads reach AI" />

      {/* Layer 4: AI Interpretation */}
      <Layer 
        number={4} 
        title="AI Interpretation" 
        subtitle="ADVISORY ONLY — Suggestions, never execution"
        color="from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30"
        borderColor="border-violet-300 dark:border-violet-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComponentBox
            icon={<Brain className="w-6 h-6" />}
            title="OpenAI API"
            subtitle="Model-Agnostic LLM Gateway"
            items={[
              "Stateless inference",
              "No persistent memory",
              "Auditable prompts"
            ]}
            variant="purple"
            size="lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <ComponentBox
              icon={<Target className="w-4 h-4" />}
              title="Intent Classification"
              variant="purple"
              size="sm"
            />
            <ComponentBox
              icon={<Languages className="w-4 h-4" />}
              title="Language Detection"
              variant="purple"
              size="sm"
            />
            <ComponentBox
              icon={<Sparkles className="w-4 h-4" />}
              title="Qualification Extraction"
              variant="purple"
              size="sm"
            />
            <ComponentBox
              icon={<FileText className="w-4 h-4" />}
              title="Message Drafting"
              variant="purple"
              size="sm"
            />
            <div className="col-span-2">
              <ComponentBox
                icon={<Phone className="w-4 h-4" />}
                title="Call Summarization"
                subtitle="Post-call analysis"
                variant="purple"
                size="sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-violet-100 dark:bg-violet-900/30 rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-700">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-200 dark:bg-violet-800 rounded-full">
              <X className="w-4 h-4 text-violet-700 dark:text-violet-300" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-violet-900 dark:text-violet-100">AI Boundaries (Hard Constraints)</h4>
              <ul className="mt-1 text-xs text-violet-700 dark:text-violet-300 space-y-1">
                <li>• AI cannot send messages to customers</li>
                <li>• AI cannot place or receive calls</li>
                <li>• AI cannot override compliance rules</li>
                <li>• AI cannot modify system state</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <FlowArrow label="Suggestions flow to operator" />

      {/* Layer 5 & 6: System of Record + Operator Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Layer 
          number={5} 
          title="System of Record" 
          subtitle="Single source of truth"
          color="from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30"
          borderColor="border-emerald-300 dark:border-emerald-800"
        >
          <ComponentBox
            icon={<Database className="w-6 h-6" />}
            title="Supabase"
            subtitle="Postgres + Auth + Row Level Security"
            items={[
              "Leads & Deals",
              "Activities & Events", 
              "Consent States",
              "Regulatory Checks",
              "Complete Audit Trail"
            ]}
            variant="success"
            size="lg"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1.5 rounded">
              <Lock className="w-3 h-3" />
              RLS Enforced
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1.5 rounded">
              <UserCheck className="w-3 h-3" />
              Auth Required
            </div>
          </div>
        </Layer>

        <Layer 
          number={6} 
          title="Operator Interface" 
          subtitle="Human oversight & control"
          color="from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30"
          borderColor="border-cyan-300 dark:border-cyan-800"
        >
          <ComponentBox
            icon={<Monitor className="w-6 h-6" />}
            title="Lovable BOS"
            subtitle="Brokerage Operating System UI"
            items={[
              "Human review of AI suggestions",
              "Override capabilities",
              "Compliance dashboard",
              "Task management"
            ]}
            variant="primary"
            size="lg"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 px-2 py-1.5 rounded">
              <Eye className="w-3 h-3" />
              Full Visibility
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 px-2 py-1.5 rounded">
              <ClipboardCheck className="w-3 h-3" />
              Approval Required
            </div>
          </div>
        </Layer>
      </div>

      <FlowArrow label="Human-approved actions only" />

      {/* Layer 7: Execution Channels */}
      <Layer 
        number={7} 
        title="Execution Channels" 
        subtitle="Outbound only after Layers 2-6 approval"
        color="from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30"
        borderColor="border-slate-300 dark:border-slate-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComponentBox
            icon={<Send className="w-5 h-5" />}
            title="WhatsApp Business"
            subtitle="Cloud API"
            items={["Template messages only", "Consent-verified recipients"]}
            variant="neutral"
          />
          <ComponentBox
            icon={<PhoneCall className="w-5 h-5" />}
            title="Twilio Voice"
            subtitle="Outbound Calling"
            items={["Time-window enforced", "Call recording & logging"]}
            variant="neutral"
          />
          <ComponentBox
            icon={<Calendar className="w-5 h-5" />}
            title="Calendly"
            subtitle="Scheduling"
            items={["Meeting coordination", "Calendar sync"]}
            variant="neutral"
          />
        </div>
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            All execution results logged back to System of Record (Layer 5)
          </span>
        </div>
      </Layer>

      <FlowArrow />

      {/* Layer 8: Analytics */}
      <Layer 
        number={8} 
        title="Analytics & Audit" 
        subtitle="Complete traceability"
        color="from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30"
        borderColor="border-indigo-300 dark:border-indigo-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ComponentBox
            icon={<BarChart3 className="w-5 h-5" />}
            title="Looker Studio"
            subtitle="Business Intelligence"
            variant="primary"
          />
          <ComponentBox
            icon={<TrendingUp className="w-4 h-4" />}
            title="Funnel Metrics"
            subtitle="Conversion tracking"
            variant="secondary"
            size="sm"
          />
          <ComponentBox
            icon={<ShieldCheck className="w-4 h-4" />}
            title="Compliance Reports"
            subtitle="Regulatory readiness"
            variant="secondary"
            size="sm"
          />
          <ComponentBox
            icon={<FileSearch className="w-4 h-4" />}
            title="Action Traceability"
            subtitle="Full audit trail"
            variant="secondary"
            size="sm"
          />
        </div>
      </Layer>

      {/* Footer / Validation */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-lg mb-4">Architecture Validation Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Property Finder as System Trigger</h4>
              <p className="text-xs text-muted-foreground">Clearly marked as PRIMARY source, visually dominant</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Regulatory Enforcement Visibility</h4>
              <p className="text-xs text-muted-foreground">Layer 2 clearly shows HARD GATE with blocking behavior</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Engineer Implementation Ready</h4>
              <p className="text-xs text-muted-foreground">Clear layer boundaries, explicit gates, no ambiguity</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">AI Bounded & Non-Authoritative</h4>
              <p className="text-xs text-muted-foreground">Explicit constraints listed, advisory-only labeling</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        MiCasa Architecture v1.0 • Confidential • For Investor & Engineering Review
      </div>
    </div>
  );
};

export default SystemArchitectureDiagram;
