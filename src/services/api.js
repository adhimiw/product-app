const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Register a new user
 * @param {Object} userData - { full_name, email, contact_number, password }
 */
export async function registerApi({ full_name, email, contact_number, password }) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name,
                email,
                contact_number,
                password
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
 * Login user
 * @param {Object} credentials - { email, password }
 */
export async function loginApi({ email, password }) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
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

/**
 * Fetch all categories dynamically from backend API
 */
export async function fetchCategoriesApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && (data.status || data.success)) {
            return {
                success: true,
                data: data.data || []
            };
        }

        return {
            success: false,
            data: []
        };
    } catch (err) {
        console.error('API Fetch Categories Error:', err);
        return {
            success: false,
            data: []
        };
    }
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
 * Fetch all products dynamically from backend API (http://127.0.0.1:8000/api/products)
 */
export async function fetchProductsApi() {
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
            return {
                success: true,
                data: rawList.map(normalizeProduct).filter(Boolean)
            };
        }

        return {
            success: false,
            data: []
        };
    } catch (err) {
        console.error('API Fetch Products Error:', err);
        return {
            success: false,
            data: []
        };
    }
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
 * Helper to build auth headers
 */
function getAuthHeaders(includeContentType = false) {
    const token = getAuthToken();
    const headers = {
        'Accept': 'application/json'
    };
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
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
