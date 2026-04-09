import { useState } from 'react';
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
  TableRow 
} from '@/components/ui/table';
import { useMarketingAds } from '@/hooks/useMarketingAds';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { AddAdModal } from './AddAdModal';
import type { AdStatus, PermitStatus } from '@/types/marketing';

const adStatusColors: Record<AdStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  PendingApproval: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  Active: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  Paused: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  Expired: 'bg-destructive/20 text-destructive',
  Rejected: 'bg-destructive/20 text-destructive',
};

const permitStatusColors: Record<PermitStatus, string> = {
  NotRequired: 'bg-muted text-muted-foreground',
  Pending: 'bg-amber-500/20 text-amber-600',
  Approved: 'bg-emerald-500/20 text-emerald-600',
  Expired: 'bg-destructive/20 text-destructive',
  Rejected: 'bg-destructive/20 text-destructive',
};

export function AdsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { ads, expiringPermits, isLoading } = useMarketingAds();

  const filteredAds = ads.filter(ad =>
    ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.ad_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Expiring Permits Alert */}
      {expiringPermits.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  {expiringPermits.length} DARI Permit(s) Expiring Soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Review and renew permits before they expire
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Advertisements</CardTitle>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Advertisement
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading advertisements...</div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No ads found' : 'No advertisements yet. Create your first ad!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Advertisement</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>DARI Permit</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAds.map((ad) => {
                    const daysUntilExpiry = ad.permit_valid_until 
                      ? differenceInDays(new Date(ad.permit_valid_until), new Date())
                      : null;
                    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
                    
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ad.name}</p>
                            <p className="text-xs text-muted-foreground">{ad.ad_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ad.platform}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={adStatusColors[ad.status]}>
                            {ad.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={permitStatusColors[ad.permit_status]}>
                              {ad.permit_status}
                            </Badge>
                            {ad.dari_permit_no && (
                              <p className="text-xs text-muted-foreground">{ad.dari_permit_no}</p>
                            )}
                            {ad.permit_valid_until && (
                              <p className={`text-xs ${isExpiringSoon ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                Expires: {format(new Date(ad.permit_valid_until), 'MMM d, yyyy')}
                                {isExpiringSoon && ` (${daysUntilExpiry}d)`}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(ad.budget)}</TableCell>
                        <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{ad.leads_generated}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddAdModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
