import { API_BASE_URL } from './config';

// Safe access to window (only on client side)
const getAPIBase = () => {
  if (typeof window !== 'undefined' && window._API_BASE) {
    return window._API_BASE;
  }
  return API_BASE_URL;
};

const API_BASE = getAPIBase();

// Helper to get auth token (only works on client side)
const getAuthToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to add auth header
const authHeader = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint without trailing slash
 * @param {object} params - URL parameters
 * @param {boolean} auth - Whether to include auth token
 */
export async function get(endpoint, params = {}, auth = false) {
  // Build URL with query params
  let urlString = `${API_BASE}/${endpoint}`;
  
  // Add query parameters
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  if (queryParams.toString()) {
    urlString += `?${queryParams.toString()}`;
  }
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...(auth ? authHeader() : {})
  };
  
  console.log('API: Making GET request to:', urlString);
  
  const res = await fetch(urlString, { method: 'GET', headers });
  
  // Get response text first (can only read body once)
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  
  // Check if response is OK
  if (!res.ok) {
    // Don't log 401 errors for verifyAuth endpoint (expected when token expires)
    const isVerifyAuth = urlString.includes('verifyAuth');
    if (!isVerifyAuth || res.status !== 401) {
      console.error('API: Error response:', res.status, text.substring(0, 200));
    }
    throw new Error(`API error: ${res.status} ${res.statusText}. ${text.substring(0, 100)}`);
  }
  
  // Check content type before parsing
  if (!contentType.includes('application/json')) {
    console.error('API: Non-JSON response received:', text.substring(0, 200));
    throw new Error(`Expected JSON but received: ${contentType}. Response: ${text.substring(0, 100)}`);
  }
  
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('API: JSON parse error:', parseError, 'Response text:', text.substring(0, 200));
    throw new Error(`Failed to parse JSON response: ${parseError.message}`);
  }
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint without trailing slash
 * @param {object} body - Request body
 * @param {boolean} auth - Whether to include auth token
 */
export async function post(endpoint, body, auth = false) {
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
    ...(auth ? authHeader() : {})
  };
  
  const url = `${API_BASE}/${endpoint}`;
  console.log('API: Making POST request to:', url);
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  // Get response text first (can only read body once)
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  
  // Check if response is OK
  if (!res.ok) {
    console.error('API: Error response:', res.status, text.substring(0, 200));
    throw new Error(`API error: ${res.status} ${res.statusText}. ${text.substring(0, 100)}`);
  }
  
  // Check content type before parsing
  if (!contentType.includes('application/json')) {
    console.error('API: Non-JSON response received:', text.substring(0, 200));
    throw new Error(`Expected JSON but received: ${contentType}. Response: ${text.substring(0, 100)}`);
  }
  
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('API: JSON parse error:', parseError, 'Response text:', text.substring(0, 200));
    throw new Error(`Failed to parse JSON response: ${parseError.message}`);
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<object>} Authentication status and user data
 */
export async function verifyAuth() {
  try {
    if (!getAuthToken()) return { authenticated: false };
    
    // Use Next.js API route: /api/backend/verifyAuth
    const data = await get('verifyAuth', {}, true);
    return data;
  } catch (error) {
    // 401 errors are expected when tokens expire - don't log as error
    if (error.message && error.message.includes('401')) {
      // Token expired or invalid - silently return unauthenticated
      return { authenticated: false };
    }
    // Only log unexpected errors
    console.error('Auth verification failed:', error);
    return { authenticated: false, error };
  }
}

/**
 * Login user
 * @param {object} credentials - User credentials
 * @returns {Promise<object>} Login result
 */
export async function login(credentials) {
  console.log('API: Sending login request with:', credentials);
  
  try {
    // Use Next.js API route: /api/backend/login
    // The rewrite rule in next.config.js also allows /backend/login
    const data = await post('login', credentials);
    console.log('API: Received login response:', data);
    
    // Handle standardized API response format: { success: true, data: { token, user, provider } }
    const responseData = data.data || data; // Support both old and new format for backward compatibility
    
    if (data.success && responseData.token) {
      console.log('API: Login successful, storing token and user data');
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        
        // Also store provider data if available
        if (responseData.provider) {
          console.log('API: Provider data available, storing in localStorage');
          localStorage.setItem('provider', JSON.stringify(responseData.provider));
        }
      }
      
      // Return in the format expected by frontend components
      return {
        success: true,
        token: responseData.token,
        user: responseData.user,
        provider: responseData.provider
      };
    } else {
      console.log('API: Login failed:', data.message);
    }
    
    return data;
  } catch (error) {
    console.error('API: Login error:', error);
    throw error;
  }
}

/**
 * Register user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Registration result
 */
export async function register(userData) {
  // Use Next.js API route: /api/backend/register
  return await post('register', userData);
}

export async function changePassword(payload) {
  // Use Next.js API route: /api/backend/changePassword
  return await post('changePassword', payload);
}

/**
 * Logout user
 * Note: This function only clears localStorage.
 * Navigation should be handled by the component using React Router.
 */
export function logout() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('provider');
    // Don't use window.location.href - let React Router handle navigation
    // Components should use navigate('/login') after calling this
  }
}

/**
 * Get current user from localStorage
 * @returns {object|null} User data or null if not logged in
 */
export function getCurrentUser() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }
  return null;
}

/**
 * Debug helper to check provider ID issues
 * @param {string} action - Action to perform: check_provider_exists, list_all_providers, check_auth_flow
 * @param {object} params - Parameters specific to the action
 * @returns {Promise<object>} Debug information
 */
export async function debugProvider(action, params = {}) {
  try {
    // First try to get provider ID from params, then from localStorage
    if (!params.provider_id && typeof window !== 'undefined' && window.localStorage) {
      const providerStr = localStorage.getItem('provider');
      if (providerStr) {
        try {
          const provider = JSON.parse(providerStr);
          if (provider?.provider_id) {
            params.provider_id = provider.provider_id;
          }
        } catch (e) {
          console.error('Error parsing provider from localStorage:', e);
        }
      }
    }
    
    // Add action to params
    params.action = action;
    
    // Use GET for simple checks, POST for more complex ones
    if (['check_provider_exists', 'list_all_providers'].includes(action)) {
      return await get('debug_provider_auth.php', params, true);
    } else {
      return await post('debug_provider_auth.php', params, true);
    }
  } catch (error) {
    console.error('Debug provider error:', error);
    return { success: false, error: error.message };
  }
}

// Export all functions
export default {
  get,
  post,
  login,
  register,
  logout,
  verifyAuth,
  getCurrentUser,
  debugProvider,
  API_BASE
};
