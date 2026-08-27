import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import OrganicBackgroundOverlay from './components/OrganicBackgroundOverlay';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Toast from './components/Toast';

const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Science = lazy(() => import('./pages/Science'));
const About = lazy(() => import('./pages/About'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminRoot = lazy(() => import('./admin/AdminRoot'));
import { 
    fetchProductsApi,
    fetchCartApi,
    addToCartApi,
    updateCartQuantityApi,
    removeFromCartApi,
    clearCartApi,
    fetchFavoritesApi,
    toggleFavoriteApi
} from './services/api';

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
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('mangalam_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [favoriteProductIds, setFavoriteProductIds] = useState([]);
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
        try {
            localStorage.setItem('mangalam_cart', JSON.stringify(cart));
        } catch (e) {}
    }, [cart]);

    useEffect(() => {
        loadProducts();
        loadCart();
        loadFavorites();
    }, []);

    const loadProducts = async () => {
        setLoadingProducts(true);
        const res = await fetchProductsApi();
        if (res.success && res.data) {
            setProducts(res.data);
        }
        setLoadingProducts(false);
    };

    const loadCart = async () => {
        try {
            const res = await fetchCartApi();
            if (res.success && res.data && Array.isArray(res.data.items)) {
                // Map backend cart response items to frontend structure
                const formatted = res.data.items.map(item => ({
                    id: item.product_id,
                    cart_item_id: item.id,
                    name: item.product ? item.product.name : 'Health Mix',
                    price: item.unit_price,
                    regularPrice: item.regular_price,
                    quantity: item.quantity,
                    option: 'one-time',
                    size: item.size_label,
                    package_size_id: item.package_size_id,
                    image: item.product?.image
                }));
                setCart(formatted);
            }
        } catch (err) {
            console.error('Failed to load cart:', err);
        }
    };

    const loadFavorites = async () => {
        try {
            const res = await fetchFavoritesApi();
            if (res.success && Array.isArray(res.favorites)) {
                const ids = res.favorites.map(f => Number(f.product_id));
                setFavoriteProductIds(ids);
            }
        } catch (err) {
            console.error('Failed to load favorites:', err);
        }
    };

    const showToast = (titleOrMessage, message = '', type = 'success', image = null) => {
        let finalTitle = '';
        let finalMessage = '';
        if (typeof titleOrMessage === 'string' && !message) {
            finalMessage = titleOrMessage;
        } else {
            finalTitle = titleOrMessage;
            finalMessage = message;
        }
        setToast({ id: Date.now(), title: finalTitle, message: finalMessage, type, image });
    };

    const handleLoginSuccess = async (userData, token, isRegistering = false) => {
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

        // Re-sync cart and favorites post-login to reflect merged items
        await loadCart();
        await loadFavorites();
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
        // Reload guest cart and favorites
        loadCart();
        loadFavorites();
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

    const handleAddToCart = async (id, name, price, option = 'one-time', quantity = 1, packageSizeId = null) => {
        const numericPrice = typeof price === 'number' ? price : (parseFloat(price) || 0);
        const numQty = typeof quantity === 'number' ? quantity : (parseInt(quantity, 10) || 1);

        // Resolve clean numeric product ID
        let resolvedProductId = null;
        if (typeof id === 'number' && !isNaN(id)) {
            resolvedProductId = id;
        } else if (typeof id === 'string') {
            const matched = id.match(/^(\d+)/);
            if (matched) {
                resolvedProductId = parseInt(matched[1], 10);
            } else {
                const found = products.find(p => p.slug === id || p.name === name);
                if (found) resolvedProductId = Number(found.id);
                else if (products.length > 0) resolvedProductId = Number(products[0].id);
            }
        }

        if (!resolvedProductId && products.length > 0) {
            resolvedProductId = Number(products[0].id);
        }

        // Optimistic UI update (using clean product ID)
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(
                item => (String(item.id) === String(resolvedProductId) || String(item.id) === String(id)) && item.name === name
            );

            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += numQty;
                return newCart;
            } else {
                return [...prevCart, { id: resolvedProductId || id, name, price: numericPrice, option, quantity: numQty, package_size_id: packageSizeId }];
            }
        });

        // Show feedback toast with product image preview without opening the cart drawer
        const foundProd = products.find(p => p.id === resolvedProductId || p.name === name);
        const prodImg = foundProd?.image || (Array.isArray(foundProd?.images) ? foundProd?.images[0] : null);
        showToast('Item has been added to your cart', '', 'success', prodImg);

        // Persist to backend database (works seamlessly for both user & guest)
        try {
            if (resolvedProductId) {
                await addToCartApi(resolvedProductId, numQty, packageSizeId);
                loadCart();
            }
        } catch (err) {
            console.warn('Backend cart sync error:', err);
        }
    };

    const handleUpdateQuantity = async (indexOrId, newQuantity, packageSizeId = null) => {
        const itemToUpdate = cart[indexOrId] || cart.find(i => i.id === indexOrId || i.cart_item_id === indexOrId);

        if (newQuantity <= 0) {
            handleRemoveFromCart(indexOrId);
        } else {
            setCart(prevCart => {
                const newCart = [...prevCart];
                if (typeof indexOrId === 'number' && indexOrId < newCart.length) {
                    newCart[indexOrId].quantity = newQuantity;
                }
                return newCart;
            });

            if (itemToUpdate) {
                const targetId = itemToUpdate.cart_item_id || itemToUpdate.id;
                try {
                    await updateCartQuantityApi(targetId, newQuantity, packageSizeId || itemToUpdate.package_size_id);
                } catch (err) {
                    console.warn('Failed to update cart quantity on server:', err);
                }
            }
        }
    };

    const handleRemoveFromCart = async (indexOrId) => {
        const itemToRemove = typeof indexOrId === 'number' && indexOrId < cart.length
            ? cart[indexOrId]
            : cart.find(i => i.id === indexOrId || i.cart_item_id === indexOrId);

        setCart(prevCart => {
            if (typeof indexOrId === 'number' && indexOrId < prevCart.length) {
                return prevCart.filter((_, idx) => idx !== indexOrId);
            }
            return prevCart.filter(i => i.id !== indexOrId && i.cart_item_id !== indexOrId);
        });

        if (itemToRemove) {
            const targetId = itemToRemove.cart_item_id || itemToRemove.id;
            try {
                await removeFromCartApi(targetId);
            } catch (err) {
                console.warn('Failed to remove item from server cart:', err);
            }
        }
    };

    const handleCheckoutSuccess = async (orderData) => {
        setCart([]);
        setIsCartOpen(false);
        try {
            await clearCartApi();
        } catch (err) {}
    };

    const handleCheckout = () => {
        if (!user) {
            setIsCartOpen(false);
            setIsAuthOpen(true);
            if (showToast) showToast('Please sign in or create an account to proceed to checkout.', '', 'info');
            return;
        }
    };

    const handleToggleFavorite = async (productId) => {
        const numId = Number(productId);
        const isCurrentlyFav = favoriteProductIds.includes(numId);
        const targetProd = products.find(p => p.id === numId);
        const prodImg = targetProd?.image || (Array.isArray(targetProd?.images) ? targetProd?.images[0] : null);

        // Optimistic UI update with exact Two Brothers toast wording
        if (isCurrentlyFav) {
            setFavoriteProductIds(prev => prev.filter(id => id !== numId));
            showToast('Item has been successfully removed from your wishlist', '', 'info', prodImg);
        } else {
            setFavoriteProductIds(prev => [...prev, numId]);
            if (user) {
                showToast('Item has been added to your wishlist', '', 'success', prodImg);
            } else {
                showToast('Item has been temporarily added to wishlist, please login to save it permanently', '', 'info', prodImg);
            }
        }

        // Persist to backend database
        try {
            const res = await toggleFavoriteApi(numId);
            if (res.success && res.data) {
                // Confirm server state
                if (res.data.is_favorite && !favoriteProductIds.includes(numId)) {
                    setFavoriteProductIds(prev => [...prev, numId]);
                } else if (!res.data.is_favorite && favoriteProductIds.includes(numId)) {
                    setFavoriteProductIds(prev => prev.filter(id => id !== numId));
                }
            }
        } catch (err) {
            console.warn('Failed to toggle favorite on server:', err);
        }
    };

    const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Dedicated standalone view for Admin Panel
    if (page === 'admin') {
        return (
            <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: '#10B981' }}>Loading Admin Console...</div>}>
                <AdminRoot
                    onGoToStore={() => setPage('home')}
                />
            </Suspense>
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
                favoriteCount={favoriteProductIds.length}
                onFavoritesOpen={() => setPage('shop')}
                onCartOpen={() => setIsCartOpen(true)}
                onProductView={handleProductView}
                user={user}
                onAuthOpen={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
            />

            {/* Page Router with Code-Split Suspense Fallback */}
            <Suspense fallback={<div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-green)' }}>Loading...</div>}>
                {page === 'home' && (
                    <Home
                        products={products}
                        loadingProducts={loadingProducts}
                        setPage={setPage}
                        onProductView={handleProductView}
                        onAddToCart={handleAddToCart}
                        onSelectCategory={handleSelectCategory}
                        favoriteProductIds={favoriteProductIds}
                        onToggleFavorite={handleToggleFavorite}
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
                        favoriteProductIds={favoriteProductIds}
                        onToggleFavorite={handleToggleFavorite}
                    />
                )}

                {page === 'product' && (
                    <ProductDetail
                        productId={activeProductId}
                        products={products}
                        onAddToCart={handleAddToCart}
                        onBack={() => setPage('shop')}
                        isFavorite={Array.isArray(favoriteProductIds) && favoriteProductIds.includes(Number(activeProductId))}
                        onToggleFavorite={handleToggleFavorite}
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
            </Suspense>

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

