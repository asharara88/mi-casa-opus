import { useState } from 'react';
import { useLeads, useUpdateLead, useCreateLead, Lead } from '@/hooks/useLeads';
import { useLeadToDealConversion } from '@/hooks/useLeadToDealConversion';
import { usePortalInquiryStats } from '@/hooks/usePortalInquiries';
import { LeadPipeline } from './LeadPipeline';
import { LeadDetail } from './LeadDetail';
import { AddLeadModal } from './AddLeadModal';
import { ConvertToDealModal } from './ConvertToDealModal';
import { PortalInquiriesPanel } from './PortalInquiriesPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, LayoutGrid, List, Loader2, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { LostReasonModal, LostReason } from '@/components/modals/LostReasonModal';
import { NextActionModal } from '@/components/modals/NextActionModal';
import { DealPipeline } from '@/types/pipeline';

type LeadState = Database['public']['Enums']['lead_state'];
type NextActionType = Database['public']['Enums']['next_action_type'];

// Transform DB lead to component Lead format
function transformLead(dbLead: Lead) {
  return {
    lead_id: dbLead.lead_id,
    source: dbLead.source,
    contact_identity: {
      full_name: dbLead.contact_name,
      email: dbLead.contact_email || '',
      phone: dbLead.contact_phone || '',
    },
    lead_state: dbLead.lead_state,
    assigned_broker_id: dbLead.assigned_broker_id,
    consents: (dbLead.consents as any[]) || [],
    notes: dbLead.notes || '',
    created_at: dbLead.created_at,
    updated_at: dbLead.updated_at,
    requirements: (dbLead.qualification_data as any) || undefined,
    id: dbLead.id,
    next_action: dbLead.next_action,
    next_action_due: dbLead.next_action_due,
    next_action_owner: dbLead.next_action_owner,
  };
}

export function LeadsSection() {
  const { data: dbLeads, isLoading, error } = useLeads();
  const { data: inquiryStats } = usePortalInquiryStats();
  const updateLead = useUpdateLead();
  const createLead = useCreateLead();
  const convertLeadToDeal = useLeadToDealConversion();
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<LeadState | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'leads' | 'inquiries'>('leads');
  
  // Add lead modal state
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Convert to deal modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState<ReturnType<typeof transformLead> | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  
  // Lost reason modal state
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLostLead, setPendingLostLead] = useState<ReturnType<typeof transformLead> | null>(null);
  
  // Next action modal state
  const [nextActionModalOpen, setNextActionModalOpen] = useState(false);
  const [pendingNextActionLead, setPendingNextActionLead] = useState<ReturnType<typeof transformLead> | null>(null);

  const leads = dbLeads?.map(transformLead) || [];
  const selectedLead = selectedLeadId ? leads.find(l => l.id === selectedLeadId) : null;

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contact_identity.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_identity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lead_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = stateFilter === 'all' || lead.lead_state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  const handleLeadClick = (lead: ReturnType<typeof transformLead>) => {
    setSelectedLeadId(lead.id);
  };

  const handleLeadUpdate = async (updatedLead: ReturnType<typeof transformLead>) => {
    await updateLead.mutateAsync({
      id: updatedLead.id,
      updates: {
        lead_state: updatedLead.lead_state as LeadState,
        notes: updatedLead.notes,
        qualification_data: updatedLead.requirements,
      },
    });
  };

  const handleTransition = async (lead: ReturnType<typeof transformLead>, targetState: LeadState) => {
    // If transitioning to Disqualified, show the lost reason modal
    if (targetState === 'Disqualified') {
      setPendingLostLead(lead);
      setLostModalOpen(true);
      return;
    }

    try {
      await updateLead.mutateAsync({
        id: lead.id,
        updates: { lead_state: targetState },
      });
      toast.success(`Lead transitioned to ${targetState}`);
    } catch (error) {
      toast.error('Transition failed');
    }
  };

  const handleDragTransition = async (leadId: string, targetState: LeadState) => {
    // If transitioning to Disqualified, show the lost reason modal
    if (targetState === 'Disqualified') {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setPendingLostLead(lead);
        setLostModalOpen(true);
      }
      return;
    }

    try {
      await updateLead.mutateAsync({
        id: leadId,
        updates: { lead_state: targetState },
      });
      toast.success(`Lead moved to ${targetState}`);
    } catch (error) {
      toast.error('Failed to move lead');
    }
  };

  const handleLostConfirm = async (reason: LostReason, notes: string) => {
    if (!pendingLostLead) return;

    try {
      await updateLead.mutateAsync({
        id: pendingLostLead.id,
        updates: {
          lead_state: 'Disqualified' as LeadState,
          lost_reason: reason,
          lost_reason_notes: notes || null,
          lost_at: new Date().toISOString(),
        },
      });
      toast.success('Lead marked as disqualified');
      setPendingLostLead(null);
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleSetNextAction = (lead: ReturnType<typeof transformLead>) => {
    setPendingNextActionLead(lead);
    setNextActionModalOpen(true);
  };

  const handleNextActionConfirm = async (action: NextActionType, dueDate: Date) => {
    if (!pendingNextActionLead) return;

    try {
      await updateLead.mutateAsync({
        id: pendingNextActionLead.id,
        updates: {
          next_action: action,
          next_action_due: dueDate.toISOString(),
        },
      });
      toast.success('Next action set');
      setPendingNextActionLead(null);
    } catch (error) {
      toast.error('Failed to set next action');
    }
  };

  // Open convert modal for qualified leads
  const handleConvertToDeal = (lead: ReturnType<typeof transformLead>) => {
    setConvertingLead(lead);
    setShowConvertModal(true);
  };

  // Process the actual conversion using the dedicated hook
  const handleConversionConfirm = async (config: {
    pipeline: DealPipeline;
    dealType: 'Sale' | 'Rent';
    side: 'Buy' | 'Sell';
    developerId?: string;
    developerProjectId?: string;
    developerProjectName?: string;
    transactionValue?: number;
    commissionPercent?: number;
  }) => {
    if (!convertingLead) return;
    
    setIsConverting(true);
    try {
      // Use the dedicated conversion hook with full data mapping
      await convertLeadToDeal.mutateAsync({
        lead: {
          id: convertingLead.id,
          lead_id: convertingLead.lead_id,
          contact_name: convertingLead.contact_identity.full_name,
          contact_email: convertingLead.contact_identity.email,
          contact_phone: convertingLead.contact_identity.phone,
          source: convertingLead.source,
          notes: convertingLead.notes,
          qualification_data: convertingLead.requirements,
        },
        config: {
          pipeline: config.pipeline,
          dealType: config.dealType,
          side: config.side,
          developerId: config.developerId,
          developerProjectId: config.developerProjectId,
          developerProjectName: config.developerProjectName,
          transactionValue: config.transactionValue,
          commissionPercent: config.commissionPercent,
        },
      });

      setSelectedLeadId(null);
      setShowConvertModal(false);
      setConvertingLead(null);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <p>Error loading leads: {error.message}</p>
      </div>
    );
  }

  // Detail view
  if (selectedLead) {
    return (
      <LeadDetail
        lead={selectedLead as any}
        onBack={() => setSelectedLeadId(null)}
        onUpdate={handleLeadUpdate as any}
        onConvertToDeal={handleConvertToDeal as any}
      />
    );
  }

  // List view with tabs
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {leads.length} total • {leads.filter(l => l.lead_state === 'New').length} new
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm" className="shrink-0 h-10 sm:h-9">
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'leads' | 'inquiries')}>
        <TabsList>
          <TabsTrigger value="leads">Pipeline</TabsTrigger>
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Portal Inquiries
            {inquiryStats?.unprocessed ? (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {inquiryStats.unprocessed}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 sm:h-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as LeadState | 'all')}>
                <SelectTrigger className="w-full sm:w-40 h-11 sm:h-9">
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
              <div className="hidden sm:flex items-center border rounded-lg">
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
          </div>

          {/* Pipeline View */}
          {viewMode === 'pipeline' && (
            <LeadPipeline
              leads={filteredLeads as any}
              onLeadClick={handleLeadClick as any}
              onTransition={handleTransition as any}
              onDragTransition={handleDragTransition}
              onSetNextAction={handleSetNextAction as any}
            />
          )}

          {viewMode === 'list' && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Lead</th>
                    <th className="text-left p-3 text-sm font-medium">Contact</th>
                    <th className="text-left p-3 text-sm font-medium">Source</th>
                    <th className="text-left p-3 text-sm font-medium">State</th>
                    <th className="text-left p-3 text-sm font-medium">Next Action</th>
                    <th className="text-left p-3 text-sm font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
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
                            lead.lead_state === 'New' ? 'bg-primary/20 text-primary' :
                            lead.lead_state === 'Contacted' ? 'bg-accent/50 text-accent-foreground' :
                            lead.lead_state === 'Qualified' ? 'bg-primary/20 text-primary' :
                            lead.lead_state === 'Converted' ? 'bg-primary/30 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {lead.lead_state}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          {lead.next_action ? (
                            <span className="text-xs">{lead.next_action}</span>
                          ) : (
                            <span className="text-xs text-destructive">No action</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-4">
          <PortalInquiriesPanel />
        </TabsContent>
      </Tabs>

      {/* Lost Reason Modal */}
      <LostReasonModal
        open={lostModalOpen}
        onOpenChange={setLostModalOpen}
        entityType="Lead"
        entityName={pendingLostLead?.contact_identity.full_name || ''}
        onConfirm={handleLostConfirm}
      />

      {/* Next Action Modal */}
      <NextActionModal
        open={nextActionModalOpen}
        onOpenChange={setNextActionModalOpen}
        entityType="Lead"
        entityName={pendingNextActionLead?.contact_identity.full_name || ''}
        currentAction={pendingNextActionLead?.next_action}
        currentDueDate={pendingNextActionLead?.next_action_due}
        onConfirm={handleNextActionConfirm}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={async (data) => {
          await createLead.mutateAsync(data);
          setShowAddModal(false);
        }}
        isLoading={createLead.isPending}
      />

      {/* Convert to Deal Modal */}
      <ConvertToDealModal
        open={showConvertModal}
        onOpenChange={setShowConvertModal}
        leadName={convertingLead?.contact_identity.full_name || ''}
        leadRequirements={convertingLead?.requirements}
        onConfirm={handleConversionConfirm}
        isLoading={isConverting}
      />
    </div>
  );
}
