/**
 * Generic API utilities with automatic token refresh
 * This file provides a wrapper around fetch that automatically handles token refresh
 */

import {
  refreshToken,
  isTokenExpiredError,
  retryWithTokenRefresh,
} from './auth-api.js';

/**
 * Makes an authenticated API call with automatic token refresh on 401 errors
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} The fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  // Get the auth token from session storage
  // Try accessToken first (used by admin), fallback to authToken
  const accessToken = window.sessionStorage.getItem('accessToken');
  const authToken = window.sessionStorage.getItem('authToken');
  const token = accessToken || authToken;

  // Prepare headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };

  // Make the initial API call
  const requestOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, requestOptions);

    // If the response is successful, return it
    if (response.ok) {
      return response;
    }

    // If it's a 401 (Unauthorized), try to refresh the token and retry
    if (response.status === 401) {
      const refreshResult = await refreshToken();

      if (refreshResult.success) {
        // Update the Authorization header with the new token
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${refreshResult.accessToken}`,
        };

        // Retry the original request with the new token
        const retryResponse = await fetch(url, {
          ...requestOptions,
          headers: newHeaders,
        });

        return retryResponse;
      } else {
        window.location.href = '/login'; // Redirect to login on failure
        throw new Error('Authentication failed - please log in again');
      }
    }

    // For other errors, just return the response
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Makes a GET request with automatic token refresh
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The JSON response data
 */
export async function apiGet(url, options = {}) {
  const response = await authenticatedFetch(url, {
    method: 'GET',
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API GET error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();

    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return await response.json();
}

/**
 * Makes a POST request with automatic token refresh
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The JSON response data
 */
export async function apiPost(url, data = null, options = {}) {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : null,
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API POST error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Makes a PUT request with automatic token refresh
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The JSON response data
 */
export async function apiPut(url, data = null, options = {}) {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : null,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API PUT error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Makes a DELETE request with automatic token refresh
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The JSON response data or empty object for 204
 */
export async function apiDelete(url, options = {}) {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API DELETE error: ${response.status} ${response.statusText}`
    );
  }

  // Handle 204 No Content response (successful deletion)
  if (response.status === 204) {
    return { success: true, message: 'Resource deleted successfully' };
  }

  // For other successful responses, try to parse JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  // If no JSON content, return success object
  return { success: true, message: 'Operation completed successfully' };
}

/**
 * Makes a PATCH request with automatic token refresh
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The JSON response data
 */
export async function apiPatch(url, data = null, options = {}) {
  const response = await authenticatedFetch(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : null,
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API PATCH error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Makes a non-authenticated POST request for public endpoints
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The data to send in the request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} The JSON response data
 */
export async function publicApiPost(url, data = null, options = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : null,
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API POST error: ${response.status} ${response.statusText}`
    );
  }
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();

    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return await response.json();
}
