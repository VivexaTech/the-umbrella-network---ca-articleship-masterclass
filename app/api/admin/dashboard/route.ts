import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);

    const [batches, registrations, contacts, auditLogs] = await Promise.all([
      db.getBatches(true),
      db.getRegistrations(),
      db.getContactMessages(),
      db.getAuditLogs(),
    ]);

    const confirmedRegistrations = registrations.filter((r) => r.status === 'confirmed');
    const pendingUpiRegistrations = registrations.filter((r) => r.status === 'pending_verification');
    const totalRevenue = confirmedRegistrations.reduce((acc, r) => acc + (r.amount || 999), 0);
    const activeBatch = batches.find((b) => b.status === 'active') || batches[0] || null;

    const checkoutStarts = Math.max(registrations.length + 12, 1);
    const conversionRate = `${Math.min(100, Math.round((confirmedRegistrations.length / checkoutStarts) * 100))}%`;

    const overview = {
      totalRegistrations: registrations.length,
      totalRevenue,
      successfulPayments: confirmedRegistrations.length,
      currentBatch: activeBatch,
      conversionRate,
      checkoutStarts,
    };

    return NextResponse.json({
      success: true,
      overview,
      stats: {
        totalRegistrations: registrations.length,
        confirmedCount: confirmedRegistrations.length,
        pendingUpiCount: pendingUpiRegistrations.length,
        totalRevenue,
        activeBatchesCount: batches.filter((b) => b.status === 'active').length,
        totalContactsCount: contacts.length,
      },
      recentRegistrations: registrations.slice(0, 10),
      recentAuditLogs: auditLogs.slice(0, 15),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
