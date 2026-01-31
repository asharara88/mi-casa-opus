import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Loader2,
  FileCheck,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useDocumentGenerator, useManifestPrompts } from "@/hooks/useManifestExecutor";
import { TemplateBrowser } from "./TemplateBrowser";
import { FormWizard } from "./FormWizard";

interface DocumentGeneratorPanelProps {
  entityType?: string;
  entityId?: string;
  dealType?: "sales" | "leasing";
  prefilledData?: Record<string, unknown>;
  onDocumentGenerated?: (documentId: string, title: string) => void;
}

type ViewState = "browse" | "form" | "preview";

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
  const [viewState, setViewState] = useState<ViewState>("browse");

  const { prompts, fetchPrompts, isLoading: isLoadingPrompts } = useManifestPrompts();
  const { generateDocument, isLoading: isGenerating, error } = useDocumentGenerator();

  // Fetch all prompts on mount
  useEffect(() => {
    fetchPrompts("STATIC_TEMPLATES");
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
  const isStaticTemplate = selectedTemplate?.startsWith("STATIC_") || false;

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setGeneratedDoc(null);
    
    // For static templates, skip form and generate immediately
    if (templateId.startsWith("STATIC_")) {
      setViewState("form"); // Show loading state briefly
      const result = await generateDocument(templateId, {}, entityType, entityId);
      if (result) {
        setGeneratedDoc({ title: result.title, body: result.body });
        setViewState("preview");
        toast.success("Document loaded");
      }
    } else {
      setViewState("form");
    }
  };

  const handleBackToBrowse = () => {
    setViewState("browse");
    setSelectedTemplate(null);
    setFormData({});
    setGeneratedDoc(null);
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
      setViewState("preview");
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

  const handleEditAndRegenerate = () => {
    setViewState("form");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewState !== "browse" && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackToBrowse}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                {viewState === "browse" && "Document Generator"}
                {viewState === "form" && selectedPrompt?.title}
                {viewState === "preview" && generatedDoc?.title}
              </CardTitle>
              <CardDescription>
                {viewState === "browse" && "Search and select a template to generate ADM-compliant documents"}
                {viewState === "form" && selectedPrompt?.purpose}
                {viewState === "preview" && "Review and export your generated document"}
              </CardDescription>
            </div>
          </div>
          
          {viewState === "preview" && generatedDoc && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Copy</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Download</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Loading State */}
        {isLoadingPrompts && viewState === "browse" && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Browse Templates View */}
        {viewState === "browse" && !isLoadingPrompts && (
          <TemplateBrowser
            prompts={prompts}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelect}
            dealType={dealType}
            isLoading={isLoadingPrompts}
          />
        )}

        {/* Form View */}
        {viewState === "form" && selectedPrompt && (
          <FormWizard
            prompt={selectedPrompt}
            formData={formData}
            onFieldChange={handleFieldChange}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={error}
          />
        )}

        {/* Preview View */}
        {viewState === "preview" && generatedDoc && (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={handleEditAndRegenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Edit & Regenerate
              </Button>
            </div>
            <ScrollArea className="h-[450px] border rounded-lg p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {generatedDoc.body}
              </pre>
            </ScrollArea>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t">
              <Button onClick={handleCopy} variant="outline">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy to Clipboard
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
