const mongoose = require('mongoose');

const vehicleAmountSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  totalAmount: { type: Number, default: 0 },
  approvedRequests: [{
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    price: { type: Number, required: true },
    approvedAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VehicleAmount', vehicleAmountSchema);