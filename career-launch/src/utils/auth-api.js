/**
 * Authentication API utilities
 * This file contains functions for login, logout, and authentication management
 */

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
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Token refresh successful:', data);

    // Update the stored auth token if a new one was provided
    if (data.accessToken) {
      window.sessionStorage.setItem('authToken', data.accessToken);
      console.log('Auth token updated in session storage');
    }

    return {
      success: true,
      message: data.message || 'Token refreshed successfully',
      data: data,
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      message: 'Failed to refresh token',
      error: error.message,
    };
  }
}

/**
 * Clears all authentication-related data from session storage
 */
export function clearAuthData() {
  // Remove all authentication-related data
  window.sessionStorage.removeItem('authToken');
  window.sessionStorage.removeItem('studentData');
  window.sessionStorage.removeItem('companyData');
  window.sessionStorage.removeItem('userType');
  window.sessionStorage.removeItem('adminLoggedIn');
  window.sessionStorage.removeItem('adminUsername');

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
