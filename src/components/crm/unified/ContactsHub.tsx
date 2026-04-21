import { useState } from 'react';
import { useContacts, type Contact } from '@/hooks/useUnifiedCRM';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Mail, Phone, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  onSelect: (c: Contact) => void;
}

const stageColor: Record<string, string> = {
  Lead: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Prospect: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Customer: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Past_Customer: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  Disqualified: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function ContactsHub({ onSelect }: Props) {
  const [search, setSearch] = useState('');
  const { data: contacts = [], isLoading } = useContacts(search);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground text-center py-12">Loading…</div>
      ) : contacts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No contacts yet. Add your first one to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.map((c) => (
            <Card
              key={c.id}
              onClick={() => onSelect(c)}
              className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{c.full_name}</p>
                  {c.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {c.company}
                    </p>
                  )}
                </div>
                <Badge className={`text-[10px] ${stageColor[c.lifecycle_stage] ?? ''}`} variant="outline">
                  {c.lifecycle_stage}
                </Badge>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {c.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3" /> {c.email}
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </div>
                )}
              </div>
              {c.tags && c.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] h-5">{t}</Badge>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[10px] text-muted-foreground">
                Updated {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
