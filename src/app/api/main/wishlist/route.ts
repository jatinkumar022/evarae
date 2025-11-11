import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import UserProfile from '@/models/userProfile';
import Product from '@/models/productModel';
import mongoose from 'mongoose';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

type PopulatedWishlistProduct = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  images?: string[];
  price?: number;
  discountPrice?: number | null;
  status?: string;
  tags?: string[];
  material?: string;
  colors?: string[];
  stockQuantity?: number;
  categories?: Array<{ _id?: string; name?: string; slug?: string }>;
};

type LeanProfileWithWishlist = {
  wishlist?: PopulatedWishlistProduct[];
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

// GET wishlist products
export async function GET(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ products: [] });
    }

    // Get user profile with wishlist
    const profile = (await UserProfile.findOne({ user: uid })
      .populate({
        path: 'wishlist',
        select:
          'name slug images price discountPrice status tags material colors stockQuantity categories',
        populate: {
          path: 'categories',
          select: 'name slug',
        },
        match: { status: 'active' },
      })
      .lean()) as LeanProfileWithWishlist | null;

    if (!profile || !profile.wishlist || profile.wishlist.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Extract products from wishlist
    const products = (profile.wishlist || [])
      .map((product: any) => {
        if (!product || product.status !== 'active') return null;

        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images || [],
          price: product.price,
          discountPrice: product.discountPrice,
          tags: product.tags || [],
          material: product.material || '',
          colors: product.colors || [],
          stockQuantity: product.stockQuantity || 0,
          categories: product.categories || [],
        };
      })
      .filter(Boolean);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load wishlist. Please try again later' },
      { status: 500 }
    );
  }
}

// ADD to wishlist
export async function POST(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const productKey = body.productId || body.productSlug || body.sku;

    if (!productKey) {
      return NextResponse.json(
        { error: 'Product ID or slug is required' },
        { status: 400 }
      );
    }

    const pid = await resolveProductObjectId(productKey);
    if (!pid) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get or create user profile
    let profile = await UserProfile.findOne({ user: uid });
    if (!profile) {
      profile = await UserProfile.create({ user: uid, wishlist: [] });
    }

    // Add product to wishlist (using $addToSet to prevent duplicates)
    await UserProfile.findOneAndUpdate(
      { user: uid },
      {
        $addToSet: {
          wishlist: pid,
        },
      },
      { upsert: true }
    );

    // Fetch updated wishlist
    const updatedProfile = (await UserProfile.findOne({ user: uid })
      .populate({
        path: 'wishlist',
        select:
          'name slug images price discountPrice status tags material colors stockQuantity categories',
        populate: {
          path: 'categories',
          select: 'name slug',
        },
        match: { status: 'active' },
      })
      .lean()) as LeanProfileWithWishlist | null;

    const products = (updatedProfile?.wishlist || [])
      .map((product: any) => {
        if (!product || product.status !== 'active') return null;

        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images || [],
          price: product.price,
          discountPrice: product.discountPrice,
          tags: product.tags || [],
          material: product.material || '',
          colors: product.colors || [],
          stockQuantity: product.stockQuantity || 0,
          categories: product.categories || [],
        };
      })
      .filter(Boolean);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json(
      { error: 'Unable to add to wishlist. Please try again later' },
      { status: 500 }
    );
  }
}

// REMOVE from wishlist
export async function DELETE(request: Request) {
  try {
    await connect();
    const uid = getUserIdFromRequest(request);

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const productKey = body.productId || body.productSlug || body.sku;

    if (!productKey) {
      return NextResponse.json(
        { error: 'Product ID or slug is required' },
        { status: 400 }
      );
    }

    const pid = await resolveProductObjectId(productKey);
    if (!pid) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Remove product from wishlist
    await UserProfile.findOneAndUpdate(
      { user: uid },
      {
        $pull: {
          wishlist: pid,
        },
      }
    );

    // Fetch updated wishlist
    const profile = (await UserProfile.findOne({ user: uid })
      .populate({
        path: 'wishlist',
        select:
          'name slug images price discountPrice status tags material colors stockQuantity categories',
        populate: {
          path: 'categories',
          select: 'name slug',
        },
        match: { status: 'active' },
      })
      .lean()) as LeanProfileWithWishlist | null;

    const products = (profile?.wishlist || [])
      .map((product: any) => {
        if (!product || product.status !== 'active') return null;

        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images || [],
          price: product.price,
          discountPrice: product.discountPrice,
          tags: product.tags || [],
          material: product.material || '',
          colors: product.colors || [],
          stockQuantity: product.stockQuantity || 0,
          categories: product.categories || [],
        };
      })
      .filter(Boolean);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json(
      { error: 'Unable to remove from wishlist. Please try again later' },
      { status: 500 }
    );
  }
}

