const AppError = require('./AppError.js');
const { users } = require('./db/mockDatabase.js');

const getProfileData = async (username) => {
    if (!users.has(username)) throw new AppError("User data not found: ", 400);
    const { password, ...profileData } = users.get(username);
    return profileData;
}

const validateFullName = (fullname) => {
    const regex = /^[a-zA-Z\s]+$/;
    return fullname && regex.test(fullname);
}
const validateStreet = (street1) => {
    const regex = /^[a-zA-Z0-9\s.,-]+$/;
    return street1 && regex.test(street1);
}
const validateCity = (city) => {
    const regex = /^[a-zA-Z\s]+$/;
    return city && regex.test(city);
}
/*
Didn't do state validation since it's a drop down selection
*/
const validateZipcode = (zip) => {
    const regex = /^\d{5}(?:-\d{4})?$/;
    return zip && regex.test(zip);
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
        throw new AppError(`Missing required fields: ${missingKeys.join(', ')}`, 400);
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
        const currentData = users.get(username);
        users.set(username, { ...currentData, fullname, street1, street2, city, state, zip });
    }
    catch (error) {
        throw new AppError(error.message || "Unable to update profile", error.status || 400);
    }
}
module.exports = { getProfileData, updateProfile, validateFullName, validateStreet, validateCity, validateZipcode };