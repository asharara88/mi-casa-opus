import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ModuleResult } from "@/types/compliance";
import { RuleRow } from "./RuleRow";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";

interface ModuleAccordionProps {
  modules: ModuleResult[];
  defaultExpanded?: boolean;
}

export function ModuleAccordion({ modules, defaultExpanded = false }: ModuleAccordionProps) {
  const failedModules = modules.filter(m => !m.passed);
  const defaultValue = defaultExpanded 
    ? modules.map(m => m.moduleId)
    : failedModules.map(m => m.moduleId);

  return (
    <Accordion 
      type="multiple" 
      defaultValue={defaultValue}
      className="space-y-2"
    >
      {modules.map((module) => {
        const passedCount = module.rules.filter(r => r.passed).length;
        const totalCount = module.rules.length;
        
        return (
          <AccordionItem 
            key={module.moduleId} 
            value={module.moduleId}
            className="border rounded-lg overflow-hidden bg-card"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3 flex-1">
                {module.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{module.moduleName}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {module.moduleId}
                  </span>
                </div>
                
                <div className="ml-auto flex items-center gap-2 mr-2">
                  <Badge 
                    variant={module.passed ? "outline" : "destructive"}
                    className={module.passed ? "bg-green-500/10 text-green-700 border-green-500/30" : ""}
                  >
                    {passedCount}/{totalCount} passed
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pb-0">
              <div className="border-t">
                {module.rules.map((rule) => (
                  <RuleRow key={rule.ruleId} rule={rule} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
