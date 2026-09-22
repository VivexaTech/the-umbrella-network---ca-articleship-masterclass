import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailService } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdminAuth(req);
    const { id } = await params;

    const result = await db.approveUpiRegistration(id);
    if (!result.success || !result.registration) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to approve registration' }, { status: 400 });
    }

    const reg = result.registration;

    // Generate secure resource access token
    const token = await db.createResourceAccess(reg.id, reg.student_id);
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const driveResourcesLink = `${origin}/api/resources/${token}`;

    // Send confirmation email
    await emailService.sendRegistrationAcknowledgment({
      studentName: reg.student_name,
      studentEmail: reg.student_email,
      batchNumber: reg.batch_number,
      batchName: reg.batch_name,
      batchDate: reg.batch_date,
      registrationNumber: reg.registration_number,
      paymentId: reg.upi_utr ? `UPI-${reg.upi_utr}` : reg.id,
      amount: reg.amount,
      whatsappLink: reg.whatsapp_link || '',
      driveResourcesLink,
      resourceAccessToken: token,
    });

    return NextResponse.json({
      success: true,
      message: 'UPI payment verified, registration confirmed, and confirmation email dispatched.',
      registration: reg,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
