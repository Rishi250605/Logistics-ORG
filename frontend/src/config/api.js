// API Configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000/api'
  },
  production: {
    baseURL: 'https://logistics-org.onrender.com/api'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const API_BASE_URL = API_CONFIG[environment].baseURL;

// Default axios configuration
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};