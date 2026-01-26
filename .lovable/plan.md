

# Dynamic Suggested Prompts for AI Agent Chat

## Overview

Enhance the AI Agent chat experience by replacing static quick prompts with intelligent, context-aware suggestions that adapt based on the conversation flow. This eliminates repetitive typing and guides users toward productive next steps.

---

## Current State

Both `AIAgentChat.tsx` and `FloatingAIChat.tsx` have hardcoded `QUICK_PROMPTS` arrays that only appear when the chat is empty:

```typescript
const QUICK_PROMPTS = [
  { label: 'Pipeline Status', prompt: 'Give me a summary of the current pipeline health' },
  { label: 'Today\'s Priorities', prompt: 'What should I focus on today?' },
  // ... etc
];
```

**Problems:**
- Suggestions disappear after the first message
- No contextual awareness of conversation topic
- Users must type follow-up questions manually

---

## Solution: Smart Suggestion Engine

### Suggestion Categories

| Category | Trigger | Example Suggestions |
|----------|---------|---------------------|
| **Initial** | Empty chat | "Pipeline status", "Today's priorities", "Recent leads" |
| **Prospect Context** | User asks about a prospect | "Show contact history", "Generate voice message", "Update status" |
| **Lead Context** | User asks about a lead | "Qualify this lead", "Find matching properties", "Schedule follow-up" |
| **Deal Context** | User asks about a deal | "Show deal economics", "Check compliance status", "View timeline" |
| **Pipeline/Analytics** | User asks about metrics | "Compare to last month", "Show by agent", "Export report" |
| **Follow-up** | After any response | "Tell me more", "What's next?", "Any concerns?" |

### Implementation Approach

1. **Analyze last message content** to detect entities and topics
2. **Generate 3-4 relevant suggestions** based on detected context
3. **Display suggestions below the input area** (always visible during conversation)
4. **Clicking a suggestion sends it immediately**

---

## Technical Implementation

### New Utility: `generateSuggestions()`

Create a function that analyzes the conversation and returns contextual prompts:

```typescript
interface SuggestionContext {
  lastUserMessage: string;
  lastAssistantMessage: string;
  messageCount: number;
  detectedEntities: {
    prospectIds?: string[];
    leadIds?: string[];
    dealIds?: string[];
    names?: string[];
  };
}

function generateSuggestions(context: SuggestionContext): string[] {
  // Returns 3-4 relevant prompts based on context
}
```

### Entity Detection Logic

Parse messages for:
- **CRM IDs**: `PR-XXXXXX`, `LD-XXXXXX`, `DL-XXXXXX`
- **Names**: Capitalized words that aren't common terms
- **Topics**: Keywords like "pipeline", "deal", "lead", "prospect", "compliance"

### Suggestion Mapping

| Detected Pattern | Generated Suggestions |
|------------------|----------------------|
| Prospect name/ID mentioned | "Show their requirements", "Generate a follow-up message", "What's their status?" |
| Lead ID mentioned | "Qualify this lead", "Find matching listings", "What's the next action?" |
| Deal ID mentioned | "Show deal economics", "Check compliance status", "What documents are pending?" |
| Pipeline/metrics topic | "Break down by stage", "Show aging leads", "Compare to last week" |
| Listing topic | "Generate description", "Find similar listings", "What's the competition?" |
| No specific context | "Show today's priorities", "Any urgent follow-ups?", "Pipeline health check" |

---

## UI Changes

### Suggestion Chips Component

Create a reusable `SuggestionChips.tsx` component:

```tsx
interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
}

function SuggestionChips({ suggestions, onSelect, isLoading }: SuggestionChipsProps) {
  if (isLoading || suggestions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-border bg-muted/30">
      <span className="text-xs text-muted-foreground">Suggestions:</span>
      {suggestions.map((s) => (
        <Button
          key={s}
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => onSelect(s)}
        >
          {s}
        </Button>
      ))}
    </div>
  );
}
```

### Layout Update

Place suggestions between the message area and input:

```text
┌────────────────────────────────────┐
│ [Messages ScrollArea]              │
├────────────────────────────────────┤
│ Suggestions: [Chip] [Chip] [Chip]  │  ← NEW
├────────────────────────────────────┤
│ [Input] [Send]                     │
└────────────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ai/SuggestionChips.tsx` | Reusable suggestion buttons component |
| `src/lib/chat-suggestions.ts` | Suggestion generation logic with entity detection |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ai/AIAgentChat.tsx` | Add dynamic suggestions below messages, integrate suggestion generator |
| `src/components/ai/FloatingAIChat.tsx` | Same updates for the floating chat panel |

---

## Suggestion Generation Logic

```typescript
// src/lib/chat-suggestions.ts

const ENTITY_PATTERNS = {
  prospect: /\b(PR|CRM)-[A-Z0-9]{4,12}\b/gi,
  lead: /\bLD-[A-Z0-9]{4,12}\b/gi,
  deal: /\bDL-[A-Z0-9]{4,12}\b/gi,
};

const TOPIC_SUGGESTIONS = {
  prospect: [
    "What's their contact history?",
    "Generate a follow-up voice message",
    "Update their status",
    "Show their requirements",
  ],
  lead: [
    "Qualify this lead",
    "Find matching properties",
    "Schedule next action",
    "Show lead timeline",
  ],
  deal: [
    "Show deal economics",
    "Check compliance status",
    "What documents are pending?",
    "Show transaction timeline",
  ],
  pipeline: [
    "Break down by stage",
    "Show aging leads",
    "Compare to last week",
    "Which deals need attention?",
  ],
  listing: [
    "Generate a description",
    "Find similar properties",
    "What's the competition?",
    "Show market insights",
  ],
  default: [
    "Show today's priorities",
    "Any urgent follow-ups?",
    "Pipeline health check",
    "Recent activity summary",
  ],
};

export function generateSuggestions(
  lastUserMessage: string,
  lastAssistantResponse: string,
  messageCount: number
): string[] {
  // Empty chat - show defaults
  if (messageCount === 0) {
    return TOPIC_SUGGESTIONS.default;
  }

  const combined = `${lastUserMessage} ${lastAssistantResponse}`.toLowerCase();
  
  // Check for entity mentions
  if (ENTITY_PATTERNS.prospect.test(lastUserMessage) || combined.includes('prospect')) {
    return TOPIC_SUGGESTIONS.prospect.slice(0, 4);
  }
  if (ENTITY_PATTERNS.lead.test(lastUserMessage) || combined.includes('lead')) {
    return TOPIC_SUGGESTIONS.lead.slice(0, 4);
  }
  if (ENTITY_PATTERNS.deal.test(lastUserMessage) || combined.includes('deal') || combined.includes('transaction')) {
    return TOPIC_SUGGESTIONS.deal.slice(0, 4);
  }
  
  // Check for topic keywords
  if (combined.includes('pipeline') || combined.includes('funnel') || combined.includes('metrics')) {
    return TOPIC_SUGGESTIONS.pipeline.slice(0, 4);
  }
  if (combined.includes('listing') || combined.includes('property') || combined.includes('unit')) {
    return TOPIC_SUGGESTIONS.listing.slice(0, 4);
  }
  
  // Generic follow-ups
  return [
    "Tell me more",
    "What should I do next?",
    "Any concerns?",
    "Show related data",
  ];
}
```

---

## Implementation Phases

### Phase 1: Core Logic
1. Create `src/lib/chat-suggestions.ts` with entity detection and suggestion mapping
2. Create `src/components/ai/SuggestionChips.tsx` component

### Phase 2: Integrate into AIAgentChat
1. Import suggestion generator and chips component
2. Add state for current suggestions
3. Update suggestions after each message exchange
4. Display chips above the input area

### Phase 3: Integrate into FloatingAIChat
1. Apply same changes to the floating chat variant
2. Adjust styling for the narrower sheet layout

---

## Result

Users will see 3-4 contextual suggestions that update after each exchange:

**Scenario 1: User asks about a prospect**
> User: "Tell me about prospect Zaid"
> AI: "Found Zaid Al-Rashid (PR-ABC123)..."
> **Suggestions**: [What's their contact history?] [Generate follow-up message] [Update status] [Show requirements]

**Scenario 2: User asks about pipeline**
> User: "Pipeline status"
> AI: "Current pipeline shows 45 leads..."
> **Suggestions**: [Break down by stage] [Show aging leads] [Compare to last week] [Which deals need attention?]

**Scenario 3: Generic follow-up**
> User: "What should I focus on today?"
> AI: "You have 3 leads due for follow-up..."
> **Suggestions**: [Tell me more] [Show lead details] [Any compliance issues?] [Schedule reminders]

