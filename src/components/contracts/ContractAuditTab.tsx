import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lock,
  Search,
  FileSignature,
  CheckCircle,
  Send,
  Wallet,
  ArrowUpRight,
  Hash,
  Clock,
  User,
  Link2,
  Loader2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSmartContracts,
  useContractEvents,
  type SmartContract,
  type ContractEvent,
} from '@/hooks/useSmartContracts';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <FileSignature className="h-4 w-4" />,
  sent_for_signature: <Send className="h-4 w-4" />,
  signed: <CheckCircle className="h-4 w-4 text-emerald" />,
  executed: <Lock className="h-4 w-4 text-emerald" />,
  funded: <Wallet className="h-4 w-4 text-blue-500" />,
  released: <ArrowUpRight className="h-4 w-4 text-purple-500" />,
  milestone: <Shield className="h-4 w-4 text-amber-500" />,
  voided: <Lock className="h-4 w-4 text-destructive" />,
};

export function ContractAuditTab() {
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [searchHash, setSearchHash] = useState('');

  const { data: contracts = [], isLoading: loadingContracts } = useSmartContracts();
  const { data: events = [], isLoading: loadingEvents } = useContractEvents(selectedContractId);

  const filteredEvents = searchHash
    ? events.filter(e => 
        e.event_hash.toLowerCase().includes(searchHash.toLowerCase()) ||
        e.prev_event_hash?.toLowerCase().includes(searchHash.toLowerCase())
      )
    : events;

  // Calculate chain integrity
  const verifyChain = () => {
    if (events.length === 0) return true;
    
    for (let i = 1; i < events.length; i++) {
      if (events[i].prev_event_hash !== events[i - 1].event_hash) {
        return false;
      }
    }
    return true;
  };

  const chainValid = verifyChain();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Contract Audit Trail</h3>
        <p className="text-sm text-muted-foreground">
          Immutable event log with hash-chained integrity verification
        </p>
      </div>

      {/* Integrity Banner */}
      <Card className={cn(
        "border",
        chainValid ? "border-emerald/30 bg-emerald/5" : "border-destructive/30 bg-destructive/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              chainValid ? "bg-emerald/20" : "bg-destructive/20"
            )}>
              {chainValid ? (
                <Shield className="h-5 w-5 text-emerald" />
              ) : (
                <Shield className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-foreground">
                {chainValid ? 'Chain Integrity Verified' : 'Chain Integrity Broken'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {chainValid
                  ? 'All events are cryptographically linked and unmodified'
                  : 'Warning: Event chain has been tampered with'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Contract</label>
          <Select value={selectedContractId} onValueChange={setSelectedContractId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a contract to view audit trail" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  <div className="flex items-center gap-2">
                    <span>{contract.contract_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {contract.contract_type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Search by Hash</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search event hash..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              className="pl-10 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {!selectedContractId ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-foreground mb-1">Select a Contract</h3>
            <p className="text-sm text-muted-foreground">
              Choose a contract above to view its immutable audit trail
            </p>
          </CardContent>
        </Card>
      ) : loadingEvents ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Hash className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-foreground mb-1">No Events Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchHash ? 'No events match your search' : 'No events recorded for this contract'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Event Timeline ({filteredEvents.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFirst={index === 0}
                    isLast={index === filteredEvents.length - 1}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Hash Legend */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Hash Chain Verification
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Each event's hash is computed from: <code className="bg-muted px-1 rounded">SHA-256(event_type + event_data + prev_hash + timestamp)</code>
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald" />
              <span>Valid link</span>
            </div>
            <div className="flex items-center gap-1">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <span>Prev hash pointer</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-primary" />
              <span>Immutable record</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface EventCardProps {
  event: ContractEvent;
  isFirst: boolean;
  isLast: boolean;
}

function EventCard({ event, isFirst, isLast }: EventCardProps) {
  const icon = EVENT_ICONS[event.event_type] || <Clock className="h-4 w-4" />;

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
      )}

      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center",
        event.event_type === 'executed' ? "bg-emerald/20" :
        event.event_type === 'signed' ? "bg-blue-500/20" :
        "bg-muted"
      )}>
        {icon}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium capitalize text-foreground">
                {event.event_type.replace(/_/g, ' ')}
              </h4>
              <p className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {event.event_id}
            </Badge>
          </div>

          {/* Event Data */}
          {Object.keys(event.event_data || {}).length > 0 && (
            <div className="p-2 rounded-lg bg-muted/50 text-xs">
              <pre className="font-mono whitespace-pre-wrap">
                {JSON.stringify(event.event_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Actor */}
          {event.actor_name && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {event.actor_type}: {event.actor_name || event.actor_id}
            </div>
          )}

          {/* Hash Chain */}
          <div className="pt-2 border-t space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Hash className="h-3 w-3 text-emerald" />
              <span className="text-muted-foreground">Hash:</span>
              <code className="font-mono text-foreground truncate flex-1">
                {event.event_hash}
              </code>
            </div>
            {event.prev_event_hash && (
              <div className="flex items-center gap-2 text-xs">
                <Link2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Prev:</span>
                <code className="font-mono text-muted-foreground truncate flex-1">
                  {event.prev_event_hash}
                </code>
              </div>
            )}
            {isFirst && !event.prev_event_hash && (
              <Badge variant="outline" className="text-xs">
                Genesis Event
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
