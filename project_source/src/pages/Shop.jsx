import React, { useState } from 'react';

const PRODUCTS = [
    {
        id: '300g',
        name: 'Amutham Sprouted Health Mix (300g)',
        category: 'Sprouted Millets & Grains',
        description: 'Our signature sprouted ancient grain porridge porridge powder. Crafted with Pearl Millet, Finger Millet, and Sorghum, hygienically processed and enriched with green cardamom.',
        price: 12.00,
        inrPrice: '₹499.00',
        image: 'refence image/image.png',
        badge: 'Flagship Pouch',
        tag: 'Starter'
    },
    {
        id: '1kg',
        name: 'Amutham Family Pack (1kg)',
        category: 'Bulk Value Box',
        description: 'Ensure daily nutritious porridge routines for the entire family. Delivers high trace-mineral bioavailability and complete protein/fiber levels.',
        price: 32.00,
        inrPrice: '₹1,299.00',
        image: 'refence image/image.png',
        imageStyle: { filter: 'hue-rotate(25deg) saturate(1.15)' },
        badge: 'Best Value',
        tag: 'Family'
    },
    {
        id: 'premium',
        name: 'Amutham Cardamom Premium (500g)',
        category: 'Enriched Digest Elixir',
        description: 'Infused with double organic green cardamom concentrations to stimulate natural metabolic rates, relieve acidity, and optimize digestion.',
        price: 22.00,
        inrPrice: '₹899.00',
        image: 'refence image/image.png',
        imageStyle: { filter: 'hue-rotate(185deg) brightness(0.9)' },
        badge: 'Premium Batch',
        tag: 'Premium'
    }
];

export default function Shop({ onProductView, onAddToCart }) {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = selectedCategory === 'All'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.tag === selectedCategory);

    return (
        <main className="shop-page">
            <div className="container">
                
                {/* Shop Header */}
                <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <span className="section-subtitle">THE COLLECTION</span>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Our Sprouted Porridges</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: '#646a66' }}>
                        Rich in vitamins, essential minerals, protein, and dietary fibers. 100% natural, certified sprouted nutrition.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="shop-filter-bar">
                    <div className="shop-categories">
                        <button 
                            className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                        >
                            All Blends
                        </button>
                        <button 
                            className={`filter-chip ${selectedCategory === 'Starter' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('Starter')}
                        >
                            Starter Pouch
                        </button>
                        <button 
                            className={`filter-chip ${selectedCategory === 'Family' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('Family')}
                        >
                            Family Pack
                        </button>
                        <button 
                            className={`filter-chip ${selectedCategory === 'Premium' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('Premium')}
                        >
                            Premium Cardamom
                        </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#646a66', fontWeight: 600 }}>
                        Showing {filteredProducts.length} sizes
                    </div>
                </div>

                {/* Products Grid */}
                <div className="shop-grid">
                    {filteredProducts.map(product => (
                        <div className="product-card" key={product.id}>
                            <div 
                                className="product-card-image-wrap"
                                onClick={() => onProductView(product.id)}
                            >
                                {product.badge && (
                                    <span className="product-card-badge">{product.badge}</span>
                                )}
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="product-card-image"
                                    style={product.imageStyle || {}}
                                />
                            </div>
                            
                            <div className="product-card-info">
                                <span className="product-card-category">{product.category}</span>
                                <h3 
                                    className="product-card-title"
                                    onClick={() => onProductView(product.id)}
                                >
                                    {product.name}
                                </h3>
                                <p className="product-card-desc">{product.description}</p>
                                
                                <div className="product-card-footer">
                                    <span className="product-card-price">
                                        ${product.price.toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#646a66', fontWeight: 400 }}>({product.inrPrice})</span>
                                    </span>
                                    <button 
                                        className="btn btn-secondary product-card-btn"
                                        onClick={() => onAddToCart(product.id, product.name, product.price, 'one-time')}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}
export { PRODUCTS };
