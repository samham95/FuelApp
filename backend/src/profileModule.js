const AppError = require('./AppError.js');
const { users } = require('./db/mockDatabase.js');

const getProfileData = async (username) => {
    if (!users.has(username)) throw new AppError("User data not found: ", 400);
    const { password, ...profileData } = users.get(username);
    return profileData;
}

module.exports = { getProfileData };