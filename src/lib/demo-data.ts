// ============================================
// DEMO DATA FOR BOS
// ============================================

import {
  BrokerageContext,
  UserAccount,
  BrokerProfile,
  Lead,
  Deal,
  Listing,
  CommissionRecord,
} from '@/types/bos';

export const DEMO_BROKERAGE: BrokerageContext = {
  brokerage_id: 'BRK-MICASA-001',
  legal_name: 'Mi Casa Real Estate LLC',
  trade_name: 'Mi Casa Real Estate',
  license_context: [
    {
      license_no: 'CN-2847593',
      issuing_authority: 'Abu Dhabi Department of Municipalities and Transport',
      issue_date: '2023-01-15',
      expiry_date: '2026-01-14',
      license_type: 'Real Estate Brokerage',
      version: 1,
      effective_from: '2023-01-15',
    },
  ],
};

export const DEMO_USERS: UserAccount[] = [
  {
    user_id: 'USR-001',
    auth_identity: 'admin@micasa.ae',
    email: 'admin@micasa.ae',
    full_name: 'Ahmed Al Mansouri',
    role: 'Operator',
    status: 'Active',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    user_id: 'USR-002',
    auth_identity: 'owner@micasa.ae',
    email: 'owner@micasa.ae',
    full_name: 'Fatima Al Hashemi',
    role: 'LegalOwner',
    status: 'Active',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    user_id: 'USR-003',
    auth_identity: 'broker1@micasa.ae',
    email: 'broker1@micasa.ae',
    full_name: 'Omar Khalid',
    role: 'Broker',
    status: 'Active',
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    user_id: 'USR-004',
    auth_identity: 'broker2@micasa.ae',
    email: 'broker2@micasa.ae',
    full_name: 'Sara Ahmad',
    role: 'Broker',
    status: 'Active',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

export const DEMO_BROKERS: BrokerProfile[] = [
  {
    broker_id: 'BRK-AGT-001',
    user_id: 'USR-003',
    personal_license_no: 'BN-28475',
    license_validity: {
      issued: '2023-03-01',
      expires: '2025-03-01',
    },
    broker_status: 'Active',
    independent_contractor_agreement_id: 'DOC-ICA-001',
    specializations: ['Luxury Residential', 'Off-Plan'],
    created_at: '2023-03-01T00:00:00Z',
  },
  {
    broker_id: 'BRK-AGT-002',
    user_id: 'USR-004',
    personal_license_no: 'BN-29384',
    license_validity: {
      issued: '2023-06-01',
      expires: '2025-06-01',
    },
    broker_status: 'Active',
    independent_contractor_agreement_id: 'DOC-ICA-002',
    specializations: ['Commercial', 'Rentals'],
    created_at: '2023-06-01T00:00:00Z',
  },
];

export const DEMO_LISTINGS: Listing[] = [
  {
    listing_id: 'LST-001',
    property_id: 'PROP-001',
    listing_type: 'Sale',
    asking_terms: {
      price: 4500000,
      currency: 'AED',
    },
    status: 'Active',
    owner_party_id: 'PARTY-OWNER-001',
    mandate_agreement_id: 'DOC-MND-001',
    listing_attributes: {
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2850,
      property_type: 'Apartment',
      furnishing: 'Furnished',
      amenities: ['Pool', 'Gym', 'Concierge', 'Parking'],
      location: {
        community: 'Al Reem Island',
        building: 'The Gate Tower 2',
        unit_no: '2504',
        city: 'Abu Dhabi',
      },
      images: [],
      description: 'Stunning 3BR apartment with panoramic sea views in the iconic Gate Towers.',
    },
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    listing_id: 'LST-002',
    property_id: 'PROP-002',
    listing_type: 'Rent',
    asking_terms: {
      price: 180000,
      currency: 'AED',
    },
    status: 'Active',
    owner_party_id: 'PARTY-OWNER-002',
    mandate_agreement_id: 'DOC-MND-002',
    listing_attributes: {
      bedrooms: 4,
      bathrooms: 5,
      sqft: 5200,
      property_type: 'Villa',
      furnishing: 'Unfurnished',
      amenities: ['Private Pool', 'Garden', 'Maid Room', 'Driver Room'],
      location: {
        community: 'Saadiyat Island',
        city: 'Abu Dhabi',
      },
      images: [],
      description: 'Luxurious 4BR villa in prime Saadiyat location with private pool and garden.',
    },
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
  },
];

export const DEMO_LEADS: Lead[] = [
  {
    lead_id: 'LEAD-001',
    source: 'Website',
    contact_identity: {
      full_name: 'James Wilson',
      email: 'james.wilson@email.com',
      phone: '+971501234567',
      nationality: 'British',
    },
    lead_state: 'Qualified',
    assigned_broker_id: 'BRK-AGT-001',
    consents: [
      { consent_type: 'DataProcessing', granted: true, granted_at: '2024-01-05T10:00:00Z', version: 1 },
      { consent_type: 'Marketing', granted: true, granted_at: '2024-01-05T10:00:00Z', version: 1 },
    ],
    requirements: {
      budget_min: 3000000,
      budget_max: 5000000,
      property_types: ['Apartment', 'Penthouse'],
      locations: ['Al Reem Island', 'Saadiyat Island'],
      bedrooms_min: 2,
    },
    notes: 'High-net-worth individual looking for investment property. Prefers sea views.',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-12T14:30:00Z',
  },
  {
    lead_id: 'LEAD-002',
    source: 'Referral',
    contact_identity: {
      full_name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+971502345678',
    },
    lead_state: 'Contacted',
    assigned_broker_id: 'BRK-AGT-002',
    consents: [
      { consent_type: 'DataProcessing', granted: true, granted_at: '2024-01-08T09:00:00Z', version: 1 },
    ],
    notes: 'Referred by existing client. Looking for family villa.',
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-10T11:00:00Z',
  },
  {
    lead_id: 'LEAD-003',
    source: 'Portal',
    contact_identity: {
      full_name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+971503456789',
      nationality: 'Egyptian',
    },
    lead_state: 'New',
    assigned_broker_id: null,
    consents: [],
    notes: '',
    created_at: '2024-01-11T15:00:00Z',
    updated_at: '2024-01-11T15:00:00Z',
  },
];

export const DEMO_DEALS: Deal[] = [
  {
    deal_id: 'DEAL-001',
    deal_type: 'Sale',
    deal_state: 'Viewing',
    linked_lead_id: 'LEAD-001',
    property_id: 'PROP-001',
    listing_id: 'LST-001',
    side: 'Buyer',
    parties: [
      {
        party_id: 'PARTY-001',
        role: 'Buyer',
        identity: {
          full_name: 'James Wilson',
          email: 'james.wilson@email.com',
          phone: '+971501234567',
          passport_no: 'GB123456789',
        },
        added_at: '2024-01-12T10:00:00Z',
      },
    ],
    assigned_brokers: [
      {
        broker_id: 'BRK-AGT-001',
        assigned_at: '2024-01-12T10:00:00Z',
        role: 'Primary',
        commission_split_pct: 60,
      },
    ],
    deal_economics_id: 'ECON-001',
    registry_actions: [],
    currency: 'AED',
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-12T10:00:00Z',
  },
];

export const DEMO_COMMISSIONS: CommissionRecord[] = [
  {
    commission_id: 'COMM-001',
    deal_id: 'DEAL-001',
    broker_id: 'BRK-AGT-001',
    status: 'Expected',
    calculation_trace: {
      gross_commission: 90000,
      brokerage_split_pct: 50,
      brokerage_amount: 45000,
      broker_split_pct: 60,
      broker_amount: 27000,
      deductions: [],
      net_payable: 27000,
      calculated_at: '2024-01-12T10:00:00Z',
      rule_version: '1.0.0',
    },
  },
];
