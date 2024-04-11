const AppError = require('../AppError.js');
const { getQuote, submitQuote, getQuoteHistory } = require('../quoteModule.js');
const { validateFullName, validateCity, validateZipcode } = require('../profileModule.js');
const { User, QuoteHistory } = require('../db/MongoDatabase.js');
const { connectDB, closeDB, cleanDB, } = require('../db/UtilisDB.js')

// Mock pricing module
jest.mock('../pricingModule');
const FuelPricing = require('../pricingModule.js');
const { identity } = require('update/lib/utils.js');

describe('Testing getQuote', () => {
    beforeAll(async () => {
        await connectDB(); //connect database before testing
    });
    afterAll(async ()=>{
        await cleanDB(); //clean up database after testing
        await closeDB(); //close database connection after testing
    })
    // Set mock database with a mock quote history and user before each test
    beforeEach(async () => {
        try {    
            const user = await User.create({
                username: 'mockUser',
                password: 'password',
                fullname: 'Joe Swanson',
                street1: '11111 Spooner Street',
                street2: 'Apt 122',
                city: 'Quahog',
                state: 'RI',
                zip: '00093'
            });

            await QuoteHistory.create({
                userId: user._id,
                gallonsRequested: 50,
                suggestedPricePerGallon: 2.50,
                totalDue: 125,
                deliveryDate: new Date('2024-05-24'),
                address: {
                    street: '11111 Spooner Street',
                    city: 'Quahog',
                    state: 'RI',
                    zip: '00093'
                }
            });

            await QuoteHistory.create({
                userId: user._id,
                gallonsRequested: 60,
                suggestedPricePerGallon: 2.75,
                totalDue: 165,
                deliveryDate: new Date('2024-05-31'),   
                address: {
                    street: '11111 Spooner Street',
                    city: 'Quahog',
                    state: 'RI',
                    zip: '00093'
                }                             
            });
        } catch (error) {
            console.error("Error setting up test data: ", error);
        }
    });

    // Reset mock database after each test
    afterEach(async () => {
        await User.deleteMany();
        await QuoteHistory.deleteMany();
    });

    test('Existing user with valid gallons successfully returns quote', async () => {
        FuelPricing.prototype.getPricePerGallon = jest.fn().mockResolvedValue(2.5);

        const mockQuote = { pricePerGallon: 2.5 };
        await expect(getQuote('mockUser', '50')).resolves.toEqual(mockQuote);
    });

    test('Username not provided OR username not in database throws error: "User not found"', async () => {
        // Username not provided
        await expect(getQuote('', '50')).rejects.toThrow('Username is required');
        // Username not in database
        await expect(getQuote('voidUser', '50')).rejects.toThrow('User not found');
    });
});

describe('Testing submitQuote', () => {
    beforeAll(async () => {
        await connectDB(); //connect database before testing
    });
    afterAll(async ()=>{
        await cleanDB(); //clean up database after testing
        await closeDB(); //close database connection after testing
    })
    // Set mock database with a mock quote history and user before each test
    beforeEach(async () => {
        const user = await User.create({
            username: 'mockUser',
            password: 'password',
            fullname: 'Joe Swanson',
            street1: '11111 Spooner Street',
            street2: 'Apt 122',
            city: 'Quahog',
            state: 'RI',
            zip: '00093'
        });

        await QuoteHistory.create({
            userId: user._id,
            gallonsRequested: 50,
            suggestedPricePerGallon: 2.50,
            totalDue: 125,
            deliveryDate: '2024-05-24',
            address: {
                street: '11111 Spooner Street',
                city: 'Quahog',
                state: 'RI',
                zip: '00093'
            }
        });
    });

    afterEach(async () => {
        await User.deleteMany();
        await QuoteHistory.deleteMany();
    });

    test('Error not thrown when all required fields provided and inputs valid', async () => {
        const mockQuoteObject = {
            username: 'mockUser',
            street: '11111 Spooner Street',
            city: 'Quahog',
            state: 'RI',
            zip: '00093',
            deliveryDate: '2024-05-24',
            gallonsRequested: 50,
            suggestedPricePerGallon: 2.5,
            totalDue: 125
        };
        try {
            await expect(submitQuote(mockQuoteObject)).resolves.not.toThrow();
        } catch (error) {
            fail(error);
        }
    });

    test('Valid input successfully adds new quote to list of quotes', async () => {
        // What is received from the form on the front end
        const mockQuoteObject = {
            username: 'mockUser',
            street: '11111 Spooner Street',
            city: 'Quahog',
            state: 'RI',
            zip: '00093',
            deliveryDate: '2024-05-24',
            gallonsRequested: 50,
            suggestedPricePerGallon: 2.5,
            totalDue: 125
        };

        // What is retrieved from the database
        await submitQuote(mockQuoteObject);
        const receivedQuoteObject = await getQuoteHistory('mockUser');

        expect(receivedQuoteObject.length).toBeGreaterThan(0);
        const latestQuote = receivedQuoteObject[receivedQuoteObject.length - 1];
        expect(latestQuote).toEqual(expect.objectContaining({
            address: expect.objectContaining({
                street: '11111 Spooner Street',
                city: 'Quahog',
                state: 'RI',
                zip: '00093'
            }),
            deliveryDate: '2024-05-24',
            gallonsRequested: 50,
            suggestedPricePerGallon: 2.5,
            totalDue: 125
        }));
    });

});


describe('Testing getQuoteHistory function', () => {
    beforeAll(async () => {
        await connectDB(); //connect database before testing
    });
    afterAll(async ()=>{
        await cleanDB(); //clean up database after testing
        await closeDB(); //close database connection after testing
    })
    // Set mock database with a mock quote history and user before each test
    beforeEach(async () => {
        try {    
            const user = await User.create({
                username: 'mockUser',
                password: 'password',
                fullname: 'Joe Swanson',
                street1: '11111 Spooner Street',
                street2: 'Apt 122',
                city: 'Quahog',
                state: 'RI',
                zip: '00093'
            });

            await QuoteHistory.create({
                userId: user._id,
                gallonsRequested: 50,
                suggestedPricePerGallon: 2.50,
                totalDue: 125,
                deliveryDate: '2024-05-24',
                address: {
                    street: '11111 Spooner Street',
                    city: 'Quahog',
                    state: 'RI',
                    zip: '00093'
                }
            });

            await QuoteHistory.create({
                userId: user._id,
                gallonsRequested: 60,
                suggestedPricePerGallon: 2.75,
                totalDue: 165,
                deliveryDate: '2024-05-31',   
                address: {
                    street: '11111 Spooner Street',
                    city: 'Quahog',
                    state: 'RI',
                    zip: '00093'
                }                             
            });
        } catch (error) {
            console.error("Error setting up test data: ", error);
        }
    });

    // Reset mock database after each test
    afterEach(async () => {
        await User.deleteMany();
        await QuoteHistory.deleteMany();
    });

    test('Existing username returns quoteHistory object with list of quote objects', async () => {
        const returnedHistory = await  getQuoteHistory('mockUser');
        expect(returnedHistory.length).toBe(2);
        expect(returnedHistory[0]).toHaveProperty('gallonsRequested', 50);
        expect(returnedHistory[1]).toHaveProperty('gallonsRequested', 60);
    });

    test('Non-existent username returns empty quote list', async () => {
        await expect(getQuoteHistory('voidUser')).rejects.toThrow('User not found');
    });
});