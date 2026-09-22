import crypto from 'crypto';
import { getSupabaseServerClient, isSupabaseConfigured } from '../supabase/server';
import type {
  Batch,
  Student,
  Payment,
  Registration,
  Speaker,
  Testimonial,
  WebsiteSettings,
} from '../types';
import {
  DEFAULT_BATCHES,
  DEFAULT_SETTINGS,
  DEFAULT_SPEAKERS,
  DEFAULT_TESTIMONIALS,
} from '../../src/data/defaultData';

export const GOOGLE_DRIVE_RESOURCES_LINK =
  process.env.GOOGLE_DRIVE_RESOURCES_URL ||
  'https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD';

// In-memory fallback cache when Supabase is initializing or credentials are pending setup
let memoryBatches: Batch[] = JSON.parse(JSON.stringify(DEFAULT_BATCHES));
let memorySettings: WebsiteSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
let memorySpeakers: Speaker[] = JSON.parse(JSON.stringify(DEFAULT_SPEAKERS));
let memoryTestimonials: Testimonial[] = JSON.parse(JSON.stringify(DEFAULT_TESTIMONIALS));
let memoryRegistrations: Registration[] = [];
let memoryStudents: Student[] = [];
let memoryPayments: Payment[] = [];
let memoryWebhooks: Set<string> = new Set();
let memoryResourceTokens: Map<string, { registrationId: string; url: string; createdAt: Date }> = new Map();
let memoryAuditLogs: any[] = [];
let memoryContactMessages: any[] = [];

export class DatabaseService {
  // ----------------------------------------------------
  // BATCH MANAGEMENT
  // ----------------------------------------------------
  async getBatches(includePrivate = false): Promise<Batch[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .select('*')
          .order('start_date', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            ...b,
            whatsapp_link: includePrivate ? b.whatsapp_link : '',
          }));
        }
      } catch (err) {
        console.warn('[DB] Supabase query failed, using memory state:', err);
      }
    }

    return memoryBatches.map((b) => ({
      ...b,
      whatsapp_link: includePrivate ? b.whatsapp_link : '',
    }));
  }

  async getActiveBatch(includePrivate = false): Promise<Batch | null> {
    const batches = await this.getBatches(true);
    const active = batches.find((b) => b.status === 'active') || batches[0] || null;
    if (!active) return null;
    return {
      ...active,
      whatsapp_link: includePrivate ? active.whatsapp_link : '',
    };
  }

  async getBatchById(id: string, includePrivate = false): Promise<Batch | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            ...data,
            whatsapp_link: includePrivate ? data.whatsapp_link : '',
          };
        }
      } catch (err) {
        console.warn('[DB] Supabase getBatchById failed:', err);
      }
    }

    const found = memoryBatches.find((b) => b.id === id || b.batch_number === id);
    if (!found) return null;
    return {
      ...found,
      whatsapp_link: includePrivate ? found.whatsapp_link : '',
    };
  }

  async createBatch(data: Omit<Batch, 'id' | 'created_at' | 'seats_booked'>): Promise<Batch> {
    const newBatch: Batch = {
      ...data,
      id: crypto.randomUUID(),
      seats_booked: 0,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('batches')
          .insert(newBatch)
          .select()
          .single();
        if (!error && inserted) {
          memoryBatches.push(inserted);
          await this.logAudit('admin', 'create_batch', 'batches', inserted.id, inserted);
          return inserted;
        }
      } catch (err) {
        console.error('[DB] Failed to insert batch to Supabase:', err);
      }
    }

    memoryBatches.push(newBatch);
    await this.logAudit('admin', 'create_batch', 'batches', newBatch.id, newBatch);
    return newBatch;
  }

  async updateBatch(id: string, data: Partial<Batch>): Promise<Batch | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('batches')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && updated) {
          const idx = memoryBatches.findIndex((b) => b.id === id);
          if (idx !== -1) memoryBatches[idx] = updated;
          await this.logAudit('admin', 'update_batch', 'batches', id, data);
          return updated;
        }
      } catch (err) {
        console.error('[DB] Failed to update batch in Supabase:', err);
      }
    }

    const idx = memoryBatches.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    memoryBatches[idx] = { ...memoryBatches[idx], ...data };
    await this.logAudit('admin', 'update_batch', 'batches', id, data);
    return memoryBatches[idx];
  }

  async deleteBatch(id: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('batches').delete().eq('id', id);
        if (!error) {
          memoryBatches = memoryBatches.filter((b) => b.id !== id);
          await this.logAudit('admin', 'delete_batch', 'batches', id, {});
          return true;
        }
      } catch (err) {
        console.error('[DB] Failed to delete batch in Supabase:', err);
      }
    }

    const before = memoryBatches.length;
    memoryBatches = memoryBatches.filter((b) => b.id !== id);
    return memoryBatches.length < before;
  }

  // ----------------------------------------------------
  // ATOMIC SEAT MANAGEMENT (Prevents Race Conditions)
  // ----------------------------------------------------
  async atomicReserveSeat(batchId: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        // Try calling atomic RPC stored function first
        const { data, error } = await supabase.rpc('increment_batch_seats', {
          p_batch_id: batchId,
        });

        if (!error && typeof data === 'boolean') {
          return data;
        }

        // Fallback atomic SQL query if stored procedure not yet compiled in Supabase
        const { data: batch } = await supabase
          .from('batches')
          .select('seats_booked, max_seats')
          .eq('id', batchId)
          .single();

        if (batch) {
          if (batch.max_seats > 0 && batch.seats_booked >= batch.max_seats) {
            return false;
          }
          const { error: updErr } = await supabase
            .from('batches')
            .update({ seats_booked: batch.seats_booked + 1, updated_at: new Date().toISOString() })
            .eq('id', batchId)
            .eq('seats_booked', batch.seats_booked); // optimistic lock

          return !updErr;
        }
      } catch (err) {
        console.warn('[DB] Atomic seat reservation RPC fallback:', err);
      }
    }

    const b = memoryBatches.find((x) => x.id === batchId);
    if (!b) return false;
    if (b.max_seats > 0 && b.seats_booked >= b.max_seats) return false;
    b.seats_booked += 1;
    return true;
  }

  // ----------------------------------------------------
  // STUDENT & REGISTRATION MANAGEMENT
  // ----------------------------------------------------
  async createOrGetStudent(data: {
    name: string;
    email: string;
    phone: string;
    caLevel: string;
    attemptDetails?: string;
  }): Promise<Student> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('students')
          .select('*')
          .eq('email', data.email.toLowerCase().trim())
          .maybeSingle();

        if (existing) {
          return existing;
        }

        const newStudent = {
          id: crypto.randomUUID(),
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone.trim(),
          ca_level: data.caLevel,
          attempt_details: data.attemptDetails || '',
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error } = await supabase
          .from('students')
          .insert(newStudent)
          .select()
          .single();

        if (!error && inserted) {
          return inserted;
        }
      } catch (err) {
        console.warn('[DB] Supabase student create failed, fallback:', err);
      }
    }

    const found = memoryStudents.find((s) => s.email === data.email.toLowerCase().trim());
    if (found) return found;

    const student: Student = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      ca_level: data.caLevel,
      attempt_details: data.attemptDetails || '',
      created_at: new Date().toISOString(),
    };
    memoryStudents.push(student);
    return student;
  }

  async createRegistration(params: {
    student: Student;
    batch: Batch;
    amount: number;
    paymentMethod: string;
    paymentId?: string;
    upiUtr?: string;
    status: 'confirmed' | 'pending_verification';
  }): Promise<Registration> {
    const regNumber = `UN-B${params.batch.batch_number.replace(/\D/g, '') || '05'}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newReg: Registration = {
      id: crypto.randomUUID(),
      registration_number: regNumber,
      student_id: params.student.id,
      batch_id: params.batch.id,
      payment_id: params.paymentId,
      student_name: params.student.name,
      student_email: params.student.email,
      student_phone: params.student.phone,
      ca_level: params.student.ca_level,
      batch_number: params.batch.batch_number,
      batch_name: params.batch.name,
      batch_date: `${params.batch.start_date} - ${params.batch.end_date}`,
      amount: params.amount,
      payment_method: params.paymentMethod,
      upi_utr: params.upiUtr,
      status: params.status,
      whatsapp_link: params.status === 'confirmed' ? params.batch.whatsapp_link : undefined,
      verified_at: params.status === 'confirmed' ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('registrations')
          .insert({
            id: newReg.id,
            registration_number: newReg.registration_number,
            student_id: newReg.student_id,
            batch_id: newReg.batch_id,
            payment_id: newReg.payment_id,
            status: newReg.status,
            amount: newReg.amount,
            payment_method: newReg.payment_method,
            upi_utr: newReg.upi_utr,
            verified_at: newReg.verified_at,
            created_at: newReg.created_at,
          })
          .select()
          .single();

        if (!error && inserted) {
          memoryRegistrations.push(newReg);
          await this.logAudit(
            params.student.email,
            'create_registration',
            'registrations',
            newReg.id,
            { status: params.status, batch: params.batch.batch_number }
          );
          return newReg;
        }
      } catch (err) {
        console.warn('[DB] Supabase registration insert failed:', err);
      }
    }

    memoryRegistrations.push(newReg);
    await this.logAudit(
      params.student.email,
      'create_registration',
      'registrations',
      newReg.id,
      { status: params.status, batch: params.batch.batch_number }
    );
    return newReg;
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select(
            `
            id, registration_number, student_id, batch_id, payment_id, status, amount, payment_method, upi_utr, rejection_reason, verified_at, created_at,
            students:student_id ( name, email, phone, ca_level ),
            batches:batch_id ( batch_number, name, start_date, end_date, whatsapp_link )
          `
          )
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const student = (data as any).students || {};
          const batch = (data as any).batches || {};
          return {
            id: data.id,
            registration_number: data.registration_number,
            student_id: data.student_id,
            batch_id: data.batch_id,
            payment_id: data.payment_id,
            student_name: student.name || '',
            student_email: student.email || '',
            student_phone: student.phone || '',
            ca_level: student.ca_level || '',
            batch_number: batch.batch_number || '',
            batch_name: batch.name || '',
            batch_date: `${batch.start_date || ''} - ${batch.end_date || ''}`,
            amount: data.amount,
            payment_method: data.payment_method,
            upi_utr: data.upi_utr,
            status: data.status,
            rejection_reason: data.rejection_reason,
            whatsapp_link: data.status === 'confirmed' ? batch.whatsapp_link : undefined,
            verified_at: data.verified_at,
            created_at: data.created_at,
          };
        }
      } catch (err) {
        console.warn('[DB] getRegistrationById failed:', err);
      }
    }

    const found = memoryRegistrations.find((r) => r.id === id || r.registration_number === id);
    return found || null;
  }

  async getRegistrations(filter?: {
    search?: string;
    batchId?: string;
    status?: string;
  }): Promise<Registration[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        let query = supabase
          .from('registrations')
          .select(
            `
            id, registration_number, student_id, batch_id, payment_id, status, amount, payment_method, upi_utr, rejection_reason, verified_at, created_at,
            students:student_id ( name, email, phone, ca_level ),
            batches:batch_id ( batch_number, name, start_date, end_date, whatsapp_link )
          `
          )
          .order('created_at', { ascending: false });

        if (filter?.batchId) query = query.eq('batch_id', filter.batchId);
        if (filter?.status) query = query.eq('status', filter.status);

        const { data, error } = await query;
        if (!error && data) {
          return data.map((d: any) => {
            const student = d.students || {};
            const batch = d.batches || {};
            return {
              id: d.id,
              registration_number: d.registration_number,
              student_id: d.student_id,
              batch_id: d.batch_id,
              payment_id: d.payment_id,
              student_name: student.name || '',
              student_email: student.email || '',
              student_phone: student.phone || '',
              ca_level: student.ca_level || '',
              batch_number: batch.batch_number || '',
              batch_name: batch.name || '',
              batch_date: `${batch.start_date || ''} - ${batch.end_date || ''}`,
              amount: d.amount,
              payment_method: d.payment_method,
              upi_utr: d.upi_utr,
              status: d.status,
              rejection_reason: d.rejection_reason,
              whatsapp_link: d.status === 'confirmed' ? batch.whatsapp_link : undefined,
              verified_at: d.verified_at,
              created_at: d.created_at,
            };
          });
        }
      } catch (err) {
        console.warn('[DB] Supabase getRegistrations failed:', err);
      }
    }

    let result = [...memoryRegistrations];
    if (filter?.batchId) result = result.filter((r) => r.batch_id === filter.batchId);
    if (filter?.status) result = result.filter((r) => r.status === filter.status);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.student_email.toLowerCase().includes(q) ||
          r.registration_number.toLowerCase().includes(q) ||
          (r.upi_utr && r.upi_utr.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async approveUpiRegistration(id: string): Promise<{ success: boolean; registration?: Registration; error?: string }> {
    const reg = await this.getRegistrationById(id);
    if (!reg) return { success: false, error: 'Registration not found' };

    const batch = await this.getBatchById(reg.batch_id, true);
    if (!batch) return { success: false, error: 'Batch not found' };

    // Atomic seat allocation
    await this.atomicReserveSeat(batch.id);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase
          .from('registrations')
          .update({
            status: 'confirmed',
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.error('[DB] Supabase approve UPI error:', err);
      }
    }

    reg.status = 'confirmed';
    reg.verified_at = new Date().toISOString();
    reg.whatsapp_link = batch.whatsapp_link;

    const memIdx = memoryRegistrations.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      memoryRegistrations[memIdx] = reg;
    }

    await this.logAudit('admin', 'approve_upi_registration', 'registrations', id, {
      student_email: reg.student_email,
      batch: reg.batch_number,
    });

    return { success: true, registration: reg };
  }

  async rejectUpiRegistration(id: string, reason: string): Promise<{ success: boolean; registration?: Registration; error?: string }> {
    const reg = await this.getRegistrationById(id);
    if (!reg) return { success: false, error: 'Registration not found' };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase
          .from('registrations')
          .update({
            status: 'rejected',
            rejection_reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.error('[DB] Supabase reject UPI error:', err);
      }
    }

    reg.status = 'rejected';
    reg.rejection_reason = reason;

    const memIdx = memoryRegistrations.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      memoryRegistrations[memIdx] = reg;
    }

    await this.logAudit('admin', 'reject_upi_registration', 'registrations', id, { reason });
    return { success: true, registration: reg };
  }

  // ----------------------------------------------------
  // PAYMENT LOGGING & WEBHOOK IDEMPOTENCY
  // ----------------------------------------------------
  async recordPayment(payment: Payment): Promise<void> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('payments').upsert({
          student_id: payment.student_id,
          batch_id: payment.batch_id,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          signature: payment.signature,
          payment_status: payment.payment_status,
          upi_utr: payment.upi_utr,
          created_at: payment.created_at,
        });
      } catch (err) {
        console.warn('[DB] Supabase recordPayment failed:', err);
      }
    }
    memoryPayments.push(payment);
  }

  async isWebhookProcessed(eventId: string): Promise<boolean> {
    if (memoryWebhooks.has(eventId)) return true;

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data } = await supabase
          .from('payment_webhooks')
          .select('event_id')
          .eq('event_id', eventId)
          .maybeSingle();

        if (data) {
          memoryWebhooks.add(eventId);
          return true;
        }
      } catch (err) {
        console.warn('[DB] isWebhookProcessed query failed:', err);
      }
    }

    return false;
  }

  async recordWebhookEvent(params: {
    eventId: string;
    eventType: string;
    orderId?: string;
    paymentId?: string;
    payload: any;
  }): Promise<void> {
    memoryWebhooks.add(params.eventId);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('payment_webhooks').insert({
          event_id: params.eventId,
          event_type: params.eventType,
          order_id: params.orderId || null,
          payment_id: params.paymentId || null,
          payload: params.payload,
          processed: true,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[DB] recordWebhookEvent failed:', err);
      }
    }

    await this.logAudit('webhook', params.eventType, 'payment_webhooks', params.eventId, {
      orderId: params.orderId,
      paymentId: params.paymentId,
    });
  }

  // ----------------------------------------------------
  // RESOURCE ACCESS SYSTEM (Secure Drive Links)
  // ----------------------------------------------------
  async createResourceAccess(registrationId: string, studentId?: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('resource_access').insert({
          registration_id: registrationId,
          student_id: studentId || null,
          resource_url: GOOGLE_DRIVE_RESOURCES_LINK,
          access_token: token,
          is_active: true,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[DB] Supabase resource_access insert failed:', err);
      }
    }

    memoryResourceTokens.set(token, {
      registrationId,
      url: GOOGLE_DRIVE_RESOURCES_LINK,
      createdAt: new Date(),
    });

    return token;
  }

  async verifyResourceAccess(token: string): Promise<{ valid: boolean; resourceUrl?: string }> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('resource_access')
          .select('*')
          .eq('access_token', token)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && data) {
          // Update last accessed
          await supabase
            .from('resource_access')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('id', data.id);

          return { valid: true, resourceUrl: data.resource_url || GOOGLE_DRIVE_RESOURCES_LINK };
        }
      } catch (err) {
        console.warn('[DB] Supabase verifyResourceAccess failed:', err);
      }
    }

    const found = memoryResourceTokens.get(token);
    if (found) {
      return { valid: true, resourceUrl: found.url };
    }

    return { valid: false };
  }

  // ----------------------------------------------------
  // SPEAKERS MANAGEMENT
  // ----------------------------------------------------
  async getSpeakers(): Promise<Speaker[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('speakers')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[DB] Supabase getSpeakers error:', err);
      }
    }
    return memorySpeakers;
  }

  async addSpeaker(data: Omit<Speaker, 'id'>): Promise<Speaker> {
    const speaker: Speaker = { ...data, id: crypto.randomUUID() };
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('speakers')
          .insert(speaker)
          .select()
          .single();
        if (!error && inserted) {
          memorySpeakers.push(inserted);
          await this.logAudit('admin', 'add_speaker', 'speakers', inserted.id, inserted);
          return inserted;
        }
      } catch (err) {
        console.error('[DB] Add speaker to Supabase error:', err);
      }
    }
    memorySpeakers.push(speaker);
    await this.logAudit('admin', 'add_speaker', 'speakers', speaker.id, speaker);
    return speaker;
  }

  async updateSpeaker(id: string, data: Partial<Speaker>): Promise<Speaker | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('speakers')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && updated) {
          const idx = memorySpeakers.findIndex((s) => s.id === id);
          if (idx !== -1) memorySpeakers[idx] = updated;
          await this.logAudit('admin', 'update_speaker', 'speakers', id, data);
          return updated;
        }
      } catch (err) {
        console.error('[DB] Update speaker in Supabase error:', err);
      }
    }
    const idx = memorySpeakers.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    memorySpeakers[idx] = { ...memorySpeakers[idx], ...data };
    await this.logAudit('admin', 'update_speaker', 'speakers', id, data);
    return memorySpeakers[idx];
  }

  async deleteSpeaker(id: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('speakers').delete().eq('id', id);
        if (!error) {
          memorySpeakers = memorySpeakers.filter((s) => s.id !== id);
          await this.logAudit('admin', 'delete_speaker', 'speakers', id, {});
          return true;
        }
      } catch (err) {
        console.error('[DB] Delete speaker in Supabase error:', err);
      }
    }
    const before = memorySpeakers.length;
    memorySpeakers = memorySpeakers.filter((s) => s.id !== id);
    return memorySpeakers.length < before;
  }

  // ----------------------------------------------------
  // TESTIMONIALS MANAGEMENT
  // ----------------------------------------------------
  async getTestimonials(includeDrafts = false): Promise<Testimonial[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (!includeDrafts) query = query.eq('status', 'published');
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[DB] Supabase getTestimonials error:', err);
      }
    }
    if (includeDrafts) return memoryTestimonials;
    return memoryTestimonials.filter((t) => t.status === 'published');
  }

  async addTestimonial(data: Omit<Testimonial, 'id' | 'created_at'>): Promise<Testimonial> {
    const item: Testimonial = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('testimonials')
          .insert(item)
          .select()
          .single();
        if (!error && inserted) {
          memoryTestimonials.push(inserted);
          await this.logAudit('admin', 'add_testimonial', 'testimonials', inserted.id, inserted);
          return inserted;
        }
      } catch (err) {
        console.error('[DB] Add testimonial to Supabase error:', err);
      }
    }
    memoryTestimonials.push(item);
    await this.logAudit('admin', 'add_testimonial', 'testimonials', item.id, item);
    return item;
  }

  async updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('testimonials')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && updated) {
          const idx = memoryTestimonials.findIndex((t) => t.id === id);
          if (idx !== -1) memoryTestimonials[idx] = updated;
          await this.logAudit('admin', 'update_testimonial', 'testimonials', id, data);
          return updated;
        }
      } catch (err) {
        console.error('[DB] Update testimonial error:', err);
      }
    }
    const idx = memoryTestimonials.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    memoryTestimonials[idx] = { ...memoryTestimonials[idx], ...data };
    await this.logAudit('admin', 'update_testimonial', 'testimonials', id, data);
    return memoryTestimonials[idx];
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (!error) {
          memoryTestimonials = memoryTestimonials.filter((t) => t.id !== id);
          await this.logAudit('admin', 'delete_testimonial', 'testimonials', id, {});
          return true;
        }
      } catch (err) {
        console.error('[DB] Delete testimonial error:', err);
      }
    }
    const before = memoryTestimonials.length;
    memoryTestimonials = memoryTestimonials.filter((t) => t.id !== id);
    return memoryTestimonials.length < before;
  }

  // ----------------------------------------------------
  // SETTINGS & CONTACT
  // ----------------------------------------------------
  async getSettings(): Promise<WebsiteSettings> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'main_config')
          .maybeSingle();

        if (!error && data && data.value) {
          return data.value as WebsiteSettings;
        }
      } catch (err) {
        console.warn('[DB] Supabase getSettings error:', err);
      }
    }
    return memorySettings;
  }

  async updateSettings(data: WebsiteSettings): Promise<WebsiteSettings> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'main_config',
          value: data,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[DB] Supabase updateSettings error:', err);
      }
    }
    memorySettings = data;
    await this.logAudit('admin', 'update_settings', 'site_settings', 'main_config', {});
    return memorySettings;
  }

  async addContactMessage(data: { name: string; email: string; phone?: string; message: string }): Promise<any> {
    const msg = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone || '',
      message: data.message.trim(),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('contact_submissions').insert(msg);
      } catch (err) {
        console.warn('[DB] Supabase addContactMessage error:', err);
      }
    }

    memoryContactMessages.push(msg);
    await this.logAudit(data.email, 'submit_contact', 'contact_submissions', msg.id, {});
    return msg;
  }

  async getContactMessages(): Promise<any[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB] Supabase getContactMessages error:', err);
      }
    }
    return memoryContactMessages;
  }

  // ----------------------------------------------------
  // AUDIT LOGGING
  // ----------------------------------------------------
  async logAudit(actor: string, action: string, entity: string, entityId: string, metadata: any): Promise<void> {
    const entry = {
      id: crypto.randomUUID(),
      actor,
      action,
      entity,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('audit_logs').insert(entry);
      } catch (err) {
        // silent fail for audit logs to not block main operation
      }
    }

    memoryAuditLogs.push(entry);
    if (memoryAuditLogs.length > 200) memoryAuditLogs.shift();
  }

  async getAuditLogs(): Promise<any[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB] Supabase getAuditLogs error:', err);
      }
    }
    return [...memoryAuditLogs].reverse();
  }
}

export const db = new DatabaseService();
