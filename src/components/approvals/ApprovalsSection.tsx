import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  FileText,
  AlertTriangle,
  User,
  ArrowRight,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Approval {
  id: string;
  approval_type: 'EconomicsOverride' | 'PayoutBatch' | 'ComplianceWaiver' | 'TemplatePublish';
  entity_type: string;
  entity_id: string;
  requested_by: string;
  requested_at: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

const DEMO_APPROVALS: Approval[] = [
  {
    id: '1',
    approval_type: 'EconomicsOverride',
    entity_type: 'Deal',
    entity_id: 'DEAL-2024-001',
    requested_by: 'John Smith',
    requested_at: '2024-01-18T10:00:00Z',
    status: 'Pending',
    before_state: { commission_rate: 2.0 },
    after_state: { commission_rate: 2.5 },
    notes: 'Premium listing with additional marketing spend',
  },
  {
    id: '2',
    approval_type: 'PayoutBatch',
    entity_type: 'Payout',
    entity_id: 'PB-2024-001',
    requested_by: 'Finance Team',
    requested_at: '2024-01-17T14:30:00Z',
    status: 'Pending',
    before_state: { total_amount: 0 },
    after_state: { total_amount: 125000, commission_count: 3 },
    notes: 'Monthly broker payout batch for January 2024',
  },
  {
    id: '3',
    approval_type: 'TemplatePublish',
    entity_type: 'Template',
    entity_id: 'TPL-SPA-V2',
    requested_by: 'Legal Team',
    requested_at: '2024-01-16T09:00:00Z',
    status: 'Approved',
    reviewed_by: 'Legal Owner',
    reviewed_at: '2024-01-16T11:00:00Z',
    notes: 'Updated SPA template with new RERA clauses',
  },
  {
    id: '4',
    approval_type: 'ComplianceWaiver',
    entity_type: 'Deal',
    entity_id: 'DEAL-2024-003',
    requested_by: 'Sarah Johnson',
    requested_at: '2024-01-15T16:00:00Z',
    status: 'Rejected',
    reviewed_by: 'Compliance Officer',
    reviewed_at: '2024-01-15T17:30:00Z',
    notes: 'KYC document expired, waiver requested for 48h extension',
  },
];

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  EconomicsOverride: {
    label: 'Economics Override',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  },
  PayoutBatch: {
    label: 'Payout Batch',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'bg-emerald/20 text-emerald border-emerald/30',
  },
  ComplianceWaiver: {
    label: 'Compliance Waiver',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'bg-red-500/20 text-red-600 border-red-500/30',
  },
  TemplatePublish: {
    label: 'Template Publish',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  },
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending: { color: 'bg-amber-500/20 text-amber-600', icon: <Clock className="h-3 w-3" /> },
  Approved: { color: 'bg-emerald/20 text-emerald', icon: <CheckCircle className="h-3 w-3" /> },
  Rejected: { color: 'bg-destructive/20 text-destructive', icon: <XCircle className="h-3 w-3" /> },
};

export function ApprovalsSection() {
  const [approvals, setApprovals] = useState<Approval[]>(DEMO_APPROVALS);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const pendingCount = approvals.filter(a => a.status === 'Pending').length;
  const approvedCount = approvals.filter(a => a.status === 'Approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'Rejected').length;

  const handleReview = (approval: Approval) => {
    setSelectedApproval(approval);
    setReviewNotes('');
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedApproval) return;
    setApprovals(prev =>
      prev.map(a =>
        a.id === selectedApproval.id
          ? { ...a, status: 'Approved', reviewed_by: 'Current User', reviewed_at: new Date().toISOString() }
          : a
      )
    );
    toast({ title: 'Approved', description: `${selectedApproval.approval_type} has been approved` });
    setIsReviewDialogOpen(false);
  };

  const handleReject = () => {
    if (!selectedApproval) return;
    setApprovals(prev =>
      prev.map(a =>
        a.id === selectedApproval.id
          ? { ...a, status: 'Rejected', reviewed_by: 'Current User', reviewed_at: new Date().toISOString() }
          : a
      )
    );
    toast({ title: 'Rejected', description: `${selectedApproval.approval_type} has been rejected`, variant: 'destructive' });
    setIsReviewDialogOpen(false);
  };

  const renderApprovalRow = (approval: Approval) => {
    const typeConfig = TYPE_CONFIG[approval.approval_type];
    const statusConfig = STATUS_CONFIG[approval.status];

    return (
      <TableRow key={approval.id} className="hover:bg-muted/50">
        <TableCell>
          <Badge variant="outline" className={cn('text-xs', typeConfig.color)}>
            {typeConfig.icon}
            <span className="ml-1">{typeConfig.label}</span>
          </Badge>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <Badge variant="outline" className="mb-1 text-xs">
              {approval.entity_type}
            </Badge>
            <div className="font-mono text-xs text-muted-foreground">
              {approval.entity_id}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            {approval.requested_by}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(approval.requested_at).toLocaleString()}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={cn('text-xs', statusConfig.color)}>
            {statusConfig.icon}
            <span className="ml-1">{approval.status}</span>
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
          {approval.notes || '—'}
        </TableCell>
        <TableCell>
          {approval.status === 'Pending' ? (
            <Button size="sm" variant="outline" onClick={() => handleReview(approval)}>
              Review
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => handleReview(approval)}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Approvals Queue</h2>
          <p className="text-sm text-muted-foreground">
            Pending approvals and override requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald/30 bg-emerald/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald" />
              <div>
                <div className="text-2xl font-bold text-foreground">{approvedCount}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-foreground">{rejectedCount}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.filter(a => a.status === 'Pending').map(renderApprovalRow)}
                  {pendingCount === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No pending approvals
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map(renderApprovalRow)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedApproval?.status === 'Pending' ? 'Review Approval' : 'Approval Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval && TYPE_CONFIG[selectedApproval.approval_type]?.label}
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              {/* Change Summary */}
              {selectedApproval.before_state && selectedApproval.after_state && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium mb-2">Requested Change</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex-1 p-2 rounded bg-background">
                      <div className="text-xs text-muted-foreground mb-1">Before</div>
                      <pre className="text-xs font-mono">
                        {JSON.stringify(selectedApproval.before_state, null, 2)}
                      </pre>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 p-2 rounded bg-primary/10">
                      <div className="text-xs text-muted-foreground mb-1">After</div>
                      <pre className="text-xs font-mono">
                        {JSON.stringify(selectedApproval.after_state, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="text-sm font-medium mb-1">Request Notes</div>
                <p className="text-sm text-muted-foreground">
                  {selectedApproval.notes || 'No notes provided'}
                </p>
              </div>

              {selectedApproval.status === 'Pending' && (
                <div>
                  <div className="text-sm font-medium mb-1">Review Notes</div>
                  <Textarea
                    placeholder="Add notes for your decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              )}

              {selectedApproval.reviewed_by && (
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={STATUS_CONFIG[selectedApproval.status].color}>
                      {selectedApproval.status}
                    </Badge>
                    <span className="text-muted-foreground">by {selectedApproval.reviewed_by}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedApproval.reviewed_at && new Date(selectedApproval.reviewed_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedApproval?.status === 'Pending' && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button className="btn-gold" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
