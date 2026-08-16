const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const LOCAL_STORAGE_KEY = 'mangalam_admin_categories';

function getLocalCategories() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
}

function saveLocalCategories(categories) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save categories to localStorage:', e);
    }
}

// Normalize backend category object for frontend UI
function normalizeCategory(cat) {
    if (!cat) return null;
    const isActive = cat.status === 1 || cat.status === '1' || cat.is_active === true;
    return {
        id: cat.id,
        name: cat.name || '',
        slug: cat.slug || '',
        description: cat.description || '',
        icon: cat.icon || null,
        icon_url: cat.icon_url || (typeof cat.icon === 'string' && cat.icon.startsWith('http') ? cat.icon : null),
        image: cat.image || null,
        image_url: cat.image_url || (typeof cat.image === 'string' && cat.image.startsWith('http') ? cat.image : null),
        status: cat.status !== undefined ? Number(cat.status) : (isActive ? 1 : 0),
        is_active: isActive,
        products_count: cat.products_count ?? 0,
        created_at: cat.created_at || new Date().toISOString()
    };
}

export const adminCategoryService = {
    /**
     * Fetch list of categories with optional search query
     */
    async getCategories(search = '') {
        try {
            const url = new URL(`${API_BASE_URL}/category`);
            if (search) {
                url.searchParams.append('search', search);
            }

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && (data.status === true || data.success === true)) {
                const list = Array.isArray(data.data) ? data.data.map(normalizeCategory) : [];
                return {
                    success: true,
                    message: data.message || 'Categories retrieved successfully',
                    data: list
                };
            }
        } catch (err) {
            console.warn('API getCategories offline fallback:', err.message);
        }

        // Offline Fallback logic
        let categories = getLocalCategories().map(normalizeCategory);
        if (search && search.trim() !== '') {
            const query = search.toLowerCase().trim();
            categories = categories.filter(cat =>
                cat.name.toLowerCase().includes(query) ||
                cat.slug.toLowerCase().includes(query) ||
                (cat.description && cat.description.toLowerCase().includes(query))
            );
        }

        return {
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        };
    },

    /**
     * Create a new category
     */
    async createCategory(categoryData) {
        try {
            const body = new FormData();
            
            if (categoryData.name) {
                body.append('name', categoryData.name);
            }
            if (categoryData.slug) {
                body.append('slug', categoryData.slug);
            }
            if (categoryData.description) {
                body.append('description', categoryData.description);
            }

            // Handle Icon File or String
            if (categoryData.icon) {
                if (categoryData.icon instanceof File) {
                    body.append('icon', categoryData.icon);
                } else if (typeof categoryData.icon === 'string' && categoryData.icon.trim() !== '') {
                    body.append('icon', categoryData.icon);
                }
            }

            // Handle Image File or String
            if (categoryData.image) {
                if (categoryData.image instanceof File) {
                    body.append('image', categoryData.image);
                } else if (typeof categoryData.image === 'string' && categoryData.image.trim() !== '') {
                    body.append('image', categoryData.image);
                }
            }
            
            const statusVal = categoryData.status !== undefined 
                ? (categoryData.status ? 1 : 0) 
                : (categoryData.is_active ? 1 : 0);
            body.append('status', statusVal.toString());

            const response = await fetch(`${API_BASE_URL}/category`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: body
            });

            const data = await response.json();

            if (response.ok && (data.status === true || data.success === true)) {
                return {
                    success: true,
                    message: data.message || 'Category created successfully',
                    data: normalizeCategory(data.data)
                };
            } else if (response.status === 422 || data.errors) {
                return {
                    success: false,
                    status: 422,
                    message: data.message || 'Validation failed',
                    errors: data.errors || null
                };
            }
        } catch (err) {
            console.warn('API createCategory offline fallback:', err.message);
        }

        // Mock Local Creation
        const categories = getLocalCategories();
        const errors = {};

        if (!categoryData.name || categoryData.name.trim().length < 2) {
            errors.name = ['Category name must be at least 2 characters long.'];
        } else if (categories.some(c => c.name.toLowerCase() === categoryData.name.trim().toLowerCase())) {
            errors.name = ['A category with this name already exists.'];
        }

        const generatedSlug = categoryData.slug
            ? categoryData.slug.toLowerCase().trim()
            : (categoryData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (!generatedSlug) {
            errors.slug = ['Slug is required and must contain alphanumeric characters.'];
        } else if (categories.some(c => c.slug === generatedSlug)) {
            errors.slug = ['This URL slug is already taken by another category.'];
        }

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                status: 422,
                message: 'Validation failed. Please fix highlighted fields.',
                errors: errors
            };
        }

        let iconStr = categoryData.icon;
        if (categoryData.icon instanceof File) {
            iconStr = URL.createObjectURL(categoryData.icon);
        }

        let imageStr = categoryData.image;
        if (categoryData.image instanceof File) {
            imageStr = URL.createObjectURL(categoryData.image);
        }

        const newCat = normalizeCategory({
            id: Date.now(),
            name: categoryData.name.trim(),
            slug: generatedSlug,
            description: categoryData.description || '',
            icon: typeof iconStr === 'string' ? iconStr : null,
            icon_url: typeof iconStr === 'string' ? iconStr : null,
            image: typeof imageStr === 'string' ? imageStr : null,
            image_url: typeof imageStr === 'string' ? imageStr : null,
            status: categoryData.is_active ? 1 : 0,
            products_count: 0,
            created_at: new Date().toISOString()
        });

        categories.unshift(newCat);
        saveLocalCategories(categories);

        return {
            success: true,
            message: 'Category created successfully',
            data: newCat
        };
    },

    /**
     * Update an existing category
     */
    async updateCategory(id, categoryData) {
        try {
            const body = new FormData();
            body.append('_method', 'PUT');

            if (categoryData.name !== undefined && categoryData.name !== null) {
                body.append('name', categoryData.name);
            }
            if (categoryData.slug !== undefined) {
                body.append('slug', categoryData.slug || '');
            }
            if (categoryData.description !== undefined) {
                body.append('description', categoryData.description || '');
            }

            // Handle Icon File or String
            if (categoryData.icon) {
                if (categoryData.icon instanceof File) {
                    body.append('icon', categoryData.icon);
                } else if (typeof categoryData.icon === 'string' && categoryData.icon.trim() !== '') {
                    body.append('icon', categoryData.icon);
                }
            }

            // Handle Image File or String
            if (categoryData.image) {
                if (categoryData.image instanceof File) {
                    body.append('image', categoryData.image);
                } else if (typeof categoryData.image === 'string' && categoryData.image.trim() !== '') {
                    body.append('image', categoryData.image);
                }
            }
            
            if (categoryData.status !== undefined) {
                body.append('status', (categoryData.status ? 1 : 0).toString());
            } else if (categoryData.is_active !== undefined) {
                body.append('status', (categoryData.is_active ? 1 : 0).toString());
            }

            const response = await fetch(`${API_BASE_URL}/category/${id}`, {
                method: 'POST', // POST with _method=PUT for multipart form uploads in PHP
                headers: {
                    'Accept': 'application/json'
                },
                body: body
            });

            const data = await response.json();

            if (response.ok && (data.status === true || data.success === true)) {
                return {
                    success: true,
                    message: data.message || 'Category updated successfully',
                    data: normalizeCategory(data.data)
                };
            } else if (response.status === 422 || data.errors) {
                return {
                    success: false,
                    status: 422,
                    message: data.message || 'Validation failed',
                    errors: data.errors || null
                };
            }
        } catch (err) {
            console.warn('API updateCategory offline fallback:', err.message);
        }

        // Mock Local Update
        let categories = getLocalCategories();
        const index = categories.findIndex(c => c.id === id || c.id === Number(id));

        if (index === -1) {
            return {
                success: false,
                message: 'Category not found'
            };
        }

        const currentCat = categories[index];
        const errors = {};

        if (categoryData.name !== undefined) {
            if (!categoryData.name || categoryData.name.trim().length < 2) {
                errors.name = ['Category name must be at least 2 characters long.'];
            } else if (categories.some(c => c.id !== currentCat.id && c.name.toLowerCase() === categoryData.name.trim().toLowerCase())) {
                errors.name = ['A category with this name already exists.'];
            }
        }

        if (categoryData.slug !== undefined) {
            const updatedSlug = categoryData.slug.toLowerCase().trim();
            if (!updatedSlug) {
                errors.slug = ['Slug cannot be empty.'];
            } else if (categories.some(c => c.id !== currentCat.id && c.slug === updatedSlug)) {
                errors.slug = ['This URL slug is already taken by another category.'];
            }
        }

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                status: 422,
                message: 'Validation failed. Please check highlighted fields.',
                errors: errors
            };
        }

        let iconStr = categoryData.icon;
        if (categoryData.icon instanceof File) {
            iconStr = URL.createObjectURL(categoryData.icon);
        }

        let imageStr = categoryData.image;
        if (categoryData.image instanceof File) {
            imageStr = URL.createObjectURL(categoryData.image);
        }

        const updatedCat = normalizeCategory({
            ...currentCat,
            ...(categoryData.name !== undefined && { name: categoryData.name.trim() }),
            ...(categoryData.slug !== undefined && { slug: categoryData.slug.trim() }),
            ...(categoryData.description !== undefined && { description: categoryData.description }),
            ...(iconStr !== undefined && { icon: iconStr, icon_url: iconStr }),
            ...(imageStr !== undefined && { image: imageStr, image_url: imageStr }),
            ...(categoryData.is_active !== undefined && { status: categoryData.is_active ? 1 : 0 }),
            ...(categoryData.status !== undefined && { status: Number(categoryData.status) })
        });

        categories[index] = updatedCat;
        saveLocalCategories(categories);

        return {
            success: true,
            message: 'Category updated successfully',
            data: updatedCat
        };
    },

    /**
     * Delete category
     */
    async deleteCategory(id, force = false) {
        try {
            const url = `${API_BASE_URL}/category/${id}${force ? '?force=true' : ''}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && (data.status === true || data.success === true)) {
                return {
                    success: true,
                    message: data.message || 'Category deleted successfully'
                };
            }
        } catch (err) {
            console.warn('API deleteCategory offline fallback:', err.message);
        }

        // Mock Local Delete
        let categories = getLocalCategories();
        const target = categories.find(c => c.id === id || c.id === Number(id));

        if (!target) {
            return {
                success: false,
                message: 'Category not found'
            };
        }

        categories = categories.filter(c => c.id !== id && c.id !== Number(id));
        saveLocalCategories(categories);

        return {
            success: true,
            message: 'Category deleted successfully'
        };
    },

    /**
     * Clear all local storage categories
     */
    resetData() {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return { success: true, message: 'Categories reset.' };
    }
};
