
# ElevenLabs Voice AI Integration for MiCasa BOS

## Overview
Integrate ElevenLabs voice AI capabilities to enhance the brokerage platform with:
1. **Audio Tours** - Convert listing descriptions into professional voice narrations
2. **Voice Messages** - Generate professional follow-up messages for clients  
3. **Speech-to-Text** - Transcribe meeting notes and client calls
4. **Accessibility** - Audio playback throughout the platform

## Architecture

```text
+-------------------+     +-------------------+     +-------------------+
|   Frontend        |---->| Edge Functions    |---->| ElevenLabs API    |
|   Components      |     |                   |     | (ELEVENLABS_API_KEY)
+-------------------+     +-------------------+     +-------------------+
        |                         |
        v                         v
+-------------------+     +-------------------+
| Audio Player      |     | Text-to-Speech    |
| Components        |     | Speech-to-Text    |
+-------------------+     +-------------------+
```

## Implementation Components

### 1. Edge Functions (Backend)

**File: `supabase/functions/elevenlabs-tts/index.ts`**
- Receives text and voice configuration
- Calls ElevenLabs TTS API using `ELEVENLABS_API_KEY`
- Returns audio as binary response (MP3)
- Supports multiple voices and voice settings

**File: `supabase/functions/elevenlabs-scribe-token/index.ts`**
- Generates single-use tokens for realtime transcription
- Enables secure WebSocket connections for speech-to-text
- Token expires after 15 minutes

### 2. Frontend Components

**File: `src/components/voice/ListingAudioTour.tsx`**
- "Generate Audio Tour" button on listing detail modal
- Uses AI to generate natural narration script from listing data
- Sends to TTS edge function
- Audio player with play/pause/progress controls
- Download option for generated audio

**File: `src/components/voice/VoiceMessageGenerator.tsx`**
- Generate professional voice messages for leads/clients
- Template selection (follow-up, introduction, scheduling)
- Customizable with client name and listing details
- Preview and send/download options

**File: `src/components/voice/VoiceTranscriber.tsx`**
- Real-time speech-to-text using `@elevenlabs/react` hook
- Start/stop recording controls
- Live transcript display as you speak
- Commit transcribed text to notes field

**File: `src/components/voice/AudioPlayer.tsx`**
- Reusable audio player component
- Play/pause, progress bar, volume control
- Time display (current/total)
- Loading and error states

### 3. Custom Hooks

**File: `src/hooks/useElevenLabs.ts`**
- `useTextToSpeech()` - Generate audio from text
- `useVoiceMessage()` - Generate templated voice messages
- Voice selection utilities
- Audio caching logic

### 4. Integration Points

**ListingDetailModal.tsx (AI Tab)**
- Add "Audio Tour" section with generate button
- Show audio player when tour is generated
- Cache generated audio per listing

**LeadDetail.tsx**
- Add voice message button in contact section
- "Record Notes" button using transcription
- Voice memo transcription for quick notes

**AIChatPanel.tsx** (Optional Enhancement)
- Text-to-speech for AI responses
- Voice input for queries

## UI Design

### Audio Tour on Listing Detail
```text
+--------------------------------------------------+
| AI Tab                                            |
+--------------------------------------------------+
| Generate Description        [Generate Audio Tour] |
+--------------------------------------------------+
| Audio Tour                                        |
|                                                   |
| [▶] ━━━━━━━━━━━━━━━━━━━ 0:00 / 1:45  [⬇ Download] |
|                                                   |
| Voice: Sarah (Professional)                       |
| Last generated: 2 hours ago                       |
+--------------------------------------------------+
```

### Voice Message Generator
```text
+--------------------------------------------------+
| Voice Message                           [X Close] |
+--------------------------------------------------+
| Template: [Follow-up Call     ▼]                  |
|                                                   |
| Preview Text:                                     |
| "Hello Ahmed, this is Sarah from MiCasa calling   |
|  regarding the 3-bedroom apartment in Al Reem     |
|  Island we discussed. I wanted to follow up..."   |
|                                                   |
| Voice: [Sarah     ▼]                              |
|                                                   |
| [▶ Preview] [Generate & Download] [Send via SMS]  |
+--------------------------------------------------+
```

### Voice Transcription
```text
+--------------------------------------------------+
| Record Notes                                      |
+--------------------------------------------------+
| [🎙 Recording...]  [Stop]                         |
|                                                   |
| Live Transcript:                                  |
| "Client mentioned they prefer a sea view and are  |
|  flexible on the move-in date. Budget confirmed   |
|  at 2.5 million AED..."                          |
|                                                   |
| [Save to Notes] [Clear]                           |
+--------------------------------------------------+
```

## Voice Options

Using ElevenLabs pre-built voices:
- **Sarah** (EXAVITQu4vr4xnSDxMaL) - Professional female, ideal for listings
- **Roger** (CwhRBWXzGAHq8TQ4Fs17) - Professional male
- **George** (JBFqnCBsd6RMkjVDRZzb) - British accent, premium feel
- **Lily** (pFZP5JQG7iQjIQuC4Bku) - Warm and friendly

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/elevenlabs-tts/index.ts` | Text-to-speech edge function |
| `supabase/functions/elevenlabs-scribe-token/index.ts` | STT token generation |
| `src/hooks/useElevenLabs.ts` | Voice AI hooks |
| `src/components/voice/AudioPlayer.tsx` | Reusable audio player |
| `src/components/voice/ListingAudioTour.tsx` | Listing audio generation |
| `src/components/voice/VoiceMessageGenerator.tsx` | Client voice messages |
| `src/components/voice/VoiceTranscriber.tsx` | Speech-to-text component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/listings/ListingDetailModal.tsx` | Add Audio Tour in AI tab |
| `src/components/leads/LeadDetail.tsx` | Add voice message & transcribe buttons |
| `supabase/config.toml` | Register new edge functions |
| `package.json` | Add `@elevenlabs/react` dependency |

## Demo Mode Support

For demo mode:
- Show pre-recorded sample audio files
- Simulate transcription with typing animation
- Display voice features without API calls

## Technical Details

### TTS Edge Function Pattern
```typescript
// Uses ELEVENLABS_API_KEY from environment
// Returns binary audio response
// Supports voice_id and voice_settings parameters
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
  {
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
    body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5" })
  }
);
```

### Frontend Audio Playback
```typescript
// Uses fetch with .blob() for binary audio
const response = await fetch(TTS_URL, { method: 'POST', body: JSON.stringify({ text }) });
const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

### Realtime Transcription
```typescript
// Uses @elevenlabs/react useScribe hook
const scribe = useScribe({
  modelId: "scribe_v2_realtime",
  commitStrategy: "vad",
  onCommittedTranscript: (data) => setTranscript(data.text)
});
```

## Dependencies to Install

- `@elevenlabs/react` - For realtime transcription hooks

## Security Considerations

- ElevenLabs API key stored securely in Supabase secrets (already connected)
- Edge functions handle all external API calls
- Scribe tokens are single-use and expire after 15 minutes
- Audio files are ephemeral (blob URLs), not persisted
