import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const speakers = await db.getSpeakers();
    return NextResponse.json({ success: true, speakers: speakers.filter((s) => s.status === 'active') });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
