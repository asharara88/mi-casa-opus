import { useState } from 'react';
import { useContact, useContactOpportunities, useActivities, useCreateActivity, useTasks, useCreateTask, useUpdateTask } from '@/hooks/useUnifiedCRM';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MessageSquare, StickyNote, CheckCircle2, Circle, Plus, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { ActivityKind } from '@/hooks/useUnifiedCRM';

interface Props {
  contactId: string;
  onBack: () => void;
  onOpenOpportunity?: (id: string) => void;
}

export function ContactDetail({ contactId, onBack, onOpenOpportunity }: Props) {
  const { data: contact } = useContact(contactId);
  const { data: opps = [] } = useContactOpportunities(contactId);
  const { data: activities = [] } = useActivities({ contactId });
  const { data: tasks = [] } = useTasks({ contactId });
  const createActivity = useCreateActivity();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [logKind, setLogKind] = useState<ActivityKind>('note');
  const [logBody, setLogBody] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');

  if (!contact) return <div className="text-sm text-muted-foreground p-8">Loading…</div>;

  const handleLog = () => {
    if (!logBody.trim()) return;
    createActivity.mutate(
      { contact_id: contactId, activity_type: logKind, body: logBody, direction: 'outbound' },
      { onSuccess: () => setLogBody('') },
    );
  };

  const handleTask = () => {
    if (!taskTitle.trim()) return;
    createTask.mutate(
      { contact_id: contactId, title: taskTitle, due_at: taskDue ? new Date(taskDue).toISOString() : null },
      { onSuccess: () => { setTaskTitle(''); setTaskDue(''); } },
    );
  };

  const kindIcon: Record<string, JSX.Element> = {
    call: <Phone className="w-3.5 h-3.5" />,
    email: <Mail className="w-3.5 h-3.5" />,
    whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
    sms: <MessageSquare className="w-3.5 h-3.5" />,
    note: <StickyNote className="w-3.5 h-3.5" />,
    meeting: <Calendar className="w-3.5 h-3.5" />,
    viewing: <Calendar className="w-3.5 h-3.5" />,
    system: <Circle className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{contact.full_name}</h2>
          {contact.company && <p className="text-xs text-muted-foreground">{contact.company}</p>}
        </div>
        <Badge variant="outline" className="ml-auto">{contact.lifecycle_stage}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar */}
        <Card className="p-4 space-y-3 lg:col-span-1 h-fit">
          <h3 className="text-sm font-semibold text-foreground">Contact info</h3>
          {contact.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{contact.email}</div>}
          {contact.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{contact.phone}</div>}
          {contact.whatsapp && <div className="flex items-center gap-2 text-sm"><MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />{contact.whatsapp}</div>}
          {contact.source && <div className="text-xs text-muted-foreground pt-2">Source: <span className="text-foreground">{contact.source}</span></div>}
          {contact.last_contacted_at && (
            <div className="text-xs text-muted-foreground">Last contacted: {formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })}</div>
          )}
          {contact.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {contact.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <h4 className="text-xs font-semibold text-foreground mb-2">Quick actions</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {contact.phone && (
                <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                  <a href={`tel:${contact.phone}`}><Phone className="w-3 h-3 mr-1" />Call</a>
                </Button>
              )}
              {contact.whatsapp && (
                <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                  <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                    <MessageSquare className="w-3 h-3 mr-1" />WhatsApp
                  </a>
                </Button>
              )}
              {contact.email && (
                <Button variant="outline" size="sm" asChild className="h-8 text-xs col-span-2">
                  <a href={`mailto:${contact.email}`}><Mail className="w-3 h-3 mr-1" />Email</a>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Main */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="opps">Opportunities ({opps.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.filter(t => t.status !== 'completed').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-3 mt-3">
              <Card className="p-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(['note','call','email','whatsapp','sms','meeting'] as ActivityKind[]).map((k) => (
                    <Button
                      key={k}
                      variant={logKind === k ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs capitalize"
                      onClick={() => setLogKind(k)}
                    >
                      {kindIcon[k]} <span className="ml-1">{k}</span>
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={logBody}
                  onChange={(e) => setLogBody(e.target.value)}
                  placeholder={`Log a ${logKind}…`}
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleLog} disabled={!logBody.trim() || createActivity.isPending}>Log</Button>
                </div>
              </Card>

              <div className="space-y-2">
                {activities.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No activity yet.</p>}
                {activities.map((a) => (
                  <Card key={a.id} className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {kindIcon[a.activity_type]}
                      <span className="font-medium capitalize text-foreground">{a.activity_type}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(a.occurred_at), { addSuffix: true })}</span>
                    </div>
                    {a.subject && <p className="text-sm font-medium text-foreground mt-1">{a.subject}</p>}
                    {a.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opps" className="space-y-2 mt-3">
              {opps.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No opportunities yet.</p>}
              {opps.map((o) => (
                <Card key={o.id} className="p-3 cursor-pointer hover:border-primary/50" onClick={() => onOpenOpportunity?.(o.id)}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{o.title}</p>
                    <Badge variant="outline" className="text-[10px]">{o.reference}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {o.property_type ?? '—'} · {o.budget_min ? `${o.budget_min.toLocaleString()}` : ''}{o.budget_max ? ` - ${o.budget_max.toLocaleString()}` : ''} {o.currency}
                  </p>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-2 mt-3">
              <Card className="p-3 flex gap-2">
                <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="New task…" className="flex-1" />
                <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="w-40" />
                <Button size="sm" onClick={handleTask} disabled={!taskTitle.trim()}><Plus className="w-3 h-3" /></Button>
              </Card>
              {tasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No tasks.</p>}
              {tasks.map((t) => (
                <Card key={t.id} className="p-3 flex items-start gap-2">
                  <button
                    onClick={() => updateTask.mutate({ id: t.id, status: t.status === 'completed' ? 'open' : 'completed' })}
                    className="mt-0.5"
                  >
                    {t.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</p>
                    {t.due_at && <p className="text-[10px] text-muted-foreground">Due {format(new Date(t.due_at), 'MMM d, yyyy')}</p>}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
