import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const batch = await db.getActiveBatch(false);
    if (!batch) {
      return NextResponse.json({ success: false, error: 'No active batch found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
