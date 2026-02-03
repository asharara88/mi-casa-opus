import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types based on database schema
export interface PropertyToken {
  id: string;
  token_id: string;
  property_id: string;
  listing_id: string | null;
  deal_id: string | null;
  token_name: string;
  token_symbol: string;
  total_supply: number;
  decimals: number;
  property_valuation: number;
  token_price: number;
  currency: string;
  chain_network: string;
  contract_address: string | null;
  deployment_tx_hash: string | null;
  status: 'Draft' | 'Minted' | 'Active' | 'Frozen' | 'Burned';
  kyc_required: boolean;
  accredited_only: boolean;
  minimum_investment: number;
  property_type: string | null;
  location: string | null;
  legal_structure: string;
  regulatory_jurisdiction: string;
  created_at: string;
  updated_at: string;
  minted_at: string | null;
  created_by: string | null;
}

export interface TokenOwnership {
  id: string;
  token_id: string;
  owner_type: string;
  owner_name: string;
  owner_email: string | null;
  owner_wallet_address: string | null;
  kyc_verified: boolean;
  token_balance: number;
  ownership_percentage: number;
  invested_amount: number;
  average_cost_basis: number | null;
  is_active: boolean;
  frozen_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEscrow {
  id: string;
  escrow_id: string;
  deal_id: string | null;
  property_token_id: string | null;
  document_instance_id: string | null;
  payer_name: string;
  payer_email: string | null;
  payee_name: string;
  payee_email: string | null;
  total_amount: number;
  funded_amount: number;
  released_amount: number;
  currency: string;
  payment_type: string;
  payment_reference: string | null;
  bank_reference: string | null;
  status: 'Created' | 'Funded' | 'PartiallyFunded' | 'Released' | 'Refunded' | 'Disputed';
  release_conditions: unknown[];
  conditions_met: unknown[];
  due_date: string | null;
  funded_at: string | null;
  released_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface SmartContract {
  id: string;
  contract_id: string;
  contract_type: string;
  contract_name: string;
  version: string;
  deal_id: string | null;
  listing_id: string | null;
  property_token_id: string | null;
  document_instance_id: string | null;
  template_id: string | null;
  parties: Array<{
    role: string;
    name: string;
    email: string;
    wallet_address?: string;
    signed?: boolean;
    signed_at?: string;
  }>;
  contract_terms: Record<string, unknown>;
  clauses: Array<{
    id: string;
    title: string;
    content: string;
    required: boolean;
  }>;
  status: 'Draft' | 'Pending' | 'Executed' | 'Voided' | 'Expired';
  execution_method: string;
  content_hash: string | null;
  blockchain_tx_hash: string | null;
  ipfs_cid: string | null;
  docusign_envelope_id: string | null;
  all_signed: boolean;
  executed_at: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ContractEvent {
  id: string;
  event_id: string;
  contract_id: string;
  escrow_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  actor_type: string | null;
  actor_id: string | null;
  actor_name: string | null;
  event_hash: string;
  prev_event_hash: string | null;
  timestamp: string;
}

// Generate SHA-256 hash (browser-compatible)
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate unique IDs
function generateTokenId(): string {
  return `TKN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function generateContractId(): string {
  return `CTR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function generateEscrowId(): string {
  return `ESC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function generateEventId(): string {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ============================================
// PROPERTY TOKENS HOOKS
// ============================================

export function usePropertyTokens() {
  return useQuery({
    queryKey: ['property-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PropertyToken[];
    },
  });
}

export function usePropertyToken(tokenId: string) {
  return useQuery({
    queryKey: ['property-token', tokenId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_tokens')
        .select('*')
        .eq('id', tokenId)
        .single();

      if (error) throw error;
      return data as PropertyToken;
    },
    enabled: !!tokenId,
  });
}

export function useCreatePropertyToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      property_id: string;
      token_name: string;
      token_symbol: string;
      property_valuation: number;
      total_supply?: number;
      listing_id?: string;
      deal_id?: string;
      property_type?: string;
      location?: string;
      minimum_investment?: number;
    }) => {
      const tokenId = generateTokenId();
      
      const { data, error } = await supabase
        .from('property_tokens')
        .insert({
          token_id: tokenId,
          property_id: params.property_id,
          token_name: params.token_name,
          token_symbol: params.token_symbol,
          property_valuation: params.property_valuation,
          total_supply: params.total_supply || 1000000,
          listing_id: params.listing_id || null,
          deal_id: params.deal_id || null,
          property_type: params.property_type || null,
          location: params.location || null,
          minimum_investment: params.minimum_investment || 10000,
          status: 'Draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data as PropertyToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-tokens'] });
      toast.success('Property token created', {
        description: 'Token is in draft status. Mint to activate.',
      });
    },
    onError: (error) => {
      toast.error('Failed to create token', {
        description: error.message,
      });
    },
  });
}

export function useMintPropertyToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      // Simulate blockchain deployment
      const mockContractAddress = `0x${Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      
      const mockTxHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      const { data, error } = await supabase
        .from('property_tokens')
        .update({
          status: 'Minted',
          contract_address: mockContractAddress,
          deployment_tx_hash: mockTxHash,
          minted_at: new Date().toISOString(),
        })
        .eq('id', tokenId)
        .select()
        .single();

      if (error) throw error;
      return data as PropertyToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-tokens'] });
      toast.success('Token minted successfully', {
        description: 'Demo mode: Simulated blockchain deployment',
      });
    },
    onError: (error) => {
      toast.error('Failed to mint token', {
        description: error.message,
      });
    },
  });
}

// ============================================
// TOKEN OWNERSHIP HOOKS
// ============================================

export function useTokenOwnership(tokenId: string) {
  return useQuery({
    queryKey: ['token-ownership', tokenId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('token_ownership')
        .select('*')
        .eq('token_id', tokenId)
        .order('token_balance', { ascending: false });

      if (error) throw error;
      return (data || []) as TokenOwnership[];
    },
    enabled: !!tokenId,
  });
}

export function useAddTokenHolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      token_id: string;
      owner_name: string;
      owner_email: string;
      owner_type?: string;
      token_balance: number;
      invested_amount: number;
    }) => {
      const { data, error } = await supabase
        .from('token_ownership')
        .insert({
          token_id: params.token_id,
          owner_name: params.owner_name,
          owner_email: params.owner_email,
          owner_type: params.owner_type || 'individual',
          token_balance: params.token_balance,
          invested_amount: params.invested_amount,
          average_cost_basis: params.invested_amount / params.token_balance,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TokenOwnership;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['token-ownership', variables.token_id] });
      toast.success('Token holder added');
    },
    onError: (error) => {
      toast.error('Failed to add holder', {
        description: error.message,
      });
    },
  });
}

// ============================================
// PAYMENT ESCROW HOOKS
// ============================================

export function usePaymentEscrows(dealId?: string) {
  return useQuery({
    queryKey: ['payment-escrows', dealId],
    queryFn: async () => {
      let query = supabase
        .from('payment_escrow')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PaymentEscrow[];
    },
  });
}

export function useCreateEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      deal_id?: string;
      property_token_id?: string;
      payer_name: string;
      payer_email?: string;
      payee_name: string;
      payee_email?: string;
      total_amount: number;
      payment_type: string;
      due_date?: string;
      release_conditions?: unknown[];
    }) => {
      const escrowId = generateEscrowId();

      const { data, error } = await supabase
        .from('payment_escrow')
        .insert([{
          escrow_id: escrowId,
          deal_id: params.deal_id || null,
          property_token_id: params.property_token_id || null,
          payer_name: params.payer_name,
          payer_email: params.payer_email || null,
          payee_name: params.payee_name,
          payee_email: params.payee_email || null,
          total_amount: params.total_amount,
          payment_type: params.payment_type,
          due_date: params.due_date || null,
          release_conditions: (params.release_conditions || []) as unknown as null,
          status: 'Created' as const,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as PaymentEscrow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-escrows'] });
      if (variables.deal_id) {
        queryClient.invalidateQueries({ queryKey: ['payment-escrows', variables.deal_id] });
      }
      toast.success('Escrow created', {
        description: 'Payment escrow is ready for funding',
      });
    },
    onError: (error) => {
      toast.error('Failed to create escrow', {
        description: error.message,
      });
    },
  });
}

export function useFundEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { escrowId: string; amount: number; reference?: string }) => {
      // Get current escrow
      const { data: escrow, error: fetchError } = await supabase
        .from('payment_escrow')
        .select('*')
        .eq('id', params.escrowId)
        .single();

      if (fetchError) throw fetchError;

      const newFundedAmount = (escrow.funded_amount || 0) + params.amount;
      const newStatus = newFundedAmount >= escrow.total_amount ? 'Funded' : 'PartiallyFunded';

      const { data, error } = await supabase
        .from('payment_escrow')
        .update({
          funded_amount: newFundedAmount,
          status: newStatus,
          bank_reference: params.reference || null,
          funded_at: newStatus === 'Funded' ? new Date().toISOString() : null,
        })
        .eq('id', params.escrowId)
        .select()
        .single();

      if (error) throw error;
      return data as PaymentEscrow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-escrows'] });
      toast.success('Escrow funded');
    },
    onError: (error) => {
      toast.error('Failed to fund escrow', {
        description: error.message,
      });
    },
  });
}

export function useReleaseEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escrowId: string) => {
      const { data: escrow, error: fetchError } = await supabase
        .from('payment_escrow')
        .select('*')
        .eq('id', escrowId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('payment_escrow')
        .update({
          status: 'Released',
          released_amount: escrow.funded_amount,
          released_at: new Date().toISOString(),
        })
        .eq('id', escrowId)
        .select()
        .single();

      if (error) throw error;
      return data as PaymentEscrow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-escrows'] });
      toast.success('Escrow released', {
        description: 'Funds have been released to payee',
      });
    },
    onError: (error) => {
      toast.error('Failed to release escrow', {
        description: error.message,
      });
    },
  });
}

// ============================================
// SMART CONTRACTS HOOKS
// ============================================

export function useSmartContracts(dealId?: string) {
  return useQuery({
    queryKey: ['smart-contracts', dealId],
    queryFn: async () => {
      let query = supabase
        .from('smart_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SmartContract[];
    },
  });
}

export function useSmartContract(contractId: string) {
  return useQuery({
    queryKey: ['smart-contract', contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;
      return data as SmartContract;
    },
    enabled: !!contractId,
  });
}

export function useCreateSmartContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contract_type: string;
      contract_name: string;
      deal_id?: string;
      listing_id?: string;
      property_token_id?: string;
      template_id?: string;
      parties: SmartContract['parties'];
      contract_terms?: Record<string, unknown>;
      clauses?: SmartContract['clauses'];
      effective_date?: string;
      expiry_date?: string;
    }) => {
      const contractId = generateContractId();
      
      // Generate content hash
      const contentToHash = JSON.stringify({
        contract_type: params.contract_type,
        parties: params.parties,
        terms: params.contract_terms,
        clauses: params.clauses,
        timestamp: new Date().toISOString(),
      });
      const contentHash = await generateHash(contentToHash);

      const { data, error } = await supabase
        .from('smart_contracts')
        .insert([{
          contract_id: contractId,
          contract_type: params.contract_type,
          contract_name: params.contract_name,
          deal_id: params.deal_id || null,
          listing_id: params.listing_id || null,
          property_token_id: params.property_token_id || null,
          template_id: params.template_id || null,
          parties: params.parties as unknown as null,
          contract_terms: (params.contract_terms || {}) as unknown as null,
          clauses: (params.clauses || []) as unknown as null,
          content_hash: contentHash,
          effective_date: params.effective_date || null,
          expiry_date: params.expiry_date || null,
          status: 'Draft' as const,
        }])
        .select()
        .single();

      if (error) throw error;

      // Create initial contract event
      const contract = data as SmartContract;
      await createContractEvent(contract.id, 'created', {
        contract_type: params.contract_type,
        parties_count: params.parties.length,
      });

      return contract;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['smart-contracts'] });
      if (variables.deal_id) {
        queryClient.invalidateQueries({ queryKey: ['smart-contracts', variables.deal_id] });
      }
      toast.success('Smart contract created', {
        description: 'Contract is ready for signatures',
      });
    },
    onError: (error) => {
      toast.error('Failed to create contract', {
        description: error.message,
      });
    },
  });
}

export function useSendContractForSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) => {
      // Get contract
      const { data: contract, error: fetchError } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (fetchError) throw fetchError;

      // Generate mock DocuSign envelope ID
      const mockEnvelopeId = `ENV-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const { data, error } = await supabase
        .from('smart_contracts')
        .update({
          status: 'Pending',
          docusign_envelope_id: mockEnvelopeId,
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;

      // Create event
      await createContractEvent(contractId, 'sent_for_signature', {
        envelope_id: mockEnvelopeId,
        signers: (contract.parties as SmartContract['parties']).map(p => p.email),
      });

      return data as SmartContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-contracts'] });
      toast.success('Contract sent for signature', {
        description: 'Demo mode: Signature requests simulated',
      });
    },
    onError: (error) => {
      toast.error('Failed to send for signature', {
        description: error.message,
      });
    },
  });
}

export function useSimulateSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { contractId: string; signerEmail: string }) => {
      // Get contract
      const { data: contract, error: fetchError } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('id', params.contractId)
        .single();

      if (fetchError) throw fetchError;

      // Update signer status
      const parties = (contract.parties as SmartContract['parties']).map(p => {
        if (p.email === params.signerEmail) {
          return { ...p, signed: true, signed_at: new Date().toISOString() };
        }
        return p;
      });

      const allSigned = parties.every(p => p.signed);

      const { data, error } = await supabase
        .from('smart_contracts')
        .update({
          parties,
          all_signed: allSigned,
          status: allSigned ? 'Executed' : 'Pending',
          executed_at: allSigned ? new Date().toISOString() : null,
        })
        .eq('id', params.contractId)
        .select()
        .single();

      if (error) throw error;

      // Create event
      await createContractEvent(params.contractId, 'signed', {
        signer_email: params.signerEmail,
        all_signed: allSigned,
      });

      if (allSigned) {
        await createContractEvent(params.contractId, 'executed', {
          executed_at: new Date().toISOString(),
        });
      }

      return data as SmartContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-contracts'] });
      toast.success('Signature recorded');
    },
    onError: (error) => {
      toast.error('Failed to record signature', {
        description: error.message,
      });
    },
  });
}

// ============================================
// CONTRACT EVENTS
// ============================================

export function useContractEvents(contractId: string) {
  return useQuery({
    queryKey: ['contract-events', contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_events')
        .select('*')
        .eq('contract_id', contractId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return (data || []) as ContractEvent[];
    },
    enabled: !!contractId,
  });
}

async function createContractEvent(
  contractId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  // Get previous event hash
  const { data: prevEvents } = await supabase
    .from('contract_events')
    .select('event_hash')
    .eq('contract_id', contractId)
    .order('timestamp', { ascending: false })
    .limit(1);

  const prevHash = prevEvents?.[0]?.event_hash || 'GENESIS';
  const timestamp = new Date().toISOString();

  // Generate event hash
  const eventHash = await generateHash(
    JSON.stringify({ eventType, eventData, prevHash, timestamp })
  );

  await supabase.from('contract_events').insert([{
    event_id: generateEventId(),
    contract_id: contractId,
    event_type: eventType,
    event_data: eventData as unknown as null,
    event_hash: eventHash,
    prev_event_hash: prevHash === 'GENESIS' ? null : prevHash,
    actor_type: 'user',
  }]);
}

// ============================================
// DASHBOARD STATS
// ============================================

export function useSmartContractStats() {
  return useQuery({
    queryKey: ['smart-contract-stats'],
    queryFn: async () => {
      const [tokensRes, contractsRes, escrowRes] = await Promise.all([
        supabase.from('property_tokens').select('id, status, property_valuation'),
        supabase.from('smart_contracts').select('id, status'),
        supabase.from('payment_escrow').select('id, status, total_amount, funded_amount'),
      ]);

      const tokens = (tokensRes.data || []) as PropertyToken[];
      const contracts = (contractsRes.data || []) as SmartContract[];
      const escrows = (escrowRes.data || []) as PaymentEscrow[];

      return {
        tokens: {
          total: tokens.length,
          minted: tokens.filter(t => t.status === 'Minted' || t.status === 'Active').length,
          totalValuation: tokens.reduce((sum, t) => sum + (t.property_valuation || 0), 0),
        },
        contracts: {
          total: contracts.length,
          draft: contracts.filter(c => c.status === 'Draft').length,
          pending: contracts.filter(c => c.status === 'Pending').length,
          executed: contracts.filter(c => c.status === 'Executed').length,
        },
        escrows: {
          total: escrows.length,
          totalValue: escrows.reduce((sum, e) => sum + (e.total_amount || 0), 0),
          funded: escrows.reduce((sum, e) => sum + (e.funded_amount || 0), 0),
          released: escrows.filter(e => e.status === 'Released').length,
        },
      };
    },
  });
}
