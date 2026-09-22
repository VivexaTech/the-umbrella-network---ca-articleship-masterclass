import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const body = await req.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json({ success: false, error: 'Registration ID required' }, { status: 400 });
    }

    const reg = await db.getRegistrationById(registrationId);
    if (!reg) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    const token = await db.createResourceAccess(reg.id, reg.student_id);
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const driveResourcesLink = `${origin}/api/resources/${token}`;

    const result = await emailService.sendRegistrationAcknowledgment({
      studentName: reg.student_name,
      studentEmail: reg.student_email,
      batchNumber: reg.batch_number,
      batchName: reg.batch_name,
      batchDate: reg.batch_date,
      registrationNumber: reg.registration_number,
      paymentId: reg.payment_id || reg.id,
      amount: reg.amount,
      whatsappLink: reg.whatsapp_link || '',
      driveResourcesLink,
      resourceAccessToken: token,
    });

    return NextResponse.json({
      success: true,
      message: `Enrollment email resent successfully to ${reg.student_email} in ${result.mode} mode.`,
      result,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
