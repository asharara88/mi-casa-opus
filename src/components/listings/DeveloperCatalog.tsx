import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Search,
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { firecrawlApi, type ScrapedProject, type DeveloperScrapeResult } from '@/lib/api/firecrawl';
import { DeveloperProjectCard } from './DeveloperProjectCard';
import { useDemoMode } from '@/contexts/DemoContext';
import { useDevelopers, useCreateDeveloper, useCreateDeveloperProject } from '@/hooks/useDevelopers';

interface DeveloperCatalogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEVELOPER_PRESETS = [
  { name: 'Aldar', url: 'https://www.aldar.com/en/explore-aldar/businesses/development/residential' },
  { name: 'Reportage', url: 'https://reportageuae.com/en/projects?emirate=abu-dhabi' },
  { name: 'Bloom', url: 'https://bloomholding.com/properties/' },
  { name: 'Q Properties', url: 'https://www.qproperties.ae/projects' },
  { name: 'Imkan', url: 'https://www.imkan.ae/projects' },
  { name: 'Modon', url: 'https://www.modon.ae/real-estate' },
  { name: 'Emirates Dev', url: 'https://www.emiratesdevelopment.ae/projects/' },
  { name: 'One Dev', url: 'https://onedevelopment.ae/projects/' },
  { name: 'ONE Residence', url: 'https://oneuae.com/development-detail?title=ONE%20Residence' },
  { name: 'Ohana', url: 'https://ohanadevelopment.com/projects/' },
  { name: 'SAAS', url: 'https://saasproperties.com/en/properties/abu-dhabi/' },
  { name: 'AD Off-Plan', url: 'https://abudhabioffplan.ae/' },
  { name: 'PF Off Plan', url: 'https://www.propertyfinder.ae/en/search?l=6&c=1&fu=0&cs=off_plan&ob=mr' },
  { name: 'PF New Projects', url: 'https://www.propertyfinder.ae/en/new-projects' },
];

// Demo data for testing without API calls - Abu Dhabi off-plan projects
const DEMO_PROJECTS: ScrapedProject[] = [
  {
    name: 'Saadiyat Lagoons',
    community: 'Saadiyat Island',
    location: 'Abu Dhabi',
    projectType: 'Villa',
    status: 'Launching',
    totalUnits: 450,
    availableUnits: 380,
    priceFrom: 3500000,
    priceTo: 12000000,
    expectedHandover: 'Q4 2027',
    commissionPercent: 5,
    paymentPlan: '60/40',
    amenities: ['Beach Access', 'Golf Course', 'Community Pool', 'Gym'],
    brochureUrl: null,
    floorPlansUrl: null,
    description: 'Luxury waterfront villas on Saadiyat Island with stunning lagoon views.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
  },
  {
    name: 'Yas Bay Residences',
    community: 'Yas Island',
    location: 'Abu Dhabi',
    projectType: 'Apartment',
    status: 'Under Construction',
    totalUnits: 800,
    availableUnits: 250,
    priceFrom: 900000,
    priceTo: 3500000,
    expectedHandover: 'Q2 2026',
    commissionPercent: 4,
    paymentPlan: '50/50',
    amenities: ['Waterfront', 'Retail', 'F&B', 'Marina'],
    brochureUrl: null,
    floorPlansUrl: null,
    description: 'Contemporary apartments overlooking Yas Bay entertainment district.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
  },
  {
    name: 'The Dunes',
    community: 'Al Raha Beach',
    location: 'Abu Dhabi',
    projectType: 'Townhouse',
    status: 'Ready',
    totalUnits: 200,
    availableUnits: 45,
    priceFrom: 2200000,
    priceTo: 4500000,
    expectedHandover: 'Ready',
    commissionPercent: 3,
    paymentPlan: 'Cash/Mortgage',
    amenities: ['Community Center', 'Parks', 'Schools', 'Retail'],
    brochureUrl: null,
    floorPlansUrl: null,
    description: 'Family-friendly townhouses with modern design and community amenities.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  },
  {
    name: 'Hudayriyat Views',
    community: 'Hudayriyat Island',
    location: 'Abu Dhabi',
    projectType: 'Villa',
    status: 'Launching',
    totalUnits: 320,
    availableUnits: 280,
    priceFrom: 4200000,
    priceTo: 15000000,
    expectedHandover: 'Q1 2028',
    commissionPercent: 5,
    paymentPlan: '70/30',
    amenities: ['Private Beach', 'Sports Complex', 'Cycling Tracks', 'Marina'],
    brochureUrl: null,
    floorPlansUrl: null,
    description: 'Premium villas on Hudayriyat Island with exclusive beach and sports facilities.',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
  },
  {
    name: 'One Reem Island',
    community: 'Al Reem Island',
    location: 'Abu Dhabi',
    projectType: 'Apartment',
    status: 'Under Construction',
    totalUnits: 500,
    availableUnits: 180,
    priceFrom: 1100000,
    priceTo: 4800000,
    expectedHandover: 'Q3 2026',
    commissionPercent: 4,
    paymentPlan: '60/40',
    amenities: ['Sky Lounge', 'Infinity Pool', 'Smart Home', 'Concierge'],
    brochureUrl: null,
    floorPlansUrl: null,
    description: 'Iconic high-rise living with panoramic views of the Arabian Gulf.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
  },
];

export function DeveloperCatalog({ open, onOpenChange }: DeveloperCatalogProps) {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const { data: developers } = useDevelopers();
  const { mutateAsync: createDeveloper } = useCreateDeveloper();
  const { mutateAsync: createProject } = useCreateDeveloperProject();
  
  const [customUrl, setCustomUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<DeveloperScrapeResult | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [importingProject, setImportingProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleScrape = async (url: string, developerName?: string) => {
    if (isDemoMode) {
      // Use demo data
      setScrapeResult({
        projects: DEMO_PROJECTS,
        developerInfo: { name: developerName || 'Demo Developer', website: url },
        scrapedAt: new Date().toISOString(),
        sourceUrl: url,
      });
      setActiveTab('results');
      toast({
        title: 'Demo Mode',
        description: `Showing ${DEMO_PROJECTS.length} sample projects`,
      });
      return;
    }

    setIsLoading(true);
    setScrapeResult(null);
    setSelectedProjects(new Set());

    try {
      // Step 1: Scrape the URL using Firecrawl (request markdown + links for images)
      const scrapeResponse = await firecrawlApi.scrape(url, {
        formats: ['markdown', 'links'],
        onlyMainContent: false,
        waitFor: 5000,
      });

      if (!scrapeResponse.success) {
        throw new Error(scrapeResponse.error || 'Failed to scrape website');
      }

      // Handle nested data structure from Firecrawl API
      const responseData = scrapeResponse.data?.data || scrapeResponse.data || {};
      const scrapedContent = responseData.markdown || '';
      const scrapedLinks = responseData.links || [];
      
      if (!scrapedContent) {
        throw new Error('No content found on the page');
      }

      // Step 2: Extract projects using AI (pass links for image matching)
      const extractResponse = await firecrawlApi.scrapeDeveloperProjects(
        scrapedContent,
        url,
        developerName,
        scrapedLinks
      );

      if (!extractResponse.success || !extractResponse.data) {
        throw new Error(extractResponse.error || 'Failed to extract projects');
      }

      setScrapeResult(extractResponse.data);
      setActiveTab('results');

      toast({
        title: 'Search Complete',
        description: `Found ${extractResponse.data.projects.length} projects from ${extractResponse.data.developerInfo.name}`,
      });
    } catch (error) {
      console.error('Scrape error:', error);
      toast({
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportProject = async (project: ScrapedProject) => {
    if (isDemoMode) {
      toast({
        title: 'Demo Mode',
        description: 'Project import simulated successfully',
      });
      return;
    }

    setImportingProject(project.name);

    try {
      // First, ensure developer exists
      let developerId = developers?.find(
        d => d.name.toLowerCase() === scrapeResult?.developerInfo.name.toLowerCase()
      )?.id;

      if (!developerId && scrapeResult?.developerInfo.name) {
        const newDeveloper = await createDeveloper({
          name: scrapeResult.developerInfo.name,
          developer_id: `DEV-${Date.now()}`,
          legal_name: null,
          rera_number: null,
          contact_email: null,
          contact_phone: null,
          address: null,
          logo_url: null,
          is_active: true,
        });
        developerId = newDeveloper?.id;
      }

      if (!developerId) {
        throw new Error('Could not create or find developer');
      }

      // Create the project
      await createProject({
        developer_id: developerId,
        project_id: `PRJ-${Date.now()}`,
        name: project.name,
        community: project.community,
        location: project.location,
        project_type: project.projectType,
        status: project.status,
        total_units: project.totalUnits,
        available_units: project.availableUnits,
        price_from: project.priceFrom,
        price_to: project.priceTo,
        expected_handover: project.expectedHandover,
        commission_percent: project.commissionPercent,
        payment_plan_details: project.paymentPlan ? { summary: project.paymentPlan } : null,
        amenities: project.amenities,
        brochure_url: project.brochureUrl,
        floor_plans_url: project.floorPlansUrl,
        launch_date: null,
        is_active: true,
      });

      toast({
        title: 'Project Imported',
        description: `${project.name} has been added to your catalog`,
      });

      // Remove from selection
      setSelectedProjects(prev => {
        const next = new Set(prev);
        next.delete(project.name);
        return next;
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImportingProject(null);
    }
  };

  const handleBatchImport = async () => {
    if (!scrapeResult) return;

    const projectsToImport = scrapeResult.projects.filter(p => selectedProjects.has(p.name));
    
    for (const project of projectsToImport) {
      await handleImportProject(project);
    }

    toast({
      title: 'Batch Import Complete',
      description: `Imported ${projectsToImport.length} projects`,
    });
  };

  const toggleProjectSelection = (projectName: string, selected: boolean) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(projectName);
      } else {
        next.delete(projectName);
      }
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Off Plan Development
          </SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="search">Market Search</TabsTrigger>
            <TabsTrigger value="results" disabled={!scrapeResult}>
              Results {scrapeResult && `(${scrapeResult.projects.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 p-6 pt-4">
            <div className="space-y-6">
              {/* Developer Presets */}
              <div>
                <h3 className="text-sm font-medium mb-3">Quick Access - Abu Dhabi Developers</h3>
                <div className="flex flex-wrap gap-2">
                  {DEVELOPER_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleScrape(preset.url, preset.name)}
                      disabled={isLoading}
                    >
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom URL */}
              <div>
                <h3 className="text-sm font-medium mb-3">Custom Developer URL</h3>
                <div className="flex gap-2">
                  <Input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://developer-website.com/projects"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleScrape(customUrl)}
                    disabled={isLoading || !customUrl.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm">Searching developer catalog...</p>
                  <p className="text-xs mt-1">This may take 15-30 seconds</p>
                </div>
              )}

              {/* How it works */}
              {!isLoading && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">How it works</h4>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Select a developer or enter a custom URL</li>
                    <li>We search the website for project information</li>
                    <li>AI extracts project details, pricing, and amenities</li>
                    <li>Review and import projects to your catalog</li>
                  </ol>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 flex flex-col p-0">
            {scrapeResult && (
              <>
                {/* Results header */}
                <div className="px-6 py-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{scrapeResult.developerInfo.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {scrapeResult.projects.length} projects found
                      </p>
                    </div>
                    {selectedProjects.size > 0 && (
                      <Button onClick={handleBatchImport} size="sm">
                        <Download className="h-4 w-4 mr-1.5" />
                        Import Selected ({selectedProjects.size})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Project cards */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {scrapeResult.projects.map((project) => (
                      <DeveloperProjectCard
                        key={project.name}
                        project={project}
                        isSelected={selectedProjects.has(project.name)}
                        onSelectChange={(selected) => toggleProjectSelection(project.name, selected)}
                        onImport={() => handleImportProject(project)}
                        isImporting={importingProject === project.name}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
