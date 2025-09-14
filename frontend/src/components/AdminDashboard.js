import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    numberOfVehicles: '',
    from: '',
    to: '',
    startingTime: '',
    capacity: '',
    estimatedDistance: '',
    estimatedDuration: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
        axios.get('/api/plans', config),
        axios.get('/api/requests', config)
      ]);
      setPlans(plansRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.vehicleType.trim()) errors.vehicleType = 'Vehicle type is required';
    if (!formData.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle number is required';
    if (!formData.numberOfVehicles) errors.numberOfVehicles = 'Number of vehicles is required';
    if (!formData.from.trim()) errors.from = 'Origin city is required';
    if (!formData.to.trim()) errors.to = 'Destination city is required';
    if (!formData.startingTime) errors.startingTime = 'Starting time is required';
    
    // Number validation
    if (formData.numberOfVehicles && (isNaN(Number(formData.numberOfVehicles)) || Number(formData.numberOfVehicles) <= 0)) {
      errors.numberOfVehicles = 'Must be a positive number';
    }
    
    if (formData.estimatedDistance && (isNaN(Number(formData.estimatedDistance)) || Number(formData.estimatedDistance) <= 0)) {
      errors.estimatedDistance = 'Must be a positive number';
    }
    
    if (formData.capacity && (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0)) {
      errors.capacity = 'Must be a positive number';
    }
    
    // Route validation
    if (formData.from.trim() === formData.to.trim() && formData.from.trim() !== '') {
      errors.to = 'Destination must be different from origin';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      // Display validation errors
      const errorMessage = Object.values(formErrors).join('\n');
      setError(errorMessage);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const planData = {
        ...formData,
        vehicleType: formData.vehicleType.trim(),
        vehicleNumber: formData.vehicleNumber.trim(),
        route: {
          from: formData.from.trim(),
          to: formData.to.trim(),
          estimatedDistance: formData.estimatedDistance,
          estimatedDuration: formData.estimatedDuration
        },
        numberOfVehicles: Number(formData.numberOfVehicles),
        capacity: Number(formData.capacity),
        availableCapacity: Number(formData.capacity)
      };
      
      // Remove fields that are now in nested objects
      delete planData.from;
      delete planData.to;
      delete planData.estimatedDistance;
      delete planData.estimatedDuration;
      
      await axios.post('/api/plans', planData, {
        headers: { Authorization: token }
      });
      
      setError(null); // Clear any previous errors
      fetchData();
      setFormData({
        vehicleType: '',
        vehicleNumber: '',
        numberOfVehicles: '',
        from: '',
        to: '',
        startingTime: '',
        capacity: '',
        estimatedDistance: '',
        estimatedDuration: '',
        notes: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Failed to create plan: ${error.response.data.error}`);
      } else {
        setError('Failed to create plan. Please try again.');
      }
    }
  };
  
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      if (!requestId || !newStatus) {
        setError('Invalid request or status');
        return;
      }
      
      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'in-transit', 'delivered', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        setError(`Invalid status: ${newStatus}`);
        return;
      }
      
      await axios.put(`/api/requests/${requestId}/status`, { status: newStatus }, {
        headers: { Authorization: token }
      });
      
      fetchData();
      setSelectedRequest(null);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error updating request status:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Failed to update status: ${error.response.data.error}`);
      } else {
        setError('Failed to update request status. Please try again.');
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <h1>Logistics Admin</h1>
        </div>
        <div className="user-controls">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === 'plans' ? 'active' : ''}>
            <button onClick={() => setActiveTab('plans')}>Plans</button>
          </li>
          <li className={activeTab === 'requests' ? 'active' : ''}>
            <button onClick={() => setActiveTab('requests')}>Requests</button>
          </li>
        </ul>
      </nav>
      
      {activeTab === 'plans' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Transportation Plans</h2>
            <button 
              className="create-btn" 
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New Plan'}
            </button>
          </div>
          
          {showCreateForm && (
            <div className="create-plan-container">
              <form onSubmit={handleSubmit} className="create-plan-form">
                <div className="form-group">
                  <h3>Vehicle Details</h3>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Vehicle Type</label>
                      <input
                        type="text"
                        required
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <label>Vehicle Number</label>
                      <input
                        type="text"
                        required
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Number of Vehicles</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.numberOfVehicles}
                        onChange={(e) => setFormData({...formData, numberOfVehicles: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <label>Capacity (kg)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <h3>Route Information</h3>
                  <div className="form-row">
                    <div className="form-field">
                      <label>From</label>
                      <input
                        type="text"
                        required
                        value={formData.from}
                        onChange={(e) => setFormData({...formData, from: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <label>To</label>
                      <input
                        type="text"
                        required
                        value={formData.to}
                        onChange={(e) => setFormData({...formData, to: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Estimated Distance (km)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.estimatedDistance}
                        onChange={(e) => setFormData({...formData, estimatedDistance: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <label>Estimated Duration (hours)</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <h3>Schedule & Notes</h3>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Starting Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startingTime}
                        onChange={(e) => setFormData({...formData, startingTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field full-width">
                      <label>Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Create Plan</button>
                </div>
              </form>
            </div>
          )}
          
          {loading ? (
            <div className="loading">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="no-data">No transportation plans found. Create your first plan!</div>
          ) : (
            <div className="plans-table-container">
              <table className="data-table plans-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Route</th>
                    <th>Schedule</th>
                    <th>Capacity</th>
                    <th>Status</th>
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
                          <div className="capacity-bar">
                            <div 
                              className="capacity-fill" 
                              style={{
                                width: plan.capacity ? `${(plan.availableCapacity / plan.capacity) * 100}%` : '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${plan.status}`}>{plan.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view-btn">View</button>
                          <button className="action-btn edit-btn">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'requests' && (
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Agent Requests</h2>
          </div>
          
          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="no-data">No agent requests found.</div>
          ) : (
            <div className="requests-table-container">
              <table className="data-table requests-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Plan Details</th>
                    <th>Cargo Details</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => {
                    const plan = plans.find(p => p._id === request.planId);
                    return (
                      <tr key={request._id}>
                        <td>
                          <div className="agent-info">
                            <strong>ID: {request.agentId}</strong>
                          </div>
                        </td>
                        <td>
                          {plan ? (
                            <div className="plan-info">
                              <div>{plan.vehicleType} - {plan.vehicleNumber}</div>
                              <div className="route-mini">
                                {plan.route?.from || plan.from} → {plan.route?.to || plan.to}
                              </div>
                            </div>
                          ) : (
                            <span>Plan not found</span>
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
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => setSelectedRequest(request)}
                            >
                              View
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button 
                                  className="action-btn approve-btn"
                                  onClick={() => handleUpdateRequestStatus(request._id, 'approved')}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="action-btn reject-btn"
                                  onClick={() => handleUpdateRequestStatus(request._id, 'rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {selectedRequest && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Request Details</h3>
                  <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="detail-group">
                    <h4>Cargo Information</h4>
                    <div className="detail-row">
                      <div className="detail-label">Box Count:</div>
                      <div className="detail-value">{selectedRequest.boxCount}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Size:</div>
                      <div className="detail-value">{selectedRequest.size}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Weight:</div>
                      <div className="detail-value">{selectedRequest.weight} kg</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Price:</div>
                      <div className="detail-value">${selectedRequest.price}</div>
                    </div>
                  </div>
                  
                  {selectedRequest.description && (
                    <div className="detail-group">
                      <h4>Description</h4>
                      <p>{selectedRequest.description}</p>
                    </div>
                  )}
                  
                  {selectedRequest.specialInstructions && (
                    <div className="detail-group">
                      <h4>Special Instructions</h4>
                      <p>{selectedRequest.specialInstructions}</p>
                    </div>
                  )}
                  
                  <div className="detail-group">
                    <h4>Status</h4>
                    <div className="detail-row">
                      <div className="detail-label">Current Status:</div>
                      <div className="detail-value">
                        <span className={`status-badge status-${selectedRequest.status}`}>
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setSelectedRequest(null)}>Close</button>
                  {selectedRequest.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => handleUpdateRequestStatus(selectedRequest._id, 'approved')}
                      >
                        Approve Request
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleUpdateRequestStatus(selectedRequest._id, 'rejected')}
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
