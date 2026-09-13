import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import OrganicBackgroundOverlay from './components/OrganicBackgroundOverlay';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Toast from './components/Toast';
import { 
    fetchProductsApi,
    fetchCartApi,
    addToCartApi,
    updateCartQuantityApi,
    removeFromCartApi,
    clearCartApi,
    fetchFavoritesApi,
    toggleFavoriteApi,
    subscribeToCacheInvalidation
} from './services/api';

const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Science = lazy(() => import('./pages/Science'));
const About = lazy(() => import('./pages/About'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminRoot = lazy(() => import('./admin/AdminRoot'));
const Cart = lazy(() => import('./pages/Cart'));

const PageLoader = () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(27, 59, 43, 0.1)', borderTopColor: '#1b3b2b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
);

const parseRouteFromUrl = () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    // Direct admin routes: /admin, /admin/dashboard, /admin/users, /admin/products, /admin/categories, /admin/orders, /admin/queries, /admin/banners, /admin/branding, /admin/settings, /admin/whatsapp
    if (pathname.startsWith('/admin')) {
        const sub = pathname.replace(/^\/admin\/?/, '').split('/')[0].trim().toLowerCase();
        const validAdminTabs = ['dashboard', 'categories', 'products', 'orders', 'users', 'queries', 'banners', 'marquee', 'settings', 'branding', 'whatsapp'];
        let adminTab = validAdminTabs.includes(sub) ? sub : 'dashboard';
        if (adminTab === 'branding') adminTab = 'settings';
        if (adminTab === 'banner' || adminTab === 'hero-banners') adminTab = 'banners';
        if (adminTab === 'inquiries' || adminTab === 'contact') adminTab = 'queries';
        return { page: 'admin', param: adminTab };
    }

    // Direct shortcut paths for admin pages: /dashboard, /users, /orders, /products, /categories, /queries, /banners, /marquee, /branding, /settings, /whatsapp
    const directAdminMap = {
        '/dashboard': 'dashboard',
        '/users': 'users',
        '/orders': 'orders',
        '/products': 'products',
        '/categories': 'categories',
        '/queries': 'queries',
        '/inquiries': 'queries',
        '/banners': 'banners',
        '/hero-banners': 'banners',
        '/marquee': 'marquee',
        '/branding': 'settings',
        '/settings': 'settings',
        '/whatsapp': 'whatsapp'
    };
    if (directAdminMap[pathname]) {
        return { page: 'admin', param: directAdminMap[pathname] };
    }

    if (pathname.startsWith('/product-details/')) {
        const param = pathname.replace('/product-details/', '').trim();
        return { page: 'product', param: param || null };
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
    if (pathname === '/cart' || pathname === '/checkout') {
        return { page: 'cart', param: null };
    }
    if (pathname === '/profile' || pathname.startsWith('/profile/')) {
        const sub = pathname.replace(/^\/profile\/?/, '').split('/')[0].trim().toLowerCase();
        const validProfileTabs = ['info', 'orders', 'address', 'addresses'];
        let profileTab = validProfileTabs.includes(sub) ? sub : 'info';
        if (profileTab === 'addresses') profileTab = 'address';
        return { page: 'profile', param: profileTab };
    }
    return { page: 'home', param: null };
};

export default function App() {
    const initialRoute = parseRouteFromUrl();
    const [page, setPageState] = useState(initialRoute.page);
    const [adminSubTab, setAdminSubTab] = useState(initialRoute.page === 'admin' ? initialRoute.param : 'dashboard');
    const [profileSubTab, setProfileSubTab] = useState(initialRoute.page === 'profile' ? (initialRoute.param || 'info') : 'info');
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [activeProductId, setActiveProductId] = useState(initialRoute.page === 'product' ? initialRoute.param : null);
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

    // Only load storefront products, cart, and favorites once on initial mount
    useEffect(() => {
        if (page !== 'admin') {
            loadProducts();
            loadCart();
            loadFavorites();
        }
    }, []); // Run once on startup instead of every page switch

    // Subscribe to product cache invalidation across all tabs & admin operations
    useEffect(() => {
        const unsubscribe = subscribeToCacheInvalidation('products', () => {
            loadProducts(true);
        });
        return () => unsubscribe();
    }, []);

    const loadProducts = async (forceRefresh = false) => {
        setLoadingProducts(true);
        const res = await fetchProductsApi(forceRefresh);
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
                const formatted = res.data.items.map(item => {
                    const baseName = item.product ? item.product.name : 'Product';
                    const sizeLabel = item.size_label || (item.package_size ? `${item.package_size.size_number}${item.package_size.size_unit || 'g'}` : '');
                    const cleanBase = baseName.replace(/\s*\(\d+[a-zA-Z]+[^\)]*\)/i, '').trim();
                    const fullName = sizeLabel ? `${cleanBase} (${sizeLabel})` : cleanBase;
                    return {
                        id: Number(item.product_id),
                        cart_item_id: item.id,
                        name: fullName,
                        base_name: cleanBase,
                        price: Number(item.unit_price || 0),
                        regularPrice: Number(item.regular_price || 0),
                        quantity: Number(item.quantity || 1),
                        option: 'one-time',
                        size: sizeLabel,
                        package_size_id: item.package_size_id ? Number(item.package_size_id) : null,
                        image: item.product?.image || (Array.isArray(item.product?.images) ? item.product.images[0] : null)
                    };
                });
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
            if (route.page === 'admin') {
                setAdminSubTab(route.param || 'dashboard');
            } else if (route.page === 'profile') {
                setProfileSubTab(route.param || 'info');
            } else if (route.param) {
                setActiveProductId(route.param);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Scroll to top on page change & update URL history with clean separate URLs
    const setPage = (newPage, param = null) => {
        setPageState(newPage);
        if (newPage === 'admin') {
            const tab = param || adminSubTab || 'dashboard';
            setAdminSubTab(tab);
        } else if (newPage === 'profile') {
            const tab = param || profileSubTab || 'info';
            setProfileSubTab(tab);
        } else if (param !== null) {
            setActiveProductId(param);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        let targetUrl = '/';
        if (newPage === 'shop') targetUrl = '/products';
        else if (newPage === 'cart' || newPage === 'checkout') targetUrl = '/cart';
        else if (newPage === 'product') {
            const prodParam = param || activeProductId || 1;
            targetUrl = `/product-details/${prodParam}`;
        }
        else if (newPage === 'science') targetUrl = '/why-sprouted';
        else if (newPage === 'about') targetUrl = '/our-story';
        else if (newPage === 'profile') {
            const tab = param || profileSubTab || 'info';
            targetUrl = tab === 'info' ? '/profile' : `/profile/${tab}`;
        }
        else if (newPage === 'admin') {
            const tab = param || adminSubTab || 'dashboard';
            targetUrl = tab === 'dashboard' ? '/admin/dashboard' : `/admin/${tab}`;
        }

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

        const cleanBaseName = String(name || '').replace(/\s*\(\d+[a-zA-Z]+[^\)]*\)/i, '').trim();

        // Optimistic UI update
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => {
                if (packageSizeId && item.package_size_id) {
                    return String(item.package_size_id) === String(packageSizeId);
                }
                if (item.name === name) return true;
                if (String(item.id) === String(resolvedProductId || id)) {
                    if (!item.package_size_id && !packageSizeId) return true;
                }
                return false;
            });

            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + numQty
                };
                return newCart;
            } else {
                return [...prevCart, {
                    id: resolvedProductId || id,
                    name: name,
                    base_name: cleanBaseName,
                    price: numericPrice,
                    option,
                    quantity: numQty,
                    package_size_id: packageSizeId ? Number(packageSizeId) : null
                }];
            }
        });

        // Feedback toast
        const foundProd = products.find(p => p.id === resolvedProductId || p.name === name);
        const prodImg = foundProd?.image || (Array.isArray(foundProd?.images) ? foundProd?.images[0] : null);
        showToast('Item has been added to your cart', '', 'success', prodImg);

        // Persist to backend database
        try {
            if (resolvedProductId) {
                await addToCartApi(resolvedProductId, numQty, packageSizeId);
                // Background sync
                const res = await fetchCartApi();
                if (res.success && res.data && Array.isArray(res.data.items)) {
                    const formatted = res.data.items.map(item => {
                        const bName = item.product ? item.product.name : 'Product';
                        const sLabel = item.size_label || (item.package_size ? `${item.package_size.size_number}${item.package_size.size_unit || 'g'}` : '');
                        const cBase = bName.replace(/\s*\(\d+[a-zA-Z]+[^\)]*\)/i, '').trim();
                        const fName = sLabel ? `${cBase} (${sLabel})` : cBase;
                        return {
                            id: Number(item.product_id),
                            cart_item_id: item.id,
                            name: fName,
                            base_name: cBase,
                            price: Number(item.unit_price || 0),
                            regularPrice: Number(item.regular_price || 0),
                            quantity: Number(item.quantity || 1),
                            option: 'one-time',
                            size: sLabel,
                            package_size_id: item.package_size_id ? Number(item.package_size_id) : null,
                            image: item.product?.image || (Array.isArray(item.product?.images) ? item.product.images[0] : null)
                        };
                    });
                    setCart(formatted);
                }
            }
        } catch (err) {
            console.warn('Backend cart sync error:', err);
        }
    };

    const handleUpdateQuantity = async (identifier, newQuantity, packageSizeId = null) => {
        const numQty = typeof newQuantity === 'number' ? newQuantity : (parseInt(newQuantity, 10) || 0);

        setCart(prevCart => {
            let itemIndex = -1;

            if (typeof identifier === 'object' && identifier !== null && identifier.index !== undefined) {
                itemIndex = identifier.index;
            } else {
                // 1. Match by cart_item_id
                itemIndex = prevCart.findIndex(i => 
                    i.cart_item_id && (String(i.cart_item_id) === String(identifier))
                );

                // 2. Match by package_size_id
                if (itemIndex === -1 && packageSizeId) {
                    itemIndex = prevCart.findIndex(i => 
                        i.package_size_id && String(i.package_size_id) === String(packageSizeId)
                    );
                }

                // 3. Match by product ID
                if (itemIndex === -1) {
                    itemIndex = prevCart.findIndex(i => {
                        if (String(i.id) !== String(identifier)) return false;
                        if (packageSizeId && i.package_size_id) {
                            return String(i.package_size_id) === String(packageSizeId);
                        }
                        return true;
                    });
                }

                // 4. Index fallback
                if (itemIndex === -1 && typeof identifier === 'number' && identifier >= 0 && identifier < prevCart.length) {
                    itemIndex = identifier;
                }
            }

            if (itemIndex === -1) {
                return prevCart;
            }

            const currentItem = prevCart[itemIndex];
            const targetBackendId = currentItem.cart_item_id || currentItem.id;
            const targetPkgId = packageSizeId || currentItem.package_size_id;

            if (numQty <= 0) {
                if (targetBackendId) {
                    removeFromCartApi(targetBackendId).catch(err => console.warn('Remove cart error:', err));
                }
                return prevCart.filter((_, idx) => idx !== itemIndex);
            } else {
                if (targetBackendId) {
                    updateCartQuantityApi(targetBackendId, numQty, targetPkgId).catch(err => console.warn('Update cart error:', err));
                }
                const updatedCart = [...prevCart];
                updatedCart[itemIndex] = {
                    ...updatedCart[itemIndex],
                    quantity: numQty
                };
                return updatedCart;
            }
        });
    };

    const handleRemoveFromCart = async (identifier, packageSizeId = null) => {
        setCart(prevCart => {
            let itemIndex = -1;
            if (typeof identifier === 'object' && identifier !== null && identifier.index !== undefined) {
                itemIndex = identifier.index;
            } else {
                itemIndex = prevCart.findIndex(i => 
                    i.cart_item_id && (String(i.cart_item_id) === String(identifier))
                );
                if (itemIndex === -1 && packageSizeId) {
                    itemIndex = prevCart.findIndex(i => 
                        i.package_size_id && String(i.package_size_id) === String(packageSizeId)
                    );
                }
                if (itemIndex === -1) {
                    itemIndex = prevCart.findIndex(i => String(i.id) === String(identifier));
                }
                if (itemIndex === -1 && typeof identifier === 'number' && identifier >= 0 && identifier < prevCart.length) {
                    itemIndex = identifier;
                }
            }

            if (itemIndex === -1) return prevCart;
            const currentItem = prevCart[itemIndex];
            const targetBackendId = currentItem.cart_item_id || currentItem.id;
            if (targetBackendId) {
                removeFromCartApi(targetBackendId).catch(err => console.warn('Remove cart error:', err));
            }
            return prevCart.filter((_, idx) => idx !== itemIndex);
        });
    };

    const handleCheckoutSuccess = async (orderData) => {
        setCart([]);
        setIsCartOpen(false);
        try {
            await clearCartApi();
        } catch (err) {}
    };

    const handleClearCart = async () => {
        setCart([]);
        try {
            await clearCartApi();
        } catch (err) {
            console.warn('Clear cart error:', err);
        }
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
            <Suspense fallback={<PageLoader />}>
                <AdminRoot
                    initialTab={adminSubTab}
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
                onCartOpen={() => setPage('cart')}
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
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveFromCart={handleRemoveFromCart}
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
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveFromCart={handleRemoveFromCart}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    favoriteProductIds={favoriteProductIds}
                    onToggleFavorite={handleToggleFavorite}
                />
            )}

            {page === 'product' && (
                <Suspense fallback={<PageLoader />}>
                    <ProductDetail
                        productId={activeProductId}
                        products={products}
                        onAddToCart={handleAddToCart}
                        onCartOpen={() => setPage('cart')}
                        cart={cart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveFromCart={handleRemoveFromCart}
                        onBack={() => setPage('shop')}
                        setPage={setPage}
                        isFavorite={Array.isArray(favoriteProductIds) && favoriteProductIds.includes(Number(activeProductId))}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </Suspense>
            )}

            {page === 'cart' && (
                <Suspense fallback={<PageLoader />}>
                    <Cart
                        cart={cart}
                        products={products}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveFromCart={handleRemoveFromCart}
                        onClearCart={handleClearCart}
                        user={user}
                        setPage={setPage}
                        showToast={showToast}
                        onAuthOpen={() => setIsAuthOpen(true)}
                    />
                </Suspense>
            )}

            {page === 'science' && (
                <Suspense fallback={<PageLoader />}>
                    <Science setPage={setPage} />
                </Suspense>
            )}

            {page === 'about' && (
                <Suspense fallback={<PageLoader />}>
                    <About setPage={setPage} />
                </Suspense>
            )}

            {page === 'profile' && (
                <Suspense fallback={<PageLoader />}>
                    <UserProfile
                        user={user}
                        initialTab={profileSubTab}
                        cartCount={cart.length}
                        onLogout={handleLogout}
                        onUpdateUser={(updatedUserData) => {
                            setUser(updatedUserData);
                            localStorage.setItem('mangalam_user', JSON.stringify(updatedUserData));
                        }}
                        showToast={showToast}
                        setPage={setPage}
                    />
                </Suspense>
            )}

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

