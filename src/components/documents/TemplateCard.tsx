import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle2, 
  Shield, 
  Receipt, 
  Users, 
  Building,
  FileCheck,
  AlertTriangle,
  ClipboardList,
  Scale,
  Lock,
  FileSignature
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManifestPrompt } from "@/types/manifest";

interface TemplateCardProps {
  prompt: ManifestPrompt;
  isSelected: boolean;
  onClick: () => void;
  subcategory?: string;
}

// Icon mapping for different template types
const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Static templates (locked - no AI)
  STATIC_ADM_FORM_A: FileSignature,
  STATIC_ADM_FORM_B: FileSignature,
  STATIC_NDA: Lock,
  STATIC_VIEWING_RECEIPT: FileCheck,
  STATIC_COMMISSION_RECEIPT: Receipt,
  STATIC_HANDOVER_CHECKLIST: ClipboardList,
  STATIC_RESERVATION: FileSignature,
  // Document types
  DOC_BROKERAGE_SALES: FileText,
  DOC_BROKERAGE_LEASING: FileText,
  DOC_SELLER_MANDATE: Building,
  DOC_LANDLORD_MANDATE: Building,
  DOC_AGENT_TO_AGENT_MASTER: Users,
  DOC_AGENT_TO_AGENT_ANNEX: Users,
  DOC_BUYER_OFFER: FileCheck,
  DOC_TENANT_OFFER: FileCheck,
  DOC_COMMISSION_INVOICE: Receipt,
  DOC_COMMISSION_SPLIT: Receipt,
  DOC_PAYMENT_RECEIPT: Receipt,
  DOC_VIEWING_CONFIRMATION: CheckCircle2,
  DOC_NOC_REQUEST: FileText,
  DOC_HANDOVER_CHECKLIST: ClipboardList,
  // Compliance
  AML_SALES_CHECK: AlertTriangle,
  KYC_LEASING_CHECK: Shield,
  COMPLIANCE_PORTALS_MAP: Shield,
  CONTROL_COMMISSION_DISPUTE: Scale,
  CONTROL_AUDIT_TRAIL: FileCheck,
  CONTROL_AUTHORITY_CHAIN: Users,
  // Checklists
  CHECKLIST_SALES_DEAL: ClipboardList,
  CHECKLIST_LEASING_DEAL: ClipboardList,
  CHECKLIST_AGENT_ONBOARDING: Users,
  // Gates
  FLOW_SALES_GATE: Shield,
  FLOW_LEASING_GATE: Shield,
  // Admin
  ADMIN_DOC_INDEX: FileText,
  ADMIN_AUDIT_EXPORT: FileCheck,
};

// Color schemes for different categories
const CATEGORY_COLORS: Record<string, string> = {
  STATIC_TEMPLATES: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  DOCUMENT_TEMPLATES: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CHECKLISTS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  COMPLIANCE: "bg-red-500/10 text-red-500 border-red-500/20",
  ADMIN_OPS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  WORKFLOW_GATES: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

// Check if template is static (no AI modification)
const isStaticTemplate = (promptId: string) => promptId.startsWith("STATIC_");

export function TemplateCard({ prompt, isSelected, onClick, subcategory }: TemplateCardProps) {
  const Icon = TEMPLATE_ICONS[prompt.prompt_id] || FileText;
  const colorClass = CATEGORY_COLORS[prompt.group_name] || "bg-muted text-muted-foreground";
  const isStatic = isStaticTemplate(prompt.prompt_id);
  
  // Extract key input fields for preview
  const inputSchema = prompt.input_schema as { required?: string[] } | null;
  const requiredFields = inputSchema?.required || [];
  
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "border-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-transparent hover:border-muted-foreground/20",
        isStatic && "ring-1 ring-orange-500/30"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border relative",
            colorClass
          )}>
            <Icon className="h-5 w-5" />
            {isStatic && (
              <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5">
                <Lock className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm text-foreground leading-tight">
                {prompt.title}
              </h4>
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {prompt.purpose}
            </p>
            
            {/* Tags & Meta */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {isStatic && (
                <Badge variant="outline" className="text-xs py-0 bg-orange-500/10 text-orange-600 border-orange-500/30">
                  <Lock className="h-3 w-3 mr-1" />
                  No AI
                </Badge>
              )}
              {subcategory && !isStatic && (
                <Badge variant="outline" className="text-xs py-0">
                  {subcategory}
                </Badge>
              )}
              {requiredFields.length > 0 && !isStatic && (
                <span className="text-xs text-muted-foreground">
                  {requiredFields.length} fields
                </span>
              )}
              {!isStatic && prompt.tags?.slice(0, 2).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs py-0 opacity-70"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
