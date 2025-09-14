const mongoose = require('mongoose');

// List of valid cities for agents
const validCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow', 
  'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal'
];

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'agent'], required: true },
  city: { 
    type: String, 
    enum: validCities,
    required: function() { return this.role === 'agent'; } 
  }
});

module.exports = mongoose.model('User', userSchema);
