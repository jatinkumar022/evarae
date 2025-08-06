import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  Product,
  FilterState,
  FilterOptions,
  SortOption,
} from '@/lib/types/product';

import CustomSelect from './CustomSelect';
import { Filter } from '@/app/assets/Shop-list';

// Filter tag component
const FilterTag = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-primary hover:text-white rounded-full p-0.5 transition-colors"
      aria-label={`Remove ${label} filter`}
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  filterOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filterOptions: FilterOptions;
}) => {
  // Temporary state for modal filters (not applied until "Apply" is clicked)
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset temp filters when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, filters]);

  // Check for unsaved changes
  React.useEffect(() => {
    const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(filters);
    setHasUnsavedChanges(hasChanges);
  }, [tempFilters, filters]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  const handleCancel = () => {
    setTempFilters(filters); // Reset to original state
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      priceRange: '',
      material: [],
      subcategory: [],
      isNew: false,
      isSale: false,
      isFeatured: false,
    };
    setTempFilters(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col">
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10 flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary-dark">Filters</h3>
          <button
            onClick={handleCancel}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 lg:space-y-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Price Range */}
            <div>
              <span className="block text-xs font-semibold text-primary-dark mb-2">
                Price Range
              </span>
              <div className="space-y-2">
                {filterOptions.priceRanges.map(range => (
                  <label
                    key={range.value}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      value={range.value}
                      checked={tempFilters.priceRange === range.value}
                      onChange={e =>
                        setTempFilters(prev => ({
                          ...prev,
                          priceRange: e.target.value,
                        }))
                      }
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-primary-dark">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <span className="block text-xs font-semibold text-primary-dark mb-2">
                Material
              </span>
              <div className="space-y-2">
                {filterOptions.materials.map(material => (
                  <label
                    key={material}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={tempFilters.material.includes(material)}
                      onChange={e => {
                        if (e.target.checked) {
                          setTempFilters(prev => ({
                            ...prev,
                            material: [...prev.material, material],
                          }));
                        } else {
                          setTempFilters(prev => ({
                            ...prev,
                            material: prev.material.filter(m => m !== material),
                          }));
                        }
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-primary-dark">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subcategory */}
            <div>
              <span className="block text-xs font-semibold text-primary-dark mb-2">
                Category
              </span>
              <div className="space-y-2">
                {filterOptions.subcategories.map(subcategory => (
                  <label
                    key={subcategory}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={tempFilters.subcategory.includes(subcategory)}
                      onChange={e => {
                        if (e.target.checked) {
                          setTempFilters(prev => ({
                            ...prev,
                            subcategory: [...prev.subcategory, subcategory],
                          }));
                        } else {
                          setTempFilters(prev => ({
                            ...prev,
                            subcategory: prev.subcategory.filter(
                              s => s !== subcategory
                            ),
                          }));
                        }
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-primary-dark">{subcategory}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <span className="block text-xs font-semibold text-primary-dark mb-2">
                Features
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={tempFilters.isNew}
                    onChange={e =>
                      setTempFilters(prev => ({
                        ...prev,
                        isNew: e.target.checked,
                      }))
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-primary-dark">New Arrivals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={tempFilters.isSale}
                    onChange={e =>
                      setTempFilters(prev => ({
                        ...prev,
                        isSale: e.target.checked,
                      }))
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-primary-dark">On Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={tempFilters.isFeatured}
                    onChange={e =>
                      setTempFilters(prev => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-primary-dark">Featured</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Fixed */}
        <div className="flex items-center justify-between p-6 border-t border-primary/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAll}
              className="text-sm text-primary hover:text-primary-dark underline"
            >
              Clear All Filters
            </button>
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductFiltersProps {
  products: Product[];
  filterOptions: FilterOptions;
  sortOptions: SortOption[];
  onFiltersChange: (filteredProducts: Product[]) => void;
  children: React.ReactNode;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  products,
  filterOptions,
  sortOptions,
  onFiltersChange,
  children,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: '',
    material: [],
    subcategory: [],
    isNew: false,
    isSale: false,
    isFeatured: false,
  });

  const [sortBy, setSortBy] = useState('best-matches');
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  // Notify parent component of filtered results
  React.useEffect(() => {
    onFiltersChange(filteredAndSortedProducts);
  }, [filteredAndSortedProducts, onFiltersChange]);

  // Get active filter tags
  const activeFilters = [
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

  const clearAllFilters = () => {
    setFilters({
      priceRange: '',
      material: [],
      subcategory: [],
      isNew: false,
      isSale: false,
      isFeatured: false,
    });
  };

  const removeFilter = (filterToRemove: string) => {
    if (
      filters.priceRange &&
      filterOptions.priceRanges.find(p => p.label === filterToRemove)?.value ===
        filters.priceRange
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
  };

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="mb-6 space-y-4">
        {/* Filter Button and Active Filters */}
        <div className="flex items-center md:justify-between  gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2  px-5 py-2 text-sm font-medium text-primary-dark bg-white/80 backdrop-blur-md 
             border border-primary/20 rounded-full shadow-sm 
             hover:bg-white/90 hover:border-primary/30 hover:shadow-md 
             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
             transition-all duration-200 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              {activeFilters.length > 0 && (
                <span className="absolute -top-2 -right-2 text-white bg-primary rounded-full w-5 h-5 text-xs flex items-center justify-center md:hidden">
                  {activeFilters.length}
                </span>
              )}
              <div className=" items-center gap-2 hidden md:flex">
                Filters
                {activeFilters.length > 0 && (
                  <span className=" text-primary bg-primary/10 rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="Best Matches"
            />
          </div>
        </div>
        <div className="flex  gap-2  flex-wrap  w-fit">
          {activeFilters.map((filter, index) => (
            <FilterTag
              key={index}
              label={filter}
              onRemove={() => removeFilter(filter)}
            />
          ))}
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:text-primary-dark underline ml-1.5 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      {/* Content Area */}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default ProductFilters;
