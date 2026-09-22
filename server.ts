import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { supabaseService, SQL_SETUP_SCRIPT } from './server/supabase.js';
import { emailService, GOOGLE_DRIVE_RESOURCES_LINK } from './server/email.js';

dotenv.config();

const app = express();
const PORT = process.env.HOSTINGER_PORT ? parseInt(process.env.HOSTINGER_PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Simple admin auth middleware
const ADMIN_TOKEN = 'umbrella_admin_secret_token_2026';
function requireAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';
  if (token === ADMIN_TOKEN || token === (process.env.ADMIN_TOKEN || ADMIN_TOKEN)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// 1. Get Batches (public: whatsapp_link is hidden!)
app.get('/api/batches', (req: Request, res: Response) => {
  const batches = db.getBatches(false);
  res.json({ success: true, batches });
});

// 2. Get Current Active Batch
app.get('/api/batches/current', (req: Request, res: Response) => {
  const batch = db.getActiveBatch(false);
  if (!batch) {
    return res.status(404).json({ error: 'No active batch currently found.' });
  }
  res.json({ success: true, batch });
});

// 3. Get Specific Batch by ID (public)
app.get('/api/batches/:id', (req: Request, res: Response) => {
  const batch = db.getBatchById(req.params.id, false);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found.' });
  }
  res.json({ success: true, batch });
});

// 4. Get Website Settings (Hero, Stats, Pricing, Mentor, FAQs, Contact)
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

// Download ZIP of website project archive
app.get(['/download-zip', '/api/download-zip'], (req: Request, res: Response) => {
  const zipFile = path.join(process.cwd(), 'public', 'umbrella-network-website.zip');
  res.download(zipFile, 'umbrella-network-website.zip');
});

// 5. Get Speakers & Update Photos
app.get('/api/speakers', (req: Request, res: Response) => {
  const speakers = db.getSpeakers().filter(s => s.status === 'active');
  res.json({ success: true, speakers });
});

app.post('/api/speakers/:id/photo', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let publicUrl = image;
    if (typeof image === 'string' && image.startsWith('data:image')) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `speaker-${id}.${ext}`;
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, filename), buffer);

        // Also sync to dist/ if built
        const distDir = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, filename), buffer);
        }

        publicUrl = `/${filename}?v=${Date.now()}`;
      }
    }

    const updated = db.updateSpeaker(id, { image: publicUrl });
    if (!updated) {
      return res.status(404).json({ error: 'Speaker not found.' });
    }

    res.json({ success: true, imageUrl: publicUrl, speaker: updated });
  } catch (err: any) {
    console.error('Error saving speaker photo:', err);
    res.status(500).json({ error: 'Failed to save speaker photo.' });
  }
});

app.post('/api/speakers/batch-photos', (req: Request, res: Response) => {
  try {
    const { photos } = req.body;
    if (!Array.isArray(photos)) {
      return res.status(400).json({ error: 'photos must be an array of { id, image }.' });
    }

    const results = [];
    const publicDir = path.join(process.cwd(), 'public');
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    for (const item of photos) {
      if (!item.id || !item.image) continue;
      let publicUrl = item.image;
      if (typeof item.image === 'string' && item.image.startsWith('data:image')) {
        const matches = item.image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `speaker-${item.id}.${ext}`;
          fs.writeFileSync(path.join(publicDir, filename), buffer);
          if (fs.existsSync(distDir)) {
            fs.writeFileSync(path.join(distDir, filename), buffer);
          }
          publicUrl = `/${filename}?v=${Date.now()}`;
        }
      }
      const updated = db.updateSpeaker(item.id, { image: publicUrl });
      if (updated) results.push(updated);
    }

    res.json({ success: true, speakers: results });
  } catch (err: any) {
    console.error('Error in batch speaker photos:', err);
    res.status(500).json({ error: 'Failed to batch save speaker photos.' });
  }
});

// 6. Get Testimonials
app.get('/api/testimonials', (req: Request, res: Response) => {
  const testimonials = db.getTestimonials(false);
  res.json({ success: true, testimonials });
});

// 7. Contact Form Submission
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and your message.' });
  }
  const saved = db.addContactMessage({ name, email, phone: phone || '', message });
  db.trackEvent('contact_form_submitted', { name, email });
  res.json({ success: true, message: 'Message sent successfully. We will get back to you shortly!', id: saved.id });
});

// 8. Analytics Tracking Endpoint
app.post('/api/analytics', (req: Request, res: Response) => {
  const { eventType, metadata } = req.body;
  if (eventType) {
    db.trackEvent(eventType, metadata || {});
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// PAYMENT & REGISTRATION FLOW
// ----------------------------------------------------

// Create Razorpay Order or Test Order
app.post('/api/payments/create-order', async (req: Request, res: Response) => {
  try {
    const { batchId, fullName, email, phone, caLevel, attemptDetails } = req.body;

    if (!batchId || !fullName || !email || !phone || !caLevel) {
      return res.status(400).json({ error: 'Missing required student details or batch selection.' });
    }

    const batch = db.getBatchById(batchId, true);
    if (!batch) {
      return res.status(404).json({ error: 'Selected batch was not found.' });
    }

    if (batch.status === 'closed') {
      return res.status(400).json({ error: 'Registration for this batch has closed.' });
    }

    if (batch.max_seats > 0 && batch.seats_booked >= batch.max_seats) {
      return res.status(400).json({ error: 'This batch has reached maximum capacity.' });
    }

    const amountInPaise = batch.fee * 100;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo_key';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // If real Razorpay credentials provided and not test placeholder
    if (keySecret && keyId && !keyId.includes('placeholder') && !keyId.includes('demo')) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
              batch_id: batch.id,
              batch_number: batch.batch_number,
              student_name: fullName,
              student_email: email,
            },
          }),
        });
        if (rzpResponse.ok) {
          const rzpData = (await rzpResponse.json()) as { id: string };
          orderId = rzpData.id;
        }
      } catch (e) {
        console.warn('Razorpay live order creation fallback to simulated order ID:', e);
      }
    }

    db.trackEvent('checkout_start', { batchId, batchNumber: batch.batch_number, amount: batch.fee });

    res.json({
      success: true,
      orderId,
      amount: batch.fee,
      amountInPaise,
      currency: 'INR',
      keyId,
      batch: {
        id: batch.id,
        batch_number: batch.batch_number,
        name: batch.name,
        fee: batch.fee,
        start_date: batch.start_date,
      },
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize payment.' });
  }
});

// Server-side Payment Verification and Batch-Specific WhatsApp Assignment
app.post('/api/payments/verify', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      caLevel,
      attemptDetails,
      batchId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
      upiUtr,
    } = req.body;

    const isUpi = paymentMethod === 'UPI' || Boolean(upiUtr);
    const resolvedPaymentId = razorpay_payment_id || upiUtr || (isUpi ? `UPI_${Date.now()}` : '');

    if (!fullName || !email || !phone || !batchId || !resolvedPaymentId) {
      return res.status(400).json({ error: 'Incomplete payment verification payload.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Verify cryptographic signature if real Razorpay secret is configured and payment is via Razorpay
    if (!isUpi && keySecret && !keySecret.includes('placeholder') && keyId && !keyId.includes('placeholder')) {
      if (razorpay_signature && razorpay_order_id) {
        const body = `${razorpay_order_id}|${resolvedPaymentId}`;
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          db.trackEvent('payment_failed_signature', { email, paymentId: resolvedPaymentId });
          return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
        }
      }
    }

    // Process registration in the database
    const regResult = db.registerStudentAndPayment({
      fullName,
      email,
      phone,
      caLevel,
      attemptDetails,
      batchId,
      amount: Number(amount) || 999,
      paymentId: resolvedPaymentId,
      orderId: razorpay_order_id || (isUpi ? 'upi-payment' : `order_${Date.now()}`),
      signature: razorpay_signature || (isUpi ? 'upi_verified' : ''),
      paymentMethod: isUpi ? 'UPI (harshkaushiks07@okicici)' : 'Razorpay',
      upiUtr: upiUtr || (isUpi ? resolvedPaymentId : undefined),
    });

    if (!regResult.success || !regResult.registration) {
      db.trackEvent('registration_failed', { email, error: regResult.error });
      return res.status(400).json({ error: regResult.error || 'Could not complete registration.' });
    }

    db.trackEvent('payment_success', {
      email,
      batchId,
      registrationId: regResult.registration.id,
      amount,
      paymentMethod: isUpi ? 'UPI' : 'Razorpay',
      upiUtr,
    });

    const savedRegistration = regResult.registration;
    const isPendingUpi = savedRegistration.status === 'pending_verification';

    // Save enrollment details directly into connected Supabase account
    supabaseService
      .saveEnrollment({
        id: savedRegistration.id,
        registration_number: savedRegistration.registration_number,
        student_name: savedRegistration.student_name,
        student_email: savedRegistration.student_email,
        student_phone: savedRegistration.student_phone,
        ca_level: savedRegistration.ca_level,
        attempt_details: attemptDetails || '',
        batch_id: savedRegistration.batch_id,
        batch_number: savedRegistration.batch_number,
        batch_name: savedRegistration.batch_name,
        batch_date: savedRegistration.batch_date,
        amount: savedRegistration.amount,
        payment_id: resolvedPaymentId,
        order_id: razorpay_order_id || (isUpi ? 'upi' : ''),
        payment_status: isPendingUpi ? 'pending' : 'successful',
        created_at: savedRegistration.created_at,
      })
      .then(res => {
        if (res.success) {
          console.log(`[Supabase] Enrollment ${savedRegistration.registration_number} saved to ${res.tableUsed}`);
        } else {
          console.warn(`[Supabase] Note on enrollment save: ${res.error}`);
        }
      })
      .catch(err => {
        console.error('[Supabase] Auto-save error:', err);
      });

    // For Pending UPI: send pending verification email without releasing resources prematurely
    if (isPendingUpi) {
      emailService
        .sendUpiSubmissionPendingEmail({
          studentName: savedRegistration.student_name,
          studentEmail: savedRegistration.student_email,
          batchNumber: savedRegistration.batch_number,
          batchName: savedRegistration.batch_name,
          batchDate: savedRegistration.batch_date,
          registrationNumber: savedRegistration.registration_number,
          upiUtr: upiUtr || resolvedPaymentId,
          amount: savedRegistration.amount,
        })
        .then(mailRes => {
          db.recordSentEmail({
            to: savedRegistration.student_email,
            studentName: savedRegistration.student_name,
            subject: mailRes.subject,
            batchNumber: savedRegistration.batch_number,
            registrationNumber: savedRegistration.registration_number,
            driveResourcesLink: 'Pending Verification',
            whatsappLink: 'Pending Verification',
            mode: mailRes.mode,
          });
        })
        .catch(err => {
          console.error('[Email] Error sending pending verification email:', err);
        });

      return res.json({
        success: true,
        status: 'pending_verification',
        requiresVerification: true,
        message: 'UPI payment reference submitted! Our accounts team is verifying this with ICICI bank records.',
        registrationId: savedRegistration.id,
        registrationNumber: savedRegistration.registration_number,
        studentName: savedRegistration.student_name,
        studentEmail: savedRegistration.student_email,
        batchNumber: savedRegistration.batch_number,
        batchName: savedRegistration.batch_name,
        batchDate: savedRegistration.batch_date,
        amount: savedRegistration.amount,
        paymentId: resolvedPaymentId,
        paymentMethod: 'UPI (harshkaushiks07@okicici)',
        upiUtr: upiUtr || undefined,
        whatsappLink: undefined, // Held until verified by admin
        driveResourcesLink: undefined, // Held until verified by admin
        emailSent: true,
      });
    }

    // For Verified payments (Razorpay or Auto-verified): send acknowledgment email with Google Drive Resources & WhatsApp invite
    const driveResourcesLink = GOOGLE_DRIVE_RESOURCES_LINK;
    emailService
      .sendRegistrationAcknowledgment({
        studentName: savedRegistration.student_name,
        studentEmail: savedRegistration.student_email,
        batchNumber: savedRegistration.batch_number,
        batchName: savedRegistration.batch_name,
        batchDate: savedRegistration.batch_date,
        registrationNumber: savedRegistration.registration_number,
        paymentId: resolvedPaymentId,
        amount: savedRegistration.amount,
        whatsappLink: regResult.whatsappLink || '',
        driveResourcesLink,
      })
      .then(mailRes => {
        db.recordSentEmail({
          to: savedRegistration.student_email,
          studentName: savedRegistration.student_name,
          subject: mailRes.subject,
          batchNumber: savedRegistration.batch_number,
          registrationNumber: savedRegistration.registration_number,
          driveResourcesLink,
          whatsappLink: regResult.whatsappLink || '',
          mode: mailRes.mode,
        });
      })
      .catch(err => {
        console.error('[Email] Error sending acknowledgment email:', err);
      });

    // Successfully verified! Return Registration Details, Drive Resources Link, AND WhatsApp Link
    res.json({
      success: true,
      status: 'verified',
      requiresVerification: false,
      message: 'Payment verified and registration confirmed!',
      registrationId: regResult.registration.id,
      registrationNumber: regResult.registration.registration_number,
      studentName: regResult.registration.student_name,
      studentEmail: regResult.registration.student_email,
      batchNumber: regResult.registration.batch_number,
      batchName: regResult.registration.batch_name,
      batchDate: regResult.registration.batch_date,
      amount: regResult.registration.amount,
      paymentId: resolvedPaymentId,
      paymentMethod: isUpi ? 'UPI (harshkaushiks07@okicici)' : 'Razorpay',
      upiUtr: upiUtr || undefined,
      whatsappLink: regResult.whatsappLink,
      driveResourcesLink,
      emailSent: true,
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Server error during payment verification.' });
  }
});

// Retrieve verified registration info & batch WhatsApp link
app.get('/api/registration/:id', (req: Request, res: Response) => {
  const reg = db.getRegistrationById(req.params.id);
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found.' });
  }
  const isVerified = reg.status === 'verified';
  res.json({
    success: true,
    registration: {
      id: reg.id,
      registrationNumber: reg.registration_number,
      studentName: reg.student_name,
      studentEmail: reg.student_email,
      studentPhone: reg.student_phone,
      batchNumber: reg.batch_number,
      batchName: reg.batch_name,
      batchDate: reg.batch_date,
      amount: reg.amount,
      status: reg.status || 'verified',
      rejectionReason: reg.rejection_reason,
      createdAt: reg.created_at,
      whatsappLink: isVerified ? reg.whatsapp_link : undefined,
      driveResourcesLink: isVerified ? GOOGLE_DRIVE_RESOURCES_LINK : undefined,
    },
  });
});

// Public status check for students tracking their UPI verification
app.get('/api/registrations/status', (req: Request, res: Response) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim().toLowerCase() : '';
  if (!query) {
    return res.status(400).json({ error: 'Query parameter (registration number, email or phone) is required.' });
  }

  const registrations = db.getRegistrations();
  const match = registrations.find(
    r =>
      r.registration_number.toLowerCase() === query ||
      r.id.toLowerCase() === query ||
      r.student_email.toLowerCase() === query ||
      r.student_phone.includes(query) ||
      (r.upi_utr && r.upi_utr.toLowerCase() === query)
  );

  if (!match) {
    return res.status(404).json({ error: 'No registration record found matching that reference.' });
  }

  const batch = db.getBatches(true).find(b => b.id === match.batch_id);
  const isVerified = match.status === 'verified';

  res.json({
    success: true,
    registration: {
      id: match.id,
      registrationNumber: match.registration_number,
      studentName: match.student_name,
      studentEmail: match.student_email,
      batchNumber: match.batch_number,
      batchName: match.batch_name,
      batchDate: match.batch_date,
      amount: match.amount,
      paymentMethod: match.payment_method,
      upiUtr: match.upi_utr,
      status: match.status || 'verified',
      rejectionReason: match.rejection_reason,
      createdAt: match.created_at,
      whatsappLink: isVerified && batch ? batch.whatsapp_link : undefined,
      driveResourcesLink: isVerified ? GOOGLE_DRIVE_RESOURCES_LINK : undefined,
    },
  });
});

// Admin: Approve Pending UPI Registration
app.post('/api/admin/registrations/:id/approve-upi', requireAdmin, async (req: Request, res: Response) => {
  const result = db.approveUpiRegistration(req.params.id);
  if (!result.success || !result.registration) {
    return res.status(404).json({ error: result.error || 'Registration not found' });
  }

  const reg = result.registration;
  const driveResourcesLink = GOOGLE_DRIVE_RESOURCES_LINK;

  // Send official confirmation email with resources
  try {
    const mailRes = await emailService.sendRegistrationAcknowledgment({
      studentName: reg.student_name,
      studentEmail: reg.student_email,
      batchNumber: reg.batch_number,
      batchName: reg.batch_name,
      batchDate: reg.batch_date,
      registrationNumber: reg.registration_number,
      paymentId: reg.upi_utr || reg.payment_id,
      amount: reg.amount,
      whatsappLink: result.whatsappLink || '',
      driveResourcesLink,
    });

    db.recordSentEmail({
      to: reg.student_email,
      studentName: reg.student_name,
      subject: mailRes.subject,
      batchNumber: reg.batch_number,
      registrationNumber: reg.registration_number,
      driveResourcesLink,
      whatsappLink: result.whatsappLink || '',
      mode: mailRes.mode,
    });
  } catch (err: any) {
    console.error('[Admin] Error dispatching approval email:', err);
  }

  res.json({
    success: true,
    message: `Payment verified! Access email dispatched to ${reg.student_email}.`,
    registration: reg,
  });
});

// Admin: Reject Invalid UPI Registration
app.post('/api/admin/registrations/:id/reject-upi', requireAdmin, (req: Request, res: Response) => {
  const reason = req.body.reason || 'Invalid 12-digit UTR. Payment could not be verified in ICICI bank records.';
  const result = db.rejectUpiRegistration(req.params.id, reason);
  if (!result.success || !result.registration) {
    return res.status(404).json({ error: result.error || 'Registration not found' });
  }

  res.json({
    success: true,
    message: `Registration marked as rejected. Reason: ${reason}`,
    registration: result.registration,
  });
});

// Admin Email Logs & Inspection
app.get('/api/admin/emails', requireAdmin, (req: Request, res: Response) => {
  const emails = db.getSentEmails();
  const status = emailService.getStatus();
  res.json({
    success: true,
    status,
    emails,
    total: emails.length,
  });
});

// Admin: Resend Acknowledgment Email
app.post('/api/admin/emails/resend', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { registrationId } = req.body;
    const reg = db.getRegistrationById(registrationId);
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const driveResourcesLink = GOOGLE_DRIVE_RESOURCES_LINK;
    const mailResult = await emailService.sendRegistrationAcknowledgment({
      studentName: reg.student_name,
      studentEmail: reg.student_email,
      batchNumber: reg.batch_number,
      batchName: reg.batch_name,
      batchDate: reg.batch_date,
      registrationNumber: reg.registration_number,
      paymentId: reg.id,
      amount: reg.amount,
      whatsappLink: reg.whatsapp_link,
      driveResourcesLink,
    });

    db.recordSentEmail({
      to: reg.student_email,
      studentName: reg.student_name,
      subject: mailResult.subject,
      batchNumber: reg.batch_number,
      registrationNumber: reg.registration_number,
      driveResourcesLink,
      whatsappLink: reg.whatsapp_link,
      mode: mailResult.mode,
    });

    res.json({
      success: true,
      message: `Acknowledgment email resent to ${reg.student_email}`,
      mode: mailResult.mode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to resend email' });
  }
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT API
// ----------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD_HASH || 'admin123';

  if (username === validUser && password === validPass) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      admin: { username: validUser, email: process.env.ADMIN_EMAIL || 'caumbrellanetwork@gmail.com' },
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials.' });
});

// Admin Dashboard Overview
app.get('/api/admin/dashboard', requireAdmin, (req: Request, res: Response) => {
  const analytics = db.getAnalyticsSummary();
  const batches = db.getBatches(true);
  const registrations = db.getRegistrations();
  const currentBatch = db.getActiveBatch(true);

  res.json({
    success: true,
    overview: {
      ...analytics,
      currentBatch: currentBatch || null,
      totalBatches: batches.length,
      recentRegistrations: registrations.slice(-10).reverse(),
    },
  });
});

// Batches CRUD (Admin sees private WhatsApp links)
app.get('/api/admin/batches', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, batches: db.getBatches(true) });
});

app.post('/api/admin/batches', requireAdmin, (req: Request, res: Response) => {
  const {
    batch_number,
    name,
    start_date,
    end_date,
    registration_deadline,
    fee,
    whatsapp_link,
    max_seats,
    status,
    description,
  } = req.body;

  if (!batch_number || !name || !start_date || !end_date || !whatsapp_link) {
    return res.status(400).json({ error: 'Please provide batch number, name, dates, and WhatsApp link.' });
  }

  const newBatch = db.createBatch({
    batch_number,
    name,
    start_date,
    end_date,
    registration_deadline: registration_deadline || `${start_date} (11:59 PM)`,
    fee: Number(fee) || 999,
    whatsapp_link,
    max_seats: Number(max_seats) || 100,
    status: status || 'upcoming',
    description: description || '',
  });

  res.json({ success: true, batch: newBatch });
});

app.put('/api/admin/batches/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateBatch(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Batch not found.' });
  }
  res.json({ success: true, batch: updated });
});

app.delete('/api/admin/batches/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteBatch(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Batch not found.' });
  }
  res.json({ success: true, message: 'Batch deleted successfully.' });
});

// Students & Registrations (Admin)
app.get('/api/admin/students', requireAdmin, (req: Request, res: Response) => {
  const registrations = db.getRegistrations();
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
  const batchId = typeof req.query.batchId === 'string' ? req.query.batchId : '';

  let filtered = registrations;
  if (search) {
    filtered = filtered.filter(
      r =>
        r.student_name.toLowerCase().includes(search) ||
        r.student_email.toLowerCase().includes(search) ||
        r.student_phone.includes(search) ||
        r.registration_number.toLowerCase().includes(search)
    );
  }
  if (batchId) {
    filtered = filtered.filter(r => r.batch_id === batchId);
  }

  res.json({ success: true, registrations: filtered });
});

// Export CSV for Students
app.get('/api/admin/students/export-csv', requireAdmin, (req: Request, res: Response) => {
  const registrations = db.getRegistrations();
  const header = 'Registration No,Name,Email,Phone,CA Level,Batch,Batch Date,Amount,Payment Method,UPI UTR,Date\n';
  const rows = registrations.map(r =>
    `"${r.registration_number}","${r.student_name}","${r.student_email}","${r.student_phone}","${r.ca_level}","${r.batch_number}","${r.batch_date}","${r.amount}","${r.payment_method || 'Razorpay'}","${r.upi_utr || ''}","${r.created_at}"`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="umbrella_registrations_${Date.now()}.csv"`);
  res.send(header + rows);
});

// Website Settings CRUD (Hero headline, Stats, Pricing, FAQs, etc.)
app.get('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// Mentor Photo Upload & Retrieval
app.post('/api/mentor/photo', (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let publicUrl = image;
    if (typeof image === 'string' && image.startsWith('data:image')) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `mentor-harsh-kaushik.${ext}`;
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, filename), buffer);

        // Also sync to dist/ if built
        const distDir = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, filename), buffer);
        }

        publicUrl = `/${filename}?v=${Date.now()}`;
      }
    }

    const currentSettings = db.getSettings();
    const updatedSettings = {
      ...currentSettings,
      mentor: {
        ...currentSettings.mentor,
        image_url: publicUrl,
      },
    };
    db.updateSettings(updatedSettings);

    res.json({ success: true, imageUrl: publicUrl });
  } catch (err: any) {
    console.error('Error saving mentor photo:', err);
    res.status(500).json({ error: 'Failed to save mentor photo.' });
  }
});

// Testimonials CRUD (Admin)
app.get('/api/admin/testimonials', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, testimonials: db.getTestimonials(true) });
});

app.post('/api/admin/testimonials', requireAdmin, (req: Request, res: Response) => {
  const { student_name, designation, firm, domain, testimonial, image, status } = req.body;
  if (!student_name || !testimonial) {
    return res.status(400).json({ error: 'Name and testimonial text are required.' });
  }
  const created = db.addTestimonial({
    student_name,
    designation: designation || 'Articleship Trainee',
    firm: firm || '',
    domain: domain || '',
    testimonial,
    image: image || '',
    status: status || 'published',
  });
  res.json({ success: true, testimonial: created });
});

app.put('/api/admin/testimonials/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateTestimonial(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Testimonial not found.' });
  res.json({ success: true, testimonial: updated });
});

app.delete('/api/admin/testimonials/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteTestimonial(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Testimonial not found.' });
  res.json({ success: true });
});

// Speakers CRUD (Admin)
app.get('/api/admin/speakers', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, speakers: db.getSpeakers() });
});

app.post('/api/admin/speakers', requireAdmin, (req: Request, res: Response) => {
  const { name, firm, domain, image, description, linkedin_url, status } = req.body;
  if (!name || !firm || !domain) {
    return res.status(400).json({ error: 'Speaker name, firm, and domain are required.' });
  }
  const created = db.addSpeaker({
    name,
    firm,
    domain,
    image: image || '',
    description: description || '',
    linkedin_url: linkedin_url || '',
    status: status || 'active',
  });
  res.json({ success: true, speaker: created });
});

app.put('/api/admin/speakers/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSpeaker(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Speaker not found.' });
  res.json({ success: true, speaker: updated });
});

app.delete('/api/admin/speakers/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteSpeaker(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Speaker not found.' });
  res.json({ success: true });
});

// Contact Messages (Admin)
app.get('/api/admin/contact-messages', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, messages: db.getContactMessages() });
});

// ----------------------------------------------------
// SUPABASE DATABASE CONNECTION & ENROLLMENT SYNC (Admin)
// ----------------------------------------------------

// 1. Get Supabase Connection Status and Schema Info
app.get('/api/admin/supabase/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = await supabaseService.testConnection();
    const registrations = db.getRegistrations();
    res.json({
      success: true,
      status,
      localRegistrationsCount: registrations.length,
      sqlSetupScript: SQL_SETUP_SCRIPT,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to check Supabase status' });
  }
});

// 2. Sync all local enrollments to Supabase
app.post('/api/admin/supabase/sync', requireAdmin, async (req: Request, res: Response) => {
  try {
    const registrations = db.getRegistrations();
    const students = db.getStudents();
    const attemptMap: Record<string, string> = {};
    for (const s of students) {
      if (s.attempt_details) attemptMap[s.id] = s.attempt_details;
    }

    const syncResult = await supabaseService.syncAll(registrations, attemptMap);
    res.json({
      success: true,
      message: `Sync process completed: ${syncResult.synced} enrollments saved to Supabase`,
      result: syncResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync to Supabase' });
  }
});

// 3. Fetch enrollments saved in Supabase
app.get('/api/admin/supabase/enrollments', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await supabaseService.fetchEnrollments();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch Supabase enrollments' });
  }
});

// 4. Return SQL Setup Schema
app.get('/api/admin/supabase/schema', requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    sql: SQL_SETUP_SCRIPT,
    projectId: 'ohvjnllfxnalvtwzcxkm',
    url: 'https://ohvjnllfxnalvtwzcxkm.supabase.co',
  });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// ----------------------------------------------------
async function start() {
  // Always serve public folder for static assets like QR code
  app.use(express.static(path.join(process.cwd(), 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Umbrella Network] Masterclass Server running on http://0.0.0.0:${PORT}`);
  });
}

export { app };

// Only boot standalone HTTP listener when not running in a serverless environment (e.g. Netlify Functions)
if (process.env.NETLIFY !== 'true' && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  start();
}

