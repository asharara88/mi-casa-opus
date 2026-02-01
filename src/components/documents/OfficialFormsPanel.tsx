import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useManifestPrompts, useDocumentGenerator } from '@/hooks/useManifestExecutor';
import { 
  Lock, 
  FileText, 
  Download, 
  Loader2,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface OfficialFormsPanelProps {
  onDocumentGenerated?: (documentId: string, title: string) => void;
}

export function OfficialFormsPanel({ onDocumentGenerated }: OfficialFormsPanelProps) {
  const { prompts, fetchPrompts, isLoading: promptsLoading } = useManifestPrompts();
  const { generateDocument, isLoading: isGenerating } = useDocumentGenerator();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts('STATIC_TEMPLATES');
  }, [fetchPrompts]);

  // Filter to only show static templates
  const staticForms = prompts.filter(p => 
    p.prompt_id.startsWith('STATIC_')
  );

  const handleGenerateForm = async (promptId: string, title: string) => {
    setGeneratingId(promptId);
    try {
      const result = await generateDocument(
        promptId,
        {},
        'form',
        `form_${Date.now()}`
      );
      
      if (result?.documentId) {
        onDocumentGenerated?.(result.documentId, title);
      }
    } catch (error) {
      toast.error('Failed to generate form');
    } finally {
      setGeneratingId(null);
    }
  };

  if (promptsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-base">Official Forms</CardTitle>
            <CardDescription>
              ADM-compliant forms with no AI modifications — exact regulatory content
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {staticForms.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No official forms available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Static templates will appear here once configured
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staticForms.map((form) => (
                <Card 
                  key={form.prompt_id} 
                  className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <h4 className="font-medium text-sm truncate">{form.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {form.purpose}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-600">
                            <Lock className="w-3 h-3 mr-1" />
                            No AI
                          </Badge>
                          {form.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        disabled={isGenerating || generatingId === form.prompt_id}
                        onClick={() => handleGenerateForm(form.prompt_id, form.title)}
                      >
                        {generatingId === form.prompt_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            Get
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>These forms are locked and cannot be modified by AI to ensure regulatory compliance</span>
        </div>
      </CardContent>
    </Card>
  );
}
