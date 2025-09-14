const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  numberOfVehicles: { type: Number, required: true },
  route: {
    from: { type: String, required: true },
    to: { type: String, required: true },
    estimatedDistance: { type: Number },
    estimatedDuration: { type: Number } // in hours
  },
  startingTime: { type: Date, required: true },
  estimatedArrivalTime: { type: Date },
  capacity: { type: Number }, // total capacity in kg
  availableCapacity: { type: Number }, // remaining capacity in kg
  status: { type: String, enum: ['active', 'in-transit', 'completed', 'cancelled'], default: 'active' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
