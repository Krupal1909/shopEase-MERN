const mongoose = require('mongoose');
const Product = require('../models/product/product.model');
require('dotenv').config();

// Connect to MongoDB using the same connection as the running server
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected for seeding');
    } else {
      console.log('Using existing MongoDB connection');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleProducts = [
  // Electronics
  {
    name: "iPhone 15 Pro Max",
    description: "Latest Apple iPhone with A17 Pro chip and titanium design",
    price: 134900,
    category: "Electronics",
    brand: "Apple",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop"],
    specifications: { storage: "256GB", color: "Natural Titanium" },
    featured: true,
    rating: 4.8,
    numReviews: 150
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with S Pen and AI features",
    price: 129999,
    category: "Electronics",
    brand: "Samsung",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop"],
    specifications: { storage: "512GB", color: "Titanium Black" },
    rating: 4.7,
    numReviews: 120
  },
  {
    name: "MacBook Pro 16-inch M3",
    description: "Powerful laptop for professionals with M3 chip",
    price: 249900,
    category: "Electronics",
    brand: "Apple",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop"],
    specifications: { ram: "32GB", storage: "1TB SSD" },
    featured: true,
    rating: 4.9,
    numReviews: 89
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling wireless headphones",
    price: 29990,
    category: "Electronics",
    brand: "Sony",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop"],
    specifications: { battery: "30 hours", connectivity: "Bluetooth 5.2" },
    rating: 4.6,
    numReviews: 200
  },
  {
    name: "Dell XPS 13",
    description: "Ultra-portable laptop with stunning display",
    price: 89999,
    category: "Electronics",
    brand: "Dell",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop"],
    specifications: { ram: "16GB", storage: "512GB SSD" },
    rating: 4.5,
    numReviews: 95
  },

  // Fashion
  {
    name: "Levi's 501 Original Jeans",
    description: "Classic straight-leg jeans with authentic fit",
    price: 4999,
    category: "Fashion",
    brand: "Levi's",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop"],
    specifications: { fit: "Straight", material: "100% Cotton" },
    featured: true,
    rating: 4.4,
    numReviews: 180
  },
  {
    name: "Nike Air Force 1",
    description: "Iconic basketball shoes with classic white design",
    price: 7999,
    category: "Fashion",
    brand: "Nike",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop"],
    specifications: { size: "US 9", color: "White" },
    rating: 4.7,
    numReviews: 250
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with boost technology",
    price: 16999,
    category: "Fashion",
    brand: "Adidas",
    stock: 28,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"],
    specifications: { technology: "Boost", purpose: "Running" },
    rating: 4.8,
    numReviews: 140
  },
  {
    name: "H&M Cotton T-Shirt",
    description: "Comfortable cotton t-shirt in various colors",
    price: 999,
    category: "Fashion",
    brand: "H&M",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"],
    specifications: { material: "100% Cotton", fit: "Regular" },
    rating: 4.2,
    numReviews: 320
  },

  // Sports
  {
    name: "Yoga Mat Premium",
    description: "Non-slip yoga mat for all types of yoga practice",
    price: 2499,
    category: "Sports",
    brand: "YogaLife",
    stock: 60,
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop"],
    specifications: { thickness: "6mm", material: "TPE" },
    featured: true,
    rating: 4.5,
    numReviews: 110
  },
  {
    name: "Adjustable Dumbbells Set",
    description: "Space-saving adjustable dumbbells for home workouts",
    price: 12999,
    category: "Sports",
    brand: "FitPro",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop"],
    specifications: { weight: "5-50 lbs", material: "Steel" },
    rating: 4.6,
    numReviews: 75
  },
  {
    name: "Tennis Racket Pro",
    description: "Professional tennis racket for advanced players",
    price: 8999,
    category: "Sports",
    brand: "Wilson",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop"],
    specifications: { weight: "300g", string: "Included" },
    rating: 4.7,
    numReviews: 60
  },

  // Home
  {
    name: "Smart Coffee Maker",
    description: "WiFi-enabled coffee maker with app control",
    price: 8999,
    category: "Home",
    brand: "BrewMaster",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop"],
    specifications: { capacity: "12 cups", connectivity: "WiFi" },
    rating: 4.3,
    numReviews: 85
  },
  {
    name: "Air Purifier HEPA",
    description: "Advanced air purifier with HEPA filtration",
    price: 15999,
    category: "Home",
    brand: "PureAir",
    stock: 18,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
    specifications: { coverage: "500 sq ft", filter: "HEPA H13" },
    featured: true,
    rating: 4.5,
    numReviews: 95
  },
  {
    name: "Smart LED Bulbs (4-Pack)",
    description: "Color-changing smart bulbs with voice control",
    price: 3999,
    category: "Home",
    brand: "SmartLight",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
    specifications: { connectivity: "WiFi", colors: "16 million" },
    rating: 4.4,
    numReviews: 150
  },

  // Health
  {
    name: "Multivitamin Tablets",
    description: "Complete daily nutrition with essential vitamins",
    price: 1299,
    category: "Health",
    brand: "HealthPlus",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop"],
    specifications: { count: "60 tablets", type: "Daily supplement" },
    rating: 4.3,
    numReviews: 200
  },
  {
    name: "Digital Blood Pressure Monitor",
    description: "Accurate home blood pressure monitoring device",
    price: 3499,
    category: "Health",
    brand: "MediCare",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop"],
    specifications: { accuracy: "±3mmHg", memory: "120 readings" },
    rating: 4.6,
    numReviews: 80
  },

  // Books
  {
    name: "The Psychology of Programming",
    description: "Essential book for understanding software development mindset",
    price: 899,
    category: "Books",
    brand: "TechBooks",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop"],
    specifications: { pages: "320", author: "Gerald Weinberg" },
    rating: 4.7,
    numReviews: 125
  },
  {
    name: "Cooking Masterclass Cookbook",
    description: "Professional cooking techniques for home chefs",
    price: 1599,
    category: "Books",
    brand: "CulinaryArts",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop"],
    specifications: { pages: "450", recipes: "200+" },
    rating: 4.8,
    numReviews: 90
  }
];

async function seedProducts() {
  try {
    await connectDB();
    
    console.log('Starting to seed products...');
    
    // Clear existing products (optional)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const productData of sampleProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          console.log(`⚠️  Product already exists: ${productData.name}`);
          continue;
        }
        
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Added: ${productData.name}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to add: ${productData.name}`);
        console.log(`   Error: ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed to add: ${failCount} products`);
    console.log(`📦 Total products processed: ${sampleProducts.length}`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    // Don't close connection if it's shared with the running server
    // mongoose.connection.close();
  }
}

// Run the seeding
seedProducts();
