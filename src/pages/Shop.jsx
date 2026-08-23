import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { fetchCategoriesApi, fetchProductsApi } from '../services/api';

export default function Shop({
    products: propProducts,
    loadingProducts: propLoading,
    onProductView,
    onAddToCart,
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

    useEffect(() => {
        async function loadDynamicCategories() {
            const res = await fetchCategoriesApi();
            if (res.success && res.data) {
                setCategories([
                    { id: 'all', name: 'All Products' },
                    ...res.data
                ]);
            }
        }
        loadDynamicCategories();
    }, []);

    const activeCategory = setSelectedCategory ? selectedCategory : localCategory;

    const handleCategoryClick = (catName) => {
        if (setSelectedCategory) {
            setSelectedCategory(catName);
        } else {
            setLocalCategory(catName);
        }
    };

    const filteredProducts = productList.filter(product => {
        if (!activeCategory || activeCategory === 'All Products' || activeCategory === 'All') return true;
        const activeLower = activeCategory.toLowerCase();
        const catLower = (product.category || '').toLowerCase();
        const nameLower = (product.name || '').toLowerCase();
        return catLower.includes(activeLower) || activeLower.includes(catLower) || nameLower.includes(activeLower);
    });

    return (
        <main className="shop-page">
            <div className="container">

                {/* Shop Header */}
                <div className="shop-header-wrapper">
                    <span className="section-subtitle">{t('productSectionSub')}</span>
                    <h1 className="shop-page-title">{t('productSectionTitle')}</h1>
                    <p className="shop-page-desc">
                        {t('productSectionDesc')}
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="shop-filter-bar">
                    <div className="shop-categories">
                        {categories.map(cat => (
                            <button
                                key={cat.id || cat.name}
                                className={`filter-chip ${activeCategory === cat.name || (activeCategory === 'All Products' && cat.name === 'All Products') ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(cat.name)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <div className="shop-item-count">
                        Showing {filteredProducts.length} items
                    </div>
                </div>

                {/* Products Grid or Empty State */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '1rem', color: '#646a66' }}>
                        Loading products from backend server...
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="shop-grid-4col">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                {...product}
                                onProductView={onProductView}
                                onAddToCart={onAddToCart}
                                isFavorite={Array.isArray(favoriteProductIds) && favoriteProductIds.includes(product.id)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-products-found-card">
                        <div className="no-products-icon-wrap">
                            <span>🌾</span>
                        </div>
                        <h3 className="no-products-title">No products available yet</h3>
                        <p className="no-products-desc">
                            We’re working on bringing more products to this category. Check back soon!
                        </p>
                        <button
                            className="btn btn-primary no-products-btn"
                            onClick={() => handleCategoryClick('All Products')}
                        >
                            View All Products
                        </button>
                    </div>
                )}

            </div>
        </main>
    );
}
