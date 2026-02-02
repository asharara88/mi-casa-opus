import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  FolderOpen, 
  Users, 
  Briefcase, 
  ClipboardCheck, 
  Receipt, 
  Shield, 
  Building,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { TEMPLATE_SCHEMAS, getTemplateCategories, getTemplatesByCategory, TemplateSchema } from "@/lib/template-schemas";

interface OfficialFormsBrowserProps {
  onSelectTemplate: (templateId: string) => void;
  linkedDealId?: string;
  linkedLeadId?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  onboarding: Users,
  transaction: Briefcase,
  closing: ClipboardCheck,
  finance: Receipt,
  compliance: Shield,
  operations: Building
};

const CATEGORY_COLORS: Record<string, string> = {
  onboarding: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  transaction: "bg-green-500/10 text-green-600 border-green-500/20",
  closing: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  finance: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  compliance: "bg-red-500/10 text-red-600 border-red-500/20",
  operations: "bg-gray-500/10 text-gray-600 border-gray-500/20"
};

export function OfficialFormsBrowser({ onSelectTemplate, linkedDealId, linkedLeadId }: OfficialFormsBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const categories = useMemo(() => getTemplateCategories(), []);
  
  const filteredTemplates = useMemo(() => {
    let templates = Object.values(TEMPLATE_SCHEMAS);
    
    if (activeCategory !== "all") {
      templates = templates.filter(t => t.category === activeCategory);
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }
    
    return templates;
  }, [activeCategory, search]);
  
  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, TemplateSchema[]> = {};
    filteredTemplates.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filteredTemplates]);
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search 18 official templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            All (18)
          </TabsTrigger>
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.id] || FileText;
            return (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4 mr-1" />
                {cat.label.split(" ")[0]} ({cat.count})
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-4">
          <ScrollArea className="h-[400px]">
            {activeCategory === "all" ? (
              // Show grouped by category
              <div className="space-y-6">
                {Object.entries(groupedTemplates).map(([category, templates]) => {
                  const Icon = CATEGORY_ICONS[category] || FileText;
                  const catInfo = categories.find(c => c.id === category);
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Icon className="h-4 w-4" />
                        {catInfo?.label || category}
                      </div>
                      <div className="grid gap-2">
                        {templates.map(template => (
                          <TemplateCard 
                            key={template.id} 
                            template={template} 
                            onSelect={onSelectTemplate}
                            linkedDealId={linkedDealId}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Show flat list
              <div className="grid gap-2">
                {filteredTemplates.map(template => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    onSelect={onSelectTemplate}
                    linkedDealId={linkedDealId}
                  />
                ))}
              </div>
            )}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No templates found</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TemplateCardProps {
  template: TemplateSchema;
  onSelect: (templateId: string) => void;
  linkedDealId?: string;
}

function TemplateCard({ template, onSelect, linkedDealId }: TemplateCardProps) {
  const categoryColor = CATEGORY_COLORS[template.category] || "bg-muted";
  const formNumber = template.id.match(/\d+/)?.[0] || "00";
  
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors group"
      onClick={() => onSelect(template.id)}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${categoryColor}`}>
          {formNumber.padStart(2, "0")}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{template.title}</h4>
            {template.followUpTask && (
              <Badge variant="outline" className="text-xs shrink-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-task
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {template.workflow.length > 0 && (
            <div className="flex gap-1">
              {template.workflow.map(w => (
                <Badge key={w} variant="secondary" className="text-xs capitalize">
                  {w}
                </Badge>
              ))}
            </div>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

// Quick access to most used forms
export function QuickAccessForms({ onSelectTemplate }: { onSelectTemplate: (id: string) => void }) {
  const quickForms = [
    { id: "FORM_01_SELLER_AUTH", label: "Seller Authorization" },
    { id: "FORM_02_BUYER_REP", label: "Buyer Representation" },
    { id: "FORM_07_OFFER", label: "Offer Letter" },
    { id: "FORM_08_MOU", label: "MOU / Pre-SPA" },
    { id: "FORM_12_INVOICE", label: "Commission Invoice" },
    { id: "FORM_10_CLOSING", label: "Closing Checklist" }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {quickForms.map(form => (
        <Button
          key={form.id}
          variant="outline"
          className="justify-start h-auto py-2 px-3"
          onClick={() => onSelectTemplate(form.id)}
        >
          <FileText className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate text-sm">{form.label}</span>
        </Button>
      ))}
    </div>
  );
}
