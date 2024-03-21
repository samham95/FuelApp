const FuelPricing = require('./pricingModule');
const { users, quoteHistory } = require('./db/mockDatabase.js');

const getQuote = (username, gallons) =>
{
    const {state} = users.get(username);
    const user = new FuelPricing(username, state, gallons);
    return user.getPricePerGallon();
}

const submitQuote = (quoteObject) =>
{
    quoteHistory[quoteObject.username] = quoteObject;
}

const getQuoteHistory = (username) =>
{
    return quoteHistory[username];
}

module.exports = { getQuote, submitQuote, getQuoteHistory };