// backend/seedData.js (CommonJS version)
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Listing = require("./models/Listing");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Clear existing data
    await User.deleteMany();
    await Listing.deleteMany();
    console.log("🗑️  Existing data cleared");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@foodwaste.com",
      password: adminPassword,
      phone: "0712345678",
      role: "admin",
      isAdmin: true,
    });
    console.log("👤 Admin user created");

    // Sample listings with all required fields
    const sampleListings = [
      {
        title: "Fresh Bread",
        description: "50 loaves of fresh bread",
        originalPrice: 500,
        discountedPrice: 300,
        quantity: 50,
        quantityRemaining: 50,
        cuisine: "Bakery",
        location: "Nairobi",
        pickupWindow: {
          start: new Date("2025-11-20T10:00:00Z"),
          end: new Date("2025-11-20T14:00:00Z"),
        },
        expiresAt: new Date("2025-11-21T00:00:00Z"),
        restaurantId: adminUser._id,
      },
      {
        title: "Assorted Vegetables",
        description: "Fresh assorted vegetables",
        originalPrice: 800,
        discountedPrice: 500,
        quantity: 30,
        quantityRemaining: 30,
        cuisine: "Vegetables",
        location: "Kibera",
        pickupWindow: {
          start: new Date("2025-11-21T08:00:00Z"),
          end: new Date("2025-11-21T12:00:00Z"),
        },
        expiresAt: new Date("2025-11-22T00:00:00Z"),
        restaurantId: adminUser._id,
      },
    ];

    await Listing.insertMany(sampleListings);
    console.log("🍞 Sample listings added");

    console.log("✨ Database seeded successfully! ✨");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
