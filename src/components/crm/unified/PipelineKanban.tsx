import { useMemo, useState } from 'react';
import { useOpportunities, usePipelineStages, useUpdateOpportunity, useContacts, type Opportunity } from '@/hooks/useUnifiedCRM';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Building2, Banknote, Clock, User } from 'lucide-react';

interface Props {
  onSelect?: (id: string) => void;
}

export function PipelineKanban({ onSelect }: Props) {
  const { data: stages = [] } = usePipelineStages();
  const { data: opps = [], isLoading } = useOpportunities();
  const { data: contacts = [] } = useContacts();
  const updateOpp = useUpdateOpportunity();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const contactsById = useMemo(() => Object.fromEntries(contacts.map((c) => [c.id, c])), [contacts]);

  const oppsByStage = useMemo(() => {
    const map: Record<string, Opportunity[]> = {};
    for (const s of stages) map[s.id] = [];
    for (const o of opps) {
      if (map[o.stage_id]) map[o.stage_id].push(o);
    }
    return map;
  }, [stages, opps]);

  const handleDrop = (stageId: string) => {
    if (draggingId && stageId !== opps.find((o) => o.id === draggingId)?.stage_id) {
      updateOpp.mutate({ id: draggingId, stage_id: stageId });
    }
    setDraggingId(null);
    setDragOverStage(null);
  };

  const fmt = (n: number | null) => (n ? new Intl.NumberFormat('en-AE', { notation: 'compact', maximumFractionDigits: 1 }).format(n) : '—');

  if (isLoading) return <div className="text-sm text-muted-foreground p-8 text-center">Loading pipeline…</div>;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {stages.map((stage) => {
          const stageOpps = oppsByStage[stage.id] ?? [];
          const total = stageOpps.reduce((s, o) => s + (o.value ?? 0), 0);
          const isOver = dragOverStage === stage.id;
          return (
            <div
              key={stage.id}
              className={`w-72 flex-shrink-0 rounded-xl border bg-card transition-all ${isOver ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.id);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
                  <Badge variant="secondary" className="text-[10px] h-5">{stageOpps.length}</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums">{fmt(total)}</span>
              </div>
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {stageOpps.length === 0 && (
                  <div className="text-[11px] text-muted-foreground text-center py-6 italic">Drop here</div>
                )}
                {stageOpps.map((o) => {
                  const c = contactsById[o.contact_id];
                  return (
                    <Card
                      key={o.id}
                      draggable
                      onDragStart={() => setDraggingId(o.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => onSelect?.(o.id)}
                      className={`p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all ${draggingId === o.id ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2">{o.title}</p>
                      <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                        {c && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            <span className="truncate">{c.full_name}</span>
                          </div>
                        )}
                        {o.property_type && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">
                              {o.property_type}
                              {o.bedrooms_min ? ` · ${o.bedrooms_min}${o.bedrooms_max && o.bedrooms_max !== o.bedrooms_min ? `-${o.bedrooms_max}` : ''} BR` : ''}
                            </span>
                          </div>
                        )}
                        {(o.budget_min || o.budget_max) && (
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-3 h-3" />
                            <span>
                              {o.budget_min ? fmt(o.budget_min) : '—'} - {o.budget_max ? fmt(o.budget_max) : '—'} {o.currency}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 pt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(o.updated_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
