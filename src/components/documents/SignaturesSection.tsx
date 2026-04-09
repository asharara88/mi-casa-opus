import { useState } from 'react';
import { SignatureEnvelope, Signer } from '@/types/bos';
import { SignatureEnvelopeCard } from './SignatureEnvelopeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  PenTool, 
  CheckCircle, 
  Clock,
  XCircle,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

// Demo data
const DEMO_ENVELOPES: SignatureEnvelope[] = [
  {
    envelope_id: 'ENV-001',
    document_id: 'DOC-001',
    signers: [
      {
        signer_id: 'SIG-001',
        role: 'Buyer',
        identity: { full_name: 'Ahmed Al Maktoum', email: 'ahmed@example.com' },
        status: 'Signed',
        signed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        ip_address: '192.168.1.1',
      },
      {
        signer_id: 'SIG-002',
        role: 'Seller',
        identity: { full_name: 'Sarah Properties LLC', email: 'legal@sarahproperties.com' },
        status: 'Signed',
        signed_at: new Date(Date.now() - 86400000).toISOString(),
        ip_address: '192.168.1.2',
      },
    ],
    authority_checks: [
      { check_type: 'IdentityVerification', passed: true, checked_at: new Date().toISOString(), details: 'Emirates ID verified' },
      { check_type: 'RoleValidation', passed: true, checked_at: new Date().toISOString(), details: 'Role confirmed' },
    ],
    execution_evidence: {
      certificate_hash: 'cert123abc456def789',
      audit_trail_hash: 'audit789xyz123abc456',
    },
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    completed_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    envelope_id: 'ENV-002',
    document_id: 'DOC-002',
    signers: [
      {
        signer_id: 'SIG-003',
        role: 'Buyer',
        identity: { full_name: 'Michael Chen', email: 'm.chen@example.com' },
        status: 'Signed',
        signed_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        signer_id: 'SIG-004',
        role: 'Developer',
        identity: { full_name: 'Aldar Properties', email: 'contracts@aldar.com' },
        status: 'Pending',
      },
    ],
    authority_checks: [
      { check_type: 'IdentityVerification', passed: true, checked_at: new Date().toISOString(), details: 'Passport verified' },
    ],
    execution_evidence: {},
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    envelope_id: 'ENV-003',
    document_id: 'DOC-005',
    signers: [
      {
        signer_id: 'SIG-005',
        role: 'Buyer',
        identity: { full_name: 'James Wilson', email: 'j.wilson@example.com' },
        status: 'Pending',
      },
      {
        signer_id: 'SIG-006',
        role: 'Seller',
        identity: { full_name: 'Dubai Marina Realty', email: 'docs@dmrealty.com' },
        status: 'Pending',
      },
      {
        signer_id: 'SIG-007',
        role: 'Witness',
        identity: { full_name: 'Legal Notary LLC', email: 'notary@legal.com' },
        status: 'Pending',
      },
    ],
    authority_checks: [],
    execution_evidence: {},
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    envelope_id: 'ENV-004',
    document_id: 'DOC-006',
    signers: [
      {
        signer_id: 'SIG-008',
        role: 'Tenant',
        identity: { full_name: 'Emma Thompson', email: 'emma.t@example.com' },
        status: 'Declined',
      },
      {
        signer_id: 'SIG-009',
        role: 'Landlord',
        identity: { full_name: 'Capital Investments', email: 'leasing@capinv.com' },
        status: 'Pending',
      },
    ],
    authority_checks: [
      { check_type: 'IdentityVerification', passed: true, checked_at: new Date().toISOString(), details: 'ID verified' },
    ],
    execution_evidence: {},
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

type EnvelopeStatus = 'all' | 'pending' | 'complete' | 'declined';

export function SignaturesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnvelopeStatus>('all');

  const getEnvelopeStatus = (envelope: SignatureEnvelope): EnvelopeStatus => {
    const hasDeclined = envelope.signers.some(s => s.status === 'Declined');
    if (hasDeclined) return 'declined';
    const allSigned = envelope.signers.every(s => s.status === 'Signed');
    return allSigned ? 'complete' : 'pending';
  };

  const filteredEnvelopes = DEMO_ENVELOPES.filter(envelope => {
    const matchesSearch = 
      envelope.envelope_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      envelope.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      envelope.signers.some(s => 
        s.identity.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || getEnvelopeStatus(envelope) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: DEMO_ENVELOPES.length,
    pending: DEMO_ENVELOPES.filter(e => getEnvelopeStatus(e) === 'pending').length,
    complete: DEMO_ENVELOPES.filter(e => getEnvelopeStatus(e) === 'complete').length,
    declined: DEMO_ENVELOPES.filter(e => getEnvelopeStatus(e) === 'declined').length,
  };

  const handleViewEnvelope = (envelope: SignatureEnvelope) => {
    toast.info(`Viewing envelope: ${envelope.envelope_id}`);
  };

  const handleResendRequest = (envelope: SignatureEnvelope, signer: Signer) => {
    toast.success(`Reminder sent to ${signer.identity.full_name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signature Envelopes</h1>
          <p className="text-sm text-muted-foreground">
            Track document execution status and manage signatures
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Envelopes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => setStatusFilter('pending')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => setStatusFilter('complete')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.complete}</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-destructive/50 transition-colors" onClick={() => setStatusFilter('declined')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.declined}</p>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search envelopes, documents, signers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EnvelopeStatus)}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Envelopes</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Envelope Grid */}
      {filteredEnvelopes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnvelopes.map((envelope) => (
            <SignatureEnvelopeCard
              key={envelope.envelope_id}
              envelope={envelope}
              onView={handleViewEnvelope}
              onResend={handleResendRequest}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border rounded-lg">
          <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No signature envelopes found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Envelopes are created when documents require signatures
          </p>
        </div>
      )}
    </div>
  );
}
