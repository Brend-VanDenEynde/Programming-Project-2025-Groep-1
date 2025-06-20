/**
 * Skills API utilities
 * Demonstrates how to use the new API utilities for skills-related endpoints
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  publicApiPost,
} from '../utils/api.js';

/**
 * Fetch all available skills from the API
 * @returns {Promise<Array>} Array of skills
 */
export async function fetchSkills() {
  try {
    const skills = await apiGet('https://api.ehb-match.me/skills');
    return skills;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all students from the API
 * @returns {Promise<Array>} Array of students
 */
export async function fetchStudents() {
  try {
    const students = await apiGet('https://api.ehb-match.me/studenten');
    return students;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch a specific student by ID
 * @param {string} studentId - The student ID
 * @returns {Promise<Object>} Student data
 */
export async function fetchStudentById(studentId) {
  try {
    const student = await apiGet(
      `https://api.ehb-match.me/studenten/${studentId}`
    );
    return student;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all companies from the API
 * @returns {Promise<Array>} Array of companies
 */
export async function fetchCompanies() {
  try {
    const companies = await apiGet('https://api.ehb-match.me/bedrijven');
    return companies;
  } catch (error) {
    throw error;
  }
}

/**
 * Update student profile data
 * @param {string} studentId - The student ID
 * @param {Object} profileData - The updated profile data
 * @returns {Promise<Object>} Updated student data
 */
export async function updateStudentProfile(studentId, profileData) {
  try {
    const updatedStudent = await apiPut(
      `https://api.ehb-match.me/studenten/${studentId}`,
      profileData
    );
    return updatedStudent;
  } catch (error) {
    throw error;
  }
}

/**
 * Save student search criteria
 * @param {string} studentId - The student ID
 * @param {Object} criteria - The search criteria
 * @returns {Promise<Object>} Response from server
 */
export async function saveSearchCriteria(studentId, criteria) {
  try {
    const response = await apiPost(
      `https://api.ehb-match.me/studenten/${studentId}/criteria`,
      criteria
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a user account (accessible to account owner and admins)
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

/**
 * Register a new company
 * @param {Object} companyData - The company registration data
 * @returns {Promise<Object>} Registration response from server
 */
export async function registerCompany(companyData) {
  try {
    const response = await fetch(
      'https://api.ehb-match.me/auth/register/bedrijf',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Company registration failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch pending speeddate requests for the authenticated company
 * @param {number} companyId - Optional company ID to fetch pending speeddates for. If omitted, uses the authenticated user.
 * @returns {Promise<Array>} Array of pending speeddate requests
 */
export async function fetchPendingSpeeddates(companyId = null) {
  try {
    const url = companyId
      ? `https://api.ehb-match.me/speeddates/pending?id=${companyId}`
      : 'https://api.ehb-match.me/speeddates/pending';

    const speeddates = await apiGet(url);
    return speeddates;
  } catch (error) {
    throw error;
  }
}

/**
 * Accept a speeddate request
 * @param {number} speeddateId - The speeddate ID to accept
 * @returns {Promise<Object>} The accepted speeddate data
 */
export async function acceptSpeeddateRequest(speeddateId) {
  try {
    const response = await apiPost(
      `https://api.ehb-match.me/speeddates/accept/${speeddateId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Reject a speeddate request
 * @param {number} speeddateId - The speeddate ID to reject
 * @returns {Promise<Object>} The rejected speeddate data
 */
export async function rejectSpeeddateRequest(speeddateId) {
  try {
    const response = await apiPost(
      `https://api.ehb-match.me/speeddates/reject/${speeddateId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch confirmed speeddates for a company
 * @param {number} companyId - Optional company ID to fetch speeddates for. If omitted, uses the authenticated user.
 * @returns {Promise<Array>} Array of confirmed speeddate data
 */
export async function fetchCompanySpeeddates(companyId = null) {
  try {
    const url = companyId
      ? `https://api.ehb-match.me/speeddates?id=${companyId}`
      : 'https://api.ehb-match.me/speeddates';

    const speeddates = await apiGet(url);
    return speeddates;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch speeddates for a student
 * @param {number} studentId - Optional student ID to fetch speeddates for. If omitted, uses the authenticated user.
 * @returns {Promise<Array>} Array of student speeddate data
 */
export async function fetchStudentSpeeddates(studentId = null) {
  try {
    const url = studentId
      ? `https://api.ehb-match.me/speeddates/student?id=${studentId}`
      : 'https://api.ehb-match.me/speeddates/student';

    const speeddates = await apiGet(url);
    return speeddates;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch speeddate requests for a student
 * @param {number} studentId - Optional student ID to fetch speeddate requests for. If omitted, uses the authenticated user.
 * @returns {Promise<Array>} Array of student speeddate request data
 */
export async function fetchStudentSpeeddateRequests(studentId = null) {
  try {
    const url = studentId
      ? `https://api.ehb-match.me/speeddates/student/requests?id=${studentId}`
      : 'https://api.ehb-match.me/speeddates/student/requests';

    const requests = await apiGet(url);
    return requests;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch discover students for a company
 * @param {number} bedrijfId - Optional company ID to fetch matched students for. If omitted, uses the authenticated user.
 * @param {boolean} suggestions - If true (default), results are weighted by functie, opleiding and skills.
 * @param {boolean} onlyNew - If true, only returns students that have not been matched with the bedrijf before.
 * @returns {Promise<Array>} Array of matched students data ordered by relevance
 */
export async function fetchDiscoverStudenten(
  bedrijfId = null,
  suggestions = true,
  onlyNew = false
) {
  try {
    let url = 'https://api.ehb-match.me/discover/studenten';
    const params = new URLSearchParams();

    if (bedrijfId) {
      params.append('id', bedrijfId);
    }
    params.append('suggestions', suggestions);
    params.append('onlyNew', onlyNew);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    const students = await apiGet(url);
    return students;
  } catch (error) {
    throw error;
  }
}

/**
 * Send a contact message to the support team
 */
export async function sendContactMessage(contactData) {
  const response = await fetch('https://api.ehb-match.me/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error(`Contact verzenden mislukt: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create a new speeddate request
 * @param {number} studentId - The student ID
 * @param {number} bedrijfId - The company ID
 * @param {string} datum - The datetime in format "YYYY-MM-DD HH:MM:SS"
 * @returns {Promise<Object>} Speeddate creation response
 */
export async function createSpeeddate(studentId, bedrijfId, datum) {
  try {
    const speeddateData = {
      id_student: parseInt(studentId),
      id_bedrijf: parseInt(bedrijfId),
      datum: datum,
    };

    const response = await apiPost(
      'https://api.ehb-match.me/speeddates',
      speeddateData
    );
    return response;
  } catch (error) {
    console.error('Error creating speeddate:', error);
    throw error;
  }
}
