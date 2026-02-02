import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Printer, 
  CheckCircle2,
  ExternalLink,
  Clock,
  Zap
} from "lucide-react";
import { OfficialFormsBrowser, QuickAccessForms } from "./OfficialFormsBrowser";
import { StaticFormFiller } from "./StaticFormFiller";
import { useStaticFormFiller } from "@/hooks/useStaticFormFiller";
import { useDocumentStageAutomation } from "@/hooks/useDocumentStageAutomation";
import { TEMPLATE_SCHEMAS } from "@/lib/template-schemas";
import { generateFilledPDF } from "@/lib/pdf-document-generator";
import { toast } from "sonner";

interface FilledFormsPanelProps {
  linkedDealId?: string;
  linkedLeadId?: string;
  onDocumentGenerated?: (documentId: string, templateId: string) => void;
}

type ViewState = "browse" | "fill" | "preview";

interface GeneratedResult {
  documentId: string;
  referenceNumber: string;
  title: string;
  body: string;
  formData: Record<string, unknown>;
}

export function FilledFormsPanel({ linkedDealId, linkedLeadId, onDocumentGenerated }: FilledFormsPanelProps) {
  const [viewState, setViewState] = useState<ViewState>("browse");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  
  const { saveDocument, createFollowUpTask, isLoading } = useStaticFormFiller();
  const { onDocumentGenerated: triggerStageAutomation, hasStageAutomation, DOCUMENT_STAGE_MAP } = useDocumentStageAutomation();
  
  const handleSelectTemplate = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setViewState("fill");
  }, []);
  
  const handleFormComplete = useCallback(async (formData: Record<string, unknown>, filledContent: string) => {
    if (!selectedTemplateId) return;
    
    const result = await saveDocument(
      selectedTemplateId,
      formData,
      filledContent,
      linkedDealId ? "deal" : linkedLeadId ? "lead" : "standalone",
      linkedDealId || linkedLeadId
    );
    
    if (result) {
      setGeneratedResult({
        documentId: result.documentId,
        referenceNumber: result.referenceNumber,
        title: result.title,
        body: result.body,
        formData
      });
      setViewState("preview");
      
      // Create follow-up task if template has one
      await createFollowUpTask(selectedTemplateId, result.documentId, linkedDealId || linkedLeadId);
      
      // Trigger funnel stage automation if applicable
      await triggerStageAutomation(selectedTemplateId, linkedDealId);
      
      // Show automation indicator if template triggers stage change
      if (hasStageAutomation(selectedTemplateId) && linkedDealId) {
        const mapping = DOCUMENT_STAGE_MAP[selectedTemplateId];
        toast.info(`🔄 ${mapping.description}`, {
          description: 'Deal stage will advance when document is signed',
        });
      }
      
      // Notify parent
      onDocumentGenerated?.(result.documentId, selectedTemplateId);
    }
  }, [selectedTemplateId, saveDocument, createFollowUpTask, triggerStageAutomation, hasStageAutomation, DOCUMENT_STAGE_MAP, linkedDealId, linkedLeadId, onDocumentGenerated]);
  
  const handleBack = useCallback(() => {
    if (viewState === "preview") {
      setViewState("browse");
      setGeneratedResult(null);
      setSelectedTemplateId(null);
    } else if (viewState === "fill") {
      setViewState("browse");
      setSelectedTemplateId(null);
    }
  }, [viewState]);
  
  const handlePrint = useCallback(() => {
    if (!generatedResult) return;
    
    const schema = selectedTemplateId ? TEMPLATE_SCHEMAS[selectedTemplateId] : null;
    generateFilledPDF(
      generatedResult.body,
      generatedResult.title,
      generatedResult.referenceNumber
    );
    
    toast.success("Opening print dialog...");
  }, [generatedResult, selectedTemplateId]);
  
  const handleNewDocument = useCallback(() => {
    setViewState("browse");
    setGeneratedResult(null);
    setSelectedTemplateId(null);
  }, []);
  
  const selectedSchema = selectedTemplateId ? TEMPLATE_SCHEMAS[selectedTemplateId] : null;
  
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      {viewState !== "browse" && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {selectedSchema && (
            <Badge variant="outline">
              <FileText className="h-3 w-3 mr-1" />
              {selectedSchema.title}
            </Badge>
          )}
        </div>
      )}
      
      {/* Browse View */}
      {viewState === "browse" && (
        <div className="space-y-6">
          {/* Quick Access */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Access</CardTitle>
              <CardDescription>Most commonly used forms</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickAccessForms onSelectTemplate={handleSelectTemplate} />
            </CardContent>
          </Card>
          
          {/* Full Browser */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Official Forms
              </CardTitle>
              <CardDescription>
                18 Chairman-Ready templates organized by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OfficialFormsBrowser 
                onSelectTemplate={handleSelectTemplate}
                linkedDealId={linkedDealId}
                linkedLeadId={linkedLeadId}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Fill View */}
      {viewState === "fill" && selectedTemplateId && (
        <Card>
          <CardContent className="pt-6">
            <StaticFormFiller
              templateId={selectedTemplateId}
              onComplete={handleFormComplete}
              onCancel={handleBack}
              linkedDealId={linkedDealId}
              linkedLeadId={linkedLeadId}
              isProcessing={isLoading}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Preview View */}
      {viewState === "preview" && generatedResult && (
        <div className="space-y-4">
          {/* Success Banner */}
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-4 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-700">Document Generated Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Reference: <span className="font-mono font-medium">{generatedResult.referenceNumber}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print/Export
                </Button>
                <Button size="sm" onClick={handleNewDocument}>
                  <FileText className="h-4 w-4 mr-1" />
                  New Document
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Follow-up Task Indicator */}
          {selectedSchema?.followUpTask && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardContent className="pt-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700">
                    Follow-up task created
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSchema.followUpTask.title} - Due in {selectedSchema.followUpTask.daysUntilDue} days
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Document Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{generatedResult.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] border rounded-lg p-4 bg-white dark:bg-gray-950">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  <pre className="whitespace-pre-wrap text-sm" style={{ fontFamily: "inherit" }}>
                    {generatedResult.body}
                  </pre>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
