import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/lib/types/product';

export interface FilterState {
  priceRange: string;
  material: string[];
  subcategory: string[];
  isNew: boolean;
  isSale: boolean;
  isFeatured: boolean;
}

export interface FilterOptions {
  priceRanges: Array<{ value: string; label: string }>;
  materials: string[];
  subcategories: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export const useProductFilters = (
  products: Product[],
  filterOptions: FilterOptions,
  sortOptions: SortOption[] // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: '',
    material: [],
    subcategory: [],
    isNew: false,
    isSale: false,
    isFeatured: false,
  });

  const [sortBy, setSortBy] = useState('best-matches');
  const [showFilters, setShowFilters] = useState(false);
  const [openFilterSections, setOpenFilterSections] = useState({
    price: true,
    material: true,
    subcategory: true,
    features: true,
  });

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Price filter
      if (filters.priceRange) {
        const price = product.price;
        switch (filters.priceRange) {
          case 'under-50k':
            if (price != null && price >= 50000) return false;
            break;
          case '50k-100k':
            if (price != null && (price < 50000 || price >= 100000))
              return false;
            break;
          case '100k-200k':
            if (price != null && (price < 100000 || price >= 200000))
              return false;
            break;
          case 'above-200k':
            if (price != null && price < 200000) return false;
            break;
        }
      }

      // Material filter
      if (
        filters.material.length > 0 &&
        !filters.material.includes(product.material)
      ) {
        return false;
      }

      // Subcategory filter
      if (
        filters.subcategory.length > 0 &&
        !filters.subcategory.includes(product.subcategory ?? '')
      ) {
        return false;
      }

      // Feature filters
      if (filters.isNew && !product.isNew) return false;
      if (filters.isSale && !product.isSale) return false;
      if (filters.isFeatured && !product.isFeatured) return false;

      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => {
          if (a.price == null || b.price == null) return 0;
          return a.price - b.price;
        });
        break;
      case 'price-high-low':
        filtered.sort((a, b) => {
          if (a.price == null || b.price == null) return 0;
          return b.price - a.price;
        });
        break;
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'rating':
        filtered.sort((a, b) => {
          if (a.rating == null || b.rating == null) return 0;
          return b.rating - a.rating;
        });
        break;
      default:
        // Best matches - keep original order
        break;
    }

    return filtered;
  }, [products, filters, sortBy]);

  // Get active filter tags
  const activeFilters = useMemo(() => {
    return [
      ...(filters.priceRange
        ? [
            filterOptions.priceRanges.find(p => p.value === filters.priceRange)
              ?.label ?? '',
          ]
        : []),
      ...filters.material,
      ...filters.subcategory,
      ...(filters.isNew ? ['New Arrivals'] : []),
      ...(filters.isSale ? ['On Sale'] : []),
      ...(filters.isFeatured ? ['Featured'] : []),
    ].filter(Boolean);
  }, [filters, filterOptions]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      priceRange: '',
      material: [],
      subcategory: [],
      isNew: false,
      isSale: false,
      isFeatured: false,
    });
  }, []);

  const removeFilter = useCallback(
    (filterToRemove: string) => {
      if (
        filters.priceRange &&
        filterOptions.priceRanges.find(p => p.label === filterToRemove)
          ?.value === filters.priceRange
      ) {
        setFilters(prev => ({ ...prev, priceRange: '' }));
      } else if (filters.material.includes(filterToRemove)) {
        setFilters(prev => ({
          ...prev,
          material: prev.material.filter(m => m !== filterToRemove),
        }));
      } else if (filters.subcategory.includes(filterToRemove)) {
        setFilters(prev => ({
          ...prev,
          subcategory: prev.subcategory.filter(s => s !== filterToRemove),
        }));
      } else if (filterToRemove === 'New Arrivals') {
        setFilters(prev => ({ ...prev, isNew: false }));
      } else if (filterToRemove === 'On Sale') {
        setFilters(prev => ({ ...prev, isSale: false }));
      } else if (filterToRemove === 'Featured') {
        setFilters(prev => ({ ...prev, isFeatured: false }));
      }
    },
    [filters, filterOptions]
  );

  const updatePriceRange = useCallback((priceRange: string) => {
    setFilters(prev => ({ ...prev, priceRange }));
  }, []);

  const updateMaterial = useCallback((material: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      material: checked
        ? [...prev.material, material]
        : prev.material.filter(m => m !== material),
    }));
  }, []);

  const updateSubcategory = useCallback(
    (subcategory: string, checked: boolean) => {
      setFilters(prev => ({
        ...prev,
        subcategory: checked
          ? [...prev.subcategory, subcategory]
          : prev.subcategory.filter(s => s !== subcategory),
      }));
    },
    []
  );

  const updateFeature = useCallback(
    (feature: 'isNew' | 'isSale' | 'isFeatured', checked: boolean) => {
      setFilters(prev => ({ ...prev, [feature]: checked }));
    },
    []
  );

  return {
    // State
    filters,
    sortBy,
    showFilters,
    openFilterSections,
    filteredAndSortedProducts,
    activeFilters,

    // Actions
    setSortBy,
    setShowFilters,
    setOpenFilterSections,
    clearAllFilters,
    removeFilter,
    updatePriceRange,
    updateMaterial,
    updateSubcategory,
    updateFeature,
  };
};
