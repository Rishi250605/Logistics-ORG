const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const users = [
  {
    username: 'admin123',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'agent_mumbai',
    password: 'agent123',
    role: 'agent',
    city: 'Mumbai'
  },
  {
    username: 'agent_delhi',
    password: 'agent123',
    role: 'agent',
    city: 'Delhi'
  },
  {
    username: 'agent_bangalore',
    password: 'agent123',
    role: 'agent',
    city: 'Bangalore'
  },
  {
    username: 'agent_hyderabad',
    password: 'agent123',
    role: 'agent',
    city: 'Hyderabad'
  },
  {
    username: 'agent_chennai',
    password: 'agent123',
    role: 'agent',
    city: 'Chennai'
  },
  {
    username: 'agent_kolkata',
    password: 'agent123',
    role: 'agent',
    city: 'Kolkata'
  },
  {
    username: 'agent_ahmedabad',
    password: 'agent123',
    role: 'agent',
    city: 'Ahmedabad'
  },
  {
    username: 'agent_pune',
    password: 'agent123',
    role: 'agent',
    city: 'Pune'
  },
  {
    username: 'agent_jaipur',
    password: 'agent123',
    role: 'agent',
    city: 'Jaipur'
  },
  {
    username: 'agent_lucknow',
    password: 'agent123',
    role: 'agent',
    city: 'Lucknow'
  },
  {
    username: 'agent_kanpur',
    password: 'agent123',
    role: 'agent',
    city: 'Kanpur'
  },
  {
    username: 'agent_nagpur',
    password: 'agent123',
    role: 'agent',
    city: 'Nagpur'
  },
  {
    username: 'agent_indore',
    password: 'agent123',
    role: 'agent',
    city: 'Indore'
  },
  {
    username: 'agent_thane',
    password: 'agent123',
    role: 'agent',
    city: 'Thane'
  },
  {
    username: 'agent_bhopal',
    password: 'agent123',
    role: 'agent',
    city: 'Bhopal'
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing users
    await User.deleteMany({});

    // Create users with hashed passwords
    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        ...user,
        password: hashedPassword
      });
    }

    console.log('Users seeded successfully!');
    console.log('\nCredentials:');
    console.log('Admin User:');
    console.log('Username: admin123');
    console.log('Password: admin123');
    console.log('\nAgent Users:');
    console.log('Username: agent_[cityname] (e.g., agent_mumbai, agent_delhi, etc.)');
    console.log('Password: agent123');
    console.log('\nAvailable Cities: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Ahmedabad, Pune, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Thane, Bhopal');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();
