import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import Settings from '@/models/settingsModel';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

if (!ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET missing in environment');
}

// Helper to verify admin authentication
function verifyAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') as string | null;
  const token = cookieHeader
    ?.split(';')
    .map(p => p.trim())
    .find(p => p.startsWith('adminToken='))
    ?.split('=')[1];
  
  if (!token) return null;

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as {
      uid?: string;
      role?: string;
    };
    if (!payload || payload.role !== 'admin') return null;
    return payload.uid;
  } catch {
    return null;
  }
}

// GET: Fetch settings
export async function GET(request: Request) {
  try {
    await connect();

    // Verify admin authentication
    const adminId = verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await Settings.getSettings();

    return NextResponse.json({
      general: settings.general,
      footer: settings.footer,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load settings. Please try again later' },
      { status: 500 }
    );
  }
}

// PATCH: Update settings
export async function PATCH(request: Request) {
  try {
    await connect();

    // Verify admin authentication
    const adminId = verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { general, footer } = body;

    // Get or create settings document (use getSettings for efficiency)
    const settings = await Settings.getSettings();

    // Update general settings if provided
    if (general) {
      if (general.storeName !== undefined) settings.general.storeName = general.storeName;
      if (general.currency !== undefined) settings.general.currency = general.currency;
      if (general.timezone !== undefined) settings.general.timezone = general.timezone;
    }

    // Update footer settings if provided
    if (footer) {
      if (footer.tagline !== undefined) settings.footer.tagline = footer.tagline;
      if (footer.phone !== undefined) settings.footer.phone = footer.phone;
      if (footer.email !== undefined) settings.footer.email = footer.email;
      if (footer.location !== undefined) settings.footer.location = footer.location;
      if (footer.socialLinks) {
        if (footer.socialLinks.instagram !== undefined)
          settings.footer.socialLinks.instagram = footer.socialLinks.instagram;
        if (footer.socialLinks.twitter !== undefined)
          settings.footer.socialLinks.twitter = footer.socialLinks.twitter;
        if (footer.socialLinks.facebook !== undefined)
          settings.footer.socialLinks.facebook = footer.socialLinks.facebook;
        if (footer.socialLinks.youtube !== undefined)
          settings.footer.socialLinks.youtube = footer.socialLinks.youtube;
      }
    }

    await settings.save();

    return NextResponse.json({
      general: settings.general,
      footer: settings.footer,
    });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json(
      { error: 'Unable to update settings. Please try again later' },
      { status: 500 }
    );
  }
}

