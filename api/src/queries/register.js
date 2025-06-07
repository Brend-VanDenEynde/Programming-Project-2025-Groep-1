const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();
async function register(email, wachtwoord) {
    const pool = getPool('ehbmatch');
    const query = 'INSERT INTO gebruiker (email, wachtwoord) VALUES (?,?)';

    try {
        const [result] = await pool.query(query, [email, wachtwoord]);
        return result.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in register:', error.message, error.stack);
        throw new Error('Registration failed');
    }
}

async function registerAdmin(email, wachtwoord) {
    const pool = getPool('ehbmatch');
    const query = 'INSERT INTO gebruiker (email, wachtwoord, is_admin) VALUES (?,?,1)';

    try {
        const [result] = await pool.query(query, [email, wachtwoord]);
        return result.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in registerAdmin:', error.message, error.stack);
        throw new Error('Admin registration failed');
    }
}

async function registerStudent(email, wachtwoord) {
    const pool = getPool('ehbmatch');
    const query = 'INSERT INTO gebruiker (email, wachtwoord, is_admin) VALUES (?,?,0)';
    const query2 = 'INSERT INTO student (gebruiker_id, voornaam, achternaam, linkedin, profiel_foto, studiejaar, opleiding_id) VALUES (?, ?, ?, ?, ?, ?, ?)';

    try {
        const [result] = await pool.query(query, [email, wachtwoord]);
        return result.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in registerStudent:', error.message, error.stack);
        throw new Error('Student registration failed');
    }
}

module.exports = {
    register,
    registerAdmin
};