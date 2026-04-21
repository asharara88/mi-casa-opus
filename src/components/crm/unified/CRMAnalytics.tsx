import { useMemo } from 'react';
import { useOpportunities, usePipelineStages, useContacts, useTasks } from '@/hooks/useUnifiedCRM';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Banknote, Target, CheckCircle2 } from 'lucide-react';

export function CRMAnalytics() {
  const { data: opps = [] } = useOpportunities();
  const { data: stages = [] } = usePipelineStages();
  const { data: contacts = [] } = useContacts();
  const { data: tasks = [] } = useTasks();

  const stats = useMemo(() => {
    const wonStageIds = new Set(stages.filter((s) => s.stage_type === 'won').map((s) => s.id));
    const lostStageIds = new Set(stages.filter((s) => s.stage_type === 'lost').map((s) => s.id));
    const won = opps.filter((o) => wonStageIds.has(o.stage_id));
    const lost = opps.filter((o) => lostStageIds.has(o.stage_id));
    const active = opps.filter((o) => !wonStageIds.has(o.stage_id) && !lostStageIds.has(o.stage_id));

    const closed = won.length + lost.length;
    const winRate = closed > 0 ? (won.length / closed) * 100 : 0;
    const pipelineValue = active.reduce((s, o) => s + (o.value ?? o.budget_max ?? o.budget_min ?? 0), 0);
    const wonValue = won.reduce((s, o) => s + (o.value ?? 0), 0);

    const bySource: Record<string, number> = {};
    for (const o of opps) {
      const k = o.source ?? 'Unknown';
      bySource[k] = (bySource[k] ?? 0) + 1;
    }

    return { active, won, lost, winRate, pipelineValue, wonValue, bySource };
  }, [opps, stages]);

  const fmt = (n: number) => new Intl.NumberFormat('en-AE', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

  const Stat = ({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: typeof Users; accent?: string }) => (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ?? 'bg-primary/10'}`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Active opportunities" value={String(stats.active.length)} icon={Target} />
        <Stat label="Pipeline value" value={`AED ${fmt(stats.pipelineValue)}`} icon={Banknote} />
        <Stat label="Won (value)" value={`AED ${fmt(stats.wonValue)}`} sub={`${stats.won.length} deals`} icon={TrendingUp} />
        <Stat label="Win rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.won.length} won / ${stats.lost.length} lost`} icon={CheckCircle2} />
        <Stat label="Contacts" value={String(contacts.length)} sub={`${tasks.filter((t) => t.status === 'open').length} open tasks`} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pipeline by stage</h3>
          <div className="space-y-2">
            {stages.map((s) => {
              const count = opps.filter((o) => o.stage_id === s.id).length;
              const pct = opps.length > 0 ? (count / opps.length) * 100 : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Opportunities by source</h3>
          <div className="space-y-2">
            {Object.entries(stats.bySource)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => {
                const pct = opps.length > 0 ? (count / opps.length) * 100 : 0;
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground">{source}</span>
                      <span className="text-muted-foreground tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            {Object.keys(stats.bySource).length === 0 && <p className="text-xs text-muted-foreground">No data yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
