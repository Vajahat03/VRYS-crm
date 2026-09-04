-- ==============================================================================
-- VRYS CRM — Migration 001: Platform Admin Schema
-- Description: Creates the dedicated platform_admins table for Super Admin/Owner.
-- Security Principle: Authentication resides in auth.users; role and profile reside here.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.platform_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role = 'SUPER_ADMIN'),
    primary_email TEXT NOT NULL UNIQUE,
    recovery_email TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    mfa_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for primary email lookup
CREATE INDEX IF NOT EXISTS idx_platform_admins_primary_email 
ON public.platform_admins(primary_email);

-- Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platform_admins_updated_at ON public.platform_admins;
CREATE TRIGGER trg_platform_admins_updated_at
BEFORE UPDATE ON public.platform_admins
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Enable Row Level Security immediately
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
