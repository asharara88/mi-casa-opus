import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle } from "lucide-react";
import type { OverridePayload } from "@/types/compliance";

interface OverridePanelProps {
  canOverride: boolean;
  onSubmit: (payload: OverridePayload) => void;
  isSubmitting?: boolean;
}

export function OverridePanel({
  canOverride,
  onSubmit,
  isSubmitting = false,
}: OverridePanelProps) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  if (!canOverride) return null;

  const handleSubmit = () => {
    if (!name.trim() || !reason.trim()) return;
    
    onSubmit({
      name: name.trim(),
      reason: reason.trim(),
      authorizationDocumentUrl: documentUrl.trim() || undefined,
    });
  };

  const isValid = name.trim() && reason.trim();

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-amber-600" />
        <h4 className="font-semibold text-amber-700 dark:text-amber-400">
          Compliance Override
        </h4>
      </div>

      <div className="flex items-start gap-2 mb-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Overrides require Managing Director or Compliance Officer authorization. 
          All overrides are logged and audited.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="override-name">Authorizing Officer Name *</Label>
          <Input
            id="override-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="override-reason">Justification *</Label>
          <Textarea
            id="override-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide detailed justification for this override..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="override-doc">Authorization Document URL (optional)</Label>
          <Input
            id="override-doc"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full"
          variant="outline"
        >
          {isSubmitting ? "Submitting..." : "Submit Override Request"}
        </Button>
      </div>
    </div>
  );
}
