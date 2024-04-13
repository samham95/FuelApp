const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./ErrorHandler.js')
const { addUser, generateToken, validateUser, invalidateToken, isTokenInvalidated } = require('./loginModule.js');
const { getProfileData, updateProfile } = require('./profileModule.js');
const requireAuth = require('./RequireAuth.js');
const AppError = require('./AppError.js');
const { getQuote, submitQuote, getQuoteHistory } = require('./quoteModule.js');
require('dotenv').config();
require('express-async-errors');

const secretKey = process.env.JWT_SECRET || 'secretkeyhehe';
const corsOptions = {
    origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
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

protectedRouter.get('/profile/:username', requireAuth, async (req, res, next) => {
    try {
        const username = req.username;
        const profileData = await getProfileData(username);
        res.status(200).json({ ...profileData });
    } catch (error) {
        next(error);
    }

})

protectedRouter.post('/profile/:username/edit', requireAuth, async (req, res, next) => {
    try {
        const username = req.username;
        const newProfileData = req.body;
        await updateProfile(username, newProfileData);
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        next(error);
    }
})

protectedRouter.post('/logout', requireAuth, async (req, res, next) => {
    try {
        const username = req.username;
        const token = req.signedCookies.auth_token;

        await invalidateToken(token);
        res.clearCookie('auth_token', { httpOnly: true, signed: true /*, secure: true, sameSite: "none" */ });
        res.status(200).send(`User ${username} logged out`);
    } catch (error) {
        next(error);
    }
})

unprotectedRouter.post('/login', async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (! await validateUser(username, password)) {
            throw new AppError("Invalid Credentials", 401)
        }
        const token = await generateToken(username);
        res.cookie('auth_token', token, { httpOnly: true, signed: true /*, secure: true, sameSite: "none" */ });
        res.status(200).json({
            msg: `Successfully validated credentials for user: ${username}`,
        })
    } catch (error) {
        next(error);
    }
});

unprotectedRouter.post('/register', async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        await addUser(username, password);
        res.status(200).send(`Successfully created user ${username} skeleton`);

    } catch (error) {
        next(error);
    }
})

protectedRouter.get('/quote/history/:username', requireAuth, async (req, res, next) => {
    try {
        const username = req.username;
        const quotes = await getQuoteHistory(username);
        res.status(200).json({ quotes });
    } catch (error) {
        next(error);
    }
})

protectedRouter.get('/quote/:username/:gallons', requireAuth, async (req, res, next) => {
    try {
        const username = req.username;
        const gallons = req.params.gallons;
        const quote = await getQuote(username, gallons);
        res.status(200).json({ ...quote });
    } catch (error) {
        next(error);
    }
})

protectedRouter.post('/quote', requireAuth, async (req, res, next) => {
    try {
        const quoteObject = req.body;
        const result = await submitQuote(quoteObject);
        res.status(200).json({ message: 'Quote submitted successfully', result });
    } catch (error) {
        next(error);
    }
})

app.use((req, res) => {
    res.status(404).send("RESOURCE NOT FOUND");
});

app.use(errorHandler);

module.exports = app;