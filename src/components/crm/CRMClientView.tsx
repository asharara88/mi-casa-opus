import { useExternalClients, useExternalClientPortfolio, formatCRMPrice } from '@/hooks/useMiCasaCRM';
import { Building2, CheckCircle2, DollarSign, Home } from 'lucide-react';

export function CRMClientView() {
  const { data: clients, isLoading } = useExternalClients();
  const client = clients?.[0]; // Makarem LLC
  const { data: portfolio } = useExternalClientPortfolio(client?.id || null);

  if (isLoading) {
    return <div className="h-40 rounded-xl bg-muted animate-pulse" />;
  }

  if (!client) {
    return <p className="text-sm text-muted-foreground">No client data found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Client info */}
      <div className="rounded-lg border border-border p-5 space-y-2">
        <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
        {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {client.phone && <span>📞 {client.phone}</span>}
          {client.email && <span>✉️ {client.email}</span>}
          {client.type && <span className="capitalize">Type: {client.type}</span>}
        </div>
      </div>

      {/* Portfolio stats */}
      {portfolio && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<Building2 className="w-5 h-5 text-primary" />} label="Total Listings" value={portfolio.total.toString()} />
          <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} label="Available" value={portfolio.available.toString()} />
          <StatCard icon={<Home className="w-5 h-5 text-cyan-400" />} label="Total Rental Value" value={formatCRMPrice(portfolio.totalRentalValue, 'rent')} />
          <StatCard icon={<DollarSign className="w-5 h-5 text-amber-400" />} label="Total Sale Value" value={formatCRMPrice(portfolio.totalSaleValue, 'sale')} />
        </div>
      )}

      {/* Client notes */}
      {client.notes && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4 flex items-start gap-3">
      {icon}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
