# Transport Management System - Workflow Testing Guide

## Prerequisites

1. Both backend and frontend servers are running
2. MongoDB is connected and accessible
3. Test users are created (admin and agent roles)

## Test Workflow

### 1. Authentication Flow

- [ ] Admin login works correctly
- [ ] Agent login works correctly
- [ ] Invalid credentials are properly rejected
- [ ] JWT token is stored in localStorage
- [ ] Protected routes redirect to login when not authenticated
- [ ] Logout clears token and redirects to login

### 2. Admin Dashboard Flow

#### Plan Management
- [ ] Admin can view all plans
- [ ] Admin can create new plans with all required fields
- [ ] Form validation works for plan creation
- [ ] Plans display correctly with all details

#### Request Management
- [ ] Admin can view all requests from agents
- [ ] Admin can approve/reject requests
- [ ] Status history is tracked correctly
- [ ] Request details modal shows all information

### 3. Agent Dashboard Flow

#### Plan Viewing
- [ ] Agent can only see plans relevant to their city
- [ ] Plan details are displayed correctly

#### Request Creation
- [ ] Agent can select a plan and create a request
- [ ] Form validation works for request creation
- [ ] Required fields are enforced
- [ ] Submitted requests appear in "My Requests" tab

#### Request Tracking
- [ ] Agent can view status of their requests
- [ ] Status updates from admin are reflected

### 4. Responsive Design

- [ ] Admin dashboard works on mobile devices
- [ ] Agent dashboard works on mobile devices
- [ ] Forms are usable on small screens
- [ ] Tables adapt to screen size
- [ ] Modals display properly on mobile

### 5. Error Handling

- [ ] API errors are displayed to users
- [ ] Form validation errors are clear and helpful
- [ ] Network errors are handled gracefully
- [ ] Authentication errors redirect to login

## Test Data

### Admin Test User
```
Username: admin
Password: adminpassword
```

### Agent Test Users
```
Username: mumbai_agent
Password: agentpassword
City: Mumbai

Username: delhi_agent
Password: agentpassword
City: Delhi
```

## Test Plan Example
```json
{
  "vehicleType": "Truck",
  "vehicleNumber": "MH01AB1234",
  "numberOfVehicles": 2,
  "capacity": 1000,
  "route": {
    "from": "Mumbai",
    "to": "Delhi"
  },
  "startingTime": "2023-06-15T08:00:00.000Z",
  "estimatedDistance": 1400,
  "estimatedDuration": "24 hours",
  "notes": "Regular delivery route"
}
```

## Test Request Example
```json
{
  "planId": "[PLAN_ID]",
  "boxCount": 50,
  "size": "big",
  "weight": 500,
  "price": 25000,
  "description": "Electronics shipment",
  "specialInstructions": "Handle with care",
  "contactPerson": "John Doe",
  "contactPhone": "9876543210"
}
```

## Testing Notes

- Complete each section in order
- Document any issues or bugs encountered
- Verify both positive and negative test cases
- Test with different browsers if possible
- Check mobile responsiveness using browser dev tools