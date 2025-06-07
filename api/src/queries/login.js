const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();


async function getWachtwoord(emailadres) {
    const [rows] = await pool.query('SELECT wachtwoord FROM gebruiker WHERE email = ?', [emailadres]);
    return rows[0];
}


async function isAdmin(id) {
    const pool = getPool('ehbmatch');
    const query = 'SELECT is_admin FROM gebruiker WHERE id = ?'; // Corrected table name

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0].is_admin; // let op veldnaam
        } else {
            return false;
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function login(email, wachtwoord) {
    const pool = getPool('ehbmatch'); // Updated database name
    const query = 'SELECT id, wachtwoord FROM gebruiker WHERE email = ?'; // Corrected table name

    console.log('Executing query:', query, 'with email:', email); // Log the query and email

    try {
        const [rows] = await pool.query(query, [email]);
        console.log('Query result:', rows); // Log the query result

        if (rows.length > 0 && rows[0].wachtwoord === wachtwoord) {
            return rows[0].id;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

module.exports = {
    login,
    isAdmin
};
