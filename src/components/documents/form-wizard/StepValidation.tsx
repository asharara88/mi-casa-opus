import { AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

interface StepValidationProps {
  validation: ValidationResult;
  showDetails?: boolean;
}

export function StepValidation({ validation, showDetails = false }: StepValidationProps) {
  if (validation.isValid && !showDetails) {
    return null;
  }

  return (
    <div className="space-y-2">
      {!validation.isValid && validation.missingFields.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Required fields missing:</p>
            <ul className="list-disc list-inside text-xs mt-1">
              {validation.missingFields.map((field) => (
                <li key={field}>{formatFieldName(field)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-primary bg-primary/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Suggestions:</p>
            <ul className="list-disc list-inside text-xs mt-1">
              {validation.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {validation.isValid && showDetails && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>All required fields completed</span>
        </div>
      )}
    </div>
  );
}

function formatFieldName(key: string): string {
  return key
    .split(".")
    .pop()!
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Validate a step's required fields
 */
export function validateStep(
  stepKey: string,
  formData: Record<string, unknown>,
  schema: {
    required?: string[];
    properties?: Record<string, { type: string; required?: string[]; properties?: Record<string, unknown> }>;
  }
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingFields: [],
    warnings: [],
  };

  const properties = schema.properties || {};
  const prop = properties[stepKey];

  if (!prop) {
    return result;
  }

  const value = formData[stepKey];

  // Check if the field is required at the root level
  const isRootRequired = schema.required?.includes(stepKey) || false;

  // For nested objects, check nested required fields
  if (prop.type === "object" && prop.properties && prop.required) {
    const nestedValue = (value as Record<string, unknown>) || {};
    
    for (const nestedKey of prop.required) {
      const nestedProp = prop.properties[nestedKey];
      const nestedFieldValue = nestedValue[nestedKey];

      if (!hasValue(nestedFieldValue)) {
        result.missingFields.push(`${stepKey}.${nestedKey}`);
        result.isValid = false;
      }
    }
  } 
  // For simple required fields
  else if (isRootRequired && !hasValue(value)) {
    result.missingFields.push(stepKey);
    result.isValid = false;
  }

  return result;
}

/**
 * Check if a value is considered "filled"
 */
function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "object") {
    return Object.values(value).some(v => hasValue(v));
  }
  return true;
}

/**
 * Get completion percentage for the entire form
 */
export function calculateCompletion(
  formData: Record<string, unknown>,
  schema: {
    required?: string[];
    properties?: Record<string, { type: string; required?: string[]; properties?: Record<string, unknown> }>;
  }
): number {
  const required = schema.required || [];
  
  if (required.length === 0) return 100;

  let filled = 0;
  let total = 0;

  const properties = schema.properties || {};

  for (const key of required) {
    const prop = properties[key];
    const value = formData[key];

    if (prop?.type === "object" && prop.required && prop.properties) {
      // Count nested required fields
      const nestedValue = (value as Record<string, unknown>) || {};
      
      for (const nestedKey of prop.required) {
        total++;
        if (hasValue(nestedValue[nestedKey])) {
          filled++;
        }
      }
    } else {
      total++;
      if (hasValue(value)) {
        filled++;
      }
    }
  }

  if (total === 0) return 100;
  return Math.round((filled / total) * 100);
}
