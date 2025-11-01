/**
 * Helper functions to load dummy data into stores
 * 
 * Usage in admin pages:
 * 
 * Method 1: Direct import and use in component
 * ```tsx
 * import { dummyProducts } from '@/lib/data/dummyProducts';
 * import { useProductStore } from '@/lib/data/store/productStore';
 * 
 * useEffect(() => {
 *   useProductStore.setState({ products: dummyProducts, status: 'success' });
 * }, []);
 * ```
 * 
 * Method 2: Use helper functions
 * ```tsx
 * import { setAllDummyDataInStores } from '@/lib/data/dummyDataHelper';
 * 
 * useEffect(() => {
 *   setAllDummyDataInStores();
 * }, []);
 * ```
 */

import { dummyProducts } from './dummyProducts';
import { dummyCategories } from './dummyCategories';
import { dummyCollections } from './dummyCollections';
import { useProductStore } from '@/lib/data/store/productStore';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { useCollectionStore } from '@/lib/data/store/collectionStore';

/**
 * Set dummy products in the product store
 */
export const setDummyProductsInStore = () => {
  useProductStore.setState({ 
    products: dummyProducts,
    status: 'success',
    error: null 
  });
};

/**
 * Set dummy categories in the category store
 */
export const setDummyCategoriesInStore = () => {
  useCategoryStore.setState({ 
    categories: dummyCategories,
    status: 'success',
    error: null 
  });
};

/**
 * Set dummy collections in the collection store
 */
export const setDummyCollectionsInStore = () => {
  useCollectionStore.setState({ 
    collections: dummyCollections,
    status: 'success',
    error: null 
  });
};

/**
 * Set all dummy data in all stores at once
 */
export const setAllDummyDataInStores = () => {
  setDummyProductsInStore();
  setDummyCategoriesInStore();
  setDummyCollectionsInStore();
};

