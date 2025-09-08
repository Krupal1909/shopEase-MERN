const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 30 minutes (1800 seconds) for better performance
const cache = new NodeCache({ stdTTL: 1800 });

class UnlimitedProductService {
    constructor() {
        this.rapidApiKey = process.env.RAPIDAPI_KEY;
        this.isApiKeyValid = this.rapidApiKey && this.rapidApiKey !== 'your-rapidapi-key-here';
        this.apiSources = {
            amazon: {
                baseUrl: 'https://real-time-amazon-data.p.rapidapi.com',
                host: 'real-time-amazon-data.p.rapidapi.com'
            },
            ebay: {
                baseUrl: 'https://ebay-search-result.p.rapidapi.com',
                host: 'ebay-search-result.p.rapidapi.com'
            },
            aliexpress: {
                baseUrl: 'https://aliexpress-datahub.p.rapidapi.com',
                host: 'aliexpress-datahub.p.rapidapi.com'
            },
            walmart: {
                baseUrl: 'https://walmart-search1.p.rapidapi.com',
                host: 'walmart-search1.p.rapidapi.com'
            },
            etsy: {
                baseUrl: 'https://etsy-scraper.p.rapidapi.com',
                host: 'etsy-scraper.p.rapidapi.com'
            }
        };
        
        // Category mappings for different APIs
        this.categoryMappings = {
            'Electronics': ['electronics', 'computers', 'phones', 'tablets'],
            'Sports & Outdoors': ['sports', 'fitness', 'outdoor', 'exercise'],
            'Fashion': ['clothing', 'fashion', 'apparel', 'shoes', 'accessories'],
            'Health & Personal Care': ['health', 'beauty', 'personal care', 'wellness'],
            'Home & Garden': ['home', 'kitchen', 'garden', 'furniture', 'decor'],
            'Books': ['books', 'ebooks', 'literature', 'educational'],
            'Automotive': ['automotive', 'car', 'vehicle', 'parts'],
            'Grocery & Gourmet Food': ['food', 'grocery', 'gourmet', 'organic'],
            'Baby': ['baby', 'kids', 'children', 'toys', 'infant']
        };
    }

    // Main method to get unlimited products from multiple sources
    async getUnlimitedProducts(options = {}) {
        const {
            query = '',
            category = '',
            page = 1,
            limit = 50,
            sources = ['amazon', 'ebay', 'walmart'],
            sortBy = 'relevance',
            priceRange = {},
            minRating = 0
        } = options;

        // If API key is not valid, return empty result with warning
        if (!this.isApiKeyValid) {
            console.warn('RAPIDAPI_KEY not configured. External API services unavailable.');
            return {
                products: [],
                totalCount: 0,
                sources: {
                    warning: 'External APIs unavailable - RAPIDAPI_KEY not configured'
                },
                pagination: {
                    page,
                    limit,
                    hasNext: false,
                    hasPrev: false
                }
            };
        }

        const cacheKey = `unlimited_${JSON.stringify(options)}`;
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        const allProducts = [];
        const sourceResults = {};

        // Fetch from multiple sources in parallel
        const fetchPromises = sources.map(async (source) => {
            try {
                let products = [];
                
                switch (source) {
                    case 'amazon':
                        products = await this.fetchAmazonProducts(query, category, page, limit);
                        break;
                    case 'ebay':
                        products = await this.fetchEbayProducts(query, category, page, limit);
                        break;
                    case 'walmart':
                        products = await this.fetchWalmartProducts(query, category, page, limit);
                        break;
                    case 'aliexpress':
                        products = await this.fetchAliexpressProducts(query, category, page, limit);
                        break;
                    case 'etsy':
                        products = await this.fetchEtsyProducts(query, category, page, limit);
                        break;
                }

                sourceResults[source] = {
                    count: products.length,
                    status: 'success'
                };
                
                return products;
            } catch (error) {
                console.error(`${source} API Error:`, error.message);
                sourceResults[source] = {
                    count: 0,
                    status: 'error',
                    error: error.message
                };
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach(products => allProducts.push(...products));

        // Remove duplicates and apply filters
        let filteredProducts = this.removeDuplicates(allProducts);
        filteredProducts = this.applyFilters(filteredProducts, { priceRange, minRating });
        filteredProducts = this.sortProducts(filteredProducts, sortBy);

        const result = {
            products: filteredProducts,
            totalCount: filteredProducts.length,
            sources: sourceResults,
            pagination: {
                page,
                limit,
                hasNext: filteredProducts.length === limit,
                hasPrev: page > 1
            }
        };

        cache.set(cacheKey, result);
        return result;
    }

    // Amazon products fetching
    async fetchAmazonProducts(query, category, page, limit) {
        try {
            const searchQuery = query || this.getCategorySearchTerms(category).join(' ');
            const response = await axios.get(`${this.apiSources.amazon.baseUrl}/search`, {
                params: {
                    query: searchQuery,
                    page: page,
                    country: 'US'
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.apiSources.amazon.host
                }
            });

            return this.formatProducts(response.data.data?.products || [], 'amazon');
        } catch (error) {
            console.error('Amazon fetch error:', error.message);
            return [];
        }
    }

    // eBay products fetching
    async fetchEbayProducts(query, category, page, limit) {
        try {
            const searchQuery = query || this.getCategorySearchTerms(category).join(' ');
            const response = await axios.get(`${this.apiSources.ebay.baseUrl}/search`, {
                params: {
                    q: searchQuery,
                    limit: limit,
                    offset: (page - 1) * limit
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.apiSources.ebay.host
                }
            });

            return this.formatProducts(response.data.results || [], 'ebay');
        } catch (error) {
            console.error('eBay fetch error:', error.message);
            return [];
        }
    }

    // Walmart products fetching
    async fetchWalmartProducts(query, category, page, limit) {
        try {
            const searchQuery = query || this.getCategorySearchTerms(category).join(' ');
            const response = await axios.get(`${this.apiSources.walmart.baseUrl}/search`, {
                params: {
                    query: searchQuery,
                    page: page,
                    limit: limit
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.apiSources.walmart.host
                }
            });

            return this.formatProducts(response.data.items || [], 'walmart');
        } catch (error) {
            console.error('Walmart fetch error:', error.message);
            return [];
        }
    }

    // AliExpress products fetching
    async fetchAliexpressProducts(query, category, page, limit) {
        try {
            const searchQuery = query || this.getCategorySearchTerms(category).join(' ');
            const response = await axios.get(`${this.apiSources.aliexpress.baseUrl}/search`, {
                params: {
                    q: searchQuery,
                    page: page,
                    limit: limit
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.apiSources.aliexpress.host
                }
            });

            return this.formatProducts(response.data.products || [], 'aliexpress');
        } catch (error) {
            console.error('AliExpress fetch error:', error.message);
            return [];
        }
    }

    // Etsy products fetching
    async fetchEtsyProducts(query, category, page, limit) {
        try {
            const searchQuery = query || this.getCategorySearchTerms(category).join(' ');
            const response = await axios.get(`${this.apiSources.etsy.baseUrl}/search`, {
                params: {
                    query: searchQuery,
                    page: page,
                    limit: limit
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': this.apiSources.etsy.host
                }
            });

            return this.formatProducts(response.data.listings || [], 'etsy');
        } catch (error) {
            console.error('Etsy fetch error:', error.message);
            return [];
        }
    }

    // Format products from different sources to unified format
    formatProducts(products, source) {
        return products.map(product => {
            switch (source) {
                case 'amazon':
                    return this.formatAmazonProduct(product);
                case 'ebay':
                    return this.formatEbayProduct(product);
                case 'walmart':
                    return this.formatWalmartProduct(product);
                case 'aliexpress':
                    return this.formatAliexpressProduct(product);
                case 'etsy':
                    return this.formatEtsyProduct(product);
                default:
                    return product;
            }
        }).filter(p => p && p.title && p.price > 0);
    }

    formatAmazonProduct(product) {
        return {
            id: `amazon_${product.asin || product.product_id}`,
            externalId: product.asin || product.product_id,
            source: 'amazon',
            title: product.product_title || product.title,
            description: product.product_description || product.description || product.product_title,
            price: this.parsePrice(product.product_price || product.price),
            originalPrice: this.parsePrice(product.product_original_price || product.original_price),
            discount: product.product_discount_percentage || 0,
            rating: product.product_star_rating || product.rating || 0,
            reviewCount: product.product_num_ratings || product.review_count || 0,
            images: this.extractImages(product, 'amazon'),
            category: this.mapCategory(product.product_category || product.category),
            brand: product.product_brand || product.brand || 'Unknown',
            availability: product.product_availability !== 'Out of Stock',
            url: product.product_url || product.url,
            shipping: product.delivery || 'Standard',
            features: product.product_features || []
        };
    }

    formatEbayProduct(product) {
        return {
            id: `ebay_${product.itemId || product.id}`,
            externalId: product.itemId || product.id,
            source: 'ebay',
            title: product.title,
            description: product.subtitle || product.title,
            price: this.parsePrice(product.price?.value || product.currentPrice),
            originalPrice: this.parsePrice(product.originalPrice || product.price?.value),
            discount: 0,
            rating: 0,
            reviewCount: 0,
            images: this.extractImages(product, 'ebay'),
            category: this.mapCategory(product.categoryPath || product.category),
            brand: product.brand || 'Unknown',
            availability: true,
            url: product.itemWebUrl || product.url,
            shipping: product.shippingInfo?.shippingServiceCost || 'Varies',
            condition: product.condition || 'New'
        };
    }

    formatWalmartProduct(product) {
        return {
            id: `walmart_${product.itemId || product.id}`,
            externalId: product.itemId || product.id,
            source: 'walmart',
            title: product.name || product.title,
            description: product.shortDescription || product.name,
            price: this.parsePrice(product.salePrice || product.price),
            originalPrice: this.parsePrice(product.msrp || product.originalPrice),
            discount: product.rollBack ? 10 : 0,
            rating: product.customerRating || 0,
            reviewCount: product.numReviews || 0,
            images: this.extractImages(product, 'walmart'),
            category: this.mapCategory(product.categoryPath || product.category),
            brand: product.brandName || 'Unknown',
            availability: product.availableOnline !== false,
            url: product.productUrl || product.url,
            shipping: 'Free 2-Day Shipping'
        };
    }

    formatAliexpressProduct(product) {
        return {
            id: `aliexpress_${product.productId || product.id}`,
            externalId: product.productId || product.id,
            source: 'aliexpress',
            title: product.productTitle || product.title,
            description: product.productTitle || product.title,
            price: this.parsePrice(product.salePrice || product.price),
            originalPrice: this.parsePrice(product.originalPrice || product.price),
            discount: product.discount || 0,
            rating: product.averageStarRate || 0,
            reviewCount: product.totalSoldCount || 0,
            images: this.extractImages(product, 'aliexpress'),
            category: this.mapCategory(product.categoryName || product.category),
            brand: product.storeName || 'AliExpress',
            availability: true,
            url: product.productDetailUrl || product.url,
            shipping: 'Free Shipping'
        };
    }

    formatEtsyProduct(product) {
        return {
            id: `etsy_${product.listing_id || product.id}`,
            externalId: product.listing_id || product.id,
            source: 'etsy',
            title: product.title,
            description: product.description || product.title,
            price: this.parsePrice(product.price || product.price_formatted),
            originalPrice: this.parsePrice(product.price || product.price_formatted),
            discount: 0,
            rating: 0,
            reviewCount: product.num_favorers || 0,
            images: this.extractImages(product, 'etsy'),
            category: this.mapCategory(product.category_path || product.category),
            brand: product.shop_name || 'Etsy',
            availability: product.state === 'active',
            url: product.url,
            shipping: 'Varies by seller',
            handmade: true
        };
    }

    // Extract images from different product formats
    extractImages(product, source) {
        const images = [];
        
        switch (source) {
            case 'amazon':
                if (product.product_photo) images.push({ url: product.product_photo, type: 'main' });
                if (product.product_photos) {
                    product.product_photos.forEach(photo => images.push({ url: photo, type: 'gallery' }));
                }
                break;
            case 'ebay':
                if (product.image?.imageUrl) images.push({ url: product.image.imageUrl, type: 'main' });
                if (product.additionalImages) {
                    product.additionalImages.forEach(img => images.push({ url: img.imageUrl, type: 'gallery' }));
                }
                break;
            case 'walmart':
                if (product.thumbnailImage) images.push({ url: product.thumbnailImage, type: 'main' });
                if (product.mediumImage) images.push({ url: product.mediumImage, type: 'gallery' });
                break;
            case 'aliexpress':
                if (product.productImage) images.push({ url: product.productImage, type: 'main' });
                break;
            case 'etsy':
                if (product.MainImage?.url_570xN) images.push({ url: product.MainImage.url_570xN, type: 'main' });
                break;
        }

        return images.length > 0 ? images : [{ url: '/placeholder-image.jpg', type: 'main' }];
    }

    // Get search terms for category
    getCategorySearchTerms(category) {
        return this.categoryMappings[category] || [category.toLowerCase()];
    }

    // Parse price from various formats
    parsePrice(priceString) {
        if (!priceString) return 0;
        if (typeof priceString === 'number') return priceString;
        const price = priceString.toString().replace(/[^0-9.]/g, '');
        return parseFloat(price) || 0;
    }

    // Map categories to standard format
    mapCategory(category) {
        if (!category) return 'Others';
        const categoryStr = Array.isArray(category) ? category.join(' ') : category.toString();
        
        for (const [standardCategory, keywords] of Object.entries(this.categoryMappings)) {
            if (keywords.some(keyword => categoryStr.toLowerCase().includes(keyword))) {
                return standardCategory;
            }
        }
        return 'Others';
    }

    // Remove duplicate products
    removeDuplicates(products) {
        const seen = new Map();
        const unique = [];

        for (const product of products) {
            const key = this.generateProductKey(product);
            if (!seen.has(key)) {
                seen.set(key, true);
                unique.push(product);
            }
        }

        return unique;
    }

    // Generate unique key for deduplication
    generateProductKey(product) {
        const title = product.title.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 30);
        const price = Math.round(product.price);
        return `${title}_${price}`;
    }

    // Apply filters
    applyFilters(products, filters) {
        return products.filter(product => {
            if (filters.priceRange?.min && product.price < filters.priceRange.min) return false;
            if (filters.priceRange?.max && product.price > filters.priceRange.max) return false;
            if (filters.minRating && product.rating < filters.minRating) return false;
            return true;
        });
    }

    // Sort products
    sortProducts(products, sortBy) {
        switch (sortBy) {
            case 'price_low':
                return products.sort((a, b) => a.price - b.price);
            case 'price_high':
                return products.sort((a, b) => b.price - a.price);
            case 'rating':
                return products.sort((a, b) => b.rating - a.rating);
            case 'popularity':
                return products.sort((a, b) => b.reviewCount - a.reviewCount);
            case 'newest':
                return products.sort((a, b) => a.source === 'amazon' ? -1 : 1);
            default: // relevance
                return products.sort((a, b) => {
                    const scoreA = (a.rating * Math.log(a.reviewCount + 1)) + (a.discount / 10);
                    const scoreB = (b.rating * Math.log(b.reviewCount + 1)) + (b.discount / 10);
                    return scoreB - scoreA;
                });
        }
    }

    // Get trending products from all sources
    async getTrendingProducts(category = '', limit = 100) {
        const trendingQueries = [
            'best sellers',
            'trending',
            'popular',
            'top rated',
            'most wished'
        ];

        const allTrending = [];
        
        for (const query of trendingQueries) {
            const results = await this.getUnlimitedProducts({
                query: category ? `${query} ${category}` : query,
                limit: 20,
                sources: ['amazon', 'ebay', 'walmart']
            });
            allTrending.push(...results.products);
        }

        const unique = this.removeDuplicates(allTrending);
        return unique.slice(0, limit);
    }

    // Clear cache
    clearCache() {
        cache.flushAll();
    }

    // Get cache statistics
    getCacheStats() {
        return cache.getStats();
    }
}

module.exports = new UnlimitedProductService();
