import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { speakerInputSchema } from '@/lib/validation/schemas';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const speakers = await db.getSpeakers();
    return NextResponse.json({ success: true, speakers });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const body = await req.json();
    const validated = speakerInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, errors: validated.error.format() }, { status: 400 });
    }

    const speaker = await db.addSpeaker(validated.data);
    return NextResponse.json({ success: true, speaker });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
