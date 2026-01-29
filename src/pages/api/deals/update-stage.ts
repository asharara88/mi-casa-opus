import { updateDealStage } from '@/server/api/inMemoryStore';
import type { OffPlanDealState, SecondaryDealState } from '@/types/pipeline';

const SUPABASE_NOTE =
  'Replace this in-memory call with a Supabase update using SUPABASE_URL/SUPABASE_ANON_KEY.';

type ApiRequest = {
  method?: string;
  body?: {
    dealId?: string;
    targetState?: OffPlanDealState | SecondaryDealState;
    deadReason?: string | null;
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

  if (!req.body?.dealId || !req.body.targetState) {
    res.status(400).json({ error: 'dealId and targetState are required' });
    return;
  }

  try {
    // TODO: Replace with Supabase update using SUPABASE_URL/SUPABASE_ANON_KEY.
    const deal = updateDealStage({
      dealId: req.body.dealId,
      targetState: req.body.targetState,
      deadReason: req.body.deadReason ?? null,
      notes: req.body.notes ?? null,
    });

    res.status(200).json({ deal, note: SUPABASE_NOTE });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
