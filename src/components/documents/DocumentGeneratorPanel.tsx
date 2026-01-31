import { useState, useCallback, useEffect } from "react";
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
  RefreshCw
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

// Map prompt IDs to friendly names and categories
const TEMPLATE_CATEGORIES = {
  DOCUMENT_TEMPLATES: {
    label: "Documents",
    templates: [
      { id: "DOC_BROKERAGE_SALES", label: "Sales Brokerage Agreement", dealType: "sales" },
      { id: "DOC_BROKERAGE_LEASING", label: "Leasing Brokerage Agreement", dealType: "leasing" },
      { id: "DOC_AGENT_TO_AGENT_MASTER", label: "Agent-to-Agent Master", dealType: null },
      { id: "DOC_AGENT_TO_AGENT_ANNEX", label: "Agent-to-Agent Annex", dealType: null },
      { id: "DOC_BUYER_OFFER", label: "Buyer Offer Letter", dealType: "sales" },
      { id: "DOC_TENANT_OFFER", label: "Tenant Intent Letter", dealType: "leasing" },
      { id: "DOC_COMMISSION_INVOICE", label: "Commission Invoice", dealType: null },
      { id: "DOC_COMMISSION_SPLIT", label: "Commission Split Confirmation", dealType: null },
    ]
  },
  ADMIN_OPS: {
    label: "Admin Operations",
    templates: [
      { id: "ADMIN_DOC_INDEX", label: "Deal Document Index", dealType: null },
      { id: "ADMIN_AUDIT_EXPORT", label: "Audit Export Checklist", dealType: null },
    ]
  }
};

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

  const { prompts, fetchPrompts, isLoading: isLoadingPrompts } = useManifestPrompts();
  const { generateDocument, isLoading: isGenerating, error } = useDocumentGenerator();

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts("DOCUMENT_TEMPLATES");
    fetchPrompts("ADMIN_OPS");
  }, [fetchPrompts]);

  // Apply prefilled data when template changes
  useEffect(() => {
    if (prefilledData && selectedTemplate) {
      setFormData(prev => ({ ...prev, ...prefilledData }));
    }
  }, [prefilledData, selectedTemplate]);

  const selectedPrompt = prompts.find(p => p.prompt_id === selectedTemplate);

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

  // Filter templates based on deal type
  const getFilteredTemplates = () => {
    const result: typeof TEMPLATE_CATEGORIES = JSON.parse(JSON.stringify(TEMPLATE_CATEGORIES));
    
    if (dealType) {
      Object.keys(result).forEach(cat => {
        const category = result[cat as keyof typeof TEMPLATE_CATEGORIES];
        category.templates = category.templates.filter(
          t => t.dealType === null || t.dealType === dealType
        );
      });
    }
    
    return result;
  };

  const filteredTemplates = getFilteredTemplates();

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
      }>;
    };

    const required = schema.required || [];
    const properties = schema.properties || {};

    return (
      <div className="space-y-6">
        {Object.entries(properties).map(([key, prop]) => {
          const isRequired = required.includes(key);
          const value = formData[key];

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
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => handleFieldChange(path, checked)}
        />
      );
    }

    // Number field
    if (prop.type === "number") {
      return (
        <Input
          type="number"
          value={(value as number) || ""}
          onChange={(e) => handleFieldChange(path, parseFloat(e.target.value) || 0)}
          placeholder={`Enter ${path.split(".").pop()?.replace(/_/g, " ")}`}
        />
      );
    }

    // String field - use textarea for longer content
    if (path.includes("content") || path.includes("notes") || path.includes("conditions")) {
      return (
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => handleFieldChange(path, e.target.value)}
          placeholder={`Enter ${path.split(".").pop()?.replace(/_/g, " ")}`}
          rows={3}
        />
      );
    }

    // Default string input
    return (
      <Input
        value={(value as string) || ""}
        onChange={(e) => handleFieldChange(path, e.target.value)}
        placeholder={`Enter ${path.split(".").pop()?.replace(/_/g, " ")}`}
      />
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Document Generator
            </CardTitle>
            <CardDescription>
              Generate ADM-compliant documents from templates
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selector */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Select Template</h4>
            <ScrollArea className="h-[400px] pr-4">
              {Object.entries(filteredTemplates).map(([catKey, category]) => (
                <div key={catKey} className="mb-4">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {category.label}
                  </h5>
                  <div className="space-y-1">
                    {category.templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          "hover:bg-accent",
                          selectedTemplate === template.id
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{template.label}</span>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
                <ScrollArea className="h-[350px] pr-4">
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
