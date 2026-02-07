import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Loader2,
  CalendarIcon,
  HelpCircle,
  Check,
  Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { TEMPLATE_SCHEMAS, TemplateSchema, FieldSchema } from "@/lib/template-schemas";
import { useMiCasaDefaults } from "@/hooks/useMiCasaDefaults";
import { toast } from "sonner";

interface StaticFormFillerProps {
  templateId: string;
  onComplete: (data: Record<string, unknown>, filledContent: string) => void;
  onCancel: () => void;
  linkedDealId?: string;
  linkedLeadId?: string;
  isProcessing?: boolean;
  initialPrefill?: Record<string, unknown>;
}

// Format number as AED currency
function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-AE', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

function parseCurrency(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0;
}

export function StaticFormFiller({
  templateId,
  onComplete,
  onCancel,
  linkedDealId,
  linkedLeadId,
  isProcessing = false,
  initialPrefill
}: StaticFormFillerProps) {
  const schema = TEMPLATE_SCHEMAS[templateId];
  const { micasaDefaults } = useMiCasaDefaults();
  
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [currentSection, setCurrentSection] = useState(0);
  
  // Get unique sections in order
  const sections = useMemo(() => {
    if (!schema) return [];
    const sectionSet = new Set<string>();
    Object.values(schema.fields).forEach(field => {
      sectionSet.add(field.section);
    });
    return Array.from(sectionSet);
  }, [schema]);
  
  // Get fields for current section
  const currentFields = useMemo(() => {
    if (!schema || !sections[currentSection]) return [];
    return Object.entries(schema.fields).filter(
      ([_, field]) => field.section === sections[currentSection]
    );
  }, [schema, sections, currentSection]);
  
  // Pre-fill data on mount from multiple sources
  useEffect(() => {
    // Try to read prefill from session storage (from AI chat)
    let storedPrefill: Record<string, unknown> = {};
    try {
      const stored = sessionStorage.getItem(`template_prefill_${templateId}`);
      if (stored) {
        storedPrefill = JSON.parse(stored);
        sessionStorage.removeItem(`template_prefill_${templateId}`);
      }
    } catch (e) {
      console.error('[StaticFormFiller] Failed to read stored prefill:', e);
    }
    
    // Merge prefill sources: session storage > props > defaults
    setFormData(prev => ({
      ...prev,
      broker_representative: prev.broker_representative || "",
      // Pre-fill linked IDs
      ...(linkedDealId && { deal_crm_id: linkedDealId }),
      ...(linkedLeadId && { linked_lead_id: linkedLeadId }),
      // Apply stored prefill (from AI conversation)
      ...storedPrefill,
      // Apply initial prefill props (takes highest priority if provided)
      ...initialPrefill
    }));
    
    // Show toast if we pre-filled from conversation
    if (Object.keys(storedPrefill).length > 0) {
      toast.success('Form pre-filled', {
        description: `${Object.keys(storedPrefill).length} fields populated from conversation`
      });
    }
  }, [templateId, micasaDefaults, linkedDealId, linkedLeadId, initialPrefill]);

  // Calculate completion
  const completion = useMemo(() => {
    if (!schema) return 0;
    const requiredFields = Object.entries(schema.fields).filter(([_, f]) => f.required);
    if (requiredFields.length === 0) return 100;
    
    const filledRequired = requiredFields.filter(([key]) => {
      const val = formData[key];
      return val !== undefined && val !== null && val !== "";
    });
    
    return Math.round((filledRequired.length / requiredFields.length) * 100);
  }, [schema, formData]);
  
  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };
  
  const handleComplete = async () => {
    // Validate required fields
    const missingRequired = Object.entries(schema.fields)
      .filter(([key, field]) => field.required && !formData[key])
      .map(([_, field]) => field.label);
    
    if (missingRequired.length > 0) {
      toast.error("Missing required fields", {
        description: missingRequired.slice(0, 3).join(", ") + (missingRequired.length > 3 ? "..." : "")
      });
      return;
    }
    
    // Fetch and fill the markdown template
    try {
      const filledContent = await fillTemplate(templateId, formData, micasaDefaults);
      onComplete(formData, filledContent);
    } catch (error) {
      toast.error("Failed to generate document");
      console.error(error);
    }
  };
  
  if (!schema) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Template not found: {templateId}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{schema.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{schema.description}</p>
        
        {/* Linked Deal/Lead indicator */}
        {(linkedDealId || linkedLeadId) && (
          <div className="flex items-center gap-2 text-xs">
            <Link2 className="h-3 w-3" />
            <span className="text-muted-foreground">
              Linked to: {linkedDealId || linkedLeadId}
            </span>
          </div>
        )}
      </div>
      
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Section {currentSection + 1} of {sections.length}: {sections[currentSection]}
          </span>
          <span className="font-medium">{completion}% complete</span>
        </div>
        <Progress value={completion} className="h-2" />
        
        {/* Section pills */}
        <div className="flex gap-1 flex-wrap">
          {sections.map((section, idx) => (
            <button
              key={section}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                "px-2 py-1 text-xs rounded-full transition-colors",
                idx === currentSection
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {idx < currentSection && <Check className="h-3 w-3 inline mr-1" />}
              {section}
            </button>
          ))}
        </div>
      </div>
      
      {/* Form Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{sections[currentSection]}</CardTitle>
          <CardDescription>Fill in the details below</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[350px] pr-4">
            <div className="space-y-4">
              {currentFields.map(([key, field]) => (
                <FieldRenderer
                  key={key}
                  fieldKey={key}
                  field={field}
                  value={formData[key]}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {currentSection > 0 && (
            <Button variant="outline" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
        
        {currentSection < sections.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Document
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Field renderer component
interface FieldRendererProps {
  fieldKey: string;
  field: FieldSchema;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}

function FieldRenderer({ fieldKey, field, value, onChange }: FieldRendererProps) {
  const isCurrency = field.format === "currency";
  const isDate = field.type === "date" || field.format === "date";
  
  // Enum field - dropdown
  if (field.enum) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{field.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </label>
        <Select
          value={(value as string) || ""}
          onValueChange={(v) => onChange(fieldKey, v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {field.enum.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  // Boolean field - switch
  if (field.type === "boolean") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </label>
          <div className="flex items-center gap-2">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => onChange(fieldKey, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {value ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Date field
  if (isDate) {
    const dateValue = value ? (typeof value === 'string' ? parseISO(value) : value as Date) : undefined;
    
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-background",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => onChange(fieldKey, date ? format(date, 'yyyy-MM-dd') : '')}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  
  // Currency field
  if (isCurrency) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            AED
          </span>
          <Input
            type="text"
            value={value ? formatCurrency(value as number) : ""}
            onChange={(e) => onChange(fieldKey, parseCurrency(e.target.value))}
            placeholder="0"
            className="bg-background pl-12 text-right"
          />
        </div>
      </div>
    );
  }
  
  // Default text input
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
        {field.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{field.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
      <Input
        type={field.format === "email" ? "email" : field.format === "phone" ? "tel" : "text"}
        value={(value as string) || ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        className="bg-background"
      />
    </div>
  );
}

// Fill template with form data
async function fillTemplate(
  templateId: string,
  formData: Record<string, unknown>,
  micasaDefaults: ReturnType<typeof useMiCasaDefaults>["micasaDefaults"]
): Promise<string> {
  const schema = TEMPLATE_SCHEMAS[templateId];
  if (!schema) throw new Error("Template schema not found");
  
  // Fetch the markdown template
  const templatePath = `/docs/templates/${templateId.replace("FORM_", "").toLowerCase().replace(/_/g, "_")}.md`;
  
  // Map template IDs to file names
  const fileMap: Record<string, string> = {
    "FORM_01_SELLER_AUTH": "01_seller_landlord_authorization.md",
    "FORM_02_BUYER_REP": "02_buyer_tenant_representation_agreement.md",
    "FORM_03_MARKETING": "03_property_listing_authorization_marketing_consent.md",
    "FORM_04_AGENT_LICENSE": "04_agent_license_registration_record.md",
    "FORM_05_COMPANY_LICENSE": "05_company_trade_license_regulatory_record.md",
    "FORM_06_AGENT_AGREEMENT": "06_agent_to_agent_agency_agreement.md",
    "FORM_07_OFFER": "07_offer_letter_expression_of_interest.md",
    "FORM_08_MOU": "08_memorandum_of_understanding_pre_spa.md",
    "FORM_09_RESERVATION": "09_reservation_booking_form.md",
    "FORM_10_CLOSING": "10_deal_completion_closing_checklist.md",
    "FORM_11_NOC": "11_noc_request_clearance_tracker.md",
    "FORM_12_INVOICE": "12_commission_vat_invoice.md",
    "FORM_13_SPLIT": "13_commission_authorization_split_sheet.md",
    "FORM_14_REFUND": "14_refund_cancellation_approval_form.md",
    "FORM_15_LEDGER": "15_financial_reconciliation_deal_ledger.md",
    "FORM_16_PRIVACY": "16_client_data_consent_privacy_acknowledgment.md",
    "FORM_17_COMPLAINT": "17_complaint_dispute_incident_register.md",
    "FORM_18_GOVERNANCE": "18_internal_agent_governance_pack.md"
  };
  
  const fileName = fileMap[templateId];
  if (!fileName) throw new Error("Template file mapping not found");
  
  const response = await fetch(`/docs/templates/${fileName}`);
  if (!response.ok) throw new Error("Failed to fetch template");
  
  let content = await response.text();
  
  // Replace blank fields with form data
  // Pattern: ____ or __________________________ or similar
  Object.entries(formData).forEach(([key, value]) => {
    const field = schema.fields[key];
    if (!field || value === undefined || value === null) return;
    
    // Format value based on type
    let displayValue: string;
    if (field.type === "boolean") {
      displayValue = value ? "Yes" : "No";
    } else if (field.format === "currency" && typeof value === "number") {
      displayValue = `AED ${formatCurrency(value)}`;
    } else if (field.format === "date" && value) {
      displayValue = typeof value === "string" ? value : format(value as Date, "dd/MM/yyyy");
    } else {
      displayValue = String(value);
    }
    
    // Try to match label patterns in the document
    const labelPatterns = [
      field.label,
      field.label.replace(/\s+/g, " "),
      key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    ];
    
    labelPatterns.forEach(label => {
      // Pattern: "Label: ____" or "Label: __________________________"
      const pattern1 = new RegExp(`(${escapeRegex(label)}:\\s*)_+`, 'gi');
      content = content.replace(pattern1, `$1${displayValue}`);
      
      // Pattern: "Label ____" (without colon)
      const pattern2 = new RegExp(`(${escapeRegex(label)}\\s+)_+`, 'gi');
      content = content.replace(pattern2, `$1${displayValue}`);
    });
  });
  
  // Replace checkboxes based on boolean values
  Object.entries(formData).forEach(([key, value]) => {
    const field = schema.fields[key];
    if (!field) return;
    
    if (field.type === "boolean" && value === true) {
      // Try to check the relevant checkbox
      const label = field.label.toLowerCase();
      // Pattern: [ ] Label -> [X] Label
      const pattern = new RegExp(`\\[\\s*\\]\\s*(${escapeRegex(field.label)})`, 'gi');
      content = content.replace(pattern, '[X] $1');
    }
  });
  
  // Fill in company defaults
  if (micasaDefaults) {
    content = content.replace(/MI CASA REALESTATE - مي كاسا للعقارات/g, micasaDefaults.legal_name);
    content = content.replace(/CN-3762725/g, micasaDefaults.license_no);
    content = content.replace(/100496681600003/g, micasaDefaults.trn);
  }
  
  return content;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
