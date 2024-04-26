const FuelPricing = require('./pricingModule');
const AppError = require('./AppError.js');
const { User, QuoteHistory } = require('./db/MongoDatabase.js');
const { validateCity, validateZipcode } = require('./profileModule');

/*Validation functions for form fields*/
const validateStreet = (street) => {
    const regex = /^[A-Za-z0-9\s.,-]+(?:\s[A-Za-z0-9#.\-\s/,]+)?$/;
    return street && regex.test(street);
}
const validateNum = (num) => {
    return num && Number.isFinite(num);
}
const validateIntegerString = (num) => {
    const regex = /^\d+$/;
    return num && regex.test(num);
}
const validateDeliveryDate = (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return date && regex.test(date);
}
const validateState = (state) => {
    const regex = /^[A-Z]{2}$/;
    return state && regex.test(state);

}
// Validate Delivery Address
const validateDeliveryAddr = (address) => {

    if (!address || typeof address !== 'object') {
        return false;
    }

    const { street = '', city = '', state = '', zip = '' } = address;

    const isStreetValid = validateStreet(street);
    const isCityValid = validateCity(city);
    const isZipcodeValid = validateZipcode(zip);
    const isStateValid = validateState(state);

    return isStreetValid && isCityValid && isZipcodeValid && isStateValid;
}

const validateInputs = (ppg, total, galReq, date, address) => {

    if (!validateNum(galReq)) {
        throw new AppError(`Invalid gallons requested format - expected number, input: ${galReq}`, 400);
    }
    if (!validateNum(total)) {
        throw new AppError(`Invalid total due format - expected number, input: ${total}`, 400);
    }
    if (!validateNum(ppg)) {
        throw new AppError(`Invalid price per gallon format - expected number, input: ${ppg}`, 400);
    }
    if (!validateDeliveryDate(date)) {
        throw new AppError(`Invalid date format - expected input:`, 400);
    }
    if (!validateDeliveryAddr(address)) {
        throw new AppError("Invalid Delivery Address", 400);
    }
}

// Check to see if any form data is missing
const validateKeys = (formData) => {
    const requiredKeys = [
        'username',
        'street',
        'city',
        'state',
        'zip',
        'gallonsRequested',
        'deliveryDate',
        'suggestedPricePerGallon',
        'totalDue'];

    const missingKeys = requiredKeys.filter(key => !(key in formData));
    if (missingKeys.length > 0) {
        throw new AppError(`Missing required fields: ${missingKeys.join(', ')}`, 400);
    }
}

const getQuote = async (username, gallons) => {
    try {
        if (!username) {
            throw new AppError("Username is required", 400);
        }
        const user = await User.findOne({ username }).populate('profile').populate('quotes');
        if (!user) {
            throw new AppError("User not found", 401);
        }
        if (!validateIntegerString(gallons)) {
            throw new AppError("Invalid gallons requested format - expected number", 400);
        }
        const state = user.profile.state;
        const quoteHistory = user.quotes ? 1 : 0;
        const fuelPrice = new FuelPricing(state, gallons, quoteHistory);
        const pricePerGallon = fuelPrice.getPricePerGallon();
        const totalPrice = fuelPrice.getTotalPrice();
        return { pricePerGallon, totalPrice };
    } catch (error) {
        throw new AppError(error.message || "Error retrieving quote", error.status || 400);
    }
}

const submitQuote = async (quoteObject) => {
    try {
        validateKeys(quoteObject);
        const {
            username,
            street,
            city,
            state,
            zip,
            deliveryDate,
            gallonsRequested,
            suggestedPricePerGallon,
            totalDue } = quoteObject;

        const user = await User.findOne({ username });
        if (!user) {
            throw new AppError("User not found", 404);
        }

        validateInputs(
            suggestedPricePerGallon,
            totalDue,
            gallonsRequested,
            deliveryDate,
            { street, city, state, zip }
        );

        const newQuote = new QuoteHistory({
            userId: user._id,
            gallonsRequested,
            suggestedPricePerGallon,
            totalDue,
            deliveryDate,
            address: {
                street,
                city,
                state,
                zip
            }
        });

        const savedQuote = await newQuote.save();
        return savedQuote;

    } catch (error) {
        throw new AppError(error.message || "Error submitting quote", error.status || 400)
    }
}

const getQuoteHistory = async (username) => {
    try {
        const user = await User.findOne({ username }).populate('quotes');
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user.quotes.map(quote => quote.toObject());
    } catch (error) {
        throw new AppError(error.message || "Error retrieving quote history", error.status || 400);
    }
}
module.exports = { validateDeliveryAddr, validateIntegerString, validateInputs, validateKeys, getQuote, submitQuote, getQuoteHistory };