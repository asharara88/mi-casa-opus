
# Automated Follow-Up Composer

## Overview

Build an AI-powered follow-up message generator that creates personalized WhatsApp, SMS, and Email messages based on:
1. **Entity context** (lead requirements, deal stage, viewing history)
2. **Communication history** (what was last said, when, outcome)
3. **Pipeline state** (urgency indicators, aging, next actions)
4. **Conversational trigger** (agent describes situation in Mi Asistente)

The agent can either request follow-ups through natural conversation ("I need to follow up with Ahmed about the viewing") or use a quick-action button on entity detail pages.

---

## Architecture

```text
Agent Request                              Generated Follow-Up
      │                                           │
      ▼                                           ▼
┌─────────────────┐                    ┌─────────────────┐
│ Trigger Source  │                    │ Review Panel    │
│ • Chat request  │───────────────────►│ • Preview text  │
│ • Quick button  │                    │ • Edit if needed│
│ • Bulk action   │                    │ • Send button   │
└─────────────────┘                    └─────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│ Context Builder │                    │ Channel Select  │
│ • Entity data   │                    │ • WhatsApp      │
│ • Comm history  │                    │ • SMS           │
│ • Deal stage    │                    │ • Email         │
│ • Last viewing  │                    └─────────────────┘
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ LLM Composer    │
│ bos-llm-followup│
│ (new function)  │
└─────────────────┘
```

---

## Implementation Components

### 1. New Edge Function: `bos-llm-followup`

Creates personalized follow-up messages using the Lovable AI Gateway.

**Input:**
- `entityType`: 'prospect' | 'lead' | 'deal'
- `entityData`: Full entity record
- `communicationHistory`: Last 5 messages
- `channel`: 'whatsapp' | 'sms' | 'email'
- `followUpType`: 'viewing_followup' | 'general_checkin' | 'document_reminder' | 'offer_followup' | 'hot_lead_reengagement'
- `agentNotes`: Optional notes from agent about the situation

**Output:**
```json
{
  "subject": "Re: Your Property Search",  // For email only
  "message": "Hi Ahmed! Following up on your viewing...",
  "tone": "professional_friendly",
  "urgency": "medium",
  "suggested_timing": "morning",
  "personalization_elements": ["mentioned_property", "viewing_date", "budget_fit"]
}
```

### 2. Follow-Up Composer Component

New UI component `FollowUpComposer.tsx` with:

| Section | Description |
|---------|-------------|
| Entity Header | Shows who the follow-up is for |
| Follow-Up Type Selector | Quick buttons for common scenarios |
| AI Generate Button | One-click to generate personalized message |
| Preview/Edit | Shows generated message with edit capability |
| Channel Selector | WhatsApp / SMS / Email tabs |
| Send Button | Dispatches through existing Twilio/SendGrid |

### 3. Chat Integration

Extend the Mi Asistente system prompt to recognize follow-up requests:

**Patterns:**
- "Follow up with [name]"
- "I need to re-engage [name]"
- "Send a check-in to [entity ID]"
- "Remind [name] about the viewing"

**Response format:**
```
[FOLLOWUP_ACTION]
entity_type: lead
entity_id: LD-ABC123
recipient_name: Ahmed Al Mansouri
recipient_phone: +971501234567
recipient_email: ahmed@example.com
suggested_message: "Hi Ahmed! Following up on your recent viewing of the Marina apartment. Were you able to discuss the offer terms with your family? I'm available anytime this week if you have questions."
channel: whatsapp
follow_up_type: viewing_followup
[/FOLLOWUP_ACTION]
```

### 4. Entity Detail Quick Actions

Add "AI Follow-Up" button to:
- `LeadDetail.tsx` - Quick follow-up for leads
- `DealDetail.tsx` - Context-aware deal follow-ups
- `ProspectDetailSheet.tsx` - Re-engagement for cold prospects

### 5. Follow-Up Type Templates

| Type | Trigger Context | AI Focus |
|------|-----------------|----------|
| `viewing_followup` | After viewing completed | Property interest, next steps |
| `general_checkin` | No contact for 7+ days | Warm re-engagement |
| `document_reminder` | Missing docs in deal | Gentle nudge, deadline awareness |
| `offer_followup` | Offer submitted, awaiting response | Price/terms discussion |
| `hot_lead_reengagement` | High score, gone cold | Urgency, FOMO elements |
| `deal_milestone` | Stage advanced | Congratulations, next steps |

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/bos-llm-followup/index.ts` | Edge function for AI message generation |
| `src/components/communication/FollowUpComposer.tsx` | Main composer UI component |
| `src/components/communication/FollowUpActionCard.tsx` | Action card for chat panel |
| `src/hooks/useFollowUpComposer.ts` | Hook to manage composer state and API calls |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/bos-llm-ops/index.ts` | Add follow-up intent detection to system prompt |
| `src/components/ai/ChatMessageRenderer.tsx` | Parse and render `FOLLOWUP_ACTION` blocks |
| `src/components/leads/LeadDetail.tsx` | Add AI Follow-Up quick action button |
| `src/components/deals/DealDetail.tsx` | Add AI Follow-Up button in overview tab |
| `src/components/prospects/ProspectDetailSheet.tsx` | Add follow-up action |
| `src/lib/chat-suggestions.ts` | Add follow-up related suggestions |
| `src/hooks/useCommunications.ts` | Add `useGenerateFollowUp` hook |

---

## User Flow Examples

### Flow 1: Chat-Triggered Follow-Up

```text
Agent: "Follow up with Ahmed about the Marina villa viewing yesterday"

Mi Asistente: "I've prepared a personalized follow-up for Ahmed:

[FOLLOWUP ACTION CARD]
📱 WhatsApp to Ahmed Al Mansouri
━━━━━━━━━━━━━━━━━━━━
Hi Ahmed! I hope you had a chance to reflect on the 
Marina villa we viewed yesterday. The 3BR with the 
stunning marina views really seemed to match what 
you described - especially the home office space.

I wanted to check if you have any questions about 
the payment plan or would like to schedule a second 
viewing with your family?

[Edit] [Preview] [Send WhatsApp]
━━━━━━━━━━━━━━━━━━━━
📧 Switch to Email | 💬 Switch to SMS

Would you like me to adjust the tone or add any specific details?"
```

### Flow 2: Quick Action from Lead Detail

```text
1. Agent opens lead LD-ABC123 (Ahmed)
2. Clicks "AI Follow-Up" button
3. Modal opens with:
   - Follow-up type selector (defaults to appropriate type based on last activity)
   - Generated message preview
   - Channel selection (pre-selected to WhatsApp if phone available)
4. Agent reviews, optionally edits
5. Clicks "Send" → Message dispatched via Twilio
6. Communication logged automatically
```

---

## Technical Details

### Edge Function System Prompt (bos-llm-followup)

```
You are a professional real estate follow-up message composer for Mi Casa Properties (Abu Dhabi).

Generate personalized, culturally appropriate follow-up messages that:
1. Reference specific details from the client's history (property viewed, budget, requirements)
2. Maintain professional yet warm UAE business tone
3. Include a clear call-to-action
4. Are appropriate length for the channel (WhatsApp: 150-300 chars, SMS: <160 chars, Email: 2-3 paragraphs)

NEVER:
- Be pushy or aggressive
- Make promises about prices or availability
- Include false urgency
- Use ALL CAPS or excessive emojis

For WhatsApp: Use 1-2 relevant emojis, informal but professional
For SMS: Extremely concise, include callback number
For Email: Professional greeting, structured paragraphs, signature line

Context provided:
- Entity data (lead/deal/prospect details)
- Communication history (last 5 messages)
- Viewing history if applicable
- Current pipeline stage
- Agent notes about the situation
```

### Context Building

```typescript
interface FollowUpContext {
  entity: {
    type: 'prospect' | 'lead' | 'deal';
    id: string;
    name: string;
    phone?: string;
    email?: string;
    requirements?: Record<string, unknown>;
    stage?: string;
    score?: number;
  };
  recentCommunication: {
    lastContactAt?: string;
    lastChannel?: string;
    lastOutcome?: string;
    messageCount: number;
  };
  viewingHistory?: {
    lastViewingDate?: string;
    propertyViewed?: string;
    feedback?: string;
  };
  dealContext?: {
    stage?: string;
    agreedPrice?: number;
    pendingDocuments?: string[];
  };
  agentNotes?: string;
}
```

### Integration with Existing Messaging

The composer uses the existing `useSendWhatsApp`, `useSendSMS`, and `useSendEmail` hooks from `useCommunications.ts`, ensuring:
- Messages are logged in `communication_logs` table
- Proper authentication via Supabase RLS
- Consistent error handling and toasts

---

## Success Metrics

- Time saved per follow-up (target: 80% reduction vs manual typing)
- Send rate after AI generation (target: >90% acceptance)
- Personalization accuracy (measured by edit rate before send)
- Response rate from recipients (compared to template messages)

---

## Security Considerations

1. **Data Access**: Only fetch entities user has permission to via RLS
2. **Rate Limiting**: Apply same 429/402 handling as other LLM functions
3. **Content Review**: Always show preview before send (no auto-send)
4. **Audit Trail**: All messages logged with AI-generated flag
