const app = require("./index.js");
const fs = require('fs');
const path = require('path');
const https = require('https');
const { initDB, connectDB } = require('./db/UtilisDB.js')

//config for https, omitting...
/*
const cert = fs.readFileSync(path.resolve('../../localhost+2.pem'));
const key = fs.readFileSync(path.resolve('../../localhost+2-key.pem'));

const server = https.createServer({ key: key, cert: cert }, app);
 */

const server = app;
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "127.0.0.1"

async function startApplication() {
    await connectDB();
    await initDB();
    server.listen(PORT, HOST, () => {
        console.log(`Host ${HOST} is serving on port ${PORT}...`);
    });
}

startApplication().catch(console.error);