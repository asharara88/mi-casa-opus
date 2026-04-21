import { useMemo, useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useUnifiedCRM';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Plus, AlertTriangle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

export function TasksInbox() {
  const { data: tasks = [] } = useTasks({ mine: true });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const groups = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
    return {
      overdue: open.filter((t) => t.due_at && isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at))),
      today: open.filter((t) => t.due_at && isToday(new Date(t.due_at))),
      tomorrow: open.filter((t) => t.due_at && isTomorrow(new Date(t.due_at))),
      upcoming: open.filter((t) => t.due_at && !isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at)) && !isTomorrow(new Date(t.due_at))),
      noDate: open.filter((t) => !t.due_at),
      done: tasks.filter((t) => t.status === 'completed').slice(0, 10),
    };
  }, [tasks]);

  const add = () => {
    if (!title.trim()) return;
    createTask.mutate({ title, due_at: due ? new Date(due).toISOString() : null }, {
      onSuccess: () => { setTitle(''); setDue(''); },
    });
  };

  const Section = ({ label, items, color }: { label: string; items: typeof tasks; color?: string }) => (
    items.length > 0 ? (
      <div className="space-y-2">
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${color ?? 'text-muted-foreground'}`}>
          {label} <span className="ml-1 text-foreground">({items.length})</span>
        </h3>
        {items.map((t) => (
          <Card key={t.id} className="p-3 flex items-center gap-3">
            <button onClick={() => updateTask.mutate({ id: t.id, status: t.status === 'completed' ? 'open' : 'completed' })}>
              {t.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</p>
              {t.description && <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>}
            </div>
            {t.priority !== 'medium' && <Badge variant="outline" className="text-[10px] capitalize">{t.priority}</Badge>}
            {t.due_at && <span className="text-[11px] text-muted-foreground tabular-nums">{format(new Date(t.due_at), 'MMM d')}</span>}
          </Card>
        ))}
      </div>
    ) : null
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <Card className="p-3 flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" className="flex-1" onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-40" />
        <Button onClick={add} disabled={!title.trim()}><Plus className="w-4 h-4" /></Button>
      </Card>

      {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No tasks. Add one above to get started.</p>}

      <Section label="⚠ Overdue" items={groups.overdue} color="text-red-600 dark:text-red-400" />
      <Section label="Today" items={groups.today} color="text-primary" />
      <Section label="Tomorrow" items={groups.tomorrow} />
      <Section label="Upcoming" items={groups.upcoming} />
      <Section label="No due date" items={groups.noDate} />
      {groups.done.length > 0 && <Section label="Recently completed" items={groups.done} />}
    </div>
  );
}
