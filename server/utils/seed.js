const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const Batch = require('../models/Batch');
const User  = require('../models/User');

const batches = [
  {
    batchNumber: 'RT3426',
    slug:        '49x-apple-iphone-ipads-mix',
    title:       '49x Apple iPhone & iPads Mix',
    quantity:    49,
    category:    'phones',
    brand:       'Apple',
    description: 'Mixed Apple iPhones and iPads. See list for all details.',
    specs:       'For example: iPad 10.2", iPad Air 3, iPhone 8, iPhone SE 2nd, iPhone SE 3rd, etc.',
    grade:       'mixed',
    tested:      true,
    hasList:     true,
    price:       1490,
    status:      'available',
    images:      [],
  },
  {
    batchNumber: 'RT3425',
    slug:        '196x-apple-macbook-air-pro',
    title:       '196x Apple MacBook Air & Pro',
    quantity:    196,
    category:    'laptops',
    brand:       'Apple',
    description: 'Apple MacBook only. Mixed models, Air & Pro. No item list available.',
    specs:       'Mixed Models — Air & Pro — NO List!',
    grade:       'mixed',
    tested:      false,
    hasList:     false,
    price:       28400,
    status:      'available',
    images:      [],
  },
  {
    batchNumber: 'RT3424',
    slug:        '45x-hp-elite-x2-1013-g3',
    title:       '45x HP Elite X2 1013 G3',
    quantity:    45,
    category:    'laptops',
    brand:       'HP',
    description: 'HP Elite X2 1013 G3 with keyboards included.',
    specs:       'Intel Core i7 8th Generation — 8GB RAM — 256GB SSD — Including Keyboards',
    grade:       'B',
    tested:      true,
    hasList:     true,
    price:       5850,
    status:      'available',
    images:      [],
  },
  {
    batchNumber: 'RT3423',
    slug:        '1000x-samsung-smartphones-usb-c',
    title:       '1000x Samsung Smartphones USB-C',
    quantity:    1000,
    category:    'phones',
    brand:       'Samsung',
    description: 'Samsung only, mixed models, no item list. Mix of good and broken screens.',
    specs:       'For example: A40, A50, A52, S9, S10, S20, S21, etc. — Good & Broken Screens',
    grade:       'mixed',
    tested:      false,
    hasList:     false,
    price:       8500,
    status:      'available',
    images:      [],
  },
  {
    batchNumber: 'RT3421',
    slug:        '51x-mixed-laptops-high-generation',
    title:       '51x Mixed Laptops High Generation',
    quantity:    51,
    category:    'laptops',
    brand:       'Mixed',
    description: 'Mixed brands and models, see list for all details.',
    specs:       'Intel Core i3, i5, i7, Ultra 5 & AMD — Up To 13th Gen — 4GB-16GB RAM — 0GB-512GB SSD',
    grade:       'B',
    tested:      true,
    hasList:     true,
    price:       7650,
    status:      'available',
    images:      [],
  },
  {
    batchNumber: 'RT3405',
    slug:        '1200x-mixed-laptops-cheap',
    title:       '1200x Mixed Laptops Cheap',
    quantity:    1200,
    category:    'laptops',
    brand:       'Mixed',
    description: 'Mixed brands and models, no item list. Grade C condition.',
    specs:       'Intel Core i3, i5, i7, AMD, C2D, Pentium, Celeron — HP, Dell, Lenovo, Toshiba, Acer, Asus, etc.',
    grade:       'C',
    tested:      false,
    hasList:     false,
    price:       24000,
    status:      'available',
    images:      [],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Batch.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing data');

    // Seed batches
    await Batch.insertMany(batches);
    console.log(`Seeded ${batches.length} batches`);

    // Create admin user
    await User.create({
      name:        'Sem',
      companyName: 'A.L.S Trade  Ltd',
      email:       'admin@derbywholesale.co.uk',
      phone:       '+31622971053',
      country:     'United Kingdom',
      password:    'admin1234',
      role:        'admin',
    });
    console.log('Admin user created: admin@derbywholesale.co.uk / admin1234');

    // Create a sample customer
    await User.create({
      name:        'Test Customer',
      companyName: 'Test Company Ltd',
      email:       'customer@test.com',
      phone:       '+441234567890',
      country:     'United Kingdom',
      password:    'customer1234',
      role:        'customer',
    });
    console.log('Sample customer: customer@test.com / customer1234');

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedDB();
