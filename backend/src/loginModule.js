const { User, InvalidToken, Profile } = require('./db/MongoDatabase.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('./AppError.js');
require('dotenv').config();

const saltRounds = 10;
const secretKey = process.env.JWT_SECRET || 'secretkeyhehe';

const generateToken = async (username) => {
    const jti = crypto.randomBytes(16).toString('hex'); // unique identifier
    return jwt.sign({ username, jti }, secretKey, { expiresIn: '24h' });
};

const isTokenInvalidated = async (token) => {
    try {
        const decodedToken = jwt.verify(token, secretKey);
        const jti = decodedToken.jti;

        const invalidToken = await InvalidToken.findOne({ jti: jti });

        if (invalidToken) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        throw new AppError(error.message || "Unable to decode token", error.status || 400);
    }
};


const invalidateToken = async (token) => {
    try {
        const decodedToken = jwt.verify(token, secretKey);
        const expTime = new Date(decodedToken.exp * 1000);
        const jti = decodedToken.jti;

        const invalidToken = new InvalidToken({ jti, expTime });
        await invalidToken.save();
    } catch (error) {
        throw new AppError(error.message || "Unable to invalidate token", error.status || 400);
    }
};


const validateUsername = (username) => {
    //alphanumeric, starts with letter, length 5 to 15
    const regex = /^[a-zA-Z][a-zA-Z0-9]{4,14}$/;
    return regex.test(username);
}

const validatePassword = (password) => {
    // require capital/lowercase letters, special character, and number, length 8 to 15
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,15}$/;
    return regex.test(password);
}

const addUser = async (username, password) => {
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new AppError("User already exists", 400);
        }

        if (!validateUsername(username)) {
            throw new AppError("Malformed username", 400);
        }

        if (!validatePassword(password)) {
            throw new AppError("Malformed password", 400);
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({ username, password: hashedPassword });

        await user.save();

    } catch (error) {
        throw new AppError(error.message || "Unable to add user", error.status || 400);
    }

};

const validPassword = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) return false;

    return await bcrypt.compare(password, user.password);
};

const validateUser = async (username, password) => {
    return await validPassword(username, password);
};



module.exports = { addUser, generateToken, validateUser, invalidateToken, isTokenInvalidated };