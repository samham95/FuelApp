const FuelPricing = require('./pricingModule');
const AppError = require('./AppError.js');
const { users, quoteHistory } = require('./db/mockDatabase.js');

/*Validation functions for form fields*/
const validateFullName = (fullname) => {
    const regex = /^[a-zA-Z\s]+$/;
    return fullname && regex.test(fullname);
}

const validateGalReq = (galReq) => {
    const regex = /\d+/;
    return galReq && regex.test(galReq);
}

const validateDeliveryDate = (date) => {
    const regex = /\d{2}\/\d{2}\/\d{4}/;
    return date && regex.test(date);
}
// Validate Delivery Address
const validateDeliveryAddr = (address) => {
    const regex = /[a-zA-Z0-9\s.,-]+,\s[a-zA-Z\s]+,\s[A-Z]{2}\s\d{5}(?:-\d{4})?/;
    return address && regex.test(address);
}

const validateInputs = (fullname, galReq, date, address) => {
    if (!validateFullName(fullname)) {
        throw new AppError("Invalid name format", 400);
    }
    if (!validateGalReq(galReq)) {
        throw new AppError("Invalid gallons format", 400);
    }
    if (!validateDeliveryDate(date)) {
        throw new AppError("Invalid date format", 400);
    }
    if (!validateDeliveryAddr(address)) {
        throw new AppError("Invalid address format", 400);
    }
}

// Check to see if any form data is missing
const validateKeys = (formData) => {
    const requiredKeys = ['fullname', 'gallonsRequested', 'deliveryDate', 'address', 'suggestedPricePerGallon', 'totalDue'];

    const missingKeys = requiredKeys.filter(key => !(key in formData));
    if (missingKeys.length > 0) {
        throw new AppError(`Missing required fields: ${missingKeys.join(', ')}`, 400);
    }
}

const getQuote = async (username, gallons) => {
    try {
        console.log(`Fetching quote for user: ${username}, gallons: ${gallons}`);
        if (!username || !users.has(username)) {
            console.log("User not found");
            throw new AppError("User not found", 404);
        }
        const user = users.get(username);
        const state = user.state;
        console.log(`User state: ${state}`);
        //validateInputs(user.fullname, gallons, user.deliveryDate, user.address);
        console.log("Inputs validated successfully");
        const fuelPrice = new FuelPricing(username, state, gallons);
        const pricePerGallon = await fuelPrice.getPricePerGallon();
        console.log(`Price per gallon: ${pricePerGallon}`);
        return { pricePerGallon };
    } catch (error) {
        console.error("Error in getQuote:", error);
        throw new AppError(error.message || "Error retrieving quote", error.status || 400);
    }
}

const submitQuote = async (quoteObject) => {
    try {
        console.log("Submitting quote:", quoteObject);
        //validateKeys(quoteObject);
        console.log("QuoteObject keys validated successfully");
        const { username } = quoteObject;
        if (!quoteHistory.has(username)) {
            console.log("Quote history not found for user, initializing...");
            quoteHistory.set(username, []);
        }
        quoteHistory.get(username).push(quoteObject);
        console.log("Quote submitted successfully");
        return { message: "Quote submitted successfully" };
    } catch (error) {
        console.error("Error in submitQuote:", error);
        throw new AppError(error.message || "Error submitting quote", error.status || 400)
    }
}

const getQuoteHistory = async (username) => {
    try {
        console.log(`Fetching quote history for user: ${username}`);
        if (!quoteHistory.has(username)) {
            console.log("Quote history not found for user");
            throw new AppError("Quote history not found for user", 404);
        }
        const history = quoteHistory.get(username);
        console.log("Quote history fetched successfully:", history);
        return history;
    } catch (error) {
        console.error("Error in getQuoteHistory:", error);
        throw new AppError(error.message || "Error retrieving quote history", error.status || 400);
    }
}
module.exports = { getQuote, submitQuote, getQuoteHistory };