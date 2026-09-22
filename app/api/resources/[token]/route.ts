import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Access token required' }, { status: 400 });
    }

    const verification = await db.verifyResourceAccess(token);
    if (!verification.valid || !verification.resourceUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired resource access token' },
        { status: 403 }
      );
    }

    // Redirect to the actual Google Drive vault securely
    return NextResponse.redirect(verification.resourceUrl);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
