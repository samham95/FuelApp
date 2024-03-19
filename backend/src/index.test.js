const axios = require('axios');
const app = require('./index.js');
const { addUser } = require("./loginModule.js");
const { users } = require('./db/mockDatabase.js');
const PORT = 3001;
const validCred = {
    username: 'samham',
    password: 'Abc12345!'
}

const apiClient = (cookie = '') => axios.create({
    baseURL: `http://localhost:${PORT}/api`,
    withCredentials: true,
    headers: {
        ...(cookie && { Cookie: cookie })
    }
});

beforeEach(async () => {
    await addUser(validCred.username, validCred.password);
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

describe("Index file testing... ", () => {
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
})


