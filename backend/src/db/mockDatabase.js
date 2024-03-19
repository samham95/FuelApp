const bcrypt = require('bcrypt');

let users = new Map();
let quoteHistory = new Map();
let invalidTokens = new Map();

const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

(async () => {
    const hash = await hashPassword('Abc12345!');
    users.set('samham', {
        fullname: 'Sammy Hamdi',
        password: hash,
        street1: '9222 Memorial Dr.',
        street2: '1215 Main Street',
        city: 'Houston',
        state: 'TX',
        zip: '77379',
    });
})();

module.exports = { users, quoteHistory, invalidTokens };
