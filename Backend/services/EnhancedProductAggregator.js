const unlimitedProductService = require('./UnlimitedProductService');
const Product = require('../models/product/product.model');
const NodeCache = require('node-cache');

// Cache for 15 minutes for aggregated results
const aggregatorCache = new NodeCache({ stdTTL: 900 });

class EnhancedProductAggregator {
    constructor() {
        this.maxProductsPerPage = 100;
        this.defaultSources = ['amazon', 'ebay', 'walmart', 'local'];
        this.priceComparisonThreshold = 0.15; // 15% price difference threshold
    }

    // Main aggregation method with infinite scroll support
    async getInfiniteProducts(options = {}) {
        const {
            query = '',
            category = '',
            page = 1,
            limit = 50,
            sources = this.defaultSources,
            sortBy = 'relevance',
            priceRange = {},
            minRating = 0,
            includeLocal = true,
            realTimeOnly = false
        } = options;

        const cacheKey = `infinite_${JSON.stringify(options)}`;
        const cached = aggregatorCache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        let allProducts = [];
        const sourceResults = {};

        // Get external products
        if (!realTimeOnly || sources.some(s => s !== 'local')) {
            try {
                const externalSources = sources.filter(s => s !== 'local');
                if (externalSources.length > 0) {
                    const externalResults = await unlimitedProductService.getUnlimitedProducts({
                        query,
                        category,
                        page,
                        limit: limit * 2, // Get more to ensure variety after deduplication
                        sources: externalSources,
                        sortBy,
                        priceRange,
                        minRating
                    });

                    allProducts.push(...externalResults.products);
                    Object.assign(sourceResults, externalResults.sources);
                }
            } catch (error) {
                console.error('External products error:', error);
                // Add error info to source results
                sources.filter(s => s !== 'local').forEach(source => {
                    sourceResults[source] = {
                        count: 0,
                        status: 'error',
                        error: 'External API service unavailable'
                    };
                });
            }
        }

        // Get local products if requested
        if (includeLocal && sources.includes('local')) {
            try {
                const localProducts = await this.getLocalProducts({
                    query,
                    category,
                    page,
                    limit: Math.floor(limit / 2),
                    priceRange,
                    minRating
                });

                allProducts.push(...localProducts.products);
                sourceResults.local = {
                    count: localProducts.products.length,
                    status: 'success'
                };
            } catch (error) {
                console.error('Local products error:', error);
                sourceResults.local = {
                    count: 0,
                    status: 'error',
                    error: error.message
                };
            }
        }

        // Advanced deduplication and processing
        let processedProducts = this.advancedDeduplication(allProducts);
        processedProducts = this.enhanceWithPriceComparison(processedProducts);
        processedProducts = this.applyAdvancedFilters(processedProducts, options);
        processedProducts = this.sortProductsAdvanced(processedProducts, sortBy);

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = processedProducts.slice(startIndex, endIndex);

        const result = {
            products: paginatedProducts,
            totalCount: processedProducts.length,
            availableCount: allProducts.length,
            sources: sourceResults,
            pagination: {
                page,
                limit,
                hasNext: endIndex < processedProducts.length,
                hasPrev: page > 1,
                totalPages: Math.ceil(processedProducts.length / limit)
            },
            filters: {
                priceRange: this.calculatePriceRange(processedProducts),
                categories: this.getAvailableCategories(processedProducts),
                brands: this.getAvailableBrands(processedProducts),
                sources: Object.keys(sourceResults)
            }
        };

        aggregatorCache.set(cacheKey, result);
        return result;
    }

    // Advanced deduplication with similarity scoring
    advancedDeduplication(products) {
        const groups = new Map();
        const unique = [];

        for (const product of products) {
            const signature = this.generateProductSignature(product);
            
            if (!groups.has(signature)) {
                groups.set(signature, []);
            }
            groups.get(signature).push(product);
        }

        // For each group, select the best product
        for (const [signature, groupProducts] of groups) {
            if (groupProducts.length === 1) {
                unique.push(groupProducts[0]);
            } else {
                // Select best product from duplicates
                const bestProduct = this.selectBestFromDuplicates(groupProducts);
                unique.push(bestProduct);
            }
        }

        return unique;
    }

    // Generate product signature for deduplication
    generateProductSignature(product) {
        const productTitle = product.title || product.name || '';
        const title = productTitle.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(word => word.length > 2)
            .sort()
            .slice(0, 5)
            .join('_');
        
        const brand = (product.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const priceRange = Math.floor((product.price || 0) / 10) * 10; // Group by $10 ranges
        const source = product.source || 'unknown';
        
        return `${source}_${brand}_${title}_${priceRange}`;
    }

    // Select best product from duplicates
    selectBestFromDuplicates(products) {
        return products.reduce((best, current) => {
            const bestScore = this.calculateProductScore(best);
            const currentScore = this.calculateProductScore(current);
            return currentScore > bestScore ? current : best;
        });
    }

    // Calculate product quality score
    calculateProductScore(product) {
        let score = 0;
        
        // Rating score (0-50 points)
        score += (product.rating || 0) * 10;
        
        // Review count score (0-30 points)
        score += Math.min((product.reviewCount || 0) / 100, 1) * 30;
        
        // Source preference (0-20 points)
        const sourceScores = { amazon: 20, walmart: 15, ebay: 10, local: 25, aliexpress: 8, etsy: 12 };
        score += sourceScores[product.source] || 5;
        
        // Image quality (0-10 points)
        score += (product.images?.length || 0) > 1 ? 10 : 5;
        
        // Availability bonus (0-10 points)
        score += product.availability ? 10 : 0;
        
        // Discount bonus (0-10 points)
        score += Math.min((product.discount || 0) / 10, 1) * 10;
        
        return score;
    }

    // Enhance products with price comparison
    enhanceWithPriceComparison(products) {
        const priceGroups = new Map();
        
        // Group similar products for price comparison
        products.forEach(product => {
            const key = this.generateComparisonKey(product);
            if (!priceGroups.has(key)) {
                priceGroups.set(key, []);
            }
            priceGroups.get(key).push(product);
        });

        // Add price comparison data
        return products.map(product => {
            const key = this.generateComparisonKey(product);
            const similarProducts = priceGroups.get(key) || [];
            
            if (similarProducts.length > 1) {
                const prices = similarProducts.map(p => p.price).sort((a, b) => a - b);
                const lowestPrice = prices[0];
                const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
                
                return {
                    ...product,
                    priceComparison: {
                        isLowestPrice: Math.abs(product.price - lowestPrice) < 0.01,
                        lowestPrice,
                        averagePrice,
                        savingsAmount: averagePrice - product.price,
                        savingsPercentage: ((averagePrice - product.price) / averagePrice) * 100,
                        competitorCount: similarProducts.length - 1
                    }
                };
            }
            
            return product;
        });
    }

    // Generate key for price comparison
    generateComparisonKey(product) {
        const title = product.title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(word => word.length > 3)
            .slice(0, 3)
            .join('_');
        
        return `${product.brand}_${title}`;
    }

    // Apply advanced filters
    applyAdvancedFilters(products, options) {
        const {
            priceRange = {},
            minRating = 0,
            brands = [],
            sources = [],
            availability = null,
            hasDiscount = null,
            freeShipping = null
        } = options;

        return products.filter(product => {
            // Price range filter
            if (priceRange.min && product.price < priceRange.min) return false;
            if (priceRange.max && product.price > priceRange.max) return false;
            
            // Rating filter
            if (minRating && (product.rating || 0) < minRating) return false;
            
            // Brand filter
            if (brands.length > 0 && !brands.includes(product.brand)) return false;
            
            // Source filter
            if (sources.length > 0 && !sources.includes(product.source)) return false;
            
            // Availability filter
            if (availability !== null && product.availability !== availability) return false;
            
            // Discount filter
            if (hasDiscount !== null) {
                const hasProductDiscount = (product.discount || 0) > 0;
                if (hasProductDiscount !== hasDiscount) return false;
            }
            
            // Free shipping filter
            if (freeShipping !== null) {
                const hasFreeShipping = (product.shipping || '').toLowerCase().includes('free');
                if (hasFreeShipping !== freeShipping) return false;
            }
            
            return true;
        });
    }

    // Advanced sorting with multiple criteria
    sortProductsAdvanced(products, sortBy) {
        switch (sortBy) {
            case 'price_low':
                return products.sort((a, b) => a.price - b.price);
            case 'price_high':
                return products.sort((a, b) => b.price - a.price);
            case 'rating':
                return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'popularity':
                return products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
            case 'discount':
                return products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
            case 'newest':
                return products.sort((a, b) => {
                    const sourceOrder = { local: 4, amazon: 3, walmart: 2, ebay: 1, aliexpress: 0 };
                    return (sourceOrder[b.source] || 0) - (sourceOrder[a.source] || 0);
                });
            case 'best_deal':
                return products.sort((a, b) => {
                    const scoreA = this.calculateDealScore(a);
                    const scoreB = this.calculateDealScore(b);
                    return scoreB - scoreA;
                });
            default: // relevance
                return products.sort((a, b) => {
                    const scoreA = this.calculateRelevanceScore(a);
                    const scoreB = this.calculateRelevanceScore(b);
                    return scoreB - scoreA;
                });
        }
    }

    // Calculate deal score for best deals sorting
    calculateDealScore(product) {
        let score = 0;
        
        // Discount weight
        score += (product.discount || 0) * 2;
        
        // Price comparison weight
        if (product.priceComparison) {
            score += Math.max(product.priceComparison.savingsPercentage || 0, 0);
        }
        
        // Rating weight
        score += (product.rating || 0) * 5;
        
        // Review count weight
        score += Math.log((product.reviewCount || 0) + 1);
        
        return score;
    }

    // Calculate relevance score
    calculateRelevanceScore(product) {
        let score = 0;
        
        // Base quality score
        score += this.calculateProductScore(product);
        
        // Price comparison bonus
        if (product.priceComparison?.isLowestPrice) {
            score += 20;
        }
        
        // Availability bonus
        if (product.availability) {
            score += 10;
        }
        
        return score;
    }

    // Get local products with enhanced formatting
    async getLocalProducts(options) {
        const { query, category, page, limit, priceRange, minRating } = options;
        
        let filter = {};
        
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
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
        
        if (minRating > 0) {
            filter.rating = { $gte: minRating };
        }

        const products = await Product.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ rating: -1, reviewCount: -1 });

        return {
            products: products.map(product => this.formatLocalProduct(product))
        };
    }

    // Format local product to match external format
    formatLocalProduct(product) {
        return {
            id: `local_${product._id}`,
            externalId: product._id.toString(),
            source: 'local',
            title: product.name || product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            rating: product.ratings || product.rating || 0,
            reviewCount: product.reviewCount || 0,
            images: (product.images || []).map(img => ({
                url: img.url || img,
                type: 'main',
                alt: product.name || product.title
            })),
            variants: product.variants || [],
            category: product.category,
            brand: product.brand,
            availability: (product.stock || 0) > 0,
            url: `/product/${product._id}`,
            features: product.features || [],
            specifications: product.specifications || {},
            stock: product.stock || 0,
            shipping: 'Standard'
        };
    }

    // Calculate price range for filters
    calculatePriceRange(products) {
        if (products.length === 0) return { min: 0, max: 1000 };
        
        const prices = products.map(p => p.price).sort((a, b) => a - b);
        return {
            min: prices[0],
            max: prices[prices.length - 1],
            average: prices.reduce((sum, price) => sum + price, 0) / prices.length
        };
    }

    // Get available categories
    getAvailableCategories(products) {
        const categories = [...new Set(products.map(p => p.category))];
        return categories.map(category => ({
            name: category,
            count: products.filter(p => p.category === category).length
        }));
    }

    // Get available brands
    getAvailableBrands(products) {
        const brands = [...new Set(products.map(p => p.brand))];
        return brands.map(brand => ({
            name: brand,
            count: products.filter(p => p.brand === brand).length
        })).sort((a, b) => b.count - a.count);
    }

    // Get trending products across all sources
    async getTrendingProducts(category = '', limit = 100) {
        return await unlimitedProductService.getTrendingProducts(category, limit);
    }

    // Search suggestions based on popular queries
    async getSearchSuggestions(query, limit = 10) {
        const suggestions = [
            'smartphone', 'laptop', 'headphones', 'shoes', 'dress',
            'watch', 'camera', 'tablet', 'backpack', 'sunglasses',
            'fitness tracker', 'bluetooth speaker', 'gaming mouse',
            'wireless earbuds', 'power bank', 'phone case'
        ];

        return suggestions
            .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit);
    }

    // Clear all caches
    clearCache() {
        aggregatorCache.flushAll();
        unlimitedProductService.clearCache();
    }

    // Get comprehensive statistics
    getStats() {
        return {
            aggregatorCache: aggregatorCache.getStats(),
            unlimitedService: unlimitedProductService.getCacheStats(),
            supportedSources: this.defaultSources,
            maxProductsPerPage: this.maxProductsPerPage
        };
    }
}

module.exports = new EnhancedProductAggregator();
