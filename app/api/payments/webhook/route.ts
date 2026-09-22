import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature, getRazorpayCredentials } from '@/lib/razorpay';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const { webhookSecret } = getRazorpayCredentials();

    // 1. Verify webhook signature if secret configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      if (!signature) {
        console.error('[Webhook] Missing x-razorpay-signature header');
        return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
      }

      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.error('[Webhook] Invalid webhook signature detected');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    console.log(`[Webhook Received] Event: ${eventType}, ID: ${eventId}`);

    // 2. Idempotency Check: Don't process duplicates
    const alreadyProcessed = await db.isWebhookProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`[Webhook Idempotency] Event ${eventId} already processed.`);
      return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const amountInPaise = paymentEntity?.amount || orderEntity?.amount;
    const notes = paymentEntity?.notes || orderEntity?.notes || {};

    // 3. Record event in webhook audit log
    await db.recordWebhookEvent({
      eventId,
      eventType,
      orderId,
      paymentId,
      payload,
    });

    // 4. Handle successful payment events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const batchId = notes.batch_id;
      const studentEmail = notes.student_email || paymentEntity?.email;
      const studentName = notes.student_name || 'Valued Student';
      const studentPhone = notes.student_phone || paymentEntity?.contact || '';

      if (batchId && studentEmail) {
        const batch = await db.getBatchById(batchId, true);
        if (batch) {
          // Atomically increment seat
          await db.atomicReserveSeat(batch.id);

          const student = await db.createOrGetStudent({
            name: studentName,
            email: studentEmail,
            phone: studentPhone,
            caLevel: notes.ca_level || 'CA Intermediate',
          });

          // Check if already registered
          const existingRegistrations = await db.getRegistrations();
          const alreadyRegistered = existingRegistrations.find(
            (r) =>
              (r.payment_id === paymentId || r.student_email === studentEmail) &&
              r.batch_id === batch.id &&
              r.status === 'confirmed'
          );

          if (!alreadyRegistered) {
            const registration = await db.createRegistration({
              student,
              batch,
              amount: batch.fee,
              paymentMethod: 'Razorpay (Webhook)',
              paymentId,
              status: 'confirmed',
            });

            await db.recordPayment({
              id: crypto.randomUUID(),
              student_id: student.id,
              batch_id: batch.id,
              amount: batch.fee,
              currency: 'INR',
              gateway: 'razorpay',
              payment_id: paymentId,
              order_id: orderId,
              payment_status: 'successful',
              created_at: new Date().toISOString(),
            });

            // Resource access token & URL
            const resourceToken = await db.createResourceAccess(registration.id, student.id);
            const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://theumbrellanetwork.in';
            const driveResourcesLink = `${origin}/api/resources/${resourceToken}`;

            // Dispatch automatic enrollment email
            await emailService.sendRegistrationAcknowledgment({
              studentName: student.name,
              studentEmail: student.email,
              batchNumber: batch.batch_number,
              batchName: batch.name,
              batchDate: `${batch.start_date} - ${batch.end_date}`,
              registrationNumber: registration.registration_number,
              paymentId,
              amount: batch.fee,
              whatsappLink: batch.whatsapp_link,
              driveResourcesLink,
              resourceAccessToken: resourceToken,
            });
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook Processing Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
