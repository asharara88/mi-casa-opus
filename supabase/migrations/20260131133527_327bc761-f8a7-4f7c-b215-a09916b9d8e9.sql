-- Add Operational Checklists and Compliance Controls

-- Sales Deal Checklist
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'CHECKLIST_SALES_DEAL',
  'CHECKLISTS',
  'Sales Deal Checklist',
  'Generate a stage-aware compliance checklist for sales transactions based on current deal status',
  E'Generate a Sales Deal Checklist for MiCasa Abu Dhabi operations.\n\nBased on the current deal stage, mark which items are complete vs pending.\n\nCOMPLETE CHECKLIST:\n\n☐ Open Drive deal folder + apply naming convention\n☐ Owner ID pack + ownership/authority proof collected\n☐ Approved Form Brokerage Contract signed (seller or buyer) [Adrec requirement]\n☐ Contract submitted for registration within 15 days [Adrec requirement]\n☐ Madhmoun website ad permit issued (if listing online) [Dari-Services]\n☐ Listing pack finalized + broker/agent identifiers on materials [Adrec]\n☐ Co-broker docs (if any): Agent-to-Agent Agreement + Annex\n☐ Viewing log maintained (date/time, names, IDs last 4)\n☐ Buyer Offer Letter received + acceptance trail saved\n☐ Binding contract/SPA route docs saved [VERIFY WITH ADM]\n☐ AML/KYC file complete; REAR assessed/triggered if applicable\n☐ Commission invoice issued + payment proof saved\n☐ Split confirmation completed + co-broker invoice/payment proof saved\n☐ Closeout: "Final" PDF set exported + retention tag applied (≥ 5 years)\n\nRETENTION REQUIREMENT: All records must be kept minimum 5 years per AML regulations.\n\nOutput checklist with status indicators based on deal data provided.',
  '{
    "type": "object",
    "required": ["deal_ref", "current_stage"],
    "properties": {
      "deal_ref": {"type": "string"},
      "property_ref": {"type": "string"},
      "current_stage": {"type": "string", "enum": ["intake", "marketing", "viewing", "offer", "negotiation", "contract", "closing", "closed"]},
      "completed_items": {
        "type": "array",
        "items": {"type": "string"}
      },
      "documents_present": {
        "type": "array",
        "items": {"type": "string"}
      },
      "has_co_broker": {"type": "boolean", "default": false},
      "is_online_listing": {"type": "boolean", "default": true},
      "client_type": {"type": "string", "enum": ["seller", "buyer"]}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "checklist_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": {"type": "string"},
            "status": {"type": "string", "enum": ["complete", "pending", "not_applicable"]},
            "regulatory_ref": {"type": "string"},
            "blocking": {"type": "boolean"}
          }
        }
      },
      "overall_status": {"type": "string"},
      "blocking_items": {"type": "array"},
      "next_required_action": {"type": "string"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['checklist', 'sales', 'compliance', 'audit']::text[],
  10,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Leasing Deal Checklist
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'CHECKLIST_LEASING_DEAL',
  'CHECKLISTS',
  'Leasing Deal Checklist',
  'Generate a stage-aware compliance checklist for leasing transactions based on current deal status',
  E'Generate a Leasing Deal Checklist for MiCasa Abu Dhabi operations.\n\nBased on the current deal stage, mark which items are complete vs pending.\n\nCOMPLETE CHECKLIST:\n\n☐ Open Drive deal folder + naming convention\n☐ Landlord ID pack + ownership/authority proof collected\n☐ Approved Form Brokerage Contract signed (lease) [Adrec requirement]\n☐ Madhmoun rent permit issued (if listing online) [Dari-Services]\n☐ Viewing log maintained\n☐ Tenant ID pack collected\n☐ Tenant Offer/Intent Letter received + acceptance trail saved\n☐ Tenancy contract prepared and registered in DARI (Tawtheeq output) [Dari-Services]\n☐ Fees recorded as per DARI service schedule (if applicable)\n☐ Commission invoice issued + payment proof saved\n☐ Split confirmation completed + co-broker invoice/payment proof saved\n☐ Closeout: "Final" PDF set exported + retention tag applied (≥ 5 years minimum)\n\nCRITICAL RULES:\n- Commission from ONE party only (landlord OR tenant, never both)\n- Tenancy must be registered via DARI/Tawtheeq\n- Retention minimum 5 years\n\nOutput checklist with status indicators based on deal data provided.',
  '{
    "type": "object",
    "required": ["deal_ref", "current_stage"],
    "properties": {
      "deal_ref": {"type": "string"},
      "property_ref": {"type": "string"},
      "current_stage": {"type": "string", "enum": ["intake", "marketing", "viewing", "offer", "negotiation", "contract", "registration", "closed"]},
      "completed_items": {
        "type": "array",
        "items": {"type": "string"}
      },
      "documents_present": {
        "type": "array",
        "items": {"type": "string"}
      },
      "has_co_broker": {"type": "boolean", "default": false},
      "is_online_listing": {"type": "boolean", "default": true},
      "commission_payor": {"type": "string", "enum": ["landlord", "tenant"]}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "checklist_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": {"type": "string"},
            "status": {"type": "string", "enum": ["complete", "pending", "not_applicable"]},
            "regulatory_ref": {"type": "string"},
            "blocking": {"type": "boolean"}
          }
        }
      },
      "overall_status": {"type": "string"},
      "blocking_items": {"type": "array"},
      "next_required_action": {"type": "string"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['checklist', 'leasing', 'compliance', 'audit', 'tawtheeq']::text[],
  11,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Agent Onboarding Checklist
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'CHECKLIST_AGENT_ONBOARDING',
  'CHECKLISTS',
  'Agent Onboarding Checklist',
  'Generate an agent onboarding checklist ensuring all licensing and compliance requirements are met before agent activation',
  E'Generate an Agent Onboarding Checklist for MiCasa Abu Dhabi.\n\nHARD GATE - Cannot activate agent without:\n\n☐ Proof agent is licensed/registered to operate as broker/broker employee [Adrec requirement]\n☐ Agent identifiers recorded (BRN/registration no.) + included on materials/templates [Adrec]\n☐ Signed internal: confidentiality + non-circumvention + commission split policy acknowledgment [MiCasa internal]\n☐ AML awareness briefing: recordkeeping and reporting triggers (REAR / STR path) [Ministry of Economy]\n☐ Agent assigned official email signature template with required identifiers [Adrec]\n\nADDITIONAL ONBOARDING:\n☐ System access provisioned (Drive, CRM, email)\n☐ Training completed (ADM regulations, MiCasa procedures)\n☐ Commission split agreement signed\n☐ Emergency contact details collected\n☐ ID documents filed\n\nREGULATORY ANCHORS:\n- Brokerage activity requires a license; unlicensed work = no entitlement to remuneration [Adrec]\n- Broker registration number must appear on correspondence/ads/documents/material [Adrec]\n\nOutput checklist with blocking items clearly marked.',
  '{
    "type": "object",
    "required": ["agent_name"],
    "properties": {
      "agent_name": {"type": "string"},
      "agent_id": {"type": "string"},
      "agent_brn": {"type": "string"},
      "license_status": {"type": "string", "enum": ["verified", "pending", "not_verified"]},
      "completed_items": {
        "type": "array",
        "items": {"type": "string"}
      },
      "start_date": {"type": "string", "format": "date"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "checklist_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": {"type": "string"},
            "status": {"type": "string", "enum": ["complete", "pending", "blocking"]},
            "category": {"type": "string", "enum": ["hard_gate", "additional"]},
            "regulatory_ref": {"type": "string"}
          }
        }
      },
      "can_activate": {"type": "boolean"},
      "blocking_items": {"type": "array"},
      "next_required_action": {"type": "string"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["Agent has no valid license verification"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY[]::text[],
  ARRAY['checklist', 'onboarding', 'agent', 'licensing', 'compliance']::text[],
  20,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Commission Dispute Prevention Controls
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'CONTROL_COMMISSION_DISPUTE',
  'COMPLIANCE',
  'Commission Dispute Prevention Check',
  'Validate commission claim against operational controls to prevent disputes',
  E'Evaluate a commission claim against MiCasa operational controls for dispute prevention.\n\nCONTROL A — "Authority first"\nIf there is no signed approved-form brokerage contract with the commission payor → BLOCK: Cannot invoice that party [Dari-Services]\n\nCONTROL B — "Introduced party register"\nFor every listing, verify PDF log of introduced buyers/tenants exists:\n- Name + ID last 4 + date/time + channel\n- First intro email, viewing booking message, offer letter\n\nCONTROL C — "Co-broker must be in writing"\nIf a co-broker is involved and no Agent-to-Agent Agreement + Annex exists → BLOCK: Treat as non-cooperating; do not promise split\n\nCONTROL D — "Conditional deal handling"\nIf the deal is expressly conditional, do not mark commission as earned until the condition is met (and evidence in folder) [Dari-Services]\n\nCONTROL E — "One lease payor only"\nLeasing brokerage agreement must tick exactly one commission payor [Dari-Services]\n\nOutput validation result with any blocking issues identified.',
  '{
    "type": "object",
    "required": ["deal_ref", "deal_type", "commission_claim"],
    "properties": {
      "deal_ref": {"type": "string"},
      "deal_type": {"type": "string", "enum": ["sale", "lease"]},
      "commission_claim": {
        "type": "object",
        "required": ["payor", "amount"],
        "properties": {
          "payor": {"type": "string"},
          "amount": {"type": "number"},
          "has_signed_brokerage_contract": {"type": "boolean"},
          "brokerage_contract_ref": {"type": "string"}
        }
      },
      "introduced_party": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "intro_log_exists": {"type": "boolean"},
          "intro_date": {"type": "string", "format": "date"},
          "intro_channel": {"type": "string"}
        }
      },
      "co_broker": {
        "type": "object",
        "properties": {
          "has_co_broker": {"type": "boolean"},
          "agreement_exists": {"type": "boolean"},
          "annex_exists": {"type": "boolean"}
        }
      },
      "conditional_deal": {
        "type": "object",
        "properties": {
          "is_conditional": {"type": "boolean"},
          "condition": {"type": "string"},
          "condition_met": {"type": "boolean"},
          "evidence_filed": {"type": "boolean"}
        }
      },
      "lease_payor_count": {"type": "integer"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "validation_status": {"type": "string", "enum": ["APPROVED", "BLOCKED", "WARNING"]},
      "control_results": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "control": {"type": "string"},
            "status": {"type": "string", "enum": ["PASS", "FAIL", "WARNING"]},
            "reason": {"type": "string"}
          }
        }
      },
      "blocking_issues": {"type": "array"},
      "required_actions": {"type": "array"},
      "can_invoice": {"type": "boolean"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['compliance', 'commission', 'dispute-prevention', 'validation']::text[],
  40,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Audit Trail Validator
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'CONTROL_AUDIT_TRAIL',
  'COMPLIANCE',
  'Audit Trail Validation',
  'Validate that a closed deal file contains all required audit trail elements',
  E'Validate the audit trail for a closed deal against MiCasa minimum requirements.\n\nMINIMUM AUDIT TRAIL REQUIREMENTS (must exist in every closed file):\n\n1. Signed approved-form brokerage contract + evidence of submission/registration timing [Adrec]\n2. Madhmoun permit certificate/receipt (if listed online) [Dari-Services]\n3. Offer letter + acceptance/counter trail\n4. Closing instrument (tenancy contract output or sale/transfer docs) [Dari-Services]\n5. Commission invoice + payment proof\n6. Split confirmation + co-broker invoice + payment proof (if any)\n7. AML/KYC pack and REAR assessment (sale/purchase context; REAR triggers include cash ≥ AED 55,000 and virtual asset scenarios)\n\nRETENTION REQUIREMENTS:\n- Keep deal files ≥ 5 years (IDs, receipts, contracts, SPAs/tenancy, reports)\n- Ministry of Economy AML expectation\n\nFOLDER STRUCTURE EXPECTED:\n/01_Authority\n/02_KYC_AML\n/03_Advertising_Permits\n/04_Viewings\n/05_Offers\n/06_Contracts_Closing\n/07_Invoices_Splits\n/99_Final_PDF_Export\n\nOutput audit validation result with any missing elements.',
  '{
    "type": "object",
    "required": ["deal_ref", "deal_type"],
    "properties": {
      "deal_ref": {"type": "string"},
      "deal_type": {"type": "string", "enum": ["sale", "lease"]},
      "closing_date": {"type": "string", "format": "date"},
      "documents_present": {
        "type": "array",
        "items": {"type": "string"}
      },
      "was_listed_online": {"type": "boolean"},
      "has_co_broker": {"type": "boolean"},
      "transaction_value": {"type": "number"},
      "payment_method": {"type": "string"}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "audit_status": {"type": "string", "enum": ["COMPLETE", "INCOMPLETE", "CRITICAL_MISSING"]},
      "required_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": {"type": "string"},
            "status": {"type": "string", "enum": ["present", "missing", "not_applicable"]},
            "regulatory_ref": {"type": "string"},
            "criticality": {"type": "string", "enum": ["critical", "important", "recommended"]}
          }
        }
      },
      "missing_items": {"type": "array"},
      "aml_assessment_required": {"type": "boolean"},
      "rear_trigger_check": {"type": "string"},
      "retention_compliant": {"type": "boolean"},
      "next_actions": {"type": "array"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['compliance', 'audit', 'validation', 'retention']::text[],
  41,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Authority Chain Validator
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'CONTROL_AUTHORITY_CHAIN',
  'COMPLIANCE',
  'Authority Chain Validation',
  'Validate the legal authority chain for a transaction ensuring proper authorization at each level',
  E'Validate the authority chain for a MiCasa transaction.\n\nAUTHORITY CHAIN (must be documented in writing at each hand-off):\n\n1) Owner / Landlord (or legally authorized POA / authorized signatory)\n→ 2) Brokerage (MiCasa) (licensed)\n→ 3) Assigned Agent (licensed employee / registered)\n→ 4) Co-Broker (external brokerage / sub-broker) (licensed + signed cooperation / sub-broker terms)\n→ 5) Client-side Counterparty (Buyer / Tenant)\n\nREGULATORY ANCHORS:\n- Brokerage activity requires a license; unlicensed work = no entitlement to remuneration [Adrec]\n- A written brokerage contract on the approved form must be concluded before carrying out brokerage work [Adrec]\n- Broker cannot represent more than one party in the same transaction except with disclosure + separate brokerage contracts + honest/independent representation [Adrec]\n\nVALIDATION CHECKS:\n1. Owner authority verified (title deed / POA / corporate authority)\n2. MiCasa brokerage contract signed and registered\n3. Agent is licensed and assigned\n4. Co-broker (if any) has valid cooperation agreement\n5. No undisclosed dual representation\n\nOutput validation result with authority chain status.',
  '{
    "type": "object",
    "required": ["deal_ref", "deal_type"],
    "properties": {
      "deal_ref": {"type": "string"},
      "deal_type": {"type": "string", "enum": ["sale", "lease"]},
      "owner": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "authority_type": {"type": "string", "enum": ["owner", "poa", "corporate_authority"]},
          "authority_doc_present": {"type": "boolean"},
          "title_deed_verified": {"type": "boolean"}
        }
      },
      "brokerage": {
        "type": "object",
        "properties": {
          "contract_signed": {"type": "boolean"},
          "contract_registered": {"type": "boolean"},
          "registration_date": {"type": "string", "format": "date"},
          "signing_date": {"type": "string", "format": "date"}
        }
      },
      "agent": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "brn": {"type": "string"},
          "license_verified": {"type": "boolean"}
        }
      },
      "co_broker": {
        "type": "object",
        "properties": {
          "has_co_broker": {"type": "boolean"},
          "company": {"type": "string"},
          "license_verified": {"type": "boolean"},
          "agreement_signed": {"type": "boolean"}
        }
      },
      "dual_representation": {
        "type": "object",
        "properties": {
          "is_dual_rep": {"type": "boolean"},
          "disclosed": {"type": "boolean"},
          "separate_contracts": {"type": "boolean"},
          "consent_obtained": {"type": "boolean"}
        }
      }
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "authority_status": {"type": "string", "enum": ["VALID", "INVALID", "INCOMPLETE"]},
      "chain_validation": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "level": {"type": "string"},
            "status": {"type": "string", "enum": ["VALID", "INVALID", "MISSING"]},
            "issue": {"type": "string"}
          }
        }
      },
      "blocking_issues": {"type": "array"},
      "registration_timing_compliant": {"type": "boolean"},
      "dual_rep_compliant": {"type": "boolean"},
      "can_proceed": {"type": "boolean"}
    }
  }'::jsonb,
  '{"must_refuse_if": ["No signed brokerage contract exists", "Agent license not verified"], "refusal_style": "polite_decline_with_reason"}'::jsonb,
  ARRAY[]::text[],
  ARRAY['compliance', 'authority', 'validation', 'licensing']::text[],
  42,
  true
) ON CONFLICT (prompt_id) DO NOTHING;

-- Non-Negotiable Rules Reference
INSERT INTO bos_manifest_prompts (
  prompt_id, group_name, title, purpose, prompt, input_schema, output_schema, refusal_policy, depends_on, tags, sort_order, is_active
) VALUES (
  'REF_NON_NEGOTIABLE_RULES',
  'SYSTEM',
  'MiCasa Non-Negotiable Compliance Rules',
  'Reference document listing all non-negotiable compliance rules that the BOS system enforces',
  E'MiCasa Non-Negotiable Compliance Rules (Abu Dhabi)\n\nThese rules are HARD REQUIREMENTS enforced by the BOS system:\n\n1. NO APPROVED-FORM BROKERAGE CONTRACT → NO WORK STARTED [Adrec]\n   - A written brokerage contract on the approved form must be concluded before carrying out brokerage work\n   - Must be submitted for registration within 15 days of signing\n\n2. NO COMMISSION FROM NON-AUTHORIZING PARTY [Dari-Services]\n   - Commission can only be collected from the party that authorized the broker under a signed brokerage contract\n\n3. LEASING: NEVER COLLECT FROM BOTH PARTIES [Dari-Services]\n   - Cannot combine landlord + tenant commission for same lease brokerage\n\n4. DUAL REPRESENTATION REQUIRES DISCLOSURE [Adrec]\n   - Disclosure + separate brokerage contracts + honest/independent representation required\n\n5. ALL ADS/DOCS MUST CARRY BROKER IDENTIFIERS [Adrec]\n   - Broker registration number must appear on correspondence/ads/documents/material\n\n6. ONLINE LISTINGS REQUIRE MADHMOUN PERMIT [Dari-Services]\n   - Permit to Advertise on Websites required when publishing on accredited listing websites\n\n7. MINIMUM RETENTION: 5 YEARS [Ministry of Economy]\n   - All records/transactions must be retained for minimum 5 years\n\n8. AML REPORTING READINESS [Ministry of Economy]\n   - goAML registration is mandatory for DNFBPs\n   - REAR triggers include cash ≥ AED 55,000 and virtual asset scenarios\n\nCOMMISSION CAPS:\n- Sales: 2% with cap AED 500,000\n- Lease: Max 5% of annual rent if not agreed; from ONE party only\n\nVAT:\n- UAE standard rate: 5%\n- Apply only if MiCasa is VAT registered\n\nThis document is for reference only and does not generate output.',
  '{
    "type": "object",
    "properties": {
      "query_type": {"type": "string", "enum": ["full_list", "by_category", "specific_rule"]}
    }
  }'::jsonb,
  '{
    "type": "object",
    "properties": {
      "rules": {"type": "array"},
      "regulatory_refs": {"type": "array"}
    }
  }'::jsonb,
  NULL,
  ARRAY[]::text[],
  ARRAY['reference', 'rules', 'compliance', 'non-negotiable']::text[],
  99,
  true
) ON CONFLICT (prompt_id) DO NOTHING;