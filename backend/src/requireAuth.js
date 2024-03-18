const jwt = require('jsonwebtoken');
const AppError = require('./AppError.js');
const { isTokenInvalidated } = require('./loginModule.js');
const secretKey = process.env.JWT_SECRET || 'secretkeyhehe';

const requireAuth = async (req, res, next) => {
    const token = req.signedCookies.auth_token;
    req.username = req.body.username || req.params.username;

    try {
        if (!token) {
            throw new AppError('Authentication required', 401);
        }
        const decoded = jwt.verify(token, secretKey);
        if (await isTokenInvalidated(decoded.jti)) {
            throw new AppError("Token has already been invalidated", 401);
        }

        if (req.username !== decoded.username) {
            throw new AppError(`Invalid user token: ${req.username}`, 401)
        }
        next();
    } catch (error) {
        return res.status(error.status || 401).send(error.message || 'Invalid or expired token');
    }
};

module.exports = requireAuth;
