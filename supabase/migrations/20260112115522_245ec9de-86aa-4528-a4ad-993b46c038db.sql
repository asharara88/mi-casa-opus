-- Create lost_reason enum
CREATE TYPE public.lost_reason AS ENUM (
  'NoContact',
  'NotQualified', 
  'BudgetMismatch',
  'TimelineMismatch',
  'ChoseCompetitor',
  'PropertyUnavailable',
  'FinancingFailed',
  'ClientWithdrew',
  'DuplicateLead',
  'Other'
);

-- Add lost_reason column to leads table
ALTER TABLE public.leads 
ADD COLUMN lost_reason public.lost_reason NULL,
ADD COLUMN lost_reason_notes TEXT NULL,
ADD COLUMN lost_at TIMESTAMP WITH TIME ZONE NULL;

-- Add lost_reason column to deals table
ALTER TABLE public.deals 
ADD COLUMN lost_reason public.lost_reason NULL,
ADD COLUMN lost_reason_notes TEXT NULL,
ADD COLUMN lost_at TIMESTAMP WITH TIME ZONE NULL;