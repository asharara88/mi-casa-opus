import React, { useState } from 'react';
import { FileSignature, Send, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSendForSignature, Signer } from '@/hooks/useDocuSign';

interface SendForSignatureButtonProps {
  documentInstanceId: string;
  documentName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const signerRoles = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'broker', label: 'Broker' },
  { value: 'witness', label: 'Witness' },
];

export function SendForSignatureButton({
  documentInstanceId,
  documentName,
  variant = 'default',
  size = 'default',
}: SendForSignatureButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [newSigner, setNewSigner] = useState({ name: '', email: '', role: 'buyer' as const });

  const sendForSignature = useSendForSignature();

  const addSigner = () => {
    if (newSigner.name && newSigner.email) {
      setSigners([...signers, { ...newSigner, order: signers.length + 1 }]);
      setNewSigner({ name: '', email: '', role: 'buyer' });
    }
  };

  const removeSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (signers.length === 0) return;

    sendForSignature.mutate({
      documentInstanceId,
      signers,
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setSigners([]);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <FileSignature className="h-4 w-4 mr-2" />
          Send for Signature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Send for Signature
          </DialogTitle>
          {documentName && (
            <DialogDescription>
              {documentName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Signers */}
          {signers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Signers ({signers.length})</label>
              <div className="space-y-2">
                {signers.map((signer, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{signer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{signer.email}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{signer.role}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeSigner(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Signer Form */}
          <div className="space-y-3 p-3 border rounded-md">
            <label className="text-sm font-medium">Add Signer</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Full name"
                value={newSigner.name}
                onChange={(e) => setNewSigner({ ...newSigner, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newSigner.email}
                onChange={(e) => setNewSigner({ ...newSigner, email: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={newSigner.role}
                onValueChange={(value: any) => setNewSigner({ ...newSigner, role: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {signerRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={addSigner}
                disabled={!newSigner.name || !newSigner.email}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={signers.length === 0 || sendForSignature.isPending}
            >
              {sendForSignature.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {signers.length} signer{signers.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
