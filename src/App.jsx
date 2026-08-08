import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import OrganicBackgroundOverlay from './components/OrganicBackgroundOverlay';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Science from './pages/Science';
import About from './pages/About';
import AdminRoot from './admin/AdminRoot';

export default function App() {
    const [page, setPageState] = useState(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            return 'admin';
        }
        return 'home';
    });
    const [activeProductId, setActiveProductId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [user, setUser] = useState(null);

    const handleSelectCategory = (catName) => {
        setSelectedCategory(catName);
        setPage('shop');
    };

    // Sync page state with window location & popstate events
    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname.startsWith('/admin')) {
                setPageState('admin');
            } else {
                const path = window.location.pathname.replace('/', '') || 'home';
                setPageState(path === 'admin' ? 'admin' : (['shop', 'science', 'about', 'product'].includes(path) ? path : 'home'));
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Scroll to top on page change & update URL history
    const setPage = (newPage) => {
        setPageState(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (newPage === 'admin') {
            if (window.location.pathname !== '/admin') {
                window.history.pushState({}, '', '/admin');
            }
        } else {
            if (window.location.pathname.startsWith('/admin')) {
                window.history.pushState({}, '', '/');
            }
        }
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

    // Dedicated standalone view for Admin Panel
    if (page === 'admin') {
        return (
            <AdminRoot
                onGoToStore={() => setPage('home')}
            />
        );
    }

    return (
        <>
            <OrganicBackgroundOverlay />
            <Header
                page={page}
                setPage={setPage}
                cartCount={totalCartCount}
                onCartOpen={() => setIsCartOpen(true)}
                onProductView={handleProductView}
                user={user}
                onAuthOpen={() => setIsAuthOpen(true)}
            />

            {/* Page Router */}
            {page === 'home' && (
                <Home
                    setPage={setPage}
                    onProductView={handleProductView}
                    onAddToCart={handleAddToCart}
                    onSelectCategory={handleSelectCategory}
                />
            )}

            {page === 'shop' && (
                <Shop
                    onProductView={handleProductView}
                    onAddToCart={handleAddToCart}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
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

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                user={user}
                onLogin={(userData) => {
                    setUser(userData);
                    setIsAuthOpen(false);
                }}
                onRegister={(userData) => {
                    setUser(userData);
                    setIsAuthOpen(false);
                }}
                onLogout={() => {
                    setUser(null);
                    setIsAuthOpen(false);
                }}
            />

            <Footer setPage={setPage} />
        </>
    );
}

