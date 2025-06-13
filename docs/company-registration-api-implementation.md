# Company Registration API Implementation

## Overview

This document describes the implementation of the company registration API endpoint integration for the EhB Career Launch application.

## API Endpoint

**URL:** `https://api.ehb-match.me/auth/register/bedrijf`  
**Method:** `POST`  
**Content-Type:** `application/json`

## Request Body Structure

```json
{
  "email": "info@techsolutions.com",
  "password": "password123",
  "naam": "Tech Solutions",
  "plaats": "Brussel",
  "contact_email": "contact@techsolutions.com",
  "linkedin": "/company/techsolutions",
  "profiel_foto": "/company_logo.jpg"
}
```

## Expected Response

**Success (201 Created):**

```json
{
  "message": "Company registered successfully",
  "id": 42
}
```

## Implementation Details

### Files Modified

1. **`src/pages/register-bedrijf/bedrijf-register.js`**

   - Updated form to collect required fields according to API specification
   - Added file upload functionality for company logo
   - Implemented API integration with proper error handling
   - Added form validation
   - Retrieves email/password from localStorage (from previous registration step)

2. **`src/utils/data-api.js`**
   - Added `registerCompany()` function for consistent API handling
   - Proper error handling and response parsing

### Form Fields

The company registration form now collects:

- **Bedrijfsnaam** (naam) - Required
- **Plaats** (plaats) - Required
- **Contact e-mail** (contact_email) - Required
- **LinkedIn-link** (linkedin) - Optional
- **Logo** (profiel_foto) - Optional file upload

### Integration Flow

1. User enters email/password on initial registration page
2. Data is stored in localStorage
3. User proceeds to company-specific registration form
4. Additional company information is collected
5. All data is combined and sent to API endpoint
6. On success: User is redirected to login page
7. On error: Appropriate error message is displayed

### Error Handling

- Form validation for required fields
- API error messages are displayed to user
- Network error handling
- Graceful fallback for missing localStorage data

### Key Features

- ✅ Proper API integration with `https://api.ehb-match.me/auth/register/bedrijf`
- ✅ Form validation matching API requirements
- ✅ File upload support for company logo
- ✅ Error handling and user feedback
- ✅ Integration with existing authentication flow
- ✅ Consistent with student registration implementation

## Usage

1. Navigate to registration page
2. Select "Bedrijf" as user type
3. Enter email and password
4. Fill in company-specific information
5. Optionally upload company logo
6. Submit form
7. On success, navigate to login page

## Testing

To test the implementation:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3001`
3. Click "Registreren"
4. Select "Ik ben een bedrijf"
5. Fill in email and password
6. Complete company registration form
7. Submit and verify API call in browser developer tools

## API Response Handling

- **Success:** User is redirected to login page with success message
- **Error:** Error message is displayed below the form
- **Network Error:** User-friendly network error message

---

**Implementation Date:** June 13, 2025  
**Status:** ✅ Complete  
**API Endpoint:** https://api.ehb-match.me/auth/register/bedrijf
