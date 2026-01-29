import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, Mail, MapPin, Calendar, User, Building, Hash, MessageSquare, 
  Zap, Target, TrendingUp, CheckCircle, XCircle, AlertCircle,
  DollarSign, Clock, FileText, Download, RotateCw, Bot, Volume2, Mic, ChevronDown, Send
} from 'lucide-react';
import type { Prospect } from '@/hooks/useProspects';
import { format } from 'date-fns';
import { QuickConvertButton } from '@/components/funnel/QuickConvertButton';
import { toast } from 'sonner';
import { getScoreBreakdown } from '@/lib/scoring-engine';
import { qualifyLead, type ProspectScoringData } from '@/utils/bosScoring';
import { getGateStatus, type ProspectData } from '@/lib/qualification-gates';
import { useFunnelProcessor } from '@/hooks/useFunnelProcessor';
import { ProspectVoiceMessage } from '@/components/voice/ProspectVoiceMessage';
import { LiveCallNotes } from '@/components/voice/LiveCallNotes';
import { WhatsAppMessagePanel } from '@/components/communication/WhatsAppMessagePanel';
import { SMSNotificationButton } from '@/components/communication/SMSNotificationButton';
import { CommunicationHistory } from '@/components/communication/CommunicationHistory';

interface Props {
  prospect: Prospect | null;
  onClose: () => void;
  onUpdate: (updates: Partial<Prospect>) => void;
  onConvertToLead?: (prospect: Prospect) => void;
}

const outreachStatuses = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted to Lead' },
];

const buyerTypes = [
  { value: 'EndUser', label: 'End User' },
  { value: 'Investor', label: 'Investor' },
  { value: 'Broker', label: 'Broker' },
];

const timeframes = [
  { value: '0-3', label: '0-3 months' },
  { value: '3-6', label: '3-6 months' },
  { value: '6-12', label: '6-12 months' },
  { value: '12+', label: '12+ months' },
];

// Use Prospect type directly since it now includes all MiCasa fields
type ExtendedProspect = Prospect;

export function ProspectDetailSheet({ prospect, onClose, onUpdate, onConvertToLead }: Props) {
  const extProspect = prospect as ExtendedProspect | null;
  const { processProspect, updateProspectScores } = useFunnelProcessor();
  
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('not_contacted');
  
  // Qualification data state
  const [buyerType, setBuyerType] = useState<string>('');
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('');
  
  // Intent signals state
  const [isCashBuyer, setIsCashBuyer] = useState(false);
  const [mortgagePreapproval, setMortgagePreapproval] = useState(false);
  const [priceListRequested, setPriceListRequested] = useState(false);
  const [whatsappStarted, setWhatsappStarted] = useState(false);
  const [brochureDownloaded, setBrochureDownloaded] = useState(false);
  const [repeatVisit, setRepeatVisit] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (extProspect) {
      setNotes(extProspect.notes || '');
      setStatus(extProspect.outreach_status);
      setBuyerType(extProspect.buyer_type || '');
      setBudgetMin(extProspect.budget_min?.toString() || '');
      setBudgetMax(extProspect.budget_max?.toString() || '');
      setTimeframe(extProspect.timeframe || '');
      setIsCashBuyer(extProspect.is_cash_buyer || false);
      setMortgagePreapproval(extProspect.mortgage_preapproval || false);
      setPriceListRequested(extProspect.price_list_requested || false);
      setWhatsappStarted(extProspect.whatsapp_started || false);
      setBrochureDownloaded(extProspect.brochure_downloaded || false);
      setRepeatVisit(extProspect.repeat_visit_7d || false);
    }
  }, [extProspect]);

  // Calculate scores in real-time
  const scoringData: ProspectScoringData = useMemo(() => ({
    buyer_type: buyerType as 'EndUser' | 'Investor' | 'Broker' | null || null,
    budget_min: budgetMin ? parseFloat(budgetMin) : null,
    budget_max: budgetMax ? parseFloat(budgetMax) : null,
    timeframe: timeframe as '0-3' | '3-6' | '6-12' | '12+' | null || null,
    is_cash_buyer: isCashBuyer,
    mortgage_preapproval: mortgagePreapproval,
    price_list_requested: priceListRequested,
    whatsapp_started: whatsappStarted,
    brochure_downloaded: brochureDownloaded,
    repeat_visit_7d: repeatVisit,
  }), [buyerType, budgetMin, budgetMax, timeframe, isCashBuyer, mortgagePreapproval, priceListRequested, whatsappStarted, brochureDownloaded, repeatVisit]);

  const { fitScore, intentScore, totalScore, status: leadStage } = useMemo(
    () => qualifyLead(scoringData),
    [scoringData]
  );
  
  const scoreBreakdown = useMemo(
    () => getScoreBreakdown(scoringData),
    [scoringData]
  );

  const gateStatus = useMemo(() => {
    if (!extProspect) return [];
    return getGateStatus({
      id: extProspect.id,
      buyer_type: buyerType as any || null,
      budget_min: budgetMin ? parseFloat(budgetMin) : null,
      budget_max: budgetMax ? parseFloat(budgetMax) : null,
      timeframe: timeframe as any || null,
    });
  }, [extProspect, buyerType, budgetMin, budgetMax, timeframe]);

  const allGatesPassed = gateStatus.every(g => g.passed);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onUpdate({ 
      outreach_status: newStatus,
      last_contacted_at: newStatus !== 'not_contacted' ? new Date().toISOString() : extProspect?.last_contacted_at,
      contact_attempts: newStatus !== 'not_contacted' ? (extProspect?.contact_attempts || 0) + 1 : extProspect?.contact_attempts
    });
  };

  const handleSaveNotes = () => {
    onUpdate({ notes });
  };

  const handleSaveQualification = async () => {
    if (!extProspect) return;
    
    const updates: Partial<ExtendedProspect> = {
      buyer_type: buyerType as any || null,
      budget_min: budgetMin ? parseFloat(budgetMin) : null,
      budget_max: budgetMax ? parseFloat(budgetMax) : null,
      timeframe: timeframe as any || null,
      is_cash_buyer: isCashBuyer,
      mortgage_preapproval: mortgagePreapproval,
      price_list_requested: priceListRequested,
      whatsapp_started: whatsappStarted,
      brochure_downloaded: brochureDownloaded,
      repeat_visit_7d: repeatVisit,
      fit_score: fitScore,
      intent_score: intentScore,
      total_score: totalScore,
    };
    
    onUpdate(updates as any);
    toast.success('Qualification data saved');
  };

  const handleCall = () => {
    if (extProspect?.phone) {
      window.open(`tel:${extProspect.phone}`, '_self');
      if (extProspect.outreach_status === 'not_contacted') {
        handleStatusChange('contacted');
        toast.success('Prospect auto-advanced to Contacted');
      }
    }
  };

  const handleEmail = () => {
    if (extProspect?.email) {
      window.open(`mailto:${extProspect.email}`, '_blank');
      if (extProspect.outreach_status === 'not_contacted') {
        handleStatusChange('contacted');
        toast.success('Prospect auto-advanced to Contacted');
      }
    }
  };

  const handleWhatsApp = () => {
    if (extProspect?.phone) {
      const cleanPhone = extProspect.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
      // Mark WhatsApp as started
      setWhatsappStarted(true);
      onUpdate({ whatsapp_started: true } as any);
      if (extProspect.outreach_status === 'not_contacted') {
        handleStatusChange('contacted');
        toast.success('Prospect auto-advanced to Contacted');
      }
    }
  };

  const handleConvertToLead = async () => {
    if (!extProspect) return;
    
    setIsProcessing(true);
    try {
      const result = await processProspect({
        id: extProspect.id,
        full_name: extProspect.full_name,
        phone: extProspect.phone,
        email: extProspect.email,
        buyer_type: buyerType as any || null,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        timeframe: timeframe as any || null,
        is_cash_buyer: isCashBuyer,
        mortgage_preapproval: mortgagePreapproval,
        price_list_requested: priceListRequested,
        whatsapp_started: whatsappStarted,
        brochure_downloaded: brochureDownloaded,
        repeat_visit_7d: repeatVisit,
        source: extProspect.source,
      });
      
      if (result.success) {
        if (result.action === 'deal_created') {
          toast.success(`Lead & Deal created! Stage: ${result.leadStage}`);
        } else if (result.action === 'converted') {
          toast.success(`Lead created! Stage: ${result.leadStage}`);
        } else if (result.action === 'disqualified') {
          toast.error(result.message);
        } else {
          toast.info(result.message);
        }
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to process prospect');
    } finally {
      setIsProcessing(false);
    }
  };

  const isAlreadyConverted = extProspect?.linked_lead_id || extProspect?.outreach_status === 'converted';
  const isDisqualified = extProspect?.prospect_status === 'DISQUALIFIED';

  if (!extProspect) return null;

  return (
    <Sheet open={!!extProspect} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{extProspect.full_name}</SheetTitle>
          {extProspect.prospect_status && (
            <Badge variant={
              extProspect.prospect_status === 'VERIFIED' ? 'default' :
              extProspect.prospect_status === 'DISQUALIFIED' ? 'destructive' :
              'secondary'
            }>
              {extProspect.prospect_status}
              {extProspect.disqualification_reason && ` - ${extProspect.disqualification_reason}`}
            </Badge>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Scoring Dashboard */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Qualification Score
              </h4>
            <Badge
              variant={
                leadStage === 'HighIntent' ? 'default' :
                leadStage === 'Qualified' ? 'default' :
                leadStage === 'Interested' ? 'secondary' :
                leadStage === 'Disqualified' ? 'destructive' :
                'outline'
              }
              className={
                leadStage === 'HighIntent' ? 'bg-primary' :
                leadStage === 'Qualified' ? 'bg-accent' :
                ''
              }
            >
                {leadStage}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Total Score</span>
                <span className="font-bold">{totalScore}/100</span>
              </div>
              <Progress value={totalScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 bg-background rounded">
                <p className="text-xs text-muted-foreground">Fit Score</p>
                <p className="text-lg font-bold">{fitScore}/50</p>
              </div>
              <div className="p-2 bg-background rounded">
                <p className="text-xs text-muted-foreground">Intent Score</p>
                <p className="text-lg font-bold">{intentScore}/50</p>
              </div>
            </div>
          </div>

          {/* Gate Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Qualification Gates
            </h4>
            <div className="space-y-1">
              {gateStatus.map((gate) => (
                <div key={gate.gate} className="flex items-center justify-between p-2 rounded bg-muted/20">
                  <span className="text-sm">{gate.label}</span>
                  {gate.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{gate.message}</span>
                      <XCircle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCall} disabled={!extProspect.phone} className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <SMSNotificationButton
              entityType="prospect"
              entityId={extProspect.id}
              recipientName={extProspect.full_name}
              recipientPhone={extProspect.phone}
              variant="outline"
              size="sm"
            />
            <Button variant="outline" size="sm" onClick={handleEmail} disabled={!extProspect.email} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Communication Tools */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Communication Tools
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <WhatsAppMessagePanel
                entityType="prospect"
                entityId={extProspect.id}
                recipientName={extProspect.full_name}
                recipientPhone={extProspect.phone}
              />
              <CommunicationHistory
                entityType="prospect"
                entityId={extProspect.id}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Voice Tools Section */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Cold Calling Tools
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <ProspectVoiceMessage 
                prospectName={extProspect.full_name}
                location={extProspect.city || undefined}
              />
              <LiveCallNotes 
                onTranscriptChange={(transcript) => {
                  // Optionally auto-save to notes
                  console.log('Transcript:', transcript);
                }}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Convert to Lead */}
          {!isAlreadyConverted && !isDisqualified && (
            <div className={`p-4 rounded-lg border ${allGatesPassed ? 'bg-primary/10 border-primary/30' : 'bg-muted/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-4 h-4 ${allGatesPassed ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">
                  {allGatesPassed ? 'Ready to Convert' : 'Complete Qualification'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {allGatesPassed 
                  ? `This prospect qualifies as "${leadStage}". Convert to start the sales process.`
                  : 'Fill in required qualification fields to enable conversion.'
                }
              </p>
              <QuickConvertButton 
                type="prospect-to-lead"
                onConvert={handleConvertToLead}
                disabled={!allGatesPassed || isProcessing}
                className="w-full"
              />
            </div>
          )}

          {isAlreadyConverted && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-foreground" />
                <span className="text-sm font-medium">Already Converted to Lead</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Qualification Data Capture */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Buyer Profile
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buyer Type *</Label>
                <Select value={buyerType} onValueChange={setBuyerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Timeframe *</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Min (AED)</Label>
                <Input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="e.g. 800000"
                />
              </div>
              <div className="space-y-2">
                <Label>Budget Max (AED) *</Label>
                <Input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="e.g. 2000000"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Intent Signals */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Intent Signals
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="cash-buyer" className="text-sm cursor-pointer">Cash Buyer (+10)</Label>
                </div>
                <Switch id="cash-buyer" checked={isCashBuyer} onCheckedChange={setIsCashBuyer} />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="mortgage" className="text-sm cursor-pointer">Pre-Approved (+10)</Label>
                </div>
                <Switch id="mortgage" checked={mortgagePreapproval} onCheckedChange={setMortgagePreapproval} />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="price-list" className="text-sm cursor-pointer">Price List (+15)</Label>
                </div>
                <Switch id="price-list" checked={priceListRequested} onCheckedChange={setPriceListRequested} />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="whatsapp" className="text-sm cursor-pointer">WhatsApp (+15)</Label>
                </div>
                <Switch id="whatsapp" checked={whatsappStarted} onCheckedChange={setWhatsappStarted} />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="brochure" className="text-sm cursor-pointer">Brochure (+10)</Label>
                </div>
                <Switch id="brochure" checked={brochureDownloaded} onCheckedChange={setBrochureDownloaded} />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="repeat" className="text-sm cursor-pointer">Repeat Visit (+10)</Label>
                </div>
                <Switch id="repeat" checked={repeatVisit} onCheckedChange={setRepeatVisit} />
              </div>
            </div>

            <Button size="sm" onClick={handleSaveQualification} className="w-full">
              Save Qualification Data
            </Button>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <Label>Outreach Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outreachStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            
            {extProspect.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{extProspect.phone}</span>
              </div>
            )}
            
            {extProspect.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{extProspect.email}</span>
              </div>
            )}
            
            {extProspect.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{extProspect.city}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* CRM Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">CRM Details</h4>
            
            <div className="flex items-center gap-3 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{extProspect.crm_customer_id || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Source: {extProspect.source || 'Unknown'}</span>
            </div>
            
            {extProspect.crm_created_date && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created: {format(new Date(extProspect.crm_created_date), 'PP')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge variant="outline" className={
                extProspect.crm_confidence_level === 'High' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : extProspect.crm_confidence_level === 'Medium'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }>
                {extProspect.crm_confidence_level || 'Unknown'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Engagement Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Engagement</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{extProspect.contact_attempts}</p>
                <p className="text-xs text-muted-foreground">Contact Attempts</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">
                  {extProspect.last_contacted_at 
                    ? format(new Date(extProspect.last_contacted_at), 'PP')
                    : 'Never'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Last Contacted</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this prospect..."
              rows={4}
            />
            <Button size="sm" onClick={handleSaveNotes} disabled={notes === (extProspect.notes || '')}>
              Save Notes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
