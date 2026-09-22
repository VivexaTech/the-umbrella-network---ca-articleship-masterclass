import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPaymentSignature, getRazorpayCredentials } from '@/lib/razorpay';
import { emailService } from '@/lib/email';
import { verifyPaymentSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = verifyPaymentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validated.error.format() },
        { status: 400 }
      );
    }

    const {
      batchId,
      fullName,
      email,
      phone,
      caLevel,
      attemptDetails,
      paymentMethod,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      upiUtr,
    } = validated.data;

    // Fetch batch from database
    const batch = await db.getBatchById(batchId, true);
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Selected batch was not found.' },
        { status: 404 }
      );
    }

    const student = await db.createOrGetStudent({
      name: fullName,
      email,
      phone,
      caLevel,
      attemptDetails,
    });

    // -------------------------------------------------------------------------
    // FLOW 1: MANUAL UPI PAYMENT (Pending Admin Verification)
    // -------------------------------------------------------------------------
    if (paymentMethod === 'UPI') {
      if (!upiUtr || upiUtr.trim().length < 8) {
        return NextResponse.json(
          { success: false, error: 'A valid 12-digit UPI Transaction Reference (UTR) is required.' },
          { status: 400 }
        );
      }

      const registration = await db.createRegistration({
        student,
        batch,
        amount: batch.fee,
        paymentMethod: 'UPI',
        upiUtr: upiUtr.trim(),
        status: 'pending_verification',
      });

      await db.recordPayment({
        id: crypto.randomUUID(),
        student_id: student.id,
        batch_id: batch.id,
        amount: batch.fee,
        currency: 'INR',
        gateway: 'upi_manual',
        payment_id: `upi_${upiUtr.trim()}`,
        order_id: `order_upi_${registration.registration_number}`,
        upi_utr: upiUtr.trim(),
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      });

      // Send pending verification acknowledgment email
      try {
        await emailService.sendUpiSubmissionPendingEmail({
          studentName: student.name,
          studentEmail: student.email,
          batchNumber: batch.batch_number,
          batchName: batch.name,
          batchDate: `${batch.start_date} - ${batch.end_date}`,
          registrationNumber: registration.registration_number,
          upiUtr: upiUtr.trim(),
          amount: batch.fee,
        });
      } catch (mailErr) {
        console.warn('[Email Warning] Pending UPI email failed:', mailErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Your UPI transaction details have been submitted for bank verification.',
        registrationId: registration.id,
        registrationNumber: registration.registration_number,
        studentName: student.name,
        studentEmail: student.email,
        batchNumber: batch.batch_number,
        batchName: batch.name,
        batchDate: `${batch.start_date} - ${batch.end_date}`,
        amount: batch.fee,
        paymentId: `upi_${upiUtr.trim()}`,
        paymentMethod: 'UPI',
        upiUtr: upiUtr.trim(),
        status: 'pending_verification',
        requiresVerification: true,
      });
    }

    // -------------------------------------------------------------------------
    // FLOW 2: RAZORPAY VERIFICATION
    // -------------------------------------------------------------------------
    if (!razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json(
        { success: false, error: 'Razorpay payment and order IDs are required.' },
        { status: 400 }
      );
    }

    const { isLiveConfigured } = getRazorpayCredentials();

    if (isLiveConfigured) {
      // In production mode with live keys, signature MUST be provided and mathematically verified
      if (!razorpay_signature) {
        return NextResponse.json(
          { success: false, error: 'Missing Razorpay cryptographic signature.' },
          { status: 400 }
        );
      }

      const isValid = verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValid) {
        console.error('[Payment Verification] Signature verification mismatch for order:', razorpay_order_id);
        return NextResponse.json(
          {
            success: false,
            error: 'Cryptographic payment verification failed. If your account was debited, please contact support.',
          },
          { status: 400 }
        );
      }
    } else {
      console.log('[Payment Verification] Operating in development mode with test credentials');
    }

    // Atomically reserve seat in batch
    await db.atomicReserveSeat(batch.id);

    // Create confirmed registration
    const registration = await db.createRegistration({
      student,
      batch,
      amount: batch.fee,
      paymentMethod: 'Razorpay',
      paymentId: razorpay_payment_id,
      status: 'confirmed',
    });

    // Record verified payment
    await db.recordPayment({
      id: crypto.randomUUID(),
      student_id: student.id,
      batch_id: batch.id,
      amount: batch.fee,
      currency: 'INR',
      gateway: 'razorpay',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      signature: razorpay_signature,
      payment_status: 'successful',
      created_at: new Date().toISOString(),
    });

    // Generate secure resource access token
    const resourceToken = await db.createResourceAccess(registration.id, student.id);
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const driveResourcesLink = `${origin}/api/resources/${resourceToken}`;

    // Dispatch confirmation email
    let emailSent = false;
    try {
      const emailResult = await emailService.sendRegistrationAcknowledgment({
        studentName: student.name,
        studentEmail: student.email,
        batchNumber: batch.batch_number,
        batchName: batch.name,
        batchDate: `${batch.start_date} - ${batch.end_date}`,
        registrationNumber: registration.registration_number,
        paymentId: razorpay_payment_id,
        amount: batch.fee,
        whatsappLink: batch.whatsapp_link,
        driveResourcesLink,
        resourceAccessToken: resourceToken,
      });
      emailSent = emailResult.success;
    } catch (mailErr) {
      console.error('[Email Dispatch Error]:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and registration confirmed!',
      registrationId: registration.id,
      registrationNumber: registration.registration_number,
      studentName: student.name,
      studentEmail: student.email,
      batchNumber: batch.batch_number,
      batchName: batch.name,
      batchDate: `${batch.start_date} - ${batch.end_date}`,
      amount: batch.fee,
      paymentId: razorpay_payment_id,
      paymentMethod: 'Razorpay',
      status: 'confirmed',
      requiresVerification: false,
      whatsappLink: batch.whatsapp_link,
      driveResourcesLink,
      emailSent,
    });
  } catch (error: any) {
    console.error('[Verify Payment Fatal Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during payment verification.' },
      { status: 500 }
    );
  }
}
