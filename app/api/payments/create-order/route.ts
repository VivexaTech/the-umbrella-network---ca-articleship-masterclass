import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/razorpay';
import { createOrderSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validated.error.format() },
        { status: 400 }
      );
    }

    const { batchId, fullName, email, phone, caLevel, attemptDetails } = validated.data;

    // 1. Fetch batch directly from database
    const batch = await db.getBatchById(batchId, true);
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'The selected masterclass cohort could not be found.' },
        { status: 404 }
      );
    }

    // 2. Validate batch registration availability
    if (batch.status === 'closed' || batch.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Registration for this cohort is closed.' },
        { status: 400 }
      );
    }

    if (batch.max_seats > 0 && batch.seats_booked >= batch.max_seats) {
      return NextResponse.json(
        { success: false, error: 'This cohort has reached maximum capacity. Please select an upcoming batch.' },
        { status: 400 }
      );
    }

    // 3. Strict server-side fee resolution (Never trusted from client)
    const officialFee = batch.fee || 999;

    // 4. Create or get student profile
    const student = await db.createOrGetStudent({
      name: fullName,
      email,
      phone,
      caLevel,
      attemptDetails,
    });

    // 5. Generate official Razorpay Order
    const order = await createRazorpayOrder({
      amountInRupees: officialFee,
      batchId: batch.id,
      batchNumber: batch.batch_number,
      studentName: fullName,
      studentEmail: email,
    });

    // 6. Record pending payment intent
    await db.recordPayment({
      id: crypto.randomUUID(),
      student_id: student.id,
      batch_id: batch.id,
      amount: officialFee,
      currency: 'INR',
      gateway: 'razorpay',
      payment_id: `intent_${order.orderId}`,
      order_id: order.orderId,
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: officialFee,
      currency: 'INR',
      keyId: order.keyId,
      batch: {
        id: batch.id,
        batch_number: batch.batch_number,
        name: batch.name,
        fee: officialFee,
      },
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize checkout session.' },
      { status: 500 }
    );
  }
}
