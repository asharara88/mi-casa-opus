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
import { useReferralSources } from '@/hooks/useReferralSources';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { AddReferralSourceModal } from './AddReferralSourceModal';

export function NetworkDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { sources, isLoading } = useReferralSources();

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.source_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (source.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Referral Network</CardTitle>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading referral sources...</div>
        ) : filteredSources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No partners found' : 'No referral partners yet. Add your first partner!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Commission %</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Deals Closed</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{source.name}</p>
                        {source.company_name && (
                          <p className="text-sm text-muted-foreground">{source.company_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{source.source_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{source.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {source.contact_name && (
                          <p className="text-sm">{source.contact_name}</p>
                        )}
                        {source.contact_phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {source.contact_phone}
                          </div>
                        )}
                        {source.contact_email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {source.contact_email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{source.commission_percent}%</TableCell>
                    <TableCell className="text-right">{source.leads_generated}</TableCell>
                    <TableCell className="text-right">{source.deals_closed}</TableCell>
                    <TableCell className="text-right">{formatCurrency(source.total_commission_paid)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={source.status === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-muted text-muted-foreground'
                        }
                      >
                        {source.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AddReferralSourceModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </Card>
  );
}
