/**
 * Dummy Data for Admin Testing
 * 
 * This file exports all dummy data for testing the admin panel
 * without making API calls. Use these exports to populate stores
 * during development and testing.
 */

export { dummyProducts } from './dummyProducts';
export { dummyCategories } from './dummyCategories';
export { dummyCollections } from './dummyCollections';

// Re-export types for convenience
export type { Product } from '@/lib/data/store/productStore';
export type { Category } from '@/lib/data/store/categoryStore';
export type { Collection } from '@/lib/data/store/collectionStore';


