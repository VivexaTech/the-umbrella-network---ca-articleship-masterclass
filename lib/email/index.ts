import nodemailer, { type Transporter } from 'nodemailer';
import { GOOGLE_DRIVE_RESOURCES_LINK } from '../db';

export const ADMIN_CONTACT_EMAIL = process.env.ADMIN_EMAIL || 'caumbrellanetwork@gmail.com';

export interface RegistrationEmailParams {
  studentName: string;
  studentEmail: string;
  batchNumber: string;
  batchName: string;
  batchDate: string;
  registrationNumber: string;
  paymentId: string;
  amount: number;
  whatsappLink: string;
  driveResourcesLink?: string;
  resourceAccessToken?: string;
}

export interface UpiPendingEmailParams {
  studentName: string;
  studentEmail: string;
  batchNumber: string;
  batchName: string;
  batchDate: string;
  registrationNumber: string;
  upiUtr: string;
  amount: number;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  mode: 'smtp' | 'simulated';
  error?: string;
  subject: string;
  html: string;
  driveResourcesLink: string;
}

export function generateRegistrationAcknowledgmentHtml(params: RegistrationEmailParams): string {
  const driveLink = params.driveResourcesLink || GOOGLE_DRIVE_RESOURCES_LINK;
  const whatsappLink = params.whatsappLink;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Masterclass Registration Confirmed & Resources Access</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 30px 15px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #0f172a;
      padding: 28px 30px;
      text-align: center;
      border-bottom: 3px solid #1d4ed8;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #94a3b8;
    }
    .content {
      padding: 30px;
    }
    .salutation {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .intro-p {
      font-size: 14.5px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 20px;
    }
    .receipt-box {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      border: 1px solid #cbd5e1;
    }
    .receipt-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 800;
      color: #475569;
      margin-bottom: 10px;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    .receipt-row:last-child {
      border-bottom: none;
    }
    .receipt-label {
      color: #64748b;
      font-weight: 500;
    }
    .receipt-val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .drive-section {
      background: #eff6ff;
      border: 2px solid #bfdbfe;
      border-radius: 14px;
      padding: 22px;
      margin-bottom: 24px;
      text-align: left;
    }
    .drive-badge {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .drive-title {
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0 0 8px 0;
    }
    .drive-desc {
      font-size: 13.5px;
      line-height: 1.55;
      color: #1e40af;
      margin-bottom: 14px;
    }
    .resources-list {
      margin: 0 0 16px 0;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.6;
      color: #1e3a8a;
    }
    .drive-btn {
      display: block;
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .whatsapp-section {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .whatsapp-title {
      font-size: 15px;
      font-weight: 800;
      color: #14532d;
      margin: 0 0 6px 0;
    }
    .whatsapp-desc {
      font-size: 13px;
      line-height: 1.5;
      color: #166534;
      margin-bottom: 12px;
    }
    .whatsapp-btn {
      display: block;
      background: #16a34a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 800;
      text-align: center;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    }
    .footer {
      background: #f8fafc;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>THE UMBRELLA NETWORK</h1>
        <p>CA Articleship Masterclass by CA Harsh Kaushik</p>
      </div>

      <div class="content">
        <h2 class="salutation">Welcome, ${params.studentName}! 🎉</h2>
        <p class="intro-p">
          Your payment of <strong>₹${params.amount}</strong> has been successfully received and your seat in 
          <strong>${params.batchNumber} (${params.batchName})</strong> is officially <strong>CONFIRMED</strong>.
        </p>

        <div class="receipt-box">
          <div class="receipt-title">Official Enrollment Receipt</div>
          <div class="receipt-row">
            <span class="receipt-label">Student Name:</span>
            <span class="receipt-val">${params.studentName}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Registration No:</span>
            <span class="receipt-val">${params.registrationNumber}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Cohort:</span>
            <span class="receipt-val">${params.batchNumber}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Dates:</span>
            <span class="receipt-val">${params.batchDate}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Payment ID:</span>
            <span class="receipt-val">${params.paymentId}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Status:</span>
            <span class="receipt-val" style="color: #16a34a;">CONFIRMED & ACTIVE</span>
          </div>
        </div>

        <div class="drive-section">
          <span class="drive-badge">Exclusive Access</span>
          <h3 class="drive-title">📁 Masterclass Drive Resources Folder</h3>
          <p class="drive-desc">
            You now have full access to our curated articleship preparation vault including:
          </p>
          <ul class="resources-list">
            <li><strong>ATS-Compliant CV Templates:</strong> Clean single-page formats tested across Big 4 HR portals</li>
            <li><strong>HR & Partner Email Pitch Frameworks:</strong> High-conversion cold outreach templates</li>
            <li><strong>Domain Cheat Sheets:</strong> Statutory Audit, Internal Audit, M&A, Transfer Pricing & Tax</li>
            <li><strong>Technical Question Banks:</strong> 250+ technical interview questions asked in recent recruitment drives</li>
          </ul>
          <a href="${driveLink}" class="drive-btn" target="_blank" rel="noopener noreferrer">
            Open Google Drive Resources Folder →
          </a>
        </div>

        ${
          whatsappLink
            ? `
        <div class="whatsapp-section">
          <h3 class="whatsapp-title">💬 Join Your Cohort WhatsApp Group</h3>
          <p class="whatsapp-desc">
            All daily live Zoom session links, speaker announcements, and live Q&A updates are posted exclusively here:
          </p>
          <a href="${whatsappLink}" class="whatsapp-btn" target="_blank" rel="noopener noreferrer">
            Join ${params.batchNumber} WhatsApp Group →
          </a>
        </div>
        `
            : ''
        }

        <p style="font-size: 13.5px; color: #475569; line-height: 1.6;">
          If you have any questions before day 1, reply to this email or reach us at 
          <a href="mailto:${ADMIN_CONTACT_EMAIL}">${ADMIN_CONTACT_EMAIL}</a>.
        </p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} The Umbrella Network. All rights reserved.<br/>
        Building real CA careers with proven strategies.
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function generateUpiSubmissionPendingHtml(params: UpiPendingEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>UPI Payment Verification Pending</title>
  <style>
    body { font-family: -apple-system, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #fff; padding: 16px; border-radius: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>THE UMBRELLA NETWORK</h2>
      <p>UPI Payment Reference Received</p>
    </div>
    <div style="padding: 20px 0;">
      <h3>Hello ${params.studentName},</h3>
      <p>We have received your UPI payment submission for <strong>${params.batchNumber}</strong>.</p>
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Registration No:</strong> ${params.registrationNumber}</p>
        <p><strong>Submitted 12-Digit UTR:</strong> ${params.upiUtr}</p>
        <p><strong>Amount:</strong> ₹${params.amount}</p>
        <p><strong>Status:</strong> <span style="color: #d97706; font-weight: 700;">Under Bank Verification</span></p>
      </div>
      <p>Our accounts team is cross-checking this reference against our ICICI Bank records. Once verified, you will receive an automatic email containing your batch WhatsApp invite link and complete Google Drive access.</p>
      <p>If you made this payment with a different UTR, reply to this email directly.</p>
    </div>
  </div>
</body>
</html>`;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;
  private sentEmailsHistory: any[] = [];

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass && !host.includes('placeholder')) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.isConfigured = true;
      } catch (err) {
        console.warn('[Email] SMTP initialization warning:', err);
      }
    }
  }

  async sendRegistrationAcknowledgment(params: RegistrationEmailParams): Promise<EmailSendResult> {
    const subject = `🎉 Enrollment Confirmed: ${params.batchNumber} Articleship Masterclass`;
    const html = generateRegistrationAcknowledgmentHtml(params);
    const driveResourcesLink = params.driveResourcesLink || GOOGLE_DRIVE_RESOURCES_LINK;

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"The Umbrella Network" <${process.env.SMTP_USER || ADMIN_CONTACT_EMAIL}>`,
          to: params.studentEmail,
          subject,
          html,
        });

        this.sentEmailsHistory.push({
          to: params.studentEmail,
          studentName: params.studentName,
          subject,
          batchNumber: params.batchNumber,
          registrationNumber: params.registrationNumber,
          mode: 'smtp',
          date: new Date().toISOString(),
        });

        return {
          success: true,
          messageId: info.messageId,
          mode: 'smtp',
          subject,
          html,
          driveResourcesLink,
        };
      } catch (err: any) {
        console.error('[Email] SMTP dispatch error:', err);
      }
    }

    // Simulated Mode: Logs clearly and cleanly
    console.log(`[Email Simulated] Acknowledgment email for ${params.studentEmail} (${params.registrationNumber})`);
    this.sentEmailsHistory.push({
      to: params.studentEmail,
      studentName: params.studentName,
      subject,
      batchNumber: params.batchNumber,
      registrationNumber: params.registrationNumber,
      mode: 'simulated',
      date: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      mode: 'simulated',
      subject,
      html,
      driveResourcesLink,
    };
  }

  async sendUpiSubmissionPendingEmail(params: UpiPendingEmailParams): Promise<EmailSendResult> {
    const subject = `⏳ Payment Received for Verification: ${params.batchNumber}`;
    const html = generateUpiSubmissionPendingHtml(params);

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"The Umbrella Network" <${process.env.SMTP_USER || ADMIN_CONTACT_EMAIL}>`,
          to: params.studentEmail,
          subject,
          html,
        });
        return {
          success: true,
          messageId: info.messageId,
          mode: 'smtp',
          subject,
          html,
          driveResourcesLink: 'Pending Verification',
        };
      } catch (err) {
        console.error('[Email] SMTP error on pending UPI mail:', err);
      }
    }

    return {
      success: true,
      messageId: `sim_pending_${Date.now()}`,
      mode: 'simulated',
      subject,
      html,
      driveResourcesLink: 'Pending Verification',
    };
  }

  getSentEmails() {
    return [...this.sentEmailsHistory].reverse();
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      smtpHost: process.env.SMTP_HOST || 'Not configured',
      senderEmail: process.env.SMTP_USER || ADMIN_CONTACT_EMAIL,
      totalSent: this.sentEmailsHistory.length,
    };
  }
}

export const emailService = new EmailService();
