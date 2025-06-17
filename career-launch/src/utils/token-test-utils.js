/**
 * Token Refresh System Test Utilities
 * Use these functions to test the automatic token refresh functionality
 */

import {
  startTokenRefreshMonitoring,
  stopTokenRefreshMonitoring,
  shouldRefreshToken,
  getTokenExpiryTime,
  setTokenExpiryTime,
  refreshToken,
} from '../utils/auth-api.js';
import { apiGet } from '../utils/api.js';

/**
 * Test the proactive token refresh system
 */
export async function testProactiveRefresh() {
  console.log('🧪 Testing Proactive Token Refresh...');

  // Set token to expire in 1 minute to trigger proactive refresh
  const oneMinuteFromNow = Date.now() + 1 * 60 * 1000;
  setTokenExpiryTime(oneMinuteFromNow);

  console.log(
    `⏰ Token expires at: ${new Date(oneMinuteFromNow).toISOString()}`
  );
  console.log(`🔍 Should refresh token: ${shouldRefreshToken()}`);

  // Start monitoring
  startTokenRefreshMonitoring();
  console.log('✅ Token monitoring started');

  // Wait and check if refresh happens
  setTimeout(() => {
    console.log('⏳ Checking if proactive refresh occurred...');
    const currentExpiry = getTokenExpiryTime();
    if (currentExpiry > oneMinuteFromNow) {
      console.log(
        '✅ Proactive refresh successful! New expiry:',
        new Date(currentExpiry).toISOString()
      );
    } else {
      console.log('❌ Proactive refresh may not have occurred');
    }
  }, 10000); // Check after 10 seconds
}

/**
 * Test the reactive token refresh on API calls
 */
export async function testReactiveRefresh() {
  console.log('🧪 Testing Reactive Token Refresh...');

  try {
    // This should trigger automatic refresh if token is expired/invalid
    const response = await apiGet('https://api.ehb-match.me/auth/info');
    console.log('✅ API call successful, reactive refresh working:', response);
  } catch (error) {
    if (error.message.includes('Authentication failed')) {
      console.log(
        '❌ Reactive refresh failed, user should be redirected to login'
      );
    } else {
      console.log('⚠️ Other error occurred:', error.message);
    }
  }
}

/**
 * Test manual token refresh
 */
export async function testManualRefresh() {
  console.log('🧪 Testing Manual Token Refresh...');

  try {
    const result = await refreshToken();
    if (result.success) {
      console.log('✅ Manual refresh successful:', result);
      console.log(
        '🔑 New token expires at:',
        new Date(result.accessTokenExpiresAt).toISOString()
      );
    } else {
      console.log('❌ Manual refresh failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Manual refresh error:', error.message);
  }
}

/**
 * Test token expiry time management
 */
export function testTokenExpiryManagement() {
  console.log('🧪 Testing Token Expiry Management...');

  const testTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now
  setTokenExpiryTime(testTime);

  const retrieved = getTokenExpiryTime();
  console.log(`⏰ Set expiry time: ${new Date(testTime).toISOString()}`);
  console.log(`⏰ Retrieved expiry time: ${new Date(retrieved).toISOString()}`);
  console.log(`✅ Expiry management working: ${testTime === retrieved}`);

  // Test shouldRefreshToken logic
  console.log(`🔍 Should refresh (15min): ${shouldRefreshToken()}`); // Should be false

  // Set to expire in 1 minute
  const soonExpiry = Date.now() + 1 * 60 * 1000;
  setTokenExpiryTime(soonExpiry);
  console.log(`🔍 Should refresh (1min): ${shouldRefreshToken()}`); // Should be true
}

/**
 * Test refresh token failure scenario (401 errors)
 */
export async function testRefreshTokenFailure() {
  console.log('🧪 Testing Refresh Token Failure Scenario...');

  // Store current tokens for restoration
  const originalAccessToken = window.sessionStorage.getItem('accessToken');
  const originalAuthToken = window.sessionStorage.getItem('authToken');

  try {
    // Simulate expired/invalid tokens
    window.sessionStorage.setItem('accessToken', 'invalid-token-for-testing');
    window.sessionStorage.setItem('authToken', 'invalid-token-for-testing');

    console.log('🔧 Set invalid tokens to simulate 401 scenario');

    // Try to make an API call that will trigger refresh
    try {
      const response = await apiGet('https://api.ehb-match.me/auth/info');
      console.log('⚠️ Unexpected success - tokens might not be properly expired');
    } catch (error) {
      console.log('✅ Expected failure occurred:', error.message);

      if (error.message.includes('Authentication failed')) {
        console.log('✅ Proper error handling - user should be redirected to login');
      }

      // Check if auth data was cleared
      const clearedAccessToken = window.sessionStorage.getItem('accessToken');
      const clearedAuthToken = window.sessionStorage.getItem('authToken');

      if (!clearedAccessToken && !clearedAuthToken) {
        console.log('✅ Authentication data properly cleared after failure');
      } else {
        console.log('⚠️ Authentication data not fully cleared');
      }
    }
  } finally {
    // Restore original tokens
    if (originalAccessToken) {
      window.sessionStorage.setItem('accessToken', originalAccessToken);
    }
    if (originalAuthToken) {
      window.sessionStorage.setItem('authToken', originalAuthToken);
    }
    console.log('🔄 Restored original tokens');
  }
}

/**
 * Run all tests
 */
export async function runAllTokenTests() {
  console.log('🚀 Starting Token Refresh System Tests...');
  console.log('=====================================');

  testTokenExpiryManagement();
  console.log('');

  await testManualRefresh();
  console.log('');

  await testReactiveRefresh();
  console.log('');

  await testProactiveRefresh();
  console.log('');

  await testRefreshTokenFailure();

  console.log('=====================================');
  console.log('🏁 All tests completed. Check console for results.');
}

/**
 * Stop all monitoring (cleanup)
 */
export function stopAllMonitoring() {
  stopTokenRefreshMonitoring();
  console.log('🛑 All token monitoring stopped');
}

// Export test functions for global access in browser console
window.tokenTests = {
  runAll: runAllTokenTests,
  proactive: testProactiveRefresh,
  reactive: testReactiveRefresh,
  manual: testManualRefresh,
  expiry: testTokenExpiryManagement,
  stop: stopAllMonitoring,
};

console.log(
  '🧪 Token test utilities loaded. Use window.tokenTests to run tests.'
);
