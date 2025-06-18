/**
 * Backend API Endpoint Example - Node.js/Express
 * Dit is een voorbeeldimplementatie van hoe de backend de JSON-data kan verwerken
 * en naar een SQL database kan schrijven
 */

// Voorbeeld met Express.js en een SQL database (bijv. MySQL, PostgreSQL)
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * POST /api/register
 * Endpoint voor gebruikersregistratie
 */
router.post(
  '/api/register',
  [
    // Validatie middleware
    body('user.email').isEmail().normalizeEmail(),
    body('user.password').isLength({ min: 8 }),
    body('user.firstName').trim().isLength({ min: 1 }),
    body('user.lastName').trim().isLength({ min: 1 }),
    body('user.role').isIn(['student', 'bedrijf']),
  ],
  async (req, res) => {
    try {
      // Validatie controleren
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validatie gefaald',
          errors: errors.array(),
        });
      }

      const registrationData = req.body;
      console.log(
        'Ontvangen registratie data:',
        JSON.stringify(registrationData, null, 2)
      );

      // Controleer of e-mail al bestaat
      const existingUser = await checkEmailExists(registrationData.user.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Een account met dit e-mailadres bestaat al',
        });
      }

      // Hash het wachtwoord
      const hashedPassword = await bcrypt.hash(
        registrationData.user.password,
        12
      );

      // Start database transactie
      const db = await getDBConnection(); // Jouw database connection
      await db.beginTransaction();

      try {
        // 1. Insert in users tabel
        const userResult = await db.query(
          `
        INSERT INTO users (
          first_name, last_name, email, password_hash, role,
          is_active, is_verified, email_verified, profile_completed,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
          [
            registrationData.user.firstName,
            registrationData.user.lastName,
            registrationData.user.email,
            hashedPassword,
            registrationData.user.role,
            registrationData.status.isActive,
            registrationData.status.isVerified,
            registrationData.status.emailVerified,
            registrationData.status.profileCompleted,
          ]
        );

        const userId = userResult.insertId;

        // 2. Insert in user_metadata tabel
        await db.query(
          `
        INSERT INTO user_metadata (
          user_id, registration_method, user_agent, source,
          browser_language, timezone, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
          [
            userId,
            registrationData.metadata.registrationMethod,
            registrationData.metadata.userAgent,
            registrationData.metadata.source,
            registrationData.metadata.browserLanguage,
            registrationData.metadata.timezone,
            req.ip, // IP adres van request
          ]
        );

        // 3. Insert profieldata afhankelijk van rol
        if (registrationData.user.role === 'student') {
          await db.query(
            `
          INSERT INTO student_profiles (
            user_id, student_number, university, study_program,
            graduation_year, bio, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
            [
              userId,
              registrationData.profile.studentInfo.studentNumber,
              registrationData.profile.studentInfo.university,
              registrationData.profile.studentInfo.studyProgram,
              registrationData.profile.studentInfo.graduationYear,
              registrationData.profile.studentInfo.bio,
            ]
          );
        } else {
          await db.query(
            `
          INSERT INTO company_profiles (
            user_id, company_name, company_size, industry,
            website, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
            [
              userId,
              registrationData.profile.companyInfo.companyName,
              registrationData.profile.companyInfo.companySize,
              registrationData.profile.companyInfo.industry,
              registrationData.profile.companyInfo.website,
              registrationData.profile.companyInfo.description,
            ]
          );
        }

        // 4. Insert gebruikersvoorkeuren
        await db.query(
          `
        INSERT INTO user_preferences (
          user_id, email_notifications, push_notifications, 
          marketing_notifications, profile_visibility,
          contact_info_visibility, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
          [
            userId,
            registrationData.preferences.notifications.email,
            registrationData.preferences.notifications.push,
            registrationData.preferences.notifications.marketing,
            registrationData.preferences.privacy.profileVisibility,
            registrationData.preferences.privacy.contactInfoVisibility,
          ]
        );

        // Commit transactie
        await db.commit();

        // Stuur verificatie e-mail (implementatie afhankelijk van je mail service)
        await sendVerificationEmail(registrationData.user.email, userId);

        // Succesvol response
        res.status(201).json({
          success: true,
          message: 'Registratie succesvol! Check je e-mail voor verificatie.',
          data: {
            id: userId,
            email: registrationData.user.email,
            role: registrationData.user.role,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (dbError) {
        // Rollback bij database fout
        await db.rollback();
        throw dbError;
      }
    } catch (error) {
      console.error('Registratie fout:', error);

      res.status(500).json({
        success: false,
        message: 'Interne server fout tijdens registratie',
      });
    }
  }
);

/**
 * SQL Database Schema voor de registratie data
 * Gebruik deze tabellen om de JSON-data op te slaan
 */

// Users tabel (hoofdtabel)
const USERS_TABLE_SQL = `
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'bedrijf') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
);
`;

// User metadata tabel
const USER_METADATA_TABLE_SQL = `
CREATE TABLE user_metadata (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  registration_method VARCHAR(50),
  user_agent TEXT,
  source VARCHAR(100),
  browser_language VARCHAR(10),
  timezone VARCHAR(50),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
`;

// Student profiles tabel
const STUDENT_PROFILES_TABLE_SQL = `
CREATE TABLE student_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  student_number VARCHAR(50),
  university VARCHAR(200),
  study_program VARCHAR(200),
  graduation_year INT,
  academic_year VARCHAR(20),
  bio TEXT,
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  cv_file_path VARCHAR(500),
  profile_picture_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_graduation_year (graduation_year)
);
`;

// Company profiles tabel
const COMPANY_PROFILES_TABLE_SQL = `
CREATE TABLE company_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_name VARCHAR(200),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  logo_path VARCHAR(500),
  street VARCHAR(200),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'België',
  contact_person_name VARCHAR(200),
  contact_person_position VARCHAR(100),
  contact_person_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_company_name (company_name),
  INDEX idx_industry (industry)
);
`;

// User preferences tabel
const USER_PREFERENCES_TABLE_SQL = `
CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  speeddate_reminders BOOLEAN DEFAULT TRUE,
  profile_visibility ENUM('public', 'limited', 'private') DEFAULT 'public',
  contact_info_visibility ENUM('public', 'limited', 'private') DEFAULT 'limited',
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_messaging BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
`;

// Skills tabel (voor student vaardigheden)
const SKILLS_TABLE_SQL = `
CREATE TABLE skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_name (name),
  INDEX idx_category (category)
);
`;

// Student skills junction tabel
const STUDENT_SKILLS_TABLE_SQL = `
CREATE TABLE student_skills (
  student_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (student_id, skill_id),
  FOREIGN KEY (student_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
`;

// Helper functies
async function checkEmailExists(email) {
  // Implementatie om te controleren of email al bestaat
  const db = await getDBConnection();
  const result = await db.query('SELECT id FROM users WHERE email = ?', [
    email,
  ]);
  return result.length > 0;
}

async function sendVerificationEmail(email, userId) {
  // Implementatie voor het versturen van verificatie e-mail
  // Bijv. met nodemailer, SendGrid, etc.
  console.log(
    `Stuur verificatie e-mail naar ${email} voor gebruiker ${userId}`
  );
}

async function getDBConnection() {
  // Retourneer je database connectie
  // Implementatie afhankelijk van je database library (mysql2, pg, etc.)
}

module.exports = router;
