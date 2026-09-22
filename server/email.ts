import nodemailer, { type Transporter } from 'nodemailer';

export const GOOGLE_DRIVE_RESOURCES_LINK =
  process.env.GOOGLE_DRIVE_RESOURCES_URL ||
  'https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD';

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

/**
 * Generate responsive HTML email for registration acknowledgment and resource sharing
 */
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
    .drive-url-text {
      font-size: 11px;
      word-break: break-all;
      color: #64748b;
      text-align: center;
      margin: 0;
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
    .next-steps {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      margin-bottom: 20px;
    }
    .next-steps h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .next-steps ol {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
    }
    .signature {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 13.5px;
      line-height: 1.5;
      color: #334155;
    }
    .signature-name {
      font-weight: 800;
      color: #0f172a;
    }
    .signature-role {
      color: #64748b;
      font-size: 12.5px;
    }
    .footer {
      background: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 11.5px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      line-height: 1.6;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <!-- Brand Header -->
      <div class="header">
        <h1>THE UMBRELLA NETWORK</h1>
        <p>CA Articleship Masterclass by CA Harsh Kaushik</p>
      </div>

      <!-- Main Body -->
      <div class="content">
        <h2 class="salutation">Dear ${escapeHtml(params.studentName)},</h2>
        
        <p class="intro-p">
          <strong>Thank you for registering for the 6-Day CA Articleship Masterclass!</strong><br />
          We are excited to welcome you to <strong>${escapeHtml(params.batchNumber)} (${escapeHtml(params.batchName)})</strong>. This email serves as your official registration acknowledgment and payment receipt.
        </p>

        <!-- Official Registration Receipt -->
        <div class="receipt-box">
          <div class="receipt-title">Registration Acknowledgment & Receipt</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Registration ID:</td>
              <td style="padding: 6px 0; color: #1d4ed8; font-weight: 700; font-size: 13px; text-align: right; font-family: monospace;">${escapeHtml(params.registrationNumber)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Registered Cohort:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 13px; text-align: right;">${escapeHtml(params.batchNumber)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Masterclass Dates:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 13px; text-align: right;">${escapeHtml(params.batchDate)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Payment Reference:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right; font-family: monospace;">${escapeHtml(params.paymentId)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 700;">Amount Paid:</td>
              <td style="padding: 6px 0; color: #16a34a; font-weight: 800; font-size: 14px; text-align: right;">₹${params.amount} (Confirmed)</td>
            </tr>
          </table>
        </div>

        <!-- 1. GOOGLE DRIVE RESOURCES FOLDER (PRIMARY REQUEST) -->
        <div class="drive-section">
          <span class="drive-badge">Your Masterclass Kit</span>
          <h3 class="drive-title">📁 All Masterclass Resources (Google Drive)</h3>
          <p class="drive-desc">
            As promised, your complete library of resources is available in the shared Google Drive folder below:
          </p>
          <ul class="resources-list">
            <li><strong>CV Templates & Checklists</strong> – Pre-formatted, ATS-vetted Big 4 & Top-tier firm formats.</li>
            <li><strong>Cold Email & Outreach Scripts</strong> – High-converting partner outreach & follow-up templates.</li>
            <li><strong>Interview Frameworks & Question Banks</strong> – Domain-specific technical, case study, and HR preparation guides.</li>
            <li><strong>Domain Decision Matrices</strong> – Strategic comparison across Stat Audit, Internal Audit, Direct/Indirect Tax, Advisory, and Corporate Finance.</li>
            <li><strong>Practical Workbooks</strong> – Excel guides, accounting standards summaries, and cold-calling trackers.</li>
          </ul>

          <a href="${driveLink}" target="_blank" rel="noopener noreferrer" class="drive-btn">
            Open Masterclass Resources Folder (Google Drive) →
          </a>
          <p class="drive-url-text">
            Direct Link: <a href="${driveLink}" style="color: #2563eb; text-decoration: underline;">${driveLink}</a>
          </p>
        </div>

        <!-- 2. WHATSAPP BATCH GROUP -->
        <div class="whatsapp-section">
          <h3 class="whatsapp-title">💬 Join Your Dedicated ${escapeHtml(params.batchNumber)} WhatsApp Group</h3>
          <p class="whatsapp-desc">
            All daily live Zoom session links, CV review submissions, and direct mentor Q&A take place in your cohort group:
          </p>
          <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="whatsapp-btn">
            Join ${escapeHtml(params.batchNumber)} WhatsApp Group →
          </a>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h4>What to do next:</h4>
          <ol>
            <li><strong>Bookmark the Google Drive folder</strong> link above to access materials anytime.</li>
            <li><strong>Join the WhatsApp group</strong> right away so you don't miss any cohort announcements.</li>
            <li>Review the Day 1 preparation instructions shared in the Drive folder before the live kickoff.</li>
          </ol>
        </div>

        <!-- Sign-off -->
        <div class="signature">
          <p style="margin: 0 0 4px 0;">Warm regards and all the best for your articleship journey,</p>
          <div class="signature-name">CA Harsh Kaushik</div>
          <div class="signature-role">The Umbrella Network | Ex-PwC, Ex-Flipkart, Ex-Deloitte</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">
          Need help? Reply directly to this email or reach us at
          <a href="mailto:${ADMIN_CONTACT_EMAIL}">${ADMIN_CONTACT_EMAIL}</a> or WhatsApp
          <a href="https://wa.me/919996506041">+91 9996506041</a>.
        </p>
        <p style="margin: 0; color: #94a3b8; font-size: 11px;">
          The Umbrella Network • CA Articleship Masterclass • © 2026 All Rights Reserved
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    if (user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.isConfigured = true;
        console.log(`[EmailService] SMTP transporter configured for ${user}`);
      } catch (err) {
        console.error('[EmailService] Failed to initialize SMTP transporter:', err);
        this.transporter = null;
        this.isConfigured = false;
      }
    } else {
      // In development/test mode without active SMTP credentials, we use a simulation logger
      // while generating full valid HTML and keeping audit trail
      this.isConfigured = false;
    }
  }

  /**
   * Send acknowledgment email with Google Drive resource folder link and WhatsApp link
   */
  public async sendRegistrationAcknowledgment(params: RegistrationEmailParams): Promise<EmailSendResult> {
    const driveLink = params.driveResourcesLink || GOOGLE_DRIVE_RESOURCES_LINK;
    const subject = `Registration Confirmed: CA Articleship Masterclass (${params.batchNumber}) – Resources Inside`;
    const html = generateRegistrationAcknowledgmentHtml({
      ...params,
      driveResourcesLink: driveLink,
    });

    const senderEmail = process.env.SMTP_USER || ADMIN_CONTACT_EMAIL;
    const from = `"The Umbrella Network" <${senderEmail}>`;

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: params.studentEmail,
          replyTo: ADMIN_CONTACT_EMAIL,
          subject,
          html,
        });

        console.log(
          `[EmailService] Sent live acknowledgment email to ${params.studentEmail} (MessageId: ${info.messageId}) with Google Drive link: ${driveLink}`
        );

        return {
          success: true,
          messageId: info.messageId,
          mode: 'smtp',
          subject,
          html,
          driveResourcesLink: driveLink,
        };
      } catch (err: any) {
        console.error(`[EmailService] SMTP send error to ${params.studentEmail}:`, err.message);
        // Fall through to recorded acknowledgment
      }
    }

    // Acknowledgment logged and ready for dispatch / local preview
    console.log(`[EmailService] Registration acknowledgment email generated for ${params.studentEmail}:`);
    console.log(`  Recipient: ${params.studentName} <${params.studentEmail}>`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Google Drive Resources: ${driveLink}`);
    console.log(`  WhatsApp Group: ${params.whatsappLink}`);

    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      mode: 'simulated',
      subject,
      html,
      driveResourcesLink: driveLink,
    };
  }

  /**
   * Send notification for UPI payment under review
   */
  public async sendUpiSubmissionPendingEmail(params: {
    studentName: string;
    studentEmail: string;
    batchNumber: string;
    batchName: string;
    batchDate: string;
    registrationNumber: string;
    upiUtr: string;
    amount: number;
  }): Promise<EmailSendResult> {
    const subject = `Payment Received – Bank Verification In Progress: CA Articleship Masterclass (${params.batchNumber})`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Verification In Progress</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
    .card { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; padding: 24px; text-align: center; color: #fff; }
    .body { padding: 28px; font-size: 15px; line-height: 1.6; }
    .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 13px; }
    .details { background: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 14px; }
    .footer { padding: 20px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin:0; font-size: 20px;">The Umbrella Network</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">CA Articleship Masterclass</p>
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 18px;">
        <span class="status-badge">⏳ Bank Verification in Progress</span>
      </div>
      <p>Hi <strong>${params.studentName}</strong>,</p>
      <p>We have received your enrollment submission for <strong>${params.batchName} (${params.batchNumber})</strong>.</p>
      <div class="details">
        <div style="margin-bottom: 8px;"><strong>Registration Number:</strong> <code style="color:#0f172a;">${params.registrationNumber}</code></div>
        <div style="margin-bottom: 8px;"><strong>Submitted 12-Digit UTR:</strong> <code>${params.upiUtr}</code></div>
        <div style="margin-bottom: 8px;"><strong>Batch Dates:</strong> ${params.batchDate}</div>
        <div><strong>Fee Amount:</strong> ₹${params.amount}</div>
      </div>
      <p><strong>Next Steps:</strong></p>
      <p>Our team verifies all direct UPI payments against our ICICI bank credits to protect cohort integrity. As soon as CA Harsh Kaushik confirms the credit matching your 12-digit UTR, you will receive an immediate confirmation email containing:</p>
      <ul>
        <li>Your exclusive <strong>WhatsApp Cohort Group Link</strong></li>
        <li>Access to all <strong>Masterclass Google Drive Resources</strong> (CV templates, Big 6 trackers, interview question banks)</li>
      </ul>
      <p>If you made a typo in the UTR, please reply to this email or contact us at <a href="mailto:${ADMIN_CONTACT_EMAIL}">${ADMIN_CONTACT_EMAIL}</a>.</p>
    </div>
    <div class="footer">
      Mentored by CA Harsh Kaushik • The Umbrella Network
    </div>
  </div>
</body>
</html>`;

    const senderEmail = process.env.SMTP_USER || ADMIN_CONTACT_EMAIL;
    const from = `"The Umbrella Network" <${senderEmail}>`;

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: params.studentEmail,
          replyTo: ADMIN_CONTACT_EMAIL,
          subject,
          html,
        });
        return {
          success: true,
          messageId: info.messageId,
          mode: 'smtp',
          subject,
          html,
          driveResourcesLink: GOOGLE_DRIVE_RESOURCES_LINK,
        };
      } catch (err: any) {
        console.error(`[EmailService] Pending UTR email error:`, err.message);
      }
    }

    return {
      success: true,
      messageId: `sim_pending_${Date.now()}`,
      mode: 'simulated',
      subject,
      html,
      driveResourcesLink: GOOGLE_DRIVE_RESOURCES_LINK,
    };
  }

  /**
   * Status check for email dispatch
   */
  public getStatus() {
    return {
      configured: this.isConfigured,
      sender: process.env.SMTP_USER || ADMIN_CONTACT_EMAIL,
      driveResourcesLink: GOOGLE_DRIVE_RESOURCES_LINK,
    };
  }
}

export const emailService = new EmailService();
