const axios = require('axios');
const app = require('../index.js');
const bcrypt = require('bcrypt');
const { User, Profile, QuoteHistory, InvalidToken } = require('../db/MongoDatabase.js');
const { connectDB, closeDB, cleanDB, initDB } = require('../db/UtilsDB.js')
const errorHandler = require('../ErrorHandler.js');
const AppError = require('../AppError.js');
const PORT = 3001;
const validProfileData = {
    fullname: 'Sammy Hamdi',
    street1: '9222 Memorial Dr.',
    street2: 'Apt. 212',
    city: 'Houston',
    state: 'TX',
    zip: '77379',
};
const validCred = {
    username: 'samham',
    password: 'Abc12345!'
}
const invalidCred = {
    username: 'sa1',
    password: '123'
}
const validRegister = {
    username: 'samham99',
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
const invalidProfileData = {
    fullname: '1Sam Ham',
    street1: '123 Sesame@ Street',
    street2: 'APT! 123',
    city: 'New York^',
    state: 'NYg',
    zip: 'hi',
}
const validQuote = {
    address: {
        street: "9222 Memorial Dr. Apt. 212",
        city: "Houston",
        state: "TX",
        zip: "77379"
    },
    deliveryDate: "2024-04-04",
    gallonsRequested: 3,
    suggestedPricePerGallon: 2.5,
    totalDue: 7.5
};

const invalidQuote = {

    street: "!9222 Memorial Dr. Apt. 212",
    city: "Houston!",
    state: "TX!",
    zip: "77379!",
    deliveryDate: "2024-04-",
    gallonsRequested: "3",
    suggestedPricePerGallon: "2.5",
    totalDue: '7.5'
}
const quote = {
    username: validCred.username,
    street: "123 Main St",
    city: "City",
    state: "TX",
    zip: "12345",
    deliveryDate: "2024-03-27",
    gallonsRequested: 100,
    suggestedPricePerGallon: 2.50,
    totalDue: 250
};

const fail = (message) => {
    throw new Error(message);
}

const apiClient = (cookie = '') => axios.create({
    baseURL: `http://127.0.0.1:${PORT}/api`,
    withCredentials: true,
    headers: {
        ...(cookie && { Cookie: cookie })
    }
});


beforeAll(async () => {
    server = app.listen(PORT);
    await connectDB();
    await initDB();

})
afterAll(async () => {
    await cleanDB();
    await closeDB();
    server.close();
})

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

    describe("Login route testing... ", () => {

        test('Tests allows valid user login and sets an HTTP-only cookie', async () => {
            try {
                const response = await apiClient().post('/login', validCred);
                expect(response.status).toBe(200);
                const cookies = response.headers['set-cookie'];
                expect(cookies).toBeDefined();

                isAuthCookie = cookies.some(cookie => cookie.startsWith('auth_token='));
                expect(isAuthCookie).toBe(true);
                //console.log(cookies);
                const isHttpOnly = cookies.some(cookie => cookie.toLowerCase().includes('httponly'));
                expect(isHttpOnly).toBe(true);
            } catch (error) {
                fail(`Test failed with error: ${error}`)
            }

        });
        test("This test should throw error if credentials are invald for login", async () => {
            try {
                const response = await apiClient().post('/login', invalidCred)
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toBe("Invalid Credentials")

            }
        });
        test("This test should throw if credentials are not sent in body for login", async () => {
            try {
                const response = await apiClient().post('/login');
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toBe("Invalid Credentials")
            }
        })
    })

    describe("Logout route testing...", () => {

        test('Allows valid user to logout and clears the HTTP-only cookie', async () => {
            try {
                const authTokenCookie = await loginMock(validCred);
                expect(authTokenCookie).toBeDefined();

                const response = await apiClient(authTokenCookie).post('/auth/logout', { username: validCred.username });
                expect(response.status).toBe(200);

                const clearedCookies = response.headers['set-cookie'];
                //console.log(clearedCookies);
                expect(clearedCookies).toBeDefined();
                const isCleared = clearedCookies.some(cookie =>
                    cookie.startsWith('auth_token=') && cookie.includes('Expires=')
                );
                expect(isCleared).toBe(true);
            } catch (error) {
                fail(`Test failed with error: ${error}`)
            }

        });
        test('Does not allow user to revoke token by logging out without proper username', async () => {
            try {
                const authTokenCookie = await loginMock(validCred);
                const response = await apiClient(authTokenCookie).post('/auth/logout', { username: invalidCred.username });
                fail("Test failed to not allow unauthorized user to invalid token by logging out")

            } catch (error) {
                expect(error.response.status).toBe(401);
            }
        });
    })

    describe("Profile route testing... ", () => {

        test("This test should get profile data for authorized user", async () => {
            try {
                const authToken = await loginMock(validCred);
                const response = await apiClient(authToken).get(`/auth/profile/${validCred.username}`);
                const profileData = response.data;
                expect(profileData).toEqual(validProfileData);
            } catch (error) {
                fail(`Test failed with error: ${error}`)
            }
        });
        test("This test should fail to fetch profile data for unauthorized user (invalid cookie)", async () => {
            try {
                const token = await loginMock(validCred);
                const badtoken = 'auth_token=badtoken';
                const response = await apiClient(badtoken).get(`/auth/profile/${validCred.username}`);

            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toBe("Authentication required")
            }

        });
        test("This test should fail to fetch profile data for user with different username than authorized in body", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).get(`/auth/profile/${invalidCred.username}`);

            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toMatch('Invalid user token')
            }

        });

    })

    describe("Update profile route testing...", () => {

        test("This test should update profile data for authorized user", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, newProfileData);
                expect(response.status).toBe(200);
                const newData = await getProfileDataMock(token, validCred.username);
                Object.keys(newProfileData).forEach((key) => { expect(newProfileData[key]).toBe(newData[key]) })

            } catch (error) {
                fail(`Test failed with error: ${error}`);
            }
        })
        test("This test should throw if new data to update profile has wrong/missing key/values", async () => {
            try {
                const token = await loginMock(validCred);
                const { fullname, street1, street2, city, state, zip } = newProfileData;
                response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { full_name: fullname, street1, street2, city, state, zip });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Missing required fields");
            }
        });
        test("This test should throw if profile data is invalid", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { ...validProfileData, street1: invalidProfileData.street1 });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        });
        test("This test should throw if profile data is invalid", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { ...validProfileData, street2: invalidProfileData.street2 });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        });
        test("This test should throw if profile data is invalid", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { ...validProfileData, fullname: invalidProfileData.fullname });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        });
        test("This test should throw if profile data is invalid", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { ...validProfileData, zip: invalidProfileData.zip });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        });
        test("This test should throw if profile data is invalid", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { ...validProfileData, city: invalidProfileData.city });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        });
        test("This test should throw if profile data is invalid", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`auth/profile/${validCred.username}/edit`, { ...validProfileData, state: invalidProfileData.state });
                fail("Test was supposed to throw error on updating profile, but didn't")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
    })

    describe("Registration route testing...", () => {

        test("This test should allow registration with valid input", async () => {
            try {
                const response = await apiClient().post('/register', validRegister);
                expect(response.status).toBe(200);
                const password = validRegister.password;
                const user = await User.findOne({ username: validRegister.username }).populate('profile');
                const dbPassword = user.password;
                expect(user).toBeDefined();
                expect(user.username).toEqual(validRegister.username);
                await expect(bcrypt.compare(password, dbPassword)).resolves.toBe(true);

            } catch (error) {
                fail(`Test failed with error: ${error}`)
            }
        });
        test("This test should throw if registration with malformed input", async () => {
            try {
                response = await apiClient().post('/register', invalidCred);
                fail("Test was supposed to throw error if malformed registration request")

            } catch (error) {
                expect(error.response.status).toBe(400);
            }

        });
        test("This test should throw if registration with no input in request body", async () => {
            try {
                await apiClient().post('/register');
            } catch (error) {
                expect(error.response.status).toBe(400);
            }

        });
    })

    describe("Authorization route testing...", () => {

        test("This test should authorize valid users with valid authentication cookie", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post('/auth/', { username: validCred.username })
                expect(response.status).toBe(200);

            } catch (error) {
                fail(`Test failed with error: ${error}`)
            }
        })
        test("This test should not authorize users with valid authentication cookie but incorrect username in body", async () => {
            try {
                const token = await loginMock(validCred);
                await apiClient(token).post('/auth/', { username: invalidCred.username });
                fail("Test was supposed to not authorize invalid user")

            } catch (error) {
                expect(error.response.status).toBe(401);
            }

        })
        test("This test should not authorize users with invalid authentication cookie", async () => {
            try {
                await loginMock(validCred);
                const token = 'badtoken';
                await apiClient(token).post('/auth/', { username: validCred.username })
                fail("Test was supposed to not authorize user with invalid token cookie");
            } catch (error) {
                expect(error.response.status).toBe(401);
            }
        })
    })

    describe("Express error handling route testing...", () => {

        test('This test should throw if resource is not found on server', async () => {
            try {
                await apiClient().get('/fakeresource');
                fail("Expected request to fail with status 404, but it succeeded.");
            } catch (error) {
                expect(error.response.status).toBe(404);
            }
        });

        test("This test should handle any unexpected internal server error", async () => {
            try {
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    send: jest.fn(),
                };
                const mockReq = {};
                const mockNext = jest.fn();
                const testError = new AppError("Internal Server Error", 500);
                errorHandler(testError, mockReq, mockRes, mockNext);
                expect(mockRes.status).toHaveBeenCalledWith(500);
                expect(mockRes.send).toHaveBeenCalledWith("Internal Server Error");

            } catch (error) {
                fail(`Test failed with error: ${error}`)
            }

        });
    })

    describe("Get quote history route testing...", () => {
        test("This test should get quote history for authorized user", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).get(`/auth/quote/history/${validCred.username}`);
                const quoteData = response.data.quotes[0];
                expect(response.status).toBe(200);
                expect(quoteData).toEqual(expect.objectContaining(validQuote));
            } catch (error) {
                fail(`test failed with error: ${error}`);
            }
        });
        test("This test should return an empty quote history for a new user", async () => {
            try {
                await QuoteHistory.deleteMany({});;
                const token = await loginMock(validCred);
                const response = await apiClient(token).get(`/auth/quote/history/${validCred.username}`);
                expect(response.status).toBe(200);
                expect(response.data.quotes).toBeDefined();
                expect(response.data.quotes).toHaveLength(0);
            } catch (error) {
                fail(`Test failed with error: ${error}`);
            }
        });
        test("This test should fail to fetch quote history for unauthorized user", async () => {
            try {
                const badtoken = 'auth_token=badtoken';
                const response = await apiClient(badtoken).get(`/auth/quote/history/${validCred.username}`);
                fail(`Test was supposed to throw error, but passed`);

            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toBe('Authentication required')
            }
        });
    })

    describe("Get quote route testing...", () => {
        test("This test should get a quote for authorized user", async () => {
            try {
                const gallons = 20;
                const token = await loginMock(validCred);
                const response = await apiClient(token).get(`/auth/quote/${validCred.username}/${gallons}`);
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expect.objectContaining({ pricePerGallon: expect.any(Number), totalPrice: expect.any(Number) }));
            } catch (error) {
                fail(`Test failed with error: ${error}`);
            }
        });
        test("This test should fail to get a quote for unauthorized user", async () => {
            try {
                const gallons = 2;
                const badtoken = 'auth_token=badtoken';
                const response = await apiClient(badtoken).get(`/auth/quote/${validCred.username}/${gallons}`);
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toBe("Authentication required");
            }
        });
        test("This test should fail to get a quote with invalid gallon input", async () => {
            try {
                const gallons = "badgallons";
                const token = await loginMock(validCred);
                const response = await apiClient(token).get(`/auth/quote/${validCred.username}/${gallons}`);
                console.log(response.data)
                fail("Test was supposed to throw error, but passed");
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid gallons");

            }
        });
        test("This test should fail to get quote with different username than authorized", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).get(`/auth/quote/${invalidCred.username}/${2}`);
                fail("Test was supposed to throw error, but passed")

            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toMatch("Invalid user token");
            }
        });
    })

    describe("Submit quote route testing...", () => {
        test("This test should submit a quote for authorized user", async () => {
            try {
                const token = await loginMock(validCred);
                const quoteObject = {
                    username: validCred.username,
                    street: "123 Main St",
                    city: "City",
                    state: "TX",
                    zip: "12345",
                    deliveryDate: "2024-03-27",
                    gallonsRequested: 100,
                    suggestedPricePerGallon: 2.50,
                    totalDue: 250
                };
                const response = await apiClient(token).post(`/auth/quote`, quoteObject);
                expect(response.status).toBe(200);

            } catch (error) {
                fail(`Test failed with error:${error}`);
            }
        });
        test("This test should fail to submit a quote for unauthorized user", async () => {
            try {
                const token = await loginMock(validCred);
                const badtoken = 'auth_token=badtoken';
                const quoteObject = {
                    username: validCred.username,
                    street: "123 Main St",
                    city: "City",
                    state: "TX",
                    zip: "12345",
                    deliveryDate: "2024-03-27",
                    gallonsRequested: 100,
                    suggestedPricePerGallon: 2.50,
                    totalDue: 250
                };
                const response = await apiClient(badtoken).post(`/auth/quote`, quoteObject);
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data).toBe("Authentication required");
            }
        });
        test("This should test for missing required fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const invalidQuoteObject = { username: validCred.username };
                const response = await apiClient(token).post(`/auth/quote`, invalidQuoteObject);
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Missing required fields");
            }
        });
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, street: invalidQuote.street });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, city: invalidQuote.city });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, state: invalidQuote.state });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, deliveryDate: invalidQuote.deliveryDate });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, gallonsRequested: invalidQuote.gallonsRequested });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, suggestedPricePerGallon: invalidQuote.suggestedPricePerGallon });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
        test("This should test for invalid fields in submission", async () => {
            try {
                const token = await loginMock(validCred);
                const response = await apiClient(token).post(`/auth/quote`, { ...quote, totalDue: invalidQuote.totalDue });
                fail("Test was supposed to throw error, but passed")
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toMatch("Invalid");
            }
        })
    })


})


