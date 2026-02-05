-- Phase 2, 3, 4: Database layer for Manager Dashboard, Realtime, and Notifications
-- ================================================================================

-- PHASE 4: Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'Operator'::app_role) 
  OR user_id = auth.uid()
);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Index for fast notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- PHASE 4: Notification Trigger for Lead Assignment
CREATE OR REPLACE FUNCTION public.notify_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_broker_id IS DISTINCT FROM OLD.assigned_broker_id 
     AND NEW.assigned_broker_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, notification_type, title, message, entity_type, entity_id)
    SELECT bp.user_id, 'lead_assigned', 'New Lead Assigned',
           'Lead ' || NEW.lead_id || ' (' || NEW.contact_name || ') has been assigned to you',
           'lead', NEW.id::text
    FROM broker_profiles bp WHERE bp.id = NEW.assigned_broker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for lead assignment
DROP TRIGGER IF EXISTS trigger_notify_lead_assignment ON public.leads;
CREATE TRIGGER trigger_notify_lead_assignment
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lead_assignment();

-- PHASE 4: Notification Trigger for Deal Stage Changes
CREATE OR REPLACE FUNCTION public.notify_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deal_state IS DISTINCT FROM OLD.deal_state THEN
    INSERT INTO public.notifications (user_id, notification_type, title, message, entity_type, entity_id)
    SELECT bp.user_id, 'deal_stage_change', 'Deal Stage Updated',
           'Deal ' || NEW.deal_id || ' moved to ' || NEW.deal_state::text,
           'deal', NEW.id::text
    FROM deal_brokers db
    JOIN broker_profiles bp ON db.broker_id = bp.id
    WHERE db.deal_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_deal_stage_change ON public.deals;
CREATE TRIGGER trigger_notify_deal_stage_change
  AFTER UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_deal_stage_change();

-- PHASE 2: Team Metrics Function
CREATE OR REPLACE FUNCTION public.get_team_metrics()
RETURNS TABLE (
  broker_id UUID,
  broker_name TEXT,
  user_id UUID,
  lead_count BIGINT,
  deal_count BIGINT,
  won_deals BIGINT,
  conversion_rate NUMERIC,
  total_commission NUMERIC,
  avg_deal_cycle_days NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id as broker_id,
    COALESCE(u.email, bp.broker_id) as broker_name,
    bp.user_id,
    COALESCE(l.cnt, 0) as lead_count,
    COALESCE(d.cnt, 0) as deal_count,
    COALESCE(d.won, 0) as won_deals,
    CASE 
      WHEN COALESCE(l.cnt, 0) > 0 THEN ROUND((COALESCE(d.won, 0)::numeric / l.cnt) * 100, 1)
      ELSE 0 
    END as conversion_rate,
    COALESCE(c.total, 0) as total_commission,
    COALESCE(d.avg_cycle, 0) as avg_deal_cycle_days
  FROM broker_profiles bp
  LEFT JOIN auth.users u ON bp.user_id = u.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as cnt FROM leads WHERE assigned_broker_id = bp.id
  ) l ON true
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(*) as cnt,
      COUNT(*) FILTER (WHERE deal_state = 'ClosedWon') as won,
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) FILTER (WHERE deal_state = 'ClosedWon') as avg_cycle
    FROM deals d2
    JOIN deal_brokers db ON d2.id = db.deal_id
    WHERE db.broker_id = bp.id
  ) d ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(net_amount), 0) as total
    FROM commission_records 
    WHERE broker_id = bp.id AND status IN ('Paid', 'Expected')
  ) c ON true
  ORDER BY COALESCE(c.total, 0) DESC;
END;
$$;

-- PHASE 3: Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;