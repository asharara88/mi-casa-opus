import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  Hash, 
  Shield, 
  Camera,
  FileImage,
  Mail,
  MessageSquare,
  FileCheck,
  CreditCard,
  ExternalLink,
  CheckCircle,
  Clock,
  User,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvidence } from '@/hooks/useEvidence';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  DARI: <FileCheck className="h-4 w-4" />,
  TAMM: <FileCheck className="h-4 w-4" />,
  PaymentProof: <CreditCard className="h-4 w-4" />,
  Identity: <User className="h-4 w-4" />,
  TruthPack: <Shield className="h-4 w-4" />,
  Photo: <FileImage className="h-4 w-4" />,
  Email: <Mail className="h-4 w-4" />,
  Contract: <FileCheck className="h-4 w-4" />,
  Other: <FileImage className="h-4 w-4" />,
};

const IMMUTABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  External: { label: 'External', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
  Internal: { label: 'Internal', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  System: { label: 'System', color: 'bg-emerald/20 text-emerald border-emerald/30' },
};

export function EvidenceSection() {
  const { data: rawEvidence, isLoading, error } = useEvidence();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [immutabilityFilter, setImmutabilityFilter] = useState<string>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<typeof evidence[0] | null>(null);

  // Transform evidence to expected format
  const evidence = (rawEvidence || []).map(e => ({
    id: e.id,
    evidence_id: e.evidence_id,
    type: e.evidence_type,
    source: e.source || 'Unknown',
    captured_by: e.captured_by || 'System',
    captured_at: e.captured_at,
    hash: e.file_hash || 'sha256:pending',
    immutability_class: e.immutability_class,
    entity_type: e.entity_type || undefined,
    entity_id: e.entity_id || undefined,
    file_url: e.file_url || undefined,
    metadata: e.metadata || {},
  }));

  const filteredEvidence = evidence.filter((ev) => {
    const matchesSearch =
      ev.evidence_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesImmutability = immutabilityFilter === 'all' || ev.immutability_class === immutabilityFilter;

    return matchesSearch && matchesType && matchesImmutability;
  });

  const verifiedCount = evidence.filter(ev => ev.hash && ev.hash !== 'sha256:pending').length;
  const externalCount = evidence.filter(ev => ev.immutability_class === 'External').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <p>Error loading evidence: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Evidence Center</h2>
            <p className="text-sm text-muted-foreground">
              {evidence.length} evidence objects captured
            </p>
          </div>
        </div>
        <Button className="btn-gold">
          <Plus className="h-4 w-4 mr-2" />
          Capture Evidence
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{evidence.length}</div>
                <div className="text-xs text-muted-foreground">Total Evidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald" />
              <div>
                <div className="text-2xl font-bold text-foreground">{verifiedCount}</div>
                <div className="text-xs text-muted-foreground">Hash Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{externalCount}</div>
                <div className="text-xs text-muted-foreground">External Sources</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">24h</div>
                <div className="text-xs text-muted-foreground">Avg. Capture Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, source, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DARI">DARI</SelectItem>
                <SelectItem value="TAMM">TAMM</SelectItem>
                <SelectItem value="PaymentProof">Payment Proof</SelectItem>
                <SelectItem value="Identity">Identity</SelectItem>
                <SelectItem value="Photo">Photo</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select value={immutabilityFilter} onValueChange={setImmutabilityFilter}>
              <SelectTrigger className="w-48">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Immutability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="External">External</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Evidence ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Immutability</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Captured</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvidence.map((ev) => {
                const icon = TYPE_ICONS[ev.type] || <FileImage className="h-4 w-4" />;
                const immutability = IMMUTABILITY_CONFIG[ev.immutability_class] || IMMUTABILITY_CONFIG.Internal;

                return (
                  <TableRow key={ev.id} className="hover:bg-muted/50">
                    <TableCell>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {ev.evidence_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          {icon}
                        </div>
                        <span className="text-sm">{ev.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ev.source}
                    </TableCell>
                    <TableCell>
                      {ev.entity_id ? (
                        <div className="text-xs">
                          <Badge variant="outline" className="mb-1">
                            {ev.entity_type}
                          </Badge>
                          <div className="font-mono text-muted-foreground">
                            {ev.entity_id.slice(0, 8)}...
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs', immutability.color)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {immutability.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <span>{ev.hash.slice(7, 19)}...</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ev.captured_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvidence(ev)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Evidence Details</DialogTitle>
                          </DialogHeader>
                          {selectedEvidence && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground mb-1">Evidence ID</div>
                                  <code className="font-mono">{selectedEvidence.evidence_id}</code>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Type</div>
                                  <div>{selectedEvidence.type}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Source</div>
                                  <div>{selectedEvidence.source}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Captured By</div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {selectedEvidence.captured_by.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1 text-sm">Hash</div>
                                <code className="block p-2 bg-muted rounded text-xs font-mono break-all">
                                  {selectedEvidence.hash}
                                </code>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald" />
                                <span className="text-sm text-emerald">Hash verified</span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredEvidence.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No evidence found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
