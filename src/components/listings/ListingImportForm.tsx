import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedListing } from '@/lib/api/firecrawl';

interface ListingFormData {
  propertyType: string;
  listingType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  community: string;
  building: string;
  city: string;
  description: string;
  permitNumber: string;
}

interface ListingImportFormProps {
  data: ListingFormData;
  onChange: (data: ListingFormData) => void;
  confidence?: number;
  extractedFields?: string[];
  missingFields?: string[];
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Duplex', 'Land'];
const LISTING_TYPES = ['Sale', 'Rent'];
const CITIES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

export function ListingImportForm({
  data,
  onChange,
  confidence,
  extractedFields = [],
  missingFields = [],
}: ListingImportFormProps) {
  const updateField = <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const isFieldExtracted = (field: string) => extractedFields.includes(field);
  const isFieldMissing = (field: string) => missingFields.includes(field);

  const FieldIndicator = ({ field }: { field: string }) => {
    if (isFieldExtracted(field)) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />;
    }
    if (isFieldMissing(field)) {
      return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Confidence indicator */}
      {confidence !== undefined && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Extraction Confidence</span>
              <span className={cn(
                'text-sm font-medium',
                confidence >= 0.9 ? 'text-emerald' :
                confidence >= 0.7 ? 'text-amber-500' : 'text-destructive'
              )}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  confidence >= 0.9 ? 'bg-emerald' :
                  confidence >= 0.7 ? 'bg-amber-500' : 'bg-destructive'
                )}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* Property Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Property Type
            <FieldIndicator field="propertyType" />
          </Label>
          <Select value={data.propertyType} onValueChange={(v) => updateField('propertyType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Listing Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Listing Type
            <FieldIndicator field="listingType" />
          </Label>
          <Select value={data.listingType} onValueChange={(v) => updateField('listingType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {LISTING_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Price (AED)
            <FieldIndicator field="price" />
          </Label>
          <Input
            type="number"
            value={data.price || ''}
            onChange={(e) => updateField('price', Number(e.target.value))}
            placeholder="2,500,000"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            City
            <FieldIndicator field="city" />
          </Label>
          <Select value={data.city} onValueChange={(v) => updateField('city', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Community */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Community
            <FieldIndicator field="community" />
          </Label>
          <Input
            value={data.community}
            onChange={(e) => updateField('community', e.target.value)}
            placeholder="Al Reem Island"
          />
        </div>

        {/* Building */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Building
            <FieldIndicator field="building" />
          </Label>
          <Input
            value={data.building}
            onChange={(e) => updateField('building', e.target.value)}
            placeholder="Sky Tower"
          />
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Bedrooms
            <FieldIndicator field="bedrooms" />
          </Label>
          <Input
            type="number"
            min={0}
            value={data.bedrooms}
            onChange={(e) => updateField('bedrooms', Number(e.target.value))}
            placeholder="3"
          />
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Bathrooms
            <FieldIndicator field="bathrooms" />
          </Label>
          <Input
            type="number"
            min={0}
            value={data.bathrooms}
            onChange={(e) => updateField('bathrooms', Number(e.target.value))}
            placeholder="3"
          />
        </div>

        {/* Sqft */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            Size (sqft)
            <FieldIndicator field="sqft" />
          </Label>
          <Input
            type="number"
            min={0}
            value={data.sqft || ''}
            onChange={(e) => updateField('sqft', Number(e.target.value))}
            placeholder="2,100"
          />
        </div>

        {/* Permit Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            DARI Permit #
            <FieldIndicator field="permitNumber" />
          </Label>
          <Input
            value={data.permitNumber}
            onChange={(e) => updateField('permitNumber', e.target.value)}
            placeholder="DARI-2024-12345"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          Description
          <FieldIndicator field="description" />
        </Label>
        <Textarea
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Property description..."
          rows={4}
        />
      </div>

      {/* Missing fields warning */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium">Some fields need review:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {missingFields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
