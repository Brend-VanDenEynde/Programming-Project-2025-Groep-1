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
