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
import { useMarketingCampaigns } from '@/hooks/useMarketingCampaigns';
import { Plus, Search, MoreVertical, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddCampaignModal } from './AddCampaignModal';
import type { CampaignStatus } from '@/types/marketing';

const statusColors: Record<CampaignStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Active: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  Paused: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  Completed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  Cancelled: 'bg-destructive/20 text-destructive',
};

export function CampaignsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { campaigns, isLoading, updateCampaign } = useMarketingCampaigns();

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.campaign_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleCampaignStatus = (campaign: typeof campaigns[0]) => {
    const newStatus: CampaignStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
    updateCampaign.mutate({ id: campaign.id, status: newStatus });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Campaigns</CardTitle>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Campaign
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No campaigns found' : 'No campaigns yet. Create your first campaign!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.campaign_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </TableCell>
                    <TableCell>{campaign.channel}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(campaign.budget)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                    <TableCell className="text-right">{campaign.metrics?.leads || 0}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {campaign.start_date && (
                          <p>{format(new Date(campaign.start_date), 'MMM d')}</p>
                        )}
                        {campaign.end_date && (
                          <p className="text-muted-foreground">
                            to {format(new Date(campaign.end_date), 'MMM d')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleCampaignStatus(campaign)}>
                            {campaign.status === 'Active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AddCampaignModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </Card>
  );
}
