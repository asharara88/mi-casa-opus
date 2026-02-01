import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lock, 
  Sparkles, 
  Clock, 
  FileText,
  ChevronRight,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManifestPrompt } from "@/types/manifest";
import { getRecentTemplates, type RecentTemplate } from "@/hooks/useMiCasaDefaults";

interface QuickAccessGridProps {
  prompts: ManifestPrompt[];
  onSelectTemplate: (promptId: string) => void;
  onSelectOfficialForm: (promptId: string) => void;
  dealType?: "sales" | "leasing";
}

// Popular AI templates (excluding static)
const POPULAR_TEMPLATES = [
  "DOC_BROKERAGE_SALES",
  "DOC_BROKERAGE_LEASING",
  "DOC_BUYER_OFFER",
  "DOC_TENANT_OFFER",
  "DOC_COMMISSION_INVOICE"
];

export function QuickAccessGrid({
  prompts,
  onSelectTemplate,
  onSelectOfficialForm,
  dealType
}: QuickAccessGridProps) {
  // Get static/official forms
  const officialForms = useMemo(() => {
    return prompts
      .filter(p => p.prompt_id.startsWith("STATIC_"))
      .slice(0, 4);
  }, [prompts]);

  // Get popular smart templates (non-static)
  const smartTemplates = useMemo(() => {
    return POPULAR_TEMPLATES
      .map(id => prompts.find(p => p.prompt_id === id))
      .filter((p): p is ManifestPrompt => !!p)
      .slice(0, 4);
  }, [prompts]);

  // Get recent templates from localStorage
  const recentTemplates = useMemo(() => {
    const recent = getRecentTemplates();
    return recent
      .map(r => {
        const prompt = prompts.find(p => p.prompt_id === r.prompt_id);
        return prompt ? { ...r, prompt } : null;
      })
      .filter((r): r is RecentTemplate & { prompt: ManifestPrompt } => r !== null)
      .slice(0, 4);
  }, [prompts]);

  return (
    <div className="space-y-6">
      {/* Official Forms Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-amber-500" />
          <h3 className="font-medium text-sm">Official Forms</h3>
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
            No AI
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {officialForms.length > 0 ? (
            officialForms.map(form => (
              <Card 
                key={form.prompt_id}
                className="cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all group"
                onClick={() => onSelectOfficialForm(form.prompt_id)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {form.title.replace("Official ", "").replace(" Form", "")}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {form.purpose}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-4 text-center py-4">
              No official forms available
            </p>
          )}
        </div>
      </section>

      {/* Smart Templates Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">Smart Templates</h3>
          <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
            AI-Assisted
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {smartTemplates.length > 0 ? (
            smartTemplates.map(template => (
              <Card 
                key={template.prompt_id}
                className="cursor-pointer hover:border-primary hover:shadow-sm transition-all group"
                onClick={() => onSelectTemplate(template.prompt_id)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {template.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {template.purpose}
                    </p>
                  </div>
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map(tag => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-4 text-center py-4">
              No templates available
            </p>
          )}
        </div>
      </section>

      {/* Recently Used Section */}
      {recentTemplates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Recently Used</h3>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {recentTemplates.map(({ prompt_id, prompt, usedAt }) => {
                const isStatic = prompt_id.startsWith("STATIC_");
                return (
                  <Card 
                    key={prompt_id}
                    className={cn(
                      "cursor-pointer hover:shadow-sm transition-all shrink-0 w-[200px]",
                      isStatic ? "hover:border-amber-400" : "hover:border-primary"
                    )}
                    onClick={() => isStatic ? onSelectOfficialForm(prompt_id) : onSelectTemplate(prompt_id)}
                  >
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        {isStatic ? (
                          <Lock className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-primary" />
                        )}
                        <p className="text-sm font-medium line-clamp-1 flex-1">
                          {prompt.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </section>
      )}
    </div>
  );
}
