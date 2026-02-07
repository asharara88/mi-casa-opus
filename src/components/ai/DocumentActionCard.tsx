import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Sparkles } from "lucide-react";
import { DocumentAction, TEMPLATE_METADATA } from "@/lib/document-intent";

interface DocumentActionCardProps {
  action: DocumentAction;
  onOpenTemplate: (templateId: string, prefill?: Record<string, unknown>) => void;
}

export function DocumentActionCard({ action, onOpenTemplate }: DocumentActionCardProps) {
  const metadata = TEMPLATE_METADATA[action.template_id];
  const prefillCount = action.prefill ? Object.keys(action.prefill).filter(k => action.prefill![k]).length : 0;
  
  return (
    <Card className="bg-primary/5 border-primary/30 overflow-hidden">
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm leading-tight">{action.template_name}</p>
              {metadata && (
                <Badge variant="outline" className="text-[9px] h-4 mt-0.5">
                  {metadata.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        {(action.description || metadata?.description) && (
          <p className="text-xs text-muted-foreground">
            {action.description || metadata?.description}
          </p>
        )}
        
        {/* Pre-fill indicator */}
        {prefillCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <Sparkles className="h-3 w-3" />
            <span>{prefillCount} field{prefillCount !== 1 ? 's' : ''} pre-filled from conversation</span>
          </div>
        )}
        
        {/* Action button */}
        <Button 
          size="sm" 
          className="w-full"
          onClick={() => onOpenTemplate(action.template_id, action.prefill)}
        >
          <FileText className="h-4 w-4 mr-1.5" />
          Open Template
          <ExternalLink className="h-3 w-3 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface DocumentActionListProps {
  actions: DocumentAction[];
  onOpenTemplate: (templateId: string, prefill?: Record<string, unknown>) => void;
}

export function DocumentActionList({ actions, onOpenTemplate }: DocumentActionListProps) {
  if (actions.length === 0) return null;
  
  return (
    <div className="space-y-2 mt-2">
      {actions.map((action, index) => (
        <DocumentActionCard 
          key={`${action.template_id}-${index}`}
          action={action}
          onOpenTemplate={onOpenTemplate}
        />
      ))}
    </div>
  );
}
