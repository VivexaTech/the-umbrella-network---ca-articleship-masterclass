import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = contactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.format() },
        { status: 400 }
      );
    }

    const submission = await db.addContactMessage(validated.data);
    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you shortly.',
      id: submission.id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
