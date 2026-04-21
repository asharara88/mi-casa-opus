import { SlideLayout, SlideTitle, GoldDivider } from "../SlideLayout";
import { MiCasaLogo } from "@/components/branding/MiCasaLogo";
import {
  Building2, Users, Workflow, ShieldCheck, Brain, FileText, MapPin, Calculator,
  Database, Lock, Zap, Layers, GitBranch, CheckCircle2, AlertTriangle, TrendingUp,
  Sparkles, Code2, Cloud, Globe, Phone, Mail, MessageSquare, ArrowRight, Target,
  ListChecks, Network, Cpu, FileCheck, Activity, KanbanSquare, Inbox, BarChart3,
} from "lucide-react";

const TOTAL = 20;
const N = (n: number) => ({ slideNumber: n, totalSlides: TOTAL });

// ============ SLIDE 1 — TITLE ============
export const Slide01 = () => (
  <SlideLayout {...N(1)} variant="title" hideFooter>
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-16 relative">
      <div className="absolute top-16 left-16">
        <span className="text-white font-bold tracking-[0.3em] text-2xl">MI CASA</span>
        <div className="text-white/50 text-sm tracking-[0.2em] mt-1">PROPERTY SOLUTIONS</div>
      </div>
      <div className="text-[#d4a574] text-sm font-bold tracking-[0.4em] uppercase mb-8">
        Technical Partner Briefing · 2026
      </div>
      <h1 className="text-[7rem] leading-[1.05] font-bold text-white mb-8 max-w-[1500px]">
        A Compliance-Native<br />
        <span className="bg-gradient-to-r from-[#d4a574] via-[#e8c89d] to-[#d4a574] bg-clip-text text-transparent">
          Real Estate OS
        </span>
      </h1>
      <p className="text-3xl text-white/70 max-w-[1100px] leading-relaxed">
        The Business Operating System purpose-built for the Abu Dhabi brokerage market — where rules execute, AI advises, and every action is audit-ready by design.
      </p>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-8 text-white/40 text-sm">
        <span>micasa.ae</span><span>·</span><span>CN-3762725</span><span>·</span><span>Abu Dhabi · UAE</span>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 2 — PROBLEM ============
export const Slide02 = () => (
  <SlideLayout {...N(2)}>
    <SlideTitle kicker="The Problem">A fragmented stack that breaks at every handoff</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-8">
      {[
        { icon: Users, title: "Lead capture lives in spreadsheets", body: "WhatsApp, web forms, walk-ins, portals — all funneling into disconnected lists. No deduplication, no scoring, no SLA." },
        { icon: FileText, title: "Compliance is a paperwork scramble", body: "DARI, Tawtheeq, Madhmoun, BRN — agents hunt for permits, screenshots, and approvals at every stage. Audit prep takes weeks." },
        { icon: Workflow, title: "Deal stages drift across tools", body: "Pipeline in one CRM, documents in Google Drive, signatures in PDF, commissions in Excel. Status truth lives nowhere." },
        { icon: Brain, title: "AI tools sit beside the workflow, not inside", body: "ChatGPT in another tab. No context, no audit trail, no enforcement of brokerage policy or Abu Dhabi regulation." },
      ].map((p, i) => (
        <div key={i} className="bg-gradient-to-br from-red-50 to-orange-50/50 border border-red-100 rounded-2xl p-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <p.icon className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1a365d] mb-2">{p.title}</h3>
              <p className="text-lg text-gray-600 leading-relaxed">{p.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </SlideLayout>
);

// ============ SLIDE 3 — THESIS ============
export const Slide03 = () => (
  <SlideLayout {...N(3)} variant="dark">
    <SlideTitle kicker="Our Thesis" variant="dark">Rules execute. AI advises.</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-12 items-start">
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-7 h-7 text-[#d4a574]" />
            <h3 className="text-2xl font-bold text-white">Deterministic core</h3>
          </div>
          <p className="text-lg text-white/70 leading-relaxed">
            Compliance gates, commission math, document templates, and stage transitions are <span className="text-[#d4a574] font-semibold">code, not prompts</span>. Same input, same output, every time. Auditable in plain SQL.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-7 h-7 text-[#d4a574]" />
            <h3 className="text-2xl font-bold text-white">AI as advisor, never authority</h3>
          </div>
          <p className="text-lg text-white/70 leading-relaxed">
            Mi Ai drafts, summarizes, and recommends — but every action requires a human Apply or Dismiss, logged with rationale to the event store.
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#d4a574]/10 to-transparent border border-[#d4a574]/20 rounded-2xl p-10">
        <div className="text-[#d4a574] text-sm font-bold tracking-widest mb-6">CONFLICT RESOLUTION</div>
        <div className="space-y-4">
          {["Abu Dhabi regulation (DMT/DARI/Tawtheeq)", "MiCasa internal policy", "Client preferences", "AI suggestion"].map((rule, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#d4a574] text-[#0a1628] font-bold flex items-center justify-center text-lg">{i + 1}</div>
              <span className="text-xl text-white">{rule}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-white/60 text-base italic">
          When sources conflict, the higher-priority rule always wins — and the system explains why.
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 4 — ARCHITECTURE OVERVIEW ============
export const Slide04 = () => (
  <SlideLayout {...N(4)}>
    <SlideTitle kicker="System Architecture">Five layers, one operating model</SlideTitle>
    <div className="px-16 pb-8">
      <div className="space-y-3">
        {[
          { name: "Presentation Layer", tech: "React 18 · Vite · TypeScript · Tailwind · shadcn/ui", color: "from-blue-500/10 to-blue-500/5", border: "border-blue-200", icon: Layers, accent: "text-blue-600" },
          { name: "Application Logic", tech: "TanStack Query · React Router · Context Providers · Custom Hooks", color: "from-purple-500/10 to-purple-500/5", border: "border-purple-200", icon: Code2, accent: "text-purple-600" },
          { name: "API & Edge Functions", tech: "Supabase Edge (Deno) · JWT auth · Lovable AI Gateway", color: "from-amber-500/10 to-amber-500/5", border: "border-amber-200", icon: Zap, accent: "text-amber-600" },
          { name: "Data & Storage", tech: "Postgres · Row-Level Security · Storage Buckets · Realtime", color: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-200", icon: Database, accent: "text-emerald-600" },
          { name: "External Integrations", tech: "DARI · Tawtheeq · Madhmoun · Onwani · Natoor · AECB", color: "from-[#d4a574]/15 to-[#d4a574]/5", border: "border-[#d4a574]/40", icon: Network, accent: "text-[#d4a574]" },
        ].map((layer, i) => (
          <div key={i} className={`bg-gradient-to-r ${layer.color} border ${layer.border} rounded-xl px-8 py-6 flex items-center gap-6`}>
            <div className={`w-14 h-14 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
              <layer.icon className={`w-7 h-7 ${layer.accent}`} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-[#1a365d]">{layer.name}</div>
              <div className="text-base text-gray-600 mt-1 font-mono">{layer.tech}</div>
            </div>
            <div className={`text-3xl font-bold ${layer.accent} opacity-50`}>{String(i + 1).padStart(2, "0")}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-[#1a365d]/5 border border-[#1a365d]/10 rounded-xl px-8 py-5 flex items-center justify-between">
        <span className="text-lg text-[#1a365d] font-semibold">Cross-cutting: Event log · Evidence store · Audit trail · Consent management</span>
        <Activity className="w-6 h-6 text-[#d4a574]" />
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 5 — TECH STACK ============
export const Slide05 = () => (
  <SlideLayout {...N(5)}>
    <SlideTitle kicker="Tech Stack">Modern, typed, batteries included</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-3 gap-6">
      {[
        { cat: "Frontend", color: "blue", items: ["React 18", "Vite 5", "TypeScript 5", "Tailwind CSS 3", "shadcn/ui", "Lucide Icons"] },
        { cat: "State & Data", color: "purple", items: ["TanStack Query v5", "React Router 6", "React Context", "Zod validation", "date-fns", "Recharts"] },
        { cat: "Backend (Lovable Cloud)", color: "emerald", items: ["Supabase Postgres 15", "Row-Level Security", "Edge Functions (Deno)", "Storage Buckets", "Realtime", "JWT Auth"] },
        { cat: "AI Layer", color: "amber", items: ["Lovable AI Gateway", "OpenAI GPT-5 family", "Google Gemini 2.5", "Prompt Builder", "FAQ engine", "Audit-logged advice"] },
        { cat: "External APIs", color: "rose", items: ["DARI permit checks", "Tawtheeq lease registry", "Madhmoun listing portal", "Onwani address lookup", "AECB credit", "Natoor sync"] },
        { cat: "DevOps", color: "slate", items: ["Lovable hosting", "Auto edge deploys", "Supabase migrations", "Type-safe DB client", "Preview environments", "Custom domains"] },
      ].map((stack, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-7 hover:shadow-lg transition-shadow">
          <div className={`text-xs font-bold tracking-widest uppercase mb-4 text-${stack.color}-600`}>{stack.cat}</div>
          <ul className="space-y-2.5">
            {stack.items.map((it, j) => (
              <li key={j} className="flex items-center gap-3 text-lg text-[#1a365d]">
                <div className={`w-1.5 h-1.5 rounded-full bg-${stack.color}-500`} />
                {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </SlideLayout>
);

// ============ SLIDE 6 — DATA MODEL ============
export const Slide06 = () => (
  <SlideLayout {...N(6)}>
    <SlideTitle kicker="Unified Data Model">One contact, many relationships</SlideTitle>
    <div className="px-16 pb-8">
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { name: "contacts", desc: "People & companies", fields: ["full_name", "email · phone", "lifecycle_stage", "owner_user_id", "consents"], color: "blue" },
          { name: "opportunities", desc: "Active pipeline", fields: ["pipeline_stage", "budget_min/max", "bedrooms", "financing", "source"], color: "purple" },
          { name: "deals", desc: "Executed transactions", fields: ["deal_state", "deal_type", "compliance_status", "commission", "parties"], color: "emerald" },
          { name: "activities & tasks", desc: "Timeline + to-dos", fields: ["activity_type", "channel", "due_at", "priority", "owner"], color: "amber" },
        ].map((t, i) => (
          <div key={i} className={`bg-${t.color}-50 border-2 border-${t.color}-200 rounded-xl p-5`}>
            <div className={`text-xs font-mono font-bold text-${t.color}-700 mb-1`}>TABLE</div>
            <div className="text-2xl font-bold text-[#1a365d] mb-1">{t.name}</div>
            <div className="text-sm text-gray-600 mb-4">{t.desc}</div>
            <ul className="space-y-1">
              {t.fields.map((f, j) => (
                <li key={j} className="text-sm font-mono text-gray-700">· {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 text-xl text-[#1a365d] font-semibold mb-6">
        <span className="px-4 py-2 bg-blue-100 rounded-lg">Contact</span>
        <ArrowRight className="w-6 h-6 text-[#d4a574]" />
        <span className="px-4 py-2 bg-purple-100 rounded-lg">Opportunity</span>
        <ArrowRight className="w-6 h-6 text-[#d4a574]" />
        <span className="px-4 py-2 bg-emerald-100 rounded-lg">Deal</span>
        <ArrowRight className="w-6 h-6 text-[#d4a574]" />
        <span className="px-4 py-2 bg-amber-100 rounded-lg">Commission + Audit</span>
      </div>
      <div className="bg-[#1a365d] text-white rounded-xl p-6 grid grid-cols-3 gap-6">
        {[
          { label: "Invariant", value: "1 lead → max 1 active deal" },
          { label: "Invariant", value: "No deal without qualified lead" },
          { label: "Invariant", value: "Commission requires signed mandate" },
        ].map((inv, i) => (
          <div key={i}>
            <div className="text-[#d4a574] text-xs font-bold tracking-widest mb-1">{inv.label}</div>
            <div className="text-lg font-mono">{inv.value}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 7 — UNIFIED CRM (KANBAN MOCKUP) ============
export const Slide07 = () => {
  const stages = [
    { name: "Enquiry", count: 24, value: "AED 18M", color: "bg-slate-500" },
    { name: "Qualified", count: 16, value: "AED 32M", color: "bg-blue-500" },
    { name: "Viewing", count: 9, value: "AED 21M", color: "bg-purple-500" },
    { name: "Offer", count: 5, value: "AED 14M", color: "bg-amber-500" },
    { name: "Negotiation", count: 3, value: "AED 9M", color: "bg-orange-500" },
    { name: "Won", count: 7, value: "AED 22M", color: "bg-emerald-500" },
  ];
  return (
    <SlideLayout {...N(7)}>
      <SlideTitle kicker="Unified CRM">Pipeline as a single source of truth</SlideTitle>
      <div className="px-16 pb-8">
        <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-2xl p-6 shadow-inner">
          <div className="grid grid-cols-6 gap-3">
            {stages.map((s, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className={`${s.color} text-white px-3 py-2`}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-90">{s.name}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold">{s.count}</span>
                    <span className="text-xs opacity-80">{s.value}</span>
                  </div>
                </div>
                <div className="p-2 space-y-2 min-h-[280px]">
                  {Array.from({ length: Math.min(s.count, 4) }).map((_, j) => (
                    <div key={j} className="bg-gray-50 border border-gray-200 rounded p-2">
                      <div className="text-xs font-bold text-[#1a365d] truncate">
                        {["Al Ain Tower", "Saadiyat Villa", "Reem Apt", "Yas Studio"][j]}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                        AED {(800 + j * 200).toLocaleString()}K · 2BR
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#d4a574]/30" />
                        <div className="text-[10px] text-gray-400 truncate">Broker {j + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: KanbanSquare, label: "Drag-and-drop stage transitions" },
            { icon: ListChecks, label: "Auto-deduped contacts by email/phone" },
            { icon: BarChart3, label: "Live pipeline value & velocity metrics" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#1a365d]/5 rounded-lg px-5 py-4">
              <f.icon className="w-6 h-6 text-[#d4a574]" />
              <span className="text-lg text-[#1a365d] font-semibold">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
};

// ============ SLIDE 8 — 360 CONTACT VIEW ============
export const Slide08 = () => (
  <SlideLayout {...N(8)}>
    <SlideTitle kicker="360° Contact View">Every interaction, in one place</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-3 gap-5">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7d] text-white rounded-2xl p-6">
        <div className="w-20 h-20 rounded-full bg-[#d4a574] flex items-center justify-center text-3xl font-bold mb-4">FA</div>
        <div className="text-2xl font-bold">Fatima Al Hosani</div>
        <div className="text-white/60 text-sm mb-4">UAE National · Buyer</div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#d4a574]" /> fatima@example.ae</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#d4a574]" /> +971 50 ••• 4521</div>
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#d4a574]" /> WhatsApp opted-in</div>
        </div>
        <div className="mt-5 pt-5 border-t border-white/20 grid grid-cols-2 gap-3 text-center">
          <div><div className="text-2xl font-bold text-[#d4a574]">3</div><div className="text-xs text-white/60">Active Opps</div></div>
          <div><div className="text-2xl font-bold text-[#d4a574]">87</div><div className="text-xs text-white/60">Activities</div></div>
        </div>
      </div>
      {/* Activity timeline */}
      <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Activity Timeline</div>
        <div className="space-y-4">
          {[
            { icon: Phone, color: "blue", title: "Call · 12 min · outbound", time: "Today, 10:24", note: "Discussed Saadiyat 3BR shortlist; sending viewing slots Wed/Thu." },
            { icon: MessageSquare, color: "emerald", title: "WhatsApp · message sent", time: "Today, 09:50", note: "Shared brochure for Mamsha Al Saadiyat unit 1204." },
            { icon: FileText, color: "purple", title: "Document · viewing form signed", time: "Yesterday, 16:12", note: "Form 11 viewing acknowledgment captured to evidence store." },
            { icon: Mail, color: "amber", title: "Email · inbound", time: "Yesterday, 11:03", note: "Confirmed pre-approval letter from ADCB at AED 4.2M." },
          ].map((a, i) => (
            <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className={`w-10 h-10 rounded-full bg-${a.color}-100 flex items-center justify-center flex-shrink-0`}>
                <a.icon className={`w-5 h-5 text-${a.color}-600`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-[#1a365d]">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.time}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{a.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 9 — TASKS & ANALYTICS ============
export const Slide09 = () => (
  <SlideLayout {...N(9)}>
    <SlideTitle kicker="Operate & Measure">Tasks inbox · funnel analytics</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-6">
      {/* Tasks */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-[#1a365d] flex items-center gap-2"><Inbox className="w-6 h-6 text-[#d4a574]" /> My Tasks</h3>
          <span className="text-sm text-gray-500">12 open</span>
        </div>
        {[
          { tag: "OVERDUE", color: "red", task: "Send NOC to Aldar — Saadiyat Villa", due: "2 days late" },
          { tag: "TODAY", color: "amber", task: "Follow up: Hassan Al Mansoori (mortgage)", due: "by 5:00 PM" },
          { tag: "TODAY", color: "amber", task: "Confirm viewing slot — Mamsha 1204", due: "by 3:30 PM" },
          { tag: "TOMORROW", color: "blue", task: "Prepare offer letter — Reem Island studio", due: "AM" },
          { tag: "THIS WEEK", color: "slate", task: "Quarterly compliance review with Manager", due: "Fri" },
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <input type="checkbox" className="mt-1.5 w-4 h-4 rounded" readOnly />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-${t.color}-100 text-${t.color}-700`}>{t.tag}</span>
                <span className="text-xs text-gray-500">{t.due}</span>
              </div>
              <div className="text-base text-[#1a365d]">{t.task}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Analytics */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Pipeline Value", value: "AED 116M", trend: "+12%", color: "emerald" },
            { label: "Win Rate", value: "31%", trend: "+4pp", color: "blue" },
            { label: "Avg. Days to Close", value: "47", trend: "-8 days", color: "purple" },
            { label: "MQL → SQL", value: "62%", trend: "+9pp", color: "amber" },
          ].map((m, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</div>
              <div className="text-3xl font-bold text-[#1a365d] mt-2">{m.value}</div>
              <div className={`text-sm font-semibold text-${m.color}-600 mt-1`}>↑ {m.trend} vs prior</div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-sm font-bold text-[#1a365d] mb-3">Funnel — last 90 days</div>
          {[
            { stage: "Enquiries", n: 482, w: 100 },
            { stage: "Qualified", n: 298, w: 62 },
            { stage: "Viewing", n: 164, w: 34 },
            { stage: "Offer", n: 89, w: 18 },
            { stage: "Won", n: 41, w: 8.5 },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <span className="text-sm w-24 text-gray-600">{f.stage}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1a365d] to-[#d4a574] flex items-center justify-end px-3 text-white text-xs font-bold" style={{ width: `${f.w}%` }}>{f.n}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 10 — LEAD QUALIFICATION ============
export const Slide10 = () => (
  <SlideLayout {...N(10)}>
    <SlideTitle kicker="Lead Qualification">Deterministic, score-based funnel</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-5 gap-4">
      {[
        { score: "0-39", label: "New", color: "slate", action: "Auto-enrich · queue for first contact" },
        { score: "40-59", label: "Interested", color: "blue", action: "SLA: 24h response · activity required" },
        { score: "60-79", label: "Qualified", color: "purple", action: "Assigned to broker · viewing eligible" },
        { score: "80-89", label: "High Intent", color: "amber", action: "Offer-ready · finance pre-approval" },
        { score: "90-100", label: "Hot", color: "emerald", action: "Manager visibility · priority routing" },
      ].map((s, i) => (
        <div key={i} className={`bg-${s.color}-50 border-2 border-${s.color}-200 rounded-2xl p-6 text-center`}>
          <div className={`text-xs font-bold text-${s.color}-700 tracking-widest mb-2`}>SCORE {s.score}</div>
          <div className="text-3xl font-bold text-[#1a365d] mb-3">{s.label}</div>
          <div className={`w-full h-2 bg-${s.color}-200 rounded-full mb-4`}>
            <div className={`h-full bg-${s.color}-500 rounded-full`} style={{ width: `${(i + 1) * 20}%` }} />
          </div>
          <div className="text-sm text-gray-600 leading-snug">{s.action}</div>
        </div>
      ))}
    </div>
    <div className="px-16 pb-8 grid grid-cols-3 gap-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <Target className="w-8 h-8 text-[#d4a574] mb-3" />
        <h4 className="text-xl font-bold text-[#1a365d] mb-2">Scoring inputs</h4>
        <p className="text-base text-gray-600">Budget completeness, location specificity, financing readiness, contactability, source quality, recency.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <CheckCircle2 className="w-8 h-8 text-[#d4a574] mb-3" />
        <h4 className="text-xl font-bold text-[#1a365d] mb-2">Deterministic by design</h4>
        <p className="text-base text-gray-600">Same inputs → same score. AI only suggests next-best-action; never overrides the score.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <GitBranch className="w-8 h-8 text-[#d4a574] mb-3" />
        <h4 className="text-xl font-bold text-[#1a365d] mb-2">Funnel invariants</h4>
        <p className="text-base text-gray-600">One lead → max one active deal. No deal exists without a qualified lead. Enforced at DB level.</p>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 11 — DEAL LIFECYCLE ============
export const Slide11 = () => (
  <SlideLayout {...N(11)}>
    <SlideTitle kicker="Deal Lifecycle">Stage-gated workflow with hard stops</SlideTitle>
    <div className="px-16 pb-8">
      <div className="flex items-center justify-between mb-8 px-4">
        {["OPEN", "Viewing Scheduled", "Viewing Done", "Negotiation", "Reservation", "MoU Signed", "Transfer", "Closed"].map((stage, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="relative w-full flex items-center">
              {i > 0 && <div className="flex-1 h-1 bg-gradient-to-r from-[#1a365d] to-[#d4a574]" />}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a365d] to-[#2a4a7d] text-white font-bold flex items-center justify-center shadow-lg flex-shrink-0">{i + 1}</div>
              {i < 7 && <div className="flex-1 h-1 bg-gradient-to-r from-[#d4a574] to-[#1a365d]" />}
            </div>
            <div className="text-sm font-bold text-[#1a365d] mt-3 text-center">{stage}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {[
          { gate: "Workflow Gate · FLOW_SALES_GATE", body: "Programmatic checkpoints prevent forward motion until required evidence (signed forms, IDs, NOC) is captured.", icon: ShieldCheck },
          { gate: "Compliance Gate · DARI/Tawtheeq", body: "Stage transitions block until matching portal references and screenshots are on file. Exceptions require Manager override + reason.", icon: FileCheck },
          { gate: "Commission Gate · Mandate signed", body: "Commission records cannot be created until a signed mandate (Form A/U) is on file with ID-verified parties.", icon: Calculator },
        ].map((g, i) => (
          <div key={i} className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-xl p-6">
            <g.icon className="w-7 h-7 text-amber-600 mb-3" />
            <div className="text-xs font-bold text-amber-700 tracking-widest mb-1">GATE</div>
            <div className="text-lg font-bold text-[#1a365d] mb-2">{g.gate}</div>
            <p className="text-base text-gray-600">{g.body}</p>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 12 — COMPLIANCE AUTOMATION ============
export const Slide12 = () => (
  <SlideLayout {...N(12)}>
    <SlideTitle kicker="Compliance Automation">Abu Dhabi portals, mapped to every deal stage</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-5">
      {[
        { portal: "DARI", body: "Marketing permit numbers attached to every listing & ad. Permit expiry monitored; ads auto-paused on lapse.", color: "blue", evidence: "Permit screenshot · validity dates · ad reference" },
        { portal: "Tawtheeq", body: "Lease registration confirmation captured with reference number. Required before commission record can be finalized.", color: "purple", evidence: "Tawtheeq cert PDF · contract ID · parties" },
        { portal: "Madhmoun", body: "Listing publication status synced. Listings cannot transition to ACTIVE without Madhmoun ID & approval state.", color: "emerald", evidence: "Madhmoun listing ID · status · timestamps" },
        { portal: "BRN / Brokerage License", body: "Broker BRN, personal license validity, and ICA documentation tracked per agent. Expiring credentials block deal assignment.", color: "amber", evidence: "License PDF · expiry · ICA document hash" },
      ].map((p, i) => (
        <div key={i} className={`bg-${p.color}-50 border-2 border-${p.color}-200 rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-lg bg-${p.color}-600 text-white flex items-center justify-center`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-xs font-bold text-${p.color}-700 tracking-widest`}>PORTAL</div>
              <div className="text-2xl font-bold text-[#1a365d]">{p.portal}</div>
            </div>
          </div>
          <p className="text-base text-gray-700 mb-3 leading-relaxed">{p.body}</p>
          <div className="bg-white/60 rounded-lg px-3 py-2 text-sm font-mono text-gray-600">📎 {p.evidence}</div>
        </div>
      ))}
    </div>
  </SlideLayout>
);

// ============ SLIDE 13 — AML/KYC + AUDIT ============
export const Slide13 = () => (
  <SlideLayout {...N(13)} variant="dark">
    <SlideTitle kicker="AML / KYC + Audit Closeout" variant="dark">Hash-chained, retention-enforced, export-ready</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-8">
      <div>
        <div className="text-[#d4a574] text-sm font-bold tracking-widest mb-4">SALES — RISK-BASED AML</div>
        <div className="space-y-3">
          {[
            "Identify & verify all parties (Emirates ID + passport)",
            "Source-of-funds declaration with documentary proof",
            "PEP / sanctions screening at deal initiation",
            "Risk scoring: Low / Medium / High → escalation rules",
            "Suspicious activity flag with Manager review queue",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3 text-white/90 text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-1" /> {s}
            </div>
          ))}
        </div>
        <div className="text-[#d4a574] text-sm font-bold tracking-widest mt-6 mb-4">LEASING — IDENTITY VERIFICATION</div>
        <div className="space-y-3">
          {["EID verification (tenant + landlord)", "Tawtheeq registration as system of record", "Income proof for residential leases"].map((s, i) => (
            <div key={i} className="flex items-start gap-3 text-white/90 text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-1" /> {s}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
        <div className="text-[#d4a574] text-sm font-bold tracking-widest mb-4">AUDIT-READY CLOSEOUT</div>
        <div className="bg-black/40 rounded-lg p-5 font-mono text-sm text-white/80 mb-5">
          <div>📦 20260418_SALE_SAADIYAT_VILLA_42/</div>
          <div className="ml-4">├── 01_lead_intake.json</div>
          <div className="ml-4">├── 02_qualification_evidence/</div>
          <div className="ml-4">├── 03_mandate_signed.pdf</div>
          <div className="ml-4">├── 04_dari_permit.png</div>
          <div className="ml-4">├── 05_kyc_parties.json</div>
          <div className="ml-4">├── 06_offer_acceptance.pdf</div>
          <div className="ml-4">├── 07_noc_aldar.pdf</div>
          <div className="ml-4">├── 08_transfer_receipt.pdf</div>
          <div className="ml-4">└── audit_chain.json (sha-256)</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-3xl font-bold text-[#d4a574]">5 yr</div>
            <div className="text-sm text-white/60">minimum retention enforced</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-3xl font-bold text-[#d4a574]">SHA-256</div>
            <div className="text-sm text-white/60">event-chain integrity</div>
          </div>
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 14 — MI AI ============
export const Slide14 = () => (
  <SlideLayout {...N(14)}>
    <SlideTitle kicker="Mi Ai">Advisory AI with prompt builder & FAQ</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-3 gap-5">
      {/* Chat mockup */}
      <div className="col-span-2 bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a365d] to-[#d4a574] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#1a365d]">Mi Ai · Broker Advisor</div>
            <div className="text-xs text-emerald-600">● Online · GPT-5 via Lovable AI Gateway</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="bg-[#1a365d] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-md text-base">
              Draft an offer letter for Fatima Al Hosani — Mamsha 1204, AED 4.1M, 20% down.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#d4a574]/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-[#d4a574]" /></div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md text-base text-gray-700">
              Drafted using Form 11 template. Validated: ✓ DARI permit on file ✓ Buyer KYC complete ✓ Mandate signed. <span className="text-[#d4a574] font-semibold">Apply</span> or <span className="text-gray-500 font-semibold">Dismiss</span>?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#1a365d] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-md text-base">What's the recommended next action?</div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#d4a574]/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-[#d4a574]" /></div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md text-base text-gray-700">
              Schedule signing within 48h (offer expires Thu). Capture EID + bank pre-approval. Notify Manager — score 87 (High Intent).
            </div>
          </div>
        </div>
      </div>
      {/* Side panel */}
      <div className="space-y-4">
        <div className="bg-[#1a365d] text-white rounded-2xl p-6">
          <div className="text-[#d4a574] text-xs font-bold tracking-widest mb-3">PROMPT BUILDER · 6 WORKFLOWS</div>
          <ul className="space-y-2 text-sm">
            {["Draft Document", "Qualify Lead", "Compliance Check", "Mortgage Advisory", "Listing Description", "Audit Summary"].map((w, i) => (
              <li key={i} className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#d4a574]" /> {w}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-xs font-bold text-gray-500 tracking-widest mb-3">GUARDRAILS</div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>· Every suggestion logged with rationale</li>
            <li>· Apply/Dismiss recorded to audit trail</li>
            <li>· Cannot bypass workflow gates</li>
            <li>· Multi-provider (OpenAI + Gemini)</li>
          </ul>
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 15 — MORTGAGE SUITE ============
export const Slide15 = () => (
  <SlideLayout {...N(15)}>
    <SlideTitle kicker="Mortgage Suite">AECB · DBR · Residency caps</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-8">
      <div className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7d] text-white rounded-2xl p-8">
        <Calculator className="w-10 h-10 text-[#d4a574] mb-4" />
        <div className="text-2xl font-bold mb-6">Live Affordability Calculator</div>
        <div className="space-y-3">
          {[
            { l: "Property Price", v: "AED 4,100,000" },
            { l: "Down Payment (20%)", v: "AED 820,000" },
            { l: "Loan Amount", v: "AED 3,280,000" },
            { l: "Tenor / Rate", v: "25 yr · 4.49%" },
            { l: "Monthly Payment", v: "AED 18,210" },
            { l: "DBR (cap 50%)", v: "42% · ✓ within cap" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/70">{r.l}</span>
              <span className="font-mono font-bold text-[#d4a574]">{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-5">
        {[
          { title: "AECB credit pull", body: "One-tap credit report retrieval; DBR auto-computed against income & existing obligations.", icon: Database },
          { title: "Residency-aware caps", body: "UAE National 85% LTV · Resident 80% · Non-Resident 75% — applied automatically based on KYC.", icon: Globe },
          { title: "Bank routing", body: "Pre-approval routed to optimal bank (rate, speed, conditions). ADCB, Emirates NBD, FAB, ADIB integrations.", icon: Network },
          { title: "Pre-approval evidence", body: "Bank letter PDF auto-attached to deal; expiry tracked; alerts at T-7 days.", icon: FileCheck },
        ].map((f, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#d4a574]/10 flex items-center justify-center flex-shrink-0">
              <f.icon className="w-6 h-6 text-[#d4a574]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#1a365d] mb-1">{f.title}</div>
              <div className="text-base text-gray-600">{f.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 16 — ONWANI + NATOOR ============
export const Slide16 = () => (
  <SlideLayout {...N(16)}>
    <SlideTitle kicker="Integrations">Onwani address lookup · Natoor sync</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-7">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-9 h-9 text-blue-600" />
          <div>
            <div className="text-xs font-bold text-blue-700 tracking-widest">ABU DHABI ADDRESS</div>
            <div className="text-2xl font-bold text-[#1a365d]">Onwani Lookup</div>
          </div>
        </div>
        <p className="text-base text-gray-700 mb-5">From a single lat/lng pair, the system auto-populates 18+ canonical address fields used throughout the CRM.</p>
        <div className="bg-white rounded-lg p-4 font-mono text-sm space-y-1">
          <div className="text-blue-600">▶ POST /onwani-lookup</div>
          <div className="text-gray-500">{"{ lat: 24.4539, lng: 54.3773 }"}</div>
          <div className="text-emerald-600 mt-2">✓ 200 OK · 18 fields populated</div>
          <div className="text-gray-700">municipality_district · sector · plot_number</div>
          <div className="text-gray-700">street · building_name · onwani_id · ...</div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl p-7">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-9 h-9 text-emerald-600" />
          <div>
            <div className="text-xs font-bold text-emerald-700 tracking-widest">RENT PROTECTION</div>
            <div className="text-2xl font-bold text-[#1a365d]">Natoor Sync</div>
          </div>
        </div>
        <p className="text-base text-gray-700 mb-5">Bidirectional sync with Natoor Rent Protect. Leases auto-enrolled; tenant payment status flows back into deal records.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3">
            <ArrowRight className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-gray-700">MiCasa lease executed → Natoor enrolment payload</span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3">
            <ArrowRight className="w-5 h-5 text-emerald-600 rotate-180" />
            <span className="text-sm text-gray-700">Natoor payment events → CRM activity timeline</span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3">
            <ArrowRight className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-gray-700">Late-payment flag → broker task auto-created</span>
          </div>
        </div>
      </div>
      <div className="col-span-2 bg-[#1a365d] text-white rounded-xl p-6 grid grid-cols-4 gap-6">
        {["DARI permits", "Tawtheeq registry", "Madhmoun listings", "AECB credit"].map((p, i) => (
          <div key={i} className="text-center">
            <Network className="w-6 h-6 text-[#d4a574] mx-auto mb-2" />
            <div className="text-sm font-semibold">{p}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 17 — DOCUMENT ENGINE ============
export const Slide17 = () => (
  <SlideLayout {...N(17)}>
    <SlideTitle kicker="Document Engine">Templates · addenda · naming standards</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-bold text-gray-500 tracking-widest mb-3">ADDENDUM STRATEGY</div>
        <div className="space-y-3">
          {[
            { layer: "Layer 1 — Statutory templates", color: "blue", body: "DARI Form A/U, Tawtheeq lease, MoU. Used verbatim, never modified." },
            { layer: "Layer 2 — MiCasa internal forms", color: "purple", body: "Sales/Leasing Agreements, Mandates. Approved by legal; versioned." },
            { layer: "Layer 3 — Deal-specific addenda", color: "amber", body: "Custom terms layered on top via addendum, preserving template integrity." },
          ].map((l, i) => (
            <div key={i} className={`bg-${l.color}-50 border border-${l.color}-200 rounded-xl p-5`}>
              <div className={`text-xs font-bold text-${l.color}-700 tracking-widest mb-1`}>{l.layer.split(" — ")[0]}</div>
              <div className="text-lg font-bold text-[#1a365d] mb-1">{l.layer.split(" — ")[1]}</div>
              <div className="text-sm text-gray-600">{l.body}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 tracking-widest mb-3">NAMING STANDARD (MANDATORY)</div>
        <div className="bg-[#1a365d] text-white rounded-2xl p-7 mb-4">
          <div className="font-mono text-lg text-[#d4a574] mb-3">[YYYYMMDD]_[TYPE]_[COMMUNITY]_[UNIT]_[DOC-CODE]</div>
          <div className="font-mono text-sm text-white/70 mb-4">Example:</div>
          <div className="font-mono text-base bg-black/40 rounded-lg px-4 py-3">20260418_SALE_SAADIYAT_VILLA42_FORM-U.pdf</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-bold text-gray-500 tracking-widest mb-3">ENFORCEMENT</div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> Storage trigger validates filename pattern</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> SHA-256 hash captured per document</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> Linked to deal_id + entity_type</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> Immutability class set per evidence type</li>
          </ul>
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 18 — SECURITY ============
export const Slide18 = () => (
  <SlideLayout {...N(18)} variant="dark">
    <SlideTitle kicker="Security Model" variant="dark">RLS-first · zero-trust by default</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-2 gap-8">
      <div className="space-y-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <Lock className="w-8 h-8 text-[#d4a574] mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">Row-Level Security on every table</h3>
          <p className="text-white/70 text-base">All CRM, deal, document, and audit tables enforce RLS at the database. No table is queryable without policy match.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <Users className="w-8 h-8 text-[#d4a574] mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">4-tier role hierarchy</h3>
          <div className="space-y-2 text-base text-white/80">
            <div><span className="text-[#d4a574] font-bold">Manager</span> · Full admin · approvals · overrides</div>
            <div><span className="text-[#d4a574] font-bold">Agent</span> · Listings · marketing · enquiries</div>
            <div><span className="text-[#d4a574] font-bold">Broker</span> · Assigned deals & opportunities</div>
            <div><span className="text-[#d4a574] font-bold">Owner</span> · Read-only oversight & reporting</div>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <Zap className="w-8 h-8 text-[#d4a574] mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">Edge function auth · unified standard</h3>
          <p className="text-white/70 text-base">All edge functions (except webhooks & cron) validate Bearer JWT, derive user_id, and re-check role before any data access.</p>
        </div>
        <div className="bg-gradient-to-br from-[#d4a574]/15 to-transparent border border-[#d4a574]/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-3">Approval workflow</h3>
          <div className="space-y-2 text-base text-white/80">
            <div>· Manager approval required for: agent registration, role changes, compliance overrides, commission edits</div>
            <div>· Before/after state captured to <code className="text-[#d4a574]">approvals</code> table</div>
            <div>· Hash-chained to <code className="text-[#d4a574]">event_log_entries</code></div>
          </div>
        </div>
      </div>
    </div>
  </SlideLayout>
);

// ============ SLIDE 19 — EXTENSIBILITY ============
export const Slide19 = () => (
  <SlideLayout {...N(19)}>
    <SlideTitle kicker="Extensibility">Built for partners to plug in</SlideTitle>
    <div className="px-16 pb-8 grid grid-cols-3 gap-5">
      {[
        {
          title: "Secondary Supabase client",
          icon: Database,
          body: "Connect external/legacy Postgres databases (e.g. Mi Casa Real Estate CRM) via dedicated client. Read & write without polluting primary schema.",
          tag: "src/lib/external-supabase.ts",
        },
        {
          title: "Standardized edge functions",
          icon: Zap,
          body: "All extraction & integration functions follow the same shape: Bearer auth → input validation (Zod) → business logic → audit log. Easy to add new ones.",
          tag: "supabase/functions/*",
        },
        {
          title: "Lovable AI Gateway",
          icon: Sparkles,
          body: "One credential unlocks GPT-5, Gemini 2.5/3, image gen, and embeddings. No per-provider key management. Drop-in for partner AI workflows.",
          tag: "OpenAI · Google · Embeddings",
        },
        {
          title: "Webhook ingestion",
          icon: Cloud,
          body: "Inbound webhooks from portals, payment gateways, and partner systems land on dedicated edge functions with HMAC verification.",
          tag: "Madhmoun · Tawtheeq · Stripe",
        },
        {
          title: "Document template registry",
          icon: FileText,
          body: "Add new doc templates by inserting into document_templates with binding schema + signer schema. UI auto-discovers.",
          tag: "Versioned · effective_from",
        },
        {
          title: "Compliance rule engine",
          icon: ShieldCheck,
          body: "Add new modules and rules through compliance_modules + compliance_rules. Rules apply by context_type with severity & action_on_fail.",
          tag: "Hot-loadable · per jurisdiction",
        },
      ].map((e, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1a365d] to-[#d4a574] flex items-center justify-center mb-4">
            <e.icon className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-xl font-bold text-[#1a365d] mb-2">{e.title}</h4>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{e.body}</p>
          <div className="text-xs font-mono text-[#d4a574] bg-[#d4a574]/10 rounded px-2 py-1 inline-block">{e.tag}</div>
        </div>
      ))}
    </div>
  </SlideLayout>
);

// ============ SLIDE 20 — CTA ============
export const Slide20 = () => (
  <SlideLayout {...N(20)} variant="title" hideFooter>
    <div className="w-full h-full flex flex-col px-24 py-20">
      <div className="flex items-center justify-between mb-12">
        <span className="text-white font-bold tracking-[0.3em] text-2xl">MI CASA</span>
        <div className="text-[#d4a574] text-sm font-bold tracking-[0.4em]">PARTNERSHIP</div>
      </div>
      <h1 className="text-7xl font-bold text-white mb-4">Where you fit in.</h1>
      <div className="h-1 w-32 bg-gradient-to-r from-[#d4a574] to-transparent rounded-full mb-10" />
      <div className="grid grid-cols-3 gap-6 mb-12">
        {[
          { phase: "Q2 2026 · NOW", body: "Foundation pass complete: unified CRM, compliance engine, Mi Ai, mortgage suite, document engine." },
          { phase: "Q3 2026", body: "Full Madhmoun two-way sync · Tawtheeq direct submission · partner integration SDK · iOS/Android brokerage app." },
          { phase: "Q4 2026", body: "Multi-brokerage tenancy · marketplace for documents & flows · open partner API · regional expansion (Dubai)." },
        ].map((r, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-[#d4a574] text-xs font-bold tracking-widest mb-3">{r.phase}</div>
            <p className="text-white/85 text-lg leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-[#d4a574]/20 via-[#d4a574]/10 to-transparent border-l-4 border-[#d4a574] rounded-r-xl p-8">
        <div className="text-[#d4a574] text-sm font-bold tracking-widest mb-3">WE'RE LOOKING FOR PARTNERS WHO BRING</div>
        <div className="grid grid-cols-3 gap-6 text-white text-xl">
          <div>· Distribution into Abu Dhabi brokerages</div>
          <div>· Portal/regulator integration depth</div>
          <div>· Capital to accelerate the regional roadmap</div>
        </div>
      </div>
      <div className="mt-auto pt-12 border-t border-white/10 flex items-center justify-between">
        <div className="text-white/70">
          <div className="text-xl font-semibold">Let's talk.</div>
          <div className="text-base mt-1">contact@micasa.ae · +971 50 902 6971 · micasa.ae</div>
        </div>
        <div className="text-right text-white/40 text-sm">
          <div>MI CASA REALESTATE · CN-3762725</div>
          <div>Office 1703, Al Masaood Building, Najda Street, Abu Dhabi</div>
        </div>
      </div>
    </div>
  </SlideLayout>
);

export const allSlides = [
  { title: "MiCasa BOS — A Compliance-Native Real Estate OS", render: () => <Slide01 /> },
  { title: "The Problem", render: () => <Slide02 /> },
  { title: "Our Thesis — Rules Execute, AI Advises", render: () => <Slide03 /> },
  { title: "System Architecture", render: () => <Slide04 /> },
  { title: "Tech Stack", render: () => <Slide05 /> },
  { title: "Unified Data Model", render: () => <Slide06 /> },
  { title: "Unified CRM — Pipeline", render: () => <Slide07 /> },
  { title: "360° Contact View", render: () => <Slide08 /> },
  { title: "Tasks & Analytics", render: () => <Slide09 /> },
  { title: "Lead Qualification Engine", render: () => <Slide10 /> },
  { title: "Deal Lifecycle & Workflow Gates", render: () => <Slide11 /> },
  { title: "Compliance Automation", render: () => <Slide12 /> },
  { title: "AML/KYC + Audit Closeout", render: () => <Slide13 /> },
  { title: "Mi Ai — Advisory AI", render: () => <Slide14 /> },
  { title: "Mortgage Suite", render: () => <Slide15 /> },
  { title: "Onwani + Natoor Integrations", render: () => <Slide16 /> },
  { title: "Document Engine", render: () => <Slide17 /> },
  { title: "Security Model", render: () => <Slide18 /> },
  { title: "Extensibility", render: () => <Slide19 /> },
  { title: "Roadmap & Partnership CTA", render: () => <Slide20 /> },
];
