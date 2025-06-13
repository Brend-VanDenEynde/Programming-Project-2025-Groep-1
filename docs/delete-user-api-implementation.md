# Delete User API Implementation - Implementation Summary

## Overview

This document outlines the implementation of the user account deletion functionality for admins in the EhB Career Launch application. The feature allows admin users to delete both student and company accounts through the admin dashboard.

## API Endpoint

- **URL**: `https://api.ehb-match.me/user/{userID}`
- **Method**: `DELETE`
- **Description**: Delete a user and their associated student or company profile
- **Access**: Account owner or admin

### Parameters

| Parameter | Type    | Location | Description                  |
| --------- | ------- | -------- | ---------------------------- |
| userID    | integer | path     | The ID of the user to delete |

### Response Codes

| Code | Description    | Details                                             |
| ---- | -------------- | --------------------------------------------------- |
| 204  | No Content     | User successfully deleted                           |
| 403  | Forbidden      | User doesn't have permission to delete this account |
| 404  | User not found | User with specified ID doesn't exist                |

## Implementation

### 1. API Utility Function (`src/utils/data-api.js`)

Added `deleteUser()` function that uses the existing `apiDelete` utility:

```javascript
/**
 * Delete a user account (admin only)
 * @param {number} userId - The user ID to delete
 * @returns {Promise<Object>} Response from server
 */
export async function deleteUser(userId) {
  try {
    const response = await apiDelete(`https://api.ehb-match.me/user/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
}
```

### 2. Admin Pages Integration

#### Student Detail Page (`src/pages/admin/admin-student-detail.js`)

- ✅ Added import for `deleteUser` function
- ✅ Updated delete button event handler to call API
- ✅ Added proper error handling for 403, 404, and general errors
- ✅ Added success feedback and navigation back to student overview
- ✅ Added `userId` field to mock student data for demo purposes

#### Company Detail Page (`src/pages/admin/admin-company-detail.js`)

- ✅ Added import for `deleteUser` function
- ✅ Updated delete button event handler to call API
- ✅ Added proper error handling for 403, 404, and general errors
- ✅ Added success feedback and navigation back to company overview
- ✅ Added `userId` field to mock company data for demo purposes

### 3. Error Handling

The implementation includes comprehensive error handling:

- **403 Forbidden**: Shows permission denied message
- **404 Not Found**: Shows user/company not found message
- **General Errors**: Shows generic error message and logs to console
- **Network Errors**: Handled by the underlying `apiDelete` function

### 4. User Experience

- **Confirmation Dialog**: Double confirmation before deletion
- **Success Feedback**: Clear success message after deletion
- **Navigation**: Automatic redirect to overview page after successful deletion
- **Error Feedback**: Clear error messages for different scenarios

## Usage Flow

1. Admin navigates to student or company detail page
2. Admin clicks "Verwijder account" or "Verwijderen" button
3. System shows confirmation dialog
4. If confirmed, system calls DELETE API endpoint
5. On success: Shows success message and redirects to overview
6. On error: Shows appropriate error message

## Mock Data Updates

For demo purposes, added `userId` fields to all mock data:

### Student Data

- `tiberius-kirk`: userId 101
- `john-smith`: userId 102
- `jean-luc-picard`: userId 103
- `daniel-vonkman`: userId 104
- `len-jaxtyn`: userId 105
- `kimberley-hester`: userId 106
- `ed-marvin`: userId 107
- `demo`: userId 999

### Company Data

- `carrefour`: userId 201
- `delhaize`: userId 202
- `colruyt`: userId 203
- `proximus`: userId 204
- `kbc`: userId 205
- `demo`: userId 999

## Security Considerations

- Only admin users can access the delete functionality
- API endpoint includes admin authentication checks
- User confirmation required before deletion
- Proper error handling prevents information leakage

## Dependencies

- `src/utils/api.js` - For `apiDelete` function with automatic token refresh
- `src/utils/auth-api.js` - For authentication handling
- Admin authentication system

## Testing

To test the functionality:

1. Log in as admin user
2. Navigate to admin dashboard
3. Go to student or company detail page
4. Click delete button
5. Confirm deletion
6. Verify API call is made and proper feedback is shown

## Notes

- In production, the actual user IDs from the database should be used instead of mock IDs
- The API endpoint should properly cascade delete all related data (student/company profiles, etc.)
- Consider implementing soft delete functionality for data recovery if needed
- Log deletion activities for audit purposes
