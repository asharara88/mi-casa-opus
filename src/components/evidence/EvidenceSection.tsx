import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvidenceObject {
  id: string;
  evidence_id: string;
  type: string;
  source: string;
  captured_by: string;
  captured_at: string;
  hash: string;
  immutability_class: 'HASH_LOCKED' | 'BLOCKCHAIN_ANCHORED' | 'NOTARIZED';
  entity_type?: string;
  entity_id?: string;
  file_url?: string;
  metadata?: Record<string, unknown>;
}

const DEMO_EVIDENCE: EvidenceObject[] = [
  {
    id: '1',
    evidence_id: 'EV-2024-001',
    type: 'Screenshot',
    source: 'Portal Listing',
    captured_by: 'USR-001',
    captured_at: '2024-01-15T10:30:00Z',
    hash: 'sha256:a1b2c3d4e5f6789012345678901234567890abcdef',
    immutability_class: 'HASH_LOCKED',
    entity_type: 'Deal',
    entity_id: 'DEAL-2024-001',
  },
  {
    id: '2',
    evidence_id: 'EV-2024-002',
    type: 'EmailConfirmation',
    source: 'Gmail',
    captured_by: 'USR-001',
    captured_at: '2024-01-15T11:00:00Z',
    hash: 'sha256:b2c3d4e5f6789012345678901234567890abcdef12',
    immutability_class: 'BLOCKCHAIN_ANCHORED',
    entity_type: 'Deal',
    entity_id: 'DEAL-2024-001',
  },
  {
    id: '3',
    evidence_id: 'EV-2024-003',
    type: 'PaymentReceipt',
    source: 'Bank Transfer',
    captured_by: 'USR-002',
    captured_at: '2024-01-16T09:15:00Z',
    hash: 'sha256:c3d4e5f6789012345678901234567890abcdef1234',
    immutability_class: 'NOTARIZED',
    entity_type: 'Deal',
    entity_id: 'DEAL-2024-002',
  },
  {
    id: '4',
    evidence_id: 'EV-2024-004',
    type: 'PhotoEvidence',
    source: 'Property Viewing',
    captured_by: 'USR-003',
    captured_at: '2024-01-17T14:30:00Z',
    hash: 'sha256:d4e5f6789012345678901234567890abcdef123456',
    immutability_class: 'HASH_LOCKED',
    entity_type: 'Listing',
    entity_id: 'LST-2024-001',
  },
  {
    id: '5',
    evidence_id: 'EV-2024-005',
    type: 'SignedDocument',
    source: 'DocuSign',
    captured_by: 'USR-001',
    captured_at: '2024-01-18T16:00:00Z',
    hash: 'sha256:e5f6789012345678901234567890abcdef12345678',
    immutability_class: 'BLOCKCHAIN_ANCHORED',
    entity_type: 'Deal',
    entity_id: 'DEAL-2024-001',
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Screenshot: <Camera className="h-4 w-4" />,
  EmailConfirmation: <Mail className="h-4 w-4" />,
  SMSConfirmation: <MessageSquare className="h-4 w-4" />,
  SignedDocument: <FileCheck className="h-4 w-4" />,
  PaymentReceipt: <CreditCard className="h-4 w-4" />,
  PhotoEvidence: <FileImage className="h-4 w-4" />,
  SystemLog: <Hash className="h-4 w-4" />,
};

const IMMUTABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  HASH_LOCKED: { label: 'Hash Locked', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  BLOCKCHAIN_ANCHORED: { label: 'Blockchain', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
  NOTARIZED: { label: 'Notarized', color: 'bg-emerald/20 text-emerald border-emerald/30' },
};

export function EvidenceSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [immutabilityFilter, setImmutabilityFilter] = useState<string>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceObject | null>(null);

  const filteredEvidence = DEMO_EVIDENCE.filter((ev) => {
    const matchesSearch =
      ev.evidence_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesImmutability = immutabilityFilter === 'all' || ev.immutability_class === immutabilityFilter;

    return matchesSearch && matchesType && matchesImmutability;
  });

  const verifiedCount = DEMO_EVIDENCE.filter(ev => ev.hash).length;
  const blockchainCount = DEMO_EVIDENCE.filter(ev => ev.immutability_class === 'BLOCKCHAIN_ANCHORED').length;

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
              Captured evidence and attachments with hash verification
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
                <div className="text-2xl font-bold text-foreground">{DEMO_EVIDENCE.length}</div>
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
                <div className="text-2xl font-bold text-foreground">{blockchainCount}</div>
                <div className="text-xs text-muted-foreground">Blockchain Anchored</div>
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
                <SelectItem value="Screenshot">Screenshot</SelectItem>
                <SelectItem value="EmailConfirmation">Email</SelectItem>
                <SelectItem value="PaymentReceipt">Payment</SelectItem>
                <SelectItem value="PhotoEvidence">Photo</SelectItem>
                <SelectItem value="SignedDocument">Document</SelectItem>
              </SelectContent>
            </Select>
            <Select value={immutabilityFilter} onValueChange={setImmutabilityFilter}>
              <SelectTrigger className="w-48">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Immutability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="HASH_LOCKED">Hash Locked</SelectItem>
                <SelectItem value="BLOCKCHAIN_ANCHORED">Blockchain</SelectItem>
                <SelectItem value="NOTARIZED">Notarized</SelectItem>
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
              {filteredEvidence.map((evidence) => {
                const icon = TYPE_ICONS[evidence.type] || <FileImage className="h-4 w-4" />;
                const immutability = IMMUTABILITY_CONFIG[evidence.immutability_class];

                return (
                  <TableRow key={evidence.id} className="hover:bg-muted/50">
                    <TableCell>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {evidence.evidence_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          {icon}
                        </div>
                        <span className="text-sm">{evidence.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {evidence.source}
                    </TableCell>
                    <TableCell>
                      {evidence.entity_id ? (
                        <div className="text-xs">
                          <Badge variant="outline" className="mb-1">
                            {evidence.entity_type}
                          </Badge>
                          <div className="font-mono text-muted-foreground">
                            {evidence.entity_id}
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
                        <span>{evidence.hash.slice(7, 19)}...</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(evidence.captured_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvidence(evidence)}
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
                                    {selectedEvidence.captured_by}
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
