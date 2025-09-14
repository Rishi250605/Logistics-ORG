const router = require('express').Router();
const Request = require('../models/Request');
const Plan = require('../models/Plan');
const VehicleAmount = require('../models/VehicleAmount');

// Get all requests - Admin only
router.get('/', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const requests = await Request.find().populate('planId');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests for the logged-in agent
router.get('/my-requests', async (req, res) => {
  try {
    // Check if user is agent
    if (req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Access denied. Agents only.' });
    }
    
    const requests = await Request.find({ agentId: req.user.id }).populate('planId');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new request
router.post('/', async (req, res) => {
  try {
    // Check if user is agent
    if (req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Access denied. Agents only.' });
    }
    
    // Validate required fields
    const { planId, boxCount, size, weight, price } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }
    
    if (!boxCount) {
      return res.status(400).json({ error: 'Box count is required' });
    }
    
    if (!size) {
      return res.status(400).json({ error: 'Size is required' });
    }
    
    if (!weight) {
      return res.status(400).json({ error: 'Weight is required' });
    }
    
    if (!price) {
      return res.status(400).json({ error: 'Price is required' });
    }
    
    // Validate number fields
    if (isNaN(Number(boxCount)) || Number(boxCount) <= 0) {
      return res.status(400).json({ error: 'Box count must be a positive number' });
    }
    
    if (isNaN(Number(weight)) || Number(weight) <= 0) {
      return res.status(400).json({ error: 'Weight must be a positive number' });
    }
    
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    // Validate size enum
    const validSizes = ['big', 'small', 'unsized'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({ error: 'Invalid size. Must be big, small, or unsized' });
    }
    
    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Create request with validated data
    const request = new Request({
      ...req.body,
      agentId: req.user.id,
      status: 'pending',
      statusHistory: [
        { status: 'pending', timestamp: new Date(), updatedBy: req.user.id }
      ],
      updatedAt: new Date()
    });
    
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request status - Admin only
router.patch('/:id/status', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const request = await Request.findById(req.params.id).populate('planId');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Update status
    request.status = status;
    request.updatedAt = new Date();
    
    // Add to status history
    request.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id
    });

    // If status is approved, update vehicle amount
    if (status === 'approved') {
      // Make sure planId is populated and has vehicleNumber
      if (!request.planId || !request.planId.vehicleNumber) {
        console.error('Missing planId or vehicleNumber:', request);
        return res.status(400).json({ error: 'Invalid plan data for this request' });
      }
      
      const vehicleNumber = request.planId.vehicleNumber;
      console.log('Updating vehicle amount for vehicle number:', vehicleNumber);
      console.log('Request price:', request.price, 'Type:', typeof request.price);
      
      let vehicleAmount = await VehicleAmount.findOne({ vehicleNumber });
      
      // Convert price to float to ensure it's a number
      const price = parseFloat(request.price || 0);
      console.log('Parsed price:', price);
      
      if (!vehicleAmount) {
        console.log('Creating new vehicle amount record');
        vehicleAmount = new VehicleAmount({
          vehicleNumber,
          totalAmount: price,
          approvedRequests: [{
            requestId: request._id,
            price: price
          }]
        });
        console.log('New vehicle amount created:', vehicleAmount);
      } else {
        console.log('Updating existing vehicle amount record');
        vehicleAmount.totalAmount += price;
        vehicleAmount.approvedRequests.push({
          requestId: request._id,
          price: price
        });
        vehicleAmount.updatedAt = new Date();
        console.log('Updated vehicle amount:', vehicleAmount);
      }
      
      await vehicleAmount.save();
    }
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vehicle amounts with approved requests - Admin only
router.get('/vehicle-amounts', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const vehicleAmounts = await VehicleAmount.find()
      .populate({
        path: 'approvedRequests.requestId',
        populate: { path: 'planId' }
      });
    
    console.log('Vehicle amounts found:', vehicleAmounts.length);
    if (vehicleAmounts.length > 0) {
      console.log('First vehicle amount:', JSON.stringify(vehicleAmounts[0], null, 2));
    }
    
    res.json(vehicleAmounts);
  } catch (error) {
    console.error('Error fetching vehicle amounts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
