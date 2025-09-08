const mongoose = require("mongoose");
const Product = require("../models/product/product.model");
const Category = require("../models/category/category.model");
const User = require("../models/auth/user.model");
require("dotenv").config();

const categories = [
  "Electronics", "Clothing", "Books", "Home & Garden", "Sports & Outdoors", 
  "Beauty & Personal Care", "Toys & Games", "Automotive", "Health & Wellness", "Food & Beverages"
];

const sampleImages = [
  {
    public_id: "sample1",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"
  },
  {
    public_id: "sample2", 
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
  },
  {
    public_id: "sample3",
    url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop"
  },
  {
    public_id: "sample4",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"
  },
  {
    public_id: "sample5",
    url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop"
  }
];

const productTemplates = {
  "Electronics": [
    { name: "Wireless Headphones", description: "High-quality wireless headphones with noise cancellation", price: 199, brand: "TechBrand" },
    { name: "Smartphone", description: "Latest smartphone with advanced camera features", price: 699, brand: "PhoneCorp" },
    { name: "Laptop", description: "Powerful laptop for work and gaming", price: 1299, brand: "CompuTech" },
    { name: "Smart Watch", description: "Fitness tracking smartwatch with heart rate monitor", price: 299, brand: "WearTech" },
    { name: "Tablet", description: "10-inch tablet perfect for entertainment and productivity", price: 449, brand: "TabletPro" }
  ],
  "Clothing": [
    { name: "Cotton T-Shirt", description: "Comfortable 100% cotton t-shirt in various colors", price: 29, brand: "FashionWear" },
    { name: "Denim Jeans", description: "Classic fit denim jeans with premium quality", price: 79, brand: "DenimCo" },
    { name: "Running Shoes", description: "Lightweight running shoes for optimal performance", price: 129, brand: "SportsFoot" },
    { name: "Winter Jacket", description: "Warm and stylish winter jacket with water resistance", price: 199, brand: "OutdoorWear" },
    { name: "Casual Dress", description: "Elegant casual dress perfect for any occasion", price: 89, brand: "StyleHub" }
  ],
  "Books": [
    { name: "Programming Guide", description: "Comprehensive guide to modern programming languages", price: 49, brand: "TechBooks" },
    { name: "Mystery Novel", description: "Thrilling mystery novel with unexpected twists", price: 19, brand: "PageTurner" },
    { name: "Cookbook", description: "Delicious recipes from around the world", price: 34, brand: "CulinaryPress" },
    { name: "Self-Help Book", description: "Transform your life with proven strategies", price: 24, brand: "LifeGuide" },
    { name: "History Book", description: "Fascinating journey through world history", price: 39, brand: "HistoryHouse" }
  ],
  "Home & Garden": [
    { name: "Garden Tools Set", description: "Complete set of essential garden tools", price: 89, brand: "GreenThumb" },
    { name: "Indoor Plant", description: "Beautiful low-maintenance indoor plant", price: 25, brand: "PlantLife" },
    { name: "Kitchen Appliance", description: "Multi-functional kitchen appliance for modern cooking", price: 149, brand: "KitchenPro" },
    { name: "Home Decor", description: "Stylish home decoration piece", price: 59, brand: "DecorStyle" },
    { name: "Storage Solution", description: "Organize your space with this storage solution", price: 79, brand: "OrganizeIt" }
  ],
  "Sports & Outdoors": [
    { name: "Yoga Mat", description: "Non-slip yoga mat for comfortable practice", price: 39, brand: "FitLife" },
    { name: "Camping Tent", description: "Waterproof camping tent for 4 people", price: 199, brand: "OutdoorGear" },
    { name: "Basketball", description: "Official size basketball for indoor/outdoor play", price: 29, brand: "SportsBall" },
    { name: "Hiking Backpack", description: "Durable hiking backpack with multiple compartments", price: 119, brand: "TrailPack" },
    { name: "Water Bottle", description: "Insulated water bottle keeps drinks cold/hot", price: 24, brand: "HydroFlask" }
  ],
  "Beauty & Personal Care": [
    { name: "Face Moisturizer", description: "Hydrating face moisturizer for all skin types", price: 34, brand: "SkinCare" },
    { name: "Shampoo", description: "Nourishing shampoo for healthy hair", price: 19, brand: "HairHealth" },
    { name: "Perfume", description: "Elegant fragrance for special occasions", price: 89, brand: "Fragrance" },
    { name: "Makeup Kit", description: "Complete makeup kit with brushes", price: 79, brand: "BeautyBox" },
    { name: "Skincare Set", description: "Complete skincare routine in one set", price: 129, brand: "GlowSkin" }
  ],
  "Toys & Games": [
    { name: "Board Game", description: "Fun family board game for all ages", price: 39, brand: "GameNight" },
    { name: "Action Figure", description: "Collectible action figure with accessories", price: 24, brand: "ToyHeroes" },
    { name: "Puzzle", description: "1000-piece jigsaw puzzle with beautiful artwork", price: 19, brand: "PuzzleFun" },
    { name: "Building Blocks", description: "Creative building blocks set", price: 49, brand: "BuildIt" },
    { name: "Remote Control Car", description: "Fast remote control car for outdoor fun", price: 79, brand: "RCFun" }
  ],
  "Automotive": [
    { name: "Car Phone Mount", description: "Secure phone mount for safe driving", price: 29, brand: "CarTech" },
    { name: "Car Charger", description: "Fast charging car charger with dual ports", price: 19, brand: "PowerDrive" },
    { name: "Floor Mats", description: "All-weather floor mats for car protection", price: 59, brand: "AutoProtect" },
    { name: "Air Freshener", description: "Long-lasting car air freshener", price: 9, brand: "FreshRide" },
    { name: "Emergency Kit", description: "Complete car emergency kit for safety", price: 89, brand: "SafeDrive" }
  ],
  "Health & Wellness": [
    { name: "Vitamin Supplements", description: "Daily vitamin supplements for better health", price: 29, brand: "HealthPlus" },
    { name: "Fitness Tracker", description: "Track your daily activity and health metrics", price: 149, brand: "FitTrack" },
    { name: "Protein Powder", description: "High-quality protein powder for muscle building", price: 49, brand: "ProteinPro" },
    { name: "Essential Oils", description: "Pure essential oils for aromatherapy", price: 34, brand: "NaturalScents" },
    { name: "Massage Tool", description: "Therapeutic massage tool for muscle relief", price: 39, brand: "RelaxTools" }
  ],
  "Food & Beverages": [
    { name: "Organic Coffee", description: "Premium organic coffee beans", price: 24, brand: "CoffeeCraft" },
    { name: "Green Tea", description: "Antioxidant-rich green tea blend", price: 19, brand: "TeaTime" },
    { name: "Protein Bars", description: "Nutritious protein bars for energy", price: 29, brand: "EnergyBar" },
    { name: "Honey", description: "Pure natural honey from local farms", price: 16, brand: "NatureSweet" },
    { name: "Olive Oil", description: "Extra virgin olive oil for cooking", price: 22, brand: "MediterraneanGold" }
  ]
};

const addProducts = async () => {
  try {
    // Connect to database
    const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://krupalpatel3571:Krupal%231909@cluster0.xpeoqci.mongodb.net/chat-mern-stack";
    await mongoose.connect(MONGO_URL);

    // Get admin user
    const admin = await User.findOne({ email: "admin@shopease.com" });
    if (!admin) {
      process.exit(1);
    }

    // Get existing categories
    const existingCategories = await Category.find({});

    // Add 100 products to each category
    for (const categoryName of categories) {
      const templates = productTemplates[categoryName] || productTemplates["Electronics"];
      
      for (let i = 1; i <= 100; i++) {
        const template = templates[i % templates.length];
        
        // Generate random variations
        const variations = [
          "Premium", "Deluxe", "Pro", "Elite", "Standard", "Classic", "Modern", "Advanced", "Basic", "Ultimate"
        ];
        const colors = ["Red", "Blue", "Black", "White", "Green", "Silver", "Gold", "Pink", "Purple", "Orange"];
        
        const variation = variations[Math.floor(Math.random() * variations.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const productData = {
          name: `${variation} ${template.name} ${color} - ${i}`,
          description: `${template.description}. Available in ${color} color. Model #${i}.`,
          price: Math.max(10, template.price + Math.floor(Math.random() * 100) - 50), // Add some price variation
          discountPrice: Math.max(0, template.price - Math.floor(Math.random() * 30)),
          category: categoryName,
          brand: template.brand,
          stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
          images: sampleImages.slice(0, Math.floor(Math.random() * 3) + 2), // 2-4 images
          ratings: (Math.random() * 2 + 3).toFixed(1), // Rating between 3-5
          numOfReviews: Math.floor(Math.random() * 50),
          isActive: true,
          tags: [categoryName.toLowerCase(), template.brand.toLowerCase(), color.toLowerCase()],
          createdBy: admin._id,
          variants: [
            {
              size: ["S", "M", "L", "XL"][Math.floor(Math.random() * 4)],
              color: color,
              price: template.price + Math.floor(Math.random() * 20)
            }
          ]
        };

        await Product.create(productData);
        
        if (i % 20 === 0) {
          console.log(`Added ${i} products to ${categoryName}`);
        }
      }
      
      console.log(`✅ Completed adding 100 products to ${categoryName}`);
    }

    console.log(`Total products added: ${categories.length * 100}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding products:", error);
    process.exit(1);
  }
};

addProducts();
