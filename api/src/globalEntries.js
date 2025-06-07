const mysql = require('mysql2');
require('dotenv').config();

const allowedDatabases = process.env.ALLOWED_DB;

const pools = {};

function getPool(dbName = 'ehbmatch') {
    console.log(`Attempting to connect to database: ${dbName}`); // Log the database name

    if (!allowedDatabases.includes(dbName)) {
        console.error(`Access denied: Invalid database name "${dbName}"`); // Log invalid database name
        throw new Error(`Access denied: Invalid database name "${dbName}"`);
    }

    if (!pools[dbName]) {
        try {
            pools[dbName] = mysql.createPool({
                host: 'localhost',
                user: process.env.USER || 'root',
                password: process.env.PASS || '',
                port: process.env.PORT || 3306,
                database: dbName,
                waitForConnections: true,
                connectionLimit: 20,
                queueLimit: 0
            }).promise();

            console.log(`Successfully connected to database: ${dbName}`); // Log successful connection
        } catch (error) {
            console.error(`Failed to connect to database: ${dbName}`, error); // Log connection error
            throw error;
        }
    }

    return pools[dbName];
}

module.exports = { getPool };
