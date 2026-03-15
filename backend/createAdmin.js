// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB (Atlas / production DB only)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@auca.rw' });
    if (adminExists) {
      console.log('⚠️ Admin user already exists');
      console.log('Email: admin@auca.rw');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash default password
    const hashedPasword = await bcrypt.hash('admin123', 10);

    // Create admin user
    await User.create({
      name: 'System Admin',
      email: 'admin@auca.rw',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@auca.rw');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();