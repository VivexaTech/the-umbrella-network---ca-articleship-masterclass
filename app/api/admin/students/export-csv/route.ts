import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const registrations = await db.getRegistrations();

    const headers = [
      'Registration Number',
      'Student Name',
      'Email',
      'Phone',
      'CA Level',
      'Batch Number',
      'Batch Name',
      'Status',
      'Payment Method',
      'Payment ID',
      'UPI UTR',
      'Amount (INR)',
      'Verified At',
      'Created At',
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = registrations.map((r) => [
      escapeCsv(r.registration_number),
      escapeCsv(r.student_name),
      escapeCsv(r.student_email),
      escapeCsv(r.student_phone),
      escapeCsv(r.ca_level),
      escapeCsv(r.batch_number),
      escapeCsv(r.batch_name),
      escapeCsv(r.status),
      escapeCsv(r.payment_method || 'Razorpay'),
      escapeCsv(r.payment_id || ''),
      escapeCsv(r.upi_utr || ''),
      escapeCsv(r.amount),
      escapeCsv(r.verified_at || ''),
      escapeCsv(r.created_at),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="umbrella_students_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
