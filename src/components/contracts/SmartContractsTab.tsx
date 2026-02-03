import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  FileSignature,
  Plus,
  Loader2,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail,
  Hash,
  Calendar,
  PenTool,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSmartContracts,
  useCreateSmartContract,
  useSendContractForSignature,
  useSimulateSignature,
  type SmartContract,
} from '@/hooks/useSmartContracts';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Pending: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  Executed: 'bg-emerald/20 text-emerald border-emerald/30',
  Voided: 'bg-destructive/20 text-destructive border-destructive/30',
  Expired: 'bg-muted text-muted-foreground',
};

const CONTRACT_TYPES = [
  { value: 'SPA', label: 'Sale & Purchase Agreement' },
  { value: 'MOU', label: 'Memorandum of Understanding' },
  { value: 'Lease', label: 'Lease Agreement' },
  { value: 'Assignment', label: 'Assignment Agreement' },
  { value: 'TokenPurchase', label: 'Token Purchase Agreement' },
  { value: 'ManagementAgreement', label: 'Property Management Agreement' },
];

export function SmartContractsTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [formData, setFormData] = useState({
    contract_type: '',
    contract_name: '',
    effective_date: '',
    parties: [
      { role: 'Seller', name: '', email: '' },
      { role: 'Buyer', name: '', email: '' },
    ],
  });

  const { data: contracts = [], isLoading } = useSmartContracts();
  const createContract = useCreateSmartContract();
  const sendForSignature = useSendContractForSignature();
  const simulateSignature = useSimulateSignature();

  const handleCreate = () => {
    if (!formData.contract_type || !formData.contract_name) {
      toast.error('Please fill required fields');
      return;
    }

    const validParties = formData.parties.filter(p => p.name && p.email);
    if (validParties.length < 2) {
      toast.error('At least 2 parties with name and email required');
      return;
    }

    createContract.mutate({
      contract_type: formData.contract_type,
      contract_name: formData.contract_name,
      parties: validParties,
      effective_date: formData.effective_date || undefined,
    }, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({
          contract_type: '',
          contract_name: '',
          effective_date: '',
          parties: [
            { role: 'Seller', name: '', email: '' },
            { role: 'Buyer', name: '', email: '' },
          ],
        });
      },
    });
  };

  const updateParty = (index: number, field: string, value: string) => {
    const newParties = [...formData.parties];
    newParties[index] = { ...newParties[index], [field]: value };
    setFormData({ ...formData, parties: newParties });
  };

  const addParty = () => {
    setFormData({
      ...formData,
      parties: [...formData.parties, { role: 'Witness', name: '', email: '' }],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Smart Contracts</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage digital contracts with e-signature tracking
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Smart Contract</DialogTitle>
              <DialogDescription>
                Generate a new contract with automatic hash tracking
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Contract Type *</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_name">Contract Name *</Label>
                <Input
                  id="contract_name"
                  placeholder="e.g., Villa Sale - Palm Jumeirah"
                  value={formData.contract_name}
                  onChange={(e) => setFormData({ ...formData, contract_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Contract Parties</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addParty}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Party
                  </Button>
                </div>

                {formData.parties.map((party, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={party.role}
                        onValueChange={(value) => updateParty(index, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Seller">Seller</SelectItem>
                          <SelectItem value="Buyer">Buyer</SelectItem>
                          <SelectItem value="Landlord">Landlord</SelectItem>
                          <SelectItem value="Tenant">Tenant</SelectItem>
                          <SelectItem value="Broker">Broker</SelectItem>
                          <SelectItem value="Witness">Witness</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Full Name"
                        value={party.name}
                        onChange={(e) => updateParty(index, 'name', e.target.value)}
                        className="col-span-2"
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={party.email}
                      onChange={(e) => updateParty(index, 'email', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createContract.isPending}>
                {createContract.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contract Cards */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileSignature className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-foreground mb-1">No Smart Contracts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first digital contract with e-signature tracking
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onSendForSignature={() => sendForSignature.mutate(contract.id)}
              onSimulateSign={(email) => simulateSignature.mutate({ contractId: contract.id, signerEmail: email })}
              isSending={sendForSignature.isPending}
              isSigning={simulateSignature.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ContractCardProps {
  contract: SmartContract;
  onSendForSignature: () => void;
  onSimulateSign: (email: string) => void;
  isSending: boolean;
  isSigning: boolean;
}

function ContractCard({ contract, onSendForSignature, onSimulateSign, isSending, isSigning }: ContractCardProps) {
  const parties = contract.parties as SmartContract['parties'];
  const signedCount = parties.filter(p => p.signed).length;
  const progress = (signedCount / parties.length) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              contract.status === 'Executed' ? "bg-emerald/10" : "bg-primary/10"
            )}>
              <FileSignature className={cn(
                "h-5 w-5",
                contract.status === 'Executed' ? "text-emerald" : "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-base">{contract.contract_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {contract.contract_type}
                </Badge>
                <Badge className={cn('text-xs', STATUS_COLORS[contract.status])}>
                  {contract.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Signature Progress */}
        {contract.status === 'Pending' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Signatures</span>
              <span className="font-medium">{signedCount} of {parties.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Parties */}
        <div className="space-y-2">
          {parties.map((party, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                party.signed ? "bg-emerald/20" : "bg-muted"
              )}>
                {party.signed ? (
                  <CheckCircle className="h-4 w-4 text-emerald" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{party.name}</span>
                  <Badge variant="secondary" className="text-xs">{party.role}</Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate block">
                  {party.email}
                </span>
              </div>
              {contract.status === 'Pending' && !party.signed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSimulateSign(party.email)}
                  disabled={isSigning}
                >
                  {isSigning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <PenTool className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Hash */}
        {contract.content_hash && (
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Hash className="h-3 w-3" />
              Content Hash (SHA-256)
            </div>
            <code className="text-xs font-mono text-foreground block truncate">
              {contract.content_hash}
            </code>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {contract.effective_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Effective: {contract.effective_date}
            </div>
          )}
          {contract.executed_at && (
            <div className="flex items-center gap-1 text-emerald">
              <CheckCircle className="h-3 w-3" />
              Executed: {new Date(contract.executed_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {contract.status === 'Draft' && (
            <Button
              className="flex-1"
              onClick={onSendForSignature}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send for Signature
            </Button>
          )}
          {contract.status === 'Executed' && (
            <Button className="flex-1" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald" />
              View Executed Contract
            </Button>
          )}
        </div>

        {/* Contract ID */}
        <div className="text-xs text-muted-foreground font-mono">
          {contract.contract_id}
        </div>
      </CardContent>
    </Card>
  );
}
