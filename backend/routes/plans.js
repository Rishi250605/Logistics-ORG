const router = require('express').Router();
const Plan = require('../models/Plan');

// Get all plans with optional city filtering
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // If user is admin, return all plans
    // If user is agent, return plans where route.from or route.to matches their city
    const user = req.user; // Assuming auth middleware sets req.user
    
    let plans;
    if (user.role === 'admin') {
      plans = await Plan.find();
    } else if (user.role === 'agent') {
      // Filter plans where either the 'from' or 'to' city matches the agent's city
      plans = await Plan.find({
        $or: [
          { 'route.from': user.city },
          { 'route.to': user.city },
          { 'from': user.city }, // For backward compatibility
          { 'to': user.city }    // For backward compatibility
        ]
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }
    
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new plan
router.post('/', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    // Validate required fields
    const { vehicleType, vehicleNumber, numberOfVehicles, route, startingTime } = req.body;
    
    if (!vehicleType || !vehicleNumber || !numberOfVehicles || !route || !startingTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!route.from || !route.to) {
      return res.status(400).json({ error: 'Route must include both origin and destination' });
    }
    
    // Validate number fields
    if (isNaN(Number(numberOfVehicles)) || Number(numberOfVehicles) <= 0) {
      return res.status(400).json({ error: 'Number of vehicles must be a positive number' });
    }
    
    if (req.body.capacity && (isNaN(Number(req.body.capacity)) || Number(req.body.capacity) <= 0)) {
      return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    
    // Validate that from and to are different
    if (route.from === route.to) {
      return res.status(400).json({ error: 'Origin and destination cannot be the same' });
    }
    
    // Create plan with validated data
    const planData = {
      ...req.body,
      createdBy: req.user.id,
      updatedAt: new Date()
    };
    
    const plan = new Plan(planData);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
