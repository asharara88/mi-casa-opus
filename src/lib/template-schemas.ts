// =====================================================
// TEMPLATE FORM SCHEMAS
// Defines all input fields for 18 Chairman-Ready templates
// with dropdowns (enums), dates, currency, and text fields
// =====================================================

export interface FieldSchema {
  type: "string" | "number" | "boolean" | "date";
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  enum?: string[];
  format?: "date" | "currency" | "phone" | "email";
  section: string;
}

export interface TemplateSchema {
  id: string;
  title: string;
  description: string;
  category: "onboarding" | "transaction" | "closing" | "finance" | "compliance" | "operations";
  workflow: ("sales" | "leasing" | "co-broker")[];
  fields: Record<string, FieldSchema>;
  followUpTask?: {
    title: string;
    daysUntilDue: number;
  };
}

// =====================================================
// TEMPLATE 01: SELLER/LANDLORD AUTHORIZATION
// =====================================================
export const TEMPLATE_01_SELLER_AUTHORIZATION: TemplateSchema = {
  id: "FORM_01_SELLER_AUTH",
  title: "Seller / Landlord Authorization",
  description: "Form A Equivalent - Appoints MiCasa to market and negotiate sale/lease",
  category: "onboarding",
  workflow: ["sales", "leasing"],
  followUpTask: {
    title: "Schedule property photography & listing",
    daysUntilDue: 3
  },
  fields: {
    // Principal (Seller/Landlord)
    principal_full_name: { type: "string", label: "Principal Full Name", required: true, section: "Principal" },
    principal_id_type: { type: "string", label: "ID Type", enum: ["Emirates ID", "Passport"], required: true, section: "Principal" },
    principal_id_number: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Principal" },
    principal_address: { type: "string", label: "Address", section: "Principal" },
    principal_mobile: { type: "string", label: "Mobile", format: "phone", required: true, section: "Principal" },
    principal_email: { type: "string", label: "Email", format: "email", section: "Principal" },
    
    // Broker Representative
    broker_representative: { type: "string", label: "Broker Representative Name", required: true, section: "Broker" },
    
    // Property Details
    property_type: { type: "string", label: "Property Type", enum: ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Office", "Retail", "Warehouse", "Land"], required: true, section: "Property" },
    community_building: { type: "string", label: "Community / Building", required: true, section: "Property" },
    unit_plot_no: { type: "string", label: "Unit / Plot No.", section: "Property" },
    title_deed_no: { type: "string", label: "Title Deed / Tawtheeq No.", section: "Property" },
    approx_area: { type: "string", label: "Approx. Area (sq. ft./sq. m)", section: "Property" },
    current_status: { type: "string", label: "Current Status", enum: ["Vacant", "Occupied", "Under Renovation", "Furnished", "Unfurnished"], section: "Property" },
    
    // Scope of Authority
    transaction_sale: { type: "boolean", label: "Sale", section: "Authority" },
    transaction_lease: { type: "boolean", label: "Lease", section: "Authority" },
    authority_type: { type: "string", label: "Authority Type", enum: ["Exclusive", "Non-Exclusive"], required: true, section: "Authority" },
    
    // Term
    start_date: { type: "date", label: "Start Date", format: "date", required: true, section: "Term" },
    end_date: { type: "date", label: "End Date", format: "date", required: true, section: "Term" },
    
    // Listing Price
    sale_price_aed: { type: "number", label: "Sale Price (AED)", format: "currency", section: "Pricing" },
    lease_terms_aed: { type: "number", label: "Lease Terms (AED per annum)", format: "currency", section: "Pricing" },
    
    // Commission
    commission_rate: { type: "number", label: "Commission Rate (%)", section: "Commission" },
    commission_fixed: { type: "number", label: "Fixed Commission Amount (AED)", format: "currency", section: "Commission" },
    commission_payable_by: { type: "string", label: "Commission Payable By", enum: ["Principal", "Other party as permitted by law"], section: "Commission" },
    
    // Marketing
    marketing_restrictions: { type: "string", label: "Marketing Restrictions (if any)", section: "Marketing" },
    
    // Termination
    termination_notice_days: { type: "number", label: "Termination Notice Period (days)", section: "Termination" },
    
    // Signatures
    principal_signature_date: { type: "date", label: "Principal Signature Date", format: "date", section: "Signatures" },
    broker_signature_date: { type: "date", label: "Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 02: BUYER/TENANT REPRESENTATION
// =====================================================
export const TEMPLATE_02_BUYER_REPRESENTATION: TemplateSchema = {
  id: "FORM_02_BUYER_REP",
  title: "Buyer / Tenant Representation Agreement",
  description: "Appoints MiCasa to represent buyer/tenant in locating property",
  category: "onboarding",
  workflow: ["sales", "leasing"],
  followUpTask: {
    title: "Send property shortlist to client",
    daysUntilDue: 2
  },
  fields: {
    // Client
    client_full_name: { type: "string", label: "Client Full Name", required: true, section: "Client" },
    client_id_type: { type: "string", label: "ID Type", enum: ["Emirates ID", "Passport"], required: true, section: "Client" },
    client_id_number: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Client" },
    client_address: { type: "string", label: "Address", section: "Client" },
    client_mobile: { type: "string", label: "Mobile", format: "phone", required: true, section: "Client" },
    client_email: { type: "string", label: "Email", format: "email", section: "Client" },
    
    // Broker
    broker_representative: { type: "string", label: "Broker Representative Name", required: true, section: "Broker" },
    
    // Representation Type
    representation_type: { type: "string", label: "Representation Type", enum: ["Buyer representation (purchase)", "Tenant representation (lease)"], required: true, section: "Representation" },
    
    // Client Requirements
    preferred_areas: { type: "string", label: "Preferred Areas", section: "Requirements" },
    property_type: { type: "string", label: "Property Type", enum: ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Office", "Retail", "Any"], section: "Requirements" },
    budget_range: { type: "string", label: "Budget / Rent Range (AED)", section: "Requirements" },
    timeline: { type: "string", label: "Move-in / Completion Timeline", section: "Requirements" },
    
    // Exclusivity
    exclusivity_type: { type: "string", label: "Exclusivity", enum: ["Exclusive representation", "Non-exclusive representation"], required: true, section: "Terms" },
    
    // Term
    start_date: { type: "date", label: "Start Date", format: "date", required: true, section: "Term" },
    end_date: { type: "date", label: "End Date", format: "date", required: true, section: "Term" },
    
    // Commission
    commission_rate: { type: "number", label: "Commission Rate (%)", section: "Commission" },
    commission_fixed: { type: "number", label: "Fixed Amount (AED)", format: "currency", section: "Commission" },
    commission_payable_by: { type: "string", label: "Commission Payable By", enum: ["Client", "Seller/Landlord", "Other as permitted by law"], section: "Commission" },
    
    // Signatures
    client_signature_date: { type: "date", label: "Client Signature Date", format: "date", section: "Signatures" },
    broker_signature_date: { type: "date", label: "Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 03: LISTING AUTHORIZATION & MARKETING CONSENT
// =====================================================
export const TEMPLATE_03_MARKETING_CONSENT: TemplateSchema = {
  id: "FORM_03_MARKETING",
  title: "Property Listing Authorization & Marketing Consent",
  description: "Authorizes listing and marketing of property",
  category: "onboarding",
  workflow: ["sales", "leasing"],
  followUpTask: {
    title: "Upload property to portals",
    daysUntilDue: 1
  },
  fields: {
    // Owner
    owner_full_name: { type: "string", label: "Owner Full Name", required: true, section: "Owner" },
    owner_id_number: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Owner" },
    owner_address: { type: "string", label: "Address", section: "Owner" },
    owner_mobile: { type: "string", label: "Mobile", format: "phone", required: true, section: "Owner" },
    owner_email: { type: "string", label: "Email", format: "email", section: "Owner" },
    
    // Broker
    broker_representative: { type: "string", label: "Broker Representative", required: true, section: "Broker" },
    
    // Property
    property_type: { type: "string", label: "Property Type", enum: ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Office", "Retail", "Land"], required: true, section: "Property" },
    community_building: { type: "string", label: "Community / Building", required: true, section: "Property" },
    unit_plot_no: { type: "string", label: "Unit / Plot No.", section: "Property" },
    title_deed_no: { type: "string", label: "Title Deed / Tawtheeq No.", section: "Property" },
    furnishing: { type: "string", label: "Furnishing", enum: ["Furnished", "Semi-Furnished", "Unfurnished"], section: "Property" },
    key_access_contact: { type: "string", label: "Key Access Contact", section: "Property" },
    
    // Listing
    listing_type: { type: "string", label: "Listing Type", enum: ["Sale", "Lease", "Both"], required: true, section: "Listing" },
    listed_price_aed: { type: "number", label: "Listed Price / Rent (AED)", format: "currency", required: true, section: "Listing" },
    price_validity: { type: "string", label: "Price Validity Period", section: "Listing" },
    
    // Signatures
    owner_signature_date: { type: "date", label: "Owner Signature Date", format: "date", section: "Signatures" },
    broker_signature_date: { type: "date", label: "Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 04: AGENT LICENSE REGISTRATION RECORD
// =====================================================
export const TEMPLATE_04_AGENT_LICENSE: TemplateSchema = {
  id: "FORM_04_AGENT_LICENSE",
  title: "Agent License & Registration Record",
  description: "Internal record of agent licensing and credentials",
  category: "compliance",
  workflow: [],
  fields: {
    agent_full_name: { type: "string", label: "Agent Full Name", required: true, section: "Agent" },
    emirates_id: { type: "string", label: "Emirates ID", required: true, section: "Agent" },
    passport_no: { type: "string", label: "Passport No.", section: "Agent" },
    nationality: { type: "string", label: "Nationality", section: "Agent" },
    mobile: { type: "string", label: "Mobile", format: "phone", section: "Agent" },
    email: { type: "string", label: "Email", format: "email", section: "Agent" },
    
    brn: { type: "string", label: "BRN (Broker Registration No.)", required: true, section: "License" },
    brn_issue_date: { type: "date", label: "BRN Issue Date", format: "date", section: "License" },
    brn_expiry_date: { type: "date", label: "BRN Expiry Date", format: "date", section: "License" },
    rera_no: { type: "string", label: "RERA No. (if Dubai registered)", section: "License" },
    adm_registration: { type: "string", label: "ADM Registration No.", section: "License" },
    
    employment_start_date: { type: "date", label: "Employment Start Date", format: "date", section: "Employment" },
    department: { type: "string", label: "Department", enum: ["Sales", "Leasing", "Off-Plan", "Property Management"], section: "Employment" },
    reporting_manager: { type: "string", label: "Reporting Manager", section: "Employment" },
    
    verified_by: { type: "string", label: "Verified By (Compliance)", section: "Verification" },
    verification_date: { type: "date", label: "Verification Date", format: "date", section: "Verification" }
  }
};

// =====================================================
// TEMPLATE 05: COMPANY TRADE LICENSE RECORD
// =====================================================
export const TEMPLATE_05_COMPANY_LICENSE: TemplateSchema = {
  id: "FORM_05_COMPANY_LICENSE",
  title: "Company Trade License & Regulatory Record",
  description: "Master record of company licensing",
  category: "compliance",
  workflow: [],
  fields: {
    trade_license_no: { type: "string", label: "Trade License No.", required: true, section: "License" },
    issue_date: { type: "date", label: "Issue Date", format: "date", section: "License" },
    expiry_date: { type: "date", label: "Expiry Date", format: "date", section: "License" },
    issuing_authority: { type: "string", label: "Issuing Authority", section: "License" },
    
    rera_registration: { type: "string", label: "RERA Registration No.", section: "Regulatory" },
    adm_brokerage_license: { type: "string", label: "ADM Brokerage License No.", section: "Regulatory" },
    vat_trn: { type: "string", label: "VAT TRN", section: "Regulatory" },
    
    registered_manager: { type: "string", label: "Registered Manager", section: "Management" },
    compliance_officer: { type: "string", label: "Compliance Officer", section: "Management" },
    
    last_audit_date: { type: "date", label: "Last Compliance Audit Date", format: "date", section: "Audit" },
    next_audit_date: { type: "date", label: "Next Audit Date", format: "date", section: "Audit" },
    
    record_updated_by: { type: "string", label: "Record Updated By", section: "Record" },
    update_date: { type: "date", label: "Update Date", format: "date", section: "Record" }
  }
};

// =====================================================
// TEMPLATE 06: AGENT-TO-AGENT AGREEMENT
// =====================================================
export const TEMPLATE_06_AGENT_AGREEMENT: TemplateSchema = {
  id: "FORM_06_AGENT_AGREEMENT",
  title: "Agent-to-Agent / Agency Agreement",
  description: "Cooperation agreement between brokers for commission sharing",
  category: "transaction",
  workflow: ["co-broker"],
  followUpTask: {
    title: "Verify cooperating broker credentials",
    daysUntilDue: 1
  },
  fields: {
    // MiCasa Representative
    micasa_representative: { type: "string", label: "MiCasa Representative", required: true, section: "MiCasa" },
    
    // Cooperating Broker
    coop_legal_name: { type: "string", label: "Cooperating Broker Legal Name", required: true, section: "Cooperating Broker" },
    coop_license_no: { type: "string", label: "License No.", required: true, section: "Cooperating Broker" },
    coop_trn: { type: "string", label: "TRN (if applicable)", section: "Cooperating Broker" },
    coop_representative: { type: "string", label: "Representative Name", required: true, section: "Cooperating Broker" },
    coop_email: { type: "string", label: "Email", format: "email", section: "Cooperating Broker" },
    
    // Scope
    cooperation_scope: { type: "string", label: "Scope of Cooperation", enum: ["Specific Property/Deal", "Ongoing cooperation for multiple listings"], required: true, section: "Scope" },
    deal_reference: { type: "string", label: "Property / Deal Reference", section: "Scope" },
    client_type: { type: "string", label: "Client Type Introduced", enum: ["Buyer", "Seller", "Tenant", "Landlord"], section: "Scope" },
    
    // Commission
    total_commission: { type: "string", label: "Total Commission (AED or %)", required: true, section: "Commission" },
    micasa_share: { type: "string", label: "MiCasa Share (AED or %)", required: true, section: "Commission" },
    coop_share: { type: "string", label: "Cooperating Broker Share (AED or %)", required: true, section: "Commission" },
    payment_trigger: { type: "string", label: "Payment Trigger", section: "Commission" },
    payment_timing: { type: "string", label: "Payment Method and Timing", section: "Commission" },
    
    // Signatures
    micasa_signature_date: { type: "date", label: "MiCasa Signature Date", format: "date", section: "Signatures" },
    coop_signature_date: { type: "date", label: "Cooperating Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 07: OFFER LETTER / EOI
// =====================================================
export const TEMPLATE_07_OFFER_LETTER: TemplateSchema = {
  id: "FORM_07_OFFER",
  title: "Offer Letter / Expression of Interest",
  description: "Formal written offer from buyer/tenant",
  category: "transaction",
  workflow: ["sales", "leasing"],
  followUpTask: {
    title: "Follow up on offer response",
    daysUntilDue: 2
  },
  fields: {
    // Offeror
    offeror_name: { type: "string", label: "Offeror Full Name", required: true, section: "Offeror" },
    offeror_id: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Offeror" },
    offeror_mobile: { type: "string", label: "Mobile", format: "phone", section: "Offeror" },
    offeror_email: { type: "string", label: "Email", format: "email", section: "Offeror" },
    
    // Owner
    owner_name: { type: "string", label: "Owner Full Name", section: "Owner" },
    owner_contact: { type: "string", label: "Owner Contact", section: "Owner" },
    
    // Broker
    broker_representative: { type: "string", label: "Broker Representative", required: true, section: "Broker" },
    
    // Property
    property_address: { type: "string", label: "Property Address", required: true, section: "Property" },
    unit_no: { type: "string", label: "Unit / Plot No.", section: "Property" },
    property_type: { type: "string", label: "Property Type", enum: ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail", "Land"], section: "Property" },
    
    // Offer Type
    offer_type: { type: "string", label: "Offer Type", enum: ["Purchase", "Lease"], required: true, section: "Offer" },
    
    // Offer Terms (Purchase)
    offer_price_aed: { type: "number", label: "Offer Price (AED)", format: "currency", section: "Offer Terms" },
    deposit_amount: { type: "number", label: "Deposit Amount (AED)", format: "currency", section: "Offer Terms" },
    payment_method: { type: "string", label: "Payment Method", enum: ["Cash", "Mortgage", "Cash + Mortgage", "Seller Finance"], section: "Offer Terms" },
    target_completion_date: { type: "date", label: "Target Completion Date", format: "date", section: "Offer Terms" },
    
    // Offer Terms (Lease)
    annual_rent_aed: { type: "number", label: "Annual Rent (AED)", format: "currency", section: "Lease Terms" },
    cheque_payments: { type: "string", label: "No. of Cheque Payments", enum: ["1", "2", "4", "6", "12"], section: "Lease Terms" },
    security_deposit: { type: "number", label: "Security Deposit (AED)", format: "currency", section: "Lease Terms" },
    lease_start_date: { type: "date", label: "Lease Start Date", format: "date", section: "Lease Terms" },
    lease_duration: { type: "string", label: "Lease Duration", enum: ["1 Year", "2 Years", "3 Years"], section: "Lease Terms" },
    
    // Validity
    offer_validity_date: { type: "date", label: "Offer Valid Until", format: "date", required: true, section: "Validity" },
    special_conditions: { type: "string", label: "Special Conditions / Requests", section: "Validity" },
    
    // Signatures
    offeror_signature_date: { type: "date", label: "Offeror Signature Date", format: "date", section: "Signatures" },
    owner_response: { type: "string", label: "Owner Response", enum: ["Accepted", "Rejected", "Counter-Offer", "Pending"], section: "Response" },
    owner_signature_date: { type: "date", label: "Owner Signature Date", format: "date", section: "Response" }
  }
};

// =====================================================
// TEMPLATE 08: MOU / PRE-SPA
// =====================================================
export const TEMPLATE_08_MOU: TemplateSchema = {
  id: "FORM_08_MOU",
  title: "Memorandum of Understanding (MOU / Pre-SPA)",
  description: "Records agreed sale terms prior to transfer",
  category: "transaction",
  workflow: ["sales"],
  followUpTask: {
    title: "Coordinate NOC and transfer documentation",
    daysUntilDue: 5
  },
  fields: {
    // Seller
    seller_name: { type: "string", label: "Seller Full Name", required: true, section: "Seller" },
    seller_id: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Seller" },
    seller_address: { type: "string", label: "Address", section: "Seller" },
    
    // Buyer
    buyer_name: { type: "string", label: "Buyer Full Name", required: true, section: "Buyer" },
    buyer_id: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Buyer" },
    buyer_address: { type: "string", label: "Address", section: "Buyer" },
    
    // Broker
    broker_representative: { type: "string", label: "Broker Representative", required: true, section: "Broker" },
    
    // Property
    property_address: { type: "string", label: "Property Address", required: true, section: "Property" },
    unit_no: { type: "string", label: "Unit / Plot No.", section: "Property" },
    title_deed_no: { type: "string", label: "Title Deed No.", section: "Property" },
    property_type: { type: "string", label: "Property Type", enum: ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail", "Land"], section: "Property" },
    
    // Purchase Terms
    purchase_price_aed: { type: "number", label: "Total Purchase Price (AED)", format: "currency", required: true, section: "Purchase" },
    deposit_amount_aed: { type: "number", label: "Deposit Amount (AED)", format: "currency", required: true, section: "Purchase" },
    balance_payment_method: { type: "string", label: "Balance Payment Method", section: "Purchase" },
    target_transfer_date: { type: "date", label: "Target Transfer Date", format: "date", section: "Purchase" },
    
    // Deposit Handling
    deposit_handling: { type: "string", label: "Deposit Held By", enum: ["MiCasa Escrow", "Seller Directly", "Conveyancer"], section: "Deposit" },
    
    // Signatures
    seller_signature_date: { type: "date", label: "Seller Signature Date", format: "date", section: "Signatures" },
    buyer_signature_date: { type: "date", label: "Buyer Signature Date", format: "date", section: "Signatures" },
    broker_signature_date: { type: "date", label: "Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 09: RESERVATION / BOOKING FORM
// =====================================================
export const TEMPLATE_09_RESERVATION: TemplateSchema = {
  id: "FORM_09_RESERVATION",
  title: "Reservation / Booking Form",
  description: "Records temporary property reservation and deposit",
  category: "transaction",
  workflow: ["sales", "leasing"],
  followUpTask: {
    title: "Prepare main agreement within reservation period",
    daysUntilDue: 7
  },
  fields: {
    // Reserving Party
    reserving_party_name: { type: "string", label: "Reserving Party Full Name", required: true, section: "Reserving Party" },
    reserving_party_id: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Reserving Party" },
    reserving_party_mobile: { type: "string", label: "Mobile", format: "phone", section: "Reserving Party" },
    reserving_party_email: { type: "string", label: "Email", format: "email", section: "Reserving Party" },
    
    // Owner
    owner_name: { type: "string", label: "Owner Full Name", section: "Owner" },
    owner_contact: { type: "string", label: "Contact", section: "Owner" },
    
    // Broker
    broker_representative: { type: "string", label: "Broker Representative", required: true, section: "Broker" },
    
    // Property
    property_address: { type: "string", label: "Property Address", required: true, section: "Property" },
    unit_no: { type: "string", label: "Unit / Plot No.", section: "Property" },
    property_type: { type: "string", label: "Property Type", enum: ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"], section: "Property" },
    
    // Reservation Terms
    reservation_start_date: { type: "date", label: "Reservation Start Date", format: "date", required: true, section: "Reservation" },
    reservation_end_date: { type: "date", label: "Reservation End Date", format: "date", required: true, section: "Reservation" },
    reservation_fee_aed: { type: "number", label: "Reservation Fee / Deposit (AED)", format: "currency", required: true, section: "Reservation" },
    payment_method: { type: "string", label: "Payment Method", enum: ["Bank Transfer", "Cheque", "Cash", "Card"], section: "Reservation" },
    
    // Signatures
    reserving_party_signature_date: { type: "date", label: "Reserving Party Signature Date", format: "date", section: "Signatures" },
    owner_signature_date: { type: "date", label: "Owner Signature Date", format: "date", section: "Signatures" },
    broker_signature_date: { type: "date", label: "Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 10: DEAL COMPLETION CHECKLIST
// =====================================================
export const TEMPLATE_10_CLOSING_CHECKLIST: TemplateSchema = {
  id: "FORM_10_CLOSING",
  title: "Deal Completion & Closing Checklist",
  description: "Internal checklist for audit and quality control",
  category: "closing",
  workflow: ["sales", "leasing"],
  fields: {
    // Deal Details
    deal_date: { type: "date", label: "Date", format: "date", required: true, section: "Deal" },
    deal_crm_id: { type: "string", label: "Deal / CRM ID", required: true, section: "Deal" },
    transaction_type: { type: "string", label: "Transaction Type", enum: ["Sale", "Lease"], required: true, section: "Deal" },
    property: { type: "string", label: "Property", required: true, section: "Deal" },
    responsible_agents: { type: "string", label: "Responsible Agent(s)", section: "Deal" },
    team_leader: { type: "string", label: "Team Leader", section: "Deal" },
    
    // Parties KYC
    seller_landlord_name: { type: "string", label: "Seller/Landlord Name", section: "KYC" },
    seller_id_verified: { type: "boolean", label: "Seller ID Verified", section: "KYC" },
    buyer_tenant_name: { type: "string", label: "Buyer/Tenant Name", section: "KYC" },
    buyer_id_verified: { type: "boolean", label: "Buyer ID Verified", section: "KYC" },
    source_of_funds_obtained: { type: "string", label: "Source of Funds Obtained", enum: ["Yes", "No", "N/A"], section: "KYC" },
    
    // Brokerage Authority
    seller_auth_signed: { type: "boolean", label: "Seller Authorization Signed", section: "Authority" },
    seller_auth_date: { type: "date", label: "Seller Auth Date", format: "date", section: "Authority" },
    buyer_rep_signed: { type: "string", label: "Buyer Rep Agreement", enum: ["Yes", "No", "N/A"], section: "Authority" },
    marketing_consent_signed: { type: "string", label: "Marketing Consent", enum: ["Yes", "No", "N/A"], section: "Authority" },
    
    // Transaction Documents
    offer_on_file: { type: "string", label: "Offer/EOI on File", enum: ["Yes", "No", "N/A"], section: "Documents" },
    mou_spa_executed: { type: "string", label: "MOU/SPA Executed", enum: ["Yes", "No", "N/A"], section: "Documents" },
    mou_date: { type: "date", label: "MOU/SPA Date", format: "date", section: "Documents" },
    lease_executed: { type: "string", label: "Lease Agreement Executed", enum: ["Yes", "No", "N/A"], section: "Documents" },
    lease_date: { type: "date", label: "Lease Date", format: "date", section: "Documents" },
    
    // Clearances
    noc_obtained: { type: "string", label: "NOC Obtained", enum: ["Yes", "No", "N/A"], section: "Clearances" },
    mortgage_approval: { type: "string", label: "Mortgage Approval", enum: ["Yes", "No", "N/A"], section: "Clearances" },
    service_charge_cleared: { type: "string", label: "Service Charge Cleared", enum: ["Yes", "No", "N/A"], section: "Clearances" },
    
    // Financials
    deposit_on_file: { type: "string", label: "Deposit Receipt on File", enum: ["Yes", "No", "N/A"], section: "Financials" },
    commission_invoice_issued: { type: "boolean", label: "Commission Invoice Issued", section: "Financials" },
    invoice_numbers: { type: "string", label: "Invoice No(s)", section: "Financials" },
    vat_applied: { type: "string", label: "VAT Applied", enum: ["Yes", "No", "N/A"], section: "Financials" },
    commission_received: { type: "boolean", label: "Commission Received", section: "Financials" },
    commission_received_date: { type: "date", label: "Commission Received Date", format: "date", section: "Financials" },
    
    // Completion
    transfer_completed: { type: "string", label: "Transfer Completed", enum: ["Yes", "No", "N/A"], section: "Completion" },
    transfer_date: { type: "date", label: "Transfer Date", format: "date", section: "Completion" },
    handover_completed: { type: "boolean", label: "Handover Completed", section: "Completion" },
    handover_date: { type: "date", label: "Handover Date", format: "date", section: "Completion" },
    
    // Notes
    exceptions_notes: { type: "string", label: "Exceptions / Outstanding Items", section: "Notes" },
    
    // Signatures
    agent_name: { type: "string", label: "Agent Name", section: "Signatures" },
    agent_signature_date: { type: "date", label: "Agent Signature Date", format: "date", section: "Signatures" },
    compliance_name: { type: "string", label: "Operations/Compliance Name", section: "Signatures" },
    compliance_title: { type: "string", label: "Title", section: "Signatures" },
    compliance_signature_date: { type: "date", label: "Compliance Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 11: NOC REQUEST TRACKER
// =====================================================
export const TEMPLATE_11_NOC_TRACKER: TemplateSchema = {
  id: "FORM_11_NOC",
  title: "NOC Request & Clearance Tracker",
  description: "Tracks NOC requests and clearances",
  category: "closing",
  workflow: ["sales"],
  followUpTask: {
    title: "Follow up on pending NOC status",
    daysUntilDue: 3
  },
  fields: {
    // Deal
    deal_crm_id: { type: "string", label: "Deal / CRM ID", required: true, section: "Deal" },
    property: { type: "string", label: "Property", required: true, section: "Deal" },
    transaction_type: { type: "string", label: "Transaction Type", enum: ["Sale", "Mortgage Release", "Title Update", "Other"], section: "Deal" },
    
    // NOC Type
    noc_type: { type: "string", label: "NOC Type", enum: ["Developer NOC", "Community NOC", "Bank/Mortgage NOC", "Municipality NOC", "Other"], required: true, section: "NOC" },
    issuing_authority: { type: "string", label: "Issuing Authority", section: "NOC" },
    
    // Request
    request_date: { type: "date", label: "Request Date", format: "date", required: true, section: "Request" },
    requested_by: { type: "string", label: "Requested By", section: "Request" },
    documents_submitted: { type: "string", label: "Documents Submitted", section: "Request" },
    fee_paid_aed: { type: "number", label: "Fee Paid (AED)", format: "currency", section: "Request" },
    
    // Status
    status: { type: "string", label: "Status", enum: ["Pending", "In Progress", "Approved", "Rejected", "Cancelled"], required: true, section: "Status" },
    expected_date: { type: "date", label: "Expected Completion Date", format: "date", section: "Status" },
    actual_received_date: { type: "date", label: "Actual Received Date", format: "date", section: "Status" },
    noc_reference: { type: "string", label: "NOC Reference Number", section: "Status" },
    
    // Notes
    notes: { type: "string", label: "Notes / Issues", section: "Notes" },
    
    // Signatures
    tracker_updated_by: { type: "string", label: "Updated By", section: "Record" },
    update_date: { type: "date", label: "Update Date", format: "date", section: "Record" }
  }
};

// =====================================================
// TEMPLATE 12: COMMISSION & VAT INVOICE
// =====================================================
export const TEMPLATE_12_INVOICE: TemplateSchema = {
  id: "FORM_12_INVOICE",
  title: "Commission & VAT Invoice",
  description: "Tax-compliant commission invoice",
  category: "finance",
  workflow: ["sales", "leasing"],
  fields: {
    // Customer
    customer_name: { type: "string", label: "Customer Name", required: true, section: "Customer" },
    customer_address: { type: "string", label: "Customer Address", section: "Customer" },
    customer_trn: { type: "string", label: "Customer VAT TRN (if applicable)", section: "Customer" },
    customer_id: { type: "string", label: "Emirates ID / Passport / Trade License", section: "Customer" },
    customer_email: { type: "string", label: "Email", format: "email", section: "Customer" },
    customer_mobile: { type: "string", label: "Mobile", format: "phone", section: "Customer" },
    
    // Property
    property: { type: "string", label: "Property", required: true, section: "Property" },
    transaction_type: { type: "string", label: "Transaction Type", enum: ["Sale", "Lease"], required: true, section: "Property" },
    
    // Invoice Details
    invoice_no: { type: "string", label: "Invoice No.", required: true, section: "Invoice" },
    invoice_date: { type: "date", label: "Invoice Date", format: "date", required: true, section: "Invoice" },
    deal_reference: { type: "string", label: "Deal / CRM Reference", section: "Invoice" },
    
    // Fee Calculation
    commission_basis: { type: "string", label: "Commission Basis", enum: ["Percentage of price/rent", "Fixed fee"], section: "Fees" },
    commission_amount_aed: { type: "number", label: "Brokerage Commission (AED)", format: "currency", required: true, section: "Fees" },
    subtotal_aed: { type: "number", label: "Subtotal Excl. VAT (AED)", format: "currency", section: "Fees" },
    vat_rate: { type: "number", label: "VAT Rate (%)", section: "Fees" },
    vat_amount_aed: { type: "number", label: "VAT Amount (AED)", format: "currency", section: "Fees" },
    total_payable_aed: { type: "number", label: "Total Payable Incl. VAT (AED)", format: "currency", required: true, section: "Fees" },
    
    // Payment
    payment_due_date: { type: "date", label: "Payment Due Date", format: "date", section: "Payment" },
    payment_method: { type: "string", label: "Payment Method", enum: ["Bank Transfer", "Cash", "Cheque", "Other"], section: "Payment" },
    bank_name: { type: "string", label: "Bank Name", section: "Payment" },
    account_name: { type: "string", label: "Account Name", section: "Payment" },
    iban: { type: "string", label: "IBAN", section: "Payment" },
    swift: { type: "string", label: "SWIFT", section: "Payment" },
    
    // Signatory
    signatory_name: { type: "string", label: "Authorized Signatory Name", section: "Signatory" },
    signatory_title: { type: "string", label: "Title", section: "Signatory" },
    signature_date: { type: "date", label: "Date", format: "date", section: "Signatory" }
  }
};

// =====================================================
// TEMPLATE 13: COMMISSION SPLIT SHEET
// =====================================================
export const TEMPLATE_13_SPLIT_SHEET: TemplateSchema = {
  id: "FORM_13_SPLIT",
  title: "Commission Authorization & Split Sheet",
  description: "Internal commission allocation approval",
  category: "finance",
  workflow: ["sales", "leasing"],
  fields: {
    // Deal
    date: { type: "date", label: "Date", format: "date", required: true, section: "Deal" },
    deal_crm_id: { type: "string", label: "Deal / CRM ID", required: true, section: "Deal" },
    property: { type: "string", label: "Property", required: true, section: "Deal" },
    transaction_type: { type: "string", label: "Transaction Type", enum: ["Sale", "Lease"], required: true, section: "Deal" },
    closing_date: { type: "date", label: "Closing Date", format: "date", section: "Deal" },
    
    // Commission Summary
    gross_commission_aed: { type: "number", label: "Gross Commission (AED)", format: "currency", required: true, section: "Commission" },
    vat_applicable: { type: "boolean", label: "VAT Applicable", section: "Commission" },
    vat_amount_aed: { type: "number", label: "VAT Amount (AED)", format: "currency", section: "Commission" },
    net_commission_aed: { type: "number", label: "Net Commission (AED)", format: "currency", section: "Commission" },
    commission_received: { type: "boolean", label: "Commission Received and Cleared", section: "Commission" },
    commission_received_date: { type: "date", label: "Received Date", format: "date", section: "Commission" },
    receiving_account_ref: { type: "string", label: "Receiving Account Reference", section: "Commission" },
    
    // Payor
    commission_paid_by: { type: "string", label: "Commission Paid By", enum: ["Seller", "Buyer", "Landlord", "Tenant", "Other"], section: "Payor" },
    
    // Supporting Docs
    signed_auth_on_file: { type: "boolean", label: "Signed Authorization on File", section: "Supporting Docs" },
    signed_mou_on_file: { type: "boolean", label: "Signed MOU/Lease on File", section: "Supporting Docs" },
    tax_invoice_issued: { type: "boolean", label: "Tax Invoice Issued", section: "Supporting Docs" },
    tax_invoice_no: { type: "string", label: "Invoice No.", section: "Supporting Docs" },
    proof_of_receipt: { type: "boolean", label: "Proof of Receipt on File", section: "Supporting Docs" },
    
    // Split 1
    split1_recipient: { type: "string", label: "Recipient 1", section: "Split Details" },
    split1_type: { type: "string", label: "Type", enum: ["Agent", "Team Lead", "External Broker", "Referral", "Company"], section: "Split Details" },
    split1_basis: { type: "string", label: "Split Basis", section: "Split Details" },
    split1_amount_aed: { type: "number", label: "Amount (AED)", format: "currency", section: "Split Details" },
    split1_payable_date: { type: "date", label: "Payable Date", format: "date", section: "Split Details" },
    
    // Split 2
    split2_recipient: { type: "string", label: "Recipient 2", section: "Split Details" },
    split2_type: { type: "string", label: "Type", enum: ["Agent", "Team Lead", "External Broker", "Referral", "Company"], section: "Split Details" },
    split2_basis: { type: "string", label: "Split Basis", section: "Split Details" },
    split2_amount_aed: { type: "number", label: "Amount (AED)", format: "currency", section: "Split Details" },
    split2_payable_date: { type: "date", label: "Payable Date", format: "date", section: "Split Details" },
    
    // Totals
    total_approved_payouts_aed: { type: "number", label: "Total Approved Payouts (AED)", format: "currency", section: "Totals" },
    holdback_aed: { type: "number", label: "Holdback/Retention (AED)", format: "currency", section: "Totals" },
    holdback_reason: { type: "string", label: "Holdback Reason", section: "Totals" },
    
    // Signatures
    finance_name: { type: "string", label: "Prepared By (Finance)", section: "Signatures" },
    finance_title: { type: "string", label: "Finance Title", section: "Signatures" },
    finance_date: { type: "date", label: "Finance Date", format: "date", section: "Signatures" },
    compliance_name: { type: "string", label: "Reviewed By (Compliance)", section: "Signatures" },
    compliance_title: { type: "string", label: "Compliance Title", section: "Signatures" },
    compliance_date: { type: "date", label: "Compliance Date", format: "date", section: "Signatures" },
    management_name: { type: "string", label: "Approved By (Management)", section: "Signatures" },
    management_title: { type: "string", label: "Management Title", section: "Signatures" },
    management_date: { type: "date", label: "Management Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 14: REFUND/CANCELLATION FORM
// =====================================================
export const TEMPLATE_14_REFUND: TemplateSchema = {
  id: "FORM_14_REFUND",
  title: "Refund / Cancellation Approval Form",
  description: "Internal approval for refunds or cancellations",
  category: "finance",
  workflow: ["sales", "leasing"],
  fields: {
    // Deal
    date: { type: "date", label: "Date", format: "date", required: true, section: "Deal" },
    deal_crm_id: { type: "string", label: "Deal / CRM ID", required: true, section: "Deal" },
    property: { type: "string", label: "Property", section: "Deal" },
    transaction_type: { type: "string", label: "Transaction Type", enum: ["Sale", "Lease"], section: "Deal" },
    
    // Requesting Party
    requesting_party_name: { type: "string", label: "Requesting Party Name", required: true, section: "Requesting Party" },
    requesting_party_role: { type: "string", label: "Role", enum: ["Buyer", "Seller", "Tenant", "Landlord", "Agent", "Other"], section: "Requesting Party" },
    requesting_party_contact: { type: "string", label: "Contact", section: "Requesting Party" },
    
    // Request
    request_type: { type: "string", label: "Request Type", enum: ["Refund - Deposit/Reservation", "Refund - Commission", "Cancellation - Deal", "Cancellation - Reservation", "Other"], required: true, section: "Request" },
    amount_requested_aed: { type: "number", label: "Amount Requested (AED)", format: "currency", section: "Request" },
    reason: { type: "string", label: "Reason for Request", required: true, section: "Request" },
    
    // Supporting Info
    supporting_documents: { type: "string", label: "Supporting Documents", section: "Supporting" },
    original_receipt_on_file: { type: "boolean", label: "Original Receipt on File", section: "Supporting" },
    
    // Assessment
    recommendation: { type: "string", label: "Recommendation", enum: ["Approve Full", "Approve Partial", "Reject", "Escalate"], section: "Assessment" },
    approved_amount_aed: { type: "number", label: "Approved Amount (AED)", format: "currency", section: "Assessment" },
    assessment_notes: { type: "string", label: "Assessment Notes", section: "Assessment" },
    
    // Payment
    refund_method: { type: "string", label: "Refund Method", enum: ["Bank Transfer", "Cheque", "Original Payment Method"], section: "Payment" },
    bank_details: { type: "string", label: "Bank Details for Refund", section: "Payment" },
    
    // Signatures
    finance_name: { type: "string", label: "Prepared By (Finance)", section: "Signatures" },
    finance_date: { type: "date", label: "Finance Date", format: "date", section: "Signatures" },
    compliance_name: { type: "string", label: "Reviewed By (Compliance)", section: "Signatures" },
    compliance_date: { type: "date", label: "Compliance Date", format: "date", section: "Signatures" },
    management_name: { type: "string", label: "Approved By (Management)", section: "Signatures" },
    management_date: { type: "date", label: "Management Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 15: FINANCIAL RECONCILIATION LEDGER
// =====================================================
export const TEMPLATE_15_LEDGER: TemplateSchema = {
  id: "FORM_15_LEDGER",
  title: "Financial Reconciliation & Deal Ledger",
  description: "Per-deal financial movements ledger",
  category: "finance",
  workflow: ["sales", "leasing"],
  fields: {
    // Deal
    date_opened: { type: "date", label: "Date Opened", format: "date", required: true, section: "Deal" },
    deal_crm_id: { type: "string", label: "Deal / CRM ID", required: true, section: "Deal" },
    property: { type: "string", label: "Property", required: true, section: "Deal" },
    transaction_type: { type: "string", label: "Transaction Type", enum: ["Sale", "Lease"], required: true, section: "Deal" },
    closing_date: { type: "date", label: "Closing Date", format: "date", section: "Deal" },
    
    // Parties
    seller_landlord: { type: "string", label: "Seller/Landlord", section: "Parties" },
    buyer_tenant: { type: "string", label: "Buyer/Tenant", section: "Parties" },
    other_parties: { type: "string", label: "Other Parties", section: "Parties" },
    
    // Financial Summary
    sale_price_rent_aed: { type: "number", label: "Agreed Sale Price / Annual Rent (AED)", format: "currency", section: "Summary" },
    commission_agreement_ref: { type: "string", label: "Commission Agreement Reference", section: "Summary" },
    commission_invoice_no: { type: "string", label: "Commission Invoice No.", section: "Summary" },
    vat_applicable: { type: "boolean", label: "VAT Applicable", section: "Summary" },
    total_commission_invoiced_aed: { type: "number", label: "Total Commission Invoiced (AED)", format: "currency", section: "Summary" },
    
    // Ledger Entry 1
    entry1_date: { type: "date", label: "Entry 1 Date", format: "date", section: "Ledger" },
    entry1_type: { type: "string", label: "Entry Type", enum: ["Receipt", "Invoice", "Payout", "Refund", "Adjustment"], section: "Ledger" },
    entry1_description: { type: "string", label: "Description", section: "Ledger" },
    entry1_debit_aed: { type: "number", label: "Debit (AED)", format: "currency", section: "Ledger" },
    entry1_credit_aed: { type: "number", label: "Credit (AED)", format: "currency", section: "Ledger" },
    entry1_method: { type: "string", label: "Method", section: "Ledger" },
    entry1_reference: { type: "string", label: "Reference", section: "Ledger" },
    
    // Reconciliation
    total_receipts_aed: { type: "number", label: "Total Receipts (Cleared)", format: "currency", section: "Reconciliation" },
    total_invoices_aed: { type: "number", label: "Total Invoices Raised", format: "currency", section: "Reconciliation" },
    total_payouts_aed: { type: "number", label: "Total Payouts/Refunds", format: "currency", section: "Reconciliation" },
    balance_aed: { type: "number", label: "Balance", format: "currency", section: "Reconciliation" },
    balance_explanation: { type: "string", label: "Balance Explanation (if non-zero)", section: "Reconciliation" },
    
    // Signatures
    finance_name: { type: "string", label: "Finance Owner Name", section: "Signatures" },
    finance_title: { type: "string", label: "Title", section: "Signatures" },
    finance_date: { type: "date", label: "Date", format: "date", section: "Signatures" },
    compliance_name: { type: "string", label: "Compliance Review Name", section: "Signatures" },
    compliance_title: { type: "string", label: "Title", section: "Signatures" },
    compliance_date: { type: "date", label: "Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 16: CLIENT DATA CONSENT
// =====================================================
export const TEMPLATE_16_PRIVACY: TemplateSchema = {
  id: "FORM_16_PRIVACY",
  title: "Client Data Consent & Privacy Acknowledgment",
  description: "Records client consent for data processing",
  category: "compliance",
  workflow: ["sales", "leasing"],
  fields: {
    // Client
    client_name: { type: "string", label: "Client Full Name", required: true, section: "Client" },
    client_id: { type: "string", label: "Emirates ID / Passport No.", required: true, section: "Client" },
    client_email: { type: "string", label: "Email", format: "email", section: "Client" },
    client_mobile: { type: "string", label: "Mobile", format: "phone", section: "Client" },
    
    // Broker
    broker_representative: { type: "string", label: "Broker Representative", required: true, section: "Broker" },
    
    // Consents
    consent_personal_data: { type: "boolean", label: "Consent to collect and process personal data", section: "Consents" },
    consent_third_party_sharing: { type: "boolean", label: "Consent to share with third parties (banks, developers, authorities)", section: "Consents" },
    consent_marketing: { type: "boolean", label: "Consent to receive marketing communications", section: "Consents" },
    consent_photography: { type: "boolean", label: "Consent for photography/videography of property", section: "Consents" },
    
    // Data Retention
    retention_period: { type: "string", label: "Requested Data Retention Period", enum: ["Standard (as required by law)", "5 years", "10 years", "Minimum required"], section: "Retention" },
    
    // Signatures
    client_signature_date: { type: "date", label: "Client Signature Date", format: "date", required: true, section: "Signatures" },
    broker_signature_date: { type: "date", label: "Broker Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 17: COMPLAINT/DISPUTE REGISTER
// =====================================================
export const TEMPLATE_17_COMPLAINT: TemplateSchema = {
  id: "FORM_17_COMPLAINT",
  title: "Complaint, Dispute & Incident Register",
  description: "Internal register for complaints and incidents",
  category: "operations",
  workflow: [],
  followUpTask: {
    title: "Review and respond to complaint",
    daysUntilDue: 2
  },
  fields: {
    // Entry
    ref_no: { type: "string", label: "Reference No.", required: true, section: "Entry" },
    date_logged: { type: "date", label: "Date Logged", format: "date", required: true, section: "Entry" },
    complainant_party: { type: "string", label: "Complainant / Party", required: true, section: "Entry" },
    deal_listing_ref: { type: "string", label: "Deal/Listing Reference", section: "Entry" },
    
    // Type
    entry_type: { type: "string", label: "Type", enum: ["Complaint", "Dispute", "Incident"], required: true, section: "Type" },
    summary: { type: "string", label: "Summary", required: true, section: "Type" },
    severity: { type: "string", label: "Severity", enum: ["Low", "Medium", "High"], required: true, section: "Type" },
    
    // Assignment
    owner: { type: "string", label: "Owner (Assigned To)", required: true, section: "Assignment" },
    target_resolution_date: { type: "date", label: "Target Resolution Date", format: "date", section: "Assignment" },
    
    // Status
    status: { type: "string", label: "Status", enum: ["Open", "In Progress", "Escalated", "Resolved", "Closed"], required: true, section: "Status" },
    outcome: { type: "string", label: "Outcome / Resolution", section: "Status" },
    close_date: { type: "date", label: "Close Date", format: "date", section: "Status" },
    
    // Signatures
    prepared_by: { type: "string", label: "Prepared/Updated By", section: "Signatures" },
    prepared_date: { type: "date", label: "Date", format: "date", section: "Signatures" },
    approved_by: { type: "string", label: "Approved By (Management)", section: "Signatures" },
    approved_date: { type: "date", label: "Approval Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// TEMPLATE 18: INTERNAL GOVERNANCE PACK
// =====================================================
export const TEMPLATE_18_GOVERNANCE: TemplateSchema = {
  id: "FORM_18_GOVERNANCE",
  title: "Internal Agent Governance Pack",
  description: "Agent onboarding acknowledgment and policy acceptance",
  category: "operations",
  workflow: [],
  fields: {
    // Agent
    agent_name: { type: "string", label: "Agent Full Name", required: true, section: "Agent" },
    agent_id: { type: "string", label: "Emirates ID", required: true, section: "Agent" },
    brn: { type: "string", label: "BRN", section: "Agent" },
    department: { type: "string", label: "Department", enum: ["Sales", "Leasing", "Off-Plan", "Property Management"], section: "Agent" },
    start_date: { type: "date", label: "Employment Start Date", format: "date", section: "Agent" },
    
    // Policy Acknowledgments
    ack_code_of_conduct: { type: "boolean", label: "Code of Conduct Acknowledged", section: "Acknowledgments" },
    ack_commission_policy: { type: "boolean", label: "Commission Policy Acknowledged", section: "Acknowledgments" },
    ack_compliance_policy: { type: "boolean", label: "Compliance & AML Policy Acknowledged", section: "Acknowledgments" },
    ack_data_protection: { type: "boolean", label: "Data Protection Policy Acknowledged", section: "Acknowledgments" },
    ack_social_media: { type: "boolean", label: "Social Media Policy Acknowledged", section: "Acknowledgments" },
    ack_conflict_of_interest: { type: "boolean", label: "Conflict of Interest Policy Acknowledged", section: "Acknowledgments" },
    
    // Declaration
    declaration_accurate_info: { type: "boolean", label: "Declaration: Information provided is accurate", section: "Declaration" },
    declaration_no_conflict: { type: "boolean", label: "Declaration: No undisclosed conflicts", section: "Declaration" },
    declaration_compliance_commitment: { type: "boolean", label: "Declaration: Commit to comply with all policies", section: "Declaration" },
    
    // Signatures
    agent_signature_date: { type: "date", label: "Agent Signature Date", format: "date", required: true, section: "Signatures" },
    witness_name: { type: "string", label: "Witness Name", section: "Signatures" },
    witness_signature_date: { type: "date", label: "Witness Signature Date", format: "date", section: "Signatures" },
    hr_name: { type: "string", label: "HR/Compliance Name", section: "Signatures" },
    hr_signature_date: { type: "date", label: "HR Signature Date", format: "date", section: "Signatures" }
  }
};

// =====================================================
// MASTER TEMPLATE REGISTRY
// =====================================================
export const TEMPLATE_SCHEMAS: Record<string, TemplateSchema> = {
  "FORM_01_SELLER_AUTH": TEMPLATE_01_SELLER_AUTHORIZATION,
  "FORM_02_BUYER_REP": TEMPLATE_02_BUYER_REPRESENTATION,
  "FORM_03_MARKETING": TEMPLATE_03_MARKETING_CONSENT,
  "FORM_04_AGENT_LICENSE": TEMPLATE_04_AGENT_LICENSE,
  "FORM_05_COMPANY_LICENSE": TEMPLATE_05_COMPANY_LICENSE,
  "FORM_06_AGENT_AGREEMENT": TEMPLATE_06_AGENT_AGREEMENT,
  "FORM_07_OFFER": TEMPLATE_07_OFFER_LETTER,
  "FORM_08_MOU": TEMPLATE_08_MOU,
  "FORM_09_RESERVATION": TEMPLATE_09_RESERVATION,
  "FORM_10_CLOSING": TEMPLATE_10_CLOSING_CHECKLIST,
  "FORM_11_NOC": TEMPLATE_11_NOC_TRACKER,
  "FORM_12_INVOICE": TEMPLATE_12_INVOICE,
  "FORM_13_SPLIT": TEMPLATE_13_SPLIT_SHEET,
  "FORM_14_REFUND": TEMPLATE_14_REFUND,
  "FORM_15_LEDGER": TEMPLATE_15_LEDGER,
  "FORM_16_PRIVACY": TEMPLATE_16_PRIVACY,
  "FORM_17_COMPLAINT": TEMPLATE_17_COMPLAINT,
  "FORM_18_GOVERNANCE": TEMPLATE_18_GOVERNANCE
};

// Map template IDs to markdown file paths
export const TEMPLATE_FILES: Record<string, string> = {
  "FORM_01_SELLER_AUTH": "/docs/templates/01_seller_landlord_authorization.md",
  "FORM_02_BUYER_REP": "/docs/templates/02_buyer_tenant_representation_agreement.md",
  "FORM_03_MARKETING": "/docs/templates/03_property_listing_authorization_marketing_consent.md",
  "FORM_04_AGENT_LICENSE": "/docs/templates/04_agent_license_registration_record.md",
  "FORM_05_COMPANY_LICENSE": "/docs/templates/05_company_trade_license_regulatory_record.md",
  "FORM_06_AGENT_AGREEMENT": "/docs/templates/06_agent_to_agent_agency_agreement.md",
  "FORM_07_OFFER": "/docs/templates/07_offer_letter_expression_of_interest.md",
  "FORM_08_MOU": "/docs/templates/08_memorandum_of_understanding_pre_spa.md",
  "FORM_09_RESERVATION": "/docs/templates/09_reservation_booking_form.md",
  "FORM_10_CLOSING": "/docs/templates/10_deal_completion_closing_checklist.md",
  "FORM_11_NOC": "/docs/templates/11_noc_request_clearance_tracker.md",
  "FORM_12_INVOICE": "/docs/templates/12_commission_vat_invoice.md",
  "FORM_13_SPLIT": "/docs/templates/13_commission_authorization_split_sheet.md",
  "FORM_14_REFUND": "/docs/templates/14_refund_cancellation_approval_form.md",
  "FORM_15_LEDGER": "/docs/templates/15_financial_reconciliation_deal_ledger.md",
  "FORM_16_PRIVACY": "/docs/templates/16_client_data_consent_privacy_acknowledgment.md",
  "FORM_17_COMPLAINT": "/docs/templates/17_complaint_dispute_incident_register.md",
  "FORM_18_GOVERNANCE": "/docs/templates/18_internal_agent_governance_pack.md"
};

// Get templates by category
export function getTemplatesByCategory(category: TemplateSchema["category"]): TemplateSchema[] {
  return Object.values(TEMPLATE_SCHEMAS).filter(t => t.category === category);
}

// Get templates by workflow
export function getTemplatesByWorkflow(workflow: "sales" | "leasing" | "co-broker"): TemplateSchema[] {
  return Object.values(TEMPLATE_SCHEMAS).filter(t => t.workflow.includes(workflow));
}

// Get all template categories
export function getTemplateCategories(): { id: TemplateSchema["category"]; label: string; count: number }[] {
  const categories: Record<string, { label: string; count: number }> = {
    onboarding: { label: "Onboarding & Authorizations", count: 0 },
    transaction: { label: "Transaction Documents", count: 0 },
    closing: { label: "Closing & Handover", count: 0 },
    finance: { label: "Finance & Invoicing", count: 0 },
    compliance: { label: "Compliance & Records", count: 0 },
    operations: { label: "Operations & HR", count: 0 }
  };
  
  Object.values(TEMPLATE_SCHEMAS).forEach(t => {
    if (categories[t.category]) {
      categories[t.category].count++;
    }
  });
  
  return Object.entries(categories).map(([id, data]) => ({
    id: id as TemplateSchema["category"],
    label: data.label,
    count: data.count
  }));
}
