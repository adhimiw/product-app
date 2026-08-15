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
import UserProfile from './pages/UserProfile';
import Toast from './components/Toast';
import AdminRoot from './admin/AdminRoot';
import { fetchProductsApi } from './services/api';

const parseRouteFromUrl = () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    if (pathname.startsWith('/admin')) {
        return { page: 'admin', param: null };
    }
    if (pathname.startsWith('/product/')) {
        const param = pathname.replace('/product/', '').trim();
        return { page: 'product', param: param || null };
    }
    if (pathname === '/products' || pathname === '/shop') {
        return { page: 'shop', param: null };
    }
    if (pathname === '/why-sprouted' || pathname === '/science') {
        return { page: 'science', param: null };
    }
    if (pathname === '/our-story' || pathname === '/about') {
        return { page: 'about', param: null };
    }
    if (pathname === '/profile') {
        return { page: 'profile', param: null };
    }
    return { page: 'home', param: null };
};

export default function App() {
    const initialRoute = parseRouteFromUrl();
    const [page, setPageState] = useState(initialRoute.page);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [activeProductId, setActiveProductId] = useState(initialRoute.param);
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('mangalam_user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoadingProducts(true);
        const res = await fetchProductsApi();
        if (res.success && res.data) {
            setProducts(res.data);
        }
        setLoadingProducts(false);
    };

    const showToast = (title, message, type = 'success') => {
        setToast({ id: Date.now(), title, message, type });
    };

    const handleLoginSuccess = (userData, token, isRegistering = false) => {
        const userWithToken = token ? { ...userData, token } : userData;
        setUser(userWithToken);
        if (token) {
            localStorage.setItem('mangalam_auth_token', token);
            localStorage.setItem('auth_token', token);
            localStorage.setItem('sanctum_auth_token', token);
        }
        localStorage.setItem('mangalam_user', JSON.stringify(userWithToken));

        const name = userData.full_name || userData.name || 'Valued Customer';
        if (isRegistering) {
            showToast('Registration Successful! 🎉', `Welcome to Mangalam Health Foods, ${name}!`, 'success');
        } else {
            showToast('Welcome Back! 👋', `Login successful! Good to see you, ${name}.`, 'success');
        }
    };

    const handleLogout = () => {
        const name = user?.full_name || user?.name || '';
        setUser(null);
        localStorage.removeItem('mangalam_user');
        localStorage.removeItem('mangalam_auth_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('sanctum_auth_token');
        setIsAuthOpen(false);
        if (page === 'profile') setPage('home');
        showToast('Signed Out Successfully', name ? `See you again soon, ${name}!` : 'You have been signed out of your account.', 'info');
    };

    const handleSelectCategory = (catName) => {
        setSelectedCategory(catName);
        setPage('shop');
    };

    // Sync page state with browser history & popstate events
    useEffect(() => {
        const handlePopState = () => {
            const route = parseRouteFromUrl();
            setPageState(route.page);
            if (route.param) {
                setActiveProductId(route.param);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Scroll to top on page change & update URL history with clean separate URLs
    const setPage = (newPage, param = null) => {
        setPageState(newPage);
        if (param !== null) {
            setActiveProductId(param);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        let targetUrl = '/';
        if (newPage === 'shop') targetUrl = '/products';
        else if (newPage === 'product') {
            const prodParam = param || activeProductId || 1;
            targetUrl = `/product/${prodParam}`;
        }
        else if (newPage === 'science') targetUrl = '/why-sprouted';
        else if (newPage === 'about') targetUrl = '/our-story';
        else if (newPage === 'profile') targetUrl = '/profile';
        else if (newPage === 'admin') targetUrl = '/admin';

        if (window.location.pathname !== targetUrl) {
            window.history.pushState({ page: newPage, param }, '', targetUrl);
        }
    };

    const handleProductView = (productIdOrSlug) => {
        setActiveProductId(productIdOrSlug);
        setPage('product', productIdOrSlug);
    };

    const handleAddToCart = (id, name, price, option = 'one-time', quantity = 1) => {
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(
                item => item.id === id && item.name === name
            );

            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prevCart, { id, name, price, option, quantity }];
            }
        });
    };

    const handleUpdateQuantity = (index, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveFromCart(index);
        } else {
            setCart(prevCart => {
                const newCart = [...prevCart];
                newCart[index].quantity = newQuantity;
                return newCart;
            });
        }
    };

    const handleRemoveFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, idx) => idx !== index));
    };

        const handleCheckoutSuccess = (orderData) => {
        setCart([]);
        setIsCartOpen(false);
    };

    const handleCheckout = () => {
        if (!user) {
            setIsCartOpen(false);
            setIsAuthOpen(true);
            if (showToast) showToast('Sign In Required 🔐', 'Please sign in or create an account to proceed to checkout.', 'info');
            return;
        }
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
            <Toast toast={toast} onClose={() => setToast(null)} />
            <OrganicBackgroundOverlay />
            <Header
                page={page}
                setPage={setPage}
                products={products}
                cartCount={totalCartCount}
                onCartOpen={() => setIsCartOpen(true)}
                onProductView={handleProductView}
                user={user}
                onAuthOpen={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
            />

            {/* Page Router */}
            {page === 'home' && (
                <Home
                    products={products}
                    loadingProducts={loadingProducts}
                    setPage={setPage}
                    onProductView={handleProductView}
                    onAddToCart={handleAddToCart}
                    onSelectCategory={handleSelectCategory}
                />
            )}

            {page === 'shop' && (
                <Shop
                    products={products}
                    loadingProducts={loadingProducts}
                    onProductView={handleProductView}
                    onAddToCart={handleAddToCart}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            )}

            {page === 'product' && (
                <ProductDetail
                    productId={activeProductId}
                    products={products}
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

            {page === 'profile' && (
                <UserProfile
                    user={user}
                    onLogout={handleLogout}
                    onUpdateUser={(updatedUserData) => {
                        setUser(updatedUserData);
                        localStorage.setItem('mangalam_user', JSON.stringify(updatedUserData));
                    }}
                    showToast={showToast}
                    setPage={setPage}
                />
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                products={products}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onCheckout={handleCheckout}
                onCheckoutSuccess={handleCheckoutSuccess}
                showToast={showToast}
                user={user}
                onAuthOpen={() => {
                    setIsCartOpen(false);
                    setIsAuthOpen(true);
                }}
                setPage={setPage}
            />

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                user={user}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
            />

            <Footer setPage={setPage} />
        </>
    );
}

