import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Copy, Check, RefreshCw, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBosLlmMarketingCopy } from '@/hooks/useBosLlm';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIGenerateDescriptionProps {
  listingData: Record<string, unknown>;
  brokerData?: { name?: string; license_number?: string };
  brokerageData?: { license_number?: string; name?: string };
  madhmounId?: string;
  onApply?: (headline: string, body: string) => void;
  className?: string;
}

type FormatType = "HEADLINE" | "DESCRIPTION" | "SOCIAL_POST" | "EMAIL" | "AD_COPY";

const FORMAT_OPTIONS: { value: FormatType; label: string }[] = [
  { value: 'DESCRIPTION', label: 'Full Description' },
  { value: 'HEADLINE', label: 'Headline Only' },
  { value: 'SOCIAL_POST', label: 'Social Media Post' },
  { value: 'AD_COPY', label: 'Ad Copy' },
  { value: 'EMAIL', label: 'Email Template' },
];

export function AIGenerateDescription({
  listingData,
  brokerData,
  brokerageData,
  madhmounId,
  onApply,
  className,
}: AIGenerateDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<FormatType>('DESCRIPTION');
  const [copied, setCopied] = useState(false);
  const { generateCopy, isGenerating, copy } = useBosLlmMarketingCopy();

  const handleGenerate = async () => {
    await generateCopy(
      `Generate ${format.toLowerCase().replace('_', ' ')} for this property listing`,
      {
        listing: listingData,
        broker: brokerData,
        brokerage: brokerageData,
        madhmoun_id: madhmounId,
        format,
      }
    );
  };

  const handleCopy = () => {
    if (copy) {
      const text = `${copy.headline}\n\n${copy.body}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (copy && onApply) {
      onApply(copy.headline, copy.body);
      setIsOpen(false);
      toast.success('Description applied');
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("gap-2", className)}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        Generate Description
      </Button>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Marketing Copy
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selector */}
        <div className="flex items-center gap-2">
          <Select value={format} onValueChange={(v) => setFormat(v as FormatType)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copy ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              'Generate'
            )}
          </Button>
        </div>

        {/* Generated Content */}
        {copy && (
          <>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Headline</div>
              <div className="p-2 rounded bg-muted text-sm font-medium">
                {copy.headline}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Body</div>
              <Textarea
                value={copy.body}
                readOnly
                className="min-h-[120px] text-sm resize-none"
              />
            </div>

            {/* Compliance Status */}
            <div className="flex items-center gap-2">
              {copy.is_compliant ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Review Required
                </Badge>
              )}
              {copy.identifiers?.madhmoun_id && (
                <Badge variant="secondary" className="text-xs">
                  Madhmoun: {copy.identifiers.madhmoun_id}
                </Badge>
              )}
            </div>

            {/* Compliance Flags */}
            {copy.compliance_flags && copy.compliance_flags.length > 0 && (
              <div className="text-xs text-amber-600 space-y-1">
                {copy.compliance_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                    {flag}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              {onApply && (
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="flex-1"
                >
                  Apply to Listing
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
