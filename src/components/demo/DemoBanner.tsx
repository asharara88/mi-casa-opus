import { useState } from 'react';
import { X, Play, ChevronRight, Sparkles, Users, Handshake, DollarSign, Building2, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  section: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'leads',
    title: 'Lead Pipeline',
    description: 'Capture, qualify, and convert leads with AI-powered scoring and automated follow-ups.',
    icon: Users,
    section: 'leads',
  },
  {
    id: 'deals',
    title: 'Deal Management',
    description: 'Track deals through the complete transaction lifecycle with compliance gates at each stage.',
    icon: Handshake,
    section: 'deals',
  },
  {
    id: 'listings',
    title: 'Property Listings',
    description: 'Manage your property inventory with detailed attributes, pricing, and availability status.',
    icon: Building2,
    section: 'listings',
  },
  {
    id: 'documents',
    title: 'Document Center',
    description: 'Generate, sign, and track documents with full audit trails and e-signature integration.',
    icon: FileText,
    section: 'documents',
  },
  {
    id: 'commissions',
    title: 'Commission Ledger',
    description: 'Automatic commission calculations, split tracking, and payout batch management.',
    icon: DollarSign,
    section: 'commissions',
  },
  {
    id: 'compliance',
    title: 'Compliance & Approvals',
    description: 'Built-in regulatory compliance with approval workflows and audit logging.',
    icon: Shield,
    section: 'approvals',
  },
];

interface DemoBannerProps {
  onNavigate?: (section: string) => void;
}

export function DemoBanner({ onNavigate }: DemoBannerProps) {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  const handleStartTour = () => {
    setShowTour(true);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTour(false);
      setCurrentStep(0);
    }
  };

  const handleGoToSection = (section: string) => {
    onNavigate?.(section);
    handleNextStep();
  };

  const currentTourStep = TOUR_STEPS[currentStep];

  return (
    <div className="relative">
      {/* Main Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Demo Mode Active</span>
              </div>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Explore BOS with sample data. All changes are temporary and won't affect real data.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!showTour && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartTour}
                  className="gap-2 border-primary/30 hover:bg-primary/10"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Take a Tour</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Overlay */}
      {showTour && (
        <div className="absolute top-full left-0 right-0 z-50 bg-card border-b border-border shadow-lg animate-fade-in">
          <div className="px-4 py-4">
            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {TOUR_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === currentStep
                      ? 'w-6 bg-primary'
                      : index < currentStep
                        ? 'bg-primary/50'
                        : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>

            {/* Current Step Content */}
            <div className="flex items-start gap-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <currentTourStep.icon className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {currentTourStep.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentTourStep.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleGoToSection(currentTourStep.section)}
                    className="gap-2"
                  >
                    Explore {currentTourStep.title}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextStep}
                  >
                    {currentStep < TOUR_STEPS.length - 1 ? 'Skip' : 'Finish Tour'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTour(false)}
                    className="ml-auto text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Jump Feature Cards */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick Jump</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {TOUR_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(index);
                        onNavigate?.(step.section);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                        index === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted-foreground/20 text-muted-foreground'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
