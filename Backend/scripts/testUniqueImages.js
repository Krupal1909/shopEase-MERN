const mongoose = require('mongoose');
const Product = require('../models/product/product.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test function to create products with unique images
const testUniqueImages = async () => {
  try {
    console.log('Testing unique image selection...');
    
    // Create 5 sports products to test uniqueness
    const sportsProducts = [
      { name: 'Basketball Pro', category: 'Sports', price: 2500, brand: 'Nike', stock: 50 },
      { name: 'Tennis Racket Elite', category: 'Sports', price: 3500, brand: 'Wilson', stock: 30 },
      { name: 'Football Official', category: 'Sports', price: 1800, brand: 'Adidas', stock: 40 },
      { name: 'Running Shoes Max', category: 'Sports', price: 4500, brand: 'Nike', stock: 25 },
      { name: 'Yoga Mat Premium', category: 'Sports', price: 1200, brand: 'Reebok', stock: 60 }
    ];

    // Function to get unique random images for a category (updated algorithm)
    const getDefaultImages = (category, count = 3, productName = '') => {
      const defaultImages = {
        'Sports': [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1551524164-6cf2ac531400?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e4?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1506629905687-f2d3d2d3d2d3?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'
        ]
      };

      const categoryImages = defaultImages[category] || defaultImages['Sports'];
      const selectedImages = [];
      
      // Create a more unique seed based on product name, current time, and random values
      const seed = productName + Date.now() + Math.random() + category;
      let seedHash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        seedHash = ((seedHash << 5) - seedHash + char) & 0xffffffff;
      }
      
      // Make seed more unique by adding product name length and current milliseconds
      seedHash = Math.abs(seedHash + productName.length + (Date.now() % 10000));
      
      // Ensure we don't request more images than available
      const maxImages = Math.min(count, categoryImages.length);
      
      // Shuffle the available indices to get better randomness
      const availableIndices = Array.from({length: categoryImages.length}, (_, i) => i);
      
      // Fisher-Yates shuffle with our custom seed
      for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.abs(seedHash + i) % (i + 1);
        [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
      }
      
      // Take the first maxImages from shuffled array
      for (let i = 0; i < maxImages; i++) {
        const imageIndex = availableIndices[i];
        selectedImages.push({
          public_id: `default_${category.toLowerCase().replace(/\s+/g, '_')}_${seedHash}_${i}`,
          url: categoryImages[imageIndex]
        });
      }
      
      return selectedImages;
    };

    // Delete existing test products
    await Product.deleteMany({ name: { $in: sportsProducts.map(p => p.name) } });
    console.log('Cleaned up existing test products');

    // Create new products with unique images
    for (const productData of sportsProducts) {
      const images = getDefaultImages(productData.category, 3, productData.name);
      
      const product = await Product.create({
        ...productData,
        description: `High quality ${productData.name.toLowerCase()} for sports enthusiasts`,
        images,
        variants: [],
        tags: ['sports', 'fitness'],
        createdBy: new mongoose.Types.ObjectId() // Mock user ID
      });

      console.log(`\n✅ Created: ${product.name}`);
      console.log('Images:');
      product.images.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.url}`);
      });
    }

    // Verify uniqueness by checking all created products
    const createdProducts = await Product.find({ 
      name: { $in: sportsProducts.map(p => p.name) } 
    }).select('name images');

    console.log('\n🔍 Verifying image uniqueness...');
    const allImageUrls = [];
    
    createdProducts.forEach(product => {
      product.images.forEach(img => {
        allImageUrls.push(img.url);
      });
    });

    const uniqueUrls = [...new Set(allImageUrls)];
    console.log(`\nTotal images used: ${allImageUrls.length}`);
    console.log(`Unique images: ${uniqueUrls.length}`);
    console.log(`Duplicate images: ${allImageUrls.length - uniqueUrls.length}`);

    if (uniqueUrls.length === allImageUrls.length) {
      console.log('✅ SUCCESS: All images are unique!');
    } else {
      console.log('⚠️  WARNING: Some images are duplicated');
    }

  } catch (error) {
    console.error('Error testing unique images:', error);
  } finally {
    mongoose.connection.close();
  }
};

testUniqueImages();
