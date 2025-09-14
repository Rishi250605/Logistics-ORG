import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [requestForm, setRequestForm] = useState({
    boxCount: '',
    size: 'big',
    weight: '',
    price: '',
    description: '',
    specialInstructions: '',
    contactPerson: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('plans');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = { headers: { Authorization: token } };
      const [plansRes, requestsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/plans`, config),
        axios.get(`${API_BASE_URL}/requests/my-requests`, config)
      ]);
      
      setPlans(plansRes.data);
      setMyRequests(requestsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const validateRequestForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!requestForm.boxCount) errors.boxCount = 'Box count is required';
    if (!requestForm.weight) errors.weight = 'Weight is required';
    if (!requestForm.price) errors.price = 'Price is required';
    
    // Number validation
    if (requestForm.boxCount && (isNaN(Number(requestForm.boxCount)) || Number(requestForm.boxCount) <= 0)) {
      errors.boxCount = 'Box count must be a positive number';
    }
    
    if (requestForm.weight && (isNaN(Number(requestForm.weight)) || Number(requestForm.weight) <= 0)) {
      errors.weight = 'Weight must be a positive number';
    }
    
    if (requestForm.price && (isNaN(Number(requestForm.price)) || Number(requestForm.price) <= 0)) {
      errors.price = 'Price must be a positive number';
    }
    
    // Phone number validation if provided
    if (requestForm.contactPhone && !/^\d{10,15}$/.test(requestForm.contactPhone.replace(/[\s-]/g, ''))) {
      errors.contactPhone = 'Please enter a valid phone number';
    }
    
    return errors;
  };
  
  const handleRequest = async (planId) => {
    try {
      // Validate form
      const formErrors = validateRequestForm();
      if (Object.keys(formErrors).length > 0) {
        // Display validation errors
        const errorMessage = Object.values(formErrors).join('\n');
        setError(errorMessage);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Convert string values to numbers where appropriate
      const requestData = {
        planId,
        boxCount: Number(requestForm.boxCount),
        size: requestForm.size,
        weight: Number(requestForm.weight),
        price: Number(requestForm.price),
        description: requestForm.description ? requestForm.description.trim() : '',
        specialInstructions: requestForm.specialInstructions ? requestForm.specialInstructions.trim() : '',
        contactPerson: requestForm.contactPerson ? requestForm.contactPerson.trim() : '',
        contactPhone: requestForm.contactPhone ? requestForm.contactPhone.trim() : ''
      };
      
      await axios.post(`${API_BASE_URL}/requests`, requestData, {
        headers: { Authorization: token }
      });
      
      setSelectedPlan(null);
      setRequestForm({
        boxCount: '',
        size: 'big',
        weight: '',
        price: '',
        description: '',
        specialInstructions: '',
        contactPerson: '',
        contactPhone: ''
      });
      
      setError(null); // Clear any previous errors
      
      // Refresh data to show the new request
      fetchData();
      setActiveTab('requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Failed to submit request: ${error.response.data.error}`);
      } else {
        setError('Failed to submit request. Please try again.');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <h1>Logistics Agent</h1>
        </div>
        <div className="user-controls">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === 'plans' ? 'active' : ''}>
            <button onClick={() => setActiveTab('plans')}>Available Plans</button>
          </li>
          <li className={activeTab === 'requests' ? 'active' : ''}>
            <button onClick={() => setActiveTab('requests')}>My Requests</button>
          </li>
        </ul>
      </nav>
      
      {activeTab === 'plans' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Available Transportation Plans</h2>
          </div>
          
          {loading ? (
            <div className="loading">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="no-data">No transportation plans available at the moment.</div>
          ) : (
            <div className="plans-table-container">
              <table className="data-table plans-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Route</th>
                    <th>Schedule</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan._id}>
                      <td>
                        <div className="vehicle-info">
                          <strong>{plan.vehicleType}</strong>
                          <span>{plan.vehicleNumber}</span>
                          <span>{plan.numberOfVehicles} vehicle(s)</span>
                        </div>
                      </td>
                      <td>
                        <div className="route-info">
                          <div className="route-path">
                            <span className="route-from">{plan.route?.from || plan.from}</span>
                            <span className="route-arrow">→</span>
                            <span className="route-to">{plan.route?.to || plan.to}</span>
                          </div>
                          {plan.route?.estimatedDistance && (
                            <span className="route-distance">{plan.route.estimatedDistance} km</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="schedule-info">
                          <div>{new Date(plan.startingTime).toLocaleDateString()}</div>
                          <div>{new Date(plan.startingTime).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td>
                        <div className="capacity-info">
                          <div>{plan.availableCapacity || 'N/A'} / {plan.capacity || 'N/A'} kg</div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => setSelectedPlan(plan._id)}
                          >
                            Request
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {selectedPlan && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Create Shipping Request</h3>
                  <button className="close-btn" onClick={() => setSelectedPlan(null)}>×</button>
                </div>
                <div className="modal-body">
                  <form className="create-plan-form">
                    <div className="form-group">
                      <h3>Cargo Details</h3>
                      <div className="form-row">
                        <div className="form-field">
                          <label>Box Count</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={requestForm.boxCount}
                            onChange={(e) => setRequestForm({...requestForm, boxCount: e.target.value})}
                          />
                        </div>
                        <div className="form-field">
                          <label>Size</label>
                          <select
                            value={requestForm.size}
                            onChange={(e) => setRequestForm({...requestForm, size: e.target.value})}
                          >
                            <option value="big">Big</option>
                            <option value="small">Small</option>
                            <option value="unsized">Unsized</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label>Weight (kg)</label>
                          <input
                            type="number"
                            required
                            min="0.1"
                            step="0.1"
                            value={requestForm.weight}
                            onChange={(e) => setRequestForm({...requestForm, weight: e.target.value})}
                          />
                        </div>
                        <div className="form-field">
                          <label>Price ($)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={requestForm.price}
                            onChange={(e) => setRequestForm({...requestForm, price: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <h3>Additional Information</h3>
                      <div className="form-row">
                        <div className="form-field full-width">
                          <label>Description</label>
                          <textarea
                            value={requestForm.description}
                            onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                            rows="2"
                            placeholder="Brief description of cargo contents"
                          ></textarea>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-field full-width">
                          <label>Special Instructions</label>
                          <textarea
                            value={requestForm.specialInstructions}
                            onChange={(e) => setRequestForm({...requestForm, specialInstructions: e.target.value})}
                            rows="2"
                            placeholder="Any special handling instructions"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <h3>Contact Information</h3>
                      <div className="form-row">
                        <div className="form-field">
                          <label>Contact Person</label>
                          <input
                            type="text"
                            value={requestForm.contactPerson}
                            onChange={(e) => setRequestForm({...requestForm, contactPerson: e.target.value})}
                            placeholder="Name of contact person"
                          />
                        </div>
                        <div className="form-field">
                          <label>Contact Phone</label>
                          <input
                            type="text"
                            value={requestForm.contactPhone}
                            onChange={(e) => setRequestForm({...requestForm, contactPhone: e.target.value})}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setSelectedPlan(null)}>Cancel</button>
                  <button 
                    className="submit-btn" 
                    onClick={() => handleRequest(selectedPlan)}
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'requests' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2>My Shipping Requests</h2>
          </div>
          
          {loading ? (
            <div className="loading">Loading your requests...</div>
          ) : myRequests.length === 0 ? (
            <div className="no-data">You haven't made any shipping requests yet.</div>
          ) : (
            <div className="requests-table-container">
              <table className="data-table requests-table">
                <thead>
                  <tr>
                    <th>Plan Details</th>
                    <th>Cargo Details</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(request => {
                    const plan = plans.find(p => p._id === request.planId);
                    return (
                      <tr key={request._id}>
                        <td>
                          {plan ? (
                            <div className="plan-info">
                              <div>{plan.vehicleType} - {plan.vehicleNumber}</div>
                              <div className="route-mini">
                                {plan.route?.from || plan.from} → {plan.route?.to || plan.to}
                              </div>
                            </div>
                          ) : (
                            <span>Plan details not available</span>
                          )}
                        </td>
                        <td>
                          <div className="cargo-info">
                            <div>{request.boxCount} boxes ({request.size})</div>
                            <div>{request.weight} kg</div>
                          </div>
                        </td>
                        <td>
                          <div className="price-info">
                            <strong>${request.price}</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${request.status}`}>{request.status}</span>
                        </td>
                        <td>
                          <div className="date-info">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
