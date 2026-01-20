import { Lead, LeadConsent } from '@/types/bos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { AIQualifyButton } from '@/components/ai/AIQualifyButton';

interface LeadQualificationPanelProps {
  lead: Lead;
  onSave: (updates: Partial<Lead>) => void;
  onCancel: () => void;
}

const PROPERTY_TYPES = ['Villa', 'Apartment', 'Townhouse', 'Penthouse', 'Studio', 'Land'];
const LOCATIONS = ['Saadiyat Island', 'Yas Island', 'Al Reem Island', 'Al Raha', 'Khalifa City', 'Downtown Abu Dhabi'];

export function LeadQualificationPanel({ lead, onSave, onCancel }: LeadQualificationPanelProps) {
  const [requirements, setRequirements] = useState(lead.requirements || {
    budget_min: undefined,
    budget_max: undefined,
    property_types: [],
    locations: [],
    bedrooms_min: undefined,
  });

  const [consents, setConsents] = useState<LeadConsent[]>(lead.consents || []);

  const hasDataProcessingConsent = consents.some(
    c => c.consent_type === 'DataProcessing' && c.granted
  );
  const hasMarketingConsent = consents.some(
    c => c.consent_type === 'Marketing' && c.granted
  );

  const updateConsent = (type: LeadConsent['consent_type'], granted: boolean) => {
    const existing = consents.find(c => c.consent_type === type);
    if (existing) {
      setConsents(consents.map(c => 
        c.consent_type === type 
          ? { ...c, granted, granted_at: new Date().toISOString() }
          : c
      ));
    } else {
      setConsents([...consents, {
        consent_type: type,
        granted,
        granted_at: new Date().toISOString(),
        version: 1,
      }]);
    }
  };

  const handleSave = () => {
    onSave({
      requirements,
      consents,
    });
  };

  const canSave = hasDataProcessingConsent && requirements.budget_max && requirements.budget_max > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Requirements Capture</CardTitle>
          <CardDescription>
            Capture the lead's property requirements for qualification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Min Budget (AED)</Label>
              <Input
                id="budget_min"
                type="number"
                placeholder="500,000"
                value={requirements.budget_min || ''}
                onChange={(e) => setRequirements({
                  ...requirements,
                  budget_min: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Max Budget (AED) *</Label>
              <Input
                id="budget_max"
                type="number"
                placeholder="2,000,000"
                value={requirements.budget_max || ''}
                onChange={(e) => setRequirements({
                  ...requirements,
                  budget_max: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Minimum Bedrooms</Label>
            <Select
              value={requirements.bedrooms_min?.toString() || ''}
              onValueChange={(value) => setRequirements({
                ...requirements,
                bedrooms_min: value ? Number(value) : undefined
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Types */}
          <div className="space-y-2">
            <Label>Property Types</Label>
            <div className="grid grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={requirements.property_types?.includes(type) || false}
                    onCheckedChange={(checked) => {
                      const types = requirements.property_types || [];
                      setRequirements({
                        ...requirements,
                        property_types: checked
                          ? [...types, type]
                          : types.filter(t => t !== type)
                      });
                    }}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Preferred Locations</Label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATIONS.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`loc-${location}`}
                    checked={requirements.locations?.includes(location) || false}
                    onCheckedChange={(checked) => {
                      const locs = requirements.locations || [];
                      setRequirements({
                        ...requirements,
                        locations: checked
                          ? [...locs, location]
                          : locs.filter(l => l !== location)
                      });
                    }}
                  />
                  <Label htmlFor={`loc-${location}`} className="text-sm font-normal">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consent Records</CardTitle>
          <CardDescription>
            Required consents must be captured before qualification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Processing Consent - Required */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              id="consent-data"
              checked={hasDataProcessingConsent}
              onCheckedChange={(checked) => updateConsent('DataProcessing', checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="consent-data" className="text-sm font-medium flex items-center gap-2">
                Data Processing Consent
                <span className="text-xs text-destructive">* Required</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                I consent to the processing of my personal data for property matching and communication purposes.
              </p>
            </div>
            {hasDataProcessingConsent && (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
          </div>

          {/* Marketing Consent - Optional */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Checkbox
              id="consent-marketing"
              checked={hasMarketingConsent}
              onCheckedChange={(checked) => updateConsent('Marketing', checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="consent-marketing" className="text-sm font-medium">
                Marketing Communications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                I would like to receive marketing communications about new listings and market updates.
              </p>
            </div>
            {hasMarketingConsent && (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {!canSave && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-500">Missing Requirements</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {!hasDataProcessingConsent && <li>• Data processing consent is required</li>}
              {(!requirements.budget_max || requirements.budget_max <= 0) && <li>• Maximum budget is required</li>}
            </ul>
          </div>
        </div>
      )}

      {/* AI Qualification */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI-Assisted Qualification</CardTitle>
          <CardDescription>
            Get AI recommendations for lead scoring and next actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIQualifyButton 
            lead={lead}
            onApplyRecommendation={(rec) => {
              // Could auto-set next action or show recommendation
              console.log('AI Recommendation:', rec);
            }}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Save & Qualify
        </Button>
      </div>
    </div>
  );
}
