import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Science from './pages/Science';
import About from './pages/About';

export default function App() {
    const [page, setPageState] = useState('home');
    const [activeProductId, setActiveProductId] = useState(null);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Scroll to top on page change
    const setPage = (newPage) => {
        setPageState(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleProductView = (productId) => {
        setActiveProductId(productId);
        setPage('product');
    };

    const handleAddToCart = (id, name, price, option = 'one-time', quantity = 1) => {
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(
                item => item.id === id && item.option === option
            );

            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prevCart, { id, name, price, option, quantity }];
            }
        });
        setIsCartOpen(true);
    };

    const handleRemoveFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, idx) => idx !== index));
    };

    const handleCheckout = () => {
        alert('Thank you for choosing Mangalam Healthy Foods. Directing to our secure checkout terminal...');
        setCart([]);
        setIsCartOpen(false);
    };

    const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Header 
                page={page} 
                setPage={setPage} 
                cartCount={totalCartCount} 
                onCartOpen={() => setIsCartOpen(true)} 
            />

            {/* Page Router */}
            {page === 'home' && (
                <Home 
                    setPage={setPage} 
                    onProductView={handleProductView} 
                    onAddToCart={handleAddToCart} 
                />
            )}
            
            {page === 'shop' && (
                <Shop 
                    onProductView={handleProductView} 
                    onAddToCart={handleAddToCart} 
                />
            )}
            
            {page === 'product' && (
                <ProductDetail 
                    productId={activeProductId} 
                    onAddToCart={handleAddToCart} 
                    onBack={() => setPage('shop')} 
                />
            )}
            
            {page === 'science' && (
                <Science setPage={setPage} />
            )}
            
            {page === 'about' && (
                <About setPage={setPage} />
            )}

            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cart={cart} 
                onRemove={handleRemoveFromCart} 
                onCheckout={handleCheckout} 
            />

            <Footer setPage={setPage} />
        </>
    );
}
