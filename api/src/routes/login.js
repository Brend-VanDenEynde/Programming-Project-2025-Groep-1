const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../authentication.js');
const { getPool } = require('../globalEntries.js');
const { login, isAdmin } = require('../queries/login.js');

const router = express.Router()

// Serve the login page
router.post('/', async (req, res) => {
    const { email, wachtwoord } = req.body;

    console.log('Login attempt:', { email }); // Log the email for debugging

    if (!email || !wachtwoord) {
        console.log('Missing email or password');
        return res.status(400).send('Email and password are required');
    }

    try {
        const userId = await login(email, wachtwoord);
        if (userId === null) {
            console.log('Invalid email or password');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isAdminUser = await isAdmin(userId);
        console.log('User is admin:', isAdminUser); // Log admin status

        const token = auth.generateToken(userId, isAdminUser);
        console.log('Generated token:', token); // Log the generated token

        console.log('Login successful:', { userId, isAdminUser });
        res.json({
            message: 'Login successful',
            userId,
            isAdminUser,
            token
        }); // Return JSON response instead of redirect
    } catch (error) {
        console.error('Login error:', error.message); // Log the error message
        console.error('Stack trace:', error.stack); // Log the stack trace
        res.status(500).send('Internal server error');
    }
})

// handle check admin
router.get('/test/:adminid', auth.authenticate, (req, res) => {
    res.json({ isAdmin: req.user.isAdmin });
});


module.exports = router;

