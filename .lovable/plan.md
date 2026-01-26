
# API Integration Testing & Fixes Plan

## Summary of Findings

After comprehensive testing of all API-connected integrations, here are the results:

### Working Integrations (No Changes Needed)

| Integration | Status | Test Result |
|-------------|--------|-------------|
| **Firecrawl Scrape** | Working | Successfully scraped example.com, returned markdown + metadata |
| **Competitor Analyze** | Working | AI analysis returns structured listings, insights, and recommendations |
| **ElevenLabs Scribe Token** | Working | Token generation successful (`sutkn_...`) |
| **BOS LLM Router** | Working | Correctly routes intents to appropriate modes |
| **BOS LLM Ops** | Working | Streaming responses with database context |
| **BOS LLM Lead Qualify** | Working | Returns lead scores, confidence levels, and recommended actions |
| **BOS LLM Marketing Copy** | Working | Compliance-aware copy generation (correctly refuses non-approved listings) |

### Integrations Requiring Fixes

| Integration | Issue | Fix Required |
|-------------|-------|--------------|
| **ElevenLabs TTS** | API key flagged for "unusual activity" | User needs to upgrade to paid ElevenLabs plan |
| **ListingAudioTour.tsx** | Calling `bos-llm-ops` with wrong parameters | Fix API call to use `userIntent` instead of `prompt` |
| **VoiceMessageGenerator.tsx** | Calling `useVoiceMessage()` inside callback (React hooks violation) | Fix hook usage pattern |

### Minor UI Warnings (Non-Critical)

| Component | Warning |
|-----------|---------|
| ConversionBadge | Missing forwardRef |
| Badge (PipelineHealthWidget) | Missing forwardRef |

---

## Required Fixes

### 1. Fix ListingAudioTour API Call

**File:** `src/components/voice/ListingAudioTour.tsx`

**Problem:** The component calls `bos-llm-ops` with `{ prompt, operation }` but the edge function expects `{ userIntent }`.

**Current code (lines 61-66):**
```typescript
const { data, error } = await supabase.functions.invoke('bos-llm-ops', {
  body: {
    prompt,
    operation: 'generate_narration',
  },
});
```

**Fix:** Change to use `userIntent` parameter:
```typescript
const { data, error } = await supabase.functions.invoke('bos-llm-ops', {
  body: {
    userIntent: prompt,
    contextType: 'listing',
  },
});
```

Also update the response handling (line 70) to parse the streaming response or use a non-streaming approach.

### 2. Fix VoiceMessageGenerator React Hooks Violation

**File:** `src/components/voice/VoiceMessageGenerator.tsx`

**Problem:** Line 56 calls `useVoiceMessage()` inside a callback, which violates React hooks rules.

**Current code (lines 52-57):**
```typescript
try {
  cleanup();
  
  const textToGenerate = isCustomizing ? customText : getMessageText(selectedTemplate, messageParams);
  
  const { generateSpeech } = useVoiceMessage(); // WRONG - hooks can't be called inside callbacks
  const url = await generateMessage(selectedTemplate, messageParams, selectedVoice);
```

**Fix:** Remove the incorrect hook call since `generateMessage` is already available from the hook called at component level:
```typescript
try {
  cleanup();
  
  const textToGenerate = isCustomizing ? customText : getMessageText(selectedTemplate, messageParams);
  
  // For custom text, use generateSpeech directly (from the TTS hook)
  // For templates, use generateMessage
  const url = isCustomizing 
    ? await generateSpeech(textToGenerate, selectedVoice)
    : await generateMessage(selectedTemplate, messageParams, selectedVoice);
```

However, since `generateSpeech` isn't exposed through `useVoiceMessage()`, we need to also update the hook or use `useTextToSpeech` separately.

### 3. ElevenLabs TTS - User Action Required

**Issue:** The ElevenLabs API key is flagged for unusual activity:
```
"detected_unusual_activity"
"Free Tier usage disabled"
"Please purchase a Paid Subscription to continue"
```

**Resolution:** This is a limitation of the ElevenLabs free tier. The user must either:
1. Upgrade to an ElevenLabs paid plan
2. Contact ElevenLabs support to unflag the account

The code is correct; it's an account-level issue.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/voice/ListingAudioTour.tsx` | Fix API call parameters and response handling |
| `src/components/voice/VoiceMessageGenerator.tsx` | Fix React hooks violation |
| `src/hooks/useElevenLabs.ts` | Expose `generateSpeech` in `useVoiceMessage` return |

---

## Technical Implementation Details

### ListingAudioTour Fix

The `bos-llm-ops` edge function returns a streaming response. The current code expects JSON. We need to either:

**Option A (Recommended):** Create a dedicated non-streaming narration endpoint
- Add a `bos-llm-narration` function that returns plain JSON

**Option B:** Parse the streaming response in the frontend
- Collect SSE events and extract content

For simplicity, Option A is cleaner. Alternatively, we can modify `bos-llm-ops` to accept a `stream: false` parameter.

### VoiceMessageGenerator Fix

Update the hook to properly expose TTS functionality:

```typescript
// In useElevenLabs.ts - update useVoiceMessage return
return {
  generateMessage,
  generateSpeech: tts.generateSpeech, // Add this
  getMessageText: (...),
  ...tts,
};
```

Then in VoiceMessageGenerator:
```typescript
const { generateMessage, generateSpeech, getMessageText, isLoading, audioUrl, cleanup } = useVoiceMessage();

// In handleGenerate:
const url = isCustomizing 
  ? await generateSpeech(customText, selectedVoice)
  : await generateMessage(selectedTemplate, messageParams, selectedVoice);
```

---

## Integration Test Summary

| Function | Endpoint | Status |
|----------|----------|--------|
| `firecrawl-scrape` | POST /firecrawl-scrape | Pass |
| `competitor-analyze` | POST /competitor-analyze | Pass |
| `elevenlabs-scribe-token` | POST /elevenlabs-scribe-token | Pass |
| `elevenlabs-tts` | POST /elevenlabs-tts | Fail (Account issue) |
| `bos-llm-router` | POST /bos-llm-router | Pass |
| `bos-llm-ops` | POST /bos-llm-ops | Pass |
| `bos-llm-lead-qualify` | POST /bos-llm-lead-qualify | Pass |
| `bos-llm-marketing-copy` | POST /bos-llm-marketing-copy | Pass |

---

## Secrets Configuration

All required secrets are properly configured:
- `ELEVENLABS_API_KEY` (managed by connector)
- `FIRECRAWL_API_KEY` (managed by connector)
- `LOVABLE_API_KEY` (system)
- `OPENAI_API_KEY` (user-provided)

---

## Demo Mode Verification

Demo mode is properly implemented in:
- `ListingAudioTour` - Shows success without API calls
- `VoiceMessageGenerator` - Shows success without API calls
- `VoiceTranscriber` - Simulates transcription with typing animation
- `CompetitorAnalysis` - Uses pre-populated demo data

This ensures the UI is testable without consuming API credits.
