const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const secretKey = process.env.JWT_SECRET || 'secretkeyhehe';
require('dotenv').config();

const { requireAuth, addUser, generateToken, validateUser, invalidateToken } = require('./loginModule.js')
const { users, quoteHistory } = require('./mockDatabase.js');
const AppError = require('./AppError.js');

const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // client url
    credentials: true, // send cookies with requests
};

const protectedRouter = express.Router();
const unprotectedRouter = express.Router();
const app = express();

protectedRouter.use(requireAuth);
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretKey));
app.use('/api/auth', protectedRouter);
app.use('/api', unprotectedRouter);

protectedRouter.post('/', async (req, res) => {
    const username = req.body.userame;
    res.status(200).send(`Successfully authenticated ${username}`);
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
            msg: 'Successfully validated credentials',
        })
    } catch (err) {
        res.status(err.status || 500).json({
            msg: `Invalid login: ${err.message || ""}`
        })
    }
});

app.use((req, res) => {
    res.status(404).send("NOT FOUND");
});

app.listen(PORT, (req, res) => {
    console.log(`Serving on port ${PORT}...`);
})