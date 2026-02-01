import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Loader2,
  RefreshCw,
  ArrowLeft,
  Rocket,
  FolderOpen,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { useDocumentGenerator, useManifestPrompts } from "@/hooks/useManifestExecutor";
import { TemplateBrowser } from "./TemplateBrowser";
import { FormWizard } from "./FormWizard";
import { WorkflowWizard, type WorkflowType } from "./WorkflowWizard";
import { QuickAccessGrid } from "./QuickAccessGrid";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { useMiCasaDefaults, addRecentTemplate } from "@/hooks/useMiCasaDefaults";

interface DocumentGeneratorPanelProps {
  entityType?: string;
  entityId?: string;
  dealType?: "sales" | "leasing";
  prefilledData?: Record<string, unknown>;
  onDocumentGenerated?: (documentId: string, title: string) => void;
}

type ViewState = "home" | "workflow" | "browse" | "form" | "preview";

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
  const [viewState, setViewState] = useState<ViewState>("home");
  const [previousViewState, setPreviousViewState] = useState<ViewState | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<{ prompt: typeof prompts[0] | null; isStatic: boolean }>({ prompt: null, isStatic: false });

  const { prompts, fetchAllPrompts, isLoading: isLoadingPrompts } = useManifestPrompts();
  const { generateDocument, isLoading: isGenerating, error } = useDocumentGenerator();
  const { getPrefilledData } = useMiCasaDefaults();

  // Fetch all prompts on mount (single call)
  useEffect(() => {
    fetchAllPrompts();
  }, [fetchAllPrompts]);

  // Apply prefilled data when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const defaults = getPrefilledData(selectedTemplate);
      setFormData(prev => ({ ...defaults, ...prefilledData, ...prev }));
    }
  }, [selectedTemplate, prefilledData, getPrefilledData]);

  const selectedPrompt = prompts.find(p => p.prompt_id === selectedTemplate);
  const isStaticTemplate = selectedTemplate?.startsWith("STATIC_") || false;

  const handleTemplateSelect = async (templateId: string) => {
    const prompt = prompts.find(p => p.prompt_id === templateId);
    if (!prompt) return;

    // Track where we came from
    setPreviousViewState(viewState);
    // Show preview modal first
    setPreviewPrompt({ prompt, isStatic: templateId.startsWith("STATIC_") });
  };

  const handleOfficialFormSelect = async (templateId: string) => {
    const prompt = prompts.find(p => p.prompt_id === templateId);
    if (!prompt) return;

    // Track where we came from
    setPreviousViewState(viewState);
    // Show preview modal for static forms
    setPreviewPrompt({ prompt, isStatic: true });
  };

  const handleStartFormFromPreview = async () => {
    const { prompt, isStatic } = previewPrompt;
    if (!prompt) return;

    setPreviewPrompt({ prompt: null, isStatic: false });
    setSelectedTemplate(prompt.prompt_id);
    setFormData({});
    setGeneratedDoc(null);
    
    // Track in recent
    addRecentTemplate(prompt.prompt_id, prompt.title);
    
    // For static templates, skip form and generate immediately
    if (isStatic) {
      setViewState("form"); // Show loading state briefly
      const result = await generateDocument(prompt.prompt_id, {}, entityType, entityId);
      if (result) {
        setGeneratedDoc({ title: result.title, body: result.body });
        setViewState("preview");
        toast.success("Document loaded");
      }
    } else {
      setViewState("form");
    }
  };

  const handleBack = () => {
    // Return to previous view (workflow or home)
    if (viewState === "form" || viewState === "preview") {
      const returnTo = previousViewState || "home";
      setViewState(returnTo);
      setSelectedTemplate(null);
      setFormData({});
      setGeneratedDoc(null);
    } else {
      setViewState("home");
      setPreviousViewState(null);
    }
  };

  const handleBackToHome = () => {
    setViewState("home");
    setPreviousViewState(null);
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

  // Header title and description based on view state
  const getHeaderContent = () => {
    switch (viewState) {
      case "home":
        return {
          title: "Generate Documents",
          description: "Create ADM-compliant documents and forms",
          icon: <Sparkles className="h-5 w-5 text-primary" />
        };
      case "workflow":
        return {
          title: "Guided Workflow",
          description: "Step-by-step document generation",
          icon: <Rocket className="h-5 w-5 text-primary" />
        };
      case "browse":
        return {
          title: "Browse Templates",
          description: "Search and select from all available templates",
          icon: <FolderOpen className="h-5 w-5 text-primary" />
        };
      case "form":
        return {
          title: selectedPrompt?.title || "Document Form",
          description: selectedPrompt?.purpose || "Fill in the required fields",
          icon: isStaticTemplate 
            ? <Lock className="h-5 w-5 text-amber-500" />
            : <Sparkles className="h-5 w-5 text-primary" />
        };
      case "preview":
        return {
          title: generatedDoc?.title || "Generated Document",
          description: "Review and export your document",
          icon: <Check className="h-5 w-5 text-emerald-500" />
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewState !== "home" && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={viewState === "form" || viewState === "preview" ? handleBack : handleBackToHome}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                {headerContent.icon}
                {headerContent.title}
              </CardTitle>
              <CardDescription>
                {headerContent.description}
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
        {isLoadingPrompts && viewState === "home" && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Home View - Mode Selection */}
        {viewState === "home" && !isLoadingPrompts && (
          <div className="space-y-6">
            {/* Mode Selection Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setViewState("workflow")}
              >
                <Rocket className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <p className="font-medium">Start Workflow</p>
                  <p className="text-xs text-muted-foreground">Guided step-by-step</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => setViewState("browse")}
              >
                <FolderOpen className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <p className="font-medium">Browse Templates</p>
                  <p className="text-xs text-muted-foreground">Search all templates</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50"
                onClick={() => {
                  // Quick access to official forms via browse
                  setViewState("browse");
                }}
              >
                <Lock className="h-6 w-6 text-amber-500" />
                <div className="text-center">
                  <p className="font-medium">Official Forms</p>
                  <p className="text-xs text-muted-foreground">ADM regulatory forms</p>
                </div>
              </Button>
            </div>

            {/* Quick Access Grid */}
            <QuickAccessGrid
              prompts={prompts}
              onSelectTemplate={handleTemplateSelect}
              onSelectOfficialForm={handleOfficialFormSelect}
              dealType={dealType}
            />
          </div>
        )}

        {/* Workflow View */}
        {viewState === "workflow" && (
          <WorkflowWizard
            prompts={prompts}
            onSelectTemplate={handleTemplateSelect}
            onBack={handleBackToHome}
          />
        )}

        {/* Browse View */}
        {viewState === "browse" && (
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

        {/* Template Preview Modal */}
        <TemplatePreviewModal
          prompt={previewPrompt.prompt}
          open={!!previewPrompt.prompt}
          onOpenChange={(open) => !open && setPreviewPrompt({ prompt: null, isStatic: false })}
          onStartForm={handleStartFormFromPreview}
          isStatic={previewPrompt.isStatic}
        />
      </CardContent>
    </Card>
  );
}
