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
    const [selectedPriceTier, setSelectedPriceTier] = useState('all'); // 'all', 'under150', '150-300', '300-500', 'above500', 'custom'
    const [customMaxPrice, setCustomMaxPrice] = useState(600);
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

                // 3. Price Tier / Slider Filter
                if (selectedPriceTier === 'under150' && price > 150) return false;
                if (selectedPriceTier === '150-300' && (price < 150 || price > 300)) return false;
                if (selectedPriceTier === '300-500' && (price < 300 || price > 500)) return false;
                if (selectedPriceTier === 'above500' && price < 500) return false;
                if (selectedPriceTier === 'custom' && price > customMaxPrice) return false;

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
    }, [productList, activeCategory, searchQuery, selectedPriceTier, customMaxPrice, inStockOnly, onDiscountOnly, sortBy]);

    // Check if any filter is actively applied
    const hasActiveFilters = activeCategory !== 'All Products' || searchQuery !== '' || selectedPriceTier !== 'all' || inStockOnly || onDiscountOnly || sortBy !== 'featured';

    const handleClearAllFilters = () => {
        handleCategoryClick('All Products');
        setSearchQuery('');
        setSelectedPriceTier('all');
        setCustomMaxPrice(maxProductPrice);
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
                    {/* Top Row: Search + Sort + Quick Toggles */}
                    <div className="shop-toolbar-top-row">
                        {/* Live Search Input */}
                        <div className="shop-search-box">
                            <Search size={17} className="search-icon" />
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
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Action Group: Sort By + Price Slider Button */}
                        <div className="shop-toolbar-controls">
                            {/* Sort Dropdown */}
                            <div className="shop-select-wrap">
                                <ArrowUpDown size={15} className="select-icon" />
                                <select
                                    className="shop-select-input"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
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

                            {/* Price Slider Toggle Button */}
                            <button
                                className={`shop-filter-toggle-btn ${selectedPriceTier === 'custom' || showPriceSlider ? 'active' : ''}`}
                                onClick={() => setShowPriceSlider(!showPriceSlider)}
                                title="Custom Price Filter"
                            >
                                <SlidersHorizontal size={15} />
                                <span>{t('priceRange')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Custom Price Range Slider */}
                    {showPriceSlider && (
                        <div className="shop-custom-slider-drawer">
                            <div className="slider-header">
                                <span className="slider-label">Max Price: <strong>₹{customMaxPrice}</strong></span>
                                <span className="slider-limits">₹{minPrice} — ₹{maxProductPrice}</span>
                            </div>
                            <input
                                type="range"
                                min={minPrice}
                                max={maxProductPrice}
                                step={10}
                                value={customMaxPrice}
                                onChange={(e) => {
                                    setCustomMaxPrice(Number(e.target.value));
                                    setSelectedPriceTier('custom');
                                }}
                                className="shop-range-slider"
                            />
                        </div>
                    )}

                    {/* Bottom Row: Quick Price Range Chips + In-Stock & Offers */}
                    <div className="shop-toolbar-bottom-row">
                        <div className="shop-quick-price-chips">
                            <span className="quick-label">Price:</span>
                            <button
                                className={`quick-price-chip ${selectedPriceTier === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedPriceTier('all')}
                            >
                                {t('filterPriceAll')}
                            </button>
                            <button
                                className={`quick-price-chip ${selectedPriceTier === 'under150' ? 'active' : ''}`}
                                onClick={() => setSelectedPriceTier('under150')}
                            >
                                {t('filterPriceUnder150')}
                            </button>
                            <button
                                className={`quick-price-chip ${selectedPriceTier === '150-300' ? 'active' : ''}`}
                                onClick={() => setSelectedPriceTier('150-300')}
                            >
                                {t('filterPrice150to300')}
                            </button>
                            <button
                                className={`quick-price-chip ${selectedPriceTier === '300-500' ? 'active' : ''}`}
                                onClick={() => setSelectedPriceTier('300-500')}
                            >
                                {t('filterPrice300to500')}
                            </button>
                            <button
                                className={`quick-price-chip ${selectedPriceTier === 'above500' ? 'active' : ''}`}
                                onClick={() => setSelectedPriceTier('above500')}
                            >
                                {t('filterPriceAbove500')}
                            </button>
                        </div>

                        {/* In-Stock & On Discount Badges */}
                        <div className="shop-quick-toggles">
                            <button
                                className={`shop-toggle-pill ${inStockOnly ? 'active' : ''}`}
                                onClick={() => setInStockOnly(!inStockOnly)}
                            >
                                <span className={`toggle-dot ${inStockOnly ? 'checked' : ''}`} />
                                {t('inStockOnly')}
                            </button>
                            <button
                                className={`shop-toggle-pill ${onDiscountOnly ? 'active' : ''}`}
                                onClick={() => setOnDiscountOnly(!onDiscountOnly)}
                            >
                                <Tag size={13} />
                                {t('onDiscountOnly')}
                            </button>
                        </div>
                    </div>
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
                                    <button onClick={() => handleCategoryClick('All Products')}><X size={12} /></button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="active-tag-chip">
                                    "{searchQuery}"
                                    <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                                </span>
                            )}
                            {selectedPriceTier !== 'all' && (
                                <span className="active-tag-chip">
                                    {selectedPriceTier === 'under150' && '< ₹150'}
                                    {selectedPriceTier === '150-300' && '₹150 - ₹300'}
                                    {selectedPriceTier === '300-500' && '₹300 - ₹500'}
                                    {selectedPriceTier === 'above500' && '> ₹500'}
                                    {selectedPriceTier === 'custom' && `≤ ₹${customMaxPrice}`}
                                    <button onClick={() => setSelectedPriceTier('all')}><X size={12} /></button>
                                </span>
                            )}
                            {inStockOnly && (
                                <span className="active-tag-chip">
                                    In Stock
                                    <button onClick={() => setInStockOnly(false)}><X size={12} /></button>
                                </span>
                            )}
                            {onDiscountOnly && (
                                <span className="active-tag-chip">
                                    On Offer
                                    <button onClick={() => setOnDiscountOnly(false)}><X size={12} /></button>
                                </span>
                            )}

                            <button className="reset-all-filters-btn" onClick={handleClearAllFilters}>
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
