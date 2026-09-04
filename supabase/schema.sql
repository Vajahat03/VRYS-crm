-- ==============================================================================
-- VRYS CRM — Production Supabase PostgreSQL Schema & Multi-Tenant RLS
-- Version: 1.0.0
-- Architecture: Multi-Tenant Tenant-Isolated Business Operating System
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Master Tenant & User Directory Tables
-- ==============================================================================

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    tax_number VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'trial' CHECK (plan IN ('trial', 'monthly', 'yearly', 'free_granted', 'expired')),
    trial_start_date TIMESTAMPTZ DEFAULT NOW(),
    trial_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    paid_start_date TIMESTAMPTZ,
    paid_end_date TIMESTAMPTZ,
    is_suspended BOOLEAN DEFAULT FALSE,
    max_users INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users & Role Hierarchy
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'COMPANY_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT', 'TELECALLER', 'OPERATOR')),
    role_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-Approved VIP Access Whitelist
CREATE TABLE IF NOT EXISTS public.pre_approved_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    access_days INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. Core CRM Tables (Companies, Contacts, Customers, Leads, Deals)
-- ==============================================================================

-- Companies / Business Accounts
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    gstin VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (Relational individual directory)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    designation VARCHAR(100),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Master Record (360° Profile)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    customer_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    gstin VARCHAR(50),
    tags TEXT[],
    total_jobs INTEGER DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Pipeline
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'Direct',
    interested_service VARCHAR(255),
    estimated_value NUMERIC(12, 2) DEFAULT 0.00,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    owner_id UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost')),
    ai_score INTEGER DEFAULT 50,
    ai_score_reason TEXT,
    loss_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals Pipeline (Multi-Pipeline)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pipeline_type VARCHAR(50) DEFAULT 'Retail Service' CHECK (pipeline_type IN ('Retail Service', 'B2B Corporate', 'Digital Solutions')),
    title VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stage VARCHAR(50) DEFAULT 'Discovery' CHECK (stage IN ('Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost')),
    probability INTEGER DEFAULT 50,
    expected_close_date DATE,
    assigned_to UUID REFERENCES public.users(id),
    loss_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Operations & Document Vault Tables
-- ==============================================================================

-- 8-Stage Operational Jobs (Al Uzer Lifecycle)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    stage VARCHAR(50) DEFAULT 'Pending' CHECK (stage IN (
        'Pending', 'Document Required', 'In Progress', 'Al Uzer', 'Ready', 'Delivered', 'Completed', 'Cancelled'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES public.users(id),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    work_expense NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    service_profit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_date DATE,
    notes TEXT,
    document_checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Vault
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Passport', 'Government ID', 'Vehicle RC', 'GST Certificate', 'Property Deed', 'General')),
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    expiry_date DATE,
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. Finance, Quotes, Invoices, Payments, Expenses & Kirkol POS
-- ==============================================================================

-- Quotes & Proforma Invoices
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Sent' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Official Tax Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Sent' CHECK (status IN ('Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Collected
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    receipt_number VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('Cash', 'UPI', 'Card', 'Bank Transfer', 'Other')),
    reference VARCHAR(100),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Overhead Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kirkol / Counter POS Fast Sales
CREATE TABLE IF NOT EXISTS public.kirkol_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    customer_name VARCHAR(255) DEFAULT 'Counter Walk-in',
    customer_phone VARCHAR(50),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. Productivity, Tasks, Support Tickets, Activity & Audit
-- ==============================================================================

-- Tasks & Follow-ups
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.users(id),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
    due_date TIMESTAMPTZ,
    related_type VARCHAR(50),
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets (SLA Escalations)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'high' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    assigned_to UUID REFERENCES public.users(id),
    sla_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform-Wide Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. Database Triggers & Functions
-- ==============================================================================

-- Trigger: Automatically calculate job margin (Service Profit = Total Amount - Work Expense)
CREATE OR REPLACE FUNCTION public.fn_calculate_job_margin()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance_amount := NEW.total_amount - NEW.paid_amount;
    NEW.service_profit := NEW.total_amount - NEW.work_expense;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_job_margin ON public.jobs;
CREATE TRIGGER trg_calculate_job_margin
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_job_margin();

-- Trigger: Automatically update customer balance and stats on new invoice
CREATE OR REPLACE FUNCTION public.fn_update_customer_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.customers
    SET balance_amount = (
        SELECT COALESCE(SUM(balance_amount), 0) FROM public.invoices WHERE customer_id = NEW.customer_id
    ),
    updated_at = NOW()
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_customer_on_invoice ON public.invoices;
CREATE TRIGGER trg_update_customer_on_invoice
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.fn_update_customer_on_invoice();

-- ==============================================================================
-- 8. Row Level Security (RLS) Multi-Tenant Policies
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kirkol_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current tenant from session
CREATE OR REPLACE FUNCTION public.get_current_tenant()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_org_id', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;

-- RLS Policy: Customers
CREATE POLICY rls_customers_tenant_isolation ON public.customers
    FOR ALL
    USING (organization_id = public.get_current_tenant() OR current_setting('app.is_super_admin', TRUE) = 'true');

-- RLS Policy: Jobs
CREATE POLICY rls_jobs_tenant_isolation ON public.jobs
    FOR ALL
    USING (organization_id = public.get_current_tenant() OR current_setting('app.is_super_admin', TRUE) = 'true');

-- RLS Policy: Invoices
CREATE POLICY rls_invoices_tenant_isolation ON public.invoices
    FOR ALL
    USING (organization_id = public.get_current_tenant() OR current_setting('app.is_super_admin', TRUE) = 'true');

-- RLS Policy: Documents
CREATE POLICY rls_documents_tenant_isolation ON public.documents
    FOR ALL
    USING (organization_id = public.get_current_tenant() OR current_setting('app.is_super_admin', TRUE) = 'true');

-- ==============================================================================
-- 9. VRYS Platform Owner & SUPER_ADMIN Authentication Layer
-- Security Architecture: Supabase Auth authenticates -> Postgres RLS authorizes
-- ==============================================================================

-- Dedicated Platform Admin Directory (Independent from tenant users)
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

CREATE INDEX IF NOT EXISTS idx_platform_admins_primary_email 
ON public.platform_admins(primary_email);

-- Owner Recovery Tokens Table (SHA-256 Single-Use 20-min tokens)
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

CREATE INDEX IF NOT EXISTS idx_owner_recovery_tokens_hash 
ON public.owner_recovery_tokens(token_hash);

-- Owner Security Events Audit Trail
CREATE TABLE IF NOT EXISTS public.owner_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_security_events_user_time 
ON public.owner_security_events(user_id, created_at DESC);

-- Enable RLS on platform owner tables
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_recovery_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_security_events ENABLE ROW LEVEL SECURITY;

-- Security Definer Function: is_platform_admin()
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

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;

-- RLS Policies on platform_admins
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

-- RLS Policies on organizations for SUPER_ADMIN
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

-- RLS Policy on security events
DROP POLICY IF EXISTS "Owner can read own security events" ON public.owner_security_events;
CREATE POLICY "Owner can read own security events"
ON public.owner_security_events
FOR SELECT
TO authenticated
USING (
  public.is_platform_admin()
  AND (user_id = (SELECT auth.uid()) OR user_id IS NULL)
);

-- ==============================================================================
-- 10. Platform Owner Security Stored Procedures & Helper RPCs
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

    UPDATE public.owner_recovery_tokens
    SET used_at = NOW()
    WHERE id = v_record.id;

    RETURN QUERY SELECT TRUE, v_record.user_id, v_record.primary_email, 'Token verified successfully.'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_and_consume_recovery_token(TEXT) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_recovery_token(TEXT) TO service_role;

-- ==============================================================================
-- End of VRYS CRM Master PostgreSQL Schema
-- ==============================================================================
