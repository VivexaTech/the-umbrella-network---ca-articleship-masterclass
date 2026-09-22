import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdminAuth(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Payment could not be verified in bank statement.';

    const result = await db.rejectUpiRegistration(id, reason);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to reject registration' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration marked as rejected.',
      registration: result.registration,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
