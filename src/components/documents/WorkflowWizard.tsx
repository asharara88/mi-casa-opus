import { useState, useMemo, useCallback } from "react";
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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManifestPrompt } from "@/types/manifest";

export type WorkflowType = "sales" | "leasing" | "co_broker";

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
const WORKFLOW_CONFIGS: Record<WorkflowType, Omit<WorkflowConfig, "type">> = {
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
  onSelectTemplate: (promptId: string) => void;
  onBack?: () => void;
}

export function WorkflowWizard({ prompts, onSelectTemplate, onBack }: WorkflowWizardProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);

  const workflowConfig = selectedWorkflow ? { type: selectedWorkflow, ...WORKFLOW_CONFIGS[selectedWorkflow] } : null;
  
  const currentStep = workflowConfig?.steps[currentStepIndex];
  const progress = workflowConfig ? ((currentStepIndex) / workflowConfig.steps.length) * 100 : 0;
  const isLastStep = workflowConfig && currentStepIndex === workflowConfig.steps.length - 1;

  // Check if prompt exists in manifest
  const isPromptAvailable = useCallback((promptId: string) => {
    return prompts.some(p => p.prompt_id === promptId);
  }, [prompts]);

  const handleSelectWorkflow = (type: WorkflowType) => {
    setSelectedWorkflow(type);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setSkippedSteps([]);
  };

  const handleBackToSelection = () => {
    setSelectedWorkflow(null);
    setCurrentStepIndex(0);
  };

  const handleStepComplete = (promptId: string) => {
    setCompletedSteps(prev => [...prev, promptId]);
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep?.isOptional) {
      setSkippedSteps(prev => [...prev, currentStep.prompt_id]);
      if (!isLastStep) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  };

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleStartStep = () => {
    if (currentStep) {
      onSelectTemplate(currentStep.prompt_id);
      // Mark as complete when user starts (they can always come back)
      handleStepComplete(currentStep.prompt_id);
    }
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
            
            return (
              <Card 
                key={type}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary hover:shadow-md",
                  "group"
                )}
                onClick={() => handleSelectWorkflow(type)}
              >
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
                  <Badge variant="secondary" className="text-xs">
                    {availableSteps} steps
                  </Badge>
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
        <Badge variant="outline" className="text-xs">
          {Math.round(progress)}% complete
        </Badge>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Step Navigation */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {workflowConfig?.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.prompt_id);
            const isSkipped = skippedSteps.includes(step.prompt_id);
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
                  {completedSteps.includes(currentStep.prompt_id) 
                    ? "Open Again" 
                    : "Start This Step"
                  }
                </Button>
                
                {currentStep.isOptional && !completedSteps.includes(currentStep.prompt_id) && (
                  <Button variant="ghost" onClick={handleSkipStep} className="gap-2">
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                )}

                {isLastStep && completedSteps.length > 0 && (
                  <Badge variant="outline" className="ml-auto text-emerald-600">
                    <Check className="w-3 h-3 mr-1" />
                    Workflow Complete
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
