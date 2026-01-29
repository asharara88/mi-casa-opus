import { qualifyLead } from '@/server/api/inMemoryStore';
import type { LeadState } from '@/types/bos';

const SUPABASE_NOTE =
  'Replace this in-memory call with a Supabase update using SUPABASE_URL/SUPABASE_ANON_KEY.';

type ApiRequest = {
  method?: string;
  body?: {
    leadId?: string;
    targetState?: LeadState;
    qualificationData?: Record<string, unknown> | null;
    disqualificationReason?: string | null;
    notes?: string | null;
  };
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  if (!req.body?.leadId) {
    res.status(400).json({ error: 'leadId is required' });
    return;
  }

  try {
    // TODO: Replace with Supabase update using SUPABASE_URL/SUPABASE_ANON_KEY.
    const lead = qualifyLead({
      leadId: req.body.leadId,
      targetState: req.body.targetState,
      qualificationData: req.body.qualificationData ?? null,
      disqualificationReason: req.body.disqualificationReason ?? null,
      notes: req.body.notes ?? null,
    });

    res.status(200).json({ lead, note: SUPABASE_NOTE });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
