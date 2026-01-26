// Marketing Hub Types

export type CampaignType = 'Email' | 'SMS' | 'WhatsApp' | 'Social' | 'Display' | 'Search' | 'Print' | 'Event';
export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
export type CampaignChannel = 'Email' | 'SMS' | 'WhatsApp' | 'Instagram' | 'Facebook' | 'LinkedIn' | 'Google' | 'Bayut' | 'PropertyFinder' | 'Dubizzle' | 'Print' | 'Billboard' | 'Event';

export type AdPlatform = 'Bayut' | 'PropertyFinder' | 'Dubizzle' | 'Instagram' | 'Facebook' | 'LinkedIn' | 'Google' | 'TikTok' | 'YouTube' | 'Print' | 'Billboard' | 'Brochure';
export type AdStatus = 'Draft' | 'PendingApproval' | 'Active' | 'Paused' | 'Expired' | 'Rejected';
export type PermitStatus = 'NotRequired' | 'Pending' | 'Approved' | 'Expired' | 'Rejected';

export type EventType = 'Roadshow' | 'PropertyLaunch' | 'Exhibition' | 'Networking' | 'Seminar' | 'OpenHouse' | 'Other';
export type EventStatus = 'Planning' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Postponed';

export type ReferralType = 'Broker' | 'Developer' | 'Bank' | 'Agency' | 'Individual' | 'Corporate' | 'Other';

export interface MarketingCampaign {
  id: string;
  campaign_id: string;
  name: string;
  type: CampaignType;
  channel: CampaignChannel;
  status: CampaignStatus;
  budget: number;
  spend: number;
  start_date: string | null;
  end_date: string | null;
  target_audience: Record<string, unknown>;
  metrics: {
    impressions: number;
    clicks: number;
    leads: number;
    conversions: number;
  };
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingEvent {
  id: string;
  event_id: string;
  name: string;
  type: EventType;
  venue: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  budget: number;
  spend: number;
  expected_attendees: number;
  actual_attendees: number;
  registered_attendees: number;
  leads_captured: number;
  status: EventStatus;
  notes: string | null;
  organizer: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingAd {
  id: string;
  ad_id: string;
  name: string;
  platform: AdPlatform;
  type: string | null;
  status: AdStatus;
  listing_id: string | null;
  campaign_id: string | null;
  dari_permit_no: string | null;
  permit_status: PermitStatus;
  permit_valid_from: string | null;
  permit_valid_until: string | null;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads_generated: number;
  start_date: string | null;
  end_date: string | null;
  ad_content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ReferralSource {
  id: string;
  source_id: string;
  name: string;
  type: ReferralType;
  company_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  commission_percent: number;
  leads_generated: number;
  deals_closed: number;
  total_commission_paid: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalBudget: number;
  totalLeadsGenerated: number;
  totalEvents: number;
  upcomingEvents: number;
  totalAds: number;
  activeAds: number;
  totalReferralSources: number;
  prospectsBySource: { source: string; count: number }[];
}
