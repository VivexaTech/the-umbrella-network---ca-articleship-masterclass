import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { testimonialInputSchema } from '@/lib/validation/schemas';

export async function GET(req: NextRequest) {
  try {
    requireAdminAuth(req);
    const testimonials = await db.getTestimonials(true);
    return NextResponse.json({ success: true, testimonials });
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
    const validated = testimonialInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, errors: validated.error.format() }, { status: 400 });
    }

    const item = await db.addTestimonial(validated.data);
    return NextResponse.json({ success: true, testimonial: item });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
