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

// Product templates for each category
const productTemplates = {
  'Electronics': [
    { name: 'Smartphone', basePrice: 25000, brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi'], tags: ['smartphone', 'mobile', '5g'] },
    { name: 'Laptop', basePrice: 50000, brands: ['Apple', 'Dell', 'HP', 'Lenovo'], tags: ['laptop', 'computer', 'portable'] },
    { name: 'Headphones', basePrice: 5000, brands: ['Sony', 'Bose', 'JBL', 'Audio-Technica'], tags: ['headphones', 'audio', 'wireless'] },
    { name: 'Smart Watch', basePrice: 15000, brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit'], tags: ['smartwatch', 'fitness', 'wearable'] },
    { name: 'Tablet', basePrice: 30000, brands: ['Apple', 'Samsung', 'Lenovo', 'Amazon'], tags: ['tablet', 'portable', 'touchscreen'] }
  ],
  'Sports': [
    { name: 'Yoga Mat', basePrice: 2000, brands: ['Manduka', 'Liforme', 'Gaiam', 'Jade'], tags: ['yoga', 'fitness', 'exercise'] },
    { name: 'Dumbbells', basePrice: 3000, brands: ['Bowflex', 'PowerBlock', 'CAP', 'Yes4All'], tags: ['weights', 'strength', 'fitness'] },
    { name: 'Running Shoes', basePrice: 8000, brands: ['Nike', 'Adidas', 'Asics', 'New Balance'], tags: ['running', 'shoes', 'athletic'] },
    { name: 'Tennis Racket', basePrice: 12000, brands: ['Wilson', 'Babolat', 'Head', 'Prince'], tags: ['tennis', 'racket', 'sports'] },
    { name: 'Basketball', basePrice: 2500, brands: ['Spalding', 'Wilson', 'Nike', 'Molten'], tags: ['basketball', 'sports', 'outdoor'] }
  ],
  'Fashion': [
    { name: 'T-Shirt', basePrice: 1500, brands: ['Nike', 'Adidas', 'H&M', 'Zara'], tags: ['clothing', 'casual', 'cotton'] },
    { name: 'Jeans', basePrice: 4000, brands: ['Levi\'s', 'Wrangler', 'Lee', 'Diesel'], tags: ['denim', 'pants', 'casual'] },
    { name: 'Sneakers', basePrice: 6000, brands: ['Nike', 'Adidas', 'Converse', 'Vans'], tags: ['shoes', 'casual', 'comfortable'] },
    { name: 'Dress', basePrice: 3500, brands: ['Zara', 'H&M', 'Forever 21', 'Mango'], tags: ['dress', 'women', 'fashion'] },
    { name: 'Jacket', basePrice: 8000, brands: ['North Face', 'Columbia', 'Patagonia', 'Uniqlo'], tags: ['outerwear', 'jacket', 'weather'] }
  ],
  'Health': [
    { name: 'Multivitamins', basePrice: 1200, brands: ['Centrum', 'Nature Made', 'Garden of Life', 'Rainbow Light'], tags: ['vitamins', 'supplements', 'health'] },
    { name: 'Protein Powder', basePrice: 3500, brands: ['Optimum Nutrition', 'Dymatize', 'BSN', 'MuscleTech'], tags: ['protein', 'fitness', 'nutrition'] },
    { name: 'Blood Pressure Monitor', basePrice: 4000, brands: ['Omron', 'Welch Allyn', 'A&D Medical', 'Beurer'], tags: ['medical', 'monitor', 'health'] },
    { name: 'Thermometer', basePrice: 800, brands: ['Braun', 'Omron', 'Vicks', 'iHealth'], tags: ['medical', 'temperature', 'health'] },
    { name: 'Face Mask', basePrice: 500, brands: ['3M', 'Honeywell', 'KN95', 'Surgical'], tags: ['protection', 'medical', 'safety'] }
  ],
  'Home': [
    { name: 'Coffee Table', basePrice: 15000, brands: ['IKEA', 'West Elm', 'CB2', 'Ashley'], tags: ['furniture', 'living room', 'table'] },
    { name: 'Air Fryer', basePrice: 8000, brands: ['Philips', 'Ninja', 'Cosori', 'Instant Pot'], tags: ['kitchen', 'appliance', 'cooking'] },
    { name: 'Bed Sheets', basePrice: 2500, brands: ['Egyptian Cotton', 'Bamboo', 'Microfiber', 'Linen'], tags: ['bedding', 'comfort', 'sleep'] },
    { name: 'Table Lamp', basePrice: 3000, brands: ['IKEA', 'Philips', 'Target', 'West Elm'], tags: ['lighting', 'decor', 'lamp'] },
    { name: 'Vacuum Cleaner', basePrice: 12000, brands: ['Dyson', 'Shark', 'Bissell', 'Hoover'], tags: ['cleaning', 'appliance', 'home'] }
  ],
  'Books': [
    { name: 'Fiction Novel', basePrice: 600, brands: ['Penguin', 'HarperCollins', 'Random House', 'Macmillan'], tags: ['fiction', 'novel', 'literature'] },
    { name: 'Programming Guide', basePrice: 1500, brands: ['O\'Reilly', 'Manning', 'Packt', 'Apress'], tags: ['programming', 'technical', 'education'] },
    { name: 'Children\'s Book', basePrice: 400, brands: ['Scholastic', 'Disney', 'Dr. Seuss', 'Golden Books'], tags: ['children', 'education', 'stories'] },
    { name: 'Cookbook', basePrice: 800, brands: ['Williams Sonoma', 'America\'s Test Kitchen', 'Food Network', 'Betty Crocker'], tags: ['cooking', 'recipes', 'food'] },
    { name: 'Self-Help Book', basePrice: 700, brands: ['Hay House', 'Simon & Schuster', 'Penguin', 'Random House'], tags: ['self-help', 'motivation', 'personal'] }
  ],
  'Automotive': [
    { name: 'Car Phone Mount', basePrice: 1000, brands: ['iOttie', 'Mpow', 'Beam Electronics', 'WizGear'], tags: ['car accessory', 'phone', 'mount'] },
    { name: 'Car Charger', basePrice: 800, brands: ['Anker', 'Belkin', 'RAVPower', 'Aukey'], tags: ['car accessory', 'charger', 'usb'] },
    { name: 'Tire Gauge', basePrice: 1500, brands: ['JACO', 'AstroAI', 'Rhino USA', 'EPAuto'], tags: ['car tool', 'tire', 'maintenance'] },
    { name: 'Car Wax', basePrice: 1200, brands: ['Meguiar\'s', 'Chemical Guys', 'Mothers', 'Turtle Wax'], tags: ['car care', 'wax', 'cleaning'] },
    { name: 'Jump Starter', basePrice: 8000, brands: ['NOCO', 'TACKLIFE', 'DBPOWER', 'Clore Automotive'], tags: ['car tool', 'emergency', 'battery'] }
  ],
  'Grocery': [
    { name: 'Organic Rice', basePrice: 300, brands: ['India Gate', 'Daawat', 'Kohinoor', 'Fortune'], tags: ['rice', 'organic', 'staple'] },
    { name: 'Olive Oil', basePrice: 800, brands: ['Figaro', 'Borges', 'Del Monte', 'Bertolli'], tags: ['oil', 'cooking', 'healthy'] },
    { name: 'Green Tea', basePrice: 400, brands: ['Twinings', 'Lipton', 'Tetley', 'Organic India'], tags: ['tea', 'beverage', 'healthy'] },
    { name: 'Almonds', basePrice: 600, brands: ['Blue Diamond', 'Wonderful', 'Kirkland', 'Planters'], tags: ['nuts', 'healthy', 'snack'] },
    { name: 'Honey', basePrice: 500, brands: ['Dabur', 'Patanjali', 'Apis', 'Nature\'s Nectar'], tags: ['honey', 'natural', 'sweetener'] }
  ],
  'Baby': [
    { name: 'Baby Onesie', basePrice: 800, brands: ['Carter\'s', 'Gerber', 'Simple Joys', 'Hanes'], tags: ['baby clothes', 'onesie', 'cotton'] },
    { name: 'Baby Bottle', basePrice: 600, brands: ['Philips Avent', 'Dr. Brown\'s', 'Tommee Tippee', 'MAM'], tags: ['feeding', 'bottle', 'baby'] },
    { name: 'Baby Toy', basePrice: 1200, brands: ['Fisher-Price', 'VTech', 'Melissa & Doug', 'LeapFrog'], tags: ['toy', 'educational', 'baby'] },
    { name: 'Baby Diaper', basePrice: 1500, brands: ['Pampers', 'Huggies', 'Honest', 'Seventh Generation'], tags: ['diaper', 'baby care', 'hygiene'] },
    { name: 'Baby Food', basePrice: 200, brands: ['Gerber', 'Earth\'s Best', 'Happy Baby', 'Beech-Nut'], tags: ['baby food', 'nutrition', 'organic'] }
  ]
};

// Generate random product data
const generateProducts = async () => {
  const products = [];
  
  for (const [category, templates] of Object.entries(productTemplates)) {
    console.log(`Generating 100 products for ${category}...`);
    
    for (let i = 0; i < 100; i++) {
      const template = templates[i % templates.length];
      const brand = template.brands[Math.floor(Math.random() * template.brands.length)];
      const priceVariation = Math.random() * 0.4 - 0.2; // ±20% price variation
      const price = Math.round(template.basePrice * (1 + priceVariation));
      
      const product = {
        name: `${brand} ${template.name} ${String.fromCharCode(65 + (i % 26))}${Math.floor(i/26) + 1}`,
        description: `High-quality ${template.name.toLowerCase()} from ${brand}. Perfect for everyday use with excellent build quality and reliability.`,
        price: price,
        category: category,
        brand: brand,
        stock: Math.floor(Math.random() * 100) + 20, // 20-120 stock
        tags: template.tags,
        useDefaultImages: true, // This will use our expanded image collections
        productSeed: `${category}_${i}_${brand}_${Date.now()}`, // Unique seed for image selection
        variants: [
          {
            name: 'Standard',
            price: price,
            stock: Math.floor(Math.random() * 50) + 10
          }
        ]
      };
      
      products.push(product);
    }
  }
  
  return products;
};

const seedProducts = async () => {
  try {
    console.log('🌱 Starting expanded product seeding...');
    
    // Find or create an admin user for createdBy field
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@system.com',
        password: 'tempPassword123',
        role: 'admin',
        isVerified: true
      });
      console.log('📝 Created system admin user for product creation');
    }
    
    // Generate 900 products (100 per category)
    const generatedProducts = await generateProducts();
    
    // Add createdBy field to all products
    const productsWithCreatedBy = generatedProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));
    
    // Clear existing products (optional)
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    
    // Insert products in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < productsWithCreatedBy.length; i += batchSize) {
      const batch = productsWithCreatedBy.slice(i, i + batchSize);
      await Product.insertMany(batch);
      insertedCount += batch.length;
      console.log(`✅ Inserted ${insertedCount}/${productsWithCreatedBy.length} products`);
    }
    
    // Log category distribution
    const categoryCount = {};
    productsWithCreatedBy.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    
    console.log('\n📊 Products by category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log(`\n🎉 Successfully seeded ${insertedCount} products with expanded image collections!`);
    console.log('💡 Products will use category-appropriate images from the expanded collections');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedProducts();
