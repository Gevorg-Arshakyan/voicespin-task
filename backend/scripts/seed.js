const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const config = require('../config');

const sampleProducts = [
  { name: "Cola 330ml", category: "Beverages", price: 120, stock: 40 },
  { name: "Orange Juice 1L", category: "Beverages", price: 420, stock: 25 },
  { name: "Salted Chips", category: "Snacks", price: 90, stock: 100 },
  { name: "Chocolate Bar", category: "Snacks", price: 150, stock: 75 },
  { name: "Energy Drink 250ml", category: "Beverages", price: 200, stock: 30 },
  { name: "Pretzels", category: "Snacks", price: 110, stock: 60 },
  { name: "Apple Juice 500ml", category: "Beverages", price: 180, stock: 35 },
  { name: "Granola Bar", category: "Snacks", price: 85, stock: 80 },
  { name: "Sparkling Water 500ml", category: "Beverages", price: 95, stock: 50 },
  { name: "Mixed Nuts", category: "Snacks", price: 220, stock: 45 }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);
    console.log('Database seeding completed successfully!');

    console.log('\n=== SEED SUMMARY ===');
    console.log(`Products created: ${products.length}`);
    console.log('\nSample products:');
    products.slice(0, 5).forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${(product.price/100).toFixed(2)} - Stock: ${product.stock}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
