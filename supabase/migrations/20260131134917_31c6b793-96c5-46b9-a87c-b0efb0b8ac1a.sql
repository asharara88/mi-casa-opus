-- Rename prompt IDs for manifest alignment
UPDATE bos_manifest_prompts 
SET prompt_id = 'DOC_AGENT_TO_AGENT_MASTER',
    title = 'Master Agent-to-Agent Cooperation Agreement',
    purpose = 'Generate broker-to-broker cooperation agreement (no commission terms unless annex attached).',
    prompt = 'Generate a Master Agent-to-Agent Cooperation Agreement for MiCasa.

Rules:
- Enforce: non-circumvention, confidentiality, proof standards, payment flow, dispute escalation.
- Do not include commission split numbers here; those belong only in the annex.

Output:
- Provide a single copy-paste-ready agreement.',
    input_schema = '{
      "type": "object",
      "required": ["party_a", "party_b", "deal_type"],
      "properties": {
        "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
        "party_a": {
          "type": "object",
          "required": ["company_name", "license_authority", "license_no", "address", "signatory", "handling_agent"],
          "properties": {
            "company_name": { "type": "string" },
            "license_authority": { "type": "string" },
            "license_no": { "type": "string" },
            "orn_or_office_reg_no": { "type": "string" },
            "address": { "type": "string" },
            "signatory": { "type": "string" },
            "handling_agent": { "type": "object" }
          },
          "additionalProperties": true
        },
        "party_b": {
          "type": "object",
          "required": ["company_name", "license_authority", "license_no", "address", "signatory", "handling_agent"],
          "properties": {
            "company_name": { "type": "string" },
            "license_authority": { "type": "string" },
            "license_no": { "type": "string" },
            "orn_or_office_reg_no": { "type": "string" },
            "address": { "type": "string" },
            "signatory": { "type": "string" },
            "handling_agent": { "type": "object" }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "document_title": { "type": "string" },
        "document_body": { "type": "string" }
      },
      "required": ["document_title", "document_body"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    sort_order = 12,
    tags = ARRAY['template', 'co-broker', 'governance']
WHERE prompt_id = 'DOC_AGENT_MASTER';

UPDATE bos_manifest_prompts 
SET prompt_id = 'DOC_AGENT_TO_AGENT_ANNEX',
    title = 'Agent-to-Agent Property Annex',
    purpose = 'Generate per-property annex with split math, payor clarity, validity window, and proof fields.',
    prompt = 'Generate an Agent-to-Agent Property Annex.

Hard gates:
- Split must reconcile to 100%.
- Leasing: commission payor must be exactly one party.

Output:
- Provide a single copy-paste-ready annex.',
    input_schema = '{
      "type": "object",
      "required": ["deal_type", "property", "client_roles", "commission", "split", "valid_until"],
      "properties": {
        "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
        "property": {
          "type": "object",
          "required": ["location", "unit_or_plot"],
          "properties": {
            "location": { "type": "string" },
            "unit_or_plot": { "type": "string" },
            "title_deed_no": { "type": "string" },
            "asking_price_aed": { "type": "number" },
            "annual_rent_aed": { "type": "number" }
          },
          "additionalProperties": true
        },
        "client_roles": {
          "type": "object",
          "required": ["party_a_represents", "party_b_represents"],
          "properties": {
            "party_a_represents": { "type": "array", "items": { "type": "string" } },
            "party_b_represents": { "type": "array", "items": { "type": "string" } }
          }
        },
        "commission": {
          "type": "object",
          "required": ["payor", "gross_structure"],
          "properties": {
            "payor": { "type": "string", "enum": ["seller", "buyer", "landlord", "tenant"] },
            "gross_structure": { "type": "string", "enum": ["percent", "fixed"] },
            "gross_rate_percent": { "type": "number" },
            "gross_fixed_aed": { "type": "number" }
          },
          "additionalProperties": true
        },
        "split": {
          "type": "object",
          "required": ["party_a_percent", "party_b_percent"],
          "properties": {
            "party_a_percent": { "type": "number" },
            "party_b_percent": { "type": "number" }
          }
        },
        "introduced_party": { "type": "object" },
        "valid_until": { "type": "string" }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "document_title": { "type": "string" },
        "document_body": { "type": "string" }
      },
      "required": ["document_title", "document_body"]
    }'::jsonb,
    refusal_policy = '{
      "must_refuse_if": [
        "Split does not equal 100",
        "Leasing and payor is not landlord or tenant",
        "valid_until missing"
      ],
      "refusal_style": "State validation failure and stop."
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT', 'DOC_AGENT_TO_AGENT_MASTER'],
    sort_order = 13,
    tags = ARRAY['template', 'co-broker', 'annex']
WHERE prompt_id = 'DOC_AGENT_ANNEX';

-- Update MICASA_BOS_ROOT with full manifest schema
UPDATE bos_manifest_prompts
SET sort_order = 1,
    prompt = 'You are MiCasa BOS, the internal operating system for MiCasa Real Estate.

Jurisdiction: Abu Dhabi, UAE
Regulator: DMT / ADM
Business type: Licensed real estate brokerage (sales & leasing)

Hard rules (non-negotiable):
- No brokerage activity may proceed without a signed ADM-approved brokerage contract.
- Leasing commission may be charged to ONE party only.
- Sales transactions require AML/KYC processing.
- Online advertising requires a Madhmoun permit where applicable.
- All actions must leave an audit trail.
- If a required document is missing, refuse to proceed and clearly state what is missing.

You do not provide legal advice.
You do not invent regulations.
If a rule is uncertain, flag it as "VERIFY WITH ADM".

You only generate documents using approved MiCasa templates.',
    refusal_policy = '{
      "must_refuse_if": [
        "User asks for legal advice rather than operational documentation.",
        "User requests fabrication or backdating of documents."
      ],
      "refusal_style": "Refuse briefly and state safe alternative actions."
    }'::jsonb,
    tags = ARRAY['root', 'governance', 'compliance']
WHERE prompt_id = 'MICASA_BOS_ROOT';

-- Update DOC_BROKERAGE_SALES with full manifest schema
UPDATE bos_manifest_prompts
SET sort_order = 10,
    input_schema = '{
      "type": "object",
      "required": ["client_role", "client_legal_name", "property", "commission", "contract_term", "assigned_agent", "micasa"],
      "properties": {
        "client_role": { "type": "string", "enum": ["seller", "buyer_rep"] },
        "client_legal_name": { "type": "string" },
        "property": {
          "type": "object",
          "required": ["location", "unit_or_plot", "property_type"],
          "properties": {
            "property_type": { "type": "string" },
            "location": { "type": "string" },
            "unit_or_plot": { "type": "string" },
            "title_deed_no": { "type": "string" },
            "asking_price_aed": { "type": "number" }
          },
          "additionalProperties": true
        },
        "commission": {
          "type": "object",
          "required": ["payor", "structure"],
          "properties": {
            "payor": { "type": "string", "enum": ["seller", "buyer"] },
            "structure": { "type": "string", "enum": ["percent", "fixed"] },
            "rate_percent": { "type": "number" },
            "fixed_aed": { "type": "number" },
            "due_event": { "type": "string" }
          },
          "additionalProperties": true
        },
        "contract_term": {
          "type": "object",
          "required": ["start_date", "end_date", "non_exclusive"],
          "properties": {
            "start_date": { "type": "string" },
            "end_date": { "type": "string" },
            "non_exclusive": { "type": "boolean" }
          }
        },
        "assigned_agent": {
          "type": "object",
          "required": ["full_name", "agent_id_or_brn", "email", "mobile"],
          "properties": {
            "full_name": { "type": "string" },
            "agent_id_or_brn": { "type": "string" },
            "email": { "type": "string" },
            "mobile": { "type": "string" }
          }
        },
        "micasa": {
          "type": "object",
          "required": ["legal_name", "license_no", "address", "email", "phone"],
          "properties": {
            "legal_name": { "type": "string" },
            "license_no": { "type": "string" },
            "address": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" },
            "bank_account": { "type": "object" }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }'::jsonb,
    refusal_policy = '{
      "must_refuse_if": [
        "No client role provided",
        "Commission payor not specified",
        "Assigned agent identifier missing"
      ],
      "refusal_style": "State missing inputs and stop."
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['template', 'sales', 'brokerage', 'addendum']
WHERE prompt_id = 'DOC_BROKERAGE_SALES';

-- Update DOC_BROKERAGE_LEASING with full manifest schema
UPDATE bos_manifest_prompts
SET sort_order = 11,
    input_schema = '{
      "type": "object",
      "required": ["client_role", "client_legal_name", "property", "lease_terms", "commission", "assigned_agent", "micasa"],
      "properties": {
        "client_role": { "type": "string", "enum": ["landlord", "tenant_rep"] },
        "client_legal_name": { "type": "string" },
        "property": {
          "type": "object",
          "required": ["location", "unit", "property_type"],
          "properties": {
            "property_type": { "type": "string" },
            "location": { "type": "string" },
            "unit": { "type": "string" },
            "title_deed_no": { "type": "string" }
          },
          "additionalProperties": true
        },
        "lease_terms": {
          "type": "object",
          "required": ["annual_rent_aed", "start_date", "end_date"],
          "properties": {
            "annual_rent_aed": { "type": "number" },
            "start_date": { "type": "string" },
            "end_date": { "type": "string" },
            "payment_terms": { "type": "string" }
          },
          "additionalProperties": true
        },
        "commission": {
          "type": "object",
          "required": ["payor", "structure"],
          "properties": {
            "payor": { "type": "string", "enum": ["landlord", "tenant"] },
            "structure": { "type": "string", "enum": ["percent", "fixed"] },
            "rate_percent": { "type": "number" },
            "fixed_aed": { "type": "number" },
            "due_event": { "type": "string" }
          },
          "additionalProperties": true
        },
        "assigned_agent": {
          "type": "object",
          "required": ["full_name", "agent_id_or_brn", "email", "mobile"],
          "properties": {
            "full_name": { "type": "string" },
            "agent_id_or_brn": { "type": "string" },
            "email": { "type": "string" },
            "mobile": { "type": "string" }
          }
        },
        "micasa": {
          "type": "object",
          "required": ["legal_name", "license_no", "address", "email", "phone"],
          "properties": {
            "legal_name": { "type": "string" },
            "license_no": { "type": "string" },
            "address": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }'::jsonb,
    refusal_policy = '{
      "must_refuse_if": [
        "Commission payor is missing",
        "Commission payor includes both parties",
        "Annual rent is missing"
      ],
      "refusal_style": "State missing/invalid selection and stop."
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['template', 'leasing', 'brokerage', 'addendum']
WHERE prompt_id = 'DOC_BROKERAGE_LEASING';

-- Update DOC_BUYER_OFFER
UPDATE bos_manifest_prompts
SET sort_order = 14,
    input_schema = '{
      "type": "object",
      "required": ["buyer", "property", "offer", "valid_until"],
      "properties": {
        "buyer": { 
          "type": "object", 
          "required": ["full_name", "id_ref", "mobile", "email"],
          "properties": {
            "full_name": { "type": "string" },
            "id_ref": { "type": "string" },
            "mobile": { "type": "string" },
            "email": { "type": "string" }
          }
        },
        "property": { 
          "type": "object", 
          "required": ["location", "unit"],
          "properties": {
            "location": { "type": "string" },
            "unit": { "type": "string" }
          }
        },
        "offer": {
          "type": "object",
          "required": ["price_aed"],
          "properties": {
            "price_aed": { "type": "number" },
            "deposit_aed": { "type": "number" },
            "payment_method": { "type": "string" },
            "conditions": { "type": "string" },
            "target_completion_date": { "type": "string" }
          },
          "additionalProperties": true
        },
        "valid_until": { "type": "string" }
      },
      "additionalProperties": true
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['template', 'offer', 'sales']
WHERE prompt_id = 'DOC_BUYER_OFFER';

-- Update DOC_TENANT_OFFER
UPDATE bos_manifest_prompts
SET sort_order = 15,
    input_schema = '{
      "type": "object",
      "required": ["tenant", "property", "offer", "valid_until"],
      "properties": {
        "tenant": { 
          "type": "object", 
          "required": ["full_name", "id_ref", "mobile", "email"],
          "properties": {
            "full_name": { "type": "string" },
            "id_ref": { "type": "string" },
            "mobile": { "type": "string" },
            "email": { "type": "string" }
          }
        },
        "property": { 
          "type": "object", 
          "required": ["location", "unit"],
          "properties": {
            "location": { "type": "string" },
            "unit": { "type": "string" }
          }
        },
        "offer": {
          "type": "object",
          "required": ["annual_rent_aed", "lease_start_date", "lease_end_date"],
          "properties": {
            "annual_rent_aed": { "type": "number" },
            "cheques": { "type": "string" },
            "security_deposit_aed": { "type": "number" },
            "move_in_date": { "type": "string" },
            "special_requests": { "type": "string" }
          },
          "additionalProperties": true
        },
        "valid_until": { "type": "string" }
      },
      "additionalProperties": true
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['template', 'offer', 'leasing']
WHERE prompt_id = 'DOC_TENANT_OFFER';

-- Update DOC_COMMISSION_INVOICE
UPDATE bos_manifest_prompts
SET sort_order = 16,
    input_schema = '{
      "type": "object",
      "required": ["deal", "invoice", "supplier", "customer", "commission", "payment_instructions"],
      "properties": {
        "deal": { 
          "type": "object", 
          "required": ["deal_type", "property_ref"],
          "properties": {
            "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
            "property_ref": { "type": "string" }
          }
        },
        "invoice": { 
          "type": "object", 
          "required": ["invoice_no", "invoice_date", "due_date"],
          "properties": {
            "invoice_no": { "type": "string" },
            "invoice_date": { "type": "string" },
            "due_date": { "type": "string" }
          }
        },
        "supplier": {
          "type": "object",
          "required": ["legal_name", "license_no", "address", "email", "phone", "vat_registered"],
          "properties": {
            "legal_name": { "type": "string" },
            "license_no": { "type": "string" },
            "address": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" },
            "vat_registered": { "type": "boolean" },
            "trn": { "type": "string" }
          },
          "additionalProperties": true
        },
        "customer": { 
          "type": "object", 
          "required": ["name", "address"],
          "properties": {
            "name": { "type": "string" },
            "address": { "type": "string" }
          }
        },
        "commission": {
          "type": "object",
          "required": ["basis", "base_amount_aed", "structure"],
          "properties": {
            "basis": { "type": "string" },
            "base_amount_aed": { "type": "number" },
            "structure": { "type": "string", "enum": ["percent", "fixed"] },
            "rate_percent": { "type": "number" },
            "fixed_aed": { "type": "number" }
          },
          "additionalProperties": true
        },
        "payment_instructions": { "type": "object" }
      },
      "additionalProperties": true
    }'::jsonb,
    refusal_policy = '{
      "must_refuse_if": [
        "supplier.vat_registered is false but VAT requested in inputs"
      ],
      "refusal_style": "State VAT rule and stop."
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['template', 'finance', 'invoice']
WHERE prompt_id = 'DOC_COMMISSION_INVOICE';

-- Update DOC_COMMISSION_SPLIT
UPDATE bos_manifest_prompts
SET sort_order = 17,
    input_schema = '{
      "type": "object",
      "required": ["deal", "commission", "splits"],
      "properties": {
        "deal": { 
          "type": "object", 
          "required": ["deal_type", "property_ref", "closing_date"],
          "properties": {
            "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
            "property_ref": { "type": "string" },
            "closing_date": { "type": "string" }
          }
        },
        "commission": {
          "type": "object",
          "required": ["gross_aed"],
          "properties": {
            "gross_aed": { "type": "number" },
            "vat_aed": { "type": "number" },
            "net_aed": { "type": "number" }
          },
          "additionalProperties": true
        },
        "splits": {
          "type": "object",
          "properties": {
            "co_broker": { "type": "object" },
            "internal_agent": { "type": "object" }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['template', 'finance', 'splits']
WHERE prompt_id = 'DOC_COMMISSION_SPLIT';

-- Update FLOW_SALES_GATE
UPDATE bos_manifest_prompts
SET sort_order = 20,
    prompt = 'Before proceeding with a sales transaction action, verify the following are present:
- Signed sales brokerage contract (approved form)
- Ownership/authority proof
- KYC folder created
- AML risk assessment completed

If any are missing:
- Refuse to proceed
- List missing items explicitly

If present:
- Output: APPROVED and list next allowed actions.',
    input_schema = '{
      "type": "object",
      "required": ["requested_action", "documents_present"],
      "properties": {
        "requested_action": { "type": "string" },
        "documents_present": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["APPROVED", "BLOCKED"] },
        "missing": { "type": "array", "items": { "type": "string" } },
        "next_allowed_actions": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["status", "missing", "next_allowed_actions"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['gate', 'sales', 'workflow']
WHERE prompt_id = 'FLOW_SALES_GATE';

-- Update FLOW_LEASING_GATE
UPDATE bos_manifest_prompts
SET sort_order = 21,
    prompt = 'Before proceeding with a leasing transaction action, verify the following are present:
- Signed leasing brokerage contract (approved form)
- Ownership/authority proof
- Tenant ID collected (when tenant identified)

If any are missing:
- Refuse to proceed
- List missing items explicitly

If present:
- Output: APPROVED and list next allowed actions.',
    input_schema = '{
      "type": "object",
      "required": ["requested_action", "documents_present"],
      "properties": {
        "requested_action": { "type": "string" },
        "documents_present": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["APPROVED", "BLOCKED"] },
        "missing": { "type": "array", "items": { "type": "string" } },
        "next_allowed_actions": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["status", "missing", "next_allowed_actions"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['gate', 'leasing', 'workflow']
WHERE prompt_id = 'FLOW_LEASING_GATE';

-- Update AML_SALES_CHECK
UPDATE bos_manifest_prompts
SET sort_order = 30,
    input_schema = '{
      "type": "object",
      "required": ["deal_value_aed", "payment_method", "buyer_profile_flags"],
      "properties": {
        "deal_value_aed": { "type": "number" },
        "payment_method": { "type": "string", "enum": ["cash", "bank_transfer", "mortgage", "crypto", "mixed", "unknown"] },
        "buyer_profile_flags": {
          "type": "object",
          "properties": {
            "pep_declared": { "type": "boolean" },
            "unusual_urgency": { "type": "boolean" },
            "complex_structure": { "type": "boolean" },
            "sanctions_concern": { "type": "boolean" }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "risk_level": { "type": "string", "enum": ["Low", "Medium", "High"] },
        "source_of_funds_required": { "type": "boolean" },
        "goaml_trigger_likely": { "type": "boolean" },
        "required_documents": { "type": "array", "items": { "type": "string" } },
        "notes": { "type": "string" }
      },
      "required": ["risk_level", "source_of_funds_required", "goaml_trigger_likely", "required_documents", "notes"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['compliance', 'aml', 'sales']
WHERE prompt_id = 'AML_SALES_CHECK';

-- Update KYC_LEASING_CHECK
UPDATE bos_manifest_prompts
SET sort_order = 31,
    input_schema = '{
      "type": "object",
      "required": ["landlord_id_present", "tenant_id_present", "ownership_proof_present"],
      "properties": {
        "landlord_id_present": { "type": "boolean" },
        "tenant_id_present": { "type": "boolean" },
        "ownership_proof_present": { "type": "boolean" }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["COMPLETE", "INCOMPLETE"] },
        "missing": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["status", "missing"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['compliance', 'kyc', 'leasing']
WHERE prompt_id = 'KYC_LEASING_CHECK';

-- Update COMPLIANCE_PORTALS_MAP
UPDATE bos_manifest_prompts
SET sort_order = 32,
    input_schema = '{
      "type": "object",
      "required": ["deal_type", "stage"],
      "properties": {
        "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
        "stage": {
          "type": "string",
          "enum": ["intake", "brokerage_contract", "advertising", "offer", "closing", "registration", "commission", "closeout"]
        }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "portal_steps": { "type": "array", "items": { "type": "string" } },
        "evidence_to_save": { "type": "array", "items": { "type": "string" } },
        "folder_target": { "type": "string" },
        "notes": { "type": "string" }
      },
      "required": ["portal_steps", "evidence_to_save", "folder_target", "notes"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['compliance', 'portals', 'audit']
WHERE prompt_id = 'COMPLIANCE_PORTALS_MAP';

-- Update ADMIN_DOC_INDEX
UPDATE bos_manifest_prompts
SET sort_order = 40,
    input_schema = '{
      "type": "object",
      "required": ["deal_type", "property_ref", "documents_present"],
      "properties": {
        "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
        "property_ref": { "type": "string" },
        "documents_present": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "index_title": { "type": "string" },
        "index_body": { "type": "string" }
      },
      "required": ["index_title", "index_body"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT'],
    tags = ARRAY['admin', 'ops', 'index']
WHERE prompt_id = 'ADMIN_DOC_INDEX';

-- Update ADMIN_AUDIT_EXPORT
UPDATE bos_manifest_prompts
SET sort_order = 41,
    input_schema = '{
      "type": "object",
      "required": ["deal_type", "property_ref", "documents_present"],
      "properties": {
        "deal_type": { "type": "string", "enum": ["sales", "leasing"] },
        "property_ref": { "type": "string" },
        "documents_present": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": true
    }'::jsonb,
    output_schema = '{
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["AUDIT-READY", "INCOMPLETE"] },
        "bundle_list": { "type": "array", "items": { "type": "string" } },
        "missing": { "type": "array", "items": { "type": "string" } },
        "closeout_steps": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["status", "bundle_list", "missing", "closeout_steps"]
    }'::jsonb,
    depends_on = ARRAY['MICASA_BOS_ROOT', 'ADMIN_DOC_INDEX'],
    tags = ARRAY['admin', 'audit', 'export']
WHERE prompt_id = 'ADMIN_AUDIT_EXPORT';