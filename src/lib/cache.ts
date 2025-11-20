type CacheEntry<T = unknown> = {
  value: T;
  expiresAt: number;
};

class SimpleCache {
  private readonly ttlMs: number;
  private readonly store = new Map<string, CacheEntry>();

  constructor(ttlSeconds: number) {
    this.ttlMs = Math.max(1, ttlSeconds) * 1000;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  del(keys: string[]) {
    keys.forEach(key => this.store.delete(key));
  }
}

const ttlSeconds = Number(process.env.API_CACHE_TTL ?? 60);

export const cache = new SimpleCache(ttlSeconds);

export const cacheKeys = {
  homepage: 'homepage',
  bestSellers: 'best-sellers',
  productList: (key: string) => `product-list:${key}`,
  productDetail: (slug: string) => `product-detail:${slug}`,
  categoryMeta: (slug: string) => `category-meta:${slug}`,
  categoryWithProducts: (slug: string) => `category-with-products:${slug}`,
  collectionDetail: (slug: string) => `collection-detail:${slug}`,
  checkout: (userId: string) => `checkout:${userId}`,
  userCart: (userId: string) => `user-cart:${userId}`,
  userAddresses: (userId: string) => `user-addresses:${userId}`,
  userProfile: (userId: string) => `user-profile:${userId}`,
  userReturnRequests: (userId: string) => `user-return-requests:${userId}`,
  userWishlist: (userId: string) => `user-wishlist:${userId}`,
};

export const clearKeys = (keys: string[]) => {
  cache.del(keys);
};

export default cache;

