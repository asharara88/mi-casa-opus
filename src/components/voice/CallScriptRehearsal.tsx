import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollText, Play, RotateCcw, Volume2, Lightbulb } from 'lucide-react';
import { useTextToSpeech, VOICE_OPTIONS } from '@/hooks/useElevenLabs';
import { AudioPlayer } from './AudioPlayer';

const CALL_SCRIPTS = {
  'cold-opening': {
    name: 'Cold Call Opening',
    script: `Good morning, this is [Agent Name] from MiCasa Real Estate.

I noticed you recently inquired about properties in [Location]. I have a few exclusive listings that might interest you.

Is now a good time to talk for a few minutes about what you're looking for?`,
  },
  'objection-price': {
    name: 'Handling Price Objection',
    script: `I understand budget is an important consideration. 

Let me ask - what's driving your timeline? Sometimes we can find creative solutions, like off-plan properties with payment plans, or upcoming launches with early-bird pricing.

What would make this work for you?`,
  },
  'objection-timing': {
    name: 'Handling Timing Objection',
    script: `I completely understand. The market is always changing, and timing is personal.

Many of our clients who were initially "just looking" found that starting the search early gave them an advantage when the right property came along.

Would you be open to receiving updates about new listings in your preferred area? No pressure, just keeping you informed.`,
  },
  'closing-viewing': {
    name: 'Closing for Viewing',
    script: `Based on what you've told me, I have two properties that match perfectly.

The first is a [Property Type] in [Location] with [Key Features]. The second is [Alternative].

I have availability this Thursday afternoon or Saturday morning. Which works better for you?`,
  },
  'investor-pitch': {
    name: 'Investor Pitch',
    script: `I'm reaching out because we have an exclusive off-plan opportunity from [Developer Name].

The project offers [Commission/ROI] with a [Payment Plan] payment structure. Expected handover is [Date], and similar projects in the area have appreciated [X%] since launch.

Would you like me to send you the investment summary?`,
  },
};

type ScriptKey = keyof typeof CALL_SCRIPTS;

export function CallScriptRehearsal() {
  const [selectedScript, setSelectedScript] = useState<ScriptKey>('cold-opening');
  const [customScript, setCustomScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [isCustom, setIsCustom] = useState(false);

  const { generateSpeech, isLoading, audioUrl, cleanup } = useTextToSpeech();

  const currentScript = isCustom 
    ? customScript 
    : CALL_SCRIPTS[selectedScript].script;

  const handlePlay = async () => {
    cleanup();
    await generateSpeech(currentScript, selectedVoice);
  };

  const handleReset = () => {
    cleanup();
    if (isCustom) {
      setCustomScript('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Call Script Rehearsal
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Script Selection */}
        <div className="space-y-2">
          <Label>Select Script</Label>
          <Select 
            value={isCustom ? 'custom' : selectedScript}
            onValueChange={(val) => {
              if (val === 'custom') {
                setIsCustom(true);
              } else {
                setIsCustom(false);
                setSelectedScript(val as ScriptKey);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CALL_SCRIPTS).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
              <SelectItem value="custom">Custom Script</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label>Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Script Content */}
        <div className="space-y-2">
          <Label>Script</Label>
          {isCustom ? (
            <Textarea
              value={customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              placeholder="Enter your custom script here..."
              rows={8}
              className="font-mono text-sm"
            />
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {currentScript}
              </pre>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={handlePlay} 
            disabled={isLoading || !currentScript.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Generating...' : 'Play Script'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <AudioPlayer src={audioUrl} />
        )}

        {/* Tips */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-amber-600">Practice Tips</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Listen to the AI voice and match its pacing</li>
              <li>Practice handling pauses and objections</li>
              <li>Record yourself alongside the script</li>
              <li>Focus on tone, not just words</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
