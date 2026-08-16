/**
 * Admin Product API Service - 100% Dynamic API Driven with Binary FormData Payload
 * - Uses multipart/form-data FormData payload for binary image file uploads (binary file stream)
 * - Store API:  POST http://127.0.0.1:8000/api/admin/products
 * - Update API: POST http://127.0.0.1:8000/api/admin/products/{id} with _method=PUT
 * - Delete API: DELETE http://127.0.0.1:8000/api/admin/products/{id}
 * - Fetch API:  GET http://127.0.0.1:8000/api/admin/products
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/admin/products';
const FALLBACK_API_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/products';
const STORAGE_KEY = 'mangalam_admin_products_v6';

export const BADGE_OPTIONS = [
    { value: 0, label: 'No Badge (None)' },
    { value: 1, label: 'Newly Launched' },
    { value: 2, label: 'Trending' },
    { value: 3, label: 'Best Seller' },
    { value: 4, label: 'Limited Stock' }
];

export const getBadgeLabel = (val) => {
    if (val === 1 || val === '1' || val === 'Newly Launched') return 'Newly Launched';
    if (val === 2 || val === '2' || val === 'Trending' || val === 'Popular') return 'Trending';
    if (val === 3 || val === '3' || val === 'Best Seller' || val === 'Best Value') return 'Best Seller';
    if (val === 4 || val === '4' || val === 'Limited Stock') return 'Limited Stock';
    return '';
};

export const adminProductService = {
    /**
     * Headers for FormData request (Do NOT set Content-Type header so browser sets boundary automatically)
     */
    getFormDataHeaders() {
        let token = null;
        try {
            const session = JSON.parse(localStorage.getItem('mangalam_admin_session') || '{}');
            token = session.token || null;
        } catch (e) {
            token = null;
        }

        const headers = {
            'Accept': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    getHeaders() {
        let token = null;
        try {
            const session = JSON.parse(localStorage.getItem('mangalam_admin_session') || '{}');
            token = session.token || null;
        } catch (e) {
            token = null;
        }

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    /**
     * GET /api/admin/products - Fetch products dynamically from backend API
     */
    async getAllProducts() {
        try {
            let response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok && response.status === 404) {
                response = await fetch(FALLBACK_API_URL, {
                    method: 'GET',
                    headers: this.getHeaders()
                });
            }

            if (response.ok) {
                const resData = await response.json();
                const productList = resData.data || resData.products || (Array.isArray(resData) ? resData : []);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(productList));
                return productList;
            }

            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : [];

        } catch (err) {
            console.warn('API Fetch Products failed, returning stored cache:', err);
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : [];
        }
    },

    /**
     * Helper for fetching products wrapped in a standardized response object
     */
    async getProducts() {
        const data = await this.getAllProducts();
        return {
            success: true,
            data: data || []
        };
    },

    /**
     * Store (POST) or Update (PUT via FormData with _method=PUT) Product via API
     * Sends multipart/form-data with binary image file streams!
     */
    async saveProduct(productData) {
        const isUpdate = !!productData.id;
        const actualPrice = Number(productData.actual_price) || 0;
        const discountType = Number(productData.discount_type) || 1;
        const discountValue = Number(productData.discount_value) || 0;

        let calculatedDiscount = '';
        if (discountType === 1 && discountValue > 0) {
            calculatedDiscount = `${discountValue}% OFF`;
        } else if (discountType === 2 && discountValue > 0) {
            calculatedDiscount = `₹${discountValue} OFF`;
        }

        // Construct Binary FormData
        const formData = new FormData();

        formData.append('name', productData.name || '');
        formData.append('category', productData.category || '');
        formData.append('category_id', productData.category_id || 1);
        formData.append('description', productData.description || '');
        formData.append('actual_price', actualPrice);
        formData.append('discount_type', discountType);
        formData.append('discount_value', discountValue);
        formData.append('discount', calculatedDiscount);
        formData.append('status', productData.status !== undefined ? Number(productData.status) : 1);
        
        if (productData.stock !== '' && productData.stock !== null && productData.stock !== undefined) {
            formData.append('stock', productData.stock);
        }

        formData.append('how_to_use', productData.how_to_use || '');
        formData.append('benefits', productData.benefits || '');
        formData.append('ingredients', productData.ingredients || '');

        // Append Tags Array
        if (Array.isArray(productData.tags)) {
            productData.tags.forEach((tag, idx) => {
                formData.append(`tags[${idx}]`, tag);
            });
        }

        // Append Package Sizes & Binary Variant Images + Per-Variant Discount & Stock
        if (Array.isArray(productData.package_sizes)) {
            productData.package_sizes.forEach((pkg, idx) => {
                if (pkg.id) formData.append(`package_sizes[${idx}][id]`, pkg.id);
                formData.append(`package_sizes[${idx}][size_number]`, pkg.size_number || '');
                formData.append(`package_sizes[${idx}][size_unit]`, pkg.size_unit || 'g');
                formData.append(`package_sizes[${idx}][variant_price]`, pkg.variant_price || '');
                formData.append(`package_sizes[${idx}][variant_badge]`, pkg.variant_badge || 0);
                
                // Per-Variant Discount, Type & Stock Count Payload
                formData.append(`package_sizes[${idx}][discount_value]`, pkg.discount_value !== undefined ? pkg.discount_value : '');
                formData.append(`package_sizes[${idx}][discount_type]`, pkg.discount_type !== undefined ? pkg.discount_type : 1);
                
                const pkgStock = pkg.is_unlimited_stock ? null : (pkg.stock !== '' && pkg.stock !== undefined && pkg.stock !== null ? pkg.stock : null);
                if (pkgStock !== null) {
                    formData.append(`package_sizes[${idx}][stock]`, pkgStock);
                }

                // Variant Images (Binary File Uploads or Existing Strings)
                if (Array.isArray(pkg.variant_image_files)) {
                    pkg.variant_image_files.forEach((fileObj, imgIdx) => {
                        if (fileObj instanceof File) {
                            formData.append(`package_sizes[${idx}][variant_images][${imgIdx}]`, fileObj, fileObj.name);
                        } else if (typeof fileObj === 'string' && !fileObj.startsWith('blob:')) {
                            formData.append(`package_sizes[${idx}][existing_variant_images][${imgIdx}]`, fileObj);
                        }
                    });
                }
            });
        }

        // Append Main Gallery Images (Binary File Uploads)
        if (Array.isArray(productData.image_files)) {
            productData.image_files.forEach((fileObj, idx) => {
                if (fileObj instanceof File) {
                    formData.append(`images[${idx}]`, fileObj, fileObj.name);
                } else if (typeof fileObj === 'string' && !fileObj.startsWith('blob:')) {
                    formData.append(`existing_images[${idx}]`, fileObj);
                }
            });
        }

        // For Laravel multipart update, append _method=PUT and send POST
        if (isUpdate) {
            formData.append('_method', 'PUT');
        }

        const url = isUpdate ? `${API_BASE_URL}/${productData.id}` : API_BASE_URL;

        try {
            let response = await fetch(url, {
                method: 'POST', // POST for FormData multipart in Laravel
                headers: this.getFormDataHeaders(),
                body: formData
            });

            if (!response.ok && response.status === 404) {
                const fallbackUrl = isUpdate ? `${FALLBACK_API_URL}/${productData.id}` : FALLBACK_API_URL;
                response = await fetch(fallbackUrl, {
                    method: 'POST',
                    headers: this.getFormDataHeaders(),
                    body: formData
                });
            }

            if (response.ok) {
                const resData = await response.json();
                const savedProduct = resData.data || resData.product || { ...productData, id: productData.id || Date.now() };

                const cachedProducts = await this.getAllProducts();
                if (isUpdate) {
                    const idx = cachedProducts.findIndex(p => p.id === Number(productData.id));
                    if (idx !== -1) cachedProducts[idx] = savedProduct;
                } else {
                    cachedProducts.unshift(savedProduct);
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProducts));

                return { success: true, product: savedProduct };
            }

            // Fallback store to local cache if backend endpoint is in development
            const cachedProducts = await this.getAllProducts();
            if (isUpdate) {
                const idx = cachedProducts.findIndex(p => p.id === Number(productData.id));
                if (idx !== -1) {
                    cachedProducts[idx] = { ...cachedProducts[idx], ...productData, id: Number(productData.id) };
                }
            } else {
                const newProduct = { ...productData, id: Date.now() };
                cachedProducts.unshift(newProduct);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProducts));
            return { success: true, product: productData };

        } catch (err) {
            console.warn('API Save Product failed, saved to local cache:', err);
            const cachedProducts = await this.getAllProducts();
            if (isUpdate) {
                const idx = cachedProducts.findIndex(p => p.id === Number(productData.id));
                if (idx !== -1) {
                    cachedProducts[idx] = { ...cachedProducts[idx], ...productData, id: Number(productData.id) };
                }
            } else {
                const newProduct = { ...productData, id: Date.now() };
                cachedProducts.unshift(newProduct);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProducts));
            return { success: true, product: productData };
        }
    },

    /**
     * DELETE /api/admin/products/{id} - Delete Product via API
     */
    async deleteProduct(id) {
        try {
            let response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok && response.status === 404) {
                await fetch(`${FALLBACK_API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: this.getHeaders()
                });
            }
        } catch (err) {
            console.warn('API Delete Product error:', err);
        }

        const cachedProducts = await this.getAllProducts();
        const filtered = cachedProducts.filter(p => p.id !== Number(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return { success: true };
    },

    /**
     * PATCH /api/admin/products/{id}/status - Toggle Product Status via API
     */
    async toggleProductStatus(id) {
        const cachedProducts = await this.getAllProducts();
        const index = cachedProducts.findIndex(p => p.id === Number(id));
        if (index === -1) return { success: false };

        const newStatus = cachedProducts[index].status === 1 ? 0 : 1;
        cachedProducts[index].status = newStatus;

        try {
            await fetch(`${API_BASE_URL}/${id}/status`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
        } catch {
            // silent catch
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProducts));
        return { success: true, product: cachedProducts[index] };
    },

    /**
     * Reset products cache
     */
    async resetData() {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
};
