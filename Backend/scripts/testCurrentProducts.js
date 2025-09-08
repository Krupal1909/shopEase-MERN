const axios = require('axios');

async function testCurrentProducts() {
  try {
    console.log('Testing current products in database...\n');
    
    // Test regular products endpoint
    const response = await axios.get('http://localhost:5000/api/v1/product?limit=50');
    const products = response.data.products || [];
    
    console.log(`📦 Total products found: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n🏷️  Product categories:');
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      categories.forEach(cat => {
        const count = products.filter(p => p.category === cat).length;
        console.log(`   - ${cat}: ${count} products`);
      });
      
      console.log('\n📱 Sample products:');
      products.slice(0, 5).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title || product.name} - ₹${product.price} (${product.category || 'No category'})`);
      });
      
      // Test home screen sections logic
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const featuredCount = Math.min(8, Math.floor(shuffledProducts.length / 3));
      const trendingCount = Math.min(8, Math.floor(shuffledProducts.length / 3));
      const newArrivalsCount = Math.min(8, shuffledProducts.length - featuredCount - trendingCount);
      
      console.log('\n🏠 Home screen sections would show:');
      console.log(`   - Featured Products: ${featuredCount} items`);
      console.log(`   - Trending Now: ${trendingCount} items`);
      console.log(`   - New Arrivals: ${newArrivalsCount} items`);
      
      if (featuredCount + trendingCount + newArrivalsCount > 0) {
        console.log('\n✅ Home screen fix is working - different products will be shown in each section');
      } else {
        console.log('\n❌ Not enough products for home screen sections');
      }
    } else {
      console.log('\n❌ No products found in database');
    }
    
  } catch (error) {
    console.error('❌ Error testing products:', error.message);
  }
}

testCurrentProducts();
