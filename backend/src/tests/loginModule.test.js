const { addUser, generateToken, validateUser, invalidateToken, isTokenInvalidated } = require("../loginModule.js");
const { users, invalidTokens } = require("../db/mockDatabase.js");
const validUser = {
    username: 'samham',
    password: 'Abc12345!'
}
const invalidUsername = {
    short: "sam",
    invalidChar: "samham$",
    startsWithNum: "1samham",
    long: "samham012345678910",
}

const invalidPassword = {
    short: "Ab12!",
    long: "Abc12345!11111111111",
    noSpecChar: "Abc123456",
    noCapital: 'abc12345!'
}

beforeEach(() => { users.clear(); invalidTokens.clear(); })
describe("Login Module testing...", () => {
    test('This test should generate a token', async () => {
        await expect(generateToken(validUser.username)).resolves.not.toBe(undefined);

    });
    test('This test should invalidate a valid token', async () => {
        const token = await generateToken(validUser.username);
        await expect(invalidateToken(token)).resolves.not.toThrow();
    });
    test('This test should throw an error when attempting to invalidate an invalid token', async () => {
        const token = 'faketoken';
        await expect(invalidateToken(token)).rejects.toThrow();
    });
    test('This test should return true if token has been invalidated', async () => {
        const token = await generateToken(validUser.username);
        await invalidateToken(token);
        await expect(isTokenInvalidated(token)).resolves.toBe(true);
    });
    test('This test should return false if token has not been invalidated', async () => {
        const token = await generateToken(validUser.username);
        await expect(isTokenInvalidated(token)).resolves.toBe(false);
    });
    test('This test should throw error to see if a fake token is an invalid token', async () => {
        const token = 'faketoken';
        await expect(isTokenInvalidated(token)).rejects.toThrow();
    });
    test('This test should allow a current user to login', async () => {
        await addUser(validUser.username, validUser.password);
        await expect(validateUser(validUser.username, validUser.password)).resolves.toBe(true);
    });
    test('This test should not allow a a non-registered user to login', async () => {
        await expect(validateUser(validUser.username, validUser.password)).resolves.toBe(false);
    });
    test('This test should prevent a current user to login with wrong password', async () => {
        await addUser(validUser.username, validUser.password);
        await expect(validateUser(validUser.username, validUser.password + "hi")).resolves.toBe(false);
    });
    test('This test should allow one to create user given valid input', async () => {
        await expect(addUser(validUser.username, validUser.password)).resolves.not.toThrow();
    });
    test('This test should throw an error if one attempts to register with a existing username', async () => {
        await addUser(validUser.username, validUser.password);
        await expect(addUser(validUser.username, validUser.password)).rejects.toThrow();
    });
    test('This test should throw an error if username is malformed for creating user', async () => {
        await expect(addUser(invalidUsername.short, validUser.password)).rejects.toThrow();
        await expect(addUser(invalidUsername.long, validUser.password)).rejects.toThrow();
        await expect(addUser(invalidUsername.startsWithNum, validUser.password)).rejects.toThrow();
        await expect(addUser(invalidUsername.invalidChar, validUser.password)).rejects.toThrow();
    });
    test('This test should throw an error if password is malformed for creating user', async () => {
        await expect(addUser(validUser.username, invalidPassword.short)).rejects.toThrow();
        await expect(addUser(validUser.username, invalidPassword.long)).rejects.toThrow();
        await expect(addUser(validUser.username, invalidPassword.noCapital)).rejects.toThrow();
        await expect(addUser(validUser.username, invalidPassword.noSpecChar)).rejects.toThrow();
    });







})
