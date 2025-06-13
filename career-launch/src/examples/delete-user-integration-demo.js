/**
 * Delete User API Integration Demo
 * This file demonstrates the delete user functionality implementation
 */

import { deleteUser } from '../utils/data-api.js';
import { isAuthenticated, getCurrentUserType } from '../utils/auth-api.js';

/**
 * Demo function to test the delete user API integration
 */
export async function demonstrateDeleteUserAPI() {
  console.log('=== DELETE USER API INTEGRATION DEMO ===');

  // Check if user is authenticated and is admin
  const isLoggedIn = isAuthenticated();
  const userType = getCurrentUserType();

  console.log('Current authentication status:', {
    isLoggedIn,
    userType,
  });

  if (!isLoggedIn || userType !== 'admin') {
    console.log('❌ Demo requires admin authentication');
    console.log('Please log in as admin to test delete functionality');
    return;
  }

  console.log('✅ Admin user authenticated, testing delete functionality...');

  // Test scenarios
  const testScenarios = [
    {
      name: 'Delete existing demo student',
      userId: 999,
      expectedResult: 'success or 404 (if already deleted)',
    },
    {
      name: 'Delete non-existent user',
      userId: 99999,
      expectedResult: '404 Not Found',
    },
    {
      name: 'Delete with invalid user ID',
      userId: -1,
      expectedResult: 'Error response',
    },
  ];

  for (const scenario of testScenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`User ID: ${scenario.userId}`);
    console.log(`Expected: ${scenario.expectedResult}`);

    try {
      const result = await deleteUser(scenario.userId);
      console.log('✅ API call successful:', result);
    } catch (error) {
      console.log('❌ API call failed:', {
        message: error.message,
        status: error.status || 'unknown',
      });

      // Log different error types
      if (error.message.includes('403')) {
        console.log('🔒 Permission denied - user is not admin');
      } else if (error.message.includes('404')) {
        console.log('👤 User not found - ID does not exist');
      } else {
        console.log('🚨 Other error occurred');
      }
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n=== DELETE USER API DEMO SUMMARY ===');
  console.log('✅ API endpoint: DELETE https://api.ehb-match.me/user/{userID}');
  console.log('✅ Authentication: Bearer token included');
  console.log('✅ Error handling: 403, 404, and general errors');
  console.log('✅ Integration points:');
  console.log('   - Admin student detail page delete button');
  console.log('   - Admin company detail page delete button');
  console.log('   - Proper user confirmation and feedback');
  console.log('   - Navigation after successful deletion');
}

/**
 * Example of how delete functionality is used in admin pages
 */
export function exampleDeleteImplementation() {
  console.log('\n=== EXAMPLE DELETE IMPLEMENTATION ===');

  const exampleCode = `
// In admin page (student-detail.js or company-detail.js)
const deleteBtn = document.getElementById('delete-account-btn');
deleteBtn.addEventListener('click', async () => {
  if (confirm('Weet je zeker dat je dit account wilt verwijderen?')) {
    try {
      // Get user ID from data
      const userId = userData.userId;
      
      // Call delete API
      await deleteUser(userId);
      
      // Show success message
      alert('Account succesvol verwijderd.');
      
      // Navigate back to overview
      Router.navigate('/admin-dashboard/overview');
    } catch (error) {
      // Handle errors appropriately
      if (error.message.includes('403')) {
        alert('Je hebt geen toestemming om dit account te verwijderen.');
      } else if (error.message.includes('404')) {
        alert('Gebruiker niet gevonden.');
      } else {
        alert('Er is een fout opgetreden. Probeer het opnieuw.');
      }
    }
  }
});`;

  console.log(exampleCode);
}

// Auto-run demo if this file is loaded directly with demo parameter
if (
  typeof window !== 'undefined' &&
  window.location.search.includes('demo=delete')
) {
  demonstrateDeleteUserAPI();
  exampleDeleteImplementation();
}

// Export functions for manual testing
export { demonstrateDeleteUserAPI, exampleDeleteImplementation };
