import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatAed } from '@/lib/money';
import { yearlyAggregate, type YearlyRow } from '@/lib/mortgageEngine';
import { ChevronDown, Download } from 'lucide-react';

type ScheduleRow = { month: number; interest: number; principal: number; balance: number; paymentTotal: number };

type Props = {
  schedule: ScheduleRow[];
};

function exportCsv(rows: YearlyRow[]) {
  const header = 'Year,Opening Balance,Total Paid,Interest,Principal,Closing Balance\n';
  const body = rows.map(r => `${r.year},${r.openingBalance.toFixed(2)},${r.totalPaid.toFixed(2)},${r.totalInterest.toFixed(2)},${r.totalPrincipal.toFixed(2)},${r.closingBalance.toFixed(2)}`).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'amortization-schedule.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function AmortizationScheduleTable({ schedule }: Props) {
  const [open, setOpen] = useState(false);
  const yearly = useMemo(() => yearlyAggregate(schedule), [schedule]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-base font-semibold hover:text-primary transition-colors">
                Yearly Schedule
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <Button variant="outline" size="sm" onClick={() => exportCsv(yearly)}>
              <Download className="w-3 h-3 mr-1" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Year</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearly.map(row => (
                    <TableRow key={row.year}>
                      <TableCell className="font-medium">{row.year}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatAed(row.openingBalance)}</TableCell>
                      <TableCell className="text-right">{formatAed(row.totalPaid)}</TableCell>
                      <TableCell className="text-right text-destructive">{formatAed(row.totalInterest)}</TableCell>
                      <TableCell className="text-right text-green-500">{formatAed(row.totalPrincipal)}</TableCell>
                      <TableCell className="text-right font-medium">{formatAed(row.closingBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
