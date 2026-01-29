import { createDeal } from '@/server/api/inMemoryStore';
import type { DealPipeline } from '@/types/pipeline';

const SUPABASE_NOTE =
  'Replace this in-memory call with a Supabase insert using SUPABASE_URL/SUPABASE_ANON_KEY.';

type ApiRequest = {
  method?: string;
  body?: {
    pipeline?: DealPipeline;
    deal_type?: string;
    side?: string;
    linked_lead_id?: string | null;
    developer_id?: string | null;
    developer_project_id?: string | null;
    developer_project_name?: string | null;
    listing_id?: string | null;
    deal_economics?: unknown;
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

  if (!req.body?.pipeline || !req.body.deal_type || !req.body.side) {
    res.status(400).json({ error: 'pipeline, deal_type, and side are required' });
    return;
  }

  // TODO: Replace with Supabase insert using SUPABASE_URL/SUPABASE_ANON_KEY.
  const deal = createDeal({
    pipeline: req.body.pipeline,
    deal_type: req.body.deal_type,
    side: req.body.side,
    linked_lead_id: req.body.linked_lead_id ?? null,
    developer_id: req.body.developer_id ?? null,
    developer_project_id: req.body.developer_project_id ?? null,
    developer_project_name: req.body.developer_project_name ?? null,
    listing_id: req.body.listing_id ?? null,
    deal_economics: req.body.deal_economics ?? null,
    notes: req.body.notes ?? null,
  });

  res.status(201).json({ deal, note: SUPABASE_NOTE });
}
