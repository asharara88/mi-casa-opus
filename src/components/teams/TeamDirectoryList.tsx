import { useState } from 'react';
import { Search, Mail, Phone, User, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, UserWithRole } from '@/hooks/useUsers';
import { InviteTeamMemberModal } from './InviteTeamMemberModal';

export function TeamDirectoryList() {
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const { data: users = [], isLoading } = useUsers();

  // Filter users by search (only internal roles: Manager, Owner, Broker, Agent)
  const internalUsers = users.filter(user => 
    user.role && ['Manager', 'Owner', 'Broker', 'Agent'].includes(user.role)
  );

  const filteredUsers = internalUsers.filter(user => 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Manager':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Owner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Agent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Broker':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search team members..." className="pl-9" disabled />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Invite */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="btn-gold" onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No team members found</h3>
          <p className="text-muted-foreground">
            {search ? 'Try a different search term' : 'No users in the system yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {user.full_name || 'Unknown User'}
                      </h3>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getRoleBadgeColor(user.role || 'Unknown')}
                    >
                      {user.role}
                    </Badge>
                    
                    <div className="mt-3 space-y-1.5">
                      {user.email && (
                        <a 
                          href={`mailto:${user.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{user.email}</span>
                        </a>
                      )}
                      {user.phone && (
                        <a 
                          href={`tel:${user.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{user.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {internalUsers.length} team members
      </div>

      <InviteTeamMemberModal open={showInvite} onOpenChange={setShowInvite} />
    </div>
  );
}
