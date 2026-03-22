import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Users, TrendingUp, MessageCircle, Search, Shield,
  Megaphone, Send, ChevronDown, ChevronUp, Sparkles, X, Loader2,
  HelpCircle, BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── All 18 official templates ──────────────────────────────────────────────────

export const TEMPLATE_OPTIONS = [
  { key: "01_seller_landlord_authorization", label: "Form A – Seller/Landlord Authorization", group: "Onboarding" },
  { key: "02_buyer_tenant_representation_agreement", label: "Form B – Buyer/Tenant Representation", group: "Onboarding" },
  { key: "03_property_listing_authorization_marketing_consent", label: "Listing Authorization & Marketing Consent", group: "Marketing" },
  { key: "04_agent_license_registration_record", label: "Agent License & Registration Record", group: "Compliance" },
  { key: "05_company_trade_license_regulatory_record", label: "Company Trade License & Regulatory Record", group: "Compliance" },
  { key: "06_agent_to_agent_agency_agreement", label: "Agent-to-Agent Agency Agreement", group: "Transactional" },
  { key: "07_offer_letter_expression_of_interest", label: "Offer Letter / Expression of Interest", group: "Transactional" },
  { key: "08_memorandum_of_understanding_pre_spa", label: "MOU / Pre-SPA Agreement", group: "Transactional" },
  { key: "09_reservation_booking_form", label: "Reservation / Booking Form", group: "Transactional" },
  { key: "10_deal_completion_closing_checklist", label: "Deal Completion & Closing Checklist", group: "Closing" },
  { key: "11_noc_request_clearance_tracker", label: "NOC Request & Clearance Tracker", group: "Closing" },
  { key: "12_commission_vat_invoice", label: "Commission & VAT Invoice", group: "Financial" },
  { key: "13_commission_authorization_split_sheet", label: "Commission Authorization & Split Sheet", group: "Financial" },
  { key: "14_refund_cancellation_approval_form", label: "Refund / Cancellation Approval Form", group: "Financial" },
  { key: "15_financial_reconciliation_deal_ledger", label: "Financial Reconciliation & Deal Ledger", group: "Financial" },
  { key: "16_client_data_consent_privacy_acknowledgment", label: "Client Data Consent & Privacy Acknowledgment", group: "Governance" },
  { key: "17_complaint_dispute_incident_register", label: "Complaint / Dispute Incident Register", group: "Governance" },
  { key: "18_internal_agent_governance_pack", label: "Internal Agent Governance Pack", group: "Governance" },
] as const;

// ── Ready-made FAQ answers ─────────────────────────────────────────────────────

export const FAQ_CATEGORIES = [
  {
    category: "Deals & Pipeline",
    icon: TrendingUp,
    faqs: [
      "What are the required documents to close a sale deal?",
      "What is the difference between an MOU and an SPA?",
      "When is a NOC required and how do I track it?",
      "How do I move a deal from EOI to closing?",
      "What happens when a deal is marked as Lost?",
    ],
  },
  {
    category: "Compliance & Regulation",
    icon: Shield,
    faqs: [
      "What are the DARI/ADM compliance requirements for a new listing?",
      "When do I need AML checks on a client?",
      "What documents does a buyer need for KYC?",
      "How do I handle a compliance BLOCK status?",
      "What are the RERA registration requirements for agents?",
    ],
  },
  {
    category: "Commissions & Finance",
    icon: FileText,
    faqs: [
      "How is commission calculated on a secondary sale?",
      "What is the standard commission split between agents?",
      "When should I issue a VAT invoice?",
      "How do I process a refund or cancellation?",
      "What goes into the financial reconciliation ledger?",
    ],
  },
  {
    category: "Leads & Prospects",
    icon: Users,
    faqs: [
      "How do I qualify a lead for a luxury property?",
      "What lead sources have the best conversion rate?",
      "How do I handle a portal inquiry from Bayut or Property Finder?",
      "What is the lead aging policy and escalation rules?",
      "How do I convert a prospect to a qualified lead?",
    ],
  },
  {
    category: "Documents & Templates",
    icon: BookOpen,
    faqs: [
      "Which template do I use for a seller mandate?",
      "How do I fill out an Offer Letter / EOI?",
      "What is the difference between Form A and Form B?",
      "How do I send a document for e-signature?",
      "Can I create a new version of a published template?",
    ],
  },
  {
    category: "Marketing & Portals",
    icon: Megaphone,
    faqs: [
      "How do I publish a listing to Bayut and Property Finder?",
      "What are the ADREC ad compliance requirements?",
      "How do I generate portal-optimized listing copy?",
      "What marketing channels work best for off-plan properties?",
      "How do I track campaign ROI and lead attribution?",
    ],
  },
];

// ── Workflow definitions ───────────────────────────────────────────────────────

export interface WorkflowCard {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  entityTypes: EntityType[];
  toneOptions: string[];
  defaultTone: string;
  showTemplateSelector?: boolean;
}

type EntityType = "lead" | "deal" | "prospect" | "listing" | "none";

export const WORKFLOW_CARDS: WorkflowCard[] = [
  {
    id: "draft_document",
    label: "Draft Document",
    icon: FileText,
    description: "Generate a filled document from an official template",
    entityTypes: ["lead", "deal", "listing"],
    toneOptions: [],
    defaultTone: "Formal & Professional",
    showTemplateSelector: true,
  },
  {
    id: "qualify_lead",
    label: "Qualify Lead",
    icon: TrendingUp,
    description: "Score and qualify a lead with AI analysis",
    entityTypes: ["lead", "prospect"],
    toneOptions: ["Concise", "Detailed", "Executive summary"],
    defaultTone: "Concise",
  },
  {
    id: "write_followup",
    label: "Write Follow-up",
    icon: MessageCircle,
    description: "Compose a personalized follow-up message",
    entityTypes: ["lead", "prospect", "deal"],
    toneOptions: ["Warm", "Professional", "Urgent", "Casual"],
    defaultTone: "Warm",
  },
  {
    id: "analyze_deal",
    label: "Analyze Deal",
    icon: Search,
    description: "Get AI insights on a deal's status and next steps",
    entityTypes: ["deal"],
    toneOptions: ["Summary", "Detailed breakdown", "Risk-focused"],
    defaultTone: "Summary",
  },
  {
    id: "compliance_check",
    label: "Compliance Check",
    icon: Shield,
    description: "Review compliance status and pending requirements",
    entityTypes: ["deal", "lead"],
    toneOptions: ["Checklist", "Narrative", "Executive summary"],
    defaultTone: "Checklist",
  },
  {
    id: "marketing_copy",
    label: "Marketing Copy",
    icon: Megaphone,
    description: "Generate listing description or ad copy",
    entityTypes: ["listing"],
    toneOptions: ["Luxury", "Professional", "Social media", "Portal-optimized"],
    defaultTone: "Professional",
  },
  {
    id: "faq",
    label: "Quick FAQ",
    icon: HelpCircle,
    description: "Get instant answers to common real estate questions",
    entityTypes: [],
    toneOptions: [],
    defaultTone: "",
  },
];

// ── Entity search hook ─────────────────────────────────────────────────────────

interface EntityResult {
  id: string;
  crmId: string;
  label: string;
  type: EntityType;
}

function useEntitySearch(entityType: EntityType) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim() || entityType === "none") {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const items: EntityResult[] = [];
        const q = query.trim();

        if (entityType === "lead") {
          const { data } = await supabase
            .from("leads")
            .select("id, lead_id, contact_name")
            .or(`contact_name.ilike.%${q}%,lead_id.ilike.%${q}%`)
            .limit(6);
          data?.forEach((r) =>
            items.push({ id: r.id, crmId: r.lead_id, label: `${r.lead_id} — ${r.contact_name}`, type: "lead" })
          );
        } else if (entityType === "deal") {
          const { data } = await supabase
            .from("deals")
            .select("id, deal_id, deal_type, deal_state")
            .or(`deal_id.ilike.%${q}%`)
            .limit(6);
          data?.forEach((r) =>
            items.push({ id: r.id, crmId: r.deal_id, label: `${r.deal_id} — ${r.deal_type} (${r.deal_state})`, type: "deal" })
          );
        } else if (entityType === "prospect") {
          const { data } = await supabase
            .from("prospects")
            .select("id, crm_customer_id, full_name")
            .or(`full_name.ilike.%${q}%,crm_customer_id.ilike.%${q}%`)
            .limit(6);
          data?.forEach((r) =>
            items.push({ id: r.id, crmId: r.crm_customer_id || "", label: `${r.crm_customer_id || "—"} — ${r.full_name}`, type: "prospect" })
          );
        } else if (entityType === "listing") {
          const { data } = await supabase
            .from("listings")
            .select("id, listing_id, listing_type, status")
            .or(`listing_id.ilike.%${q}%`)
            .limit(6);
          data?.forEach((r) =>
            items.push({ id: r.id, crmId: r.listing_id, label: `${r.listing_id} — ${r.listing_type} (${r.status})`, type: "listing" })
          );
        }

        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, entityType]);

  return { query, setQuery, results, isSearching };
}

// ── Prompt builder component ───────────────────────────────────────────────────

interface PromptBuilderCardsProps {
  onSendPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptBuilderCards({ onSendPrompt, disabled }: PromptBuilderCardsProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {/* Compact card grid — 4 cols to fit FAQ card */}
      <div className="grid grid-cols-4 gap-1.5">
        {WORKFLOW_CARDS.map((card) => {
          const Icon = card.icon;
          const isActive = activeCard === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setActiveCard(isActive ? null : card.id)}
              disabled={disabled}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all
                ${isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-muted-foreground"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-tight">{card.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ panel */}
      {activeCard === "faq" && (
        <FAQPanel onSelect={onSendPrompt} onClose={() => setActiveCard(null)} disabled={disabled} />
      )}

      {/* Expanded form for other active cards */}
      {activeCard && activeCard !== "faq" && (
        <PromptBuilderForm
          card={WORKFLOW_CARDS.find((c) => c.id === activeCard)!}
          onSend={onSendPrompt}
          onClose={() => setActiveCard(null)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// ── FAQ Panel ──────────────────────────────────────────────────────────────────

interface FAQPanelProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

function FAQPanel({ onSelect, onClose, disabled }: FAQPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(FAQ_CATEGORIES[0].category);

  return (
    <Card className="p-3 space-y-2 border-primary/20 bg-primary/5 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Quick FAQ</span>
          <Badge variant="secondary" className="text-[9px] h-4">30 ready answers</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <ScrollArea className="max-h-[280px]">
        <div className="space-y-1">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isOpen = expandedCategory === cat.category;
            return (
              <div key={cat.category}>
                <button
                  onClick={() => setExpandedCategory(isOpen ? null : cat.category)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-medium flex-1">{cat.category}</span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5">{cat.faqs.length}</Badge>
                  {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="ml-6 space-y-0.5 pb-1">
                    {cat.faqs.map((faq) => (
                      <button
                        key={faq}
                        disabled={disabled}
                        onClick={() => {
                          onSelect(faq);
                          onClose();
                        }}
                        className="w-full text-left text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/50 px-2 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        {faq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ── Expanded form ──────────────────────────────────────────────────────────────

interface PromptBuilderFormProps {
  card: WorkflowCard;
  onSend: (prompt: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

function PromptBuilderForm({ card, onSend, onClose, disabled }: PromptBuilderFormProps) {
  const [entityType, setEntityType] = useState<EntityType>(card.entityTypes[0] || "none");
  const [selectedEntity, setSelectedEntity] = useState<EntityResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [tone, setTone] = useState(card.defaultTone);
  const [notes, setNotes] = useState("");
  const { query, setQuery, results, isSearching } = useEntitySearch(entityType);
  const [showResults, setShowResults] = useState(false);

  const buildPrompt = useCallback(() => {
    const parts: string[] = [];

    switch (card.id) {
      case "draft_document": {
        const tpl = TEMPLATE_OPTIONS.find((t) => t.key === selectedTemplate);
        if (tpl) {
          parts.push(`Draft the "${tpl.label}" template for my client. Use the official template content from the database and fill in all blanks with the data available.`);
        } else {
          parts.push("Draft a document for my client.");
        }
        break;
      }
      case "qualify_lead":
        parts.push("Qualify this lead and provide a scoring assessment.");
        break;
      case "write_followup":
        parts.push("Write a follow-up message for my client.");
        break;
      case "analyze_deal":
        parts.push("Analyze this deal and recommend next steps.");
        break;
      case "compliance_check":
        parts.push("Review compliance status and list pending requirements.");
        break;
      case "marketing_copy":
        parts.push("Generate marketing copy for this property listing.");
        break;
    }

    if (selectedEntity) {
      parts.push(`Reference: ${selectedEntity.label} (${selectedEntity.type} ${selectedEntity.crmId})`);
    }

    if (tone) parts.push(`Tone/format: ${tone}.`);
    if (notes.trim()) parts.push(`Additional context: ${notes.trim()}`);

    return parts.join(" ");
  }, [card.id, selectedEntity, selectedTemplate, tone, notes]);

  const handleSend = () => {
    const prompt = buildPrompt();
    onSend(prompt);
    onClose();
  };

  // Group templates by group for nicer display
  const templateGroups = card.showTemplateSelector
    ? TEMPLATE_OPTIONS.reduce((acc, t) => {
        if (!acc[t.group]) acc[t.group] = [];
        acc[t.group].push(t);
        return acc;
      }, {} as Record<string, typeof TEMPLATE_OPTIONS[number][]>)
    : {};

  return (
    <Card className="p-3 space-y-3 border-primary/20 bg-primary/5 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <card.icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{card.label}</span>
          <Badge variant="secondary" className="text-[9px] h-4">Prompt Builder</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">{card.description}</p>

      {/* Template selector for Draft Document */}
      {card.showTemplateSelector && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Select template</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose an official template…" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px]">
              {Object.entries(templateGroups).map(([group, templates]) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group}
                  </div>
                  {templates.map((t) => (
                    <SelectItem key={t.key} value={t.key} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Entity type + search */}
      {card.entityTypes.length > 0 && card.entityTypes[0] !== "none" && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Link to record</label>
          <div className="flex gap-1.5">
            {card.entityTypes.length > 1 && (
              <Select
                value={entityType}
                onValueChange={(v) => {
                  setEntityType(v as EntityType);
                  setSelectedEntity(null);
                  setQuery("");
                }}
              >
                <SelectTrigger className="h-8 text-xs w-24 flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {card.entityTypes.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="relative flex-1">
              {selectedEntity ? (
                <div className="flex items-center gap-1.5 h-8 px-2 rounded-md border bg-background text-xs">
                  <span className="truncate flex-1">{selectedEntity.label}</span>
                  <button
                    onClick={() => {
                      setSelectedEntity(null);
                      setQuery("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder={`Search ${entityType}s by name or ID...`}
                    className="h-8 text-xs pr-8"
                  />
                  {isSearching && (
                    <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-2.5 text-muted-foreground" />
                  )}
                </>
              )}

              {showResults && results.length > 0 && !selectedEntity && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-auto">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                      onClick={() => {
                        setSelectedEntity(r);
                        setShowResults(false);
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tone selection */}
      {card.toneOptions.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Tone / Format</label>
          <div className="flex flex-wrap gap-1">
            {card.toneOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`
                  text-[10px] px-2 py-1 rounded-full border transition-colors
                  ${tone === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/40"
                  }
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom notes */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground">Additional context</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any specific details, instructions, or data points..."
          className="min-h-[48px] max-h-20 text-xs resize-none"
          rows={2}
        />
      </div>

      {/* Preview + Send */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-muted-foreground truncate flex-1">
          <Sparkles className="w-3 h-3 inline mr-0.5" />
          {buildPrompt().slice(0, 80)}…
        </p>
        <Button
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleSend}
          disabled={disabled}
        >
          <Send className="w-3 h-3" /> Send to Mi Ai
        </Button>
      </div>
    </Card>
  );
}
