import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { emailService } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const emails = emailService.getSentEmails();
    const status = emailService.getStatus();
    return NextResponse.json({ success: true, emails, status });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
