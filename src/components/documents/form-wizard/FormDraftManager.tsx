import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

const DRAFT_PREFIX = "micasa_form_draft_";

interface FormDraftManagerProps {
  templateId: string;
  formData: Record<string, unknown>;
  onRestoreDraft: (data: Record<string, unknown>) => void;
}

export function FormDraftManager({
  templateId,
  formData,
  onRestoreDraft,
}: FormDraftManagerProps) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const draftKey = `${DRAFT_PREFIX}${templateId}`;

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const draft = JSON.parse(stored);
        if (draft.data && draft.savedAt) {
          setHasDraft(true);
          setLastSaved(new Date(draft.savedAt));
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [draftKey]);

  const handleSaveDraft = useCallback(() => {
    try {
      const draft = {
        data: formData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setHasDraft(true);
      setLastSaved(new Date());
      toast.success("Draft saved");
    } catch {
      toast.error("Failed to save draft");
    }
  }, [formData, draftKey]);

  const handleRestoreDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const draft = JSON.parse(stored);
        if (draft.data) {
          onRestoreDraft(draft.data);
          toast.success("Draft restored");
        }
      }
    } catch {
      toast.error("Failed to restore draft");
    }
  }, [draftKey, onRestoreDraft]);

  const handleClearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      setLastSaved(null);
      toast.success("Draft cleared");
    } catch {
      toast.error("Failed to clear draft");
    }
  }, [draftKey]);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleSaveDraft}
      >
        <Save className="h-3 w-3 mr-1" />
        Save Draft
      </Button>

      {hasDraft && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleRestoreDraft}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restore
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={handleClearDraft}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </>
      )}

      {lastSaved && (
        <span className="text-muted-foreground ml-2">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

/**
 * Hook for managing form drafts
 */
export function useFormDraft(templateId: string) {
  const draftKey = `${DRAFT_PREFIX}${templateId}`;

  const saveDraft = useCallback(
    (data: Record<string, unknown>) => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            data,
            savedAt: new Date().toISOString(),
          })
        );
        return true;
      } catch {
        return false;
      }
    },
    [draftKey]
  );

  const loadDraft = useCallback((): Record<string, unknown> | null => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const draft = JSON.parse(stored);
        return draft.data || null;
      }
    } catch {
      // Ignore
    }
    return null;
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      return true;
    } catch {
      return false;
    }
  }, [draftKey]);

  const hasDraft = useCallback((): boolean => {
    try {
      return !!localStorage.getItem(draftKey);
    } catch {
      return false;
    }
  }, [draftKey]);

  return { saveDraft, loadDraft, clearDraft, hasDraft };
}
