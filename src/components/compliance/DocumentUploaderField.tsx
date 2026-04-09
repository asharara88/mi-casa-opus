import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle2, XCircle, Upload } from "lucide-react";

interface DocumentUploaderFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  required?: boolean;
  expiryDate?: string;
  isExpired?: boolean;
  placeholder?: string;
}

export function DocumentUploaderField({
  label,
  value,
  onChange,
  required = false,
  expiryDate,
  isExpired = false,
  placeholder = "Enter document URL or upload...",
}: DocumentUploaderFieldProps) {
  const hasDocument = !!value?.trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        
        {hasDocument && (
          <div className="flex items-center gap-1.5">
            {isExpired ? (
              <>
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs text-destructive font-medium">Expired</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Uploaded</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${isExpired ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {expiryDate && (
        <p className={`text-xs ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
          Expiry: {new Date(expiryDate).toLocaleDateString()}
          {isExpired && ' (EXPIRED)'}
        </p>
      )}
    </div>
  );
}
