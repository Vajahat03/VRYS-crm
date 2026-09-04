-- ==============================================================================
-- VRYS CRM — Migration 004: Owner Authorization & RLS Policies
-- Description: Creates is_platform_admin() security definer function and platform-level RLS policies.
-- Security Principle: Supabase Auth authenticates. Postgres RLS authorizes.
-- ==============================================================================

-- 1. Authorization Function: is_platform_admin()
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE user_id = (SELECT auth.uid())
      AND role = 'SUPER_ADMIN'
      AND is_active = true
  );
$$;

-- Secure function permissions: Only authenticated users may execute; anon cannot
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;


-- 2. RLS Policies on platform_admins
DROP POLICY IF EXISTS "SUPER_ADMIN can read own platform profile" ON public.platform_admins;
CREATE POLICY "SUPER_ADMIN can read own platform profile"
ON public.platform_admins
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND role = 'SUPER_ADMIN'
  AND is_active = true
);

-- Deny insert/update/delete on platform_admins directly from browser client
DROP POLICY IF EXISTS "Deny direct client modification of platform_admins" ON public.platform_admins;


-- 3. RLS Policies on organizations (Tenants)
DROP POLICY IF EXISTS "SUPER_ADMIN can manage organizations" ON public.organizations;
CREATE POLICY "SUPER_ADMIN can manage organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (
  public.is_platform_admin()
)
WITH CHECK (
  public.is_platform_admin()
);


-- 4. RLS Policies on owner_security_events
DROP POLICY IF EXISTS "Owner can read own security events" ON public.owner_security_events;
CREATE POLICY "Owner can read own security events"
ON public.owner_security_events
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin()
  AND (user_id = (SELECT auth.uid()) OR user_id IS NULL)
);

-- Deny client direct insert into security events; handled via RPC or server-side
REVOKE INSERT, UPDATE, DELETE ON public.owner_security_events FROM anon, authenticated;
