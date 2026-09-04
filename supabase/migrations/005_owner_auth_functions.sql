-- ==============================================================================
-- VRYS CRM — Migration 005: Owner Stored Procedures & Security RPCs
-- Description: Stored procedures for audit logging, token validation, and profile state.
-- ==============================================================================

-- 1. Security Definer Event Logger
CREATE OR REPLACE FUNCTION public.log_owner_security_event(
    p_event_type TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_event_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    INSERT INTO public.owner_security_events (
        user_id,
        event_type,
        ip_address,
        user_agent,
        metadata,
        created_at
    ) VALUES (
        v_user_id,
        p_event_type,
        CASE WHEN p_ip_address IS NOT NULL AND p_ip_address != '' THEN p_ip_address::inet ELSE NULL END,
        p_user_agent,
        COALESCE(p_metadata, '{}'::jsonb),
        NOW()
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_owner_security_event(TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;


-- 2. Owner Auth Status & Profile Verifier
CREATE OR REPLACE FUNCTION public.get_owner_auth_profile()
RETURNS TABLE (
    user_id UUID,
    role TEXT,
    primary_email TEXT,
    is_active BOOLEAN,
    mfa_required BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.user_id,
        pa.role,
        pa.primary_email,
        pa.is_active,
        pa.mfa_required,
        pa.created_at
    FROM public.platform_admins pa
    WHERE pa.user_id = auth.uid()
      AND pa.role = 'SUPER_ADMIN'
      AND pa.is_active = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_owner_auth_profile() TO authenticated;


-- 3. Atomic Recovery Token Verifier (For server/service_role usage)
CREATE OR REPLACE FUNCTION public.verify_and_consume_recovery_token(
    p_token_hash TEXT
)
RETURNS TABLE (
    valid BOOLEAN,
    user_id UUID,
    primary_email TEXT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- Look for non-expired, unused token
    SELECT 
        ort.id,
        ort.user_id,
        ort.expires_at,
        ort.used_at,
        pa.primary_email,
        pa.is_active
    INTO v_record
    FROM public.owner_recovery_tokens ort
    JOIN public.platform_admins pa ON pa.user_id = ort.user_id
    WHERE ort.token_hash = p_token_hash;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Invalid or non-existent recovery token.'::TEXT;
        RETURN;
    END IF;

    IF v_record.used_at IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Recovery token has already been used.'::TEXT;
        RETURN;
    END IF;

    IF v_record.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Recovery token has expired (valid for 20 minutes).'::TEXT;
        RETURN;
    END IF;

    IF NOT v_record.is_active THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Owner account is currently deactivated.'::TEXT;
        RETURN;
    END IF;

    -- Mark token as consumed atomically
    UPDATE public.owner_recovery_tokens
    SET used_at = NOW()
    WHERE id = v_record.id;

    -- Return success with associated admin details
    RETURN QUERY SELECT TRUE, v_record.user_id, v_record.primary_email, 'Token verified successfully.'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_and_consume_recovery_token(TEXT) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_recovery_token(TEXT) TO service_role;
