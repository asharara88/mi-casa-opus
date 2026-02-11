-- Add RoleChange to approval_type enum
ALTER TYPE public.approval_type ADD VALUE IF NOT EXISTS 'RoleChange';
