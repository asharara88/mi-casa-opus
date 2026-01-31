import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  AlertCircle,
  Loader2,
  ChevronRight,
  FileCheck,
  RefreshCw,
  FolderOpen,
  Building,
  Users,
  Receipt,
  Shield,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { useDocumentGenerator, useManifestPrompts } from "@/hooks/useManifestExecutor";
import type { ManifestPrompt } from "@/types/manifest";
import { cn } from "@/lib/utils";

interface DocumentGeneratorPanelProps {
  entityType?: string;
  entityId?: string;
  dealType?: "sales" | "leasing";
  prefilledData?: Record<string, unknown>;
  onDocumentGenerated?: (documentId: string, title: string) => void;
}

// Category metadata for display
const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  DOCUMENT_TEMPLATES: {
    label: "Documents",
    icon: FileText,
    description: "Generate ADM-compliant documents"
  },
  CHECKLISTS: {
    label: "Checklists",
    icon: FolderOpen,
    description: "Deal & onboarding checklists"
  },
  COMPLIANCE: {
    label: "Compliance",
    icon: Shield,
    description: "AML, KYC & validation controls"
  },
  ADMIN_OPS: {
    label: "Admin Ops",
    icon: Settings,
    description: "Audit & administrative tools"
  },
  WORKFLOW_GATES: {
    label: "Workflow Gates",
    icon: FolderOpen,
    description: "Transaction flow controls"
  }
};

// Template subcategories for better organization
const TEMPLATE_SUBCATEGORIES: Record<string, string> = {
  // Document Templates
  DOC_SELLER_MANDATE: "Mandates",
  DOC_LANDLORD_MANDATE: "Mandates",
  DOC_BROKERAGE_SALES: "Brokerage Agreements",
  DOC_BROKERAGE_LEASING: "Brokerage Agreements",
  DOC_AGENT_TO_AGENT_MASTER: "Agent Cooperation",
  DOC_AGENT_TO_AGENT_ANNEX: "Agent Cooperation",
  DOC_BUYER_OFFER: "Offers & Letters",
  DOC_TENANT_OFFER: "Offers & Letters",
  DOC_VIEWING_CONFIRMATION: "Transaction Support",
  DOC_NOC_REQUEST: "Transaction Support",
  DOC_HANDOVER_CHECKLIST: "Transaction Support",
  DOC_COMMISSION_INVOICE: "Finance",
  DOC_COMMISSION_SPLIT: "Finance",
  DOC_PAYMENT_RECEIPT: "Finance",
  // Checklists
  CHECKLIST_SALES_DEAL: "Deal Checklists",
  CHECKLIST_LEASING_DEAL: "Deal Checklists",
  CHECKLIST_AGENT_ONBOARDING: "Onboarding",
  // Compliance
  AML_SALES_CHECK: "Risk Assessment",
  KYC_LEASING_CHECK: "KYC Verification",
  COMPLIANCE_PORTALS_MAP: "Portal Compliance",
  CONTROL_COMMISSION_DISPUTE: "Dispute Prevention",
  CONTROL_AUDIT_TRAIL: "Audit Validation",
  CONTROL_AUTHORITY_CHAIN: "Authority Validation",
};

// Deal type filtering
const SALES_ONLY = ["DOC_SELLER_MANDATE", "DOC_BROKERAGE_SALES", "DOC_BUYER_OFFER", "AML_SALES_CHECK", "FLOW_SALES_GATE"];
const LEASING_ONLY = ["DOC_LANDLORD_MANDATE", "DOC_BROKERAGE_LEASING", "DOC_TENANT_OFFER", "KYC_LEASING_CHECK", "FLOW_LEASING_GATE"];

export function DocumentGeneratorPanel({
  entityType,
  entityId,
  dealType,
  prefilledData,
  onDocumentGenerated,
}: DocumentGeneratorPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [generatedDoc, setGeneratedDoc] = useState<{ title: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [selectedCategory, setSelectedCategory] = useState("DOCUMENT_TEMPLATES");

  const { prompts, fetchPrompts, isLoading: isLoadingPrompts } = useManifestPrompts();
  const { generateDocument, isLoading: isGenerating, error } = useDocumentGenerator();

  // Fetch all prompts on mount
  useEffect(() => {
    fetchPrompts("DOCUMENT_TEMPLATES");
    fetchPrompts("CHECKLISTS");
    fetchPrompts("COMPLIANCE");
    fetchPrompts("ADMIN_OPS");
    fetchPrompts("WORKFLOW_GATES");
  }, [fetchPrompts]);

  // Apply prefilled data when template changes
  useEffect(() => {
    if (prefilledData && selectedTemplate) {
      setFormData(prev => ({ ...prev, ...prefilledData }));
    }
  }, [prefilledData, selectedTemplate]);

  const selectedPrompt = prompts.find(p => p.prompt_id === selectedTemplate);

  // Organize prompts by category and subcategory
  const organizedPrompts = useMemo(() => {
    const organized: Record<string, { subcategory: string; prompts: ManifestPrompt[] }[]> = {};
    
    // Filter by deal type if specified
    const filteredPrompts = prompts.filter(p => {
      if (!dealType) return true;
      if (dealType === "sales" && LEASING_ONLY.includes(p.prompt_id)) return false;
      if (dealType === "leasing" && SALES_ONLY.includes(p.prompt_id)) return false;
      return true;
    });

    // Exclude system prompts
    const visiblePrompts = filteredPrompts.filter(p => p.group_name !== "SYSTEM");

    visiblePrompts.forEach(prompt => {
      const group = prompt.group_name;
      if (!organized[group]) {
        organized[group] = [];
      }

      const subcategory = TEMPLATE_SUBCATEGORIES[prompt.prompt_id] || "General";
      let subcat = organized[group].find(s => s.subcategory === subcategory);
      if (!subcat) {
        subcat = { subcategory, prompts: [] };
        organized[group].push(subcat);
      }
      subcat.prompts.push(prompt);
    });

    // Sort subcategories and prompts
    Object.keys(organized).forEach(group => {
      organized[group].sort((a, b) => a.subcategory.localeCompare(b.subcategory));
      organized[group].forEach(sub => {
        sub.prompts.sort((a, b) => a.sort_order - b.sort_order);
      });
    });

    return organized;
  }, [prompts, dealType]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setGeneratedDoc(null);
    setActiveTab("form");
  };

  const handleFieldChange = (path: string, value: unknown) => {
    setFormData(prev => {
      const parts = path.split(".");
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }
      
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    const result = await generateDocument(
      selectedTemplate,
      formData,
      entityType,
      entityId
    );

    if (result) {
      setGeneratedDoc({ title: result.title, body: result.body });
      setActiveTab("preview");
      toast.success("Document generated successfully");
      
      if (result.documentId && onDocumentGenerated) {
        onDocumentGenerated(result.documentId, result.title);
      }
    } else if (error) {
      toast.error("Generation failed", { description: error });
    }
  };

  const handleCopy = useCallback(() => {
    if (generatedDoc) {
      navigator.clipboard.writeText(generatedDoc.body);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedDoc]);

  const handleDownload = useCallback(() => {
    if (generatedDoc) {
      const blob = new Blob([generatedDoc.body], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedDoc.title.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Document downloaded");
    }
  }, [generatedDoc]);

  // Render form fields based on input schema
  const renderFormFields = () => {
    if (!selectedPrompt?.input_schema) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select a template to begin</p>
        </div>
      );
    }

    const schema = selectedPrompt.input_schema as {
      required?: string[];
      properties?: Record<string, {
        type: string;
        enum?: string[];
        properties?: Record<string, unknown>;
        required?: string[];
        items?: { type: string; properties?: Record<string, unknown> };
      }>;
    };

    const required = schema.required || [];
    const properties = schema.properties || {};

    return (
      <div className="space-y-6">
        {Object.entries(properties).map(([key, prop]) => {
          const isRequired = required.includes(key);
          const value = formData[key];

          // Handle array fields
          if (prop.type === "array" && prop.items?.type === "object") {
            return (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </h4>
                  {isRequired && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add items below (array fields - simplified input)
                </p>
                <Textarea
                  value={JSON.stringify(value || [], null, 2)}
                  onChange={(e) => {
                    try {
                      handleFieldChange(key, JSON.parse(e.target.value));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder={`Enter JSON array for ${key}`}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            );
          }

          // Handle nested objects
          if (prop.type === "object" && prop.properties) {
            return (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </h4>
                  {isRequired && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <div className="pl-4 border-l-2 border-muted space-y-3">
                  {Object.entries(prop.properties).map(([nestedKey, nestedProp]: [string, any]) => (
                    <div key={`${key}.${nestedKey}`} className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground capitalize">
                        {nestedKey.replace(/_/g, " ")}
                        {prop.required?.includes(nestedKey) && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {renderField(`${key}.${nestedKey}`, nestedProp, (value as Record<string, unknown>)?.[nestedKey])}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="space-y-1.5">
              <Label className="capitalize">
                {key.replace(/_/g, " ")}
                {isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(key, prop, value)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderField = (path: string, prop: any, value: unknown) => {
    // Enum field - render as select
    if (prop.enum) {
      return (
        <Select
          value={(value as string) || ""}
          onValueChange={(v) => handleFieldChange(path, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${path.split(".").pop()?.replace(/_/g, " ")}`} />
          </SelectTrigger>
          <SelectContent>
            {prop.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Boolean field - render as switch
    if (prop.type === "boolean") {
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => handleFieldChange(path, checked)}
          />
          <span className="text-sm text-muted-foreground">
            {value ? "Yes" : "No"}
          </span>
        </div>
      );
    }

    // Number/integer field
    if (prop.type === "number" || prop.type === "integer") {
      return (
        <Input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => handleFieldChange(path, parseFloat(e.target.value) || 0)}
          placeholder={`Enter ${path.split(".").pop()?.replace(/_/g, " ")}`}
        />
      );
    }

    // Date field
    if (prop.format === "date") {
      return (
        <Input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => handleFieldChange(path, e.target.value)}
        />
      );
    }

    // String field - use textarea for longer content
    const fieldName = path.split(".").pop() || "";
    if (fieldName.includes("content") || fieldName.includes("notes") || fieldName.includes("conditions") || fieldName.includes("comments")) {
      return (
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => handleFieldChange(path, e.target.value)}
          placeholder={`Enter ${fieldName.replace(/_/g, " ")}`}
          rows={3}
        />
      );
    }

    // Default string input
    return (
      <Input
        value={(value as string) || ""}
        onChange={(e) => handleFieldChange(path, e.target.value)}
        placeholder={`Enter ${fieldName.replace(/_/g, " ")}`}
      />
    );
  };

  const availableCategories = Object.keys(organizedPrompts).filter(
    cat => CATEGORY_META[cat] && organizedPrompts[cat]?.length > 0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              MICASA Ai Document Generator
            </CardTitle>
            <CardDescription>
              Generate ADM-compliant documents from BOS templates
            </CardDescription>
          </div>
          {generatedDoc && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b">
          {availableCategories.map(cat => {
            const meta = CATEGORY_META[cat];
            if (!meta) return null;
            const Icon = meta.icon;
            const count = organizedPrompts[cat]?.reduce((acc, sub) => acc + sub.prompts.length, 0) || 0;
            
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {meta.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">Select Template</h4>
              {isLoadingPrompts && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <ScrollArea className="h-[400px] pr-4">
              {organizedPrompts[selectedCategory]?.map((subcat) => (
                <div key={subcat.subcategory} className="mb-4">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                    <FolderOpen className="h-3 w-3" />
                    {subcat.subcategory}
                  </h5>
                  <div className="space-y-1">
                    {subcat.prompts.map((prompt) => (
                      <button
                        key={prompt.prompt_id}
                        onClick={() => handleTemplateSelect(prompt.prompt_id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          "hover:bg-accent",
                          selectedTemplate === prompt.prompt_id
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{prompt.title}</span>
                          <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {(!organizedPrompts[selectedCategory] || organizedPrompts[selectedCategory].length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No templates in this category</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Form / Preview */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="form">
                  <FileText className="h-4 w-4 mr-2" />
                  Input Form
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!generatedDoc}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-0">
                {selectedPrompt && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-md">
                    <h3 className="font-medium text-foreground">{selectedPrompt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedPrompt.purpose}</p>
                    {selectedPrompt.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedPrompt.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <ScrollArea className="h-[320px] pr-4">
                  {renderFormFields()}
                </ScrollArea>

                {selectedTemplate && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      )}
                      <div className="ml-auto">
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Document
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                {generatedDoc && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{generatedDoc.title}</h3>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("form")}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Edit & Regenerate
                      </Button>
                    </div>
                    <ScrollArea className="h-[350px] border rounded-md p-4 bg-muted/30">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                        {generatedDoc.body}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
