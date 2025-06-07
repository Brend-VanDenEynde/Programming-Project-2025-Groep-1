const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../authentication.js');
const { getPool } = require('../globalEntries.js');

const router = express.Router()

const studentenData = JSON.parse(fs.readFileSync(path.join('data/studentenlijst.json'), 'utf8'));


router.get('/', auth.authenticate, (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    res.json(studentenData);
})

router.get('/:studentID', auth.authenticate, (req, res) => {
    res.json(studentenData[req.params['studentID']]);
})

module.exports = router;