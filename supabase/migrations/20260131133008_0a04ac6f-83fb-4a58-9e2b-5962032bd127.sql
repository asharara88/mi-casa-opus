-- Insert missing document templates into bos_manifest_prompts

-- Agent-to-Agent Master Agreement
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_AGENT_MASTER',
  'DOCUMENT_TEMPLATES',
  'Agent-to-Agent Master Agreement',
  'Generate the master cooperation agreement between two licensed brokerages for property referrals and co-brokerage arrangements',
  E'Generate a Master Agent-to-Agent Cooperation Agreement for Abu Dhabi real estate transactions.\n\nThis agreement establishes the framework for cooperation between two licensed brokerages. The document must:\n- Reference both brokerages ADM license numbers\n- Define referral and co-brokerage terms\n- Specify default commission split ratios\n- Include confidentiality and non-circumvention clauses\n- Comply with ADM regulations for inter-broker cooperation\n\nOutput a professional, ADM-compliant master agreement ready for signature.',
  '{
    "type": "object",
    "required": ["party_a", "party_b", "effective_date", "default_split"],
    "properties": {
      "party_a": {
        "type": "object",
        "required": ["brokerage_name", "license_no", "authorized_signatory"],
        "properties": {
          "brokerage_name": {"type": "string"},
          "license_no": {"type": "string"},
          "authorized_signatory": {"type": "string"},
          "contact_email": {"type": "string"},
          "contact_phone": {"type": "string"}
        }
      },
      "party_b": {
        "type": "object",
        "required": ["brokerage_name", "license_no", "authorized_signatory"],
        "properties": {
          "brokerage_name": {"type": "string"},
          "license_no": {"type": "string"},
          "authorized_signatory": {"type": "string"},
          "contact_email": {"type": "string"},
          "contact_phone": {"type": "string"}
        }
      },
      "effective_date": {"type": "string", "format": "date"},
      "term_months": {"type": "integer", "default": 12},
      "default_split": {
        "type": "object",
        "properties": {
          "referring_broker_percent": {"type": "number"},
          "receiving_broker_percent": {"type": "number"}
        }
      },
      "territory": {"type": "string", "default": "Abu Dhabi Emirate"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "effective_date": {"type": "string"},
      "expiry_date": {"type": "string"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["Request to backdate agreement", "Missing ADM license numbers"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY[]::text[],
  ARRAY['agent-cooperation', 'inter-broker', 'referral']::text[],
  30,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Agent-to-Agent Annex (Deal-Specific)
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_AGENT_ANNEX',
  'DOCUMENT_TEMPLATES',
  'Agent-to-Agent Deal Annex',
  'Generate a deal-specific annex to an existing master agent-to-agent agreement, specifying commission split for a particular transaction',
  E'Generate a Deal-Specific Annex to an existing Agent-to-Agent Master Agreement.\n\nThis annex documents the agreed commission split for a specific property transaction. The document must:\n- Reference the master agreement\n- Identify the specific property and transaction\n- Document the negotiated commission split\n- Specify payment terms and conditions\n- Include both parties acknowledgment\n\nOutput a professional annex document ready for signature.',
  '{
    "type": "object",
    "required": ["master_agreement_ref", "property", "transaction", "commission_split"],
    "properties": {
      "master_agreement_ref": {"type": "string"},
      "master_agreement_date": {"type": "string", "format": "date"},
      "property": {
        "type": "object",
        "required": ["address", "type"],
        "properties": {
          "address": {"type": "string"},
          "type": {"type": "string"},
          "plot_no": {"type": "string"},
          "municipality_no": {"type": "string"}
        }
      },
      "transaction": {
        "type": "object",
        "required": ["type", "value"],
        "properties": {
          "type": {"type": "string", "enum": ["sale", "lease"]},
          "value": {"type": "number"},
          "currency": {"type": "string", "default": "AED"}
        }
      },
      "commission_split": {
        "type": "object",
        "required": ["total_commission_percent", "party_a_share", "party_b_share"],
        "properties": {
          "total_commission_percent": {"type": "number"},
          "party_a_share": {"type": "number"},
          "party_b_share": {"type": "number"},
          "party_a_role": {"type": "string"},
          "party_b_role": {"type": "string"}
        }
      },
      "payment_terms": {"type": "string"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "annex_number": {"type": "string"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["Commission split does not total 100%", "Missing property identification"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY['DOC_AGENT_MASTER']::text[],
  ARRAY['agent-cooperation', 'deal-specific', 'commission-split']::text[],
  31,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Commission Split Agreement
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_COMMISSION_SPLIT',
  'DOCUMENT_TEMPLATES',
  'Internal Commission Split Agreement',
  'Generate an internal commission split agreement between brokers within the same brokerage for a specific deal',
  E'Generate an Internal Commission Split Agreement for MiCasa Properties.\n\nThis document formalizes the commission distribution between agents involved in a deal. The document must:\n- Identify all participating brokers and their roles\n- Specify exact percentage or amount for each party\n- Ensure total equals 100% of the agent commission portion\n- Reference the underlying deal and expected commission\n- Include payment timeline tied to commission receipt\n\nOutput a clear, fair commission split document.',
  '{
    "type": "object",
    "required": ["deal_reference", "total_commission", "participants"],
    "properties": {
      "deal_reference": {"type": "string"},
      "deal_type": {"type": "string", "enum": ["sale", "lease"]},
      "property_reference": {"type": "string"},
      "total_commission": {
        "type": "object",
        "required": ["gross_amount", "currency"],
        "properties": {
          "gross_amount": {"type": "number"},
          "currency": {"type": "string", "default": "AED"},
          "vat_applicable": {"type": "boolean"},
          "brokerage_share_percent": {"type": "number"}
        }
      },
      "participants": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["broker_name", "role", "split_percent"],
          "properties": {
            "broker_name": {"type": "string"},
            "broker_id": {"type": "string"},
            "role": {"type": "string"},
            "split_percent": {"type": "number"},
            "fixed_amount": {"type": "number"}
          }
        }
      },
      "payment_schedule": {"type": "string"},
      "conditions": {"type": "string"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "total_allocated_percent": {"type": "number"},
      "breakdown_table": {"type": "string"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["Splits do not reconcile to 100%", "Missing broker identification"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY[]::text[],
  ARRAY['commission', 'internal', 'broker-split']::text[],
  52,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Seller Mandate Letter
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_SELLER_MANDATE',
  'DOCUMENT_TEMPLATES',
  'Seller Mandate / Listing Authority',
  'Generate a seller mandate letter authorizing MiCasa to market and sell a property',
  E'Generate a Seller Mandate Letter (Listing Authority) for Abu Dhabi property sales.\n\nThis document authorizes MiCasa Properties to act as the exclusive or non-exclusive agent for selling the property. The document must:\n- Clearly state exclusive vs non-exclusive mandate\n- Define the mandate period\n- Specify the asking price and acceptable terms\n- Detail marketing authorizations\n- Include seller representations about ownership\n- Reference ADM regulations for property listings\n\nOutput a professional mandate letter compliant with ADM requirements.',
  '{
    "type": "object",
    "required": ["seller", "property", "mandate_terms"],
    "properties": {
      "seller": {
        "type": "object",
        "required": ["name", "id_type", "id_number"],
        "properties": {
          "name": {"type": "string"},
          "id_type": {"type": "string", "enum": ["Emirates ID", "Passport"]},
          "id_number": {"type": "string"},
          "contact_phone": {"type": "string"},
          "contact_email": {"type": "string"}
        }
      },
      "property": {
        "type": "object",
        "required": ["address", "type", "title_deed_no"],
        "properties": {
          "address": {"type": "string"},
          "type": {"type": "string"},
          "title_deed_no": {"type": "string"},
          "plot_no": {"type": "string"},
          "area_sqft": {"type": "number"},
          "bedrooms": {"type": "integer"}
        }
      },
      "mandate_terms": {
        "type": "object",
        "required": ["type", "duration_months", "asking_price"],
        "properties": {
          "type": {"type": "string", "enum": ["exclusive", "non-exclusive"]},
          "duration_months": {"type": "integer"},
          "asking_price": {"type": "number"},
          "minimum_acceptable": {"type": "number"},
          "currency": {"type": "string", "default": "AED"}
        }
      },
      "marketing_permissions": {
        "type": "object",
        "properties": {
          "online_portals": {"type": "boolean", "default": true},
          "social_media": {"type": "boolean", "default": true},
          "signage": {"type": "boolean", "default": false},
          "open_house": {"type": "boolean", "default": false}
        }
      }
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "mandate_type": {"type": "string"},
      "expiry_date": {"type": "string"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["Missing title deed reference", "Missing seller identification"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY[]::text[],
  ARRAY['mandate', 'listing', 'seller-authorization']::text[],
  10,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Landlord Mandate Letter
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_LANDLORD_MANDATE',
  'DOCUMENT_TEMPLATES',
  'Landlord Mandate / Leasing Authority',
  'Generate a landlord mandate letter authorizing MiCasa to market and lease a property',
  E'Generate a Landlord Mandate Letter (Leasing Authority) for Abu Dhabi property rentals.\n\nThis document authorizes MiCasa Properties to act as the letting agent for the property. The document must:\n- Define exclusive vs non-exclusive leasing rights\n- Specify the mandate period\n- State the target rental and acceptable terms\n- Detail tenant screening criteria\n- Include landlord representations about ownership/authority\n- Reference Tawtheeq registration requirements\n\nOutput a professional mandate letter for leasing.',
  '{
    "type": "object",
    "required": ["landlord", "property", "mandate_terms"],
    "properties": {
      "landlord": {
        "type": "object",
        "required": ["name", "id_type", "id_number"],
        "properties": {
          "name": {"type": "string"},
          "id_type": {"type": "string", "enum": ["Emirates ID", "Passport"]},
          "id_number": {"type": "string"},
          "is_owner": {"type": "boolean", "default": true},
          "poa_reference": {"type": "string"},
          "contact_phone": {"type": "string"},
          "contact_email": {"type": "string"}
        }
      },
      "property": {
        "type": "object",
        "required": ["address", "type"],
        "properties": {
          "address": {"type": "string"},
          "type": {"type": "string"},
          "title_deed_no": {"type": "string"},
          "tawtheeq_no": {"type": "string"},
          "area_sqft": {"type": "number"},
          "bedrooms": {"type": "integer"},
          "furnished": {"type": "string", "enum": ["furnished", "unfurnished", "semi-furnished"]}
        }
      },
      "mandate_terms": {
        "type": "object",
        "required": ["type", "duration_months", "target_rent"],
        "properties": {
          "type": {"type": "string", "enum": ["exclusive", "non-exclusive"]},
          "duration_months": {"type": "integer"},
          "target_rent": {"type": "number"},
          "minimum_rent": {"type": "number"},
          "rent_frequency": {"type": "string", "enum": ["annual", "semi-annual", "quarterly", "monthly"]},
          "currency": {"type": "string", "default": "AED"}
        }
      },
      "tenant_criteria": {
        "type": "object",
        "properties": {
          "preferred_nationality": {"type": "string"},
          "family_only": {"type": "boolean"},
          "pets_allowed": {"type": "boolean"},
          "minimum_lease_months": {"type": "integer"}
        }
      }
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "mandate_type": {"type": "string"},
      "expiry_date": {"type": "string"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["Missing property identification", "Missing landlord identification"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY[]::text[],
  ARRAY['mandate', 'leasing', 'landlord-authorization']::text[],
  11,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Viewing Confirmation
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_VIEWING_CONFIRMATION',
  'DOCUMENT_TEMPLATES',
  'Property Viewing Confirmation',
  'Generate a viewing confirmation document acknowledging property visit',
  E'Generate a Property Viewing Confirmation document.\n\nThis document confirms that a viewing took place and captures basic feedback. The document must:\n- Record date, time, and duration of viewing\n- Identify the property viewed\n- Record attendees (client, agent)\n- Capture initial feedback or interest level\n- Serve as evidence of showing activity\n\nOutput a simple, professional viewing confirmation.',
  '{
    "type": "object",
    "required": ["viewing_details", "property", "attendees"],
    "properties": {
      "viewing_details": {
        "type": "object",
        "required": ["date", "time"],
        "properties": {
          "date": {"type": "string", "format": "date"},
          "time": {"type": "string"},
          "duration_minutes": {"type": "integer"}
        }
      },
      "property": {
        "type": "object",
        "required": ["address", "reference"],
        "properties": {
          "address": {"type": "string"},
          "reference": {"type": "string"},
          "type": {"type": "string"}
        }
      },
      "attendees": {
        "type": "object",
        "required": ["client_name", "agent_name"],
        "properties": {
          "client_name": {"type": "string"},
          "client_phone": {"type": "string"},
          "agent_name": {"type": "string"},
          "agent_id": {"type": "string"}
        }
      },
      "feedback": {
        "type": "object",
        "properties": {
          "interest_level": {"type": "string", "enum": ["high", "medium", "low", "none"]},
          "comments": {"type": "string"},
          "follow_up_required": {"type": "boolean"}
        }
      }
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "confirmation_number": {"type": "string"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['viewing', 'confirmation', 'evidence']::text[],
  40,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Handover Checklist
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_HANDOVER_CHECKLIST',
  'DOCUMENT_TEMPLATES',
  'Property Handover Checklist',
  'Generate a property handover checklist for move-in/move-out inspections',
  E'Generate a Property Handover Checklist for Abu Dhabi properties.\n\nThis document serves as the official record of property condition at handover. The document must:\n- List all rooms and areas systematically\n- Include condition ratings for each item\n- Record meter readings (ADDC)\n- Note keys and access devices handed over\n- Capture photos reference numbers\n- Be suitable for both move-in and move-out\n\nOutput a comprehensive, professional checklist.',
  '{
    "type": "object",
    "required": ["property", "handover_type", "parties", "date"],
    "properties": {
      "property": {
        "type": "object",
        "required": ["address", "type"],
        "properties": {
          "address": {"type": "string"},
          "type": {"type": "string"},
          "unit_no": {"type": "string"},
          "building": {"type": "string"}
        }
      },
      "handover_type": {"type": "string", "enum": ["move-in", "move-out"]},
      "parties": {
        "type": "object",
        "required": ["landlord_rep", "tenant"],
        "properties": {
          "landlord_rep": {"type": "string"},
          "tenant": {"type": "string"},
          "agent": {"type": "string"}
        }
      },
      "date": {"type": "string", "format": "date"},
      "meter_readings": {
        "type": "object",
        "properties": {
          "electricity": {"type": "string"},
          "water": {"type": "string"},
          "district_cooling": {"type": "string"}
        }
      },
      "keys_inventory": {
        "type": "object",
        "properties": {
          "main_door": {"type": "integer"},
          "bedroom_keys": {"type": "integer"},
          "parking_remote": {"type": "integer"},
          "access_cards": {"type": "integer"},
          "mailbox_key": {"type": "integer"}
        }
      }
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "checklist_items": {"type": "array"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['handover', 'inspection', 'checklist']::text[],
  60,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Compliance Portal Map
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'COMPLIANCE_PORTALS_MAP',
  'COMPLIANCE',
  'Abu Dhabi Portal Touchpoints Map',
  'Provide stage-by-stage mapping of required government portal interactions and evidence capture',
  E'Map the required Abu Dhabi government portal touchpoints for a real estate transaction.\n\nBased on the transaction type and current stage, identify:\n- Which portals must be accessed (DARI, Tawtheeq, ADDC, goAML)\n- What actions must be taken at each portal\n- What evidence/screenshots must be captured\n- What reference numbers must be recorded\n- Timeline requirements for each step\n\nOutput a clear action map for compliance.',
  '{
    "type": "object",
    "required": ["transaction_type", "current_stage"],
    "properties": {
      "transaction_type": {"type": "string", "enum": ["sale", "lease"]},
      "current_stage": {"type": "string"},
      "property_type": {"type": "string"},
      "is_offplan": {"type": "boolean", "default": false},
      "parties_nationality": {
        "type": "object",
        "properties": {
          "buyer_is_uae_national": {"type": "boolean"},
          "seller_is_uae_national": {"type": "boolean"}
        }
      }
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "portal_steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "portal_name": {"type": "string"},
            "action_required": {"type": "string"},
            "evidence_to_capture": {"type": "array"},
            "reference_to_record": {"type": "string"},
            "deadline": {"type": "string"}
          }
        }
      },
      "total_steps": {"type": "integer"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['compliance', 'portals', 'government']::text[],
  30,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Receipt Template
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_PAYMENT_RECEIPT',
  'DOCUMENT_TEMPLATES',
  'Payment Receipt',
  'Generate an official payment receipt for deposits, rent, or other payments received',
  E'Generate an Official Payment Receipt for MiCasa Properties.\n\nThis document acknowledges receipt of funds. The document must:\n- Clearly identify payer and payee\n- Specify the amount received\n- State the purpose of payment\n- Include payment method and reference\n- Be numbered for tracking\n- Include company stamp placeholder\n\nOutput a professional receipt document.',
  '{
    "type": "object",
    "required": ["payer", "amount", "purpose"],
    "properties": {
      "receipt_number": {"type": "string"},
      "date": {"type": "string", "format": "date"},
      "payer": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": {"type": "string"},
          "id_number": {"type": "string"},
          "contact": {"type": "string"}
        }
      },
      "amount": {
        "type": "object",
        "required": ["value", "currency"],
        "properties": {
          "value": {"type": "number"},
          "currency": {"type": "string", "default": "AED"},
          "in_words": {"type": "string"}
        }
      },
      "purpose": {"type": "string"},
      "property_reference": {"type": "string"},
      "deal_reference": {"type": "string"},
      "payment_method": {"type": "string", "enum": ["bank_transfer", "cheque", "cash", "card"]},
      "payment_reference": {"type": "string"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "receipt_number": {"type": "string"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['receipt', 'payment', 'finance']::text[],
  53,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- NOC Request Letter
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'DOC_NOC_REQUEST',
  'DOCUMENT_TEMPLATES',
  'NOC Request Letter',
  'Generate a No Objection Certificate request letter to developer or landlord',
  E'Generate a No Objection Certificate (NOC) Request Letter.\n\nThis letter formally requests an NOC for property transfer or tenant change. The document must:\n- Identify the requesting party and their relationship to property\n- Specify the property details\n- State the purpose of the NOC\n- Include required supporting document list\n- Be addressed to the correct authority (developer, landlord, or community management)\n\nOutput a professional request letter.',
  '{
    "type": "object",
    "required": ["requester", "property", "noc_purpose", "addressed_to"],
    "properties": {
      "requester": {
        "type": "object",
        "required": ["name", "role"],
        "properties": {
          "name": {"type": "string"},
          "role": {"type": "string", "enum": ["owner", "buyer", "tenant", "agent"]},
          "contact_phone": {"type": "string"},
          "contact_email": {"type": "string"}
        }
      },
      "property": {
        "type": "object",
        "required": ["address", "unit_no"],
        "properties": {
          "address": {"type": "string"},
          "unit_no": {"type": "string"},
          "building": {"type": "string"},
          "community": {"type": "string"},
          "title_deed_no": {"type": "string"}
        }
      },
      "noc_purpose": {"type": "string", "enum": ["sale_transfer", "tenant_change", "renovation", "subletting"]},
      "addressed_to": {
        "type": "object",
        "required": ["entity_name"],
        "properties": {
          "entity_name": {"type": "string"},
          "entity_type": {"type": "string", "enum": ["developer", "landlord", "community_management", "municipality"]}
        }
      },
      "urgency": {"type": "string", "enum": ["standard", "urgent"]}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "document_title": {"type": "string"},
      "document_body": {"type": "string"},
      "reference_number": {"type": "string"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['noc', 'request', 'transfer']::text[],
  45,
  true
) ON CONFLICT (prompt_id) DO NOTHING;