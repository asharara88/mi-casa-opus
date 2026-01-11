import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Mail, Phone, FileCheck, AlertCircle } from 'lucide-react';
import { DealParty } from '@/types/bos';
import { cn } from '@/lib/utils';

interface DealPartiesPanelProps {
  parties: DealParty[];
  onAddParty?: () => void;
  onPartyClick?: (party: DealParty) => void;
}

const ROLE_COLORS: Record<string, string> = {
  Buyer: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  Seller: 'bg-emerald/20 text-emerald border-emerald/30',
  Landlord: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  Tenant: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  Developer: 'bg-primary/20 text-primary border-primary/30',
};

export const DealPartiesPanel: React.FC<DealPartiesPanelProps> = ({
  parties,
  onAddParty,
  onPartyClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasKYC = (party: DealParty) => {
    return party.identity.emirates_id || party.identity.passport_no;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Deal Parties</CardTitle>
          </div>
          {onAddParty && (
            <Button size="sm" variant="outline" onClick={onAddParty}>
              <Plus className="h-4 w-4 mr-1" />
              Add Party
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {parties.map((party) => (
          <div
            key={party.party_id}
            className={cn(
              'p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors',
              onPartyClick && 'cursor-pointer'
            )}
            onClick={() => onPartyClick?.(party)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(party.identity.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">
                    {party.identity.full_name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', ROLE_COLORS[party.role] || 'bg-muted')}
                  >
                    {party.role}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {party.identity.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{party.identity.email}</span>
                    </div>
                  )}
                  {party.identity.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{party.identity.phone}</span>
                    </div>
                  )}
                </div>

                {/* KYC Status */}
                <div className="mt-2 flex items-center gap-2">
                  {hasKYC(party) ? (
                    <Badge variant="secondary" className="bg-emerald/20 text-emerald text-xs">
                      <FileCheck className="h-3 w-3 mr-1" />
                      KYC Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      KYC Pending
                    </Badge>
                  )}
                  {party.identity.emirates_id && (
                    <span className="text-xs text-muted-foreground font-mono">
                      EID: •••{party.identity.emirates_id.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {parties.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No parties added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
