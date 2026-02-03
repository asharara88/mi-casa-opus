import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDealBrokers } from '@/hooks/useDeals';
import { useManageDealBrokers } from '@/hooks/useCommissionAutoGeneration';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BrokerSplitManagerProps {
  dealId: string;
  readOnly?: boolean;
}

const BROKER_ROLES = [
  'Lead Agent',
  'Co-Agent',
  'Referral',
  'Team Lead',
  'Manager Override',
];

export function BrokerSplitManager({ dealId, readOnly = false }: BrokerSplitManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBroker, setNewBroker] = useState({
    broker_id: '',
    commission_split_percent: 50,
    role: 'Lead Agent',
  });

  const { data: dealBrokers = [], isLoading } = useDealBrokers(dealId);
  const { addBroker, updateSplit, removeBroker } = useManageDealBrokers(dealId);

  // Fetch available broker profiles
  const { data: availableBrokers = [] } = useQuery({
    queryKey: ['broker_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broker_profiles')
        .select('*')
        .eq('broker_status', 'Active');
      if (error) throw error;
      return data || [];
    },
  });

  const totalSplit = dealBrokers.reduce(
    (sum, b) => sum + (b.commission_split_percent || 0),
    0
  );
  const isValidSplit = totalSplit === 100 || dealBrokers.length === 0;
  const remainingSplit = 100 - totalSplit;

  const handleAdd = () => {
    if (!newBroker.broker_id) return;
    
    addBroker.mutate(newBroker, {
      onSuccess: () => {
        setShowAddDialog(false);
        setNewBroker({
          broker_id: '',
          commission_split_percent: Math.max(0, remainingSplit),
          role: 'Lead Agent',
        });
      },
    });
  };

  const handleSplitChange = (id: string, value: string) => {
    const percent = parseInt(value) || 0;
    updateSplit.mutate({ id, commission_split_percent: percent });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Broker Commission Splits</CardTitle>
          </div>
          {!readOnly && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Broker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Broker to Deal</DialogTitle>
                  <DialogDescription>
                    Assign a broker and their commission split percentage
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Broker</Label>
                    <Select
                      value={newBroker.broker_id}
                      onValueChange={(value) => setNewBroker({ ...newBroker, broker_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBrokers.map((broker) => (
                          <SelectItem key={broker.id} value={broker.id}>
                            {broker.broker_id} - {broker.personal_license_no || 'No License'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newBroker.role}
                      onValueChange={(value) => setNewBroker({ ...newBroker, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BROKER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Commission Split (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newBroker.commission_split_percent}
                        onChange={(e) =>
                          setNewBroker({
                            ...newBroker,
                            commission_split_percent: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      {remainingSplit > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setNewBroker({ ...newBroker, commission_split_percent: remainingSplit })
                          }
                        >
                          Use {remainingSplit}%
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={!newBroker.broker_id || addBroker.isPending}>
                    {addBroker.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Broker
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Split Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Allocation</span>
            <div className="flex items-center gap-2">
              {isValidSplit ? (
                <Badge variant="outline" className="border-emerald text-emerald">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {totalSplit}%
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {totalSplit}%
                </Badge>
              )}
            </div>
          </div>
          <Progress
            value={totalSplit}
            className={cn('h-2', totalSplit > 100 && 'bg-destructive/20')}
          />
          {!isValidSplit && (
            <p className="text-xs text-destructive">
              {totalSplit < 100
                ? `${100 - totalSplit}% remaining to allocate`
                : `${totalSplit - 100}% over-allocated`}
            </p>
          )}
        </div>

        {/* Broker List */}
        {dealBrokers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No brokers assigned</p>
            {!readOnly && (
              <p className="text-xs">Add brokers to define commission splits</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {dealBrokers.map((broker: any) => (
              <div
                key={broker.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {broker.broker_profiles?.broker_id || broker.broker_id.slice(0, 8)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {broker.role || 'Agent'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {readOnly ? (
                    <Badge variant="outline" className="font-mono">
                      {broker.commission_split_percent || 0}%
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={broker.commission_split_percent || 0}
                        onChange={(e) => handleSplitChange(broker.id, e.target.value)}
                        className="w-20 h-8 text-sm font-mono"
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeBroker.mutate(broker.id)}
                      disabled={removeBroker.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
