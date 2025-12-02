import { NextResponse } from 'next/server';

// Keep Node.js runtime for consistency
export const runtime = 'nodejs';

// This route now simply redirects to the admin download endpoint.
// It exists only for backward compatibility in case any client
// still calls `/api/admin/orders/[id]/invoice` directly.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  url.pathname = `/api/admin/orders/${id}/invoice/download`;
  return NextResponse.redirect(url.toString(), { status: 302 });
}
