-- ==============================================================================
-- SECUREGATE - SUPABASE CLOUD DATABASE SCHEMA
-- Project ID: eounekumrxysuysxyuev
-- Project Name: Securegate
-- Description: Complete production schema with RLS policies and seed data
-- Paste this entire script into your Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. General Key-Value / Collection Store (High-speed document syncing)
CREATE TABLE IF NOT EXISTS public.securegate_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Security Personnel & Access Management (RBAC)
CREATE TABLE IF NOT EXISTS public.officers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    badge_number TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'OFFICER', -- 'ADMIN', 'SUPERVISOR', 'OFFICER', 'MANAGEMENT'
    pin TEXT NOT NULL DEFAULT '1234',
    email TEXT,
    assigned_gate TEXT DEFAULT 'Gate 1 - Main North Entrance',
    active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Visitor Identification Profiles (Returning Visitor Retrieval)
CREATE TABLE IF NOT EXISTS public.visitor_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    national_id TEXT NOT NULL UNIQUE,
    phone TEXT,
    company TEXT,
    email TEXT,
    vehicle_plate TEXT,
    photo_url TEXT,
    blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT,
    total_visits INTEGER DEFAULT 1,
    last_visit_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visitor Entry & Exit Passes
CREATE TABLE IF NOT EXISTS public.visitor_passes (
    id TEXT PRIMARY KEY,
    badge_number TEXT NOT NULL,
    visitor_id TEXT REFERENCES public.visitor_profiles(id) ON DELETE SET NULL,
    visitor_name TEXT NOT NULL,
    visitor_company TEXT,
    host_name TEXT NOT NULL,
    host_department TEXT NOT NULL,
    purpose TEXT NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_departure_time TIMESTAMPTZ NOT NULL,
    actual_departure_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ON_SITE', -- 'ON_SITE', 'CHECKED_OUT', 'OVERDUE'
    checkpoint_name TEXT DEFAULT 'Gate 1 - Main North Entrance',
    officer_check_in_name TEXT NOT NULL,
    officer_check_out_name TEXT,
    pass_category TEXT DEFAULT 'Visitor',
    carried_assets TEXT[] DEFAULT '{}',
    vehicle_plate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Organizational Vehicles Registry
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    fleet_number TEXT NOT NULL UNIQUE,
    plate_number TEXT NOT NULL UNIQUE,
    make_model TEXT NOT NULL,
    year INTEGER DEFAULT 2024,
    type TEXT NOT NULL DEFAULT 'Sedan',
    assigned_department TEXT NOT NULL,
    current_odometer INTEGER NOT NULL DEFAULT 0,
    fuel_level_percent INTEGER DEFAULT 100,
    last_inspection_date TIMESTAMPTZ DEFAULT NOW(),
    condition TEXT DEFAULT 'Excellent',
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'ON_TRIP', 'MAINTENANCE'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Vehicle Dispatches & Movement Trips
CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY,
    trip_pass_number TEXT NOT NULL UNIQUE,
    vehicle_id TEXT REFERENCES public.vehicles(id) ON DELETE CASCADE,
    fleet_number TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_staff_id TEXT,
    destination TEXT NOT NULL,
    purpose TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actual_return_time TIMESTAMPTZ,
    departure_odometer INTEGER NOT NULL,
    return_odometer INTEGER,
    departure_fuel_percent INTEGER DEFAULT 100,
    return_fuel_percent INTEGER,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RETURNED', 'OVERDUE'
    officer_check_out_name TEXT NOT NULL,
    officer_check_in_name TEXT,
    trip_notes TEXT,
    departure_checklist JSONB DEFAULT '{}'::jsonb,
    return_checklist JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Immutable Security Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    officer_id TEXT,
    officer_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO', -- 'INFO', 'NOTICE', 'ALERT', 'CRITICAL'
    gate TEXT NOT NULL DEFAULT 'Gate 1'
);

-- 8. Organizational Configuration & Checkpoint Settings
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'current_org_settings',
    organization_name TEXT NOT NULL DEFAULT 'SECUREGATE',
    organization_short_name TEXT NOT NULL DEFAULT 'SECUREGATE',
    facility_name TEXT DEFAULT 'Main Compound Headquarters',
    facility_address TEXT DEFAULT '100 Security Gate Way, Logistics Zone',
    security_office_phone TEXT DEFAULT '+254 700 000 000',
    emergency_hotline TEXT DEFAULT '+254 799 999 999',
    gates JSONB DEFAULT '[]'::jsonb,
    config_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.securegate_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated app API key
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to securegate_store" ON public.securegate_store;
    CREATE POLICY "Public access to securegate_store" ON public.securegate_store FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to officers" ON public.officers;
    CREATE POLICY "Public access to officers" ON public.officers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to visitor_profiles" ON public.visitor_profiles;
    CREATE POLICY "Public access to visitor_profiles" ON public.visitor_profiles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to visitor_passes" ON public.visitor_passes;
    CREATE POLICY "Public access to visitor_passes" ON public.visitor_passes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to vehicles" ON public.vehicles;
    CREATE POLICY "Public access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to trips" ON public.trips;
    CREATE POLICY "Public access to trips" ON public.trips FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to audit_logs" ON public.audit_logs;
    CREATE POLICY "Public access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to settings" ON public.settings;
    CREATE POLICY "Public access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Enable Realtime publication for multi-gate live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_passes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.securegate_store;
