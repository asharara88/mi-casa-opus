import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, HelpCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface FieldSchema {
  type: string;
  enum?: string[];
  description?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
}

interface FormFieldRendererProps {
  fieldName: string;
  path: string;
  schema: FieldSchema;
  value: unknown;
  onChange: (path: string, value: unknown) => void;
  isRequired: boolean;
}

// Helper to format labels nicely
function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Format number as AED currency
function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-AE', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

// Parse currency string back to number
function parseCurrency(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0;
}

export function FormFieldRenderer({
  fieldName,
  path,
  schema,
  value,
  onChange,
  isRequired
}: FormFieldRendererProps) {
  const isCurrencyField = fieldName.toLowerCase().includes('aed') || 
                          fieldName.toLowerCase().includes('price') ||
                          fieldName.toLowerCase().includes('amount') ||
                          fieldName.toLowerCase().includes('rent') ||
                          fieldName.toLowerCase().includes('deposit') ||
                          fieldName.toLowerCase().includes('budget');
  
  const isDateField = schema.format === "date" || 
                      fieldName.toLowerCase().includes("date") ||
                      fieldName.toLowerCase().includes("_at");

  const isLongTextField = fieldName.toLowerCase().includes("content") || 
                          fieldName.toLowerCase().includes("notes") || 
                          fieldName.toLowerCase().includes("conditions") ||
                          fieldName.toLowerCase().includes("description") ||
                          fieldName.toLowerCase().includes("requests");

  // Enum field - dropdown
  if (schema.enum) {
    return (
      <div className="space-y-1.5">
        <Select
          value={(value as string) || ""}
          onValueChange={(v) => onChange(path, v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder={`Select ${formatLabel(fieldName)}`} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {schema.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {formatLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
      </div>
    );
  }

  // Boolean field - switch
  if (schema.type === "boolean") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => onChange(path, checked)}
          />
          <span className="text-sm text-muted-foreground">
            {value ? "Yes" : "No"}
          </span>
        </div>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
      </div>
    );
  }

  // Date field - calendar picker
  if (isDateField) {
    const dateValue = value ? (typeof value === 'string' ? parseISO(value) : value as Date) : undefined;
    
    return (
      <div className="space-y-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-background",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => onChange(path, date ? format(date, 'yyyy-MM-dd') : '')}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
      </div>
    );
  }

  // Currency field (AED amounts)
  if ((schema.type === "number" || schema.type === "integer") && isCurrencyField) {
    return (
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            AED
          </span>
          <Input
            type="text"
            value={value ? formatCurrency(value as number) : ""}
            onChange={(e) => onChange(path, parseCurrency(e.target.value))}
            placeholder="0"
            className="bg-background pl-12 text-right"
          />
        </div>
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
      </div>
    );
  }

  // Regular number field
  if (schema.type === "number" || schema.type === "integer") {
    return (
      <div className="space-y-1.5">
        <Input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(path, parseFloat(e.target.value) || 0)}
          placeholder={`Enter ${formatLabel(fieldName)}`}
          className="bg-background"
          min={schema.minimum}
          max={schema.maximum}
        />
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
      </div>
    );
  }

  // Long text fields - textarea
  if (isLongTextField) {
    return (
      <div className="space-y-1.5">
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(path, e.target.value)}
          placeholder={`Enter ${formatLabel(fieldName)}`}
          rows={3}
          className="bg-background"
        />
        {schema.description && (
          <p className="text-xs text-muted-foreground">{schema.description}</p>
        )}
      </div>
    );
  }

  // Default string input
  return (
    <div className="space-y-1.5">
      <Input
        value={(value as string) || ""}
        onChange={(e) => onChange(path, e.target.value)}
        placeholder={`Enter ${formatLabel(fieldName)}`}
        className="bg-background"
      />
      {schema.description && (
        <p className="text-xs text-muted-foreground">{schema.description}</p>
      )}
    </div>
  );
}

interface FieldWithLabelProps extends FormFieldRendererProps {
  label: string;
}

export function FieldWithLabel({ label, isRequired, ...props }: FieldWithLabelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </label>
        {props.schema.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{props.schema.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <FormFieldRenderer isRequired={isRequired} {...props} />
    </div>
  );
}
