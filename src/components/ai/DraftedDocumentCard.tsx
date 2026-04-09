import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Copy, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export interface DraftedDocument {
  title: string;
  content: string;
  templateId?: string;
}

/** Parse [DRAFTED_DOCUMENT] blocks from AI response text */
export function parseDraftedDocuments(text: string): { text: string; documents: DraftedDocument[] } {
  const documents: DraftedDocument[] = [];
  const cleaned = text.replace(
    /\[DRAFTED_DOCUMENT\]\s*\n?([\s\S]*?)\[\/DRAFTED_DOCUMENT\]/g,
    (_match, body: string) => {
      // Extract title line if present
      const lines = body.trim().split('\n');
      let title = 'Drafted Document';
      let content = body.trim();

      // First non-empty line that looks like a title (short, no colon prefix)
      if (lines.length > 1 && lines[0].trim().length < 100 && !lines[0].trim().startsWith('-')) {
        title = lines[0].trim().replace(/^#+\s*/, '');
        content = lines.slice(1).join('\n').trim();
      }

      documents.push({ title, content });
      return ''; // Remove from display text
    }
  );

  return { text: cleaned.trim(), documents };
}

interface DraftedDocumentCardProps {
  document: DraftedDocument;
  onOpenTemplate?: (templateId: string, prefill?: Record<string, unknown>) => void;
}

export function DraftedDocumentCard({ document, onOpenTemplate }: DraftedDocumentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    toast.success("Document copied to clipboard");
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-primary/10">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium truncate">{document.title}</span>
          <Badge variant="secondary" className="text-[9px] h-4 flex-shrink-0">Draft</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {/* Preview / Expanded content */}
      {expanded ? (
        <ScrollArea className="max-h-64 p-3">
          <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/80">
            {document.content}
          </pre>
        </ScrollArea>
      ) : (
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {document.content.slice(0, 200)}…
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-3 py-2 border-t border-primary/10">
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleCopy}>
          <Copy className="w-3 h-3" /> Copy
        </Button>
        {document.templateId && onOpenTemplate && (
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onOpenTemplate(document.templateId!)}
          >
            <ExternalLink className="w-3 h-3" /> Open in Form
          </Button>
        )}
      </div>
    </Card>
  );
}
