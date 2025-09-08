const mongoose = require('mongoose');
const dotenv = require('dotenv');
const externalApiService = require('../services/externalApiService');
const productAggregatorService = require('../services/productAggregatorService');

// Load environment variables
dotenv.config();

// Test configuration
const TEST_CONFIG = {
  categories: ['Electronics', 'Fashion', 'Sports & Outdoors'],
  searchQueries: ['smartphone', 'laptop', 'headphones'],
  testLimit: 5
};

async function testExternalApiService() {
  console.log('🔍 Testing External API Service...\n');

  try {
    // Test 1: Search Amazon Products
    console.log('1. Testing Amazon Product Search:');
    for (const query of TEST_CONFIG.searchQueries) {
      console.log(`   Searching for: "${query}"`);
      const results = await externalApiService.searchAmazonProducts(query, '', 1);
      console.log(`   ✅ Found ${results.length} products`);
      
      if (results.length > 0) {
        const product = results[0];
        console.log(`   📦 Sample: ${product.title}`);
        console.log(`   💰 Price: $${product.price}`);
        console.log(`   ⭐ Rating: ${product.rating}/5 (${product.reviewCount} reviews)`);
        console.log(`   🖼️  Images: ${product.images.length}`);
      }
      console.log('');
    }

    // Test 2: Get Trending Products
    console.log('2. Testing Trending Products:');
    const trending = await externalApiService.getTrendingProducts('', TEST_CONFIG.testLimit);
    console.log(`   ✅ Found ${trending.length} trending products`);
    
    if (trending.length > 0) {
      trending.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} - $${product.price}`);
      });
    }
    console.log('');

    // Test 3: Get Products by Category
    console.log('3. Testing Category-based Products:');
    for (const category of TEST_CONFIG.categories) {
      console.log(`   Category: ${category}`);
      const categoryProducts = await externalApiService.getProductsByCategory(category, 1, 3);
      console.log(`   ✅ Found ${categoryProducts.length} products`);
      
      if (categoryProducts.length > 0) {
        categoryProducts.forEach((product, index) => {
          console.log(`     ${index + 1}. ${product.title} - $${product.price}`);
        });
      }
      console.log('');
    }

    console.log('✅ External API Service tests completed successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ External API Service test failed:', error.message);
    return false;
  }
}

async function testProductAggregatorService() {
  console.log('🔄 Testing Product Aggregator Service...\n');

  try {
    // Test 1: Aggregated Product Search
    console.log('1. Testing Aggregated Product Search:');
    const searchResults = await productAggregatorService.getAggregatedProducts({
      query: 'smartphone',
      limit: 5,
      sources: ['amazon']
    });
    
    console.log(`   ✅ Total products: ${searchResults.totalCount}`);
    console.log(`   📊 Sources: ${Object.keys(searchResults.sources).join(', ')}`);
    
    Object.entries(searchResults.sources).forEach(([source, info]) => {
      console.log(`   ${source}: ${info.count} products (${info.status})`);
    });

    if (searchResults.products.length > 0) {
      console.log('   📦 Sample products:');
      searchResults.products.slice(0, 3).forEach((product, index) => {
        console.log(`     ${index + 1}. ${product.title} (${product.source}) - $${product.price}`);
      });
    }
    console.log('');

    // Test 2: Category Aggregation
    console.log('2. Testing Category Aggregation:');
    const categoryResults = await productAggregatorService.getAggregatedProducts({
      category: 'Electronics',
      limit: 5,
      sources: ['amazon']
    });
    
    console.log(`   ✅ Electronics products: ${categoryResults.totalCount}`);
    console.log(`   📊 Sources: ${Object.keys(categoryResults.sources).join(', ')}`);
    console.log('');

    // Test 3: Trending Products
    console.log('3. Testing Trending Products Aggregation:');
    const trendingResults = await productAggregatorService.getTrendingProducts('', 5);
    console.log(`   ✅ Trending products: ${trendingResults.products.length}`);
    console.log(`   📊 Sources: ${Object.keys(trendingResults.sources).join(', ')}`);
    console.log('');

    // Test 4: Cache Statistics
    console.log('4. Testing Cache Statistics:');
    const stats = productAggregatorService.getStats();
    console.log(`   📈 Cache stats:`, stats.cache);
    console.log('');

    console.log('✅ Product Aggregator Service tests completed successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Product Aggregator Service test failed:', error.message);
    return false;
  }
}

async function testImageVariants() {
  console.log('🖼️  Testing Image Variants...\n');

  try {
    // Test product with multiple images
    const products = await externalApiService.searchAmazonProducts('smartphone', '', 1);
    
    if (products.length > 0) {
      const product = products[0];
      console.log(`📱 Testing product: ${product.title}`);
      console.log(`🖼️  Total images: ${product.images.length}`);
      
      product.images.forEach((image, index) => {
        console.log(`   ${index + 1}. Type: ${image.type}, Variant: ${image.variant || 'default'}`);
        console.log(`      URL: ${image.url.substring(0, 50)}...`);
      });

      if (product.variants.length > 0) {
        console.log(`🔄 Product variants: ${product.variants.length}`);
        product.variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.name} - $${variant.price}`);
          if (variant.images && variant.images.length > 0) {
            console.log(`      Images: ${variant.images.length}`);
          }
        });
      }
    }

    console.log('✅ Image variants test completed successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Image variants test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Real-Time Product Integration Tests\n');
  console.log('=' .repeat(60));
  
  // Check if RAPIDAPI_KEY is configured
  if (!process.env.RAPIDAPI_KEY) {
    console.log('⚠️  WARNING: RAPIDAPI_KEY not found in environment variables');
    console.log('   External API tests will use mock data or may fail');
    console.log('   Please add RAPIDAPI_KEY to your .env file\n');
  }

  const testResults = [];

  // Run all tests
  testResults.push(await testExternalApiService());
  testResults.push(await testProductAggregatorService());
  testResults.push(await testImageVariants());

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Real-time product integration is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the error messages above.');
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Add your RapidAPI key to .env file for full functionality');
  console.log('2. Test the frontend integration');
  console.log('3. Configure additional external APIs if needed');
  console.log('4. Monitor API usage and caching performance');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✅ Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testExternalApiService,
  testProductAggregatorService,
  testImageVariants,
  runAllTests
};
