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
    const [showPriceSlider, setShowPriceSlider] = useState(false);

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

    // Check if any filter is actively applied
    const hasActiveFilters = (activeCategory && activeCategory !== 'All Products' && activeCategory !== 'All') || searchQuery !== '' || isPriceFiltered || inStockOnly || onDiscountOnly || sortBy !== 'featured';

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

                {/* Category Navigation Pills Carousel */}
                <div className="shop-category-carousel-wrap">
                    <div className="shop-categories-pill-track">
                        {categories.map(cat => {
                            const isCurrent = activeCategory === cat.name || (isAllProducts && cat.name === 'All Products');
                            const count = categoryCounts[cat.name] ?? 0;
                            return (
                                <button
                                    key={cat.id || cat.name}
                                    className={`shop-category-pill-btn ${isCurrent ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(cat.name)}
                                >
                                    <span className="pill-name">{cat.name}</span>
                                    <span className="pill-count">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Modern Filter Toolbar */}
                <div className="shop-toolbar-card">
                    {/* Top Row: Luxury Search Box */}
                    <div className="shop-search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="shop-search-input"
                            placeholder={t('searchPlaceholderShop')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                                type="button"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Controls Row: Sort, Price Range, In Stock, Offers */}
                    <div className="shop-toolbar-controls-row">
                        {/* Sort Dropdown */}
                        <div className="shop-select-wrap">
                            <ArrowUpDown size={15} className="select-icon" />
                            <select
                                className="shop-select-input"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort products"
                            >
                                <option value="featured">{t('sortFeatured')}</option>
                                <option value="price_asc">{t('sortPriceLowHigh')}</option>
                                <option value="price_desc">{t('sortPriceHighLow')}</option>
                                <option value="rating">{t('sortRating')}</option>
                                <option value="name_asc">{t('sortNameAZ')}</option>
                                <option value="name_desc">{t('sortNameZA')}</option>
                            </select>
                            <ChevronDown size={14} className="select-arrow" />
                        </div>

                        {/* Price Range Button */}
                        <button
                            type="button"
                            className={`shop-filter-toggle-btn ${isPriceFiltered || showPriceSlider ? 'active' : ''}`}
                            onClick={() => setShowPriceSlider(!showPriceSlider)}
                            title="Filter by Price Range"
                        >
                            <SlidersHorizontal size={15} />
                            <span>{t('priceRange')}</span>
                            {isPriceFiltered ? (
                                <span className="price-active-pill">₹{currentMin}–₹{currentMax}</span>
                            ) : (
                                <span className="price-range-hint">₹{minPrice}–₹{maxProductPrice}</span>
                            )}
                        </button>

                        {/* In-Stock & Special Offers Quick Toggles */}
                        <div className="shop-quick-toggles">
                            <button
                                type="button"
                                className={`shop-toggle-pill ${inStockOnly ? 'active' : ''}`}
                                onClick={() => setInStockOnly(!inStockOnly)}
                            >
                                <span className={`toggle-dot ${inStockOnly ? 'checked' : ''}`} />
                                <span>{t('inStockOnly')}</span>
                            </button>
                            <button
                                type="button"
                                className={`shop-toggle-pill ${onDiscountOnly ? 'active' : ''}`}
                                onClick={() => setOnDiscountOnly(!onDiscountOnly)}
                            >
                                <Tag size={13} />
                                <span>{t('onDiscountOnly')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Price Range Slider Drawer */}
                    {showPriceSlider && (
                        <div className="shop-price-slider-panel">
                            <div className="price-panel-header">
                                <div className="price-panel-title">
                                    <span className="price-badge-icon">₹</span>
                                    <div>
                                        <h4 className="price-panel-heading">{t('priceRange')}</h4>
                                        <p className="price-panel-sub">Slide to set your custom budget</p>
                                    </div>
                                </div>
                                <div className="price-panel-actions">
                                    <div className="price-current-display">
                                        <strong>₹{currentMin}</strong>
                                        <span className="price-sep">—</span>
                                        <strong>₹{currentMax}</strong>
                                    </div>
                                    {isPriceFiltered && (
                                        <button
                                            type="button"
                                            className="price-panel-reset-btn"
                                            onClick={() => setPriceRange(null)}
                                            title="Reset price range"
                                        >
                                            <RotateCcw size={12} />
                                            <span>Reset</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="shop-price-sliders-grid">
                                <div className="price-slider-field">
                                    <div className="slider-label-bar">
                                        <span className="slider-col-title">Min Price</span>
                                        <span className="slider-col-val">₹{currentMin}</span>
                                    </div>
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
                                        className="shop-range-slider"
                                    />
                                </div>

                                <div className="price-slider-field">
                                    <div className="slider-label-bar">
                                        <span className="slider-col-title">Max Price</span>
                                        <span className="slider-col-val">₹{currentMax}</span>
                                    </div>
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
                                        className="shop-range-slider"
                                    />
                                </div>
                            </div>

                            <div className="price-panel-footer">
                                <span className="price-limits-note">
                                    Catalog Range: ₹{minPrice} to ₹{maxProductPrice}
                                </span>
                                <span className="price-match-count">
                                    <strong>{filteredProducts.length}</strong> {t('productsWord')} match
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filter Summary Bar */}
                <div className="shop-filter-summary-bar">
                    <div className="shop-item-counter">
                        {t('showingCount')} <strong>{filteredProducts.length}</strong> {t('productsWord')}
                        {filteredProducts.length !== productList.length && (
                            <span className="total-pool-count"> (from {productList.length} total)</span>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <div className="shop-active-filter-tags">
                            {activeCategory !== 'All Products' && (
                                <span className="active-tag-chip">
                                    {activeCategory}
                                    <button type="button" onClick={() => handleCategoryClick('All Products')}><X size={12} /></button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="active-tag-chip">
                                    "{searchQuery}"
                                    <button type="button" onClick={() => setSearchQuery('')}><X size={12} /></button>
                                </span>
                            )}
                            {isPriceFiltered && (
                                <span className="active-tag-chip price-filter-tag">
                                    ₹{currentMin} — ₹{currentMax}
                                    <button type="button" onClick={() => setPriceRange(null)} title="Clear price filter"><X size={12} /></button>
                                </span>
                            )}
                            {inStockOnly && (
                                <span className="active-tag-chip">
                                    In Stock
                                    <button type="button" onClick={() => setInStockOnly(false)}><X size={12} /></button>
                                </span>
                            )}
                            {onDiscountOnly && (
                                <span className="active-tag-chip">
                                    On Offer
                                    <button type="button" onClick={() => setOnDiscountOnly(false)}><X size={12} /></button>
                                </span>
                            )}

                            <button type="button" className="reset-all-filters-btn" onClick={handleClearAllFilters}>
                                <RotateCcw size={13} />
                                <span>{t('clearFilters')}</span>
                            </button>
                        </div>
                    )}
                </div>

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
        </main>
    );
}
