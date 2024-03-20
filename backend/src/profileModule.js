const AppError = require('./AppError.js');
const { users } = require('./db/mockDatabase.js');

const getProfileData = async (username) => {
    if (!users.has(username)) throw new AppError("User data not found: ", 400);
    const { password, ...profileData } = users.get(username);
    return profileData;
}

const validateFullName = (fullname) => {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(fullname);
}
const validateStreet = (street1, street2) => {
    const regex = /^[a-zA-Z0-9\s.,-]+$/;
    return regex.test(street1) && regex.test(street2);
}
const validateCity = (city) => {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(city);
}
/*
Didn't do state validation since it's a drop down selection
*/
const validateZipcode = (zip) => {
    const regex = /^\d{5}(?:-\d{4})?$/;
    return regex.test(zip);
}

const validateInputs = (fullname, street1, street2, city, zip) => {
    if (!validateFullName(fullname)) {
        throw new AppError("Invalid name format", 400);
    }
    if (!validateStreet(street1)) {
        throw new AppError("Invalid address format", 400);
    }
    if (!validateStreet(street2)) {
        throw new AppError("Invalid address format", 400);
    }
    if (!validateCity(city)) {
        throw new AppError("Invalid city format", 400);
    }
    if (!validateZipcode(zip)) {
        throw new AppError("Invalid zip code format", 400);
    }
}
const validateKeys = (newData) => {
    const requiredKeys = ['fullname', 'street1', 'street2', 'city', 'state', 'zip'];

    const missingKeys = requiredKeys.filter(key => !(key in newData));
    if (missingKeys.length > 0) {
        throw new Error(`Missing required fields: ${missingKeys.join(', ')}`);
    }
}

const updateProfile = async (username, newData) => {

    try {
        if (!username || !users.has(username)) {
            throw new AppError("User not found", 400);
        }

        validateKeys(newData);
        const { fullname, street1, street2, city, state, zip } = newData;
        validateInputs(fullname, street1, street2, city, zip);

        users.set(username, { fullname, street1, street2, city, state, zip });
    }
    catch (error) {
        console.error(error);
        throw new AppError("Unable to update profile", 400);
    }
}
module.exports = { getProfileData, updateProfile };