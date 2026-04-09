import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManifestPrompt } from "@/types/manifest";
import { FieldWithLabel } from "./form-wizard/FormFieldRenderer";
import { StepValidation, validateStep, calculateCompletion } from "./form-wizard/StepValidation";
import { FormDraftManager } from "./form-wizard/FormDraftManager";
import { toast } from "sonner";

interface FormWizardProps {
  prompt: ManifestPrompt;
  formData: Record<string, unknown>;
  onFieldChange: (path: string, value: unknown) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
}

interface FormStep {
  key: string;
  label: string;
  fields: string[];
  isRequired: boolean;
  description?: string;
}

// Helper function to format labels
function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

export function FormWizard({
  prompt,
  formData,
  onFieldChange,
  onGenerate,
  isGenerating,
  error
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Parse schema and organize into steps
  const { steps, schema } = useMemo(() => {
    const inputSchema = prompt.input_schema as {
      required?: string[];
      properties?: Record<string, {
        type: string;
        enum?: string[];
        description?: string;
        properties?: Record<string, { type: string; description?: string }>;
        required?: string[];
        items?: { type: string; properties?: Record<string, unknown> };
      }>;
    } | null;

    if (!inputSchema?.properties) {
      return { steps: [], schema: { required: [], properties: {} } };
    }

    const required = inputSchema.required || [];
    const properties = inputSchema.properties;
    const stepList: FormStep[] = [];

    // Create a step for each top-level property
    Object.entries(properties).forEach(([key, prop]) => {
      const isRequired = required.includes(key);
      const isObject = prop.type === "object" && prop.properties;
      
      stepList.push({
        key,
        label: formatLabel(key),
        fields: isObject ? Object.keys(prop.properties || {}) : [key],
        isRequired,
        description: prop.description
      });
    });

    return { steps: stepList, schema: inputSchema };
  }, [prompt]);

  // Calculate completion percentage
  const completion = useMemo(() => {
    return calculateCompletion(formData, schema);
  }, [formData, schema]);

  // Validate current step
  const currentStepValidation = useMemo(() => {
    if (!steps[currentStep]) return { isValid: true, missingFields: [], warnings: [] };
    return validateStep(steps[currentStep].key, formData, schema);
  }, [currentStep, formData, schema, steps]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const goNext = useCallback(() => {
    if (!isLastStep) {
      // Validate before proceeding if required
      if (currentStepData?.isRequired && !currentStepValidation.isValid) {
        toast.warning("Please complete required fields", {
          description: `Missing: ${currentStepValidation.missingFields.map(f => formatLabel(f.split('.').pop() || f)).join(', ')}`
        });
        setAttemptedSubmit(true);
        return;
      }
      setCurrentStep(prev => prev + 1);
      setAttemptedSubmit(false);
    }
  }, [isLastStep, currentStepData, currentStepValidation]);

  const goPrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      setAttemptedSubmit(false);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    setAttemptedSubmit(false);
  };

  const handleGenerate = () => {
    // Validate current step first
    if (currentStepData?.isRequired && !currentStepValidation.isValid) {
      toast.warning("Please complete required fields");
      setAttemptedSubmit(true);
      return;
    }
    onGenerate();
  };

  const handleRestoreDraft = useCallback((data: Record<string, unknown>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
          onFieldChange(`${key}.${nestedKey}`, nestedValue);
        });
      } else {
        onFieldChange(key, value);
      }
    });
  }, [onFieldChange]);

  // Render step content
  const renderStepContent = () => {
    if (!currentStepData) return null;

    const properties = schema.properties || {};
    const prop = properties[currentStepData.key];
    if (!prop) return null;

    const value = formData[currentStepData.key];

    // Nested object - render all nested fields
    if (prop.type === "object" && prop.properties) {
      const nestedRequired = prop.required || [];
      
      return (
        <div className="space-y-4">
          {Object.entries(prop.properties).map(([nestedKey, nestedProp]: [string, any]) => {
            const isNestedRequired = nestedRequired.includes(nestedKey);
            const nestedValue = (value as Record<string, unknown>)?.[nestedKey];
            
            return (
              <FieldWithLabel
                key={nestedKey}
                fieldName={nestedKey}
                label={formatLabel(nestedKey)}
                path={`${currentStepData.key}.${nestedKey}`}
                schema={nestedProp}
                value={nestedValue}
                onChange={onFieldChange}
                isRequired={isNestedRequired}
              />
            );
          })}
        </div>
      );
    }

    // Simple field
    return (
      <FieldWithLabel
        fieldName={currentStepData.key}
        label={currentStepData.label}
        path={currentStepData.key}
        schema={prop}
        value={value}
        onChange={onFieldChange}
        isRequired={currentStepData.isRequired}
      />
    );
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>This template has no input fields</p>
        <Button onClick={onGenerate} className="mt-4" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">
              {completion}% complete
            </span>
          </div>
        </div>
        <Progress value={completion} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const stepValidation = validateStep(step.key, formData, schema);
            const isComplete = stepValidation.isValid && (
              formData[step.key] !== undefined || 
              (typeof formData[step.key] === 'object' && Object.keys(formData[step.key] as object || {}).length > 0)
            );

            return (
              <button
                key={step.key}
                onClick={() => goToStep(index)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors flex items-center gap-1",
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {isComplete && index !== currentStep && (
                  <Check className="h-3 w-3" />
                )}
                {step.label}
                {step.isRequired && !isComplete && (
                  <span className="text-destructive">*</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Draft Manager */}
      <FormDraftManager
        templateId={prompt.prompt_id}
        formData={formData}
        onRestoreDraft={handleRestoreDraft}
      />

      {/* Step Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {currentStepData?.label}
                {currentStepData?.isRequired && (
                  <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                )}
              </CardTitle>
              {(currentStepData?.description || currentStepData?.key) && (
                <CardDescription>
                  {currentStepData.description || `Fill in the ${formatLabel(currentStepData.key).toLowerCase()} details`}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[280px]">
            {renderStepContent()}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Step Validation Feedback */}
      {attemptedSubmit && currentStepData?.isRequired && (
        <StepValidation validation={currentStepValidation} />
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirstStep}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {isLastStep ? (
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
        ) : (
          <Button onClick={goNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
