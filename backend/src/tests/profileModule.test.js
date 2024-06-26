const AppError = require('../AppError.js');
const { getProfileData, updateProfile } = require('../profileModule.js');
const mongoose = require('mongoose');
const { User, Profile } = require('../db/MongoDatabase.js');
const { connectDB, closeDB, cleanDB, initDB } = require('../db/UtilsDB.js')

beforeAll(async () => {
    await connectDB(); // Connect to DB before tests
    //await initDB();
});

afterAll(async () => {
    await cleanDB(); // Clean DB after tests
    await closeDB(); // Close connection to DB after tests
});
beforeEach(async () => {
    await cleanDB();
})
describe('Testing getProfileData...', () => {

    beforeEach(async () => {
        // Seed DB with test data before each test

        // User document
        const user = await User.create({
            username: 'mockUser',
            password: 'password'
        });

        // Associated profile document
        await Profile.create({
            userId: user._id,
            fullname: 'Joe Swanson',
            street1: '11111 Spooner Street',
            street2: '22222 Washington Avenue',
            city: 'Quahog',
            state: 'RI',
            zip: '00093'
        });
    });


    afterEach(async () => {
        // Clean DB after each test
        await User.deleteMany();
        await Profile.deleteMany();
    });

    test('Should pass if user exists', async () => {
        const profData = await getProfileData('mockUser');

        // If user exists, then the value of profData should be defined
        expect(profData).toBeDefined();
    });


    test('Should throw an AppError if username is not found in database', async () => {
        // Call getProfileData with non-existing username
        await expect(getProfileData('void')).rejects.toThrow('Unable to find user');
    });


    test('Should pass if profile data matches the expected structure', async () => {
        // Call function with existing user
        const returnedProfData = await getProfileData('mockUser');

        // Returned profile data should have certain properties that fit the expected structure
        expect(returnedProfData).toHaveProperty('fullname');
        expect(returnedProfData).toHaveProperty('street1');
        expect(returnedProfData).toHaveProperty('street2');
        expect(returnedProfData).toHaveProperty('city');
        expect(returnedProfData).toHaveProperty('state');
        expect(returnedProfData).toHaveProperty('zip');
    });


    test('Should pass if password is excluded from profile data', async () => {
        // Call function with existing user
        const returnedProfData = await getProfileData('mockUser');
        // Password property should be undefined in the returned profile data
        expect(returnedProfData.password).toBeUndefined();
    });

});


describe('Testing updateProfile', () => {

    beforeEach(async () => {
        // Seed DB with test data before each test

        // User document
        const user = await User.create({
            username: 'mockUser',
            password: 'password'
        });

        // Associated profile document
        await Profile.create({
            userId: user._id,
            fullname: 'Joe Swanson',
            street1: '11111 Spooner Street',
            street2: '22222 Washington Avenue',
            city: 'Quahog',
            state: 'RI',
            zip: '00093'
        });
    });


    afterEach(async () => {
        await User.deleteMany(); // Clean DB after each test
        await Profile.deleteMany();
    });


    // Updated mock data to send to function
    const newMockData = {
        fullname: 'Peter Griffin',
        street1: '33333 Spooner Street',
        street2: '44444 Washington Avenue',
        city: 'Quahog',
        state: 'RI',
        zip: '00093'
    };

    test('Passes if function updates profile data correctly', async () => {
        // Update profile of seeded user, providing seeded user's username and data to update with
        await updateProfile('mockUser', newMockData);
        // Query database to retrieve user's now updated profile data
        const newProfData = await User.findOne({ username: 'mockUser' }).populate('profile');
        // Query result should be non-null
        expect(newProfData).toBeTruthy();
        // Query result should have returned an object containing the updated profile data
        expect(newProfData.profile).toEqual(expect.objectContaining(newMockData));
    });


    test('Fails and throws AppError if user is not in db', async () => {
        await expect(updateProfile('voidUser', newMockData)).rejects.toThrow('User not found');
    });


    test('Passes if AppError thrown if new data is missing a field', async () => {
        // Missing Street field
        const missingMockData = {
            fullname: 'Peter Griffin',
            street2: '44444 Washington Avenue',
            city: 'Quahog',
            state: 'Rhode Island',
            zip: '00093'
        };
        await expect(updateProfile('mockUser', missingMockData)).rejects.toThrow('Missing required fields:');
    });


    test('Passes if fullname has an invalid format', async () => {
        const wrongFormatData = {
            fullname: 'r0b0 b3t3r', // Invalid name
            street1: '33333 Spooner Street',
            street2: '44444 Washington Avenue',
            city: 'Quahog',
            state: 'Rhode Island',
            zip: '00093'
        };

        await expect(updateProfile('mockUser', wrongFormatData)).rejects.toThrow('Invalid name format');
    });

    test('Passes if street1 has an invalid format', async () => {
        const wrongFormatData = {
            fullname: 'Peter Griffin',
            street1: 'Invalid$ street address format', // Invalid Street 1
            street2: '44444 Washington Avenue',
            city: 'Quahog',
            state: 'Rhode Island',
            zip: '00093'
        };

        await expect(updateProfile('mockUser', wrongFormatData)).rejects.toThrow('Invalid street address format');
    });

    test('Passes if street2 has an invalid format', async () => {
        const wrongFormatData = {
            fullname: 'Peter Griffin',
            street1: '33333 Spooner Street',
            street2: '44444 W@shington @venue', // Invalid Street 2
            city: 'Quahog',
            state: 'Rhode Island',
            zip: '00093'
        };

        await expect(updateProfile('mockUser', wrongFormatData)).rejects.toThrow('Invalid optional address format');
    });

    test('Passes if city has an invalid format', async () => {
        const wrongFormatData = {
            fullname: 'Peter Griffin',
            street1: '33333 Spooner Street',
            street2: '44444 Washington Avenue',
            city: 'Qu@h0g', // Invalid city
            state: 'Rhode Island',
            zip: '00093'
        };

        await expect(updateProfile('mockUser', wrongFormatData)).rejects.toThrow('Invalid city format');
    });

    test('Passes if zip has an invalid format', async () => {
        const wrongFormatData = {
            fullname: 'Peter Griffin',
            street1: '33333 Spooner Street',
            street2: '44444 Washington Avenue',
            city: 'Quahog',
            state: 'Rhode Island',
            zip: '0003' //Invalid 4-digit zip code
        };

        await expect(updateProfile('mockUser', wrongFormatData)).rejects.toThrow('Invalid zip code format');
    });

});

