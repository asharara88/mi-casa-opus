

# Cold Calling with ElevenLabs

## Overview

This plan implements a comprehensive cold calling toolkit using ElevenLabs, with two main components:

1. **AI Voice Agent** - An autonomous conversational AI that can handle initial prospect outreach
2. **Cold Call Toolkit** - Enhanced voice message templates, live call transcription, and script rehearsal for prospects

---

## Feature 1: AI Cold Calling Voice Agent

### What It Does

A real-time conversational AI agent that can:
- Initiate conversations with prospects when triggered by an agent
- Qualify interest level and collect property requirements
- Answer FAQs about available listings
- Schedule viewings or callback times
- Transfer context to human agent when needed

### Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Agent Dashboard                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Prospect: Ahmed Al-Rashid   [Start AI Call] [Manual] │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ElevenLabs Conversational AI                    │
│  • WebRTC connection via @elevenlabs/react                   │
│  • Configured agent with real estate context                 │
│  • Client tools for CRM updates                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Edge Function                              │
│  elevenlabs-conversation-token                               │
│  • Generates secure WebRTC token                             │
│  • Passes prospect context to agent                          │
└─────────────────────────────────────────────────────────────┘
```

### New Components

| Component | Purpose |
|-----------|---------|
| `AIVoiceAgent.tsx` | Main voice agent interface with start/stop controls, live transcript display, and status indicators |
| `AICallPanel.tsx` | Expandable panel showing call progress, detected intents, and suggested actions |
| `useConversationAgent` hook | Wrapper around `@elevenlabs/react` `useConversation` with CRM integration |

### Edge Function: `elevenlabs-conversation-token`

Generates a secure conversation token with prospect context:

```typescript
// Returns WebRTC token with context
{
  token: "...",
  conversationId: "...",
  context: {
    prospectName: "Ahmed Al-Rashid",
    propertyInterests: ["3BR Villa", "Al Reem Island"],
    previousInteractions: 2
  }
}
```

### Client Tools (Triggered by AI)

The agent can call these functions during conversation:

| Tool | Action |
|------|--------|
| `updateProspectStatus` | Update outreach status in CRM |
| `scheduleCallback` | Create calendar event for follow-up |
| `captureRequirements` | Save detected property requirements |
| `requestHumanTransfer` | Flag for agent takeover |

### Agent Configuration (ElevenLabs Dashboard)

The AI agent needs to be configured with:
- **System Prompt**: Real estate context, MiCasa branding, compliance guidelines
- **First Message**: Personalized greeting using prospect name
- **Voice**: Professional voice (Sarah or George)
- **Client Tools**: The functions listed above

---

## Feature 2: Cold Call Toolkit for Prospects

### New Templates for Cold Calling

Add prospect-specific voice message templates:

| Template | Use Case |
|----------|----------|
| `cold-intro` | First contact with a new prospect |
| `new-listing-alert` | Notify about matching properties |
| `investor-opportunity` | Off-plan investment pitch |
| `event-invitation` | Invite to property launches/roadshows |
| `re-engagement` | Win back inactive prospects |

### ProspectDetailSheet Integration

Add voice features to the prospect detail view:

```text
┌─────────────────────────────────────────────────────────────┐
│ Prospect: Ahmed Al-Rashid                                    │
│ Status: Not Contacted                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [AI Call Assistant]  [Generate Voice Drop]  [Call Script]   │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🎤 AI Voice Agent                              [Start]  ││
│ │ Start an AI-assisted call with this prospect            ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 📨 Voice Message                                         ││
│ │ Template: [Cold Intro ▼]  Voice: [Sarah ▼]               ││
│ │ "Hello Ahmed, I'm Sarah from MiCasa Real Estate..."     ││
│ │                                    [Generate] [Download] ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🎙️ Live Call Notes                                       ││
│ │ [Start Recording] to capture call notes in real-time    ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Call Script Rehearsal

Generate TTS audio of cold call scripts for agent training:

```text
┌─────────────────────────────────────────────────────────────┐
│ 📜 Call Script Rehearsal                                     │
│                                                              │
│ Script: [Cold Call Opening ▼]                                │
│                                                              │
│ "Good morning, this is [Agent] from MiCasa Real Estate.     │
│ I noticed you recently inquired about properties in          │
│ [Location]. I have a few exclusive listings that might       │
│ interest you..."                                             │
│                                                              │
│ [▶️ Play Script]  [🔄 Regenerate]                            │
│                                                              │
│ 💡 Practice alongside the AI voice to perfect your pitch    │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Infrastructure
1. Install `@elevenlabs/react` package
2. Create `elevenlabs-conversation-token` edge function
3. Create `useConversationAgent` hook
4. Add config entry for edge function

### Phase 2: AI Voice Agent UI
1. Create `AIVoiceAgent.tsx` component
2. Create `AICallPanel.tsx` for call controls and transcript
3. Add volume visualization and status indicators
4. Implement client tools for CRM updates

### Phase 3: Prospect Integration
1. Add cold calling templates to `useElevenLabs.ts`
2. Integrate `VoiceMessageGenerator` into `ProspectDetailSheet.tsx`
3. Integrate `VoiceTranscriber` for live call notes
4. Add AI Voice Agent trigger button

### Phase 4: Call Script Rehearsal
1. Create `CallScriptRehearsal.tsx` component
2. Add predefined scripts for common scenarios
3. Enable custom script editing
4. Add to training/resources section

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/elevenlabs-conversation-token/index.ts` | Generate WebRTC conversation tokens |
| `src/hooks/useConversationAgent.ts` | Wrapper hook for ElevenLabs agent |
| `src/components/voice/AIVoiceAgent.tsx` | Main voice agent component |
| `src/components/voice/AICallPanel.tsx` | Call controls and transcript display |
| `src/components/voice/CallScriptRehearsal.tsx` | Script practice component |

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add `@elevenlabs/react` dependency |
| `supabase/config.toml` | Add edge function config |
| `src/hooks/useElevenLabs.ts` | Add cold calling templates |
| `src/components/prospects/ProspectDetailSheet.tsx` | Add voice agent and message generator |

---

## Dependencies

- `@elevenlabs/react` - React SDK for Conversational AI
- Existing `ELEVENLABS_API_KEY` secret (already configured)

---

## ElevenLabs Agent Setup Requirement

The AI Voice Agent requires creating an agent in the ElevenLabs dashboard with:
1. Custom system prompt for real estate context
2. Client tools configuration matching the ones we implement
3. Voice selection and language settings

This is a one-time setup that enables the conversational capabilities.

---

## Technical Notes

- WebRTC provides low-latency, high-quality audio
- Conversation tokens are single-use for security
- Client tools allow the AI to trigger CRM updates during calls
- All transcripts are captured for compliance and training
- Demo mode will simulate conversations without API calls

