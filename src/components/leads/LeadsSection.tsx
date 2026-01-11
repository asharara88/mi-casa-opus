import { useState } from 'react';
import { Lead, LeadState } from '@/types/bos';
import { LeadPipeline } from './LeadPipeline';
import { LeadDetail } from './LeadDetail';
import { transitionLeadState } from '@/lib/state-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

// Demo data
const DEMO_LEADS: Lead[] = [
  {
    lead_id: 'LEAD-001',
    source: 'Website',
    contact_identity: {
      full_name: 'Ahmed Al Maktoum',
      email: 'ahmed@example.com',
      phone: '+971 50 123 4567',
      nationality: 'UAE',
    },
    lead_state: 'New',
    assigned_broker_id: null,
    consents: [],
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    lead_id: 'LEAD-002',
    source: 'Referral',
    contact_identity: {
      full_name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+971 55 987 6543',
      nationality: 'UK',
    },
    lead_state: 'Contacted',
    assigned_broker_id: 'BRK-001',
    consents: [],
    notes: 'Looking for investment property in Saadiyat',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    lead_id: 'LEAD-003',
    source: 'Portal',
    contact_identity: {
      full_name: 'Michael Chen',
      email: 'm.chen@example.com',
      phone: '+971 50 555 1234',
      nationality: 'Singapore',
    },
    lead_state: 'Qualified',
    assigned_broker_id: 'BRK-002',
    consents: [
      { consent_type: 'DataProcessing', granted: true, granted_at: new Date().toISOString(), version: 1 },
      { consent_type: 'Marketing', granted: true, granted_at: new Date().toISOString(), version: 1 },
    ],
    requirements: {
      budget_min: 2000000,
      budget_max: 5000000,
      property_types: ['Villa', 'Townhouse'],
      locations: ['Saadiyat Island', 'Yas Island'],
      bedrooms_min: 3,
    },
    notes: 'High net worth investor, looking for family home',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    lead_id: 'LEAD-004',
    source: 'WalkIn',
    contact_identity: {
      full_name: 'Fatima Al Rashid',
      email: 'fatima.r@example.com',
      phone: '+971 52 444 9999',
    },
    lead_state: 'New',
    assigned_broker_id: null,
    consents: [],
    notes: '',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function LeadsSection() {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<LeadState | 'all'>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contact_identity.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_identity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lead_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = stateFilter === 'all' || lead.lead_state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(leads.map(l => l.lead_id === updatedLead.lead_id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };

  const handleTransition = (lead: Lead, targetState: LeadState) => {
    const result = transitionLeadState(
      lead,
      targetState,
      'current-user-id',
      'Operator'
    );

    if (result.success && result.lead) {
      handleLeadUpdate(result.lead);
      toast.success(`Lead transitioned to ${targetState}`);
    } else {
      toast.error('Transition blocked', {
        description: result.eventLog.block_reasons[0],
      });
    }
  };

  const handleConvertToDeal = (lead: Lead) => {
    toast.success('Deal created from lead', {
      description: `Lead ${lead.lead_id} converted to deal`,
    });
    // Would navigate to deal creation with lead data
  };

  // Detail view
  if (selectedLead) {
    return (
      <LeadDetail
        lead={selectedLead}
        onBack={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
        onConvertToDeal={handleConvertToDeal}
      />
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage and qualify leads through the pipeline
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as LeadState | 'all')}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Disqualified">Disqualified</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('pipeline')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <LeadPipeline
          leads={filteredLeads}
          onLeadClick={handleLeadClick}
          onTransition={handleTransition}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Lead</th>
                <th className="text-left p-3 text-sm font-medium">Contact</th>
                <th className="text-left p-3 text-sm font-medium">Source</th>
                <th className="text-left p-3 text-sm font-medium">State</th>
                <th className="text-left p-3 text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.lead_id} 
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleLeadClick(lead)}
                >
                  <td className="p-3">
                    <p className="font-medium">{lead.contact_identity.full_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.lead_id}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{lead.contact_identity.phone}</p>
                    <p className="text-xs text-muted-foreground">{lead.contact_identity.email}</p>
                  </td>
                  <td className="p-3 text-sm">{lead.source}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      lead.lead_state === 'New' ? 'bg-blue-500/20 text-blue-400' :
                      lead.lead_state === 'Contacted' ? 'bg-amber-500/20 text-amber-400' :
                      lead.lead_state === 'Qualified' ? 'bg-emerald-500/20 text-emerald-400' :
                      lead.lead_state === 'Converted' ? 'bg-gold/20 text-gold' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {lead.lead_state}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
