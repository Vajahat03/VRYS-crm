-- ==============================================================================
-- VRYS CRM — Migration 002: Owner Recovery Tokens Table
-- Description: Stores SHA-256 hashed single-use recovery tokens for Owner password resets.
-- Security Principle: Never store raw tokens; enforce strict expiration & one-time use.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.owner_recovery_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.platform_admins(user_id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_owner_recovery_tokens_hash 
ON public.owner_recovery_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_owner_recovery_tokens_user_expires 
ON public.owner_recovery_tokens(user_id, expires_at);

-- Enable RLS: Locked down entirely from client/browser anon/auth users
ALTER TABLE public.owner_recovery_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all direct access to client users; accessible only via SECURITY DEFINER functions or server-side service role
REVOKE ALL ON public.owner_recovery_tokens FROM anon, authenticated;
