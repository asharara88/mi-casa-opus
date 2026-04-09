import { createClient } from '@supabase/supabase-js';

const EXTERNAL_URL = 'https://dhwppkevuquwtavvqaan.supabase.co';
const EXTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRod3Bwa2V2dXF1d3RhdnZxYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTM3MzYsImV4cCI6MjA5MTI4OTczNn0.5YJVwbA_HFziSr1WPcRRmq_FW5NR-XLXLUURwrTcvac';

export const externalSupabase = createClient(EXTERNAL_URL, EXTERNAL_ANON_KEY);

export const EXTERNAL_STORAGE_URL = `${EXTERNAL_URL}/storage/v1/object/public`;
