require('dotenv').config();
const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token !== process.env.TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid or missing token' });
    }

    next();
}

function generateToken(userId, isAdmin) {
    const payload = { userId, isAdmin };
    const secret = process.env.JWT_SECRET || 'default_secret'; // Use default secret if JWT_SECRET is not set
    const options = { expiresIn: '1h' };

    return jwt.sign(payload, secret, options);
}

module.exports = {
    authenticate,
    generateToken
};