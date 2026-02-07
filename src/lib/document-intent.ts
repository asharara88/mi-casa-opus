/**
 * Document Intent Detection & Action Block Parsing
 * Maps natural language to template IDs and parses structured action blocks from AI responses
 */

export interface DocumentIntent {
  templateId: string;
  templateName: string;
  confidence: number;
}

export interface DocumentAction {
  template_id: string;
  template_name: string;
  prefill?: Record<string, unknown>;
  description?: string;
}

export interface ParsedResponse {
  text: string;
  actions: DocumentAction[];
}

// Template metadata for all 18 official forms
export const TEMPLATE_METADATA: Record<string, { name: string; description: string; category: string }> = {
  'FORM_01_SELLER_AUTH': {
    name: 'Seller/Landlord Authorization',
    description: 'Authorization to list and market property',
    category: 'Onboarding'
  },
  'FORM_02_BUYER_REP': {
    name: 'Buyer/Tenant Representation Agreement',
    description: 'Agreement to represent buyer or tenant',
    category: 'Onboarding'
  },
  'FORM_03_MARKETING': {
    name: 'Marketing Consent',
    description: 'Property listing and marketing authorization',
    category: 'Listing'
  },
  'FORM_04_AGENT_LICENSE': {
    name: 'Agent License Record',
    description: 'Agent registration and license details',
    category: 'Compliance'
  },
  'FORM_05_COMPANY_LICENSE': {
    name: 'Company Trade License',
    description: 'Brokerage regulatory records',
    category: 'Compliance'
  },
  'FORM_06_AGENT_AGREEMENT': {
    name: 'Agent-to-Agent Agreement',
    description: 'External cooperation agreement',
    category: 'External'
  },
  'FORM_07_OFFER': {
    name: 'Offer Letter / EOI',
    description: 'Expression of Interest or formal offer',
    category: 'Transaction'
  },
  'FORM_08_MOU': {
    name: 'Memorandum of Understanding',
    description: 'Pre-SPA agreement with sale terms',
    category: 'Transaction'
  },
  'FORM_09_RESERVATION': {
    name: 'Reservation/Booking Form',
    description: 'Unit reservation with deposit details',
    category: 'Transaction'
  },
  'FORM_10_CLOSING': {
    name: 'Closing Checklist',
    description: 'Deal completion and handover checklist',
    category: 'Closing'
  },
  'FORM_11_NOC': {
    name: 'NOC Request Tracker',
    description: 'No Objection Certificate tracker',
    category: 'Closing'
  },
  'FORM_12_INVOICE': {
    name: 'Commission/VAT Invoice',
    description: 'Commission invoice with VAT',
    category: 'Financial'
  },
  'FORM_13_SPLIT': {
    name: 'Commission Split Sheet',
    description: 'Commission authorization and splits',
    category: 'Financial'
  },
  'FORM_14_REFUND': {
    name: 'Refund/Cancellation Form',
    description: 'Refund or cancellation approval',
    category: 'Financial'
  },
  'FORM_15_LEDGER': {
    name: 'Deal Ledger',
    description: 'Financial reconciliation ledger',
    category: 'Financial'
  },
  'FORM_16_PRIVACY': {
    name: 'Privacy Acknowledgment',
    description: 'Client data consent form',
    category: 'Operations'
  },
  'FORM_17_COMPLAINT': {
    name: 'Complaint/Incident Register',
    description: 'Dispute and incident logging',
    category: 'Operations'
  },
  'FORM_18_GOVERNANCE': {
    name: 'Agent Governance Pack',
    description: 'Internal agent governance documents',
    category: 'Operations'
  }
};

// Pattern matching for document intent detection
const DOCUMENT_PATTERNS: Record<string, RegExp[]> = {
  'FORM_08_MOU': [
    /\b(mou|memorandum|pre.?spa|sale agreement|purchase terms)\b/i,
    /\b(proceed|agree.*terms|sign.*agreement|prepare.*agreement)\b/i,
    /\b(send.*mou|draft.*mou|create.*mou)\b/i
  ],
  'FORM_01_SELLER_AUTH': [
    /\b(list.*property|seller auth|landlord auth|mandate|exclusive)\b/i,
    /\b(want.*to.*sell|listing agreement|listing auth)\b/i,
    /\b(seller.*authorization|landlord.*authorization)\b/i
  ],
  'FORM_02_BUYER_REP': [
    /\b(buyer agreement|represent.*buyer|tenant.*rep|buyer.*rep)\b/i,
    /\b(looking.*buy|want.*buy|buyer.*looking)\b/i,
    /\b(tenant.*agreement|tenant.*representation)\b/i
  ],
  'FORM_07_OFFER': [
    /\b(offer|eoi|expression.*interest|submit.*offer)\b/i,
    /\b(make.*offer|propose.*price|offer.*letter)\b/i,
    /\b(interested.*in.*buying|interested.*in.*property)\b/i
  ],
  'FORM_09_RESERVATION': [
    /\b(reservation|reserve.*unit|booking.*form|book.*unit)\b/i,
    /\b(reserve|booking|hold.*unit)\b/i
  ],
  'FORM_12_INVOICE': [
    /\b(commission.*invoice|invoice|billing|send.*invoice)\b/i,
    /\b(vat.*invoice|create.*invoice|generate.*invoice)\b/i
  ],
  'FORM_13_SPLIT': [
    /\b(split.*sheet|commission.*split|split.*commission)\b/i,
    /\b(co.?broker|shared.*commission|split.*deal)\b/i
  ],
  'FORM_10_CLOSING': [
    /\b(closing.*checklist|complete.*deal|handover|closing)\b/i,
    /\b(deal.*completion|finalize.*deal)\b/i
  ],
  'FORM_11_NOC': [
    /\b(noc|clearance|no.*objection|developer.*clearance)\b/i,
    /\b(request.*noc|obtain.*noc)\b/i
  ],
  'FORM_16_PRIVACY': [
    /\b(privacy.*consent|data.*consent|gdpr|privacy.*acknowledgment)\b/i,
    /\b(consent.*form|data.*protection)\b/i
  ],
  'FORM_03_MARKETING': [
    /\b(marketing.*consent|advertising|publish.*listing|portal.*consent)\b/i,
    /\b(marketing.*authorization|listing.*consent)\b/i
  ],
  'FORM_06_AGENT_AGREEMENT': [
    /\b(agent.*to.*agent|co.?broker.*agreement|external.*agent)\b/i,
    /\b(cooperation.*agreement|referral.*agreement)\b/i
  ],
  'FORM_14_REFUND': [
    /\b(refund|cancellation|cancel.*deal|return.*deposit)\b/i,
    /\b(cancel.*booking|refund.*request)\b/i
  ],
  'FORM_17_COMPLAINT': [
    /\b(complaint|dispute|incident|grievance)\b/i,
    /\b(log.*complaint|register.*incident)\b/i
  ]
};

/**
 * Detect document intent from a message
 */
export function detectDocumentIntent(message: string): DocumentIntent | null {
  let bestMatch: DocumentIntent | null = null;
  let highestConfidence = 0;
  
  for (const [templateId, patterns] of Object.entries(DOCUMENT_PATTERNS)) {
    const matchCount = patterns.filter(p => p.test(message)).length;
    if (matchCount > 0) {
      const confidence = matchCount / patterns.length;
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        const metadata = TEMPLATE_METADATA[templateId];
        bestMatch = {
          templateId,
          templateName: metadata?.name || templateId,
          confidence
        };
      }
    }
  }
  
  return bestMatch;
}

/**
 * Parse action blocks from AI response
 * Format: [DOCUMENT_ACTION]...[/DOCUMENT_ACTION]
 */
const ACTION_BLOCK_REGEX = /\[DOCUMENT_ACTION\]([\s\S]*?)\[\/DOCUMENT_ACTION\]/g;

export function parseActionBlocks(response: string): ParsedResponse {
  const actions: DocumentAction[] = [];
  
  const text = response.replace(ACTION_BLOCK_REGEX, (_, content: string) => {
    try {
      const action = parseYamlLikeBlock(content.trim());
      if (action.template_id && action.template_name) {
        actions.push(action);
      }
    } catch (e) {
      console.error('[Document Intent] Failed to parse action block:', e);
    }
    return ''; // Remove the action block from display text
  });
  
  return { text: text.trim(), actions };
}

/**
 * Parse a YAML-like block into a DocumentAction object
 */
function parseYamlLikeBlock(content: string): DocumentAction {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();
    
    // Handle JSON objects (prefill)
    if (typeof value === 'string' && value.startsWith('{')) {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if JSON parse fails
      }
    }
    
    result[key] = value;
  }
  
  return {
    template_id: (result.template_id as string) || '',
    template_name: (result.template_name as string) || '',
    prefill: result.prefill as Record<string, unknown> | undefined,
    description: result.description as string | undefined
  };
}

/**
 * Build a prefill object from conversation context
 */
export interface ConversationEntity {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  propertyAddress?: string;
  propertyType?: string;
  dealAmount?: number;
  dealType?: 'sale' | 'lease';
  mentionedDealId?: string;
  mentionedLeadId?: string;
  mentionedProspectId?: string;
}

/**
 * Extract entities from conversation messages for pre-filling forms
 */
export function extractConversationEntities(messages: Array<{ content: string }>): ConversationEntity {
  const context: ConversationEntity = {};
  const combinedText = messages.map(m => m.content).join(' ');
  
  // Extract CRM IDs
  const dealIdMatch = combinedText.match(/\bDL-[A-Z0-9]{4,12}\b/i);
  if (dealIdMatch) context.mentionedDealId = dealIdMatch[0].toUpperCase();
  
  const leadIdMatch = combinedText.match(/\bLD-[A-Z0-9]{4,12}\b/i);
  if (leadIdMatch) context.mentionedLeadId = leadIdMatch[0].toUpperCase();
  
  const prospectIdMatch = combinedText.match(/\b(PR|CRM)-[A-Z0-9]{4,12}\b/i);
  if (prospectIdMatch) context.mentionedProspectId = prospectIdMatch[0].toUpperCase();
  
  // Extract email
  const emailMatch = combinedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) context.clientEmail = emailMatch[0].toLowerCase();
  
  // Extract phone (UAE format)
  const phoneMatch = combinedText.match(/\+?971[0-9]{8,9}|05[0-9]{8}/);
  if (phoneMatch) context.clientPhone = phoneMatch[0];
  
  // Extract amount (AED format)
  const amountPatterns = [
    /\b(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:aed|dirhams?)\b/i,
    /\baed\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\b/i,
    /\b(\d+(?:\.\d{1,2})?)\s*(?:million|m)\s*(?:aed|dirhams?)?\b/i,
    /\b(\d+(?:\.\d{1,2})?)\s*(?:k|thousand)\s*(?:aed|dirhams?)?\b/i
  ];
  
  for (const pattern of amountPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      if (/million|m\b/i.test(match[0])) amount *= 1000000;
      if (/k|thousand/i.test(match[0])) amount *= 1000;
      context.dealAmount = amount;
      break;
    }
  }
  
  // Extract names (simple heuristic - words after "client", "customer", "buyer", "seller")
  const namePatterns = [
    /\b(?:client|customer|buyer|seller|tenant|landlord)\s+(?:named?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:is\s+)?(?:the\s+)?(?:client|customer|buyer|seller)\b/i,
    /\bspoke\s+(?:to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i
  ];
  
  for (const pattern of namePatterns) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      const excludeWords = ['The', 'This', 'That', 'Which', 'Where', 'When', 'What', 'How', 'Property', 'Unit', 'Villa', 'Apartment'];
      if (!excludeWords.includes(match[1])) {
        context.clientName = match[1];
        break;
      }
    }
  }
  
  // Extract property address/location hints
  const locationPatterns = [
    /\b(?:in|at)\s+((?:Al\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/,
    /\b(Dubai\s+Marina|Downtown\s+Dubai|Palm\s+Jumeirah|Business\s+Bay|JBR|JVC|JVT|Arabian\s+Ranches)\b/i,
    /\b(?:villa|apartment|unit)\s+(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      context.propertyAddress = match[1];
      break;
    }
  }
  
  // Detect deal type
  if (/\b(sale|selling|purchase|buying|buy)\b/i.test(combinedText)) {
    context.dealType = 'sale';
  } else if (/\b(rent|lease|leasing|tenant)\b/i.test(combinedText)) {
    context.dealType = 'lease';
  }
  
  // Detect property type
  if (/\bvilla\b/i.test(combinedText)) {
    context.propertyType = 'Villa';
  } else if (/\bapartment|flat\b/i.test(combinedText)) {
    context.propertyType = 'Apartment';
  } else if (/\btownhouse\b/i.test(combinedText)) {
    context.propertyType = 'Townhouse';
  } else if (/\boffice\b/i.test(combinedText)) {
    context.propertyType = 'Office';
  } else if (/\bretail|shop\b/i.test(combinedText)) {
    context.propertyType = 'Retail';
  }
  
  return context;
}

/**
 * Map extracted entities to form fields based on template
 */
export function mapEntitiesToPrefill(
  templateId: string, 
  entities: ConversationEntity
): Record<string, unknown> {
  const prefill: Record<string, unknown> = {};
  
  // Common mappings across templates
  if (entities.clientName) {
    switch (templateId) {
      case 'FORM_08_MOU':
      case 'FORM_07_OFFER':
        prefill.buyer_full_name = entities.clientName;
        break;
      case 'FORM_01_SELLER_AUTH':
        prefill.owner_full_name = entities.clientName;
        break;
      case 'FORM_02_BUYER_REP':
        prefill.client_full_name = entities.clientName;
        break;
      case 'FORM_09_RESERVATION':
        prefill.buyer_name = entities.clientName;
        break;
      default:
        prefill.client_name = entities.clientName;
    }
  }
  
  if (entities.clientEmail) {
    prefill.client_email = entities.clientEmail;
    prefill.buyer_email = entities.clientEmail;
    prefill.owner_email = entities.clientEmail;
  }
  
  if (entities.clientPhone) {
    prefill.client_phone = entities.clientPhone;
    prefill.buyer_phone = entities.clientPhone;
    prefill.owner_phone = entities.clientPhone;
  }
  
  if (entities.propertyAddress) {
    prefill.property_address = entities.propertyAddress;
    prefill.property_location = entities.propertyAddress;
  }
  
  if (entities.propertyType) {
    prefill.property_type = entities.propertyType;
  }
  
  if (entities.dealAmount) {
    prefill.purchase_price = entities.dealAmount;
    prefill.agreed_price = entities.dealAmount;
    prefill.total_price = entities.dealAmount;
  }
  
  if (entities.dealType) {
    prefill.transaction_type = entities.dealType === 'sale' ? 'Sale' : 'Lease';
  }
  
  if (entities.mentionedDealId) {
    prefill.deal_crm_id = entities.mentionedDealId;
  }
  
  if (entities.mentionedLeadId) {
    prefill.linked_lead_id = entities.mentionedLeadId;
  }
  
  return prefill;
}

// Document suggestions for chat
export const DOCUMENT_SUGGESTIONS = [
  "I need to send an MOU to my client",
  "Prepare a seller authorization",
  "Generate an offer letter",
  "Create a commission invoice",
  "Fill out a reservation form",
];
