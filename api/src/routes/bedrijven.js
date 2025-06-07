const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../authentication.js');
const { getPool } = require('../globalEntries.js');

const router = express.Router()

const bedrijvenData = JSON.parse(fs.readFileSync(path.join('data/bedrijvenlijst.json'), 'utf8'));


router.get('/', auth.authenticate, (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    res.json(bedrijvenData);
})

router.get('/:bedrijfID', auth.authenticate, (req, res) => {
    res.json(bedrijvenData[req.params['bedrijfID']]);
})

module.exports = router;