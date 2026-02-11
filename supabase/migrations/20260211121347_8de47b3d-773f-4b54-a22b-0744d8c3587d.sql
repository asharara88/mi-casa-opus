-- Add UserApproval to approval_type enum for new user approval flow
ALTER TYPE public.approval_type ADD VALUE IF NOT EXISTS 'UserApproval';
