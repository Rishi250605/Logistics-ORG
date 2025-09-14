/**
 * API Testing Script for Transport Management System
 * 
 * This script tests the core API endpoints to verify the application workflow
 * Run with: node test-api.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let agentToken = '';
let testPlanId = '';
let testRequestId = '';

// Test users
const adminUser = { username: 'admin', password: 'adminpassword' };
const agentUser = { username: 'mumbai_agent', password: 'agentpassword' };

// Test data
const testPlan = {
  vehicleType: 'Truck',
  vehicleNumber: 'MH01AB1234',
  numberOfVehicles: 2,
  capacity: 1000,
  route: {
    from: 'Mumbai',
    to: 'Delhi'
  },
  startingTime: new Date().toISOString(),
  estimatedDistance: 1400,
  estimatedDuration: '24 hours',
  notes: 'Test plan created by automated script'
};

const testRequest = {
  boxCount: 50,
  size: 'big',
  weight: 500,
  price: 25000,
  description: 'Test request created by automated script',
  specialInstructions: 'Handle with care',
  contactPerson: 'Test User',
  contactPhone: '9876543210'
};

// Helper functions
async function login(username, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    return response.data.token;
  } catch (error) {
    console.error(`Login failed for ${username}:`, error.response?.data || error.message);
    return null;
  }
}

async function createPlan(token, planData) {
  try {
    const response = await axios.post(`${API_URL}/plans`, planData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Create plan failed:', error.response?.data || error.message);
    return null;
  }
}

async function getPlans(token) {
  try {
    const response = await axios.get(`${API_URL}/plans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get plans failed:', error.response?.data || error.message);
    return [];
  }
}

async function createRequest(token, planId, requestData) {
  try {
    const response = await axios.post(`${API_URL}/requests`, {
      ...requestData,
      planId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Create request failed:', error.response?.data || error.message);
    return null;
  }
}

async function getRequests(token) {
  try {
    const response = await axios.get(`${API_URL}/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get requests failed:', error.response?.data || error.message);
    return [];
  }
}

async function getAgentRequests(token) {
  try {
    const response = await axios.get(`${API_URL}/requests/my-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get agent requests failed:', error.response?.data || error.message);
    return [];
  }
}

async function updateRequestStatus(token, requestId, newStatus) {
  try {
    const response = await axios.patch(`${API_URL}/requests/${requestId}/status`, {
      status: newStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Update request status failed:', error.response?.data || error.message);
    return null;
  }
}

// Main test flow
async function runTests() {
  console.log('Starting API tests...');
  
  // Step 1: Login as admin
  console.log('\n1. Testing admin login...');
  adminToken = await login(adminUser.username, adminUser.password);
  if (!adminToken) {
    console.error('Admin login failed. Aborting tests.');
    return;
  }
  console.log('✓ Admin login successful');
  
  // Step 2: Create a test plan
  console.log('\n2. Creating test plan...');
  const plan = await createPlan(adminToken, testPlan);
  if (!plan) {
    console.error('Plan creation failed. Aborting tests.');
    return;
  }
  testPlanId = plan._id;
  console.log(`✓ Plan created with ID: ${testPlanId}`);
  
  // Step 3: Login as agent
  console.log('\n3. Testing agent login...');
  agentToken = await login(agentUser.username, agentUser.password);
  if (!agentToken) {
    console.error('Agent login failed. Aborting tests.');
    return;
  }
  console.log('✓ Agent login successful');
  
  // Step 4: Agent views plans
  console.log('\n4. Agent viewing plans...');
  const agentPlans = await getPlans(agentToken);
  console.log(`✓ Agent can see ${agentPlans.length} plans`);
  
  // Check if our test plan is visible to the agent
  const canSeeTestPlan = agentPlans.some(p => p._id === testPlanId);
  if (canSeeTestPlan) {
    console.log('✓ Agent can see the test plan (city filtering works)');
  } else {
    console.log('✗ Agent cannot see the test plan (check city filtering)');
  }
  
  // Step 5: Agent creates a request
  console.log('\n5. Agent creating request...');
  // Use the first available plan if test plan is not visible
  const planIdToUse = canSeeTestPlan ? testPlanId : (agentPlans.length > 0 ? agentPlans[0]._id : null);
  
  if (!planIdToUse) {
    console.error('No plans available for agent. Aborting tests.');
    return;
  }
  
  const request = await createRequest(agentToken, planIdToUse, testRequest);
  if (!request) {
    console.error('Request creation failed. Aborting tests.');
    return;
  }
  testRequestId = request._id;
  console.log(`✓ Request created with ID: ${testRequestId}`);
  
  // Step 6: Agent views their requests
  console.log('\n6. Agent viewing their requests...');
  const agentRequests = await getAgentRequests(agentToken);
  const canSeeTestRequest = agentRequests.some(r => r._id === testRequestId);
  console.log(`✓ Agent can see ${agentRequests.length} requests`);
  if (canSeeTestRequest) {
    console.log('✓ Agent can see their test request');
  } else {
    console.log('✗ Agent cannot see their test request');
  }
  
  // Step 7: Admin views all requests
  console.log('\n7. Admin viewing all requests...');
  const adminRequests = await getRequests(adminToken);
  const adminCanSeeTestRequest = adminRequests.some(r => r._id === testRequestId);
  console.log(`✓ Admin can see ${adminRequests.length} requests`);
  if (adminCanSeeTestRequest) {
    console.log('✓ Admin can see the test request');
  } else {
    console.log('✗ Admin cannot see the test request');
  }
  
  // Step 8: Admin updates request status
  console.log('\n8. Admin updating request status...');
  const updatedRequest = await updateRequestStatus(adminToken, testRequestId, 'approved');
  if (updatedRequest && updatedRequest.status === 'approved') {
    console.log('✓ Admin successfully updated request status to approved');
  } else {
    console.log('✗ Admin failed to update request status');
  }
  
  // Step 9: Agent checks updated status
  console.log('\n9. Agent checking updated request status...');
  const updatedAgentRequests = await getAgentRequests(agentToken);
  const updatedTestRequest = updatedAgentRequests.find(r => r._id === testRequestId);
  if (updatedTestRequest && updatedTestRequest.status === 'approved') {
    console.log('✓ Agent can see the updated request status');
  } else {
    console.log('✗ Agent cannot see the updated request status');
  }
  
  console.log('\nAPI tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
});