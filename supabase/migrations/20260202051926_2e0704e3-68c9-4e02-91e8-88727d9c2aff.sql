-- Add feedback columns to viewing_bookings (for ViewingCompletionDialog)
ALTER TABLE viewing_bookings ADD COLUMN feedback_score INTEGER;
ALTER TABLE viewing_bookings ADD COLUMN feedback_notes TEXT;

-- Add document linking columns to generated_documents (for Evidence integration)
ALTER TABLE generated_documents ADD COLUMN deal_id UUID REFERENCES deals(id);
ALTER TABLE generated_documents ADD COLUMN lead_id UUID REFERENCES leads(id);
ALTER TABLE generated_documents ADD COLUMN evidence_type TEXT;
ALTER TABLE generated_documents ADD COLUMN content_hash TEXT;

-- Add index for faster evidence queries
CREATE INDEX idx_generated_documents_deal_id ON generated_documents(deal_id);
CREATE INDEX idx_generated_documents_lead_id ON generated_documents(lead_id);