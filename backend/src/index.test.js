const axios = require('axios');
const app = require('./index.js');
const bcrypt = require('bcrypt');
const { addUser } = require("./loginModule.js");
const { getProfileData } = require("./profileModule.js")
const { users, quoteHistory, invalidTokens } = require('./db/mockDatabase.js');
const PORT = 3001;
const validCred = {
    username: 'samham',
    password: 'Abc12345!'
}
const invalidCred = {
    username: 'samham1',
    password: '123'
}
const validRegister = {
    username: 'samham123',
    password: 'Abc12345!'
}
const newProfileData = {
    fullname: 'Sam Ham',
    street1: '123 Sesame Street',
    street2: 'APT 123',
    city: 'New York',
    state: 'NY',
    zip: '10003',
}

const apiClient = (cookie = '') => axios.create({
    baseURL: `http://localhost:${PORT}/api`,
    withCredentials: true,
    headers: {
        ...(cookie && { Cookie: cookie })
    }
});

beforeEach(async () => {

    // need to add a user to the "database" to test functionality
    await addUser(validCred.username, validCred.password);
    const hashPassword = async (password) => {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    };
    const hash = await hashPassword(validCred.password);

    users.set(validCred.username, {
        fullname: 'Sammy Hamdi',
        password: hash,
        street1: '9222 Memorial Dr.',
        street2: '1215 Main Street',
        city: 'Houston',
        state: 'TX',
        zip: '77379',
    });


    server = app.listen(PORT);
});

afterEach(() => {
    users.clear();
    server.close();
});

const loginMock = async (credentials) => {
    const response = await apiClient().post('/login', credentials);
    const cookies = response.headers['set-cookie'];
    const authTokenCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    return authTokenCookie;
}
const getProfileDataMock = async (token, username) => {
    const response = await apiClient(token).get(`auth/profile/${username}`);
    const profileData = response.data;
    return profileData;
}

describe("Index file testing... ", () => {
    test('This test should throw if resource is not found on server', async () => {
        const invalidResource = '/fakeresource';
        await expect(apiClient().get(invalidResource)).rejects.toThrow();
    });
    test('Tests allows valid user login and sets an HTTP-only cookie', async () => {
        const response = await apiClient().post('/login', validCred);
        expect(response.status).toBe(200);
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();

        isAuthCookie = cookies.some(cookie => cookie.startsWith('auth_token='));
        expect(isAuthCookie).toBe(true);
        //console.log(cookies);
        const isHttpOnly = cookies.some(cookie => cookie.toLowerCase().includes('httponly'));
        expect(isHttpOnly).toBe(true);
    });
    test("This test should throw error if credentials are invald for login", async () => {
        await expect(apiClient().post('/login', invalidCred)).rejects.toThrow();
    });
    test("This test should throw if credentials are not sent in body for login", async () => {
        await expect(apiClient().post('/login')).rejects.toThrow();
    })

    test('Allows valid user to logout and clears the HTTP-only cookie', async () => {
        const authTokenCookie = await loginMock(validCred);
        expect(authTokenCookie).toBeDefined();

        const logoutResponse = await apiClient(authTokenCookie).post('/auth/logout', { username: validCred.username });
        expect(logoutResponse.status).toBe(200);

        const clearedCookies = logoutResponse.headers['set-cookie'];
        //console.log(clearedCookies);
        expect(clearedCookies).toBeDefined();
        const isCleared = clearedCookies.some(cookie =>
            cookie.startsWith('auth_token=') && cookie.includes('Expires=')
        );
        expect(isCleared).toBe(true);

    });
    test("This test should get profile data for authorized user", async () => {
        const authToken = await loginMock(validCred);
        const response = await apiClient(authToken).get(`/auth/profile/${validCred.username}`);
        const { fullname, street1, street2, city, state, zip } = response.data;
        expect(fullname).toBe(users.get(validCred.username).fullname);
        expect(street1).toBe(users.get(validCred.username).street1);
        expect(street2).toBe(users.get(validCred.username).street2);
        expect(city).toBe(users.get(validCred.username).city);
        expect(state).toBe(users.get(validCred.username).state);
        expect(zip).toBe(users.get(validCred.username).zip);
    });
    test("This test should fail to fetch profile data for unauthorized user (invalid cookie)", async () => {
        await loginMock(validCred);
        const badtoken = 'badtoken';
        expect(apiClient(badtoken).get(`/auth/profile/${validCred.username}`)).rejects.toThrow();

    });
    test("This test should fail to fetch profile data for user with different username than authroized in body", async () => {
        const token = await loginMock(validCred);
        expect(apiClient(token).get(`/auth/profile/${invalidCred.username}`)).rejects.toThrow();

    });
    test("This test should update profile data for authorized user", async () => {
        const token = await loginMock(validCred);
        const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, newProfileData);
        expect(response.status).toBe(200);
        const newData = await getProfileDataMock(token, validCred.username);
        Object.keys(newProfileData).forEach((key) => { expect(newProfileData[key]).toBe(newData[key]) })
    })
    test("This test should throw if new data to update profile has wrong key", async () => {

    })
    test("This test should allow registration with valid input", async () => {
        const response = await apiClient().post('/register', validRegister);
        expect(response.status).toBe(200);
        const password = users.get(validRegister.username).password;
        await expect(bcrypt.compare(validRegister.password, password)).resolves.toBe(true);
    });
    test("This test should throw if registration with malformed input", async () => {
        await expect(apiClient().post('/register', invalidCred)).rejects.toThrow();

    });
    test("This test should throw if registration with no input in request body", async () => {
        await expect(apiClient().post('/register')).rejects.toThrow();

    });
    test("This test should authorize valid users with valid authentication cookie", async () => {
        const token = await loginMock(validCred);
        const response = await apiClient(token).post('/auth/', { username: validCred.username })
        expect(response.status).toBe(200);
    })
    test("This test should not authorize users with valid authentication cookie but incorrect username in body", async () => {
        const token = await loginMock(validCred);
        await expect(apiClient(token).post('/auth/', { username: invalidCred.username })).rejects.toThrow();
    })
    test("This test should not authorize users with invalid authentication cookie", async () => {
        await loginMock(validCred);
        const token = 'badtoken';
        await expect(apiClient(token).post('/auth/', { username: validCred.username })).rejects.toThrow();
    })



})


