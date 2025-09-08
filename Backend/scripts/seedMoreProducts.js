const mongoose = require('mongoose');
const Product = require('../models/product/product.model');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const additionalProducts = [
  // Electronics - Smartphones
  {
    name: "iPhone 15 Pro Max",
    description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system",
    price: 134900,
    discountPrice: 129900,
    category: "Electronics",
    brand: "Apple",
    stock: 25,
    ratings: 4.8,
    numOfReviews: 1250,
    images: [
      { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop" },
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with S Pen, 200MP camera, and AI features",
    price: 124999,
    discountPrice: 119999,
    category: "Electronics",
    brand: "Samsung",
    stock: 30,
    ratings: 4.7,
    numOfReviews: 980,
    images: [
      { url: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop" },
      { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    description: "AI-powered photography, pure Android experience, and advanced computational features",
    price: 106999,
    discountPrice: 99999,
    category: "Electronics",
    brand: "Google",
    stock: 20,
    ratings: 4.6,
    numOfReviews: 750,
    images: [
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" }
    ]
  },

  // Electronics - Laptops
  {
    name: "MacBook Pro 16-inch M3 Max",
    description: "Professional laptop with M3 Max chip, 18-hour battery life, and Liquid Retina XDR display",
    price: 399900,
    discountPrice: 389900,
    category: "Electronics",
    brand: "Apple",
    stock: 15,
    ratings: 4.9,
    numOfReviews: 650,
    images: [
      { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
      { url: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Dell XPS 13 Plus",
    description: "Ultra-portable laptop with 12th Gen Intel Core processors and InfinityEdge display",
    price: 149999,
    discountPrice: 139999,
    category: "Electronics",
    brand: "Dell",
    stock: 22,
    ratings: 4.5,
    numOfReviews: 420,
    images: [
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G16",
    description: "Gaming laptop with RTX 4070, AMD Ryzen 9, and 240Hz display",
    price: 199999,
    discountPrice: 189999,
    category: "Electronics",
    brand: "ASUS",
    stock: 18,
    ratings: 4.7,
    numOfReviews: 380,
    images: [
      { url: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=400&fit=crop" }
    ]
  },

  // Fashion - Men's Clothing
  {
    name: "Premium Cotton Polo Shirt",
    description: "Classic fit polo shirt made from 100% premium cotton with modern styling",
    price: 2999,
    discountPrice: 2499,
    category: "Fashion",
    brand: "Ralph Lauren",
    stock: 50,
    ratings: 4.4,
    numOfReviews: 320,
    images: [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Slim Fit Denim Jeans",
    description: "Modern slim fit jeans with stretch comfort and premium denim construction",
    price: 4999,
    discountPrice: 3999,
    category: "Fashion",
    brand: "Levi's",
    stock: 40,
    ratings: 4.3,
    numOfReviews: 580,
    images: [
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Casual Button-Down Shirt",
    description: "Versatile button-down shirt perfect for both casual and semi-formal occasions",
    price: 3499,
    discountPrice: 2999,
    category: "Fashion",
    brand: "Tommy Hilfiger",
    stock: 35,
    ratings: 4.2,
    numOfReviews: 290,
    images: [
      { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop" }
    ]
  },

  // Fashion - Women's Clothing
  {
    name: "Floral Summer Dress",
    description: "Elegant floral print dress perfect for summer occasions with comfortable fit",
    price: 5999,
    discountPrice: 4999,
    category: "Fashion",
    brand: "Zara",
    stock: 30,
    ratings: 4.6,
    numOfReviews: 450,
    images: [
      { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "High-Waisted Skinny Jeans",
    description: "Flattering high-waisted skinny jeans with stretch fabric for all-day comfort",
    price: 4499,
    discountPrice: 3799,
    category: "Fashion",
    brand: "H&M",
    stock: 45,
    ratings: 4.1,
    numOfReviews: 680,
    images: [
      { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Silk Blouse",
    description: "Luxurious silk blouse with elegant draping and professional styling",
    price: 7999,
    discountPrice: 6999,
    category: "Fashion",
    brand: "Mango",
    stock: 25,
    ratings: 4.5,
    numOfReviews: 210,
    images: [
      { url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop" }
    ]
  },

  // Sports & Outdoors
  {
    name: "Professional Yoga Mat",
    description: "Non-slip yoga mat with superior grip and cushioning for all yoga practices",
    price: 2999,
    discountPrice: 2499,
    category: "Sports & Outdoors",
    brand: "Manduka",
    stock: 60,
    ratings: 4.7,
    numOfReviews: 890,
    images: [
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Adjustable Dumbbells Set",
    description: "Space-saving adjustable dumbbells with quick weight change system",
    price: 15999,
    discountPrice: 13999,
    category: "Sports & Outdoors",
    brand: "Bowflex",
    stock: 20,
    ratings: 4.8,
    numOfReviews: 340,
    images: [
      { url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with advanced cushioning and breathable mesh upper",
    price: 8999,
    discountPrice: 7499,
    category: "Sports & Outdoors",
    brand: "Nike",
    stock: 40,
    ratings: 4.6,
    numOfReviews: 1200,
    images: [
      { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop" }
    ]
  },

  // Home & Garden
  {
    name: "Smart Air Purifier",
    description: "HEPA air purifier with smart controls and real-time air quality monitoring",
    price: 24999,
    discountPrice: 21999,
    category: "Home & Garden",
    brand: "Dyson",
    stock: 15,
    ratings: 4.5,
    numOfReviews: 280,
    images: [
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 premium ceramic coffee mugs with elegant design and comfortable handles",
    price: 1999,
    discountPrice: 1599,
    category: "Home & Garden",
    brand: "Williams Sonoma",
    stock: 80,
    ratings: 4.3,
    numOfReviews: 450,
    images: [
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with multiple brightness levels and USB charging port",
    price: 4999,
    discountPrice: 3999,
    category: "Home & Garden",
    brand: "Philips",
    stock: 35,
    ratings: 4.4,
    numOfReviews: 320,
    images: [
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" }
    ]
  },

  // Health & Beauty
  {
    name: "Vitamin D3 Supplements",
    description: "High-potency Vitamin D3 supplements for bone health and immune support",
    price: 1299,
    discountPrice: 999,
    category: "Health & Beauty",
    brand: "Nature Made",
    stock: 100,
    ratings: 4.2,
    numOfReviews: 680,
    images: [
      { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Moisturizing Face Cream",
    description: "Hydrating face cream with hyaluronic acid and natural ingredients",
    price: 2999,
    discountPrice: 2499,
    category: "Health & Beauty",
    brand: "CeraVe",
    stock: 70,
    ratings: 4.6,
    numOfReviews: 890,
    images: [
      { url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Electric Toothbrush",
    description: "Rechargeable electric toothbrush with multiple cleaning modes and timer",
    price: 7999,
    discountPrice: 6999,
    category: "Health & Beauty",
    brand: "Oral-B",
    stock: 25,
    ratings: 4.7,
    numOfReviews: 540,
    images: [
      { url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop" }
    ]
  },

  // Books
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel",
    price: 599,
    discountPrice: 449,
    category: "Books",
    brand: "Jaico Publishing",
    stock: 150,
    ratings: 4.8,
    numOfReviews: 2300,
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "Atomic Habits",
    description: "An easy and proven way to build good habits and break bad ones by James Clear",
    price: 699,
    discountPrice: 524,
    category: "Books",
    brand: "Random House",
    stock: 200,
    ratings: 4.9,
    numOfReviews: 3200,
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop" }
    ]
  },
  {
    name: "JavaScript: The Definitive Guide",
    description: "Comprehensive guide to JavaScript programming for web developers",
    price: 3999,
    discountPrice: 3199,
    category: "Books",
    brand: "O'Reilly Media",
    stock: 50,
    ratings: 4.5,
    numOfReviews: 450,
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop" }
    ]
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    console.log('Starting to seed additional products...');
    
    // Add created timestamp and other required fields
    const productsWithDefaults = additionalProducts.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      variants: [],
      tags: [],
      features: []
    }));
    
    // Insert products
    const insertedProducts = await Product.insertMany(productsWithDefaults);
    
    console.log(`✅ Successfully added ${insertedProducts.length} new products to the database!`);
    
    // Display summary by category
    const categorySummary = {};
    insertedProducts.forEach(product => {
      categorySummary[product.category] = (categorySummary[product.category] || 0) + 1;
    });
    
    console.log('\n📊 Products added by category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the seeding script
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, additionalProducts };
