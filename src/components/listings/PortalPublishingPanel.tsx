import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  usePortalPublications, 
  useTogglePortalPublication, 
  useSyncPortal,
  PortalName,
  PortalStatus 
} from '@/hooks/usePortalPublications';
import { Listing } from '@/hooks/useListings';
import { 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Pause,
  Upload
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PortalPublishingPanelProps {
  listing: {
    id: string;
    listing_id: string;
    status: string;
    madhmoun_status?: string | null;
  };
}

const PORTALS: { name: PortalName; label: string; color: string }[] = [
  { name: 'PropertyFinder', label: 'Property Finder', color: 'bg-blue-500' },
  { name: 'Bayut', label: 'Bayut', color: 'bg-orange-500' },
  { name: 'Dubizzle', label: 'Dubizzle', color: 'bg-red-500' },
];

const STATUS_CONFIG: Record<PortalStatus, { 
  icon: React.ElementType; 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' },
  published: { icon: CheckCircle2, label: 'Published', variant: 'default' },
  paused: { icon: Pause, label: 'Paused', variant: 'outline' },
  removed: { icon: XCircle, label: 'Removed', variant: 'outline' },
  error: { icon: AlertCircle, label: 'Error', variant: 'destructive' },
};

export function PortalPublishingPanel({ listing }: PortalPublishingPanelProps) {
  const { data: publications = [], isLoading } = usePortalPublications(listing.id);
  const toggleMutation = useTogglePortalPublication();
  const syncMutation = useSyncPortal();
  const [syncingPortal, setSyncingPortal] = useState<PortalName | null>(null);

  // Check compliance requirements
  const isCompliant = listing.madhmoun_status === 'VERIFIED' && listing.status === 'Active';
  const complianceIssues: string[] = [];
  if (listing.status !== 'Active') complianceIssues.push('Listing must be Active');
  if (listing.madhmoun_status !== 'VERIFIED') complianceIssues.push('Madhmoun verification required');

  const getPublicationForPortal = (portal: PortalName) => {
    return publications.find(p => p.portal === portal);
  };

  const handleToggle = (portal: PortalName, enabled: boolean) => {
    if (!isCompliant && enabled) return;
    toggleMutation.mutate({ listingId: listing.id, portal, enabled });
  };

  const handleSync = async (portal?: PortalName) => {
    setSyncingPortal(portal ?? null);
    try {
      await syncMutation.mutateAsync({ listingId: listing.id, portal });
    } finally {
      setSyncingPortal(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Portal Syndication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Portal Syndication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Status */}
        <div className={cn(
          "p-3 rounded-lg border",
          isCompliant 
            ? "bg-primary/10 border-primary/30" 
            : "bg-destructive/10 border-destructive/30"
        )}>
          <div className="flex items-center gap-2 text-sm">
            {isCompliant ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">
                  Compliance verified - Ready to publish
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <div className="text-destructive">
                  <span className="font-medium">Compliance required:</span>
                  <ul className="mt-1 list-disc list-inside">
                    {complianceIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Portal Cards */}
        <div className="space-y-3">
          {PORTALS.map(({ name, label, color }) => {
            const publication = getPublicationForPortal(name);
            const isEnabled = publication && !['removed'].includes(publication.status);
            const statusConfig = publication ? STATUS_CONFIG[publication.status] : null;
            const StatusIcon = statusConfig?.icon;

            return (
              <div 
                key={name}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", color)} />
                    <span className="font-medium">{label}</span>
                    {statusConfig && (
                      <Badge variant={statusConfig.variant} className="gap-1">
                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                        {statusConfig.label}
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(name, checked)}
                    disabled={!isCompliant || toggleMutation.isPending}
                  />
                </div>

                {publication && isEnabled && (
                  <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                    {publication.external_ref && (
                      <div>Ref: {publication.external_ref}</div>
                    )}
                    {publication.last_synced_at && (
                      <div>
                        Last sync: {formatDistanceToNow(new Date(publication.last_synced_at), { addSuffix: true })}
                      </div>
                    )}
                    {publication.error_message && (
                      <div className="text-destructive">
                        Error: {publication.error_message}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      {publication.portal_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={publication.portal_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(name)}
                        disabled={syncMutation.isPending}
                      >
                        <RefreshCw className={cn(
                          "h-3 w-3 mr-1",
                          syncingPortal === name && "animate-spin"
                        )} />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sync All Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSync()}
          disabled={syncMutation.isPending || publications.filter(p => p.status !== 'removed').length === 0}
        >
          <RefreshCw className={cn(
            "h-4 w-4 mr-2",
            syncingPortal === null && syncMutation.isPending && "animate-spin"
          )} />
          Sync All Portals
        </Button>
      </CardContent>
    </Card>
  );
}
