import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // Parse schema and organize into steps
  const { steps, schema } = useMemo(() => {
    const inputSchema = prompt.input_schema as {
      required?: string[];
      properties?: Record<string, {
        type: string;
        enum?: string[];
        properties?: Record<string, unknown>;
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
        isRequired
      });
    });

    return { steps: stepList, schema: inputSchema };
  }, [prompt]);

  // Calculate completion percentage
  const completion = useMemo(() => {
    if (steps.length === 0) return 0;
    
    const required = schema.required || [];
    let filled = 0;
    let total = required.length;

    if (total === 0) return 100;

    required.forEach(key => {
      const value = formData[key];
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "object" && !Array.isArray(value)) {
          const obj = value as Record<string, unknown>;
          if (Object.values(obj).some(v => v !== undefined && v !== null && v !== "")) {
            filled++;
          }
        } else {
          filled++;
        }
      }
    });

    return Math.round((filled / total) * 100);
  }, [formData, schema, steps]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const goNext = () => {
    if (!isLastStep) setCurrentStep(prev => prev + 1);
  };

  const goPrev = () => {
    if (!isFirstStep) setCurrentStep(prev => prev - 1);
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  // Render individual field
  const renderField = (path: string, prop: any, value: unknown, isRequired: boolean) => {
    const fieldName = path.split(".").pop() || "";
    
    // Enum field
    if (prop.enum) {
      return (
        <Select
          value={(value as string) || ""}
          onValueChange={(v) => onFieldChange(path, v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder={`Select ${formatLabel(fieldName)}`} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {prop.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {formatLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Boolean field
    if (prop.type === "boolean") {
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => onFieldChange(path, checked)}
          />
          <span className="text-sm text-muted-foreground">
            {value ? "Yes" : "No"}
          </span>
        </div>
      );
    }

    // Number field
    if (prop.type === "number" || prop.type === "integer") {
      return (
        <Input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onFieldChange(path, parseFloat(e.target.value) || 0)}
          placeholder={`Enter ${formatLabel(fieldName)}`}
          className="bg-background"
        />
      );
    }

    // Date field
    if (prop.format === "date" || fieldName.includes("date")) {
      return (
        <Input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onFieldChange(path, e.target.value)}
          className="bg-background"
        />
      );
    }

    // Long text fields
    if (fieldName.includes("content") || fieldName.includes("notes") || fieldName.includes("conditions")) {
      return (
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => onFieldChange(path, e.target.value)}
          placeholder={`Enter ${formatLabel(fieldName)}`}
          rows={3}
          className="bg-background"
        />
      );
    }

    // Default string input
    return (
      <Input
        value={(value as string) || ""}
        onChange={(e) => onFieldChange(path, e.target.value)}
        placeholder={`Enter ${formatLabel(fieldName)}`}
        className="bg-background"
      />
    );
  };

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
              <div key={nestedKey} className="space-y-2">
                <Label className="text-sm font-medium">
                  {formatLabel(nestedKey)}
                  {isNestedRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(
                  `${currentStepData.key}.${nestedKey}`,
                  nestedProp,
                  nestedValue,
                  isNestedRequired
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Simple field
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {currentStepData.label}
          {currentStepData.isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        {renderField(currentStepData.key, prop, value, currentStepData.isRequired)}
      </div>
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
          <span className="font-medium text-foreground">
            {completion}% complete
          </span>
        </div>
        <Progress value={completion} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {steps.map((step, index) => (
            <button
              key={step.key}
              onClick={() => goToStep(index)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {step.label}
              {step.isRequired && <span className="text-destructive">*</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {currentStepData?.label}
            {currentStepData?.isRequired && (
              <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
            )}
          </CardTitle>
          {currentStepData?.key && (
            <CardDescription>
              Fill in the {formatLabel(currentStepData.key).toLowerCase()} details
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[280px]">
            {renderStepContent()}
          </ScrollArea>
        </CardContent>
      </Card>

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
          <Button onClick={onGenerate} disabled={isGenerating}>
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

// Helper function to format labels
function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}
