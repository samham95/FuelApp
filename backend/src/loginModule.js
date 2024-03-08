const { users, invalidTokens } = require('./db/mockDatabase.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { AppError } = require('./AppError.js');
require('dotenv').config();
const saltRounds = 10;

const secretKey = process.env.JWT_SECRET || 'secretkeyhehe';

const requireAuth = (req, res, next) => {
    const token = req.cookies.auth_token;
    const username = req.body.username;

    if (!token) {
        throw new AppError("Authentication required", 401);
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        if (isTokenInvalidated(decoded.jti)) {
            throw new AppError("Token has already been invalidated", 401);
        }
        if (username !== decoded.username) {
            throw new AppError("Invalid user token", 401)
        }
        next();
    } catch (error) {
        return res.status(error.status || 401).send(error.message || 'Invalid or expired token');
    }
};

const generateToken = async (username) => {
    const jti = crypto.randomBytes(16).toString('hex'); // unique identifier
    return jwt.sign({ username, jti }, secretKey, { expiresIn: '24h' });
};

const isTokenInvalidated = async (jti) => {
    const expTime = invalidTokens.get(jti);
    if (!expTime) return false;

    const now = new Date().getTime();
    if (now > expTime) {
        invalidTokens.delete(jti);
        return false;
    }
    return true;
}

const invalidateToken = async (jti, expTime) => {
    const now = new Date().getTime();
    if (now < expTime) {
        invalidTokens.set(jti, expTime);
    }
}

const validateUsername = (username) => {
    const regex = /^[a-zA-Z][a-zA-Z0-9]{5,15}$/; //alphanumeric, starts with letter, length 5 to 15
    return regex.test(username);
}

const validatePassword = (password) => {
    // require capital/lowercase letters, special character, and number, length 8 to 15
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
    return regex.test(password);
}

const addUser = async (username, password) => {
    if (users.has(username)) {
        throw new AppError("User already exists", 400);
    }
    if (!validateUsername(username)) {
        throw new AppError("Malformed username", 400);
    }
    if (!validatePassword(password)) {
        throw new AppError("Malformed password", 400);
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    users.set(username, {
        fullname: '',
        password: hashedPassword,
        email: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
    });
};

const validPassword = async (username, password) => {
    const user = users.get(username);
    if (!user) return false;

    return await bcrypt.compare(password, user.password);
};

const validateUser = async (username, password) => {
    return users.has(username) && await validPassword(username, password);
};



module.exports = { requireAuth, addUser, generateToken, validateUser, invalidateToken };