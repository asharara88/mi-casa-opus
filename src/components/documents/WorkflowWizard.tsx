import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Key, 
  Users, 
  ChevronRight, 
  Check, 
  SkipForward,
  ArrowLeft,
  FileText,
  Loader2,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManifestPrompt } from "@/types/manifest";
import { useWorkflowState, type WorkflowType, type WorkflowState, getWorkflowState } from "@/hooks/useWorkflowState";
import { toast } from "sonner";

export type { WorkflowType };

interface WorkflowStep {
  prompt_id: string;
  title: string;
  description: string;
  isOptional: boolean;
}

interface WorkflowConfig {
  type: WorkflowType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  steps: WorkflowStep[];
}

// Workflow configurations based on manifest routing
export const WORKFLOW_CONFIGS: Record<WorkflowType, Omit<WorkflowConfig, "type">> = {
  sales: {
    label: "Sales Deal",
    icon: Home,
    description: "Complete workflow for property sales transactions",
    steps: [
      { prompt_id: "DOC_BROKERAGE_SALES", title: "Brokerage Agreement", description: "Sales brokerage addendum", isOptional: false },
      { prompt_id: "AML_SALES_CHECK", title: "AML Assessment", description: "Anti-money laundering check", isOptional: false },
      { prompt_id: "DOC_BUYER_OFFER", title: "Buyer Offer", description: "Non-binding offer letter", isOptional: true },
      { prompt_id: "DOC_COMMISSION_INVOICE", title: "Commission Invoice", description: "Invoice for commission", isOptional: true },
      { prompt_id: "DOC_COMMISSION_SPLIT", title: "Split Confirmation", description: "Commission split document", isOptional: true },
      { prompt_id: "ADMIN_DOC_INDEX", title: "Document Index", description: "Deal folder checklist", isOptional: true }
    ]
  },
  leasing: {
    label: "Leasing Deal",
    icon: Key,
    description: "Complete workflow for property leasing transactions",
    steps: [
      { prompt_id: "DOC_BROKERAGE_LEASING", title: "Brokerage Agreement", description: "Leasing brokerage addendum", isOptional: false },
      { prompt_id: "KYC_LEASING_CHECK", title: "KYC Check", description: "Identity verification", isOptional: false },
      { prompt_id: "DOC_TENANT_OFFER", title: "Tenant Intent", description: "Non-binding intent letter", isOptional: true },
      { prompt_id: "DOC_COMMISSION_INVOICE", title: "Commission Invoice", description: "Invoice for commission", isOptional: true },
      { prompt_id: "DOC_COMMISSION_SPLIT", title: "Split Confirmation", description: "Commission split document", isOptional: true },
      { prompt_id: "ADMIN_DOC_INDEX", title: "Document Index", description: "Deal folder checklist", isOptional: true }
    ]
  },
  co_broker: {
    label: "Co-Broker Setup",
    icon: Users,
    description: "Agent-to-agent cooperation agreement",
    steps: [
      { prompt_id: "DOC_AGENT_TO_AGENT_MASTER", title: "Master Agreement", description: "Cooperation framework", isOptional: false },
      { prompt_id: "DOC_AGENT_TO_AGENT_ANNEX", title: "Property Annex", description: "Per-property split terms", isOptional: false }
    ]
  }
};

interface WorkflowWizardProps {
  prompts: ManifestPrompt[];
  onSelectTemplate: (promptId: string, workflowContext?: { type: WorkflowType; stepIndex: number }) => void;
  onBack?: () => void;
  activeWorkflowType?: WorkflowType | null;
  onWorkflowSelect?: (type: WorkflowType | null) => void;
}

export function WorkflowWizard({ 
  prompts, 
  onSelectTemplate, 
  onBack,
  activeWorkflowType,
  onWorkflowSelect
}: WorkflowWizardProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(activeWorkflowType || null);
  
  const {
    state: workflowState,
    startWorkflow,
    completeStep,
    skipStep,
    goToStep,
    advanceStep,
    resetWorkflow,
    isStepCompleted,
    isStepSkipped,
    getDocumentId
  } = useWorkflowState(selectedWorkflow);

  // Sync with external activeWorkflowType
  useEffect(() => {
    if (activeWorkflowType && activeWorkflowType !== selectedWorkflow) {
      setSelectedWorkflow(activeWorkflowType);
    }
  }, [activeWorkflowType]);

  const workflowConfig = selectedWorkflow ? { type: selectedWorkflow, ...WORKFLOW_CONFIGS[selectedWorkflow] } : null;
  
  const currentStepIndex = workflowState?.currentStepIndex ?? 0;
  const currentStep = workflowConfig?.steps[currentStepIndex];
  const completedSteps = workflowState?.completedSteps ?? [];
  const skippedSteps = workflowState?.skippedSteps ?? [];
  
  const progress = workflowConfig 
    ? ((completedSteps.length + skippedSteps.length) / workflowConfig.steps.length) * 100 
    : 0;
  const isLastStep = workflowConfig && currentStepIndex === workflowConfig.steps.length - 1;
  const isWorkflowComplete = workflowConfig && 
    workflowConfig.steps.every(s => 
      completedSteps.includes(s.prompt_id) || skippedSteps.includes(s.prompt_id) || s.isOptional
    );

  // Check if prompt exists in manifest
  const isPromptAvailable = useCallback((promptId: string) => {
    return prompts.some(p => p.prompt_id === promptId);
  }, [prompts]);

  const handleSelectWorkflow = (type: WorkflowType) => {
    setSelectedWorkflow(type);
    startWorkflow(type);
    onWorkflowSelect?.(type);
  };

  const handleBackToSelection = () => {
    setSelectedWorkflow(null);
    onWorkflowSelect?.(null);
  };

  const handleSkipStep = () => {
    if (currentStep?.isOptional && workflowConfig) {
      skipStep(currentStep.prompt_id);
      if (!isLastStep) {
        advanceStep(workflowConfig.steps.length);
      }
      toast.info(`Skipped: ${currentStep.title}`);
    }
  };

  const handleGoToStep = (index: number) => {
    goToStep(index);
  };

  const handleStartStep = () => {
    if (currentStep && selectedWorkflow) {
      onSelectTemplate(currentStep.prompt_id, {
        type: selectedWorkflow,
        stepIndex: currentStepIndex
      });
    }
  };

  const handleResetWorkflow = () => {
    resetWorkflow();
    toast.success("Workflow reset");
  };

  // Workflow Selection View
  if (!selectedWorkflow) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Start a Workflow</h3>
          <p className="text-sm text-muted-foreground">
            Choose a guided workflow for your transaction type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(WORKFLOW_CONFIGS) as [WorkflowType, Omit<WorkflowConfig, "type">][]).map(([type, config]) => {
            const Icon = config.icon;
            const availableSteps = config.steps.filter(s => isPromptAvailable(s.prompt_id)).length;
            const existingState = getWorkflowState(type);
            const hasProgress = existingState && existingState.completedSteps.length > 0;
            
            return (
              <Card 
                key={type}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary hover:shadow-md",
                  "group relative"
                )}
                onClick={() => handleSelectWorkflow(type)}
              >
                {hasProgress && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground"
                  >
                    In Progress
                  </Badge>
                )}
                <CardContent className="pt-6 text-center space-y-4">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-colors",
                    type === "sales" && "bg-emerald-500/20 text-emerald-500",
                    type === "leasing" && "bg-blue-500/20 text-blue-500",
                    type === "co_broker" && "bg-purple-500/20 text-purple-500"
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                      {config.label}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {availableSteps} steps
                    </Badge>
                    {hasProgress && existingState && (
                      <Badge variant="outline" className="text-xs text-emerald-600">
                        {existingState.completedSteps.length} done
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {onBack && (
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Quick Access
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Active Workflow View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToSelection}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {workflowConfig && <workflowConfig.icon className="w-5 h-5 text-primary" />}
              <h3 className="font-semibold">{workflowConfig?.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {workflowConfig?.steps.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {Math.round(progress)}% complete
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetWorkflow}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Workflow Complete Banner */}
      {isWorkflowComplete && (
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="font-medium text-emerald-700">Workflow Complete!</p>
              <p className="text-sm text-emerald-600">
                All required steps have been completed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Navigation */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {workflowConfig?.steps.map((step, index) => {
            const isCompleted = isStepCompleted(step.prompt_id);
            const isSkipped = isStepSkipped(step.prompt_id);
            const isCurrent = index === currentStepIndex;
            const isAvailable = isPromptAvailable(step.prompt_id);

            return (
              <button
                key={step.prompt_id}
                onClick={() => handleGoToStep(index)}
                disabled={!isAvailable}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted && !isCurrent && "bg-emerald-500/20 text-emerald-600",
                  isSkipped && !isCurrent && "bg-muted text-muted-foreground",
                  !isCurrent && !isCompleted && !isSkipped && "bg-muted/50 hover:bg-muted",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isSkipped ? (
                  <SkipForward className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-background text-foreground text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                )}
                {step.title}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Current Step Card */}
      {currentStep && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {currentStep.title}
                  {isStepCompleted(currentStep.prompt_id) && (
                    <Check className="w-4 h-4 text-emerald-500" />
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {currentStep.description}
                </CardDescription>
              </div>
              {currentStep.isOptional && (
                <Badge variant="secondary">Optional</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPromptAvailable(currentStep.prompt_id) ? (
              <div className="text-center py-6 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">This template is not available yet</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={handleStartStep} className="gap-2">
                  <ChevronRight className="w-4 h-4" />
                  {isStepCompleted(currentStep.prompt_id) 
                    ? "Open Again" 
                    : "Start This Step"
                  }
                </Button>
                
                {currentStep.isOptional && !isStepCompleted(currentStep.prompt_id) && (
                  <Button variant="ghost" onClick={handleSkipStep} className="gap-2">
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                )}

                {/* Show document ID if already generated */}
                {getDocumentId(currentStep.prompt_id) && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Doc: {getDocumentId(currentStep.prompt_id)?.slice(-8)}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Summary */}
      {completedSteps.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{completedSteps.length}</span> document(s) generated
          {skippedSteps.length > 0 && (
            <span>, <span className="font-medium text-foreground">{skippedSteps.length}</span> skipped</span>
          )}
        </div>
      )}
    </div>
  );
}
