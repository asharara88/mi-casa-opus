import { createProspect } from '@/server/api/inMemoryStore';

const SUPABASE_NOTE =
  'Replace this in-memory call with a Supabase insert using SUPABASE_URL/SUPABASE_ANON_KEY.';

type ApiRequest = {
  method?: string;
  body?: {
    full_name?: string;
    email?: string | null;
    phone?: string | null;
    source?: string | null;
    outreach_status?: string;
    [key: string]: unknown;
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

  if (!req.body?.full_name) {
    res.status(400).json({ error: 'full_name is required' });
    return;
  }

  // TODO: Replace with Supabase insert using SUPABASE_URL/SUPABASE_ANON_KEY.
  const prospect = createProspect(req.body);

  res.status(201).json({ prospect, note: SUPABASE_NOTE });
}
