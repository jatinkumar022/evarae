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
import { dummyOrders } from './dummyOrders';
import { dummyCustomers } from './dummyCustomers';
import { useProductStore } from '@/lib/data/store/productStore';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { useOrderStore } from '@/lib/data/store/orderStore';
import { useCustomerStore } from '@/lib/data/store/customerStore';

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
 * Set dummy orders in the order store
 */
export const setDummyOrdersInStore = () => {
  useOrderStore.setState({ 
    orders: dummyOrders,
    pagination: {
      page: 1,
      limit: 12,
      total: dummyOrders.length,
      totalPages: Math.ceil(dummyOrders.length / 12),
      hasNext: false,
      hasPrev: false,
    },
    status: 'success',
    error: null 
  });
};

/**
 * Set dummy customers in the customer store
 */
export const setDummyCustomersInStore = () => {
  useCustomerStore.setState({ 
    customers: dummyCustomers,
    pagination: {
      page: 1,
      limit: 12,
      total: dummyCustomers.length,
      totalPages: Math.ceil(dummyCustomers.length / 12),
      hasNext: false,
      hasPrev: false,
    },
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
  setDummyOrdersInStore();
  setDummyCustomersInStore();
};

