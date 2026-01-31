-- Update existing templates with comprehensive ADM-compliant content
-- And add new operational checklists and compliance controls

-- Update Sales Brokerage Agreement with full legal template
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a MiCasa Sales Brokerage Agreement Addendum aligned with Abu Dhabi ADM approved forms.\n\nThis document is an ADDENDUM attached to the signed Brokerage Contract on the approved form. If any term conflicts with the Approved Form Contract or applicable regulations, the Approved Form Contract / regulations prevail.\n\nThe document must include:\n\n1) PARTIES\n- Broker (MiCasa): Legal name, license authority (DMT/ADM), Broker Office License No., address, email, phone, bank account\n- Assigned Agent: Full name, Agent ID/BRN/Registration No., mobile, email\n- Client: Seller/Property Owner OR Buyer (if buyer representation), with full ID details\n\n2) PROPERTY: Type, location/community, unit/plot no., title deed no., asking price\n\n3) SCOPE OF SERVICES: Marketing (subject to permits), viewings, introductions, documentation coordination\n- Explicit exclusions: No legal advice, no signing authority without valid POA\n\n4) TERM/VALIDITY: Start/end dates, non-exclusive by default\n\n5) COMMISSION: Payor (must be contracting party), rate or fixed amount, regulatory cap compliance (2% with AED 500k cap for sales), payment trigger\n\n6) CONDITIONAL DEALS: Commission earned only when conditions satisfied\n\n7) CO-BROKER TERMS: Whether allowed, documentation requirements\n\n8) NON-CIRCUMVENTION: Protection period, introduced party proof requirements\n\n9) CONFIDENTIALITY: Commercial terms, client identities, deal information\n\n10) EXPENSES: Pre-approval requirements with scope, cap, receipts\n\n11) COMPLIANCE: Broker/agent identifiers on all materials\n\n12) DISPUTES: Abu Dhabi law, escalation process\n\n13) SIGNATURES: Client, MiCasa authorized signatory, assigned agent acknowledgment\n\nRegulatory anchors:\n- Brokerage contract required before work (Adrec)\n- Submit for registration within 15 days of signing (Adrec)\n- Broker identifiers on all documents/ads (Adrec)\n- Commission caps per Dari-Services\n\nOutput a complete, copy-paste ready addendum document.',
  input_schema = '{
    "type": "object",
    "required": ["client", "property", "commission", "assigned_agent", "micasa"],
    "properties": {
      "client": {
        "type": "object",
        "required": ["role", "legal_name", "id_type", "id_number"],
        "properties": {
          "role": {"type": "string", "enum": ["seller", "buyer"]},
          "legal_name": {"type": "string"},
          "id_type": {"type": "string", "enum": ["Emirates ID", "Passport", "Trade License"]},
          "id_number": {"type": "string"},
          "nationality": {"type": "string"},
          "entity_name": {"type": "string"},
          "authorized_signatory": {"type": "string"},
          "mobile": {"type": "string"},
          "email": {"type": "string"},
          "address": {"type": "string"}
        }
      },
      "property": {
        "type": "object",
        "required": ["type", "location", "unit_no"],
        "properties": {
          "type": {"type": "string", "enum": ["Unit", "Villa", "Land", "Other"]},
          "location": {"type": "string"},
          "community": {"type": "string"},
          "unit_no": {"type": "string"},
          "plot_no": {"type": "string"},
          "title_deed_no": {"type": "string"},
          "asking_price": {"type": "number"}
        }
      },
      "commission": {
        "type": "object",
        "required": ["payor", "type"],
        "properties": {
          "payor": {"type": "string", "enum": ["seller", "buyer"]},
          "type": {"type": "string", "enum": ["percentage", "fixed"]},
          "rate_percent": {"type": "number"},
          "fixed_amount": {"type": "number"},
          "payment_trigger": {"type": "string", "enum": ["on_signing", "on_transfer", "other"]},
          "payment_trigger_other": {"type": "string"}
        }
      },
      "contract_term": {
        "type": "object",
        "properties": {
          "start_date": {"type": "string", "format": "date"},
          "end_date": {"type": "string", "format": "date"},
          "is_exclusive": {"type": "boolean", "default": false}
        }
      },
      "co_broker": {
        "type": "object",
        "properties": {
          "allowed": {"type": "boolean", "default": true}
        }
      },
      "non_circumvention_months": {"type": "integer", "default": 6},
      "conditional_terms": {"type": "string"},
      "assigned_agent": {
        "type": "object",
        "required": ["full_name", "brn"],
        "properties": {
          "full_name": {"type": "string"},
          "brn": {"type": "string"},
          "mobile": {"type": "string"},
          "email": {"type": "string"}
        }
      },
      "micasa": {
        "type": "object",
        "required": ["license_no"],
        "properties": {
          "legal_name": {"type": "string", "default": "MiCasa Real Estate"},
          "license_authority": {"type": "string", "default": "DMT/ADM"},
          "license_no": {"type": "string"},
          "address": {"type": "string"},
          "email": {"type": "string"},
          "phone": {"type": "string"},
          "bank_name": {"type": "string"},
          "iban": {"type": "string"},
          "account_name": {"type": "string"}
        }
      }
    }
  }'::jsonb,
  refusal_policy = '{"must_refuse_if": ["Request to backdate contract", "Missing client identification", "Commission exceeds regulatory cap", "Request for legal advice"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  tags = ARRAY['brokerage', 'sales', 'adm-compliant', 'approved-form-addendum']::text[]
WHERE prompt_id = 'DOC_BROKERAGE_SALES';

-- Update Leasing Brokerage Agreement with full legal template
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a MiCasa Leasing Brokerage Agreement Addendum aligned with Abu Dhabi ADM approved forms.\n\nThis document is an ADDENDUM attached to the signed Brokerage Contract on the approved form. If any term conflicts with the Approved Form Contract or applicable regulations, the Approved Form Contract / regulations prevail.\n\nThe document must include:\n\n1) PARTIES\n- Broker (MiCasa): Legal name, license details, bank account\n- Assigned Agent: Full name, BRN, contact details\n- Client: Landlord/Property Owner OR Tenant (if tenant representation)\n\n2) PROPERTY: Location, unit no., title deed no., target annual rent, lease term\n\n3) SCOPE: Marketing (subject to permits), viewings, tenant screening, negotiation, tenancy contract registration support (DARI/Tawtheeq)\n- Exclusions: No legal advice, no signing without POA\n\n4) TERM/VALIDITY: Start/end dates, non-exclusive default\n\n5) COMMISSION - PAYOR MUST BE SELECTED (ONE ONLY):\n- Either Landlord OR Tenant pays (NEVER BOTH - regulatory requirement)\n- Fixed amount OR percentage of annual rent\n- Max 5% if not agreed (regulatory cap)\n- Payment trigger\n\n6) NO DOUBLE-SIDE COMMISSION: Explicit statement that MiCasa will NOT collect from both parties\n\n7) CO-BROKER TERMS: Allowed/not allowed, documentation requirements\n\n8) NON-CIRCUMVENTION: Protection period for introduced tenants\n\n9) CONFIDENTIALITY: All deal information protected\n\n10) DISPUTES: Abu Dhabi law, escalation process\n\n11) SIGNATURES: Client, MiCasa, Agent acknowledgment\n\nCRITICAL RULES:\n- Cannot combine landlord + tenant commission (Dari-Services)\n- Commission cap: max 5% of annual rent if not agreed\n- Tenancy must be registered via DARI (auto-added to Tawtheeq)\n\nOutput a complete, copy-paste ready addendum document.',
  input_schema = '{
    "type": "object",
    "required": ["client", "property", "commission", "assigned_agent", "micasa"],
    "properties": {
      "client": {
        "type": "object",
        "required": ["role", "legal_name", "id_type", "id_number"],
        "properties": {
          "role": {"type": "string", "enum": ["landlord", "tenant"]},
          "legal_name": {"type": "string"},
          "id_type": {"type": "string", "enum": ["Emirates ID", "Passport", "Trade License"]},
          "id_number": {"type": "string"},
          "nationality": {"type": "string"},
          "is_owner": {"type": "boolean", "default": true},
          "poa_reference": {"type": "string"},
          "entity_name": {"type": "string"},
          "authorized_signatory": {"type": "string"},
          "mobile": {"type": "string"},
          "email": {"type": "string"},
          "address": {"type": "string"}
        }
      },
      "property": {
        "type": "object",
        "required": ["location", "unit_no", "target_rent"],
        "properties": {
          "location": {"type": "string"},
          "community": {"type": "string"},
          "unit_no": {"type": "string"},
          "title_deed_no": {"type": "string"},
          "tawtheeq_no": {"type": "string"},
          "area_sqft": {"type": "number"},
          "bedrooms": {"type": "integer"},
          "furnished": {"type": "string", "enum": ["furnished", "unfurnished", "semi-furnished"]},
          "target_rent": {"type": "number"},
          "lease_start": {"type": "string", "format": "date"},
          "lease_end": {"type": "string", "format": "date"}
        }
      },
      "commission": {
        "type": "object",
        "required": ["payor", "type"],
        "properties": {
          "payor": {"type": "string", "enum": ["landlord", "tenant"]},
          "type": {"type": "string", "enum": ["percentage", "fixed"]},
          "rate_percent": {"type": "number"},
          "fixed_amount": {"type": "number"},
          "payment_trigger": {"type": "string", "enum": ["on_signing", "on_tawtheeq", "other"]}
        }
      },
      "contract_term": {
        "type": "object",
        "properties": {
          "start_date": {"type": "string", "format": "date"},
          "end_date": {"type": "string", "format": "date"},
          "is_exclusive": {"type": "boolean", "default": false}
        }
      },
      "co_broker": {
        "type": "object",
        "properties": {
          "allowed": {"type": "boolean", "default": true}
        }
      },
      "non_circumvention_months": {"type": "integer", "default": 6},
      "tenant_criteria": {
        "type": "object",
        "properties": {
          "preferred_nationality": {"type": "string"},
          "family_only": {"type": "boolean"},
          "pets_allowed": {"type": "boolean"},
          "minimum_lease_months": {"type": "integer"}
        }
      },
      "assigned_agent": {
        "type": "object",
        "required": ["full_name", "brn"],
        "properties": {
          "full_name": {"type": "string"},
          "brn": {"type": "string"},
          "mobile": {"type": "string"},
          "email": {"type": "string"}
        }
      },
      "micasa": {
        "type": "object",
        "required": ["license_no"],
        "properties": {
          "legal_name": {"type": "string", "default": "MiCasa Real Estate"},
          "license_authority": {"type": "string", "default": "DMT/ADM"},
          "license_no": {"type": "string"},
          "address": {"type": "string"},
          "email": {"type": "string"},
          "phone": {"type": "string"},
          "bank_name": {"type": "string"},
          "iban": {"type": "string"}
        }
      }
    }
  }'::jsonb,
  refusal_policy = '{"must_refuse_if": ["Request to collect commission from both landlord AND tenant", "Request to backdate contract", "Missing client identification", "Commission exceeds 5% without agreement"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  tags = ARRAY['brokerage', 'leasing', 'adm-compliant', 'approved-form-addendum', 'tawtheeq']::text[]
WHERE prompt_id = 'DOC_BROKERAGE_LEASING';

-- Update Agent-to-Agent Master Agreement
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a MiCasa Master Agent-to-Agent Cooperation Agreement for Abu Dhabi real estate.\n\nThis agreement governs broker-to-broker cooperation and must be combined with a Property Annex for each specific deal.\n\n1) PARTIES\n- Party A (Main Broker OR Cooperating Broker): Company name, license authority, license no., ORN, address, authorized signatory, agent handling details\n- Party B (Sub-Broker OR Cooperating Broker): Same details\n\n2) PURPOSE: Governs cooperation on properties/clients described in attached Property Annexes\n\n3) AUTHORITY & CLIENT OWNERSHIP (NO ASSUMPTIONS):\n- Each party confirms it is licensed\n- Each party has written authority from its own client where required\n- No party may claim commission from a party that did not authorize it under signed brokerage contract\n\n4) NON-CIRCUMVENTION (BROKER-TO-BROKER):\n- During annex validity and for specified period after expiry\n- Neither party will bypass the other for introduced clients\n- Owner/landlord contact details not to be shared outside transaction requirements\n\n5) CONFIDENTIALITY: All deal information, pricing, client identities protected\n\n6) COMMISSION SHARING: Defined ONLY in the Annex (default if silent = NO cooperation agreed)\n\n7) DISPUTE PREVENTION - REQUIRED PROOF:\n- Signed annex + email confirmation\n- Buyer/tenant registration email\n- Viewing logs\n- Written offer trail\n\n8) PAYMENT FLOW:\n- Broker with brokerage contract from payor collects commission\n- That broker pays other broker share against tax invoice + split confirmation\n\n9) COMPLIANCE: Each party must include broker/agent identifiers on materials\n\n10) GOVERNING LAW: Abu Dhabi, UAE\n\n11) SIGNATURES: Both party authorized signatories\n\nOutput a professional master agreement ready for signature.',
  input_schema = '{
    "type": "object",
    "required": ["party_a", "party_b", "effective_date"],
    "properties": {
      "party_a": {
        "type": "object",
        "required": ["company_name", "license_no", "authorized_signatory"],
        "properties": {
          "company_name": {"type": "string"},
          "license_authority": {"type": "string"},
          "license_no": {"type": "string"},
          "orn": {"type": "string"},
          "address": {"type": "string"},
          "authorized_signatory": {"type": "string"},
          "signatory_title": {"type": "string"},
          "agent_name": {"type": "string"},
          "agent_brn": {"type": "string"},
          "agent_mobile": {"type": "string"},
          "agent_email": {"type": "string"}
        }
      },
      "party_b": {
        "type": "object",
        "required": ["company_name", "license_no", "authorized_signatory"],
        "properties": {
          "company_name": {"type": "string"},
          "license_authority": {"type": "string"},
          "license_no": {"type": "string"},
          "orn": {"type": "string"},
          "address": {"type": "string"},
          "authorized_signatory": {"type": "string"},
          "signatory_title": {"type": "string"},
          "agent_name": {"type": "string"},
          "agent_brn": {"type": "string"},
          "agent_mobile": {"type": "string"},
          "agent_email": {"type": "string"}
        }
      },
      "effective_date": {"type": "string", "format": "date"},
      "non_circumvention_months": {"type": "integer", "default": 6},
      "territory": {"type": "string", "default": "Abu Dhabi Emirate"}
    }
  }'::jsonb,
  tags = ARRAY['agent-cooperation', 'inter-broker', 'master-agreement', 'adm-compliant']::text[]
WHERE prompt_id = 'DOC_AGENT_MASTER';

-- Update Agent-to-Agent Property Annex
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a MiCasa Agent-to-Agent Property Annex to attach to the Master Cooperation Agreement.\n\nThis annex covers a specific property/deal and defines the commission split.\n\n1) ANNEX NO. & DATE\n\n2) DEAL TYPE: Sales or Leasing\n\n3) PROPERTY: Community/location, unit/plot no., title deed no., asking price (sales) or annual rent (leasing)\n\n4) CLIENT ROLES: Which party represents Seller/Landlord vs Buyer/Tenant\n\n5) MAIN BROKERAGE CONTRACT REFERENCE (if applicable): Contract no., type, dates\n\n6) COMMISSION PAYOR (MUST BE ONE PARTY FOR LEASING):\n- Sales: Seller pays / Buyer pays / Other (must be under signed authority)\n- Leasing: Landlord pays / Tenant pays (ONE ONLY)\n\n7) GROSS COMMISSION: Percentage OR fixed amount\n\n8) SPLIT AGREEMENT: Party A share %, Party B share %\n\n9) CLIENT INTRODUCTION/REGISTRATION:\n- Introduced party name (Buyer/Tenant)\n- ID (last 4 digits)\n- Introduction date/time\n- Introduction method (Email/WhatsApp export/Other)\n\n10) PAYMENT & INVOICING:\n- Collecting broker (who invoices payor)\n- Paying broker (who pays the other)\n- Invoice details\n- Payment trigger (on signing / on transfer / on tenancy registration)\n\n11) VALIDITY: Annex valid until date/time\n\n12) SIGNATURES: Both parties\n\nCRITICAL: Commission split must reconcile to 100%. Leasing cannot have both landlord and tenant as payors.',
  input_schema = '{
    "type": "object",
    "required": ["master_agreement_ref", "deal_type", "property", "client_roles", "commission"],
    "properties": {
      "annex_no": {"type": "string"},
      "master_agreement_ref": {"type": "string"},
      "master_agreement_date": {"type": "string", "format": "date"},
      "deal_type": {"type": "string", "enum": ["sales", "leasing"]},
      "property": {
        "type": "object",
        "required": ["location", "unit_no"],
        "properties": {
          "location": {"type": "string"},
          "community": {"type": "string"},
          "unit_no": {"type": "string"},
          "plot_no": {"type": "string"},
          "title_deed_no": {"type": "string"},
          "asking_price": {"type": "number"},
          "annual_rent": {"type": "number"}
        }
      },
      "client_roles": {
        "type": "object",
        "properties": {
          "party_a_represents": {"type": "string", "enum": ["seller", "landlord", "buyer", "tenant"]},
          "party_b_represents": {"type": "string", "enum": ["seller", "landlord", "buyer", "tenant"]}
        }
      },
      "brokerage_contract_ref": {
        "type": "object",
        "properties": {
          "contract_no": {"type": "string"},
          "contract_type": {"type": "string", "enum": ["to_sell", "to_purchase", "lease_brokerage"]},
          "start_date": {"type": "string", "format": "date"},
          "end_date": {"type": "string", "format": "date"}
        }
      },
      "commission": {
        "type": "object",
        "required": ["payor", "gross_percent", "party_a_share", "party_b_share"],
        "properties": {
          "payor": {"type": "string", "enum": ["seller", "landlord", "buyer", "tenant"]},
          "gross_percent": {"type": "number"},
          "gross_fixed": {"type": "number"},
          "party_a_share": {"type": "number"},
          "party_b_share": {"type": "number"}
        }
      },
      "introduced_party": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "id_last_4": {"type": "string"},
          "intro_date": {"type": "string", "format": "date"},
          "intro_time": {"type": "string"},
          "intro_method": {"type": "string", "enum": ["email", "whatsapp", "other"]}
        }
      },
      "payment": {
        "type": "object",
        "properties": {
          "collecting_broker": {"type": "string", "enum": ["party_a", "party_b"]},
          "paying_broker": {"type": "string", "enum": ["party_a", "party_b"]},
          "payment_trigger": {"type": "string", "enum": ["on_signing", "on_transfer", "on_registration"]}
        }
      },
      "validity_until": {"type": "string", "format": "date-time"}
    }
  }'::jsonb,
  refusal_policy = '{"must_refuse_if": ["Commission split does not total 100%", "Leasing with both landlord and tenant as payors"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  tags = ARRAY['agent-cooperation', 'deal-annex', 'commission-split', 'adm-compliant']::text[]
WHERE prompt_id = 'DOC_AGENT_ANNEX';

-- Update Buyer Offer Letter
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a Buyer Offer Letter (Non-Binding Intent) for Abu Dhabi property.\n\nDocument title: Buyer Offer Letter (Non-Binding Intent) – [Property Ref]\n\n1) HEADER: Date, To (Seller/Rep/Listing Broker), Property address, Offeror (Buyer) details\n\n2) OFFER (NON-BINDING):\n- Offered purchase price: AED [amount]\n- Deposit (if agreed later): AED [amount] and method\n\n3) KEY TERMS:\n- Payment method: Cash / Mortgage / Other\n- Requested completion/transfer date (target)\n- Inclusions/exclusions (furniture, appliances)\n- Conditions (if any): finance approval / NOC / inspection / etc.\n\n4) VALIDITY: Valid until specific date/time (local time) then lapses unless extended in writing\n\n5) CONFIDENTIALITY: Offer and negotiations are confidential\n\n6) NON-BINDING NATURE: Explicit statement that this letter records intent only and does NOT create a binding sale contract. Binding agreement arises only upon signing the applicable definitive contract.\n\n7) SIGNATURE: Buyer signature, name, date\n\nOutput a professional, non-binding offer letter ready for signature.',
  input_schema = '{
    "type": "object",
    "required": ["buyer", "property", "offer"],
    "properties": {
      "addressed_to": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "role": {"type": "string", "enum": ["seller", "seller_representative", "listing_broker"]}
        }
      },
      "property": {
        "type": "object",
        "required": ["community", "unit_no"],
        "properties": {
          "community": {"type": "string"},
          "building": {"type": "string"},
          "unit_no": {"type": "string"},
          "reference": {"type": "string"}
        }
      },
      "buyer": {
        "type": "object",
        "required": ["full_name"],
        "properties": {
          "full_name": {"type": "string"},
          "id_type": {"type": "string", "enum": ["Emirates ID", "Passport"]},
          "id_number": {"type": "string"},
          "mobile": {"type": "string"},
          "email": {"type": "string"}
        }
      },
      "offer": {
        "type": "object",
        "required": ["purchase_price"],
        "properties": {
          "purchase_price": {"type": "number"},
          "currency": {"type": "string", "default": "AED"},
          "deposit_amount": {"type": "number"},
          "deposit_method": {"type": "string"}
        }
      },
      "terms": {
        "type": "object",
        "properties": {
          "payment_method": {"type": "string", "enum": ["cash", "mortgage", "other"]},
          "payment_method_other": {"type": "string"},
          "target_completion_date": {"type": "string", "format": "date"},
          "inclusions": {"type": "string"},
          "exclusions": {"type": "string"},
          "conditions": {"type": "string"}
        }
      },
      "validity_until": {"type": "string", "format": "date-time"},
      "date": {"type": "string", "format": "date"}
    }
  }'::jsonb,
  tags = ARRAY['offer', 'buyer', 'non-binding', 'sales']::text[]
WHERE prompt_id = 'DOC_BUYER_OFFER';

-- Update Tenant Offer Letter
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a Tenant Offer / Intent Letter (Non-Binding) for Abu Dhabi property.\n\nDocument title: Tenant Offer / Intent Letter (Non-Binding) – [Property Ref]\n\n1) HEADER: Date, To (Landlord/Rep/Listing Broker), Property address, Offeror (Tenant) details\n\n2) OFFER (NON-BINDING):\n- Proposed annual rent: AED [amount]\n- Lease term: From [date] to [date]\n- Payment: Number of cheques (1/2/3/other)\n- Security deposit: AED [amount] (subject to contract)\n- Commission payer: Landlord or Tenant (as per brokerage authority)\n\n3) MOVE-IN & CONDITIONS:\n- Move-in date target\n- Special requests (parking, maintenance, painting, etc.)\n- Conditions (if any)\n\n4) VALIDITY: Valid until specific date/time (local time) unless extended in writing\n\n5) NON-BINDING NATURE: Explicit statement that this letter records intent only and is NOT a binding tenancy contract. Binding commitment arises only upon signing/approving the tenancy contract.\n\n6) SIGNATURE: Tenant signature, name, date\n\nOutput a professional, non-binding intent letter ready for signature.',
  input_schema = '{
    "type": "object",
    "required": ["tenant", "property", "offer"],
    "properties": {
      "addressed_to": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "role": {"type": "string", "enum": ["landlord", "landlord_representative", "listing_broker"]}
        }
      },
      "property": {
        "type": "object",
        "required": ["community", "unit_no"],
        "properties": {
          "community": {"type": "string"},
          "building": {"type": "string"},
          "unit_no": {"type": "string"},
          "reference": {"type": "string"}
        }
      },
      "tenant": {
        "type": "object",
        "required": ["full_name"],
        "properties": {
          "full_name": {"type": "string"},
          "id_type": {"type": "string", "enum": ["Emirates ID", "Passport"]},
          "id_number": {"type": "string"},
          "mobile": {"type": "string"},
          "email": {"type": "string"}
        }
      },
      "offer": {
        "type": "object",
        "required": ["annual_rent"],
        "properties": {
          "annual_rent": {"type": "number"},
          "currency": {"type": "string", "default": "AED"},
          "lease_start": {"type": "string", "format": "date"},
          "lease_end": {"type": "string", "format": "date"},
          "payment_cheques": {"type": "string", "enum": ["1", "2", "3", "4", "other"]},
          "security_deposit": {"type": "number"},
          "commission_payer": {"type": "string", "enum": ["landlord", "tenant"]}
        }
      },
      "terms": {
        "type": "object",
        "properties": {
          "move_in_date": {"type": "string", "format": "date"},
          "special_requests": {"type": "string"},
          "conditions": {"type": "string"}
        }
      },
      "validity_until": {"type": "string", "format": "date-time"},
      "date": {"type": "string", "format": "date"}
    }
  }'::jsonb,
  tags = ARRAY['offer', 'tenant', 'non-binding', 'leasing']::text[]
WHERE prompt_id = 'DOC_TENANT_OFFER';

-- Update Commission Invoice
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a Commission Invoice for MiCasa Real Estate brokerage services.\n\nINVOICE TITLE: Commission Invoice – Real Estate Brokerage Services\n\n1) INVOICE HEADER:\n- Invoice No., Date, Due Date\n\n2) FROM (SUPPLIER - MiCasa):\n- Legal name, License No., TRN (if VAT registered), Address, Email, Phone\n\n3) TO (CUSTOMER / COMMISSION PAYOR):\n- Name/Entity, Address, ID (EID/Passport or Trade License), Email, Phone\n\n4) TRANSACTION DETAILS:\n- Deal Type: Sale or Lease\n- Property: Community, Unit No.\n- Contract Reference: Brokerage Contract No. / Tenancy Contract No. / SPA Ref\n- Closing Date\n\n5) COMMISSION CALCULATION:\n- Basis: Sale Price / Annual Rent / Fixed\n- Base Amount (AED)\n- Commission Rate (%) OR Fixed Commission (AED)\n- Subtotal (AED)\n\n6) VAT:\n- VAT not applicable, OR\n- VAT applicable at 5% (UAE standard rate)\n- VAT Amount (AED)\n\n7) TOTAL DUE (AED)\n\n8) PAYMENT INSTRUCTIONS:\n- Bank name, Account name, IBAN\n- Reference to include: Invoice No. + Property Ref\n\n9) AUTHORIZED SIGNATORY & DATE\n\nOutput a professional commission invoice ready for issuance.',
  input_schema = '{
    "type": "object",
    "required": ["customer", "transaction", "commission"],
    "properties": {
      "invoice_no": {"type": "string"},
      "invoice_date": {"type": "string", "format": "date"},
      "due_date": {"type": "string", "format": "date"},
      "micasa": {
        "type": "object",
        "properties": {
          "legal_name": {"type": "string", "default": "MiCasa Real Estate"},
          "license_no": {"type": "string"},
          "trn": {"type": "string"},
          "is_vat_registered": {"type": "boolean", "default": false},
          "address": {"type": "string"},
          "email": {"type": "string"},
          "phone": {"type": "string"},
          "bank_name": {"type": "string"},
          "account_name": {"type": "string"},
          "iban": {"type": "string"}
        }
      },
      "customer": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": {"type": "string"},
          "entity_type": {"type": "string", "enum": ["individual", "company"]},
          "address": {"type": "string"},
          "id_number": {"type": "string"},
          "email": {"type": "string"},
          "phone": {"type": "string"}
        }
      },
      "transaction": {
        "type": "object",
        "required": ["deal_type", "property"],
        "properties": {
          "deal_type": {"type": "string", "enum": ["sale", "lease"]},
          "property": {"type": "string"},
          "contract_reference": {"type": "string"},
          "closing_date": {"type": "string", "format": "date"}
        }
      },
      "commission": {
        "type": "object",
        "required": ["basis"],
        "properties": {
          "basis": {"type": "string", "enum": ["sale_price", "annual_rent", "fixed"]},
          "base_amount": {"type": "number"},
          "rate_percent": {"type": "number"},
          "fixed_amount": {"type": "number"},
          "subtotal": {"type": "number"},
          "apply_vat": {"type": "boolean", "default": false},
          "vat_amount": {"type": "number"},
          "total_due": {"type": "number"}
        }
      }
    }
  }'::jsonb,
  tags = ARRAY['invoice', 'commission', 'finance', 'vat']::text[]
WHERE prompt_id = 'DOC_COMMISSION_INVOICE';

-- Update Commission Split Confirmation
UPDATE bos_manifest_prompts 
SET 
  prompt = E'Generate a Commission Split Confirmation document for MiCasa.\n\nDOCUMENT TITLE: Commission Split Confirmation – [Property Ref]\n\n1) DEAL INFORMATION:\n- Deal Type: Sale or Lease\n- Property: Community, Unit No.\n- Closing/Registration Date\n- Gross Commission Collected (AED)\n- VAT on Commission (if applicable) (AED)\n- Net Commission (AED)\n\n2) EXTERNAL CO-BROKER SPLIT (if applicable):\n- Co-Broker Company name\n- Annex Ref / Agreement Ref\n- Co-Broker Share: % or AED amount\n- Payment Trigger Met: Yes/No\n- Paid Date / Method / Ref\n\n3) INTERNAL AGENT SPLIT:\n- Assigned Agent: Name + BRN/ID\n- Agent Share: % or AED amount\n- Company Share: % or AED amount\n\n4) APPROVALS:\n- Prepared By: Ops/Admin Name + Signature + Date\n- Agent Acknowledgment: Agent + Signature + Date\n- COO/Finance Approval: Name + Signature + Date\n\nCRITICAL: All splits must reconcile to 100% of the distributable commission.\n\nOutput a professional split confirmation document.',
  input_schema = '{
    "type": "object",
    "required": ["deal", "commission", "internal_split"],
    "properties": {
      "deal": {
        "type": "object",
        "required": ["type", "property"],
        "properties": {
          "type": {"type": "string", "enum": ["sale", "lease"]},
          "property": {"type": "string"},
          "property_ref": {"type": "string"},
          "closing_date": {"type": "string", "format": "date"}
        }
      },
      "commission": {
        "type": "object",
        "required": ["gross_amount"],
        "properties": {
          "gross_amount": {"type": "number"},
          "currency": {"type": "string", "default": "AED"},
          "vat_amount": {"type": "number"},
          "net_amount": {"type": "number"}
        }
      },
      "co_broker_split": {
        "type": "object",
        "properties": {
          "has_co_broker": {"type": "boolean", "default": false},
          "co_broker_company": {"type": "string"},
          "annex_ref": {"type": "string"},
          "share_percent": {"type": "number"},
          "share_amount": {"type": "number"},
          "payment_trigger_met": {"type": "boolean"},
          "paid_date": {"type": "string", "format": "date"},
          "payment_method": {"type": "string"},
          "payment_ref": {"type": "string"}
        }
      },
      "internal_split": {
        "type": "object",
        "required": ["agent_name", "agent_share_percent", "company_share_percent"],
        "properties": {
          "agent_name": {"type": "string"},
          "agent_brn": {"type": "string"},
          "agent_share_percent": {"type": "number"},
          "agent_share_amount": {"type": "number"},
          "company_share_percent": {"type": "number"},
          "company_share_amount": {"type": "number"}
        }
      },
      "approvals": {
        "type": "object",
        "properties": {
          "prepared_by": {"type": "string"},
          "agent_acknowledged": {"type": "boolean"},
          "coo_approved": {"type": "boolean"}
        }
      },
      "date": {"type": "string", "format": "date"}
    }
  }'::jsonb,
  refusal_policy = '{"must_refuse_if": ["Splits do not reconcile to 100%"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  tags = ARRAY['commission', 'split', 'internal', 'co-broker']::text[]
WHERE prompt_id = 'DOC_COMMISSION_SPLIT';