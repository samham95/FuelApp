const FuelPricing = require('./pricingModule');
const AppError = require('./AppError.js');
const { users, quoteHistory } = require('./db/mockDatabase.js');
const { validateFullName, validateStreet, validateCity, validateZipcode } = require('./profileModule');

/*Validation functions for form fields*/
const validateName = (fullname) => {
    const isValidName = validateFullName(fullname);
    return isValidName;
}

const validateGalReq = (galReq) => {
    const regex = /\d+/;
    return galReq && regex.test(galReq);
}

const validateDeliveryDate = (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return date && regex.test(date);
}
// Validate Delivery Address
const validateDeliveryAddr = (address) => {

    if (!address || typeof address !== 'object') {
        return false;
    }

    const { street ='', city='', state='', zip='' } = address;
    
    const isStreetValid = validateStreet(street);
    const isCityValid = validateCity(city);
    const isZipcodeValid = validateZipcode(zip);
    
    return isStreetValid && isCityValid && isZipcodeValid;
}

const validateInputs = (fullname, galReq, date, address) => {

    if (!validateGalReq(galReq)) {
        throw new AppError("Invalid gallons format", 400);
    }
    if(!validateDeliveryDate(date)) {
        throw new AppError("Invalid date format", 400);
    }
}

// Check to see if any form data is missing
const validateKeys = (formData) => {
    const requiredKeys = ['gallonsRequested', 'deliveryDate', 'suggestedPricePerGallon', 'totalDue'];

    const missingKeys = requiredKeys.filter(key => !(key in formData));
    if (missingKeys.length > 0) {
        throw new AppError(`Missing required fields: ${missingKeys.join(', ')}`, 400);
    }
}

const getQuote = async (username, gallons) => {
    try {
        if (!username || !users.has(username)) {
            throw new AppError("User not found", 404);
        }
        const user = users.get(username);
        const state = user.state;
        //validateInputs(user.fullname, gallons, user.deliveryDate, user.address);
        const fuelPrice = new FuelPricing(username, state, gallons);
        const pricePerGallon = await fuelPrice.getPricePerGallon();
        return { pricePerGallon };
    } catch (error) {
        throw new AppError(error.message || "Error retrieving quote", error.status || 400);
    }
}

const submitQuote = async (quoteObject) => {
    try {
        validateKeys(quoteObject);
        const { username, suggestedPricePerGallon, ...quoteData } = quoteObject;
        if (!quoteHistory.has(username)) {
            quoteHistory.set(username, []);
        }
        const updatedQuoteObject = { ...quoteData, suggestedPricePerGallon };
        quoteHistory.get(username).push(quoteObject);
    } catch (error) {
        throw new AppError(error.message || "Error submitting quote", error.status || 400)
    }
}

const getQuoteHistory = async (username) => {
    try {
        if (!quoteHistory.has(username)) {
            throw new AppError("Quote history not found for user", 404);
        }
        const history = quoteHistory.get(username);
        return history;
    } catch (error) {
        throw new AppError(error.message || "Error retrieving quote history", error.status || 400);
    }
}
module.exports = { getQuote, submitQuote, getQuoteHistory };