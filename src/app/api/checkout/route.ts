import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Cart from '@/models/cartModel';
import UserProfile from '@/models/userProfile';
import type { Address, CartLean } from '@/lib/types/product';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

function getUid(request: Request): string | null {
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

interface PopulatedProductForCheckout {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  images?: string[];
  thumbnail?: string | null;
  price?: number;
  discountPrice?: number | null;
  originalPrice?: number | null;
}

type PopulatedCartItem = CartLean['items'][number] & {
  product: PopulatedProductForCheckout | null | undefined;
};

type PopulatedCart = Omit<CartLean, 'items'> & { items: PopulatedCartItem[] };

export async function GET(request: Request) {
  try {
    await connect();
    const uid = getUid(request);
    if (!uid) return NextResponse.json({ items: [], addresses: [] });

    const [cart, profile] = await Promise.all([
      Cart.findOne({ user: uid })
        .populate('items.product')
        .lean<PopulatedCart | null>(),
      UserProfile.findOne({ user: uid }).lean<{
        addresses: Address[];
      } | null>(),
    ]);

    const items = (cart?.items || []).map(ci => ({
      productId: String(ci.product?._id || ci.product?.id || ''),
      name: ci.product?.name,
      slug: ci.product?.slug,
      sku: ci.product?.sku,
      image:
        (ci.product?.images && ci.product.images[0]) ||
        ci.product?.thumbnail ||
        undefined,
      price: ci.product?.discountPrice ?? ci.product?.price ?? 0,
      originalPrice: ci.product?.originalPrice ?? ci.product?.price ?? null,
      quantity: ci.quantity || 1,
      selectedColor: ci.selectedColor ?? null,
      selectedSize: ci.selectedSize ?? null,
    }));

    const addresses = (profile?.addresses || []).map(a => ({
      id: String(a._id),
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefaultShipping: !!a.isDefaultShipping,
      isDefaultBilling: !!a.isDefaultBilling,
    }));

    return NextResponse.json({ items, addresses });
  } catch (error) {
    console.error('[checkout GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load checkout information. Please try again' },
      { status: 500 }
    );
  }
}
