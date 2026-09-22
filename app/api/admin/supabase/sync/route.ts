import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import {
  DEFAULT_BATCHES,
  DEFAULT_SETTINGS,
  DEFAULT_SPEAKERS,
  DEFAULT_TESTIMONIALS,
} from '@/src/data/defaultData';

export async function POST(req: NextRequest) {
  try {
    requireAdminAuth(req);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials are not yet configured in environment variables.',
      }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Could not connect to Supabase.' }, { status: 500 });
    }

    let seededCount = { batches: 0, speakers: 0, testimonials: 0, settings: 0 };

    // Seed Batches
    for (const b of DEFAULT_BATCHES) {
      const { error } = await supabase.from('batches').upsert({
        id: b.id,
        batch_number: b.batch_number,
        name: b.name,
        start_date: b.start_date,
        end_date: b.end_date,
        registration_deadline: b.registration_deadline,
        fee: b.fee,
        whatsapp_link: b.whatsapp_link,
        max_seats: b.max_seats,
        seats_booked: b.seats_booked,
        status: b.status,
        description: b.description,
      });
      if (!error) seededCount.batches++;
    }

    // Seed Speakers
    for (const s of DEFAULT_SPEAKERS) {
      const { error } = await supabase.from('speakers').upsert({
        id: s.id,
        name: s.name,
        firm: s.firm,
        domain: s.domain,
        image: s.image,
        description: s.description,
        linkedin_url: s.linkedin_url,
        status: s.status,
        display_order: (s as any).display_order || 0,
      });
      if (!error) seededCount.speakers++;
    }

    // Seed Testimonials
    for (const t of DEFAULT_TESTIMONIALS) {
      const { error } = await supabase.from('testimonials').upsert({
        id: t.id,
        student_name: t.student_name,
        designation: t.designation,
        firm: t.firm,
        domain: t.domain,
        testimonial: t.testimonial,
        image: t.image,
        linkedin_url: t.linkedin_url,
        status: t.status,
      });
      if (!error) seededCount.testimonials++;
    }

    // Seed Site Settings
    const { error: setErr } = await supabase.from('site_settings').upsert({
      key: 'main_config',
      value: DEFAULT_SETTINGS,
    });
    if (!setErr) seededCount.settings++;

    await db.logAudit('admin', 'sync_supabase', 'database', 'supabase', seededCount);

    return NextResponse.json({
      success: true,
      message: 'Initial masterclass data successfully synchronized to Supabase PostgreSQL.',
      seededCount,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
