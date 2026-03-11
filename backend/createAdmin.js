const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auca-job-link');
    console.log('✅ Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@auca.rw' });
    if (adminExists) {
      console.log('⚠️ Admin user already exists');
      console.log('Email: admin@auca.rw');
      console.log('Password: admin123');
      process.exit(0);
    }

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
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
