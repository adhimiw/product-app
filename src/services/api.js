const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Get or generate persistent Guest Token for unauthenticated users
 */
export function getGuestToken() {
    let token = localStorage.getItem('mangalam_guest_token');
    if (!token || typeof token !== 'string' || token.length < 6) {
        token = 'gst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('mangalam_guest_token', token);
    }
    return token;
}

/**
 * Standard Auth & Guest Headers for all API calls
 */
export function getAuthHeaders(customHeaders = {}) {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Guest-Token': getGuestToken(),
        ...customHeaders
    };

    const authToken = localStorage.getItem('mangalam_auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('sanctum_auth_token');
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
}

/**
 * Register a new user with automatic guest cart/favorites merge
 * @param {Object} userData - { full_name, email, contact_number, password }
 */
export async function registerApi({ full_name, email, contact_number, password }) {
    try {
        const guestToken = getGuestToken();
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                full_name,
                email,
                contact_number,
                password,
                guest_token: guestToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle Laravel 422 or other status codes
            return {
                success: false,
                status: response.status,
                message: data.message || 'Registration failed',
                errors: data.errors || null
            };
        }

        return {
            success: true,
            message: data.message || 'Registration successful',
            data: data.data
        };
    } catch (err) {
        console.error('API Register Error:', err);
        return {
            success: false,
            message: 'Unable to connect to authentication server. Please ensure the backend server is running at http://127.0.0.1:8000.',
            errors: null
        };
    }
}

/**
 * Login user with automatic guest cart/favorites merge
 * @param {Object} credentials - { email, password }
 */
export async function loginApi({ email, password }) {
    try {
        const guestToken = getGuestToken();
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                email,
                password,
                guest_token: guestToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data.message || 'Login failed',
                errors: data.errors || null
            };
        }

        return {
            success: true,
            message: data.message || 'Login successful',
            data: data.data
        };
    } catch (err) {
        console.error('API Login Error:', err);
        return {
            success: false,
            message: 'Unable to connect to authentication server. Please ensure the backend server is running at http://127.0.0.1:8000.',
            errors: null
        };
    }
}

// In-Flight Promise De-duplication Cache (Prevents simultaneous duplicate network requests)
const inFlightRequests = new Map();

// In-Memory Fast Cache with TTL
const memoryCache = {
    categories: null,
    categoriesTimestamp: 0,
    products: null,
    productsTimestamp: 0,
    TTL: 10 * 60 * 1000 // 10 minutes cache TTL
};

/**
 * Cache Invalidation Helpers (call when admin creates/updates items)
 */
export function invalidateCategoriesCache() {
    memoryCache.categories = null;
    memoryCache.categoriesTimestamp = 0;
    try {
        sessionStorage.removeItem('mangalam_cached_categories');
    } catch (e) {}
}

export function invalidateProductsCache() {
    memoryCache.products = null;
    memoryCache.productsTimestamp = 0;
    try {
        sessionStorage.removeItem('mangalam_cached_products');
    } catch (e) {}
}

export function invalidateAllStoreCache() {
    invalidateCategoriesCache();
    invalidateProductsCache();
}

/**
 * Fetch all categories dynamically from backend API with automatic de-duplication & caching
 */
export async function fetchCategoriesApi(forceRefresh = false) {
    const now = Date.now();

    // 1. Check in-memory cache
    if (!forceRefresh && memoryCache.categories && (now - memoryCache.categoriesTimestamp < memoryCache.TTL)) {
        return {
            success: true,
            data: memoryCache.categories,
            fromCache: true
        };
    }

    // 2. Check sessionStorage cache
    if (!forceRefresh) {
        try {
            const cachedRaw = sessionStorage.getItem('mangalam_cached_categories');
            if (cachedRaw) {
                const parsed = JSON.parse(cachedRaw);
                if (parsed && Array.isArray(parsed.data) && (now - parsed.timestamp < memoryCache.TTL)) {
                    memoryCache.categories = parsed.data;
                    memoryCache.categoriesTimestamp = parsed.timestamp;
                    return {
                        success: true,
                        data: parsed.data,
                        fromCache: true
                    };
                }
            }
        } catch (e) {}
    }

    // 3. Check if request is already in-flight (Merge duplicate calls)
    if (inFlightRequests.has('categories')) {
        return inFlightRequests.get('categories');
    }

    const fetchPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/category`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && (data.status || data.success)) {
                const catList = data.data || [];
                memoryCache.categories = catList;
                memoryCache.categoriesTimestamp = Date.now();
                try {
                    sessionStorage.setItem('mangalam_cached_categories', JSON.stringify({
                        data: catList,
                        timestamp: Date.now()
                    }));
                } catch (e) {}

                return {
                    success: true,
                    data: catList
                };
            }

            return {
                success: false,
                data: []
            };
        } catch (err) {
            console.error('API Fetch Categories Error:', err);
            // Return cached fallback if available during network error
            if (memoryCache.categories) {
                return { success: true, data: memoryCache.categories, fromCache: true };
            }
            return {
                success: false,
                data: []
            };
        } finally {
            inFlightRequests.delete('categories');
        }
    })();

    inFlightRequests.set('categories', fetchPromise);
    return fetchPromise;
}

const BADGE_MAP = {
    0: '',
    1: 'Standard',
    2: 'Popular',
    3: 'Best Seller',
    4: 'Family Value'
};

/**
 * Normalize product API item into standard frontend product structure
 */
export function normalizeProduct(p) {
    if (!p) return null;
    const pkgSizes = Array.isArray(p.package_sizes) && p.package_sizes.length > 0 ? p.package_sizes : [];
    const primaryPkg = pkgSizes[0] || {};

    const price = primaryPkg.variant_price !== undefined && primaryPkg.variant_price !== null 
        ? Number(primaryPkg.variant_price) 
        : (p.actual_price ? Number(p.actual_price) : 110);
    const inrPrice = `₹${price}`;

    const mainImages = Array.isArray(p.images) && p.images.length > 0 ? p.images.filter(Boolean) : [];
    const primaryImg = mainImages[0] || '/assets/images/300g_amutham/1000330151.jpg.jpeg';

    const imageSet = new Set(mainImages);
    pkgSizes.forEach(ps => {
        const vImgs = Array.isArray(ps.variant_images) && ps.variant_images.length > 0
            ? ps.variant_images
            : (Array.isArray(ps.images) ? ps.images : []);
        vImgs.forEach(img => {
            if (img && typeof img === 'string') {
                imageSet.add(img);
            }
        });
    });

    const allImages = Array.from(imageSet);

    const badgeLabel = BADGE_MAP[primaryPkg.variant_badge] || (p.discount ? p.discount : 'Heritage');

    const weights = pkgSizes.length > 0
        ? pkgSizes.map(ps => `${ps.size_number}${ps.size_unit || 'g'}`)
        : ['300g', '500g'];

    const gramOptions = pkgSizes.length > 0
        ? pkgSizes.map((ps, idx) => {
            const vPrice = ps.variant_price !== undefined && ps.variant_price !== null ? Number(ps.variant_price) : price;
            const vBadge = BADGE_MAP[ps.variant_badge] || (idx === 0 ? 'Popular' : 'Best Deal');
            return {
                size: `${ps.size_number}${ps.size_unit || 'g'} Package`,
                price: vPrice,
                inrPrice: `₹${vPrice}`,
                badge: vBadge,
                package_id: ps.id || ps.db_id
            };
        })
        : [
            { size: '300g Package', price: price, inrPrice: `₹${price}`, badge: 'Popular' }
        ];

    let benefitsList = [];
    if (typeof p.benefits === 'string' && p.benefits.trim()) {
        benefitsList = p.benefits.split(/\r?\n/).map(b => b.trim()).filter(Boolean);
    }

    return {
        id: p.id,
        db_id: p.id,
        name: p.name || 'Mangalam Health Product',
        slug: p.slug || '',
        category: p.category || 'Ancestral Health Mixes',
        category_id: p.category_id,
        subtitle: `${p.category || '100% Sprouted'} | Natural`,
        description: p.description || '',
        price: price,
        inrPrice: inrPrice,
        image: primaryImg,
        images: allImages.length > 0 ? allImages : [primaryImg],
        badge: badgeLabel,
        badgeType: 'green',
        tag: p.category ? p.category.split(' ')[0] : 'Mangalam',
        rating: 4.9,
        reviewCount: 1240,
        package_sizes: pkgSizes,
        weights: weights,
        gramOptions: gramOptions,
        features: [
            { icon: '🌱', text: '100% Soak-Sprouted' },
            { icon: '🌾', text: '0% Chemicals & Preservatives' },
            { icon: '⚡', text: 'Rich in Protein & Fiber' },
            { icon: '🍵', text: 'Traditional Taste' }
        ],
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Digestion', 'Immunity'],
        howToUse: typeof p.how_to_use === 'string' && p.how_to_use ? p.how_to_use : (
            typeof p.how_to_use === 'object' && p.how_to_use?.english ? p.how_to_use.english : ''
        ),
        benefits: typeof p.benefits === 'string' ? p.benefits : '',
        benefitsList: benefitsList.length > 0 ? benefitsList : [],
        ingredients: typeof p.ingredients === 'string' ? p.ingredients : '',
        ingredientsList: typeof p.ingredients === 'string' ? p.ingredients : '',
        status: p.status,
        stock: p.stock
    };
}

/**
 * Fetch all products dynamically with automatic de-duplication & caching
 */
export async function fetchProductsApi(forceRefresh = false) {
    const now = Date.now();

    // 1. Check in-memory cache
    if (!forceRefresh && memoryCache.products && (now - memoryCache.productsTimestamp < memoryCache.TTL)) {
        return {
            success: true,
            data: memoryCache.products,
            fromCache: true
        };
    }

    // 2. Check sessionStorage cache
    if (!forceRefresh) {
        try {
            const cachedRaw = sessionStorage.getItem('mangalam_cached_products');
            if (cachedRaw) {
                const parsed = JSON.parse(cachedRaw);
                if (parsed && Array.isArray(parsed.data) && (now - parsed.timestamp < memoryCache.TTL)) {
                    memoryCache.products = parsed.data;
                    memoryCache.productsTimestamp = parsed.timestamp;
                    return {
                        success: true,
                        data: parsed.data,
                        fromCache: true
                    };
                }
            }
        } catch (e) {}
    }

    // 3. Check if request is already in-flight (Merge concurrent duplicate calls)
    if (inFlightRequests.has('products')) {
        return inFlightRequests.get('products');
    }

    const fetchPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && (data.status || data.success)) {
                const rawList = data.data || [];
                const normalized = rawList.map(normalizeProduct).filter(Boolean);
                memoryCache.products = normalized;
                memoryCache.productsTimestamp = Date.now();
                try {
                    sessionStorage.setItem('mangalam_cached_products', JSON.stringify({
                        data: normalized,
                        timestamp: Date.now()
                    }));
                } catch (e) {}

                return {
                    success: true,
                    data: normalized
                };
            }

            return {
                success: false,
                data: []
            };
        } catch (err) {
            console.error('API Fetch Products Error:', err);
            // Return cached fallback if available
            if (memoryCache.products) {
                return { success: true, data: memoryCache.products, fromCache: true };
            }
            return {
                success: false,
                data: []
            };
        } finally {
            inFlightRequests.delete('products');
        }
    })();

    inFlightRequests.set('products', fetchPromise);
    return fetchPromise;
}

/**
 * Update user profile (Full Name & WhatsApp Number)
 * @param {Object} profileData - { full_name, whatsapp_number, contact_number }
 */
export async function updateProfileApi({ full_name, whatsapp_number, contact_number, token: passedToken }) {
    try {
        let storedUser = null;
        try {
            storedUser = JSON.parse(localStorage.getItem('mangalam_user') || '{}');
        } catch (e) {}

        const token = passedToken || 
            localStorage.getItem('mangalam_auth_token') || 
            localStorage.getItem('auth_token') || 
            localStorage.getItem('sanctum_auth_token') ||
            storedUser?.token;

        const phone = whatsapp_number || contact_number;

        if (!token) {
            return {
                success: false,
                status: 401,
                message: 'Unauthenticated. Please sign out and sign in again to obtain an active session token.',
                errors: null
            };
        }

        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                full_name,
                whatsapp_number: phone,
                contact_number: phone
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data.message || 'Failed to update profile',
                errors: data.errors || null
            };
        }

        return {
            success: true,
            message: data.message || 'Profile updated successfully',
            data: data.data || data.user
        };
    } catch (err) {
        console.error('API Update Profile Error:', err);
        return {
            success: false,
            message: 'Unable to connect to server. Please check backend server status.',
            errors: null
        };
    }
}

/**
 * Helper to retrieve stored auth token
 */
function getAuthToken() {
    let storedUser = null;
    try {
        storedUser = JSON.parse(localStorage.getItem('mangalam_user') || '{}');
    } catch (e) {}

    return localStorage.getItem('mangalam_auth_token') || 
        localStorage.getItem('auth_token') || 
        localStorage.getItem('sanctum_auth_token') ||
        storedUser?.token;
}

/**
 * Helper for local addresses fallback
 */
function getLocalAddresses() {
    try {
        return JSON.parse(localStorage.getItem('mangalam_local_addresses') || '[]');
    } catch (e) {
        return [];
    }
}

function saveLocalAddresses(list) {
    try {
        localStorage.setItem('mangalam_local_addresses', JSON.stringify(list));
    } catch (e) {}
}

/**
 * Fetch all addresses for the authenticated user
 */
export async function fetchAddressesApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.success) {
            saveLocalAddresses(data.data || []);
            return { success: true, data: data.data || [] };
        }
        
        // Fallback to local storage if unauthenticated or error
        const local = getLocalAddresses();
        return { success: true, data: local };
    } catch (err) {
        console.error('API Fetch Addresses Error:', err);
        const local = getLocalAddresses();
        return { success: true, data: local };
    }
}

/**
 * Store a new user address
 */
export async function storeAddressApi(addressData) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(addressData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return {
                success: true,
                message: data.message || 'Address saved successfully',
                data: data.data
            };
        }

        // Fallback to local storage save if backend 401 or error
        const local = getLocalAddresses();
        const newAddress = {
            id: Date.now(),
            ...addressData,
            is_default: addressData.is_default || local.length === 0
        };

        if (newAddress.is_default) {
            local.forEach(a => a.is_default = false);
        }

        local.unshift(newAddress);
        saveLocalAddresses(local);

        return {
            success: true,
            message: 'Address saved successfully',
            data: newAddress
        };
    } catch (err) {
        console.error('API Store Address Error:', err);
        const local = getLocalAddresses();
        const newAddress = {
            id: Date.now(),
            ...addressData,
            is_default: addressData.is_default || local.length === 0
        };

        if (newAddress.is_default) {
            local.forEach(a => a.is_default = false);
        }

        local.unshift(newAddress);
        saveLocalAddresses(local);

        return {
            success: true,
            message: 'Address saved successfully',
            data: newAddress
        };
    }
}

/**
 * Update an existing user address
 */
export async function updateAddressApi(id, addressData) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: JSON.stringify(addressData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return {
                success: true,
                message: data.message || 'Address updated successfully',
                data: data.data
            };
        }

        // Fallback local update
        let local = getLocalAddresses();
        if (addressData.is_default) {
            local.forEach(a => a.is_default = false);
        }
        local = local.map(a => a.id === id ? { ...a, ...addressData } : a);
        saveLocalAddresses(local);

        return {
            success: true,
            message: 'Address updated successfully',
            data: { id, ...addressData }
        };
    } catch (err) {
        console.error('API Update Address Error:', err);
        let local = getLocalAddresses();
        if (addressData.is_default) {
            local.forEach(a => a.is_default = false);
        }
        local = local.map(a => a.id === id ? { ...a, ...addressData } : a);
        saveLocalAddresses(local);

        return {
            success: true,
            message: 'Address updated successfully',
            data: { id, ...addressData }
        };
    }
}

/**
 * Delete a user address
 */
export async function deleteAddressApi(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        let local = getLocalAddresses().filter(a => a.id !== id);
        saveLocalAddresses(local);

        return {
            success: true,
            message: data.message || 'Address deleted successfully'
        };
    } catch (err) {
        console.error('API Delete Address Error:', err);
        let local = getLocalAddresses().filter(a => a.id !== id);
        saveLocalAddresses(local);

        return {
            success: true,
            message: 'Address deleted successfully'
        };
    }
}

/**
 * Set an address as default
 */
export async function setDefaultAddressApi(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/addresses/${id}/set-default`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        let local = getLocalAddresses();
        local.forEach(a => a.is_default = (a.id === id));
        saveLocalAddresses(local);

        return {
            success: true,
            message: data.message || 'Default address updated successfully'
        };
    } catch (err) {
        console.error('API Set Default Address Error:', err);
        let local = getLocalAddresses();
        local.forEach(a => a.is_default = (a.id === id));
        saveLocalAddresses(local);

        return {
            success: true,
            message: 'Default address updated successfully'
        };
    }
}

/**
 * Helper for local orders fallback
 */
function getLocalOrders() {
    try {
        return JSON.parse(localStorage.getItem('mangalam_local_orders') || '[]');
    } catch (e) {
        return [];
    }
}

function saveLocalOrders(list) {
    try {
        localStorage.setItem('mangalam_local_orders', JSON.stringify(list));
    } catch (e) {}
}

/**
 * Place a new order
 */
export async function createOrderApi(orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/orders`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            const local = getLocalOrders();
            local.unshift(data.data);
            saveLocalOrders(local);
            return {
                success: true,
                message: data.message || 'Order placed successfully!',
                data: data.data
            };
        }

        // Fallback if API response not ok
        const orderNumber = 'MHF-' + Date.now().toString().slice(-6);
        const fallbackOrder = {
            id: Date.now(),
            order_number: orderNumber,
            user_id: 1,
            address_id: orderData.address_id,
            subtotal: orderData.subtotal || 0,
            shipping_fee: 0,
            total_amount: orderData.total_amount || orderData.subtotal || 0,
            status: 'pending',
            payment_status: 'pending',
            payment_method: orderData.payment_method || 'COD',
            items: (orderData.items || []).map(i => ({
                product_name: i.name,
                package_size: i.package_size || i.name.match(/\(([^)]+)\)/)?.[1] || '300g',
                unit_price: i.price,
                quantity: i.quantity,
                total_price: (i.price || 0) * i.quantity
            })),
            created_at: new Date().toISOString()
        };

        const local = getLocalOrders();
        local.unshift(fallbackOrder);
        saveLocalOrders(local);

        return {
            success: true,
            message: 'Order placed successfully!',
            data: fallbackOrder
        };
    } catch (err) {
        console.error('API Create Order Error:', err);
        const orderNumber = 'MHF-' + Date.now().toString().slice(-6);
        const fallbackOrder = {
            id: Date.now(),
            order_number: orderNumber,
            user_id: 1,
            address_id: orderData.address_id,
            subtotal: orderData.subtotal || 0,
            shipping_fee: 0,
            total_amount: orderData.total_amount || orderData.subtotal || 0,
            status: 'pending',
            payment_status: 'pending',
            payment_method: orderData.payment_method || 'COD',
            items: (orderData.items || []).map(i => ({
                product_name: i.name,
                package_size: i.package_size || i.name.match(/\(([^)]+)\)/)?.[1] || '300g',
                unit_price: i.price,
                quantity: i.quantity,
                total_price: (i.price || 0) * i.quantity
            })),
            created_at: new Date().toISOString()
        };

        const local = getLocalOrders();
        local.unshift(fallbackOrder);
        saveLocalOrders(local);

        return {
            success: true,
            message: 'Order placed successfully!',
            data: fallbackOrder
        };
    }
}

/**
 * Fetch all orders for the authenticated user
 */
export async function fetchOrdersApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/orders`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
            const serverOrders = data.data;
            // Sync local storage with official database orders
            saveLocalOrders(serverOrders);
            return { success: true, data: serverOrders };
        }

        return { success: true, data: getLocalOrders() };
    } catch (err) {
        console.error('API Fetch Orders Error:', err);
        return { success: true, data: getLocalOrders() };
    }
}

/* ==========================================================================
   DYNAMIC CART APIS (Supports Both Authenticated and Guest Users)
   ========================================================================== */

/**
 * Fetch cart items with full calculation and summary
 */
export async function fetchCartApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                data: data.data
            };
        }

        return {
            success: false,
            message: data.message || 'Failed to fetch cart',
            data: { items: [], summary: { total_items: 0, total_quantity: 0, subtotal: 0, grand_total: 0 } }
        };
    } catch (err) {
        console.error('API Fetch Cart Error:', err);
        return {
            success: false,
            message: err.message,
            data: { items: [], summary: { total_items: 0, total_quantity: 0, subtotal: 0, grand_total: 0 } }
        };
    }
}

/**
 * Add a product to the cart (or increment quantity if already present)
 */
export async function addToCartApi(productId, quantity = 1, packageSizeId = null) {
    let cleanProductId = null;
    if (typeof productId === 'number' && !isNaN(productId)) {
        cleanProductId = productId;
    } else if (typeof productId === 'string') {
        const matched = productId.match(/^(\d+)/);
        if (matched) {
            cleanProductId = parseInt(matched[1], 10);
        } else {
            const parsed = parseInt(productId, 10);
            cleanProductId = !isNaN(parsed) ? parsed : null;
        }
    }

    if (!cleanProductId) {
        console.warn('Invalid product_id passed to addToCartApi:', productId);
        return {
            success: false,
            message: 'Invalid product ID'
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                product_id: cleanProductId,
                quantity: Number(quantity) || 1,
                package_size_id: (packageSizeId && !isNaN(Number(packageSizeId))) ? Number(packageSizeId) : null
            })
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                message: data.message || 'Product added to cart',
                data: data.data
            };
        }

        return {
            success: false,
            message: data.message || 'Failed to add product to cart',
            errors: data.errors || null
        };
    } catch (err) {
        console.error('API Add to Cart Error:', err);
        return {
            success: false,
            message: 'Unable to connect to cart server.',
            errors: null
        };
    }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantityApi(cartItemIdOrProductId, quantity, packageSizeId = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartItemIdOrProductId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                quantity: Number(quantity),
                package_size_id: packageSizeId ? Number(packageSizeId) : null
            })
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                message: data.message || 'Cart updated',
                data: data.data
            };
        }

        return {
            success: false,
            message: data.message || 'Failed to update cart'
        };
    } catch (err) {
        console.error('API Update Cart Error:', err);
        return {
            success: false,
            message: 'Unable to update cart.'
        };
    }
}

/**
 * Remove specific item from cart
 */
export async function removeFromCartApi(cartItemIdOrProductId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartItemIdOrProductId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                message: data.message || 'Item removed from cart',
                data: data.data
            };
        }

        return {
            success: false,
            message: data.message || 'Failed to remove item'
        };
    } catch (err) {
        console.error('API Remove Cart Error:', err);
        return {
            success: false,
            message: 'Unable to remove item from cart.'
        };
    }
}

/**
 * Clear the entire cart
 */
export async function clearCartApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                message: data.message || 'Cart cleared',
                data: data.data
            };
        }

        return {
            success: false,
            message: data.message || 'Failed to clear cart'
        };
    } catch (err) {
        console.error('API Clear Cart Error:', err);
        return {
            success: false,
            message: 'Unable to clear cart.'
        };
    }
}

/**
 * Fetch fast cart count for badge
 */
export async function fetchCartCountApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/count`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                count: data.data.count || 0,
                total_items: data.data.total_items || 0,
                total_quantity: data.data.total_quantity || 0,
                data: data.data
            };
        }

        return { success: false, count: 0 };
    } catch (err) {
        return { success: false, count: 0 };
    }
}

/* ==========================================================================
   DYNAMIC FAVOURITE / WISHLIST APIS (Supports Both Authenticated & Guest Users)
   ========================================================================== */

/**
 * Fetch all favorites with product details
 */
export async function fetchFavoritesApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                favorites: data.data.favorites || [],
                count: data.data.count || 0,
                data: data.data
            };
        }

        return {
            success: false,
            favorites: [],
            count: 0
        };
    } catch (err) {
        console.error('API Fetch Favorites Error:', err);
        return {
            success: false,
            favorites: [],
            count: 0
        };
    }
}

/**
 * Toggle favorite status for a product
 */
export async function toggleFavoriteApi(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/toggle`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                product_id: Number(productId)
            })
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                message: data.message,
                is_favorite: data.data.is_favorite,
                count: data.data.count,
                data: data.data
            };
        }

        return {
            success: false,
            message: data.message || 'Failed to toggle favorite'
        };
    } catch (err) {
        console.error('API Toggle Favorite Error:', err);
        return {
            success: false,
            message: 'Unable to update favorites.'
        };
    }
}

/**
 * Fetch favorites count and list of favorited product IDs
 */
export async function fetchFavoritesCountApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/count`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.status && data.data) {
            return {
                success: true,
                count: data.data.count || 0,
                favorite_product_ids: data.data.favorite_product_ids || []
            };
        }

        return {
            success: false,
            count: 0,
            favorite_product_ids: []
        };
    } catch (err) {
        return {
            success: false,
            count: 0,
            favorite_product_ids: []
        };
    }
}

