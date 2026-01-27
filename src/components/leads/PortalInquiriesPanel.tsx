import { useState } from 'react';
import { usePortalInquiries, usePortalInquiryStats, useTestPortalWebhook } from '@/hooks/usePortalInquiries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  CheckCircle2,
  Clock,
  RefreshCw,
  Inbox,
  AlertCircle,
  Zap
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const PORTAL_COLORS: Record<string, string> = {
  PropertyFinder: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Bayut: 'bg-red-500/10 text-red-600 border-red-500/20',
  Dubizzle: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const PORTAL_ICONS: Record<string, string> = {
  PropertyFinder: '🏠',
  Bayut: '🏢',
  Dubizzle: '📋',
};

type PortalName = 'PropertyFinder' | 'Bayut' | 'Dubizzle';

export function PortalInquiriesPanel() {
  const [selectedPortal, setSelectedPortal] = useState<PortalName | 'all'>('all');
  const { data: stats, isLoading: statsLoading } = usePortalInquiryStats();
  const { data: inquiries, isLoading: inquiriesLoading, refetch } = usePortalInquiries({
    portal: selectedPortal === 'all' ? undefined : selectedPortal,
    limit: 50,
  });
  const testWebhook = useTestPortalWebhook();

  const handleTestInquiry = (portal: PortalName) => {
    testWebhook.mutate({
      portal,
      name: `Test Buyer - ${portal}`,
      email: `test.${Date.now()}@example.com`,
      phone: '+971501234567',
      message: `I'm interested in this property. Please contact me with more details.`,
    });
  };

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.unprocessed || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.last24h || 0}</p>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats ? stats.total - stats.unprocessed : 0}
                </p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portal Filter Tabs */}
      <Tabs value={selectedPortal} onValueChange={(v) => setSelectedPortal(v as PortalName | 'all')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All
              {stats?.total ? (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {stats.total}
                </Badge>
              ) : null}
            </TabsTrigger>
            {['PropertyFinder', 'Bayut', 'Dubizzle'].map(portal => (
              <TabsTrigger key={portal} value={portal}>
                {PORTAL_ICONS[portal]} {portal}
                {stats?.byPortal[portal]?.total ? (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.byPortal[portal].total}
                  </Badge>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={inquiriesLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", inquiriesLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value={selectedPortal} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Portal Inquiries</CardTitle>
                <div className="flex gap-2">
                  {['PropertyFinder', 'Bayut', 'Dubizzle'].map(portal => (
                    <Button
                      key={portal}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTestInquiry(portal as any)}
                      disabled={testWebhook.isPending}
                      className="text-xs"
                    >
                      Test {portal.slice(0, 2)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {inquiriesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !inquiries?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No inquiries yet</p>
                  <p className="text-sm mt-1">
                    Portal inquiries will appear here when buyers contact you
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {inquiries.map((inquiry: any) => (
                      <InquiryCard key={inquiry.id} inquiry={inquiry} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Webhook Configuration Info */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Configure your portal accounts to send inquiry notifications to:</p>
          <code className="block bg-muted p-2 rounded text-xs break-all">
            {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-lead-sync`}
          </code>
          <p className="text-xs">
            Include the portal name in the <code>x-portal-source</code> header or in the JSON body.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: any }) {
  const isProcessed = !!inquiry.processed_at;
  const listing = inquiry.listing;
  const lead = inquiry.lead;

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isProcessed ? "bg-muted/30" : "bg-background"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("text-xs", PORTAL_COLORS[inquiry.portal])}>
              {PORTAL_ICONS[inquiry.portal]} {inquiry.portal}
            </Badge>
            {isProcessed ? (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Converted
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(inquiry.received_at), { addSuffix: true })}
            </span>
          </div>

          <h4 className="font-medium">{inquiry.inquirer_name}</h4>
          
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
            {inquiry.inquirer_email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {inquiry.inquirer_email}
              </span>
            )}
            {inquiry.inquirer_phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {inquiry.inquirer_phone}
              </span>
            )}
          </div>

          {inquiry.message && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              {inquiry.message}
            </p>
          )}

          {listing && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Building2 className="w-3 h-3 text-primary" />
              <span className="text-primary">{listing.listing_id}</span>
              {listing.listing_attributes?.location?.community && (
                <span className="text-muted-foreground">
                  • {listing.listing_attributes.location.community}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {lead && (
            <Button variant="outline" size="sm" asChild>
              <a href={`#lead-${lead.id}`}>
                View Lead
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
