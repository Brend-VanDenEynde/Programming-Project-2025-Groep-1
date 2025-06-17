/**
 * Authentication API utilities
 * This file contains functions for login, logout, and authentication management
 */

// Token refresh interval (check every 5 minutes)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;
// Refresh token when it expires in the next 2 minutes
const TOKEN_REFRESH_THRESHOLD = 2 * 60 * 1000;

let tokenRefreshInterval = null;

/**
 * Calls the logout endpoint to log the user out
 * @returns {Promise<Object>} API response
 */
export async function logoutUser() {
  const apiUrl = 'https://api.ehb-match.me/auth/logout';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include authorization header if we have a token
        ...(window.sessionStorage.getItem('authToken') && {
          Authorization: `Bearer ${window.sessionStorage.getItem('authToken')}`,
        }),
      },
      credentials: 'include', // Include cookies in the request (for refresh token)
    });

    if (!response.ok) {
      // Even if the API call fails, we should still clear local session data
      console.warn(
        `Logout API call failed with status ${response.status}, but continuing with local cleanup`
      );
    }

    const data = await response.json();
    console.log('Logout API response:', data);

    return {
      success: response.ok,
      message: data.message || 'Logout completed',
      data: data,
    };
  } catch (error) {
    console.error('Logout API error:', error);
    // Even if the API call fails, we should still clear local session data
    return {
      success: false,
      message: 'Logout completed locally (API unavailable)',
      error: error.message,
    };
  }
}

/**
 * Calls the refresh endpoint to refresh the authentication token
 * @returns {Promise<Object>} API response with new tokens
 */
export async function refreshToken() {
  const apiUrl = 'https://api.ehb-match.me/auth/refresh';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include authorization header if we have a token
        ...(window.sessionStorage.getItem('authToken') && {
          Authorization: `Bearer ${window.sessionStorage.getItem('authToken')}`,
        }),
      },
      credentials: 'include', // Include cookies in the request (for refresh token)
    });    if (!response.ok) {
      let errorMessage = `Token refresh failed with status ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'Refresh token expired or invalid - login required';
      }
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Token refresh successful:', data); // Update the stored auth token if a new one was provided
    if (data.accessToken) {
      window.sessionStorage.setItem('authToken', data.accessToken);
      console.log('Auth token updated in session storage');
    }

    // Store token expiry time for proactive refresh
    if (data.accessTokenExpiresAt) {
      setTokenExpiryTime(data.accessTokenExpiresAt);
    }

    return {
      success: true,
      message: data.message || 'Token refreshed successfully',
      data: data,
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    };  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Additional logging for common issues
    if (error.message.includes('401')) {
      console.warn('Token refresh failed with 401 - this usually means:');
      console.warn('1. Refresh token has expired');
      console.warn('2. Refresh token cookie is missing or invalid');
      console.warn('3. User needs to log in again');
    }
    
    return {
      success: false,
      message: 'Failed to refresh token',
      error: error.message,
      requiresLogin: error.message.includes('401'),
    };
  }
}

/**
 * Clears all authentication-related data from session storage
 */
export function clearAuthData() {
  // Stop token refresh monitoring
  stopTokenRefreshMonitoring();

  // Remove all authentication-related data
  window.sessionStorage.removeItem('authToken');
  window.sessionStorage.removeItem('tokenExpiresAt');
  window.sessionStorage.removeItem('studentData');
  window.sessionStorage.removeItem('companyData');
  window.sessionStorage.removeItem('userType');
  window.sessionStorage.removeItem('adminLoggedIn');
  window.sessionStorage.removeItem('adminUsername');
  window.sessionStorage.removeItem('accessToken');

  console.log('Authentication data cleared');
}

/**
 * Performs a complete logout process
 * 1. Calls the logout API endpoint
 * 2. Clears all local session data
 * 3. Returns the result
 * @returns {Promise<Object>} Logout result
 */
export async function performLogout() {
  try {
    // Call the logout API
    const apiResult = await logoutUser();

    // Always clear local data regardless of API response
    clearAuthData();

    return {
      success: true,
      message: apiResult.message || 'Logout successful',
      apiResponse: apiResult,
    };
  } catch (error) {
    // Even if everything fails, clear local data
    clearAuthData();

    return {
      success: true, // We consider this success because local cleanup worked
      message: 'Logout completed (with errors)',
      error: error.message,
    };
  }
}

/**
 * Checks if user is currently authenticated
 * @returns {boolean} True if user appears to be authenticated
 */
export function isAuthenticated() {
  const authToken = window.sessionStorage.getItem('authToken');
  const userType = window.sessionStorage.getItem('userType');
  const adminLoggedIn = window.sessionStorage.getItem('adminLoggedIn');

  return !!(authToken || userType || adminLoggedIn === 'true');
}

/**
 * Gets the current user type
 * @returns {string|null} 'student', 'company', 'admin', or null
 */
export function getCurrentUserType() {
  if (window.sessionStorage.getItem('adminLoggedIn') === 'true') {
    return 'admin';
  }

  return window.sessionStorage.getItem('userType');
}

/**
 * Attempts to refresh tokens and retry a failed API call
 * @param {Function} apiCall - The API function to retry after token refresh
 * @param {...any} args - Arguments to pass to the API function
 * @returns {Promise<Object>} Result of the retried API call or refresh failure
 */
export async function retryWithTokenRefresh(apiCall, ...args) {
  try {
    // First, try to refresh the token
    const refreshResult = await refreshToken();

    if (!refreshResult.success) {
      console.error('Token refresh failed, cannot retry API call');
      return {
        success: false,
        message: 'Authentication failed - please log in again',
        error: 'Token refresh failed',
      };
    }

    console.log('Token refreshed successfully, retrying API call');

    // Retry the original API call with the new token
    return await apiCall(...args);
  } catch (error) {
    console.error('Error during token refresh and retry:', error);
    return {
      success: false,
      message: 'Authentication error occurred',
      error: error.message,
    };
  }
}

/**
 * Checks if an error response indicates that the token has expired
 * @param {Response|Object} response - The response object or error
 * @returns {boolean} True if the error indicates token expiration
 */
export function isTokenExpiredError(response) {
  // Check for 401 Unauthorized status
  if (response.status === 401) {
    return true;
  }

  // Check for specific error messages that indicate token expiration
  if (response.message) {
    const message = response.message.toLowerCase();
    return (
      message.includes('token') &&
      (message.includes('expired') ||
        message.includes('invalid') ||
        message.includes('unauthorized'))
    );
  }

  return false;
}

/**
 * Gets the current user data based on user type
 * @returns {Object|null} User data object or null
 */
export function getCurrentUserData() {
  const userType = getCurrentUserType();

  switch (userType) {
    case 'student':
      const studentData = window.sessionStorage.getItem('studentData');
      return studentData ? JSON.parse(studentData) : null;
    case 'company':
      const companyData = window.sessionStorage.getItem('companyData');
      return companyData ? JSON.parse(companyData) : null;
    case 'admin':
      return {
        username: window.sessionStorage.getItem('adminUsername'),
        isAdmin: true,
      };
    default:
      return null;
  }
}

/**
 * Fetches the current authenticated user's information
 * @returns {Promise<Object>} User info from API
 */
export async function fetchUserInfo() {
  const apiUrl = 'https://api.ehb-match.me/auth/info';
  const token =
    window.sessionStorage.getItem('authToken') ||
    window.sessionStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const data = await response.json();
    console.log('User info fetched:', data);

    return {
      success: true,
      user: data.user || data,
      data: data,
    };
  } catch (error) {
    console.error('Fetch user info error:', error);
    return {
      success: false,
      message: 'Failed to fetch user information',
      error: error.message,
    };
  }
}

/**
 * Updates a company profile via API
 * @param {number} bedrijfID - The company ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} API response
 */
export async function updateBedrijfProfile(bedrijfID, updateData) {
  const apiUrl = `https://api.ehb-match.me/bedrijven/${bedrijfID}`;
  const token =
    window.sessionStorage.getItem('authToken') ||
    window.sessionStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update company: ${response.status}`
      );
    }

    const data = await response.json();
    console.log('Company updated successfully:', data);

    return {
      success: true,
      message: data.message,
      bedrijf: data.bedrijf,
      data: data,
    };
  } catch (error) {
    console.error('Update company error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update company information',
      error: error.message,
    };
  }
}

/**
 * Starts the automatic token refresh monitoring
 * This will periodically check if the token needs refreshing and do it proactively
 */
export function startTokenRefreshMonitoring() {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  tokenRefreshInterval = setInterval(async () => {
    if (isAuthenticated() && shouldRefreshToken()) {
      console.log('Proactively refreshing token before expiry...');
      try {
        await refreshToken();
        console.log('Proactive token refresh successful');
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // Don't log out automatically on proactive refresh failure
        // Let the actual API calls handle expired tokens
      }
    }
  }, TOKEN_REFRESH_INTERVAL);

  console.log('Token refresh monitoring started');
}

/**
 * Stops the automatic token refresh monitoring
 */
export function stopTokenRefreshMonitoring() {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
    console.log('Token refresh monitoring stopped');
  }
}

/**
 * Checks if the token should be refreshed based on expiry time
 * @returns {boolean} True if token should be refreshed
 */
export function shouldRefreshToken() {
  const expiryTime = getTokenExpiryTime();
  if (!expiryTime) return false;

  const now = Date.now();
  const timeUntilExpiry = expiryTime - now;

  return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
}

/**
 * Gets the token expiry time from session storage
 * @returns {number|null} Expiry time in milliseconds or null if not available
 */
export function getTokenExpiryTime() {
  const expiryString = window.sessionStorage.getItem('tokenExpiresAt');
  if (!expiryString) return null;

  const expiryTime = parseInt(expiryString, 10);
  return isNaN(expiryTime) ? null : expiryTime;
}

/**
 * Sets the token expiry time in session storage
 * @param {string|number} expiryTime - Token expiry time (ISO string or timestamp)
 */
export function setTokenExpiryTime(expiryTime) {
  if (!expiryTime) return;

  let timestamp;
  if (typeof expiryTime === 'string') {
    timestamp = new Date(expiryTime).getTime();
  } else {
    timestamp = expiryTime;
  }

  if (!isNaN(timestamp)) {
    window.sessionStorage.setItem('tokenExpiresAt', timestamp.toString());
    console.log('Token expiry time stored:', new Date(timestamp).toISOString());
  }
}

/**
 * Initializes authentication data and starts token monitoring
 * Call this function after a successful login to set up automatic token refresh
 * @param {string} token - The access token
 * @param {string|number} expiresAt - Token expiry time
 * @param {Object} userData - User data to store
 * @param {string} userType - Type of user ('student', 'company', 'admin')
 */
export function initializeAuthSession(token, expiresAt, userData, userType) {
  // Store authentication data
  window.sessionStorage.setItem('authToken', token);
  if (expiresAt) {
    setTokenExpiryTime(expiresAt);
  }

  if (userData) {
    if (userType === 'student') {
      window.sessionStorage.setItem('studentData', JSON.stringify(userData));
    } else if (userType === 'company') {
      window.sessionStorage.setItem('companyData', JSON.stringify(userData));
    }
  }

  if (userType) {
    window.sessionStorage.setItem('userType', userType);
  }

  // Start proactive token refresh monitoring
  startTokenRefreshMonitoring();

  console.log(
    'Authentication session initialized with automatic token refresh'
  );
}
