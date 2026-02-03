import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Coins,
  Plus,
  Loader2,
  ExternalLink,
  Copy,
  Zap,
  Users,
  MapPin,
  Building,
  Lock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePropertyTokens,
  useCreatePropertyToken,
  useMintPropertyToken,
  type PropertyToken,
} from '@/hooks/useSmartContracts';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Minted: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  Active: 'bg-emerald/20 text-emerald border-emerald/30',
  Frozen: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  Burned: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function PropertyTokensTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    token_name: '',
    token_symbol: '',
    property_valuation: '',
    total_supply: '1000000',
    property_type: '',
    location: '',
    minimum_investment: '10000',
  });

  const { data: tokens = [], isLoading } = usePropertyTokens();
  const createToken = useCreatePropertyToken();
  const mintToken = useMintPropertyToken();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreate = () => {
    if (!formData.property_id || !formData.token_name || !formData.token_symbol || !formData.property_valuation) {
      toast.error('Please fill all required fields');
      return;
    }

    createToken.mutate({
      property_id: formData.property_id,
      token_name: formData.token_name,
      token_symbol: formData.token_symbol.toUpperCase(),
      property_valuation: parseFloat(formData.property_valuation),
      total_supply: parseInt(formData.total_supply),
      property_type: formData.property_type || undefined,
      location: formData.location || undefined,
      minimum_investment: parseFloat(formData.minimum_investment),
    }, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({
          property_id: '',
          token_name: '',
          token_symbol: '',
          property_valuation: '',
          total_supply: '1000000',
          property_type: '',
          location: '',
          minimum_investment: '10000',
        });
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
          <h3 className="text-lg font-semibold text-foreground">Property Tokens</h3>
          <p className="text-sm text-muted-foreground">
            Fractional ownership tokens for real estate assets
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Property Token</DialogTitle>
              <DialogDescription>
                Tokenize a real estate asset for fractional ownership
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_id">Property ID *</Label>
                  <Input
                    id="property_id"
                    placeholder="PROP-001"
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token_symbol">Token Symbol *</Label>
                  <Input
                    id="token_symbol"
                    placeholder="PALM1"
                    maxLength={6}
                    value={formData.token_symbol}
                    onChange={(e) => setFormData({ ...formData, token_symbol: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token_name">Token Name *</Label>
                <Input
                  id="token_name"
                  placeholder="Palm Jumeirah Villa Unit A"
                  value={formData.token_name}
                  onChange={(e) => setFormData({ ...formData, token_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_valuation">Property Valuation (AED) *</Label>
                  <Input
                    id="property_valuation"
                    type="number"
                    placeholder="5000000"
                    value={formData.property_valuation}
                    onChange={(e) => setFormData({ ...formData, property_valuation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_supply">Total Supply</Label>
                  <Input
                    id="total_supply"
                    type="number"
                    placeholder="1000000"
                    value={formData.total_supply}
                    onChange={(e) => setFormData({ ...formData, total_supply: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Input
                    id="property_type"
                    placeholder="Villa, Apartment, etc."
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Dubai Marina"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_investment">Minimum Investment (AED)</Label>
                <Input
                  id="minimum_investment"
                  type="number"
                  placeholder="10000"
                  value={formData.minimum_investment}
                  onChange={(e) => setFormData({ ...formData, minimum_investment: e.target.value })}
                />
              </div>

              {formData.property_valuation && formData.total_supply && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <span className="text-muted-foreground">Token Price: </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(parseFloat(formData.property_valuation) / parseInt(formData.total_supply))}
                  </span>
                  <span className="text-muted-foreground"> per token</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createToken.isPending}>
                {createToken.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Token Cards */}
      {tokens.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Coins className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-foreground mb-1">No Property Tokens</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first tokenized real estate asset
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              onMint={() => mintToken.mutate(token.id)}
              isMinting={mintToken.isPending}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TokenCardProps {
  token: PropertyToken;
  onMint: () => void;
  isMinting: boolean;
  onCopy: (text: string) => void;
}

function TokenCard({ token, onMint, isMinting, onCopy }: TokenCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{token.token_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                  ${token.token_symbol}
                </code>
                <Badge className={cn('text-xs', STATUS_COLORS[token.status])}>
                  {token.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Valuation */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(token.property_valuation)}
          </div>
          <div className="text-xs text-muted-foreground">Property Valuation</div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Supply:</span>
            <span className="font-medium">{token.total_supply.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{formatCurrency(token.token_price)}</span>
          </div>
          {token.location && (
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{token.location}</span>
            </div>
          )}
          {token.property_type && (
            <div className="flex items-center gap-2 col-span-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{token.property_type}</span>
            </div>
          )}
        </div>

        {/* Blockchain Info */}
        {token.contract_address && (
          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Contract Address</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onCopy(token.contract_address!)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <code className="text-xs font-mono text-foreground block truncate">
              {token.contract_address}
            </code>
            <Badge variant="outline" className="text-xs">
              {token.chain_network}
            </Badge>
          </div>
        )}

        {/* Compliance */}
        <div className="flex flex-wrap gap-2">
          {token.kyc_required && (
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              KYC Required
            </Badge>
          )}
          {token.accredited_only && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Accredited Only
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {token.regulatory_jurisdiction}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {token.status === 'Draft' && (
            <Button
              className="flex-1"
              onClick={onMint}
              disabled={isMinting}
            >
              {isMinting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Mint Token
            </Button>
          )}
          {token.status === 'Minted' && (
            <Button className="flex-1" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add Investors
            </Button>
          )}
          {token.contract_address && (
            <Button variant="outline" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
