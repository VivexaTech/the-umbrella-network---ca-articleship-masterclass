export interface Batch {
  id: string;
  batch_number: string;
  name: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  fee: number;
  whatsapp_link: string;
  max_seats: number;
  seats_booked: number;
  status: 'active' | 'upcoming' | 'closed' | 'completed';
  description: string;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  ca_level: string;
  attempt_details?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  batch_id: string;
  amount: number;
  gateway: string;
  payment_id: string;
  order_id: string;
  signature?: string;
  payment_status: 'successful' | 'failed' | 'pending' | 'refunded';
  created_at: string;
}

export interface Registration {
  id: string;
  registration_number: string;
  student_id: string;
  batch_id: string;
  payment_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  ca_level: string;
  batch_number: string;
  batch_name: string;
  batch_date: string;
  amount: number;
  payment_method?: string;
  upi_utr?: string;
  status?: 'verified' | 'pending_verification' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
}

export interface Speaker {
  id: string;
  name: string;
  firm: string;
  domain: string;
  image?: string;
  description: string;
  linkedin_url?: string;
  status: 'active' | 'inactive';
}

export interface Testimonial {
  id: string;
  student_name: string;
  designation?: string;
  firm?: string;
  domain?: string;
  testimonial: string;
  image?: string;
  linkedin_url?: string;
  status: 'published' | 'draft';
  created_at: string;
}

export interface StatisticItem {
  id: string;
  number: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
}

export interface WebsiteSettings {
  hero_headline: string;
  hero_subtitle: string;
  statistics: StatisticItem[];
  pricing: {
    fee: number;
    title: string;
    duration: string;
    refund_policy_note: string;
    certificate_included: boolean;
  };
  mentor: {
    name: string;
    title: string;
    quote: string;
    credentials: string[];
    linkedin_url: string;
    image_url?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp_general: string;
    linkedin: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  caLevel: string;
  attemptDetails: string;
  batchId: string;
}

export interface PaymentSuccessResponse {
  success: boolean;
  message: string;
  registrationId: string;
  registrationNumber: string;
  studentName: string;
  studentEmail?: string;
  batchNumber: string;
  batchName?: string;
  batchDate: string;
  amount: number;
  paymentId: string;
  paymentMethod?: string;
  upiUtr?: string;
  status?: 'verified' | 'pending_verification' | 'rejected';
  requiresVerification?: boolean;
  whatsappLink?: string; // only revealed securely upon confirmed verification
  driveResourcesLink?: string; // Google Drive folder with all masterclass resources
  emailSent?: boolean;
}
