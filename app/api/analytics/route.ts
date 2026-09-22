import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const batches = await db.getBatches(false);
    const registrations = await db.getRegistrations();
    const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length;
    const totalBookedSeats = batches.reduce((acc, b) => acc + (b.seats_booked || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudentsGuided: 500 + confirmedCount,
        confirmedRegistrations: confirmedCount,
        activeBatches: batches.filter((b) => b.status === 'active').length,
        totalSeatsBooked: totalBookedSeats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
