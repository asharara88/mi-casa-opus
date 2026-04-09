import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Search, Filter, Download, Plus } from 'lucide-react';
import { CommissionLedgerRow } from './CommissionLedgerRow';

interface CommissionRecord {
  id: string;
  commission_id: string;
  deal_id: string;
  broker_id: string;
  broker_name?: string;
  deal_reference?: string;
  status: 'Expected' | 'Received' | 'Allocated' | 'PaidOut';
  gross_amount: number;
  net_amount: number;
  split_percent: number;
  calculation_trace: Record<string, any>;
  created_at: string;
}

interface CommissionLedgerProps {
  commissions: CommissionRecord[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  selectable?: boolean;
}

export const CommissionLedger: React.FC<CommissionLedgerProps> = ({
  commissions,
  selectedIds,
  onSelectionChange,
  selectable = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch =
      commission.commission_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.broker_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.deal_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleSelectAll = () => {
    const selectableCommissions = filteredCommissions.filter(c => c.status !== 'PaidOut');
    if (selectedIds.length === selectableCommissions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(selectableCommissions.map(c => c.id));
    }
  };

  const totalGross = filteredCommissions.reduce((sum, c) => sum + c.gross_amount, 0);
  const totalNet = filteredCommissions.reduce((sum, c) => sum + c.net_amount, 0);
  const selectedTotal = commissions
    .filter(c => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.net_amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Commission Ledger</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredCommissions.length} records • Total Net: {formatCurrency(totalNet)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectable && selectedIds.length > 0 && (
              <Badge variant="secondary" className="mr-2">
                {selectedIds.length} selected • {formatCurrency(selectedTotal)}
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by commission ID, broker, or deal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Expected">Expected</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Allocated">Allocated</SelectItem>
              <SelectItem value="PaidOut">Paid Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {selectable && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredCommissions.filter(c => c.status !== 'PaidOut').length && selectedIds.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-input"
                    />
                  </TableHead>
                )}
                <TableHead>Commission ID</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-center">Split</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <CommissionLedgerRow
                  key={commission.id}
                  commission={commission}
                  isSelected={selectedIds.includes(commission.id)}
                  onSelect={handleSelect}
                  selectable={selectable}
                />
              ))}
              {filteredCommissions.length === 0 && (
                <TableRow>
                  <td colSpan={selectable ? 10 : 9} className="text-center py-8 text-muted-foreground">
                    No commission records found
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Row */}
        <div className="mt-4 flex items-center justify-end gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Gross:</span>
            <span className="font-mono font-medium">{formatCurrency(totalGross)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Net:</span>
            <span className="font-mono font-medium text-primary">{formatCurrency(totalNet)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
