
# Conversational Data Capture & Document Action System

## Overview

Build an intelligent conversational interface where agents can naturally describe their needs (e.g., "I spoke to the client and need to send him an MOU") and the AI responds with:
1. Acknowledgment of the intent
2. Direct actionable links to the appropriate template
3. Pre-filled form data extracted from the conversation

---

## Architecture

```text
Agent Message                    AI Response
      │                              │
      ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│ Document Intent │          │ Structured      │
│ Detector        │─────────►│ Response with   │
│ (enhanced OPS)  │          │ Action Cards    │
└─────────────────┘          └─────────────────┘
      │                              │
      ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│ Entity Extractor│          │ Template Link   │
│ (names, dates,  │          │ with Pre-fill   │
│ amounts, IDs)   │          │ Parameters      │
└─────────────────┘          └─────────────────┘
```

---

## Implementation Components

### 1. Document Intent Vocabulary

Map natural language to template IDs:

| User Says | Template ID | Template Name |
|-----------|-------------|---------------|
| "send MOU", "memorandum" | FORM_08_MOU | MOU / Pre-SPA |
| "seller authorization", "list property" | FORM_01_SELLER_AUTH | Seller Authorization |
| "buyer agreement", "represent buyer" | FORM_02_BUYER_REP | Buyer Representation |
| "send offer", "make offer", "EOI" | FORM_07_OFFER | Offer Letter |
| "reservation form", "reserve unit" | FORM_09_RESERVATION | Reservation Form |
| "commission invoice", "send invoice" | FORM_12_INVOICE | Commission Invoice |
| "split sheet", "commission split" | FORM_13_SPLIT | Commission Split |
| "closing checklist", "complete deal" | FORM_10_CLOSING | Closing Checklist |
| "NOC request", "clearance" | FORM_11_NOC | NOC Tracker |
| "privacy consent", "data consent" | FORM_16_PRIVACY | Privacy Acknowledgment |

### 2. Enhanced System Prompt (bos-llm-ops)

Add template knowledge to the AI system prompt:

```
DOCUMENT ASSISTANCE:
When users mention needing documents, forms, or agreements:
1. Identify the appropriate template from the 18 official forms
2. Extract any mentioned data (client name, property, amounts)
3. Return a structured action block in your response

Action Block Format:
[DOCUMENT_ACTION]
template_id: FORM_08_MOU
template_name: Memorandum of Understanding
prefill: { "buyer_full_name": "John Smith", "property_address": "..." }
[/DOCUMENT_ACTION]

Available Templates:
- FORM_01_SELLER_AUTH: For listing authorization from sellers/landlords
- FORM_02_BUYER_REP: For buyer/tenant representation agreements
- FORM_07_OFFER: For formal offers/EOIs
- FORM_08_MOU: For pre-SPA agreements (sale terms before transfer)
- FORM_09_RESERVATION: For unit reservations/bookings
- FORM_12_INVOICE: For commission invoices
...
```

### 3. Frontend Action Card Renderer

Parse AI responses and render clickable action cards:

```tsx
interface DocumentAction {
  template_id: string;
  template_name: string;
  prefill?: Record<string, unknown>;
  description?: string;
}

function ActionCard({ action, onNavigate }: { 
  action: DocumentAction; 
  onNavigate: (templateId: string, prefill?: Record<string, unknown>) => void;
}) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-3 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{action.template_name}</p>
          <p className="text-xs text-muted-foreground">
            Click to open form wizard
          </p>
        </div>
        <Button size="sm" onClick={() => onNavigate(action.template_id, action.prefill)}>
          <FileText className="h-4 w-4 mr-1" />
          Open Template
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 4. Conversation Data Extractor

Extract entities from conversation for pre-filling:

```typescript
interface ConversationContext {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  propertyAddress?: string;
  dealAmount?: number;
  dealType?: 'sale' | 'lease';
  mentionedDealId?: string;
  mentionedLeadId?: string;
}

function extractConversationContext(messages: Message[]): ConversationContext {
  // Parse recent messages for:
  // - Names (e.g., "client John Smith")
  // - Emails, phones
  // - Amounts (e.g., "2.5 million AED")
  // - Property mentions
  // - CRM IDs (DL-xxx, LD-xxx)
}
```

### 5. Template Quick Actions Component

New component for the chat panel showing relevant templates:

```tsx
function DocumentQuickActions({ 
  conversationContext: ConversationContext;
  onSelectTemplate: (id: string, prefill?: Record<string, unknown>) => void;
}) {
  // Show contextually relevant templates based on conversation
  // e.g., if deal is mentioned → show MOU, Offer, Reservation
  // if new client → show Buyer Rep, Seller Auth
}
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/lib/document-intent.ts` | Document intent detection and template mapping |
| `src/components/ai/DocumentActionCard.tsx` | Render action cards in chat |
| `src/components/ai/ChatMessageRenderer.tsx` | Parse and render structured responses |
| `src/hooks/useConversationContext.ts` | Track and extract conversation data |

### Modified Files

| File | Changes |
|------|---------|
| `supabase/functions/bos-llm-ops/index.ts` | Add template knowledge to system prompt |
| `src/components/ai/FloatingAIChat.tsx` | Add action card rendering and navigation |
| `src/lib/chat-suggestions.ts` | Add document-related suggestions |
| `src/components/documents/FilledFormsPanel.tsx` | Accept prefill props |
| `src/components/documents/StaticFormFiller.tsx` | Support initial values from prefill |

---

## User Flow Example

```text
1. Agent: "I just spoke with Ahmed about the villa in Al Raha. 
           He wants to proceed - need to send him an MOU"

2. AI Response:
   "I understand you need to send Ahmed an MOU for the Al Raha villa.
   
   I've identified the appropriate template and pre-filled what I could
   from our conversation:
   
   [ACTION CARD]
   📄 Memorandum of Understanding (MOU/SPA Pre-Stage)
   Pre-filled: Buyer name, Property location
   [Open Template →]
   [/ACTION CARD]
   
   Would you like me to help with anything else for this deal?"

3. Agent clicks "Open Template" → 
   FormWizard opens with buyer_full_name="Ahmed" and 
   property_address="Al Raha" pre-filled
```

---

## Technical Implementation Details

### Document Intent Detection Algorithm

```typescript
const DOCUMENT_PATTERNS = {
  'FORM_08_MOU': [
    /\b(mou|memorandum|pre.?spa|sale agreement|purchase terms)\b/i,
    /\b(proceed|agree.*terms|sign.*agreement)\b/i
  ],
  'FORM_01_SELLER_AUTH': [
    /\b(list.*property|seller auth|landlord auth|mandate)\b/i,
    /\b(want.*to.*sell|listing agreement)\b/i
  ],
  'FORM_07_OFFER': [
    /\b(offer|eoi|expression.*interest|submit.*offer)\b/i,
    /\b(make.*offer|propose.*price)\b/i
  ],
  // ... more patterns
};

function detectDocumentIntent(message: string): DocumentIntent | null {
  for (const [templateId, patterns] of Object.entries(DOCUMENT_PATTERNS)) {
    if (patterns.some(p => p.test(message))) {
      return { templateId, confidence: calculateConfidence(message, patterns) };
    }
  }
  return null;
}
```

### Action Block Parser

```typescript
const ACTION_BLOCK_REGEX = /\[DOCUMENT_ACTION\]([\s\S]*?)\[\/DOCUMENT_ACTION\]/g;

function parseActionBlocks(response: string): {
  text: string;
  actions: DocumentAction[];
} {
  const actions: DocumentAction[] = [];
  const text = response.replace(ACTION_BLOCK_REGEX, (_, content) => {
    const action = parseYamlBlock(content);
    actions.push(action);
    return ''; // Remove from display text
  });
  return { text: text.trim(), actions };
}
```

### Form Pre-fill Integration

```typescript
// In FilledFormsPanel or via URL params
function openTemplateWithPrefill(
  templateId: string, 
  prefill: Record<string, unknown>
) {
  // Store prefill in session storage
  sessionStorage.setItem(
    `template_prefill_${templateId}`, 
    JSON.stringify(prefill)
  );
  
  // Navigate to form wizard
  // The StaticFormFiller reads from session storage on mount
}
```

---

## Suggested Conversation Starters

Add to `chat-suggestions.ts`:

```typescript
const DOCUMENT_SUGGESTIONS = [
  "I need to send an MOU to my client",
  "Prepare a seller authorization",
  "Generate an offer letter",
  "Create a commission invoice",
  "Fill out a reservation form",
];
```

---

## Security Considerations

1. **Pre-fill Validation**: Sanitize all pre-filled data before inserting into forms
2. **Template Access**: Verify user has permission to access requested templates
3. **Data Extraction**: Only extract data from the current user's conversation
4. **No Auto-Submit**: Always require human review before document generation

---

## Success Metrics

- Reduction in clicks from "need document" to "form open"
- Accuracy of template recommendation
- Percentage of pre-fill fields correctly populated
- Agent adoption rate of conversational document creation
