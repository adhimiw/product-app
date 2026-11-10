import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { fetchCategoriesApi, fetchProductsApi, subscribeToCacheInvalidation } from '../services/api';
import { 
    Search, 
    SlidersHorizontal, 
    ArrowUpDown, 
    X, 
    RotateCcw, 
    Check, 
    ChevronDown,
    Tag,
    IndianRupee,
    Filter
} from 'lucide-react';

export default function Shop({
    products: propProducts,
    loadingProducts: propLoading,
    onProductView,
    onAddToCart,
    cart = [],
    onUpdateQuantity,
    onRemoveFromCart,
    selectedCategory = 'All Products',
    setSelectedCategory,
    favoriteProductIds = [],
    onToggleFavorite
}) {
    const { t } = useLanguage();
    const [localCategory, setLocalCategory] = useState(selectedCategory);
    const [categories, setCategories] = useState([{ id: 'all', name: 'All Products' }]);
    const [productList, setProductList] = useState(propProducts || []);
    const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : (!propProducts || propProducts.length === 0));

    // Filter and Sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState(null); // [min, max] or null when unconstrained
    const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price_asc', 'price_desc', 'rating', 'name_asc', 'name_desc'
    const [inStockOnly, setInStockOnly] = useState(false);
    const [onDiscountOnly, setOnDiscountOnly] = useState(false);

    // Sidebar Drawers State
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

    useEffect(() => {
        if (propProducts && propProducts.length > 0) {
            setProductList(propProducts);
            setLoading(false);
        } else {
            async function loadProducts() {
                setLoading(true);
                const res = await fetchProductsApi();
                if (res.success && res.data) {
                    setProductList(res.data);
                }
                setLoading(false);
            }
            loadProducts();
        }
    }, [propProducts]);

    const loadDynamicCategories = async (forceRefresh = false) => {
        const res = await fetchCategoriesApi(forceRefresh);
        if (res.success && res.data) {
            setCategories([
                { id: 'all', name: 'All Products' },
                ...res.data
            ]);
        }
    };

    useEffect(() => {
        loadDynamicCategories();
    }, []);

    // Subscribe to real-time cache updates
    useEffect(() => {
        const unsubCat = subscribeToCacheInvalidation('categories', () => {
            loadDynamicCategories(true);
        });
        const unsubProd = subscribeToCacheInvalidation('products', async () => {
            const res = await fetchProductsApi(true);
            if (res.success && res.data) {
                setProductList(res.data);
            }
        });
        return () => {
            unsubCat();
            unsubProd();
        };
    }, []);

    const activeCategory = setSelectedCategory ? selectedCategory : localCategory;

    const handleCategoryClick = (catName) => {
        if (setSelectedCategory) {
            setSelectedCategory(catName);
        } else {
            setLocalCategory(catName);
        }
    };

    // Calculate item count per category
    const categoryCounts = useMemo(() => {
        const counts = { 'All Products': productList.length };
        categories.forEach(cat => {
            if (cat.name === 'All Products') return;
            const catLower = cat.name.toLowerCase();
            const count = productList.filter(p => {
                const pCat = (p.category || '').toLowerCase();
                const pName = (p.name || '').toLowerCase();
                return pCat.includes(catLower) || catLower.includes(pCat) || pName.includes(catLower);
            }).length;
            counts[cat.name] = count;
        });
        return counts;
    }, [productList, categories]);

    // Active Category Object
    const currentCategoryObj = useMemo(() => {
        return categories.find(c => c.name === activeCategory) || null;
    }, [categories, activeCategory]);

    // Calculate min and max prices from data
    const { minPrice, maxProductPrice } = useMemo(() => {
        if (productList.length === 0) return { minPrice: 0, maxProductPrice: 600 };
        let min = Infinity;
        let max = 0;
        productList.forEach(p => {
            const pPrice = Number(p.actual_price || p.price || 0);
            if (pPrice < min) min = pPrice;
            if (pPrice > max) max = pPrice;
            if (Array.isArray(p.package_sizes)) {
                p.package_sizes.forEach(ps => {
                    const vp = Number(ps.variant_price || 0);
                    if (vp > 0 && vp < min) min = vp;
                    if (vp > max) max = vp;
                });
            }
        });
        return {
            minPrice: min === Infinity ? 0 : Math.floor(min),
            maxProductPrice: max === 0 ? 600 : Math.ceil(max)
        };
    }, [productList]);

    // Active price range bounds
    const currentMin = priceRange ? priceRange[0] : minPrice;
    const currentMax = priceRange ? priceRange[1] : maxProductPrice;
    const isPriceFiltered = priceRange !== null && (priceRange[0] > minPrice || priceRange[1] < maxProductPrice);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        return productList
            .filter(product => {
                // 1. Category Filter
                if (activeCategory && activeCategory !== 'All Products' && activeCategory !== 'All') {
                    const activeLower = activeCategory.toLowerCase();
                    const catLower = (product.category || '').toLowerCase();
                    const nameLower = (product.name || '').toLowerCase();
                    const matchCat = catLower.includes(activeLower) || activeLower.includes(catLower) || nameLower.includes(activeLower);
                    if (!matchCat) return false;
                }

                // 2. Search Query Filter
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim();
                    const nameMatch = (product.name || '').toLowerCase().includes(query);
                    const descMatch = (product.description || '').toLowerCase().includes(query);
                    const catMatch = (product.category || '').toLowerCase().includes(query);
                    const ingMatch = (product.ingredients || '').toLowerCase().includes(query);
                    const tagsMatch = Array.isArray(product.tags) && product.tags.some(t => String(t).toLowerCase().includes(query));
                    if (!nameMatch && !descMatch && !catMatch && !ingMatch && !tagsMatch) {
                        return false;
                    }
                }

                // Get base price for filtering
                const price = Number(product.actual_price || product.price || 0);

                // 3. Dynamic Price Range Filter
                if (isPriceFiltered) {
                    const inBaseRange = price >= currentMin && price <= currentMax;
                    const inVariantRange = Array.isArray(product.package_sizes) && product.package_sizes.some(ps => {
                        const vp = Number(ps.variant_price || 0);
                        return vp >= currentMin && vp <= currentMax;
                    });
                    if (!inBaseRange && !inVariantRange) return false;
                }

                // 4. In Stock Filter
                if (inStockOnly && Number(product.stock || 0) <= 0) return false;

                // 5. On Discount Filter
                if (onDiscountOnly && Number(product.discount_value || 0) <= 0 && (!product.discount || product.discount === '')) return false;

                return true;
            })
            .sort((a, b) => {
                const priceA = Number(a.actual_price || a.price || 0);
                const priceB = Number(b.actual_price || b.price || 0);
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();

                if (sortBy === 'price_asc') {
                    return priceA - priceB;
                }
                if (sortBy === 'price_desc') {
                    return priceB - priceA;
                }
                if (sortBy === 'name_asc') {
                    return nameA.localeCompare(nameB);
                }
                if (sortBy === 'name_desc') {
                    return nameB.localeCompare(nameA);
                }
                if (sortBy === 'rating') {
                    const ratingA = Number(a.rating || 4.9);
                    const ratingB = Number(b.rating || 4.9);
                    return ratingB - ratingA;
                }
                // Default: featured / id asc or desc
                return (a.id || 0) - (b.id || 0);
            });
    }, [productList, activeCategory, searchQuery, isPriceFiltered, currentMin, currentMax, inStockOnly, onDiscountOnly, sortBy]);

    // Body scroll lock & Escape key listener for Drawers
    useEffect(() => {
        if (isFilterDrawerOpen || isSortDrawerOpen) {
            document.body.classList.add('shop-drawer-open');
        } else {
            document.body.classList.remove('shop-drawer-open');
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsFilterDrawerOpen(false);
                setIsSortDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.classList.remove('shop-drawer-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFilterDrawerOpen, isSortDrawerOpen]);

    // Sort options array
    const sortOptions = useMemo(() => [
        { id: 'featured', label: t('sortFeatured') || 'Featured & Popular', desc: 'Handpicked favorites & newest arrivals' },
        { id: 'price_asc', label: t('sortPriceLowHigh') || 'Price: Low to High', desc: 'Budget-friendly to premium' },
        { id: 'price_desc', label: t('sortPriceHighLow') || 'Price: High to Low', desc: 'Premium to budget-friendly' },
        { id: 'rating', label: t('sortRating') || 'Highest Rated', desc: 'Customer favorites & top reviews' },
        { id: 'name_asc', label: t('sortNameAZ') || 'Name: A to Z', desc: 'Alphabetical order A to Z' },
        { id: 'name_desc', label: t('sortNameZA') || 'Name: Z to A', desc: 'Alphabetical order Z to A' },
    ], [t]);

    const currentSortLabel = useMemo(() => {
        const found = sortOptions.find(o => o.id === sortBy);
        return found ? found.label : (t('sortFeatured') || 'Featured & Popular');
    }, [sortOptions, sortBy, t]);

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (activeCategory && activeCategory !== 'All Products' && activeCategory !== 'All') count++;
        if (searchQuery.trim()) count++;
        if (isPriceFiltered) count++;
        if (inStockOnly) count++;
        if (onDiscountOnly) count++;
        return count;
    }, [activeCategory, searchQuery, isPriceFiltered, inStockOnly, onDiscountOnly]);

    // Check if any filter or non-default sort is applied
    const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'featured';

    const handleClearAllFilters = () => {
        handleCategoryClick('All Products');
        setSearchQuery('');
        setPriceRange(null);
        setInStockOnly(false);
        setOnDiscountOnly(false);
        setSortBy('featured');
    };

    // Dynamic Header details
    const isAllProducts = !activeCategory || activeCategory === 'All Products' || activeCategory === 'All';
    const displayHeaderTitle = isAllProducts ? t('productSectionTitle') : activeCategory;
    const displayHeaderDesc = (isAllProducts || !currentCategoryObj?.description) 
        ? t('productSectionDesc') 
        : currentCategoryObj.description;

    return (
        <main className="shop-page">
            <div className="container">

                {/* Shop Hero Header */}
                <div className="shop-header-wrapper">
                    <h1 className="shop-page-title">{displayHeaderTitle}</h1>
                    <p className="shop-page-desc">
                        {displayHeaderDesc}
                    </p>
                </div>


                {/* Modern Side-Action Bar (Two Brothers Organic Style) */}
                <div className="shop-action-bar">
                    {/* Left: Filter Sidebar Drawer Trigger */}
                    <button
                        type="button"
                        className={`shop-action-bar-btn filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                        onClick={() => setIsFilterDrawerOpen(true)}
                        aria-label="Open Filter Sidebar"
                    >
                        <SlidersHorizontal size={17} className="action-btn-icon" />
                        <span className="action-btn-label">{t('filtersWord') || 'Filters'}</span>
                        {activeFilterCount > 0 && (
                            <span className="shop-action-badge">{activeFilterCount}</span>
                        )}
                    </button>

                    {/* Center: Total Matching Products Counter */}
                    <div className="shop-action-bar-count">
                        <span className="count-number">{filteredProducts.length}</span> {t('productsWord') || 'products'}
                    </div>

                    {/* Right: Sort Sidebar Drawer Trigger */}
                    <button
                        type="button"
                        className={`shop-action-bar-btn sort-btn ${sortBy !== 'featured' ? 'active' : ''}`}
                        onClick={() => setIsSortDrawerOpen(true)}
                        aria-label="Open Sort Sidebar"
                    >
                        <ArrowUpDown size={17} className="action-btn-icon" />
                        <span className="action-btn-label">{t('sortWord') || 'Sort'}</span>
                        {sortBy !== 'featured' && <span className="shop-action-dot" />}
                    </button>
                </div>

                {/* Active Filter Quick Chips Bar */}
                {hasActiveFilters && (
                    <div className="shop-active-filter-tags">
                        {activeCategory !== 'All Products' && activeCategory !== 'All' && (
                            <span className="active-tag-chip">
                                {activeCategory}
                                <button type="button" onClick={() => handleCategoryClick('All Products')} title="Remove category filter">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {searchQuery.trim() && (
                            <span className="active-tag-chip">
                                "{searchQuery}"
                                <button type="button" onClick={() => setSearchQuery('')} title="Clear search">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {isPriceFiltered && (
                            <span className="active-tag-chip price-filter-tag">
                                ₹{currentMin} — ₹{currentMax}
                                <button type="button" onClick={() => setPriceRange(null)} title="Clear price filter">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {inStockOnly && (
                            <span className="active-tag-chip">
                                {t('inStockOnly') || 'In Stock'}
                                <button type="button" onClick={() => setInStockOnly(false)} title="Clear in stock filter">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {onDiscountOnly && (
                            <span className="active-tag-chip">
                                {t('onDiscountOnly') || 'Special Offers'}
                                <button type="button" onClick={() => setOnDiscountOnly(false)} title="Clear offers filter">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {sortBy !== 'featured' && (
                            <span className="active-tag-chip sort-tag">
                                Sort: {currentSortLabel}
                                <button type="button" onClick={() => setSortBy('featured')} title="Reset sort to default">
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button type="button" className="reset-all-filters-btn" onClick={handleClearAllFilters}>
                            <RotateCcw size={12} />
                            <span>{t('clearFilters') || 'Reset All'}</span>
                        </button>
                    </div>
                )}

                {/* Products Grid or Empty State */}
                {loading ? (
                    <div className="shop-loading-state">
                        <div className="shop-loading-spinner" />
                        <p>Loading pure natural products...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="shop-grid-4col">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                {...product}
                                onProductView={onProductView}
                                onAddToCart={onAddToCart}
                                cart={cart}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemoveFromCart={onRemoveFromCart}
                                isFavorite={Array.isArray(favoriteProductIds) && favoriteProductIds.includes(product.id)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-products-found-card">
                        <div className="no-products-icon-wrap">
                            <Filter size={32} />
                        </div>
                        <h3 className="no-products-title">No matching products found</h3>
                        <p className="no-products-desc">
                            We couldn't find any products matching your active filters. Try adjusting your search query or price range.
                        </p>
                        <button
                            className="btn btn-primary no-products-btn"
                            onClick={handleClearAllFilters}
                        >
                            <RotateCcw size={15} style={{ marginRight: '8px' }} />
                            {t('clearFilters')}
                        </button>
                    </div>
                )}

            </div>

            {/* Drawer Backdrop Overlay */}
            {(isFilterDrawerOpen || isSortDrawerOpen) && (
                <div 
                    className="shop-drawer-backdrop visible"
                    onClick={() => {
                        setIsFilterDrawerOpen(false);
                        setIsSortDrawerOpen(false);
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Left Sidebar Drawer: Filters */}
            <aside 
                className={`shop-drawer left-drawer ${isFilterDrawerOpen ? 'open' : ''}`}
                aria-label="Filter Products"
            >
                {/* Header */}
                <div className="shop-drawer-header">
                    <div className="drawer-header-title">
                        <SlidersHorizontal size={19} className="drawer-header-icon" />
                        <h3>{t('filtersWord') || 'Filters'}</h3>
                        {activeFilterCount > 0 && (
                            <span className="drawer-header-badge">{activeFilterCount}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="drawer-close-btn"
                        onClick={() => setIsFilterDrawerOpen(false)}
                        aria-label="Close filters"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="shop-drawer-body">
                    {/* 1. Search Box */}
                    <div className="drawer-section">
                        <label className="drawer-section-label">Search Products</label>
                        <div className="drawer-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                className="drawer-search-input"
                                placeholder={t('searchPlaceholderShop')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={() => setSearchQuery('')}
                                    title="Clear search"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Categories Selection */}
                    <div className="drawer-section">
                        <div className="drawer-section-header">
                            <label className="drawer-section-label">{t('categoriesWord') || 'Categories'}</label>
                            <span className="drawer-section-count">{categories.length}</span>
                        </div>
                        <div className="drawer-categories-list">
                            {categories.map(cat => {
                                const isCurrent = activeCategory === cat.name || (isAllProducts && cat.name === 'All Products');
                                const count = categoryCounts[cat.name] ?? 0;
                                return (
                                    <button
                                        key={cat.id || cat.name}
                                        type="button"
                                        className={`drawer-category-item ${isCurrent ? 'selected' : ''}`}
                                        onClick={() => handleCategoryClick(cat.name)}
                                    >
                                        <span className="drawer-radio-circle">
                                            {isCurrent && <Check size={12} strokeWidth={3} />}
                                        </span>
                                        <span className="drawer-cat-name">{cat.name}</span>
                                        <span className="drawer-cat-count">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Price Range Slider & Presets */}
                    <div className="drawer-section">
                        <div className="drawer-section-header">
                            <label className="drawer-section-label">{t('priceRange') || 'Price Range'}</label>
                            <div className="drawer-price-live">
                                <strong>₹{currentMin}</strong>
                                <span className="price-sep">—</span>
                                <strong>₹{currentMax}</strong>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="drawer-price-presets">
                            <button
                                type="button"
                                className={`price-preset-chip ${!isPriceFiltered ? 'active' : ''}`}
                                onClick={() => setPriceRange(null)}
                            >
                                {t('filterPriceAll') || 'All Prices'}
                            </button>
                            <button
                                type="button"
                                className={`price-preset-chip ${priceRange && priceRange[0] === minPrice && priceRange[1] === 150 ? 'active' : ''}`}
                                onClick={() => setPriceRange([minPrice, 150])}
                            >
                                {t('filterPriceUnder150') || 'Under ₹150'}
                            </button>
                            <button
                                type="button"
                                className={`price-preset-chip ${priceRange && priceRange[0] === 150 && priceRange[1] === 300 ? 'active' : ''}`}
                                onClick={() => setPriceRange([150, 300])}
                            >
                                {t('filterPrice150to300') || '₹150 – ₹300'}
                            </button>
                            <button
                                type="button"
                                className={`price-preset-chip ${priceRange && priceRange[0] === 300 && priceRange[1] === 500 ? 'active' : ''}`}
                                onClick={() => setPriceRange([300, 500])}
                            >
                                {t('filterPrice300to500') || '₹300 – ₹500'}
                            </button>
                            <button
                                type="button"
                                className={`price-preset-chip ${priceRange && priceRange[0] === 500 ? 'active' : ''}`}
                                onClick={() => setPriceRange([500, maxProductPrice])}
                            >
                                {t('filterPriceAbove500') || 'Above ₹500'}
                            </button>
                        </div>

                        {/* Dual Range Sliders */}
                        <div className="drawer-sliders-container">
                            <div className="drawer-slider-row">
                                <span className="slider-axis-label">Min: ₹{currentMin}</span>
                                <input
                                    type="range"
                                    min={minPrice}
                                    max={maxProductPrice}
                                    step={10}
                                    value={currentMin}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const safeMin = Math.min(val, currentMax);
                                        setPriceRange([safeMin, currentMax]);
                                    }}
                                    className="drawer-range-slider"
                                />
                            </div>
                            <div className="drawer-slider-row">
                                <span className="slider-axis-label">Max: ₹{currentMax}</span>
                                <input
                                    type="range"
                                    min={minPrice}
                                    max={maxProductPrice}
                                    step={10}
                                    value={currentMax}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const safeMax = Math.max(val, currentMin);
                                        setPriceRange([currentMin, safeMax]);
                                    }}
                                    className="drawer-range-slider"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Availability & Special Deals */}
                    <div className="drawer-section">
                        <label className="drawer-section-label">Availability & Offers</label>
                        <div className="drawer-toggles-list">
                            <label className="drawer-toggle-row">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                />
                                <div className="toggle-info">
                                    <span className="toggle-title">{t('inStockOnly') || 'In Stock Only'}</span>
                                    <span className="toggle-desc">Show only ready to ship products</span>
                                </div>
                            </label>
                            <label className="drawer-toggle-row">
                                <input
                                    type="checkbox"
                                    checked={onDiscountOnly}
                                    onChange={(e) => setOnDiscountOnly(e.target.checked)}
                                />
                                <div className="toggle-info">
                                    <span className="toggle-title">{t('onDiscountOnly') || 'Special Offers'}</span>
                                    <span className="toggle-desc">Exclusive discounts and festive offers</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="shop-drawer-footer">
                    <button
                        type="button"
                        className="drawer-footer-reset-btn"
                        onClick={handleClearAllFilters}
                        disabled={!hasActiveFilters}
                    >
                        <RotateCcw size={14} />
                        <span>{t('clearFilters') || 'Reset'}</span>
                    </button>
                    <button
                        type="button"
                        className="drawer-footer-apply-btn"
                        onClick={() => setIsFilterDrawerOpen(false)}
                    >
                        <span>{t('applyFilters') || 'Show'} ({filteredProducts.length})</span>
                    </button>
                </div>
            </aside>

            {/* Right Sidebar Drawer: Sort */}
            <aside 
                className={`shop-drawer right-drawer ${isSortDrawerOpen ? 'open' : ''}`}
                aria-label="Sort Options"
            >
                {/* Header */}
                <div className="shop-drawer-header">
                    <div className="drawer-header-title">
                        <ArrowUpDown size={19} className="drawer-header-icon" />
                        <h3>{t('sortBy') || 'Sort By'}</h3>
                    </div>
                    <button
                        type="button"
                        className="drawer-close-btn"
                        onClick={() => setIsSortDrawerOpen(false)}
                        aria-label="Close sort"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="shop-drawer-body">
                    <div className="drawer-sort-options-list">
                        {sortOptions.map(opt => {
                            const isSelected = sortBy === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    className={`drawer-sort-option-btn ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setSortBy(opt.id)}
                                >
                                    <span className="drawer-radio-circle">
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                    </span>
                                    <div className="drawer-sort-text">
                                        <span className="sort-option-label">{opt.label}</span>
                                        <span className="sort-option-desc">{opt.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="shop-drawer-footer">
                    <button
                        type="button"
                        className="drawer-footer-apply-btn full-width"
                        onClick={() => setIsSortDrawerOpen(false)}
                    >
                        <span>Done</span>
                    </button>
                </div>
            </aside>
        </main>
    );
}
