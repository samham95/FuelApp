const FuelPricing = require('./pricingModule');
const AppError = require('./AppError.js');
const { getQuote, submitQuote, getQuoteHistory } = require('./quoteModule.js');
const { validateFullName, validateCity, validateZipcode } = require('./profileModule');

// Mock the database
jest.mock('./db/mockDatabase.js');
const { users, quoteHistory } = require('./db/mockDatabase.js');

// Mock pricing module
jest.mock('./pricingModule');

describe('Testing getQuote', () => {
    // Set mock database with a mock quote history and user before each test
    beforeEach(() => {
        quoteHistory.set('mockUser', [{
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '45',
            deliveryDate: '05/24/2024',
            suggestedPricePerGallon: '2.93',
            totalDue: '105'
        },
        {
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '64',
            deliveryDate: '05/31/2024',
            suggestedPricePerGallon: '2.79',
            totalDue: '85'
        }]);

        users.set('mockUser', {
            fullname: 'Joe Swanson',
            street1: '11111 Spooner Street',
            street2: '22222 Washington Avenue',
            city: 'Quahog',
            state: 'RI',
            zip: '00093'
        });
    });

    // Reset mock database after each test
    afterEach(() => {
        quoteHistory.clear();
    });

    test('Existing user with valid gallons successfully returns quote', async () => {
        FuelPricing.prototype.getPricePerGallon = jest.fn().mockResolvedValue(2.5);

        const mockQuote = { pricePerGallon: 2.5 };
        await expect(getQuote('mockUser', '50')).resolves.toEqual(mockQuote);
    });

    test('Username not provided OR username not in database throws error: "User not found"', async () => {
        // Username not provided
        await expect(getQuote('', '50')).rejects.toThrow('User not found');
        // Username not in database
        await expect(getQuote('voidUser', '50')).rejects.toThrow('User not found');
    });
});

describe('Testing submitQuote', () => {
    // Set mock database with a mock quote history and user before each test
    beforeEach(() => {
        quoteHistory.set('mockUser', [{
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '45',
            deliveryDate: '05/24/2024',
            suggestedPricePerGallon: '2.93',
            totalDue: '105'
        },
        {
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '64',
            deliveryDate: '05/31/2024',
            suggestedPricePerGallon: '2.79',
            totalDue: '85'
        }]);

        users.set('mockUser', {
            fullname: 'Joe Swanson',
            street1: '11111 Spooner Street',
            street2: '22222 Washington Avenue',
            city: 'Quahog',
            state: 'RI',
            zip: '00093'
        });
    });

    // Reset mock database after each test
    afterEach(() => {
        quoteHistory.clear();
    });

    test('Successfully submit quote when all required fields provided and inputs valid', async () => {
        const newMockQuote = {
            
        };
    });
});


describe('Testing getQuoteHistory function', () => {
    // Set mock database with a mock quote history before each test
    beforeEach(() => {
        quoteHistory.set('mockUser', [{
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '45',
            deliveryDate: '05/24/2024',
            suggestedPricePerGallon: '2.93',
            totalDue: '105'
        },
        {
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '64',
            deliveryDate: '05/31/2024',
            suggestedPricePerGallon: '2.79',
            totalDue: '85'
        }]);
    });

    // Reset mock database after each test
    afterEach(() => {
        quoteHistory.clear();
    });

    test('Existing username returns quoteHistory object with list of quote objects', async () => {
        const mockQHist = [{
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '45',
            deliveryDate: '05/24/2024',
            suggestedPricePerGallon: '2.93',
            totalDue: '105'
        },
        {
            fullname: 'Joe Swanson',
            address: '11111 Spooner St., Quahog, RI 00093',
            gallonsRequested: '64',
            deliveryDate: '05/31/2024',
            suggestedPricePerGallon: '2.79',
            totalDue: '85'
        }];

        const returnedHist = await getQuoteHistory('mockUser');
        
        // What was returned should match what was placed into the database
        await expect(returnedHist).toEqual(mockQHist);
    });

    test('Non-existent username returns empty quote list', async () => {
        await expect(getQuoteHistory('voidUser')).toMatchObject({});
    });
});