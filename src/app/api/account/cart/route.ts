import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import Cart from '@/models/cartModel';
import mongoose from 'mongoose';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

type CartItemDoc = {
  product: mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId } | null;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  addedAt?: string | Date;
};

type CartDoc = {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: CartItemDoc[];
  savedItems: Array<{
    product: mongoose.Types.ObjectId;
    addedAt?: string | Date;
  }>;
};

function getUserIdFromRequest(request: Request): string | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('token='))
      ?.split('=')[1];

    if (!token || !USER_JWT_SECRET) return null;

    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    return payload?.uid || null;
  } catch {
    return null;
  }
}

async function resolveProductObjectId(idOrSlug: string) {
  if (!idOrSlug) return null;
  if (/^[a-f0-9]{24}$/i.test(idOrSlug))
    return new mongoose.Types.ObjectId(idOrSlug);

  const doc = await Product.findOne({
    $or: [{ slug: idOrSlug }, { sku: idOrSlug }],
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId } | null>();

  return doc?._id ? new mongoose.Types.ObjectId(doc._id) : null;
}

function extractProductKey(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown> & { product?: unknown };
  const direct =
    (b.productId as string | undefined) ||
    (b.productSlug as string | undefined) ||
    (b.sku as string | undefined) ||
    (b.id as string | undefined) ||
    (b.slug as string | undefined) ||
    (typeof b.product === 'string' ? (b.product as string) : undefined);

  if (direct) return direct;

  if (b.product && typeof b.product === 'object') {
    const p = b.product as Record<string, unknown>;
    const nested =
      (p._id as string | undefined) ||
      (p.id as string | undefined) ||
      (p.slug as string | undefined) ||
      (p.sku as string | undefined);
    if (nested) return nested;
  }

  return null;
}

// Optimize: Select only needed product fields to reduce data transfer
const PRODUCT_SELECT_FIELDS = 'name slug sku price discountPrice stockQuantity images material weight colors rating reviewsCount status';

export async function GET(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);
    if (!uid) {
      const response = NextResponse.json({ items: [], savedItems: [] });
      response.headers.set('Cache-Control', 'private, max-age=60');
      return response;
    }

    const cart = await Cart.findOne({ user: uid })
      .populate({
        path: 'items.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .populate({
        path: 'savedItems.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .lean<CartDoc | null>();

    const response = NextResponse.json({
      items: cart?.items ?? [],
      savedItems: cart?.savedItems ?? [],
    });

    // Add cache headers (1 minute for cart data)
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');

    return response;
  } catch (error) {
    console.error('[account/cart GET] Error:', error);
    return NextResponse.json({
      items: [],
      savedItems: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Please log in to update your cart' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const body = (await request.json()) as unknown;
    const productKey = extractProductKey(body);
    const b = (body || {}) as Record<string, unknown>;
    const quantity = Math.max(1, Number(b.quantity) || 1);
    const selectedColor =
      (b.selectedColor as string | null | undefined) ?? null;
    const selectedSize = (b.selectedSize as string | null | undefined) ?? null;

    if (!productKey)
      return NextResponse.json(
        { error: 'Product identifier is required' },
        { status: 400 }
      );

    const pid = await resolveProductObjectId(productKey);
    if (!pid)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    if (action === 'save') {
      await Cart.findOneAndUpdate(
        { user: uid },
        {
          $addToSet: { savedItems: { product: pid } },
          $pull: { items: { product: pid } },
        },
        { upsert: true, new: true }
      );
    } else {
      // Reliable add: try to increment existing exact variant
      let updated = await Cart.findOneAndUpdate(
        {
          user: uid,
          'items.product': pid,
          'items.selectedColor': selectedColor,
          'items.selectedSize': selectedSize,
        },
        { $inc: { 'items.$.quantity': quantity } },
        { new: true }
      );

      if (!updated) {
        // Fallback: merge by product, regardless of variant differences
        updated = await Cart.findOneAndUpdate(
          {
            user: uid,
            'items.product': pid,
          },
          { $inc: { 'items.$.quantity': quantity } },
          { new: true }
        );
      }

      if (!updated) {
        // No existing item for this product -> push new line
        await Cart.findOneAndUpdate(
          { user: uid },
          {
            $push: {
              items: { product: pid, quantity, selectedColor, selectedSize },
            },
          },
          { upsert: true }
        );
      }
    }

    // Optimize: Select only needed product fields
    const cart = await Cart.findOne({ user: uid })
      .populate({
        path: 'items.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .populate({
        path: 'savedItems.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .lean<CartDoc | null>();
    
    const response = NextResponse.json({
      items: cart?.items ?? [],
      savedItems: cart?.savedItems ?? [],
    });
    
    // No cache for POST requests (data just changed)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('[account/cart POST] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unable to update cart';
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('NotFound')) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Unauthorized') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Please log in to update your cart' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as unknown;
    const productKey = extractProductKey(body);
    const b = (body || {}) as Record<string, unknown>;
    const qtyNum = Number(b.quantity);
    const quantity = Math.max(1, Number.isNaN(qtyNum) ? 1 : qtyNum);
    const selectedColor = b.selectedColor as string | undefined;
    const selectedSize = b.selectedSize as string | undefined;

    if (!productKey)
      return NextResponse.json(
        { error: 'Product identifier is required' },
        { status: 400 }
      );

    const pid = await resolveProductObjectId(productKey);
    if (!pid)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const match: Record<string, unknown> = { user: uid, 'items.product': pid };
    if (selectedColor !== undefined)
      match['items.selectedColor'] = selectedColor;
    if (selectedSize !== undefined) match['items.selectedSize'] = selectedSize;

    const res = await Cart.updateOne(match, {
      $set: { 'items.$.quantity': quantity },
    });
    if (res.matchedCount === 0) {
      await Cart.updateOne(
        { user: uid },
        {
          $push: {
            items: { product: pid, quantity, selectedColor, selectedSize },
          },
        },
        { upsert: true }
      );
    }

    // Optimize: Select only needed product fields
    const cart = await Cart.findOne({ user: uid })
      .populate({
        path: 'items.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .populate({
        path: 'savedItems.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .lean<CartDoc | null>();
    
    const response = NextResponse.json({
      items: cart?.items ?? [],
      savedItems: cart?.savedItems ?? [],
    });
    
    // No cache for POST requests (data just changed)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('[account/cart PATCH] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unable to update cart item';
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('NotFound')) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Unauthorized') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Please log in to update your cart' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const body = (await request.json()) as unknown;
    const productKey = extractProductKey(body);
    const b = (body || {}) as Record<string, unknown>;
    const selectedColor = b.selectedColor as string | undefined;
    const selectedSize = b.selectedSize as string | undefined;

    if (!productKey)
      return NextResponse.json(
        { error: 'Product identifier is required' },
        { status: 400 }
      );

    const pid = await resolveProductObjectId(productKey);
    if (!pid)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    if (action === 'unsave') {
      await Cart.updateOne(
        { user: uid },
        { $pull: { savedItems: { product: pid } } }
      );
    } else {
      const pullCriteria: Record<string, unknown> = { product: pid };
      if (selectedColor !== undefined)
        pullCriteria.selectedColor = selectedColor;
      if (selectedSize !== undefined) pullCriteria.selectedSize = selectedSize;

      await Cart.updateOne({ user: uid }, { $pull: { items: pullCriteria } });
    }

    // Optimize: Select only needed product fields
    const cart = await Cart.findOne({ user: uid })
      .populate({
        path: 'items.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .populate({
        path: 'savedItems.product',
        select: PRODUCT_SELECT_FIELDS,
      })
      .lean<CartDoc | null>();
    
    const response = NextResponse.json({
      items: cart?.items ?? [],
      savedItems: cart?.savedItems ?? [],
    });
    
    // No cache for POST requests (data just changed)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('[account/cart DELETE] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unable to remove item from cart';
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('NotFound')) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Unauthorized') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
