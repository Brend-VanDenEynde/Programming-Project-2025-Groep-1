const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../authentication.js');
const { getPool } = require('../globalEntries.js');
const { getAllSkills } = require('../queries/skills.js');

const router = express.Router()

router.get('/', auth.authenticate, async (req, res) => {
    try {
        const skillsdata = await getAllSkills(); // Await the asynchronous function
        res.json(skillsdata); // Return the data as JSON
    } catch (error) {
        console.error('Error fetching skills:', error.message);
        res.status(500).json({ message: 'Failed to fetch skills' });
    }
});

module.exports = router;