const express = require('express');
const router = express.Router();
const { register, registerAdmin } = require('../queries/register');

// Route for user registration
router.post('/resuser', async (req, res) => {
    const { email, wachtwoord } = req.body;

    try {
        const userId = await register(email, wachtwoord);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for admin registration
router.post('/resadmin', async (req, res) => {
    const { email, wachtwoord } = req.body;

    try {
        const adminId = await registerAdmin(email, wachtwoord);
        res.status(201).json({ message: 'Admin registered successfully', adminId });
    } catch (error) {
        res.status(500).json({ message: 'Admin registration failed', error: error.message });
    }
});



module.exports = router;
