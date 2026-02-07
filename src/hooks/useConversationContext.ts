import { useMemo, useCallback } from "react";
import { 
  extractConversationEntities, 
  mapEntitiesToPrefill,
  ConversationEntity 
} from "@/lib/document-intent";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Hook to extract and manage conversation context for form pre-filling
 */
export function useConversationContext(messages: Message[]) {
  // Extract entities from all messages
  const entities = useMemo<ConversationEntity>(() => {
    return extractConversationEntities(messages);
  }, [messages]);
  
  // Get prefill data for a specific template
  const getPrefillForTemplate = useCallback((templateId: string): Record<string, unknown> => {
    return mapEntitiesToPrefill(templateId, entities);
  }, [entities]);
  
  // Store prefill in session storage for form wizard to pick up
  const storeTemplatePrefill = useCallback((templateId: string, additionalPrefill?: Record<string, unknown>) => {
    const prefill = {
      ...getPrefillForTemplate(templateId),
      ...additionalPrefill
    };
    
    // Store in session storage
    sessionStorage.setItem(
      `template_prefill_${templateId}`,
      JSON.stringify(prefill)
    );
    
    return prefill;
  }, [getPrefillForTemplate]);
  
  // Clear stored prefill
  const clearTemplatePrefill = useCallback((templateId: string) => {
    sessionStorage.removeItem(`template_prefill_${templateId}`);
  }, []);
  
  return {
    entities,
    getPrefillForTemplate,
    storeTemplatePrefill,
    clearTemplatePrefill
  };
}

/**
 * Read prefill from session storage (for use in form components)
 */
export function getStoredPrefill(templateId: string): Record<string, unknown> | null {
  try {
    const stored = sessionStorage.getItem(`template_prefill_${templateId}`);
    if (stored) {
      const prefill = JSON.parse(stored);
      // Clean up after reading
      sessionStorage.removeItem(`template_prefill_${templateId}`);
      return prefill;
    }
  } catch (e) {
    console.error('[ConversationContext] Failed to read stored prefill:', e);
  }
  return null;
}
