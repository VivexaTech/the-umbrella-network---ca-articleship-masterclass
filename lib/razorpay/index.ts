import crypto from 'crypto';

export interface RazorpayOrderResult {
  orderId: string;
  amountInPaise: number;
  currency: string;
  keyId: string;
  feeInRupees: number;
}

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  const isLiveConfigured = Boolean(
    keyId &&
      keySecret &&
      !keyId.includes('placeholder') &&
      !keySecret.includes('placeholder')
  );

  return { keyId, keySecret, webhookSecret, isLiveConfigured };
}

export async function createRazorpayOrder(params: {
  amountInRupees: number;
  batchId: string;
  batchNumber: string;
  studentName: string;
  studentEmail: string;
}): Promise<RazorpayOrderResult> {
  const { keyId, keySecret, isLiveConfigured } = getRazorpayCredentials();
  const amountInPaise = params.amountInRupees * 100;

  let orderId = `order_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  if (isLiveConfigured) {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes: {
          batch_id: params.batchId,
          batch_number: params.batchNumber,
          student_name: params.studentName,
          student_email: params.studentEmail,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay order API failed: ${response.status} ${errText}`);
    }

    const data = (await response.json()) as { id: string };
    orderId = data.id;
  }

  return {
    orderId,
    amountInPaise,
    currency: 'INR',
    keyId: keyId || 'rzp_test_placeholder',
    feeInRupees: params.amountInRupees,
  };
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret, isLiveConfigured } = getRazorpayCredentials();
  if (!isLiveConfigured) {
    // If running in development without credentials, signature verification cannot be performed
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(params.signature),
    Buffer.from(expectedSignature)
  );
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayCredentials();
  if (!webhookSecret || webhookSecret.includes('placeholder')) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function fetchPaymentFromRazorpay(paymentId: string) {
  const { keyId, keySecret, isLiveConfigured } = getRazorpayCredentials();
  if (!isLiveConfigured) return null;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
}
