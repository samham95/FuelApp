const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { addUser, generateToken, validateUser, invalidateToken, isTokenInvalidated } = require('./loginModule.js');
const { getProfileData } = require('./profileModule.js');
const requireAuth = require('./requireAuth.js');
const AppError = require('./AppError.js');
require('dotenv').config();
require('express-async-errors');

const secretKey = process.env.JWT_SECRET || 'secretkeyhehe';
const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // update .env for production
    credentials: true, // send cookies with requests
};

const protectedRouter = express.Router();
const unprotectedRouter = express.Router();
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretKey));
app.use('/api/auth', protectedRouter);
app.use('/api', unprotectedRouter);

protectedRouter.post('/', requireAuth, async (req, res) => {
    const username = req.username;
    res.status(200).send(`Successfully authenticated ${username}`);
});

protectedRouter.get('/profile/:username', requireAuth, async (req, res) => {
    const username = req.username;
    try {
        const profileData = await getProfileData(username);
        res.status(200).json({ ...profileData });
    } catch (error) {
        res.status(error.status || 400).send(error.message || `Unable to fetch profile data for user: ${username}`);
    }

})

protectedRouter.post('/logout', requireAuth, async (req, res) => {
    const username = req.username;
    const token = req.signedCookies.auth_token;
    try {
        await invalidateToken(token);
        res.clearCookie('auth_token', { httpOnly: true, signed: true });
        res.status(200).send(`User ${username} logged out`);
    } catch (error) {
        res.status(error.status || 400).send(error.message || `Unable to log out user ${username}`);
    }
})

unprotectedRouter.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (! await validateUser(username, password)) {
            throw new AppError("Invalid Credentials", 401)
        }
        const token = await generateToken(username);
        res.cookie('auth_token', token, { httpOnly: true, signed: true });
        res.status(200).json({
            msg: `Successfully validated credentials for user: ${username}`,
        })
    } catch (err) {
        res.status(err.status || 500).json({
            msg: `Invalid login: ${err.message || ""}`
        })
    }
});

unprotectedRouter.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        await addUser(username, password);
        res.status(200).send(`Successfully created user ${username} skeleton`);

    } catch (error) {
        res.status(error.status || 400).send(error.message || "Unable to create user")
    }
})

app.use((req, res) => {
    res.status(404).send("RESOURCE NOT FOUND");
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).send(error.message || "Internal Server Error");
});

module.exports = app;