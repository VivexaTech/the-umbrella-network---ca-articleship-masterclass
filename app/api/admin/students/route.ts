import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || undefined;
    const batchId = searchParams.get('batchId') || undefined;
    const status = searchParams.get('status') || undefined;

    const registrations = await db.getRegistrations({ search, batchId, status });
    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
