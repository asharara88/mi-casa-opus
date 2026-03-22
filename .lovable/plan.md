

# Mi Ai: Conversation Memory + Template-Aware Document Drafting

## Problem
1. **No memory**: Each message is sent to the AI as a standalone request. The edge function only sends `[system_prompt, single_user_message]` — no prior conversation turns. The AI cannot reference anything said earlier.
2. **No template content**: The AI knows template names but cannot read or amend the actual template markdown files. It can only suggest opening a form — it cannot draft documents inline.

## Solution

### 1. Pass full conversation history to the edge function

**Frontend (`useBosLlm.ts` → `askOps`)**: Accept a `conversationHistory` parameter containing all prior messages. Send it alongside `userIntent`.

**Frontend (`FloatingAIChat.tsx`)**: Pass the full `messages` array when calling `askOps`, formatted as `{role, content}` pairs.

**Edge function (`bos-llm-ops/index.ts`)**: Accept `conversationHistory` array in the request body. Build the AI messages array as:
```
[system_prompt, ...history, current_user_message_with_context]
```
Cap history to last 20 messages to stay within token limits.

### 2. Fetch template content on demand in the edge function

When the AI detects a document intent (user says "draft an MOU", "prepare an offer letter"), the edge function will:

1. Read the relevant template markdown from the `document_templates` table (already synced from the 18 markdown files)
2. Inject the template content into the system context for that turn
3. Instruct the AI to populate template blanks with conversation-extracted data and return the amended document

**Edge function changes**:
- Add a `fetchTemplateContent` helper that queries `document_templates` by template key
- When intent patterns match document-related keywords AND a template is identified, append the raw template markdown to the context
- Add instructions to the system prompt: "When template content is provided, fill in the blanks using conversation context and return the completed document within a `[DRAFTED_DOCUMENT]` block"

### 3. Render drafted documents in chat

**New component**: `DraftedDocumentCard` — renders `[DRAFTED_DOCUMENT]` blocks from AI responses as a card with:
- Document title
- Preview of the filled content (collapsible)
- "Copy to Clipboard" button
- "Open in Form Wizard" button (with all fields pre-filled)

**`ChatMessageRenderer.tsx`**: Add parsing for `[DRAFTED_DOCUMENT]...[/DRAFTED_DOCUMENT]` blocks alongside existing `[DOCUMENT_ACTION]` and `[FOLLOWUP_ACTION]` parsing.

### 4. Persist conversations (optional but recommended)

Create a `ai_conversations` table to store chat sessions:
- `id`, `user_id`, `title` (auto-generated from first message), `created_at`, `updated_at`

Create an `ai_messages` table:
- `id`, `conversation_id`, `role`, `content`, `mode`, `created_at`

This enables resuming conversations across sessions. RLS: users can only access their own conversations.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/bos-llm-ops/index.ts` | Accept `conversationHistory`, build multi-turn messages array, add `fetchTemplateContent` helper, update system prompt for document drafting |
| `src/hooks/useBosLlm.ts` | `askOps` accepts conversation history parameter |
| `src/components/ai/FloatingAIChat.tsx` | Pass message history to `askOps` |
| `src/components/ai/AiAssistantPanel.tsx` | Pass message history to `askOps` |
| `src/components/ai/ChatMessageRenderer.tsx` | Parse `[DRAFTED_DOCUMENT]` blocks |
| `src/components/ai/DraftedDocumentCard.tsx` | New — renders drafted documents with copy/open actions |
| `supabase/migrations/` | New — `ai_conversations` + `ai_messages` tables with RLS |

## Technical Notes

- Conversation history is capped at 20 messages (last 10 turns) to manage token costs
- Template content is only fetched when document-intent keywords are detected, not on every message
- The AI model remains `google/gemini-3-flash-preview` (fast enough for multi-turn with template context)
- Database persistence is optional — in-memory history works immediately, DB persistence adds cross-session resume

