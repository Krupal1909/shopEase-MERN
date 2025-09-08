const externalApiService = require('./externalApiService');
const Product = require('../models/product/product.model');

class ProductAggregatorService {
    constructor() {
        this.sources = ['amazon', 'local'];
    }

    // Get products from multiple sources
    async getAggregatedProducts(options = {}) {
        const {
            query = '',
            category = '',
            page = 1,
            limit = 20,
            sortBy = 'relevance',
            priceRange = {},
            sources = this.sources
        } = options;

        const results = {
            products: [],
            totalCount: 0,
            sources: {},
            pagination: {
                page,
                limit,
                hasNext: false,
                hasPrev: page > 1
            }
        };

        // Fetch from external APIs
        if (sources.includes('amazon')) {
            try {
                const amazonProducts = query 
                    ? await externalApiService.searchAmazonProducts(query, category, page)
                    : await externalApiService.getProductsByCategory(category, page, limit);
                
                results.products.push(...amazonProducts);
                results.sources.amazon = {
                    count: amazonProducts.length,
                    status: 'success'
                };
            } catch (error) {
                console.error('Amazon API Error:', error);
                results.sources.amazon = {
                    count: 0,
                    status: 'error',
                    error: error.message
                };
            }
        }

        // Fetch from local database
        if (sources.includes('local')) {
            try {
                const localProducts = await this.getLocalProducts({
                    query,
                    category,
                    page,
                    limit,
                    priceRange
                });
                
                results.products.push(...localProducts.products);
                results.sources.local = {
                    count: localProducts.products.length,
                    status: 'success'
                };
            } catch (error) {
                console.error('Local DB Error:', error);
                results.sources.local = {
                    count: 0,
                    status: 'error',
                    error: error.message
                };
            }
        }

        // Remove duplicates and sort
        results.products = this.removeDuplicates(results.products);
        results.products = this.sortProducts(results.products, sortBy);
        
        // Apply price filtering
        if (priceRange.min || priceRange.max) {
            results.products = this.filterByPrice(results.products, priceRange);
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = results.products.slice(startIndex, endIndex);
        
        results.totalCount = results.products.length;
        results.products = paginatedProducts;
        results.pagination.hasNext = endIndex < results.totalCount;

        return results;
    }

    // Get local products from database
    async getLocalProducts(options) {
        const { query, category, page, limit, priceRange } = options;
        
        let filter = {};
        
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (category && category !== 'All') {
            filter.category = category;
        }
        
        if (priceRange.min || priceRange.max) {
            filter.price = {};
            if (priceRange.min) filter.price.$gte = priceRange.min;
            if (priceRange.max) filter.price.$lte = priceRange.max;
        }

        const products = await Product.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const totalCount = await Product.countDocuments(filter);

        return {
            products: products.map(product => this.formatLocalProduct(product)),
            totalCount
        };
    }

    // Format local product to match external API format
    formatLocalProduct(product) {
        return {
            externalId: product._id.toString(),
            source: 'local',
            title: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            images: product.images.map(img => ({
                url: img,
                type: 'main',
                alt: product.title,
                variant: 'default'
            })),
            variants: product.variants || [],
            category: product.category,
            brand: product.brand,
            availability: product.stock > 0,
            url: `/product/${product._id}`,
            features: product.features || [],
            specifications: product.specifications || {},
            stock: product.stock
        };
    }

    // Remove duplicate products based on title similarity
    removeDuplicates(products) {
        const seen = new Set();
        const unique = [];

        for (const product of products) {
            const key = this.generateProductKey(product);
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(product);
            }
        }

        return unique;
    }

    // Generate unique key for product deduplication
    generateProductKey(product) {
        const title = product.title.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 50);
        return `${product.brand}_${title}`;
    }

    // Sort products by various criteria
    sortProducts(products, sortBy) {
        switch (sortBy) {
            case 'price_low':
                return products.sort((a, b) => a.price - b.price);
            case 'price_high':
                return products.sort((a, b) => b.price - a.price);
            case 'rating':
                return products.sort((a, b) => b.rating - a.rating);
            case 'discount':
                return products.sort((a, b) => b.discount - a.discount);
            case 'newest':
                return products.sort((a, b) => {
                    if (a.source === 'local' && b.source === 'local') {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    return a.source === 'amazon' ? -1 : 1;
                });
            default: // relevance
                return products.sort((a, b) => {
                    // Prioritize products with higher ratings and more reviews
                    const scoreA = (a.rating * Math.log(a.reviewCount + 1));
                    const scoreB = (b.rating * Math.log(b.reviewCount + 1));
                    return scoreB - scoreA;
                });
        }
    }

    // Filter products by price range
    filterByPrice(products, priceRange) {
        return products.filter(product => {
            if (priceRange.min && product.price < priceRange.min) return false;
            if (priceRange.max && product.price > priceRange.max) return false;
            return true;
        });
    }

    // Get trending products from all sources
    async getTrendingProducts(category = '', limit = 20) {
        const results = {
            products: [],
            sources: {}
        };

        // Get trending from Amazon
        try {
            const amazonTrending = await externalApiService.getTrendingProducts(category, limit);
            results.products.push(...amazonTrending);
            results.sources.amazon = {
                count: amazonTrending.length,
                status: 'success'
            };
        } catch (error) {
            results.sources.amazon = {
                count: 0,
                status: 'error',
                error: error.message
            };
        }

        // Get popular local products
        try {
            const localTrending = await this.getPopularLocalProducts(category, limit);
            results.products.push(...localTrending);
            results.sources.local = {
                count: localTrending.length,
                status: 'success'
            };
        } catch (error) {
            results.sources.local = {
                count: 0,
                status: 'error',
                error: error.message
            };
        }

        // Remove duplicates and limit results
        results.products = this.removeDuplicates(results.products);
        results.products = results.products.slice(0, limit);

        return results;
    }

    // Get popular local products
    async getPopularLocalProducts(category, limit) {
        let filter = {};
        if (category && category !== 'All') {
            filter.category = category;
        }

        const products = await Product.find(filter)
            .sort({ rating: -1, reviewCount: -1 })
            .limit(limit);

        return products.map(product => this.formatLocalProduct(product));
    }

    // Get product details by ID and source
    async getProductDetails(id, source = 'auto') {
        if (source === 'amazon' || (source === 'auto' && id.length === 10)) {
            // Amazon ASIN is typically 10 characters
            return await externalApiService.getAmazonProductDetails(id);
        } else {
            // Local product
            const product = await Product.findById(id);
            return product ? this.formatLocalProduct(product) : null;
        }
    }

    // Get product recommendations
    async getRecommendations(productId, source = 'local', limit = 10) {
        let baseProduct;
        
        if (source === 'amazon') {
            baseProduct = await externalApiService.getAmazonProductDetails(productId);
        } else {
            const product = await Product.findById(productId);
            baseProduct = product ? this.formatLocalProduct(product) : null;
        }

        if (!baseProduct) return [];

        // Get similar products based on category and brand
        const recommendations = await this.getAggregatedProducts({
            category: baseProduct.category,
            limit: limit * 2 // Get more to filter out the original product
        });

        // Filter out the original product and limit results
        return recommendations.products
            .filter(p => p.externalId !== productId)
            .slice(0, limit);
    }

    // Clear all caches
    clearCache() {
        externalApiService.clearCache();
    }

    // Get service statistics
    getStats() {
        return {
            cache: externalApiService.getCacheStats(),
            sources: this.sources
        };
    }
}

module.exports = new ProductAggregatorService();
