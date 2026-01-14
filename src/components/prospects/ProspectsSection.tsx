import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProspects, useProspectStats, useUpdateProspect } from '@/hooks/useProspects';
import { ProspectImportModal } from './ProspectImportModal';
import { ProspectDetailSheet } from './ProspectDetailSheet';
import { Search, Upload, Users, Phone, Mail, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Prospect } from '@/hooks/useProspects';

const outreachStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'converted', label: 'Converted' },
];

const confidenceLevels = [
  { value: 'all', label: 'All Confidence' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

export function ProspectsSection() {
  const [search, setSearch] = useState('');
  const [outreachStatus, setOutreachStatus] = useState('all');
  const [confidenceLevel, setConfidenceLevel] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  const { data: prospects = [], isLoading } = useProspects({
    search: search || undefined,
    outreach_status: outreachStatus,
    confidence_level: confidenceLevel,
  });

  const { data: stats } = useProspectStats();
  const updateProspect = useUpdateProspect();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'contacted':
      case 'interested':
      case 'converted':
        return <CheckCircle className="h-3 w-3" />;
      case 'follow_up':
        return <Clock className="h-3 w-3" />;
      case 'not_interested':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'interested':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'follow_up':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'not_interested':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getConfidenceColor = (level: string | null) => {
    switch (level) {
      case 'High':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="Prospects" subtitle="Cold outreach and engagement tracking" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats?.total?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Not Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats?.byStatus?.not_contacted?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">{stats?.byConfidence?.High?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Interested</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400">{stats?.byStatus?.interested?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          <Select value={outreachStatus} onValueChange={setOutreachStatus}>
            <SelectTrigger className="w-[160px] bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outreachStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={confidenceLevel} onValueChange={setConfidenceLevel}>
            <SelectTrigger className="w-[160px] bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {confidenceLevels.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowImportModal(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>

        {/* Prospects Table */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">Source</TableHead>
                  <TableHead className="text-muted-foreground">City</TableHead>
                  <TableHead className="text-muted-foreground">Confidence</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Attempts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading prospects...
                    </TableCell>
                  </TableRow>
                ) : prospects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No prospects found. Import a CSV to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  prospects.map((prospect) => (
                    <TableRow 
                      key={prospect.id} 
                      className="border-border/50 cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedProspect(prospect)}
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">{prospect.full_name}</div>
                        <div className="text-xs text-muted-foreground">{prospect.crm_customer_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {prospect.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{prospect.phone}</span>
                            </div>
                          )}
                          {prospect.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[180px]">{prospect.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{prospect.source || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{prospect.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getConfidenceColor(prospect.crm_confidence_level)}>
                          {prospect.crm_confidence_level || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`flex items-center gap-1 w-fit ${getStatusColor(prospect.outreach_status)}`}>
                          {getStatusIcon(prospect.outreach_status)}
                          {prospect.outreach_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {prospect.contact_attempts}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {prospects.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {prospects.length} of {stats?.total?.toLocaleString() || 0} prospects
          </p>
        )}
      </div>

      <ProspectImportModal open={showImportModal} onOpenChange={setShowImportModal} />
      
      <ProspectDetailSheet 
        prospect={selectedProspect} 
        onClose={() => setSelectedProspect(null)}
        onUpdate={(updates) => {
          if (selectedProspect) {
            updateProspect.mutate({ id: selectedProspect.id, updates });
          }
        }}
      />
    </div>
  );
}
