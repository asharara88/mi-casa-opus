// Entity detection patterns for CRM entities (no global flag to avoid stateful test())
const ENTITY_PATTERNS = {
  prospect: /\b(PR|CRM)-[A-Z0-9]{4,12}\b/i,
  lead: /\bLD-[A-Z0-9]{4,12}\b/i,
  deal: /\bDL-[A-Z0-9]{4,12}\b/i,
};

// Topic-specific suggestion prompts
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
  compliance: [
    "Show pending approvals",
    "Any overdue documents?",
    "Risk flags summary",
    "Compliance checklist",
  ],
  marketing: [
    "Campaign performance",
    "Lead source breakdown",
    "Ad spend summary",
    "Upcoming events",
  ],
  default: [
    "Show today's priorities",
    "Any urgent follow-ups?",
    "Pipeline health check",
    "I need to send an MOU",
  ],
  followUp: [
    "Tell me more",
    "What should I do next?",
    "Any concerns?",
    "Show related data",
  ],
  document: [
    "I need to send an MOU to my client",
    "Prepare a seller authorization",
    "Generate an offer letter",
    "Create a commission invoice",
  ],
};

// Keywords that map to specific topic categories
const TOPIC_KEYWORDS: Record<string, string[]> = {
  prospect: ['prospect', 'prospects', 'outreach', 'cold call', 'crm'],
  lead: ['lead', 'leads', 'qualification', 'qualify', 'enquiry', 'inquiry'],
  deal: ['deal', 'deals', 'transaction', 'transactions', 'closing', 'contract'],
  pipeline: ['pipeline', 'funnel', 'metrics', 'analytics', 'conversion', 'stages'],
  listing: ['listing', 'listings', 'property', 'properties', 'unit', 'units', 'inventory'],
  compliance: ['compliance', 'audit', 'regulation', 'rera', 'aml', 'kyc'],
  marketing: ['marketing', 'campaign', 'ad', 'ads', 'event', 'events', 'source'],
  document: ['document', 'mou', 'offer', 'authorization', 'invoice', 'form', 'send', 'prepare', 'generate'],
};

/**
 * Detects the primary topic from the conversation content
 */
function detectTopic(content: string): keyof typeof TOPIC_SUGGESTIONS | null {
  const lowerContent = content.toLowerCase();
  
  // Check for entity ID patterns first (most specific)
  if (ENTITY_PATTERNS.prospect.test(content)) {
    return 'prospect';
  }
  if (ENTITY_PATTERNS.lead.test(content)) {
    return 'lead';
  }
  if (ENTITY_PATTERNS.deal.test(content)) {
    return 'deal';
  }
  
  // Check for topic keywords
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return topic as keyof typeof TOPIC_SUGGESTIONS;
    }
  }
  
  return null;
}

/**
 * Generates context-aware suggestions based on conversation state
 */
export function generateSuggestions(
  lastUserMessage: string,
  lastAssistantResponse: string,
  messageCount: number
): string[] {
  // Empty chat - show default quick actions
  if (messageCount === 0) {
    return TOPIC_SUGGESTIONS.default;
  }

  // Combine both messages for context detection
  const combinedContent = `${lastUserMessage} ${lastAssistantResponse}`;
  
  // Detect topic from user message first (higher priority)
  let topic = detectTopic(lastUserMessage);
  
  // If no topic from user message, check assistant response
  if (!topic) {
    topic = detectTopic(lastAssistantResponse);
  }
  
  // Return topic-specific suggestions or generic follow-ups
  if (topic && TOPIC_SUGGESTIONS[topic]) {
    return TOPIC_SUGGESTIONS[topic].slice(0, 4);
  }
  
  return TOPIC_SUGGESTIONS.followUp;
}

/**
 * Quick prompts shown for empty chat state
 */
export const INITIAL_SUGGESTIONS = TOPIC_SUGGESTIONS.default;
