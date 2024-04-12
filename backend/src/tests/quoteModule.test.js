const AppError = require('../AppError.js');
const { validateDeliveryAddr, validateInputs, validateKeys, getQuote, submitQuote, getQuoteHistory } = require('../quoteModule.js');
const { User, QuoteHistory } = require('../db/MongoDatabase.js');
const { connectDB, closeDB, cleanDB, } = require('../db/UtilsDB.js')

// Mock pricing module
jest.mock('../pricingModule');
const FuelPricing = require('../pricingModule.js');

describe('Testing validateDeliveryAddr', () => {
    test('Should return false when non-address object passed', () => {
        const int = 1;
        expect(validateDeliveryAddr(int)).toBe(false);
    });
});

describe('Testing validateInputs', () => {
    test('Should throw error when invalid galreq passed', () => {
        const char = 'A';
        expect(() => validateInputs(0, 0, char, '2024-10-15', 0)).toThrow(AppError);
    });
    test('Should throw error when invalid total passed', () => {
        const char = 'A';
        expect(() => validateInputs(0, char, 0, '2024-10-15', 0)).toThrow(AppError);
    });
    test('Should throw error when invalid ppg passed', () => {
        const char = 'A';
        expect(() => validateInputs(char, 0, 0, '2024-10-15', 0)).toThrow(AppError);
    });
    test('Should throw error when invalid date passed', () => {
        const char = 'A';
        expect(() => validateInputs(0, 0, 0, char, 0)).toThrow(AppError);
    });
    test('Should throw error when invalid address passed', () => {
        const char = 'A';
        expect(() => validateInputs(0, 0, 0, '2024-10-15', char)).toThrow(AppError);
    });
});

describe('Testing validateKeys', () => {
    test('Should not throw an error when all required fields are filled', () => {
        const formData = {
            username: 'testUser',
            street: '123 BinkBonk Dr',
            city: 'FakeCity',
            state: 'FC',
            zip: '12345',
            gallonsRequested: 100,
            deliveryDate: '2024-10-15',
            suggestedPricePerGallon: 3.50,
            totalDue: 350
        };
        expect(() => validateKeys(formData)).not.toThrow();
    });

    test('Throws an error when one or more keys are missing', () => {
        const formDataMissingOne = {
            username: 'testUser',
            street: '123 BinkBonk Dr',
            city: 'FakeCity',
            state: 'FC',
            // zip is missing
            gallonsRequested: 100,
            deliveryDate: '2024-10-15',
            suggestedPricePerGallon: 3.50,
            totalDue: 350
        };
        expect(() => validateKeys(formDataMissingOne)).toThrow(AppError);
        expect(() => validateKeys(formDataMissingOne)).toThrow('Missing required fields: zip');
    });

    test('Throws an error when multiple keys are missing', () => {
        const formDataMissingMultiple = {
            username: 'testUser',
            street: '123 BinkBonk Dr',
            // city, state, and zip are missing
            gallonsRequested: 100,
            deliveryDate: '2024-10-15',
            suggestedPricePerGallon: 3.50,
            totalDue: 350
        };
        expect(() => validateKeys(formDataMissingMultiple)).toThrow(AppError);
        expect(() => validateKeys(formDataMissingMultiple)).toThrow('Missing required fields: city, state, zip');
    });

    test('Throws an error when all keys are missing', () => {
        const formDataEmpty = {};
        expect(() => validateKeys(formDataEmpty)).toThrow(AppError);
        expect(() => validateKeys(formDataEmpty)).toThrow('Missing required fields: username, street, city, state, zip, gallonsRequested, deliveryDate, suggestedPricePerGallon, totalDue');
    });
});

describe('Testing getQuote', () => {
    beforeAll(async () => {
        await connectDB(); //connect database before testing
    });
    afterAll(async () => {
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
    afterAll(async () => {
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

    test('Throws "User not Found" error if the user does not exist', async () => {
        // Spy on findOne and mock its implementation only for this test
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        const quoteObject = {
            username: 'nonexistentUser',
            street: '123 BinkBonk',
            city: 'FakeCity',
            state: 'FC',
            zip: '12345',
            deliveryDate: '2024-12-01',
            gallonsRequested: 50,
            suggestedPricePerGallon: 2.5,
            totalDue: 125
        };

        await expect(submitQuote(quoteObject)).rejects.toThrow('User not found');
    });

});


describe('Testing getQuoteHistory function', () => {
    beforeAll(async () => {
        await connectDB(); //connect database before testing
    });
    afterAll(async () => {
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
        const returnedHistory = await getQuoteHistory('mockUser');
        expect(returnedHistory.length).toBe(2);
        expect(returnedHistory[0]).toHaveProperty('gallonsRequested', 50);
        expect(returnedHistory[1]).toHaveProperty('gallonsRequested', 60);
    });

    test('Non-existent username returns empty quote list', async () => {
        await expect(getQuoteHistory('voidUser')).rejects.toThrow('User not found');
    });
});