import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Search,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useDevelopers, useDeveloperProjects } from '@/hooks/useDevelopers';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';
import { Link } from 'react-router-dom';

function DeveloperCard({ developer, projectCount }: { developer: any; projectCount: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-5">
          {/* Logo / Avatar */}
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {developer.logo_url ? (
              <img src={developer.logo_url} alt={developer.name} className="w-10 h-10 object-contain rounded" />
            ) : (
              <Building2 className="w-7 h-7 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">{developer.name}</h3>
              <Badge variant={developer.is_active ? 'default' : 'secondary'} className="text-xs">
                {developer.is_active ? 'Active Partner' : 'Inactive'}
              </Badge>
            </div>

            {developer.legal_name && (
              <p className="text-sm text-muted-foreground mt-0.5">{developer.legal_name}</p>
            )}

            {developer.rera_number && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>RERA: {developer.rera_number}</span>
              </div>
            )}

            {developer.address && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{developer.address}</span>
              </div>
            )}

            {/* Contact Details */}
            <div className="flex flex-wrap gap-3 mt-3">
              {developer.contact_phone && (
                <a href={`tel:${developer.contact_phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  {developer.contact_phone}
                </a>
              )}
              {developer.contact_email && (
                <a href={`mailto:${developer.contact_email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Mail className="w-3.5 h-3.5" />
                  {developer.contact_email}
                </a>
              )}
            </div>

            {/* Project count */}
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground px-0"
                onClick={() => setExpanded(!expanded)}
              >
                <Building2 className="w-4 h-4 mr-1.5" />
                {projectCount} project{projectCount !== 1 ? 's' : ''}
                <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded projects */}
        {expanded && <DeveloperProjectsList developerId={developer.id} />}
      </CardContent>
    </Card>
  );
}

function DeveloperProjectsList({ developerId }: { developerId: string }) {
  const { data: projects, isLoading } = useDeveloperProjects(developerId);

  if (isLoading) {
    return <div className="px-5 pb-4 text-sm text-muted-foreground">Loading projects...</div>;
  }

  if (!projects?.length) {
    return <div className="px-5 pb-4 text-sm text-muted-foreground">No projects listed yet.</div>;
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'TBA';
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="border-t border-border bg-muted/30">
      <div className="divide-y divide-border">
        {projects.map((p) => (
          <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {[p.community, p.location].filter(Boolean).join(', ')}
                {p.project_type && ` · ${p.project_type}`}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {p.status && (
                <Badge variant="outline" className="text-xs mb-1">{p.status}</Badge>
              )}
              {(p.price_from || p.price_to) && (
                <p className="text-xs text-muted-foreground">
                  {formatPrice(p.price_from)}{p.price_to && p.price_to !== p.price_from ? ` – ${formatPrice(p.price_to)}` : ''}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DevelopersPortal() {
  const { data: developers, isLoading } = useDevelopers();
  const { data: allProjects } = useDeveloperProjects();
  const [search, setSearch] = useState('');

  // Count projects per developer
  const projectCounts = (allProjects || []).reduce((acc, p) => {
    acc[p.developer_id] = (acc[p.developer_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = (developers || []).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.rera_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <MiCasaLogo width={120} height={32} useImage className="opacity-90" />
          </Link>
          <Badge variant="outline" className="text-xs">Developer Partners</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Developer Directory</h1>
          <p className="text-muted-foreground mt-1">
            Our trusted Abu Dhabi developer partners and their active projects
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search developers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading developers...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {search ? 'No developers match your search.' : 'No developers added yet.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((dev) => (
              <DeveloperCard
                key={dev.id}
                developer={dev}
                projectCount={projectCounts[dev.id] || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
