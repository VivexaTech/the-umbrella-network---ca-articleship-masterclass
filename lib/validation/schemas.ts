import { z } from 'zod';

export const createOrderSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().trim().email('Valid email address is required').max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ -]{10,15}$/, 'Valid 10-digit mobile number is required'),
  caLevel: z.string().min(1, 'CA level is required'),
  attemptDetails: z.string().max(255).optional().default(''),
});

export const verifyPaymentSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(20),
  caLevel: z.string().min(1),
  attemptDetails: z.string().max(255).optional().default(''),
  paymentMethod: z.enum(['Razorpay', 'UPI']).default('Razorpay'),
  razorpay_payment_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  upiUtr: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  email: z.string().trim().email('Valid email is required').max(255),
  phone: z.string().trim().max(20).optional().default(''),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const batchInputSchema = z.object({
  batch_number: z.string().trim().min(1),
  name: z.string().trim().min(1),
  start_date: z.string().trim().min(1),
  end_date: z.string().trim().min(1),
  registration_deadline: z.string().trim().min(1),
  fee: z.number().int().positive().default(999),
  whatsapp_link: z.string().trim().url('Valid WhatsApp invite URL required'),
  max_seats: z.number().int().nonnegative().default(100),
  status: z.enum(['active', 'upcoming', 'closed', 'completed']).default('upcoming'),
  description: z.string().optional().default(''),
});

export const speakerInputSchema = z.object({
  name: z.string().trim().min(1),
  firm: z.string().trim().min(1),
  domain: z.string().trim().min(1),
  image: z.string().optional().default(''),
  description: z.string().optional().default(''),
  linkedin_url: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']).default('active'),
  display_order: z.number().int().optional().default(0),
});

export const testimonialInputSchema = z.object({
  student_name: z.string().trim().min(1),
  designation: z.string().optional().default('Articleship Trainee'),
  firm: z.string().optional().default(''),
  domain: z.string().optional().default(''),
  testimonial: z.string().trim().min(10),
  image: z.string().optional().default(''),
  linkedin_url: z.string().optional().default(''),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});
