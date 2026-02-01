import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Sparkles, 
  Lock, 
  ClipboardList,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import type { ManifestPrompt } from "@/types/manifest";

interface TemplatePreviewModalProps {
  prompt: ManifestPrompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartForm: () => void;
  isStatic?: boolean;
}

export function TemplatePreviewModal({
  prompt,
  open,
  onOpenChange,
  onStartForm,
  isStatic = false
}: TemplatePreviewModalProps) {
  if (!prompt) return null;

  const inputSchema = prompt.input_schema as {
    required?: string[];
    properties?: Record<string, { type: string; description?: string }>;
  } | null;

  const requiredFields = inputSchema?.required || [];
  const allFields = Object.keys(inputSchema?.properties || {});
  const optionalFields = allFields.filter(f => !requiredFields.includes(f));

  // Format field names for display
  const formatFieldName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isStatic ? "bg-amber-500/20" : "bg-primary/20"
            }`}>
              {isStatic ? (
                <Lock className="w-5 h-5 text-amber-600" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-left">{prompt.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {isStatic ? (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                    Official Form
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                    AI-Assisted
                  </Badge>
                )}
                {prompt.tags?.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Purpose */}
          <div>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Purpose
            </h4>
            <p className="text-sm text-muted-foreground">
              {prompt.purpose}
            </p>
          </div>

          {/* Required Fields Preview */}
          {!isStatic && requiredFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Required Information
                <Badge variant="destructive" className="text-[10px]">
                  {requiredFields.length} fields
                </Badge>
              </h4>
              <ScrollArea className="max-h-32">
                <ul className="space-y-1">
                  {requiredFields.map(field => (
                    <li key={field} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                      {formatFieldName(field)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {/* Optional Fields */}
          {!isStatic && optionalFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                Optional Fields ({optionalFields.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {optionalFields.slice(0, 6).map(field => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {formatFieldName(field)}
                  </Badge>
                ))}
                {optionalFields.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{optionalFields.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Static Form Notice */}
          {isStatic && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Official ADM Form</p>
                <p className="text-amber-700 text-xs mt-1">
                  This is a static regulatory form. No AI modifications or field inputs required—download instantly.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onStartForm} className="gap-2">
            {isStatic ? (
              <>
                Download Form
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Start Form
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
