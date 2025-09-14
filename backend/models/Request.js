const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boxCount: { type: Number, required: true },
  size: { type: String, enum: ['big', 'small', 'unsized'], required: true },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  specialInstructions: { type: String },
  pickupAddress: { type: String },
  deliveryAddress: { type: String },
  contactPerson: { type: String },
  contactPhone: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'in-transit', 'delivered', 'cancelled'], default: 'pending' },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
