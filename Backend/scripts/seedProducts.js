const mongoose = require('mongoose');
const Product = require('../models/product/product.model');
const User = require('../models/auth/user.model');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://krupalpatel3571:Krupal%231909@cluster0.xpeoqci.mongodb.net/chat-mern-stack";
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleProducts = [
  // Electronics Category
  {
    name: "iPhone 14 Pro Max",
    description: "Latest Apple iPhone with A16 Bionic chip, 48MP camera system, and Dynamic Island. Available in multiple colors with premium build quality.",
    price: 89999,
    category: "Electronics",
    brand: "Apple",
    stock: 50,
    images: [
      { public_id: "iphone_14_pro_1", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center" },
      { public_id: "iphone_14_pro_2", url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["smartphone", "apple", "5g", "premium"],
    variants: [
      { color: "Deep Purple", storage: "128GB", price: 89999 },
      { color: "Space Black", storage: "256GB", price: 99999 }
    ]
  },
  {
    name: "MacBook Pro 14-inch",
    description: "Powerful laptop with M2 Pro chip, stunning Liquid Retina XDR display, and all-day battery life. Perfect for professionals and creators.",
    price: 199999,
    category: "Electronics",
    brand: "Apple",
    stock: 25,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["laptop", "apple", "m2", "professional"],
    variants: [
      { color: "Space Gray", storage: "512GB", price: 199999 },
      { color: "Silver", storage: "1TB", price: 249999 }
    ]
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise canceling wireless headphones with exceptional sound quality and 30-hour battery life.",
    price: 29999,
    category: "Electronics",
    brand: "Sony",
    stock: 75,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["headphones", "wireless", "noise-canceling", "sony"],
    variants: [
      { color: "Black", price: 29999 },
      { color: "Silver", price: 29999 }
    ]
  },

  // Fashion Category
  {
    name: "Premium Cotton T-Shirt",
    description: "Comfortable 100% organic cotton t-shirt with modern fit. Perfect for casual wear and everyday comfort.",
    price: 1299,
    category: "Fashion",
    brand: "StyleCraft",
    stock: 100,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["t-shirt", "cotton", "casual", "organic"],
    variants: [
      { color: "White", size: "M", price: 1299 },
      { color: "Black", size: "L", price: 1299 },
      { color: "Navy", size: "XL", price: 1299 }
    ]
  },
  {
    name: "Designer Denim Jeans",
    description: "Premium quality denim jeans with perfect fit and durability. Classic design that never goes out of style.",
    price: 3499,
    category: "Fashion",
    brand: "DenimCo",
    stock: 80,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["jeans", "denim", "casual", "premium"],
    variants: [
      { color: "Dark Blue", size: "32", price: 3499 },
      { color: "Light Blue", size: "34", price: 3499 }
    ]
  },
  {
    name: "Running Sneakers",
    description: "Lightweight running shoes with advanced cushioning technology and breathable mesh upper for maximum comfort.",
    price: 5999,
    category: "Fashion",
    brand: "SportMax",
    stock: 60,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["shoes", "running", "sports", "comfortable"],
    variants: [
      { color: "White/Blue", size: "9", price: 5999 },
      { color: "Black/Red", size: "10", price: 5999 }
    ]
  },

  // Sports & Outdoors Category
  {
    name: "Professional Yoga Mat",
    description: "High-quality non-slip yoga mat with excellent grip and cushioning. Perfect for yoga, pilates, and fitness workouts.",
    price: 2499,
    category: "Sports & Outdoors",
    brand: "YogaPro",
    stock: 90,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["yoga", "fitness", "mat", "exercise"],
    variants: [
      { color: "Purple", thickness: "6mm", price: 2499 },
      { color: "Blue", thickness: "8mm", price: 2799 }
    ]
  },
  {
    name: "Adjustable Dumbbells Set",
    description: "Space-saving adjustable dumbbells with quick-change weight system. Perfect for home gym and strength training.",
    price: 12999,
    category: "Sports & Outdoors",
    brand: "FitGear",
    stock: 35,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["dumbbells", "fitness", "strength", "home-gym"],
    variants: [
      { weight: "5-25kg", price: 12999 },
      { weight: "5-40kg", price: 18999 }
    ]
  },

  // Home Category
  {
    name: "Modern Coffee Table",
    description: "Elegant wooden coffee table with minimalist design. Perfect centerpiece for modern living rooms.",
    price: 15999,
    category: "Home",
    brand: "HomeStyle",
    stock: 20,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["furniture", "coffee-table", "wooden", "modern"],
    variants: [
      { material: "Oak Wood", size: "120x60cm", price: 15999 },
      { material: "Walnut Wood", size: "140x70cm", price: 18999 }
    ]
  },
  {
    name: "Smart Air Fryer",
    description: "Digital air fryer with multiple cooking presets and app connectivity. Healthy cooking made easy.",
    price: 8999,
    category: "Home",
    brand: "KitchenPro",
    stock: 45,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["appliance", "air-fryer", "smart", "kitchen"],
    variants: [
      { capacity: "3.5L", price: 8999 },
      { capacity: "5.5L", price: 11999 }
    ]
  },

  // Health Category
  {
    name: "Multivitamin Supplements",
    description: "Complete daily multivitamin with essential vitamins and minerals for overall health and wellness.",
    price: 1499,
    category: "Health",
    brand: "WellnessPlus",
    stock: 200,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["supplements", "vitamins", "health", "wellness"],
    variants: [
      { type: "Men's Formula", count: "60 tablets", price: 1499 },
      { type: "Women's Formula", count: "60 tablets", price: 1599 }
    ]
  },
  {
    name: "Digital Blood Pressure Monitor",
    description: "Accurate and easy-to-use digital blood pressure monitor with large display and memory function.",
    price: 3999,
    category: "Health",
    brand: "MedTech",
    stock: 40,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["medical", "blood-pressure", "monitor", "health"],
    variants: [
      { type: "Standard Cuff", price: 3999 },
      { type: "Large Cuff", price: 4499 }
    ]
  },

  // Books Category
  {
    name: "The Psychology of Money",
    description: "Bestselling book about the psychology behind financial decisions and wealth building strategies.",
    price: 599,
    category: "Books",
    brand: "PublishHouse",
    stock: 150,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["book", "finance", "psychology", "bestseller"],
    variants: [
      { format: "Paperback", price: 599 },
      { format: "Hardcover", price: 899 }
    ]
  },
  {
    name: "Complete Web Development Guide",
    description: "Comprehensive guide to modern web development covering HTML, CSS, JavaScript, and popular frameworks.",
    price: 1299,
    category: "Books",
    brand: "TechBooks",
    stock: 80,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["book", "programming", "web-development", "technical"],
    variants: [
      { format: "Paperback", edition: "2024", price: 1299 },
      { format: "eBook", edition: "2024", price: 899 }
    ]
  },

  // Automotive Category
  {
    name: "Car Phone Mount",
    description: "Universal smartphone holder for car dashboard with 360-degree rotation and secure grip.",
    price: 899,
    category: "Automotive",
    brand: "AutoTech",
    stock: 120,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["car-accessory", "phone-mount", "universal", "dashboard"],
    variants: [
      { type: "Dashboard Mount", price: 899 },
      { type: "Windshield Mount", price: 1099 }
    ]
  },
  {
    name: "Car Tire Pressure Gauge",
    description: "Digital tire pressure gauge with LED display and emergency flashlight. Essential car maintenance tool.",
    price: 1599,
    category: "Automotive",
    brand: "CarCare",
    stock: 85,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["car-tool", "tire-pressure", "digital", "maintenance"],
    variants: [
      { type: "Basic Digital", price: 1599 },
      { type: "Pro with Flashlight", price: 2199 }
    ]
  },

  // Grocery Category
  {
    name: "Organic Basmati Rice",
    description: "Premium quality organic basmati rice with long grains and aromatic fragrance. Perfect for biryanis and pulao.",
    price: 299,
    category: "Grocery",
    brand: "OrganicFarms",
    stock: 500,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["rice", "organic", "basmati", "grocery"],
    variants: [
      { weight: "1kg", price: 299 },
      { weight: "5kg", price: 1399 }
    ]
  },
  {
    name: "Cold Pressed Olive Oil",
    description: "Extra virgin cold pressed olive oil with rich flavor and health benefits. Perfect for cooking and salads.",
    price: 899,
    category: "Grocery",
    brand: "PureOil",
    stock: 200,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["oil", "olive", "cold-pressed", "healthy"],
    variants: [
      { size: "500ml", price: 899 },
      { size: "1L", price: 1599 }
    ]
  },

  // Baby Category
  {
    name: "Baby Onesie Set",
    description: "Soft cotton onesies for babies with cute prints. Comfortable and easy to wear for everyday use.",
    price: 799,
    category: "Baby",
    brand: "BabyLove",
    stock: 150,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["baby-clothes", "onesie", "cotton", "comfortable"],
    variants: [
      { size: "0-3 months", color: "Pink", price: 799 },
      { size: "3-6 months", color: "Blue", price: 799 }
    ]
  },
  {
    name: "Baby Feeding Bottle",
    description: "BPA-free baby feeding bottle with anti-colic system and easy-grip design. Safe for newborns.",
    price: 599,
    category: "Baby",
    brand: "SafeFeed",
    stock: 100,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["baby-bottle", "feeding", "bpa-free", "anti-colic"],
    variants: [
      { capacity: "150ml", price: 599 },
      { capacity: "250ml", price: 799 }
    ]
  },

  // Beauty Category
  {
    name: "Vitamin C Serum",
    description: "Anti-aging vitamin C serum with hyaluronic acid for bright, youthful skin. Suitable for all skin types.",
    price: 1999,
    category: "Beauty",
    brand: "GlowSkin",
    stock: 80,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["skincare", "serum", "vitamin-c", "anti-aging"],
    variants: [
      { size: "30ml", price: 1999 },
      { size: "60ml", price: 3499 }
    ]
  },
  {
    name: "Matte Lipstick Set",
    description: "Long-lasting matte lipstick collection with 6 popular shades. Highly pigmented and comfortable wear.",
    price: 2499,
    category: "Beauty",
    brand: "ColorPop",
    stock: 60,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["makeup", "lipstick", "matte", "long-lasting"],
    variants: [
      { shades: "Nude Collection", count: "6 pieces", price: 2499 },
      { shades: "Bold Collection", count: "6 pieces", price: 2499 }
    ]
  },

  // Toys Category
  {
    name: "Educational Building Blocks",
    description: "Colorful building blocks set for children to develop creativity and motor skills. Safe and non-toxic materials.",
    price: 1599,
    category: "Toys",
    brand: "PlaySmart",
    stock: 90,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["toys", "educational", "building-blocks", "kids"],
    variants: [
      { pieces: "50 blocks", age: "3+", price: 1599 },
      { pieces: "100 blocks", age: "5+", price: 2499 }
    ]
  },
  {
    name: "Remote Control Car",
    description: "High-speed remote control car with rechargeable battery and durable design. Perfect for outdoor fun.",
    price: 3999,
    category: "Toys",
    brand: "SpeedToys",
    stock: 45,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["toys", "remote-control", "car", "outdoor"],
    variants: [
      { type: "Racing Car", speed: "25km/h", price: 3999 },
      { type: "Off-road Truck", speed: "20km/h", price: 4499 }
    ]
  },

  // Garden Category
  {
    name: "Organic Vegetable Seeds Kit",
    description: "Complete starter kit with organic seeds for tomatoes, carrots, lettuce, and herbs. Perfect for home gardening.",
    price: 899,
    category: "Garden",
    brand: "GreenThumb",
    stock: 120,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["seeds", "organic", "vegetables", "gardening"],
    variants: [
      { type: "Starter Kit", varieties: "8 types", price: 899 },
      { type: "Premium Kit", varieties: "15 types", price: 1599 }
    ]
  },
  {
    name: "Garden Tool Set",
    description: "Essential gardening tools including trowel, pruner, weeder, and cultivator. Durable stainless steel construction.",
    price: 2499,
    category: "Garden",
    brand: "GardenPro",
    stock: 70,
    images: [
      { public_id: null, url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&crop=center" },
      { public_id: null, url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop&crop=center" }
    ],
    tags: ["garden-tools", "stainless-steel", "durable", "set"],
    variants: [
      { pieces: "4 tools", price: 2499 },
      { pieces: "8 tools", price: 3999 }
    ]
  }
];

const seedProducts = async () => {
  try {
    console.log('🌱 Starting product seeding...');
    
    // Find or create an admin user for createdBy field
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // Create a default admin user if none exists
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@system.com',
        password: 'tempPassword123',
        role: 'admin',
        isVerified: true
      });
      console.log('📝 Created system admin user for product creation');
    }
    
    // Add createdBy field and fix image public_ids for all products
    const productsWithCreatedBy = sampleProducts.map((product, index) => ({
      ...product,
      createdBy: adminUser._id,
      images: product.images.map((img, imgIndex) => ({
        ...img,
        public_id: `${product.name.toLowerCase().replace(/\s+/g, '_')}_${imgIndex + 1}`
      }))
    }));
    
    // Clear existing products (optional - remove this line if you want to keep existing products)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');
    
    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithCreatedBy);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products`);
    
    // Log category distribution
    const categoryCount = {};
    insertedProducts.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    
    console.log('\n📊 Products by category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n🎉 Product seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedProducts();
