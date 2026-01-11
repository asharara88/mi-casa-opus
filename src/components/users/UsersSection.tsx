import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  Shield,
  Mail,
  Phone,
  MoreHorizontal,
  Briefcase,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'Operator' | 'LegalOwner' | 'Broker' | 'Investor';
  status: 'Active' | 'Pending' | 'Suspended';
  created_at: string;
  broker_id?: string;
  license_no?: string;
}

const DEMO_USERS: UserProfile[] = [
  {
    id: '1',
    user_id: 'USR-001',
    full_name: 'Ahmed Hassan',
    email: 'ahmed@micasa.ae',
    phone: '+971 50 123 4567',
    role: 'Operator',
    status: 'Active',
    created_at: '2023-06-15',
  },
  {
    id: '2',
    user_id: 'USR-002',
    full_name: 'Sara Ali',
    email: 'sara@micasa.ae',
    phone: '+971 50 234 5678',
    role: 'Broker',
    status: 'Active',
    created_at: '2023-08-20',
    broker_id: 'BRK-002',
    license_no: 'BRN-2024-1234',
  },
  {
    id: '3',
    user_id: 'USR-003',
    full_name: 'John Smith',
    email: 'john@micasa.ae',
    phone: '+971 50 345 6789',
    role: 'Broker',
    status: 'Active',
    created_at: '2023-09-10',
    broker_id: 'BRK-003',
    license_no: 'BRN-2024-5678',
  },
  {
    id: '4',
    user_id: 'USR-004',
    full_name: 'Fatima Khan',
    email: 'fatima@micasa.ae',
    role: 'LegalOwner',
    status: 'Active',
    created_at: '2023-01-01',
  },
  {
    id: '5',
    user_id: 'USR-005',
    full_name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+971 55 987 6543',
    role: 'Investor',
    status: 'Pending',
    created_at: '2024-01-10',
  },
];

const ROLE_COLORS: Record<string, string> = {
  Operator: 'bg-primary/20 text-primary border-primary/30',
  LegalOwner: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  Broker: 'bg-emerald/20 text-emerald border-emerald/30',
  Investor: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald/20 text-emerald',
  Pending: 'bg-amber-500/20 text-amber-600',
  Suspended: 'bg-destructive/20 text-destructive',
};

export function UsersSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredUsers = DEMO_USERS.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const roleCount = (role: string) => DEMO_USERS.filter(u => u.role === role).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">User Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage users and broker profiles
            </p>
          </div>
        </div>
        <Button className="btn-gold" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <div className="text-xl font-bold text-foreground">{roleCount('Operator')}</div>
                <div className="text-xs text-muted-foreground">Operators</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-emerald" />
              <div>
                <div className="text-xl font-bold text-foreground">{roleCount('Broker')}</div>
                <div className="text-xs text-muted-foreground">Brokers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-6 w-6 text-purple-500" />
              <div>
                <div className="text-xl font-bold text-foreground">{roleCount('LegalOwner')}</div>
                <div className="text-xs text-muted-foreground">Legal Owners</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <div className="text-xl font-bold text-foreground">{roleCount('Investor')}</div>
                <div className="text-xs text-muted-foreground">Investors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Operator">Operator</SelectItem>
                <SelectItem value="LegalOwner">Legal Owner</SelectItem>
                <SelectItem value="Broker">Broker</SelectItem>
                <SelectItem value="Investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{user.full_name}</div>
                        <code className="text-xs text-muted-foreground">{user.user_id}</code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs', ROLE_COLORS[user.role])}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', STATUS_COLORS[user.status])}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.license_no ? (
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {user.license_no}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.created_at}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign a role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operator">Operator</SelectItem>
                  <SelectItem value="LegalOwner">Legal Owner</SelectItem>
                  <SelectItem value="Broker">Broker</SelectItem>
                  <SelectItem value="Investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              className="btn-gold"
              onClick={() => {
                toast({ title: 'User Invited', description: 'Invitation email sent' });
                setShowAddDialog(false);
              }}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
