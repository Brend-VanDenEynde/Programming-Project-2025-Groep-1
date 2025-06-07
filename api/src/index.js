const express = require('express')
require('dotenv').config();
const swaggerDocs = require('../docs/swagger.js');
const auth = require('./authentication.js');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

require('./authentication.js'); // Initialize authentication strategies

const bedrijven = require('./routes/bedrijven.js');
const studenten = require('./routes/studenten.js');
const login = require('./routes/login.js');
const skills = require('./routes/skills.js');
const register = require('./routes/register.js');
const opleidingen = require('./routes/opleiding.js');

// Enable CORS for all origins
app.use(cors());

// Serve static files from the 'web' directory
app.use(express.static(path.join(__dirname, '../web')));

app.use('/bedrijven', bedrijven);
app.use('/studenten', studenten);
app.use('/login', login);
app.use('/skills', skills);
app.use('/register', register);
app.use('/opleiding', opleidingen);

const port = process.env.STATUS == "production" ? 3000 : 3001;


app.get('/about', (req, res) => {
  res.json({
    "ProdName": "EhBMatch",
    "Version": `v${process.env.VERSION} (Build: ${process.env.BUILD})`
  })
})

app.get('/log-test', (req, res) => {
  console.log('HTML page loaded and API is reachable');
  res.json({ message: 'API is reachable and HTML is loaded' });
});

app.post('/login', (req, res, next) => {
  console.log('Request Body:', req.body); // Log the request body
  next();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

swaggerDocs(app);