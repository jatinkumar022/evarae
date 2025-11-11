'use client';

import React, { memo, useEffect } from 'react';
import { useCartCountStore } from '@/lib/data/mainStore/cartCountStore';

export const CartCount = memo(function CartCount() {
  const count = useCartCountStore((state) => state.count);
  const syncCartCount = useCartCountStore((state) => state.syncWithCart);

  // Sync on mount to ensure we have the latest count
  useEffect(() => {
    syncCartCount();
  }, [syncCartCount]);

  if (count === 0) return null;

  return (
    <span
      className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white"
      aria-label={`${count} items in cart`}
    >
      {count}
    </span>
  );
});

