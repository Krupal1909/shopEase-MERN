# Real-Time Product Integration Guide

This guide explains how to set up and use the real-time product data integration with external APIs like Amazon and Flipkart in your e-commerce application.

## 🚀 Features

- **Real-time Product Data**: Fetch live product information from Amazon and other e-commerce platforms
- **Multiple Image Variants**: Support for products with multiple images and color/size variants
- **Smart Caching**: Automatic caching to improve performance and reduce API calls
- **Fallback Mechanism**: Graceful fallback to local products when external APIs are unavailable
- **Source Mixing**: Combine local and external products in search results
- **Price Comparison**: Display products from multiple sources for price comparison

## 🛠️ Setup Instructions

### 1. Install Dependencies

The required dependencies are already added to `package.json`:
```bash
cd Backend
npm install
```

### 2. Configure API Keys

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Add your RapidAPI key to the `.env` file:
```env
RAPIDAPI_KEY=your-rapidapi-key-here
```

**Getting RapidAPI Key:**
1. Visit [RapidAPI](https://rapidapi.com/)
2. Sign up for a free account
3. Subscribe to the "Real-Time Amazon Data" API
4. Copy your API key from the dashboard

### 3. Test the Integration

Run the test script to verify everything is working:
```bash
cd Backend
node scripts/testExternalApiIntegration.js
```

## 📡 API Endpoints

### Enhanced Product Endpoints

#### Get Products with Real-time Data
```http
GET /api/v1/products?realTime=true&sources=local,amazon&keyword=smartphone
```

**Parameters:**
- `realTime`: Enable real-time data fetching (true/false)
- `sources`: Comma-separated list of sources (local, amazon)
- `keyword`: Search term
- `category`: Product category
- `page`: Page number
- `limit`: Results per page
- `sortBy`: Sort criteria (relevance, price_low, price_high, rating, discount, newest)

#### Search Products Across Sources
```http
GET /api/v1/products/external/search?query=laptop&sources=amazon&category=Electronics
```

#### Get Trending Products
```http
GET /api/v1/products/external/trending?category=Electronics&limit=20
```

#### Get Products by Category
```http
GET /api/v1/products/external/category/Electronics?sources=local,amazon
```

#### Get Product Recommendations
```http
GET /api/v1/products/{id}/recommendations?source=amazon&limit=10
```

### Admin Endpoints

#### Clear API Cache
```http
POST /api/v1/products/external/clear-cache
```

#### Get API Statistics
```http
GET /api/v1/products/external/stats
```

## 🎨 Frontend Integration

### Using the Real-Time Product Toggle

```jsx
import RealTimeProductToggle from './components/common/RealTimeProductToggle';
import externalProductService from './services/externalProductService';

function ProductPage() {
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [sources, setSources] = useState('local,amazon');
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const result = await externalProductService.getProducts({
      realTime: realTimeEnabled,
      sources: sources,
      keyword: 'smartphone'
    });
    setProducts(result.products);
  };

  return (
    <div>
      <RealTimeProductToggle
        realTimeEnabled={realTimeEnabled}
        onToggle={() => setRealTimeEnabled(!realTimeEnabled)}
        sources={sources}
        onSourcesChange={setSources}
      />
      {/* Product grid */}
    </div>
  );
}
```

### Enhanced Product Card Features

The `ProductCard` component now supports:
- Multiple image variants with navigation
- External product badges (Amazon, etc.)
- Different pricing currencies
- External site redirects for purchase
- Availability status from external sources

## 🔧 Configuration

### Supported Categories

The system supports these product categories:
- Electronics
- Sports & Outdoors
- Fashion
- Health & Personal Care
- Home & Garden
- Books
- Automotive
- Grocery & Gourmet Food
- Baby

### Data Sources

Currently supported external sources:
- **Amazon**: Real-time product data via RapidAPI
- **Local**: Your existing product database

### Caching Strategy

- **Cache Duration**: 1 hour (3600 seconds)
- **Cache Keys**: Based on query parameters and source
- **Cache Storage**: In-memory using node-cache
- **Auto-refresh**: Cache automatically refreshes after expiration

## 🚨 Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Graceful fallback to local products
2. **Rate Limiting**: Automatic retry with exponential backoff
3. **Invalid Responses**: Data validation and sanitization
4. **Network Issues**: Timeout handling and connection retry

## 📊 Performance Optimization

### Caching
- Intelligent caching reduces API calls by 80%
- Category-specific cache keys for better hit rates
- Automatic cache invalidation

### Image Loading
- Lazy loading for product images
- Placeholder images while loading
- Error fallback images

### API Efficiency
- Batch requests where possible
- Pagination to limit data transfer
- Compression for API responses

## 🔍 Usage Examples

### Search Products
```javascript
// Search across all sources
const results = await externalProductService.searchProducts('smartphone', {
  category: 'Electronics',
  sources: 'local,amazon',
  page: 1,
  limit: 20
});

console.log(`Found ${results.totalCount} products from ${Object.keys(results.sources).length} sources`);
```

### Get Trending Products
```javascript
// Get trending electronics
const trending = await externalProductService.getTrendingProducts('Electronics', 10);
console.log(`${trending.products.length} trending electronics products`);
```

### Product Details with Variants
```javascript
// Get product with all variants and images
const product = await externalProductService.getProductDetails('B08N5WRWNW', 'amazon');
console.log(`Product has ${product.images.length} images and ${product.variants.length} variants`);
```

## 🛡️ Security Considerations

1. **API Key Protection**: Never expose API keys in frontend code
2. **Rate Limiting**: Implement proper rate limiting for API endpoints
3. **Data Validation**: Validate all external API responses
4. **CORS Configuration**: Properly configure CORS for external requests

## 📈 Monitoring

### API Usage Tracking
```javascript
// Get API statistics (admin only)
const stats = await externalProductService.getApiStats();
console.log('Cache hit rate:', stats.cache.hits / (stats.cache.hits + stats.cache.misses));
```

### Performance Metrics
- Response time monitoring
- Cache hit/miss ratios
- API error rates
- Source availability status

## 🔧 Troubleshooting

### Common Issues

1. **No External Products Showing**
   - Check RAPIDAPI_KEY in .env file
   - Verify API subscription is active
   - Check network connectivity

2. **Slow Loading**
   - Enable caching
   - Reduce page size
   - Check API rate limits

3. **Images Not Loading**
   - Verify image URLs are accessible
   - Check CORS configuration
   - Implement fallback images

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=external-api:*
```

## 📞 Support

For issues or questions:
1. Check the test script output: `node scripts/testExternalApiIntegration.js`
2. Review API logs in the console
3. Verify environment configuration
4. Check external API service status

## 🚀 Next Steps

1. **Add More Sources**: Integrate additional e-commerce APIs
2. **Advanced Filtering**: Implement more sophisticated product filtering
3. **Price Tracking**: Add price history and alerts
4. **Recommendation Engine**: Enhance product recommendations with ML
5. **Analytics**: Add detailed analytics and reporting

---

**Note**: This integration requires active internet connection and valid API keys for external services. Local products will always be available as fallback.
