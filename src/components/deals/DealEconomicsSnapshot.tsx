import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Building2, Calculator } from 'lucide-react';
import { Deal, AssignedBroker } from '@/types/bos';

interface DealEconomicsSnapshotProps {
  deal: Deal;
  commissionRate?: number;
}

export const DealEconomicsSnapshot: React.FC<DealEconomicsSnapshotProps> = ({
  deal,
  commissionRate = 2,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: deal.currency || 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const agreedPrice = deal.agreed_price || 0;
  const grossCommission = agreedPrice * (commissionRate / 100);
  const brokerageShare = grossCommission * 0.5; // 50% to brokerage
  const brokersShare = grossCommission * 0.5; // 50% to brokers

  const totalBrokerSplit = deal.assigned_brokers.reduce(
    (sum, b) => sum + b.commission_split_pct,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Deal Economics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Value */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Agreed Price</span>
            <Badge variant="secondary" className="text-xs">
              {deal.deal_type}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-primary">
            {agreedPrice > 0 ? formatCurrency(agreedPrice) : 'TBD'}
          </div>
        </div>

        {/* Commission Breakdown */}
        {agreedPrice > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calculator className="h-4 w-4" />
              Commission Breakdown
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Gross Commission</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(grossCommission)}
                </div>
                <div className="text-xs text-muted-foreground">{commissionRate}% of price</div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Brokerage Share</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(brokerageShare)}
                </div>
                <div className="text-xs text-muted-foreground">50% of gross</div>
              </div>
            </div>

            {/* Broker Splits */}
            {deal.assigned_brokers.length > 0 && (
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Broker Splits</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatCurrency(brokersShare)} total
                  </span>
                </div>

                <div className="space-y-2">
                  {deal.assigned_brokers.map((broker) => {
                    const brokerAmount = brokersShare * (broker.commission_split_pct / 100);
                    return (
                      <div
                        key={broker.broker_id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {broker.role}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground">
                            {broker.broker_id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {broker.commission_split_pct}%
                          </span>
                          <span className="font-medium text-primary">
                            {formatCurrency(brokerAmount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalBrokerSplit !== 100 && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-500/10 p-2 rounded">
                    ⚠️ Broker splits total {totalBrokerSplit}% (should be 100%)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Property Info */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Property: {deal.property_id || 'Not linked'}</span>
          </div>
          {deal.listing_id && (
            <div className="text-xs text-muted-foreground mt-1 ml-6">
              Listing: {deal.listing_id}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
