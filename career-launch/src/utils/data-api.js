/**
 * Skills API utilities
 * Demonstrates how to use the new API utilities for skills-related endpoints
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api.js';

/**
 * Fetch all available skills from the API
 * @returns {Promise<Array>} Array of skills
 */
export async function fetchSkills() {
  try {
    const skills = await apiGet('https://api.ehb-match.me/skills');
    return skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
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
    console.error('Error fetching students:', error);
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
    console.error('Error fetching student:', error);
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
    console.error('Error fetching companies:', error);
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
    console.error('Error updating student profile:', error);
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
    console.error('Error saving search criteria:', error);
    throw error;
  }
}
