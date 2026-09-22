import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Registration } from '../src/types.js';

// Configuration initialized with the user's provided credentials and fallback env variables
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'ohvjnllfxnalvtwzcxkm';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_wiNvqCTIyNxUmg3HPaq7Wg_SssdoiQW';

export interface SupabaseEnrollmentRecord {
  id: string;
  registration_number: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  ca_level: string;
  attempt_details?: string;
  batch_id: string;
  batch_number: string;
  batch_name: string;
  batch_date: string;
  amount: number;
  payment_id: string;
  order_id?: string;
  payment_status: string;
  created_at: string;
}

export const SQL_SETUP_SCRIPT = `-- =======================================================
-- THE UMBRELLA NETWORK: SUPABASE ENROLLMENTS SCHEMA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql
-- =======================================================

-- 1. Create the enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id TEXT PRIMARY KEY,
    registration_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    ca_level TEXT,
    attempt_details TEXT DEFAULT '',
    batch_id TEXT,
    batch_number TEXT,
    batch_name TEXT,
    batch_date TEXT,
    amount NUMERIC DEFAULT 999,
    payment_id TEXT,
    order_id TEXT,
    payment_status TEXT DEFAULT 'successful',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) and permit anonymous inserts & queries
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert into enrollments"
ON public.enrollments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow read enrollments"
ON public.enrollments
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. (Optional) Mirror table for 'registrations' alias
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    registration_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    ca_level TEXT,
    batch_number TEXT,
    batch_name TEXT,
    batch_date TEXT,
    amount NUMERIC DEFAULT 999,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert into registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow read registrations"
ON public.registrations
FOR SELECT
TO anon, authenticated
USING (true);
`;

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Test Supabase connectivity and verify available tables
   */
  public async testConnection(): Promise<{
    connected: boolean;
    projectId: string;
    supabaseUrl: string;
    tablesFound: { enrollments: boolean; registrations: boolean };
    error?: string;
    details?: string;
  }> {
    try {
      // Test enrollments table
      const enrollRes = await this.client.from('enrollments').select('id').limit(1);
      const regRes = await this.client.from('registrations').select('id').limit(1);

      const enrollmentsExist = !enrollRes.error;
      const registrationsExist = !regRes.error;

      // Even if tables don't exist yet (PGRST205), HTTP reachability to Supabase is verified
      const isEndpointReachable =
        (enrollRes.status === 200 || enrollRes.status === 404 || enrollRes.status === 406 || !enrollRes.error) &&
        enrollRes.status !== 0;

      let errorMsg: string | undefined = undefined;
      let details = 'Connected to Supabase endpoint successfully.';

      if (!enrollmentsExist && !registrationsExist) {
        details =
          'Connected to Supabase project, but tables "enrollments" or "registrations" have not been created yet in SQL editor.';
      } else {
        details = `Connected to Supabase! Active tables: ${[
          enrollmentsExist ? 'enrollments' : null,
          registrationsExist ? 'registrations' : null,
        ]
          .filter(Boolean)
          .join(', ')}`;
      }

      if (enrollRes.error && enrollRes.error.code !== 'PGRST205') {
        errorMsg = enrollRes.error.message;
      }

      return {
        connected: isEndpointReachable,
        projectId: SUPABASE_PROJECT_ID,
        supabaseUrl: SUPABASE_URL,
        tablesFound: {
          enrollments: enrollmentsExist,
          registrations: registrationsExist,
        },
        error: errorMsg,
        details,
      };
    } catch (err: any) {
      return {
        connected: false,
        projectId: SUPABASE_PROJECT_ID,
        supabaseUrl: SUPABASE_URL,
        tablesFound: { enrollments: false, registrations: false },
        error: err.message || 'Failed to communicate with Supabase',
        details: 'Network error or invalid Supabase project configuration.',
      };
    }
  }

  /**
   * Save an enrollment record to Supabase
   */
  public async saveEnrollment(record: SupabaseEnrollmentRecord): Promise<{
    success: boolean;
    tableUsed?: string;
    error?: string;
    inserted?: any;
  }> {
    try {
      // 1. Try inserting into 'enrollments'
      const { data: enrollData, error: enrollError } = await this.client
        .from('enrollments')
        .upsert(record, { onConflict: 'id' })
        .select();

      if (!enrollError) {
        console.log(`[Supabase] Successfully saved enrollment ${record.registration_number} to "enrollments" table`);
        return { success: true, tableUsed: 'enrollments', inserted: enrollData };
      }

      // If 'enrollments' table doesn't exist, try 'registrations' table
      if (enrollError.code === 'PGRST205' || enrollError.message.includes('Could not find the table')) {
        const altRecord = {
          id: record.id,
          registration_number: record.registration_number,
          student_name: record.student_name,
          student_email: record.student_email,
          student_phone: record.student_phone,
          ca_level: record.ca_level,
          batch_number: record.batch_number,
          batch_name: record.batch_name,
          batch_date: record.batch_date,
          amount: record.amount,
          payment_id: record.payment_id,
          created_at: record.created_at,
        };

        const { data: regData, error: regError } = await this.client
          .from('registrations')
          .upsert(altRecord, { onConflict: 'id' })
          .select();

        if (!regError) {
          console.log(`[Supabase] Successfully saved registration ${record.registration_number} to "registrations" table`);
          return { success: true, tableUsed: 'registrations', inserted: regData };
        }

        console.warn(
          `[Supabase] Note: Neither "enrollments" nor "registrations" tables exist yet in Supabase project ${SUPABASE_PROJECT_ID}. Run the provided SQL migration in Supabase SQL editor.`
        );
        return {
          success: false,
          error: `Table "enrollments" does not exist yet in Supabase schema. Run the SQL script in Supabase SQL Editor.`,
        };
      }

      console.error('[Supabase] Error inserting enrollment:', enrollError.message);
      return { success: false, error: enrollError.message };
    } catch (err: any) {
      console.error('[Supabase] Exception saving enrollment:', err);
      return { success: false, error: err.message || 'Unknown Supabase error' };
    }
  }

  /**
   * Sync all local registrations into Supabase
   */
  public async syncAll(
    registrations: Registration[],
    attemptDetailsMap?: Record<string, string>
  ): Promise<{
    total: number;
    synced: number;
    failed: number;
    errors: string[];
    tableUsed?: string;
  }> {
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];
    let activeTable: string | undefined = undefined;

    for (const reg of registrations) {
      const record: SupabaseEnrollmentRecord = {
        id: reg.id,
        registration_number: reg.registration_number,
        student_name: reg.student_name,
        student_email: reg.student_email,
        student_phone: reg.student_phone,
        ca_level: reg.ca_level,
        attempt_details: (attemptDetailsMap && attemptDetailsMap[reg.student_id]) || '',
        batch_id: reg.batch_id,
        batch_number: reg.batch_number,
        batch_name: reg.batch_name,
        batch_date: reg.batch_date,
        amount: reg.amount,
        payment_id: reg.payment_id,
        payment_status: 'successful',
        created_at: reg.created_at,
      };

      const result = await this.saveEnrollment(record);
      if (result.success) {
        synced++;
        if (result.tableUsed) activeTable = result.tableUsed;
      } else {
        failed++;
        if (result.error && !errors.includes(result.error)) {
          errors.push(result.error);
        }
      }
    }

    return {
      total: registrations.length,
      synced,
      failed,
      errors,
      tableUsed: activeTable,
    };
  }

  /**
   * Fetch all enrollments directly from Supabase
   */
  public async fetchEnrollments(): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const { data, error } = await this.client
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { success: true, data };
      }

      // Try registrations
      const { data: regData, error: regError } = await this.client
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!regError && regData) {
        return { success: true, data: regData };
      }

      return { success: false, data: [], error: error?.message || regError?.message };
    } catch (err: any) {
      return { success: false, data: [], error: err.message };
    }
  }
}

export const supabaseService = new SupabaseService();
