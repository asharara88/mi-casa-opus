
-- Create mortgage_scenarios table for saving calculator scenarios
CREATE TABLE public.mortgage_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mortgage_scenarios ENABLE ROW LEVEL SECURITY;

-- Users can only see their own scenarios
CREATE POLICY "Users can view own scenarios" ON public.mortgage_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scenarios" ON public.mortgage_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios" ON public.mortgage_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios" ON public.mortgage_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_mortgage_scenarios_updated_at
  BEFORE UPDATE ON public.mortgage_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
