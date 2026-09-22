import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, setAdminSessionCookie } from '@/lib/auth';
import { adminLoginSchema } from '@/lib/validation/schemas';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = adminLoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const { email, password } = validated.data;
    const result = await authenticateAdmin(email, password);

    if (!result.success || !result.admin || !result.token) {
      await db.logAudit(email, 'admin_login_failed', 'auth', 'none', { ip: req.headers.get('x-forwarded-for') });
      return NextResponse.json({ success: false, error: result.error || 'Authentication failed' }, { status: 401 });
    }

    await db.logAudit(result.admin.email, 'admin_login_success', 'auth', result.admin.id, { role: result.admin.role });

    const response = NextResponse.json({
      success: true,
      admin: result.admin,
      token: result.token,
    });

    setAdminSessionCookie(response, result.token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
