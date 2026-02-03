import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Coins,
  FileSignature,
  Wallet,
  Shield,
  Plus,
  RefreshCw,
  Loader2,
  TrendingUp,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartContractStats } from '@/hooks/useSmartContracts';
import { PropertyTokensTab } from './PropertyTokensTab';
import { SmartContractsTab } from './SmartContractsTab';
import { PaymentEscrowTab } from './PaymentEscrowTab';
import { ContractAuditTab } from './ContractAuditTab';

export function SmartContractsSection() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading, refetch } = useSmartContractStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileSignature className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Smart Contracts</h2>
            <p className="text-sm text-muted-foreground">
              Tokenization, contracts, and payment escrow
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Demo Mode Banner */}
      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Demo Mode Active</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain operations are simulated. DocuSign integration uses mock envelopes.
                Real tokenization requires ADGM/DFSA regulatory approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '-' : stats?.tokens.total || 0}
                </div>
                <div className="text-xs text-muted-foreground">Property Tokens</div>
              </div>
            </div>
            {stats?.tokens.minted ? (
              <Badge variant="outline" className="mt-2 text-xs">
                {stats.tokens.minted} minted
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald/10">
                <TrendingUp className="h-5 w-5 text-emerald" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '-' : formatCurrency(stats?.tokens.totalValuation || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Valuation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileSignature className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '-' : stats?.contracts.total || 0}
                </div>
                <div className="text-xs text-muted-foreground">Smart Contracts</div>
              </div>
            </div>
            {stats?.contracts.executed ? (
              <Badge variant="outline" className="mt-2 text-xs border-emerald/50 text-emerald">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.contracts.executed} executed
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Wallet className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '-' : formatCurrency(stats?.escrows.funded || 0)}
                </div>
                <div className="text-xs text-muted-foreground">In Escrow</div>
              </div>
            </div>
            {stats?.escrows.total ? (
              <Badge variant="outline" className="mt-2 text-xs">
                {stats.escrows.total} escrows
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">Contracts</span>
          </TabsTrigger>
          <TabsTrigger value="escrow" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Escrow</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <PropertyTokensTab />
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <SmartContractsTab />
        </TabsContent>

        <TabsContent value="escrow" className="mt-4">
          <PaymentEscrowTab />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <ContractAuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
