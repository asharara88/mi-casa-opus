import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileStack, 
  FileText,
  Lock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Copy,
  Shield,
  AlertCircle,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDocumentTemplates,
  useComplianceRules,
  useComplianceModules,
  usePublishTemplate,
  useToggleRule,
  useCreateTemplateVersion,
  type DocumentTemplate,
  type ComplianceRule,
  type ComplianceModule,
} from '@/hooks/useTemplates';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Draft: { 
    color: 'bg-muted text-muted-foreground', 
    icon: <Edit className="h-3 w-3" /> 
  },
  Published: { 
    color: 'bg-emerald/20 text-emerald', 
    icon: <Lock className="h-3 w-3" /> 
  },
  Deprecated: { 
    color: 'bg-amber-500/20 text-amber-600', 
    icon: <AlertTriangle className="h-3 w-3" /> 
  },
};

const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  BLOCK: { 
    color: 'bg-destructive/20 text-destructive border-destructive/30', 
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Hard Block'
  },
  WARN: { 
    color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', 
    icon: <AlertTriangle className="h-3 w-3" />,
    label: 'Warning'
  },
  INFO: { 
    color: 'bg-blue-500/20 text-blue-600 border-blue-500/30', 
    icon: <Info className="h-3 w-3" />,
    label: 'Info'
  },
};

export function TemplatesSection() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const { data: templates = [], isLoading: loadingTemplates, refetch: refetchTemplates } = useDocumentTemplates();
  const { data: rules = [], isLoading: loadingRules, refetch: refetchRules } = useComplianceRules();
  const { data: modules = [], isLoading: loadingModules } = useComplianceModules();
  
  const publishTemplate = usePublishTemplate();
  const toggleRule = useToggleRule();
  const createVersion = useCreateTemplateVersion();

  const draftCount = templates.filter(t => t.status === 'Draft').length;
  const publishedCount = templates.filter(t => t.status === 'Published').length;
  const blockRulesCount = rules.filter(r => r.severity === 'BLOCK').length;

  const handlePublish = () => {
    if (selectedTemplate) {
      publishTemplate.mutate(selectedTemplate.id);
      setShowPublishDialog(false);
    }
  };

  const handleCreateVersion = (template: DocumentTemplate) => {
    createVersion.mutate(template.id);
  };

  // Group rules by module
  const rulesByModule = rules.reduce((acc, rule) => {
    if (!acc[rule.module_id]) acc[rule.module_id] = [];
    acc[rule.module_id].push(rule);
    return acc;
  }, {} as Record<string, ComplianceRule[]>);

  const isLoading = loadingTemplates || loadingRules || loadingModules;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileStack className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Rules & Templates</h2>
            <p className="text-sm text-muted-foreground">
              Compliance rules and document templates
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            refetchTemplates();
            refetchRules();
          }}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Template Immutability & Rule Enforcement
              </h3>
              <p className="text-sm text-muted-foreground">
                Templates become immutable after publishing. Compliance rules with BLOCK severity 
                prevent deal progression until requirements are met.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileStack className="h-6 w-6 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">{templates.length}</div>
                <div className="text-xs text-muted-foreground">Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-emerald" />
              <div>
                <div className="text-xl font-bold text-foreground">{publishedCount}</div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-destructive" />
              <div>
                <div className="text-xl font-bold text-foreground">{blockRulesCount}</div>
                <div className="text-xs text-muted-foreground">Block Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div>
                <div className="text-xl font-bold text-foreground">{rules.length - blockRulesCount}</div>
                <div className="text-xs text-muted-foreground">Warn/Info Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Shield className="h-4 w-4" />
            Rules ({rules.length})
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No document templates found</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({templates.length})</TabsTrigger>
                <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
                <TabsTrigger value="drafts">Drafts ({draftCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onView={() => {
                        setSelectedTemplate(template);
                        setShowPreviewDialog(true);
                      }}
                      onPublish={() => {
                        setSelectedTemplate(template);
                        setShowPublishDialog(true);
                      }}
                      onNewVersion={() => handleCreateVersion(template)}
                      isCreatingVersion={createVersion.isPending}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="published" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.filter(t => t.status === 'Published').map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onView={() => {
                        setSelectedTemplate(template);
                        setShowPreviewDialog(true);
                      }}
                      onNewVersion={() => handleCreateVersion(template)}
                      isCreatingVersion={createVersion.isPending}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="drafts" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.filter(t => t.status === 'Draft').map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onView={() => {
                        setSelectedTemplate(template);
                        setShowPreviewDialog(true);
                      }}
                      onPublish={() => {
                        setSelectedTemplate(template);
                        setShowPublishDialog(true);
                      }}
                    />
                  ))}
                  {draftCount === 0 && (
                    <Card className="col-span-2">
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald opacity-50" />
                        <p className="text-muted-foreground">All templates are published</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : modules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No compliance modules found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <ModuleRulesCard
                  key={module.id}
                  module={module}
                  rules={rulesByModule[module.id] || []}
                  onToggleRule={(ruleId, isActive) => 
                    toggleRule.mutate({ ruleId, isActive })
                  }
                  isToggling={toggleRule.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Template</DialogTitle>
            <DialogDescription>
              Publishing makes this template immutable and available for document generation.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="font-medium">{selectedTemplate.name}</div>
                <div className="text-sm text-muted-foreground">
                  Version {selectedTemplate.template_version} • {selectedTemplate.doc_type}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">This action cannot be undone</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Once published, this template version becomes immutable. 
                  To make changes, you must create a new version.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-gold" 
              onClick={handlePublish}
              disabled={publishTemplate.isPending}
            >
              {publishTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Lock className="h-4 w-4 mr-2" />
              Publish Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Version {selectedTemplate?.template_version} • {selectedTemplate?.doc_type}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {selectedTemplate?.template_content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/50 p-4 rounded-lg">
                  {selectedTemplate.template_content}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No template content available
              </p>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: DocumentTemplate;
  onView: () => void;
  onPublish?: () => void;
  onNewVersion?: () => void;
  isCreatingVersion?: boolean;
}

function TemplateCard({ template, onView, onPublish, onNewVersion, isCreatingVersion }: TemplateCardProps) {
  const statusConfig = STATUS_CONFIG[template.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <Badge variant="outline" className="text-xs mb-1">
                {template.doc_type}
              </Badge>
              <div className="font-medium text-foreground text-sm truncate max-w-[200px]">
                {template.name}
              </div>
            </div>
          </div>
          <Badge className={cn('text-xs flex-shrink-0', statusConfig?.color)}>
            {statusConfig?.icon}
            <span className="ml-1">{template.status}</span>
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Version</span>
            <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
              v{template.template_version}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Effective From</span>
            <span className="text-foreground">{template.effective_from?.split('T')[0]}</span>
          </div>
          {template.published_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="text-foreground">{template.published_at.split('T')[0]}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {template.status === 'Draft' && onPublish && (
            <Button size="sm" className="flex-1" onClick={onPublish}>
              <Lock className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          {template.status === 'Published' && onNewVersion && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={onNewVersion}
              disabled={isCreatingVersion}
            >
              {isCreatingVersion ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              New Version
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs text-muted-foreground font-mono truncate">
          {template.template_id}
        </div>
      </CardContent>
    </Card>
  );
}

// Module Rules Card Component
interface ModuleRulesCardProps {
  module: ComplianceModule;
  rules: ComplianceRule[];
  onToggleRule: (ruleId: string, isActive: boolean) => void;
  isToggling: boolean;
}

function ModuleRulesCard({ module, rules, onToggleRule, isToggling }: ModuleRulesCardProps) {
  const [expanded, setExpanded] = useState(false);
  const blockCount = rules.filter(r => r.severity === 'BLOCK').length;

  return (
    <Card>
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary" />
            {module.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {rules.length} rules
            </Badge>
            {blockCount > 0 && (
              <Badge className="text-xs bg-destructive/20 text-destructive">
                {blockCount} blocks
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Jurisdiction: {module.jurisdiction} • ID: {module.module_id}
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No rules configured for this module
            </p>
          ) : (
            rules.map((rule) => {
              const severityConfig = SEVERITY_CONFIG[rule.severity];
              return (
                <div 
                  key={rule.id} 
                  className="p-3 rounded-lg border bg-muted/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className={cn('text-xs flex-shrink-0', severityConfig?.color)}>
                        {severityConfig?.icon}
                        <span className="ml-1">{severityConfig?.label}</span>
                      </Badge>
                      <span className="font-medium text-sm truncate">{rule.name}</span>
                    </div>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                      disabled={isToggling}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-1 rounded">{rule.rule_id}</span>
                    <span className="mx-2">•</span>
                    <span>Type: {rule.type}</span>
                  </div>
                  
                  {rule.action_on_fail?.requiredAction && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      On fail: {rule.action_on_fail.requiredAction}
                    </p>
                  )}
                  
                  {rule.applies_to && rule.applies_to.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rule.applies_to.map((context) => (
                        <Badge key={context} variant="outline" className="text-xs">
                          {context}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      )}
    </Card>
  );
}
