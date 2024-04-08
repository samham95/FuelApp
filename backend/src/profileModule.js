const AppError = require('./AppError.js');
const { User, Profile } = require('./db/MongoDatabase.js');

const getProfileData = async (username) => {
    try {
        const user = await User.findOne({ username }).populate('profile');
        if (!user) {
            throw new AppError(400, "Unable to find user");
        }

        if (!user.profile) {
            throw new AppError(404, "Profile not found");
        }

        const { userId, __v, _id, ...profileData } = user.profile.toObject();
        return profileData;
    } catch (error) {
        console.error(error);
        throw new AppError(error.statusCode || 500, error.message || "An error occurred while fetching profile data");
    }
};


const validateFullName = (fullname) => {
    const regex = /^[a-zA-Z\s]+$/;
    return fullname && regex.test(fullname);
}
const validateStreet = (street1) => {
    const regex = /^[a-zA-Z0-9\s.,-]+$/;
    return street1 && regex.test(street1);
}
const validateStreet2 = (street2) => {
    const regex = /^[A-Za-z0-9#.\-\s/,]+$/;
    return street2 && regex.test(street2);
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
        throw new AppError("Invalid street address format", 400);
    }
    if (street2 && !validateStreet2(street2)) {
        throw new AppError("Invalid optional address format", 400);
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

const filterUpdates = (original, newData) => {

    const updates = {};
    Object.keys(newData).forEach(key => {
        if (original[key] !== newData[key]) {
            updates[key] = newData[key];
        }
    });
    return updates;
}

const updateProfile = async (username, newData) => {

    try {
        const user = await User.findOne({ username }).populate('profile');
        if (!user) {
            throw new AppError("User not found", 400);
        }

        validateKeys(newData);
        const { fullname, street1, street2, city, state, zip } = newData;
        validateInputs(fullname, street1, street2, city, zip);

        const profileUpdate = filterUpdates(user.profile, { fullname, street1, street2, city, state, zip });
        Object.assign(user.profile, profileUpdate);
        await user.profile.save();
    }
    catch (error) {
        throw new AppError(error.message || "Unable to update profile", error.status || 400);
    }
}
module.exports = { getProfileData, updateProfile, validateFullName, validateStreet, validateCity, validateZipcode };