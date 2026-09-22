import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Batch, Student, Payment, Registration, Speaker, Testimonial, WebsiteSettings, StatisticItem } from '../src/types.js';

interface StorageData {
  batches: Batch[];
  students: Student[];
  payments: Payment[];
  registrations: Registration[];
  speakers: Speaker[];
  testimonials: Testimonial[];
  settings: WebsiteSettings;
  analytics: { id: string; eventType: string; metadata: any; timestamp: string }[];
  contactMessages: { id: string; name: string; email: string; phone: string; message: string; createdAt: string }[];
  sentEmails?: {
    id: string;
    to: string;
    studentName: string;
    subject: string;
    batchNumber: string;
    registrationNumber: string;
    driveResourcesLink: string;
    whatsappLink: string;
    sentAt: string;
    mode: 'smtp' | 'simulated';
  }[];
}

const DATA_FILE = path.join(process.cwd(), 'data-store.json');

const INITIAL_SETTINGS: WebsiteSettings = {
  hero_headline: "Your Articleship Search Needs More Than Just a CV.",
  hero_subtitle: "A practical 6-day masterclass to help you approach your CA articleship search with the right CV, strategy, communication and interview preparation.",
  statistics: [
    {
      id: "stat-1",
      number: "500+",
      title: "Students Placed",
      description: "500+ students have secured articleship opportunities through the guidance and support provided by Umbrella Network.",
      order: 1,
      visible: true,
    },
    {
      id: "stat-2",
      number: "100%",
      title: "Big 6 Interview Opportunities",
      description: "100% of students in the relevant tracked cohort received at least one interview opportunity from Big 6 firms.",
      order: 2,
      visible: true,
    },
    {
      id: "stat-3",
      number: "6 Days",
      title: "Practical Masterclass",
      description: "A structured 6-day program focused on articleship applications, CVs, domains, interviews and career preparation.",
      order: 3,
      visible: true,
    },
  ],
  pricing: {
    fee: 999,
    title: "Articleship Masterclass",
    duration: "6-Day Intensive Masterclass",
    refund_policy_note: "Fees once paid are non-refundable as cohort seats are limited and materials are shared upon registration.",
    certificate_included: true,
  },
  mentor: {
    name: "CA Harsh Kaushik",
    title: "Chartered Accountant | Articleship & Career Mentor",
    quote: "I created this masterclass because I remember how confusing the articleship search can be when you don't know where to start, how to approach firms, or how to present yourself.",
    credentials: [
      "Qualified CA in first attempt",
      "AIR 24 in CA Foundation",
      "Articleship at PwC",
      "Articleship at Flipkart",
      "Former Assistant Manager at Deloitte",
    ],
    linkedin_url: "https://www.linkedin.com/in/ca-harsh-kaushik/",
  },
  contact: {
    email: "caumbrellanetwork@gmail.com",
    phone: "+91 9996506041",
    whatsapp_general: "https://wa.me/919996506041?text=Hi%2C%20I%20have%20a%20query%20regarding%20the%20CA%20Articleship%20Masterclass",
    linkedin: "https://www.linkedin.com/in/ca-harsh-kaushik/",
  },
  faqs: [
    {
      question: "Who is this masterclass for?",
      answer: "CA students looking for articleship opportunities, especially CA Inter cleared students and students targeting reputed firms like Big 4, Big 6, top mid-size and consulting firms.",
    },
    {
      question: "Is this only for Big 4 aspirants?",
      answer: "No. The framework is relevant to students targeting Big 4, Big 6, reputed mid-size firms, consulting firms, corporate finance divisions, and other specialized organizations.",
    },
    {
      question: "How long is the masterclass?",
      answer: "The masterclass spans 6 structured, live interactive days with practical frameworks, mock interview practice, and actionable strategy sessions.",
    },
    {
      question: "What is the fee?",
      answer: "₹999 for the current batch. All masterclass sessions, templates, CV frameworks, and batch access are included without hidden fees.",
    },
    {
      question: "Will I get a WhatsApp group?",
      answer: "Yes. Immediately after successful registration and server verification, you receive the exclusive WhatsApp group link dedicated solely to your registered batch.",
    },
    {
      question: "Are placements guaranteed?",
      answer: "No. The masterclass provides guidance, preparation, frameworks, and curated resources but does not guarantee an articleship offer. Results depend on individual capability, preparation, and market openings.",
    },
    {
      question: "Are interviews guaranteed?",
      answer: "No. Historical outcomes (like 100% Big 6 interview opportunities in the tracked cohort) are historical results and do not guarantee future interview opportunities.",
    },
    {
      question: "Is the payment refundable?",
      answer: "Due to limited batch capacity and immediate allocation of batch resources, fees are non-refundable unless a batch is cancelled by Umbrella Network.",
    },
    {
      question: "Will I receive a certificate of completion?",
      answer: "Yes, active participants who complete the 6-day masterclass and submit their CV & practical assignment receive a certificate of completion.",
    },
  ],
};

const INITIAL_SPEAKERS: Speaker[] = [
  {
    id: "spk-1",
    name: "Vanshika Nihalani",
    firm: "Deloitte",
    domain: "Statutory Audit",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    description: "Secured Statutory Audit articleship at Deloitte; shares practical guidance on cracking Big 4 technical & managerial rounds.",
    linkedin_url: "https://www.linkedin.com/in/vanshika-nihalani0703/",
    status: "active",
  },
  {
    id: "spk-2",
    name: "Disha Pahwa",
    firm: "BDO",
    domain: "Statutory Audit",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    description: "Secured articleship at BDO in Statutory Audit; mentors students on structured resume building and first impressions.",
    linkedin_url: "https://www.linkedin.com/in/disha-pahwa-5155573b4/",
    status: "active",
  },
  {
    id: "spk-3",
    name: "Nitish Thawani",
    firm: "BDO",
    domain: "Statutory Audit",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    description: "Articleship at BDO; guides on technical questions, Ind AS fundamentals, and audit interview questions.",
    linkedin_url: "https://www.linkedin.com/in/nitishthawani01/",
    status: "active",
  },
  {
    id: "spk-4",
    name: "Faizal",
    firm: "EY",
    domain: "Direct Tax",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    description: "Direct Tax articleship at EY; shares strategies on answering tax case studies and HR interview questions.",
    linkedin_url: "https://www.linkedin.com/in/md-f-37359a36b/",
    status: "active",
  },
  {
    id: "spk-5",
    name: "Gitanjali Joshi",
    firm: "BDO",
    domain: "M&A Tax",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    description: "M&A Tax at BDO; helps students navigate niche domain selection, firm cultures, and strategic networking.",
    linkedin_url: "https://www.linkedin.com/in/gitanjali-joshi-58b9b5213/",
    status: "active",
  },
  {
    id: "spk-6",
    name: "Sparsh Garg",
    firm: "EY",
    domain: "Internal Audit",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    description: "Internal Audit at EY; guides candidates through risk consulting interview structures and group discussions.",
    linkedin_url: "https://www.linkedin.com/in/sparsh-garg-a52418327/",
    status: "active",
  },
  {
    id: "spk-7",
    name: "Sujal Agarwal",
    firm: "BDO",
    domain: "Accounting",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    description: "Accounting & Advisory at BDO; covers practical Excel skills, accounting standards, and cold emailing strategies.",
    linkedin_url: "https://www.linkedin.com/in/sujalagarwal07/",
    status: "active",
  },
];

const INITIAL_BATCHES: Batch[] = [
  {
    id: "batch-05",
    batch_number: "Batch #05",
    name: "Batch 05 Masterclass Cohort",
    start_date: "1 October 2026",
    end_date: "6 October 2026",
    registration_deadline: "30 September 2026, 11:59 PM",
    fee: 999,
    whatsapp_link: "https://chat.whatsapp.com/BeAGTr1Q7t63W8PBqXxnS5",
    max_seats: 100,
    seats_booked: 84,
    status: "active",
    description: "The premier 6-day live cohort for CA students targeting Big 4, Big 6 and premier firms with mock interviews and live feedback.",
    created_at: new Date().toISOString(),
  },
  {
    id: "batch-06",
    batch_number: "Batch #06",
    name: "Batch 06 Masterclass Cohort",
    start_date: "15 October 2026",
    end_date: "20 October 2026",
    registration_deadline: "14 October 2026, 11:59 PM",
    fee: 999,
    whatsapp_link: "https://chat.whatsapp.com/K8JmL9N5w034YyExampleB06",
    max_seats: 100,
    seats_booked: 14,
    status: "upcoming",
    description: "Upcoming cohort designed for students gearing up for articleship recruitment drives in Q4 2026.",
    created_at: new Date().toISOString(),
  },
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    student_name: "Chetan Patil",
    designation: "Articleship Trainee",
    firm: "PwC",
    domain: "Statutory Audit",
    testimonial: "Before joining Umbrella Network, I sent out 40+ CVs with zero responses. Harsh bhaiya helped me restructure my CV around specific audit keywords and taught me how to write impactful emails. Within 2 weeks, I had interview calls from 2 Big 4s and converted PwC.",
    status: "published",
    created_at: new Date().toISOString(),
  },
  {
    id: "test-2",
    student_name: "Om Shukla",
    designation: "Articleship Trainee",
    firm: "Deloitte",
    domain: "Stat Audit",
    testimonial: "The domain comparison matrix and mock interview feedback were gold. In college, no one tells you the real difference between internal audit, stat audit, and risk advisory. This masterclass gave me clarity and confidence.",
    status: "published",
    created_at: new Date().toISOString(),
  },
  {
    id: "test-3",
    student_name: "Sneha Solanki",
    designation: "Articleship Trainee",
    firm: "EY",
    domain: "Direct Tax",
    testimonial: "The Excel session alone saved me hundreds of hours. The 6-day roadmap broke down the daunting articleship search into manageable daily steps. Highly recommended for every CA Inter student.",
    status: "published",
    created_at: new Date().toISOString(),
  },
];

class DataStore {
  private data: StorageData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading data from file, falling back to defaults:', err);
    }
    const defaultData: StorageData = {
      batches: INITIAL_BATCHES,
      students: [],
      payments: [],
      registrations: [],
      speakers: INITIAL_SPEAKERS,
      testimonials: INITIAL_TESTIMONIALS,
      settings: INITIAL_SETTINGS,
      analytics: [],
      contactMessages: [],
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: StorageData) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting data store:', err);
    }
  }

  // --- Batches ---
  public getBatches(includePrivate = false): Batch[] {
    if (includePrivate) {
      return this.data.batches;
    }
    // PUBLIC SANITIZED LIST: NEVER EXPOSE WHATSAPP LINK IN PUBLIC FEEDS
    return this.data.batches.map(b => ({
      ...b,
      whatsapp_link: '', // Stripped for public consumption
    }));
  }

  public getBatchById(id: string, includePrivate = false): Batch | undefined {
    const batch = this.data.batches.find(b => b.id === id);
    if (!batch) return undefined;
    if (includePrivate) return batch;
    return { ...batch, whatsapp_link: '' };
  }

  public getActiveBatch(includePrivate = false): Batch | undefined {
    const batch = this.data.batches.find(b => b.status === 'active') || this.data.batches[0];
    if (!batch) return undefined;
    if (includePrivate) return batch;
    return { ...batch, whatsapp_link: '' };
  }

  public createBatch(batchData: Omit<Batch, 'id' | 'created_at' | 'seats_booked'>): Batch {
    const id = `batch-${Date.now()}`;
    const newBatch: Batch = {
      ...batchData,
      id,
      seats_booked: 0,
      created_at: new Date().toISOString(),
    };
    this.data.batches.push(newBatch);
    this.saveData();
    return newBatch;
  }

  public updateBatch(id: string, updates: Partial<Batch>): Batch | null {
    const index = this.data.batches.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.data.batches[index] = { ...this.data.batches[index], ...updates };
    this.saveData();
    return this.data.batches[index];
  }

  public deleteBatch(id: string): boolean {
    const prevLength = this.data.batches.length;
    this.data.batches = this.data.batches.filter(b => b.id !== id);
    if (this.data.batches.length !== prevLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Registrations & Verification ---
  public registerStudentAndPayment(params: {
    fullName: string;
    email: string;
    phone: string;
    caLevel: string;
    attemptDetails?: string;
    batchId: string;
    amount: number;
    paymentId: string;
    orderId: string;
    signature?: string;
    paymentMethod?: string;
    upiUtr?: string;
  }): { success: boolean; error?: string; registration?: Registration; whatsappLink?: string } {
    const batch = this.data.batches.find(b => b.id === params.batchId);
    if (!batch) {
      return { success: false, error: 'Selected batch was not found.' };
    }

    if (batch.status === 'closed') {
      return { success: false, error: 'Registration for this batch is currently closed.' };
    }

    if (batch.max_seats > 0 && batch.seats_booked >= batch.max_seats) {
      return { success: false, error: 'This batch is completely full. Please choose another batch.' };
    }

    // Check duplicate payment
    const existingPayment = this.data.payments.find(p => p.payment_id === params.paymentId);
    if (existingPayment && existingPayment.payment_status === 'successful') {
      // Duplicate protection: retrieve existing registration
      const reg = this.data.registrations.find(r => r.payment_id === existingPayment.id);
      if (reg) {
        return {
          success: true,
          registration: reg,
          whatsappLink: reg.status === 'verified' ? batch.whatsapp_link : undefined,
        };
      }
    }

    const isUpi = params.paymentMethod === 'UPI' || (params.upiUtr && params.upiUtr.length > 0);

    // Strict validation for Direct UPI payments
    if (isUpi) {
      const cleanUtr = (params.upiUtr || '').trim();
      if (!cleanUtr) {
        return { success: false, error: 'UPI Reference / UTR Number is required for UPI payments.' };
      }
      if (!/^\d{12}$/.test(cleanUtr)) {
        return {
          success: false,
          error: `Invalid UTR "${cleanUtr}". Indian banking UPI Reference / UTR must be exactly 12 numeric digits (e.g. 426819204912). Letters, spaces, or short strings are not allowed.`,
        };
      }
      // Check for obvious dummy sequences
      if (/^(\d)\1{11}$/.test(cleanUtr)) {
        return {
          success: false,
          error: `Invalid UTR "${cleanUtr}". Repetitive digits (like 000000000000 or 111111111111) are rejected as invalid.`,
        };
      }
      const dummySequences = ['123456789012', '987654321098', '012345678901', '123456789123', '098765432109'];
      if (dummySequences.includes(cleanUtr)) {
        return {
          success: false,
          error: `Invalid UTR "${cleanUtr}". Please enter the genuine 12-digit transaction UTR from your bank or UPI payment receipt.`,
        };
      }

      // Check if this UTR has already been claimed by another student
      const duplicateUtrReg = this.data.registrations.find(r => r.upi_utr === cleanUtr);
      if (duplicateUtrReg) {
        return {
          success: false,
          error: `Duplicate UTR! This 12-digit UPI reference (${cleanUtr}) has already been registered on ${new Date(duplicateUtrReg.created_at).toLocaleDateString()}. Each payment must have a unique reference.`,
        };
      }
    }

    // 1. Create / Update Student record
    let student = this.data.students.find(s => s.email.toLowerCase() === params.email.toLowerCase());
    if (!student) {
      student = {
        id: `stu-${crypto.randomUUID().slice(0, 8)}`,
        name: params.fullName,
        email: params.email.toLowerCase(),
        phone: params.phone,
        ca_level: params.caLevel,
        attempt_details: params.attemptDetails || '',
        created_at: new Date().toISOString(),
      };
      this.data.students.push(student);
    } else {
      // update phone and ca_level
      student.phone = params.phone;
      student.ca_level = params.caLevel;
      if (params.attemptDetails) student.attempt_details = params.attemptDetails;
    }

    // 2. Create Payment record
    // Direct UPI payments start as 'pending' until bank verification
    const paymentId = `pay-${crypto.randomUUID().slice(0, 8)}`;
    const initialStatus = isUpi ? 'pending' : 'successful';
    const initialRegStatus = isUpi ? 'pending_verification' : 'verified';

    const payment: Payment = {
      id: paymentId,
      student_id: student.id,
      batch_id: batch.id,
      amount: params.amount,
      gateway: isUpi ? 'UPI (harshkaushiks07@okicici)' : 'razorpay',
      payment_id: params.upiUtr || params.paymentId,
      order_id: params.orderId || (isUpi ? 'upi-direct-payment' : `order_${Date.now()}`),
      signature: params.signature || (isUpi ? 'upi_submitted' : ''),
      payment_status: initialStatus,
      created_at: new Date().toISOString(),
    };
    this.data.payments.push(payment);

    // 3. Create Registration Record
    const regNum = `UN-REG-${Date.now().toString().slice(-6)}`;
    const regId = `reg-${crypto.randomUUID().slice(0, 8)}`;
    const registration: Registration = {
      id: regId,
      registration_number: regNum,
      student_id: student.id,
      batch_id: batch.id,
      payment_id: payment.id,
      student_name: student.name,
      student_email: student.email,
      student_phone: student.phone,
      ca_level: student.ca_level,
      batch_number: batch.batch_number,
      batch_name: batch.name,
      batch_date: `${batch.start_date} - ${batch.end_date}`,
      amount: params.amount,
      payment_method: isUpi ? 'UPI (harshkaushiks07@okicici)' : 'Razorpay',
      upi_utr: isUpi ? params.upiUtr : undefined,
      status: initialRegStatus,
      verified_at: isUpi ? undefined : new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.data.registrations.push(registration);

    // 4. Increment seats booked
    batch.seats_booked += 1;

    this.saveData();

    return {
      success: true,
      registration,
      // Only reveal WhatsApp link immediately if verified!
      whatsappLink: initialRegStatus === 'verified' ? batch.whatsapp_link : undefined,
    };
  }

  public approveUpiRegistration(id: string): { success: boolean; error?: string; registration?: Registration; whatsappLink?: string } {
    const reg = this.data.registrations.find(r => r.id === id || r.registration_number === id);
    if (!reg) return { success: false, error: 'Registration record not found.' };

    reg.status = 'verified';
    reg.verified_at = new Date().toISOString();

    const payment = this.data.payments.find(p => p.id === reg.payment_id);
    if (payment) {
      payment.payment_status = 'successful';
    }

    const batch = this.data.batches.find(b => b.id === reg.batch_id);
    this.saveData();

    return {
      success: true,
      registration: reg,
      whatsappLink: batch ? batch.whatsapp_link : '',
    };
  }

  public rejectUpiRegistration(id: string, reason: string): { success: boolean; error?: string; registration?: Registration } {
    const reg = this.data.registrations.find(r => r.id === id || r.registration_number === id);
    if (!reg) return { success: false, error: 'Registration record not found.' };

    reg.status = 'rejected';
    reg.rejection_reason = reason || 'Payment could not be verified in bank records.';

    const payment = this.data.payments.find(p => p.id === reg.payment_id);
    if (payment) {
      payment.payment_status = 'failed';
    }

    // Release seat if rejected
    const batch = this.data.batches.find(b => b.id === reg.batch_id);
    if (batch && batch.seats_booked > 0) {
      batch.seats_booked -= 1;
    }

    this.saveData();
    return { success: true, registration: reg };
  }

  public getRegistrations(): Registration[] {
    return this.data.registrations;
  }

  public getRegistrationById(id: string): (Registration & { whatsapp_link: string }) | null {
    const reg = this.data.registrations.find(r => r.id === id || r.registration_number === id);
    if (!reg) return null;
    const batch = this.data.batches.find(b => b.id === reg.batch_id);
    return {
      ...reg,
      whatsapp_link: batch ? batch.whatsapp_link : '',
    };
  }

  public getStudents(): Student[] {
    return this.data.students;
  }

  // --- Speakers ---
  public getSpeakers(): Speaker[] {
    return this.data.speakers;
  }

  public addSpeaker(speaker: Omit<Speaker, 'id'>): Speaker {
    const newSpeaker: Speaker = {
      ...speaker,
      id: `spk-${Date.now()}`,
    };
    this.data.speakers.push(newSpeaker);
    this.saveData();
    return newSpeaker;
  }

  public updateSpeaker(id: string, updates: Partial<Speaker>): Speaker | null {
    const index = this.data.speakers.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.speakers[index] = { ...this.data.speakers[index], ...updates };
    this.saveData();
    return this.data.speakers[index];
  }

  public deleteSpeaker(id: string): boolean {
    const initialLen = this.data.speakers.length;
    this.data.speakers = this.data.speakers.filter(s => s.id !== id);
    if (this.data.speakers.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Testimonials ---
  public getTestimonials(includeDrafts = false): Testimonial[] {
    if (includeDrafts) return this.data.testimonials;
    return this.data.testimonials.filter(t => t.status === 'published');
  }

  public addTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at'>): Testimonial {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.testimonials.push(newTestimonial);
    this.saveData();
    return newTestimonial;
  }

  public updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
    const index = this.data.testimonials.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.testimonials[index] = { ...this.data.testimonials[index], ...updates };
    this.saveData();
    return this.data.testimonials[index];
  }

  public deleteTestimonial(id: string): boolean {
    const initialLen = this.data.testimonials.length;
    this.data.testimonials = this.data.testimonials.filter(t => t.id !== id);
    if (this.data.testimonials.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Settings ---
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
    return this.data.settings;
  }

  // --- Analytics ---
  public trackEvent(eventType: string, metadata: any) {
    this.data.analytics.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
    });
    // Cap analytics in memory to latest 1000 items
    if (this.data.analytics.length > 1000) {
      this.data.analytics = this.data.analytics.slice(-1000);
    }
    this.saveData();
  }

  public getAnalyticsSummary() {
    const totalVisits = this.data.analytics.filter(e => e.eventType === 'page_view').length;
    const ctaClicks = this.data.analytics.filter(e => e.eventType === 'cta_click').length;
    const checkoutStarts = this.data.analytics.filter(e => e.eventType === 'checkout_start').length;
    const successfulPayments = this.data.payments.filter(p => p.payment_status === 'successful').length;
    const totalRevenue = this.data.payments
      .filter(p => p.payment_status === 'successful')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalVisits,
      ctaClicks,
      checkoutStarts,
      successfulPayments,
      totalRevenue,
      totalRegistrations: this.data.registrations.length,
      conversionRate: totalVisits > 0 ? ((successfulPayments / totalVisits) * 100).toFixed(2) + '%' : '0%',
      recentEvents: this.data.analytics.slice(-20).reverse(),
    };
  }

  // --- Contact Messages ---
  public addContactMessage(message: { name: string; email: string; phone: string; message: string }) {
    const record = {
      id: `msg-${Date.now()}`,
      ...message,
      createdAt: new Date().toISOString(),
    };
    this.data.contactMessages.push(record);
    this.saveData();
    return record;
  }

  public getContactMessages() {
    return this.data.contactMessages;
  }

  // --- Email Acknowledgment Log ---
  public recordSentEmail(emailRecord: {
    to: string;
    studentName: string;
    subject: string;
    batchNumber: string;
    registrationNumber: string;
    driveResourcesLink: string;
    whatsappLink: string;
    mode: 'smtp' | 'simulated';
  }) {
    if (!this.data.sentEmails) {
      this.data.sentEmails = [];
    }
    const record = {
      id: `mail-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...emailRecord,
      sentAt: new Date().toISOString(),
    };
    this.data.sentEmails.unshift(record);
    // Keep max 200 email logs
    if (this.data.sentEmails.length > 200) {
      this.data.sentEmails = this.data.sentEmails.slice(0, 200);
    }
    this.saveData();
    return record;
  }

  public getSentEmails() {
    return this.data.sentEmails || [];
  }
}

export const db = new DataStore();
