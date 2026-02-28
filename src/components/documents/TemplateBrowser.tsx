import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Shield, 
  FolderOpen, 
  Settings,
  Sparkles,
  Clock,
  Star,
  Lock
} from "lucide-react";
import { TemplateSearchBar } from "./TemplateSearchBar";
import { TemplateCard } from "./TemplateCard";
import type { ManifestPrompt } from "@/types/manifest";
import { cn } from "@/lib/utils";

interface TemplateBrowserProps {
  prompts: ManifestPrompt[];
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
  dealType?: "sales" | "leasing";
  isLoading?: boolean;
}

// Category configuration
const CATEGORY_CONFIG = {
  STATIC_TEMPLATES: {
    label: "Official Forms",
    icon: Lock,
    description: "ADM forms & standard templates (no AI)"
  },
  DOCUMENT_TEMPLATES: {
    label: "Documents",
    icon: FileText,
    description: "ADM-compliant contracts & letters"
  },
  CHECKLISTS: {
    label: "Checklists",
    icon: FolderOpen,
    description: "Deal & onboarding tracking"
  },
  COMPLIANCE: {
    label: "Compliance",
    icon: Shield,
    description: "AML, KYC & validation"
  },
  ADMIN_OPS: {
    label: "Admin",
    icon: Settings,
    description: "Audit & administrative"
  },
  WORKFLOW_GATES: {
    label: "Gates",
    icon: Shield,
    description: "Transaction flow controls"
  }
};

// Subcategory mapping
const SUBCATEGORIES: Record<string, string> = {
  // Document Templates
  DOC_SELLER_MANDATE: "Mandates",
  DOC_LANDLORD_MANDATE: "Mandates",
  DOC_BROKERAGE_SALES: "Brokerage",
  DOC_BROKERAGE_LEASING: "Brokerage",
  DOC_AGENT_TO_AGENT_MASTER: "Co-Broker",
  DOC_AGENT_TO_AGENT_ANNEX: "Co-Broker",
  DOC_BUYER_OFFER: "Offers",
  DOC_TENANT_OFFER: "Offers",
  DOC_VIEWING_CONFIRMATION: "Transaction",
  DOC_NOC_REQUEST: "Transaction",
  DOC_HANDOVER_CHECKLIST: "Transaction",
  DOC_COMMISSION_INVOICE: "Finance",
  DOC_COMMISSION_SPLIT: "Finance",
  DOC_PAYMENT_RECEIPT: "Finance",
  // Checklists
  CHECKLIST_SALES_DEAL: "Deals",
  CHECKLIST_LEASING_DEAL: "Deals",
  CHECKLIST_AGENT_ONBOARDING: "Onboarding",
  // Compliance
  AML_SALES_CHECK: "Risk",
  KYC_LEASING_CHECK: "KYC",
  COMPLIANCE_PORTALS_MAP: "Portals",
  CONTROL_COMMISSION_DISPUTE: "Controls",
  CONTROL_AUDIT_TRAIL: "Controls",
  CONTROL_AUTHORITY_CHAIN: "Controls",
  // Admin Ops
  ADMIN_DOC_INDEX: "Audit",
  ADMIN_AUDIT_EXPORT: "Audit",
  // Static Templates
  STATIC_ADM_FORM_A: "ADM Forms",
  STATIC_ADM_FORM_B: "ADM Forms",
  STATIC_NDA: "Legal",
  STATIC_VIEWING_RECEIPT: "Receipts",
  STATIC_COMMISSION_RECEIPT: "Receipts",
  STATIC_HANDOVER_CHECKLIST: "Handover",
  STATIC_RESERVATION: "Reservation",
  // Workflow Gates
  FLOW_SALES_GATE: "Sales",
  FLOW_LEASING_GATE: "Leasing",
};

// Deal type filtering
const SALES_ONLY = ["DOC_SELLER_MANDATE", "DOC_BROKERAGE_SALES", "DOC_BUYER_OFFER", "AML_SALES_CHECK", "FLOW_SALES_GATE", "CHECKLIST_SALES_DEAL"];
const LEASING_ONLY = ["DOC_LANDLORD_MANDATE", "DOC_BROKERAGE_LEASING", "DOC_TENANT_OFFER", "KYC_LEASING_CHECK", "FLOW_LEASING_GATE", "CHECKLIST_LEASING_DEAL"];

// Popular templates (shown in "Quick Start")
const POPULAR_TEMPLATES = [
  "DOC_BUYER_OFFER",
  "DOC_TENANT_OFFER",
  "DOC_BROKERAGE_SALES",
  "DOC_BROKERAGE_LEASING",
  "DOC_COMMISSION_INVOICE",
  "AML_SALES_CHECK"
];

export function TemplateBrowser({
  prompts,
  selectedTemplate,
  onSelectTemplate,
  dealType,
  isLoading
}: TemplateBrowserProps) {
  const [activeView, setActiveView] = useState<"quick" | "browse">("quick");
  const [selectedCategory, setSelectedCategory] = useState("DOCUMENT_TEMPLATES");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter prompts by deal type
  const filteredByDealType = useMemo(() => {
    return prompts.filter(p => {
      if (p.group_name === "SYSTEM") return false;
      if (!dealType) return true;
      if (dealType === "sales" && LEASING_ONLY.includes(p.prompt_id)) return false;
      if (dealType === "leasing" && SALES_ONLY.includes(p.prompt_id)) return false;
      return true;
    });
  }, [prompts, dealType]);

  // Get all available tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    filteredByDealType.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [filteredByDealType]);

  // Apply search and tag filters
  const filteredPrompts = useMemo(() => {
    return filteredByDealType.filter(p => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          p.title.toLowerCase().includes(query) ||
          p.purpose.toLowerCase().includes(query) ||
          p.prompt_id.toLowerCase().includes(query) ||
          p.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Tag filter
      if (selectedTags.length > 0) {
        const hasTag = selectedTags.some(t => p.tags?.includes(t));
        if (!hasTag) return false;
      }
      
      return true;
    });
  }, [filteredByDealType, searchQuery, selectedTags]);

  // Group by category
  const groupedPrompts = useMemo(() => {
    const groups: Record<string, ManifestPrompt[]> = {};
    filteredPrompts.forEach(p => {
      if (!groups[p.group_name]) groups[p.group_name] = [];
      groups[p.group_name].push(p);
    });
    // Sort each group by sort_order
    Object.values(groups).forEach(g => g.sort((a, b) => a.sort_order - b.sort_order));
    return groups;
  }, [filteredPrompts]);

  // Popular templates for quick start
  const popularPrompts = useMemo(() => {
    return POPULAR_TEMPLATES
      .map(id => filteredByDealType.find(p => p.prompt_id === id))
      .filter((p): p is ManifestPrompt => !!p);
  }, [filteredByDealType]);

  const availableCategories = Object.keys(groupedPrompts).filter(
    cat => CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <TemplateSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        availableTags={availableTags}
        totalCount={filteredByDealType.length}
        filteredCount={filteredPrompts.length}
      />

      {/* View Toggle */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          variant={activeView === "quick" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveView("quick")}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Quick Start
        </Button>
        <Button
          variant={activeView === "browse" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveView("browse")}
          className="gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Browse All
        </Button>
      </div>

      {/* Quick Start View */}
      {activeView === "quick" && !searchQuery && selectedTags.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Popular Templates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularPrompts.map(prompt => (
              <TemplateCard
                key={prompt.prompt_id}
                prompt={prompt}
                isSelected={selectedTemplate === prompt.prompt_id}
                onClick={() => onSelectTemplate(prompt.prompt_id)}
                subcategory={SUBCATEGORIES[prompt.prompt_id]}
              />
            ))}
          </div>
          {popularPrompts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates available</p>
            </div>
          )}
        </div>
      )}

      {/* Browse View or Search Results */}
      {(activeView === "browse" || searchQuery || selectedTags.length > 0) && (
        <div className="space-y-4">
          {/* Category Tabs */}
          {!searchQuery && selectedTags.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(cat => {
                const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
                if (!config) return null;
                const Icon = config.icon;
                const count = groupedPrompts[cat]?.length || 0;
                
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Template Grid */}
          <ScrollArea className="h-[350px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
              {(searchQuery || selectedTags.length > 0 
                ? filteredPrompts 
                : groupedPrompts[selectedCategory] || []
              ).map(prompt => (
                <TemplateCard
                  key={prompt.prompt_id}
                  prompt={prompt}
                  isSelected={selectedTemplate === prompt.prompt_id}
                  onClick={() => onSelectTemplate(prompt.prompt_id)}
                  subcategory={SUBCATEGORIES[prompt.prompt_id]}
                />
              ))}
            </div>
            
            {filteredPrompts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No templates match your search</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
