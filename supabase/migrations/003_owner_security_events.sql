-- ==============================================================================
-- VRYS CRM — Migration 003: Owner Security Audit Events
-- Description: Immutable security event log for SUPER_ADMIN actions.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.owner_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'OWNER_LOGIN_SUCCESS',
            'OWNER_LOGIN_FAILURE',
            'OWNER_LOGOUT',
            'PASSWORD_RESET_REQUEST',
            'PASSWORD_RESET_SUCCESS',
            'PASSWORD_CHANGED',
            'MFA_CHALLENGE_ISSUED',
            'MFA_VERIFIED',
            'MFA_ENABLED',
            'MFA_DISABLED',
            'RECOVERY_EMAIL_CHANGED',
            'OWNER_ACCOUNT_DISABLED',
            'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT'
        )
    ),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying security timeline
CREATE INDEX IF NOT EXISTS idx_owner_security_events_user_time 
ON public.owner_security_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_owner_security_events_type 
ON public.owner_security_events(event_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.owner_security_events ENABLE ROW LEVEL SECURITY;
