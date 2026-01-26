import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScrapedProject } from '@/lib/api/firecrawl';

interface DeveloperProjectCardProps {
  project: ScrapedProject;
  isSelected: boolean;
  onSelectChange: (selected: boolean) => void;
  onImport: () => void;
  isImporting?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Launching': 'bg-amber-500/20 text-amber-600',
  'Under Construction': 'bg-blue-500/20 text-blue-600',
  'Ready': 'bg-emerald/20 text-emerald',
  'Sold Out': 'bg-muted text-muted-foreground',
};

const TYPE_ICONS: Record<string, string> = {
  'Villa': '🏡',
  'Apartment': '🏢',
  'Townhouse': '🏘️',
  'Penthouse': '🌆',
  'Mixed': '🏙️',
};

export function DeveloperProjectCard({
  project,
  isSelected,
  onSelectChange,
  onImport,
  isImporting,
}: DeveloperProjectCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'TBA';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M AED`;
    }
    return `${(price / 1000).toFixed(0)}K AED`;
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      isSelected && 'ring-2 ring-primary'
    )}>
      <CardContent className="p-4">
        {/* Header with checkbox */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelectChange}
              id={`project-${project.name}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {TYPE_ICONS[project.projectType] || '🏠'}
                </span>
                <h3 className="font-semibold text-foreground">{project.name}</h3>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {project.community}, {project.location}
              </div>
            </div>
          </div>
          <Badge className={cn('text-xs', STATUS_COLORS[project.status] || 'bg-muted')}>
            {project.status}
          </Badge>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">
            {formatPrice(project.priceFrom)}
            {project.priceTo && project.priceTo !== project.priceFrom && (
              <span> - {formatPrice(project.priceTo)}</span>
            )}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          {project.totalUnits && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{project.totalUnits} units</span>
              {project.availableUnits && (
                <span className="text-emerald">({project.availableUnits} avail)</span>
              )}
            </div>
          )}
          {project.expectedHandover && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{project.expectedHandover}</span>
            </div>
          )}
          {project.commissionPercent && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Percent className="h-3.5 w-3.5" />
              <span>{project.commissionPercent}% commission</span>
            </div>
          )}
          {project.paymentPlan && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>{project.paymentPlan}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {project.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.amenities.slice(0, 4).map((amenity, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {project.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onImport}
            disabled={isImporting}
            className="flex-1"
          >
            <Building2 className="h-4 w-4 mr-1" />
            {isImporting ? 'Importing...' : 'Import Project'}
          </Button>
          {project.brochureUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(project.brochureUrl!, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          {project.floorPlansUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(project.floorPlansUrl!, '_blank')}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
