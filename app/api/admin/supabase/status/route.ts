import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const configured = isSupabaseConfigured();
    const supabase = getSupabaseServerClient();

    let tableStatus: Record<string, boolean> = {};
    let connected = false;
    let errorMessage: string | null = null;

    if (configured && supabase) {
      try {
        const { error } = await supabase.from('batches').select('id').limit(1);
        if (!error) {
          connected = true;
          tableStatus = {
            batches: true,
            students: true,
            registrations: true,
            payments: true,
            payment_webhooks: true,
            resource_access: true,
            speakers: true,
            testimonials: true,
            site_settings: true,
            audit_logs: true,
          };
        } else {
          errorMessage = error.message;
        }
      } catch (err: any) {
        errorMessage = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      configured,
      connected,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not specified',
      tables: tableStatus,
      errorMessage,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
