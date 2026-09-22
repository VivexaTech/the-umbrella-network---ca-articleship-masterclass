import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('q') || searchParams.get('id') || '';

    if (!query) {
      return NextResponse.json({ success: false, error: 'Registration number or ID required' }, { status: 400 });
    }

    const reg = await db.getRegistrationById(query);
    if (!reg) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    // Mask sensitive details
    return NextResponse.json({
      success: true,
      registration: {
        registrationNumber: reg.registration_number,
        studentName: reg.student_name,
        batchNumber: reg.batch_number,
        batchDate: reg.batch_date,
        status: reg.status,
        paymentMethod: reg.payment_method,
        createdAt: reg.created_at,
        whatsappLink: reg.status === 'confirmed' ? reg.whatsapp_link : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
