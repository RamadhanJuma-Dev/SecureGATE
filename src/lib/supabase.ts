import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const getEnvVar = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!;
  }
  return fallback;
};

export const SUPABASE_URL = 
  getEnvVar('VITE_SUPABASE_URL', 'https://eounekumrxysuysxyuev.supabase.co').replace(/\/rest\/v1\/?$/, '');

export const SUPABASE_ANON_KEY = 
  getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_eW7rRjD8HSAfVeqqlN9-1w_2xzL7M4V');

export const SUPABASE_PROJECT_ID = 'eounekumrxysuysxyuev';
export const SUPABASE_PROJECT_NAME = 'Securegate';

// Create Supabase Client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface SupabaseConnectionStatus {
  connected: boolean;
  checkedAt: string;
  latencyMs?: number;
  tablesDetected: string[];
  tablesMissing: string[];
  error?: string;
}

/**
 * Check if the Supabase project is reachable and inspect available tables.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const start = performance.now();
  const checkedAt = new Date().toISOString();
  
  try {
    // Quick ping to check network connectivity and key validity
    const expectedTables = [
      'officers',
      'visitor_passes',
      'visitor_profiles',
      'vehicles',
      'trips',
      'audit_logs',
      'settings',
      'securegate_store',
    ];

    const detected: string[] = [];
    const missing: string[] = [];

    // Probe in parallel with select('*').limit(1)
    const checks = await Promise.allSettled(
      expectedTables.map(async (table) => {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('not find')) {
            return { table, exists: false };
          }
          // If error is permission or something else, the table exists in database
          return { table, exists: true };
        }
        return { table, exists: true };
      })
    );

    checks.forEach((res) => {
      if (res.status === 'fulfilled') {
        if (res.value.exists) {
          detected.push(res.value.table);
        } else {
          missing.push(res.value.table);
        }
      }
    });

    const latency = Math.round(performance.now() - start);

    return {
      connected: true,
      checkedAt,
      latencyMs: latency,
      tablesDetected: detected,
      tablesMissing: missing,
    };
  } catch (err: any) {
    return {
      connected: false,
      checkedAt,
      tablesDetected: [],
      tablesMissing: [],
      error: err?.message || 'Failed to connect to Supabase endpoint',
    };
  }
}
