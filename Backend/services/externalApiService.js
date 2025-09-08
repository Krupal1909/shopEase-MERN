const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

class ExternalApiService {
    constructor() {
        this.rapidApiKey = process.env.RAPIDAPI_KEY;
        this.baseUrls = {
            amazonData: 'https://real-time-amazon-data.p.rapidapi.com',
            flipkartData: 'https://flipkart-scraper-api.p.rapidapi.com'
        };
    }

    // Amazon Product Search
    async searchAmazonProducts(query, category = '', page = 1) {
        const cacheKey = `amazon_search_${query}_${category}_${page}`;
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseUrls.amazonData}/search`, {
                params: {
                    query: query,
                    page: page,
                    country: 'US',
                    category_id: category
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
                }
            });

            const products = this.formatAmazonProducts(response.data.data.products || []);
            cache.set(cacheKey, products);
            return products;
        } catch (error) {
            console.error('Amazon API Error:', error.message);
            return [];
        }
    }

    // Get Amazon Product Details
    async getAmazonProductDetails(asin) {
        const cacheKey = `amazon_product_${asin}`;
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseUrls.amazonData}/product-details`, {
                params: {
                    asin: asin,
                    country: 'US'
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
                }
            });

            const product = this.formatAmazonProductDetails(response.data.data);
            cache.set(cacheKey, product);
            return product;
        } catch (error) {
            console.error('Amazon Product Details Error:', error.message);
            return null;
        }
    }

    // Format Amazon products to match our schema
    formatAmazonProducts(products) {
        return products.map(product => ({
            externalId: product.asin,
            source: 'amazon',
            title: product.product_title,
            description: product.product_description || product.product_title,
            price: this.parsePrice(product.product_price),
            originalPrice: this.parsePrice(product.product_original_price),
            discount: product.product_discount_percentage || 0,
            rating: product.product_star_rating || 0,
            reviewCount: product.product_num_ratings || 0,
            images: this.extractImages(product),
            variants: this.extractVariants(product),
            category: this.mapAmazonCategory(product.product_category),
            brand: product.product_brand || 'Unknown',
            availability: product.product_availability === 'In Stock',
            url: product.product_url,
            features: product.product_features || [],
            specifications: product.product_details || {}
        }));
    }

    // Format detailed Amazon product
    formatAmazonProductDetails(product) {
        return {
            externalId: product.asin,
            source: 'amazon',
            title: product.product_title,
            description: product.product_description,
            price: this.parsePrice(product.product_price),
            originalPrice: this.parsePrice(product.product_original_price),
            discount: product.product_discount_percentage || 0,
            rating: product.product_star_rating || 0,
            reviewCount: product.product_num_ratings || 0,
            images: this.extractDetailedImages(product),
            variants: this.extractDetailedVariants(product),
            category: this.mapAmazonCategory(product.product_category),
            brand: product.product_brand || 'Unknown',
            availability: product.product_availability === 'In Stock',
            url: product.product_url,
            features: product.product_features || [],
            specifications: product.product_details || {},
            reviews: product.product_reviews || []
        };
    }

    // Extract multiple images and variants
    extractImages(product) {
        const images = [];
        
        // Main image
        if (product.product_photo) {
            images.push({
                url: product.product_photo,
                type: 'main',
                alt: product.product_title
            });
        }

        // Additional images
        if (product.product_photos && Array.isArray(product.product_photos)) {
            product.product_photos.forEach((photo, index) => {
                images.push({
                    url: photo,
                    type: index === 0 ? 'main' : 'gallery',
                    alt: `${product.product_title} - Image ${index + 1}`
                });
            });
        }

        return images;
    }

    // Extract detailed images with variants
    extractDetailedImages(product) {
        const images = [];
        
        // Main product images
        if (product.product_photos && Array.isArray(product.product_photos)) {
            product.product_photos.forEach((photo, index) => {
                images.push({
                    url: photo,
                    type: index === 0 ? 'main' : 'gallery',
                    alt: `${product.product_title} - Image ${index + 1}`,
                    variant: 'default'
                });
            });
        }

        // Variant images
        if (product.product_variants && Array.isArray(product.product_variants)) {
            product.product_variants.forEach(variant => {
                if (variant.images && Array.isArray(variant.images)) {
                    variant.images.forEach((image, index) => {
                        images.push({
                            url: image,
                            type: index === 0 ? 'variant_main' : 'variant_gallery',
                            alt: `${product.product_title} - ${variant.name}`,
                            variant: variant.name || variant.asin
                        });
                    });
                }
            });
        }

        return images;
    }

    // Extract product variants
    extractVariants(product) {
        const variants = [];
        
        if (product.product_variations && Array.isArray(product.product_variations)) {
            product.product_variations.forEach(variation => {
                variants.push({
                    id: variation.asin,
                    name: variation.variation_name || variation.title,
                    price: this.parsePrice(variation.price),
                    image: variation.image,
                    attributes: variation.attributes || {}
                });
            });
        }

        return variants;
    }

    // Extract detailed variants
    extractDetailedVariants(product) {
        const variants = [];
        
        if (product.product_variants && Array.isArray(product.product_variants)) {
            product.product_variants.forEach(variant => {
                variants.push({
                    id: variant.asin,
                    name: variant.title || variant.variation_name,
                    price: this.parsePrice(variant.price),
                    originalPrice: this.parsePrice(variant.original_price),
                    images: variant.images || [],
                    attributes: {
                        color: variant.color,
                        size: variant.size,
                        style: variant.style,
                        ...variant.attributes
                    },
                    availability: variant.availability === 'In Stock'
                });
            });
        }

        return variants;
    }

    // Parse price from string
    parsePrice(priceString) {
        if (!priceString) return 0;
        const price = priceString.toString().replace(/[^0-9.]/g, '');
        return parseFloat(price) || 0;
    }

    // Map Amazon categories to our categories
    mapAmazonCategory(amazonCategory) {
        const categoryMapping = {
            'Electronics': 'Electronics',
            'Computers': 'Electronics',
            'Cell Phones': 'Electronics',
            'Sports & Outdoors': 'Sports & Outdoors',
            'Clothing': 'Fashion',
            'Fashion': 'Fashion',
            'Shoes': 'Fashion',
            'Health & Personal Care': 'Health & Personal Care',
            'Home & Kitchen': 'Home & Garden',
            'Books': 'Books',
            'Automotive': 'Automotive',
            'Grocery': 'Grocery & Gourmet Food',
            'Baby Products': 'Baby'
        };

        return categoryMapping[amazonCategory] || 'Others';
    }

    // Get trending products
    async getTrendingProducts(category = '', limit = 20) {
        const cacheKey = `trending_${category}_${limit}`;
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseUrls.amazonData}/deals`, {
                params: {
                    category: category,
                    country: 'US'
                },
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
                }
            });

            const products = this.formatAmazonProducts(response.data.data.deals || []);
            const limitedProducts = products.slice(0, limit);
            cache.set(cacheKey, limitedProducts);
            return limitedProducts;
        } catch (error) {
            console.error('Trending Products Error:', error.message);
            return [];
        }
    }

    // Get product by category
    async getProductsByCategory(category, page = 1, limit = 20) {
        const searchQueries = {
            'Electronics': 'electronics smartphone laptop',
            'Sports & Outdoors': 'sports fitness outdoor',
            'Fashion': 'clothing fashion apparel',
            'Health & Personal Care': 'health care personal',
            'Home & Garden': 'home kitchen garden',
            'Books': 'books',
            'Automotive': 'automotive car accessories',
            'Grocery & Gourmet Food': 'grocery food',
            'Baby': 'baby products'
        };

        const query = searchQueries[category] || category;
        return await this.searchAmazonProducts(query, '', page);
    }

    // Clear cache
    clearCache() {
        cache.flushAll();
    }

    // Get cache stats
    getCacheStats() {
        return cache.getStats();
    }
}

module.exports = new ExternalApiService();
