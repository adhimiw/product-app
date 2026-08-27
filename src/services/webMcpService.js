/**
 * WebMCP Tool Registration Service (W3C Web Machine Learning Community Group)
 * Spec: https://github.com/webmachinelearning/webmcp
 *
 * Exposes in-browser tools to AI agents, in-browser assistants, and agentic browsers
 * allowing programmatic actuation of Mangalam Healthy Foods e-commerce store.
 */

import { fetchProductsApi, addToCartApi, fetchCartApi, toggleFavoriteApi } from './api';

export class WebMcpService {
    static isInitialized = false;

    /**
     * Register WebMCP tools with the browser's modelContext
     */
    static async registerTools() {
        if (typeof window === 'undefined') return;

        const modelContext = window.navigator?.modelContext || document?.modelContext;

        const tools = [
            {
                name: 'search_products',
                description: 'Search for traditional sprouted health mixes, ancient grain porridges, and organic nutrition products by name, category, or health benefit.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search keyword (e.g. "sprouted ragi", "baby food", "diabetic care")' },
                        category: { type: 'string', description: 'Optional category name (e.g. "Sprouted Mixes", "Millet Porridge")' }
                    },
                    required: ['query']
                },
                async execute({ query, category }) {
                    const res = await fetchProductsApi();
                    if (!res.success) return { error: 'Failed to fetch products' };

                    const filtered = res.data.filter(p => {
                        const matchesQuery = (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
                                             (p.description || '').toLowerCase().includes(query.toLowerCase()) ||
                                             (p.benefits || '').toLowerCase().includes(query.toLowerCase());
                        const matchesCategory = !category || (p.category || '').toLowerCase() === category.toLowerCase();
                        return matchesQuery && matchesCategory;
                    });

                    return {
                        count: filtered.length,
                        products: filtered.map(p => ({
                            id: p.id,
                            name: p.name,
                            price: p.actual_price,
                            category: p.category,
                            badge: p.badge,
                            package_sizes: (p.package_sizes || []).map(pkg => ({
                                id: pkg.id,
                                size: `${pkg.size_number}${pkg.size_unit}`,
                                price: pkg.variant_price,
                                stock: pkg.stock
                            }))
                        }))
                    };
                }
            },
            {
                name: 'get_cart',
                description: 'Retrieve the current user or guest shopping cart items, subtotal, and summary.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                },
                async execute() {
                    const res = await fetchCartApi();
                    return res;
                }
            },
            {
                name: 'add_to_cart',
                description: 'Add a sprouted health mix product variant to the active shopping cart.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'number', description: 'Product ID' },
                        packageSizeId: { type: 'number', description: 'Optional package variant size ID' },
                        quantity: { type: 'number', description: 'Quantity to add (default 1)', default: 1 }
                    },
                    required: ['productId']
                },
                async execute({ productId, packageSizeId, quantity = 1 }) {
                    const res = await addToCartApi(productId, packageSizeId, quantity);
                    return res;
                }
            },
            {
                name: 'toggle_favorite',
                description: 'Add or remove a product from the user wishlist / favorites.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'number', description: 'Product ID to bookmark' }
                    },
                    required: ['productId']
                },
                async execute({ productId }) {
                    const res = await toggleFavoriteApi(productId);
                    return res;
                }
            }
        ];

        // If native WebMCP modelContext exists in the browser
        if (modelContext && typeof modelContext.registerTool === 'function') {
            for (const tool of tools) {
                try {
                    await modelContext.registerTool(tool);
                } catch (e) {
                    console.warn(`WebMCP tool registration notice for ${tool.name}:`, e);
                }
            }
        }

        // Expose to window.__WEBMCP__ for AI browser agent extensions & CDP inspection
        window.__WEBMCP__ = {
            specVersion: 'W3C-Draft-2026',
            tools: tools,
            invokeTool: async (toolName, params) => {
                const found = tools.find(t => t.name === toolName);
                if (!found) throw new Error(`Tool ${toolName} not found`);
                return await found.execute(params || {});
            }
        };

        this.isInitialized = true;
    }
}
