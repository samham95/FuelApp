import { http, HttpResponse } from 'msw';
const JWT_SECRET = 'secretkeyhehehe';

let users = new Map();
let sessions = new Map();
//let revokedTokens = new Map();
let quoteHistory = new Map();
users.set('samham', {
    fullname: 'Sammy Hamdi',
    password: 'abc123',
    email: 'samham@gmail.com',
    street1: '9222 Memorial Dr.',
    street2: '1215 Main Street',
    city: 'Houston',
    state: 'TX',
    zip: '77379',
});

function revokeToken(token) {
    sessions.delete(token);
}
/*function isTokenRevoked(token) {
    return revokedTokens.has(token);
} */
const generateToken = (username) => {
    const token = JWT_SECRET;
    sessions.set(token, username);
    return token;
};
const validToken = (username, token) => {
    try {
        return sessions.has(token) && sessions.get(token) === username;
    }
    catch (err) {
        return false;
    }
};

const validPassword = (username, password) => { return users.get(username).password === password; };
const validateUser = (username, password) => { return users.has(username) && validPassword(username, password) }
const authenticateUser = (username, token) => { return users.has(username) && validToken(username, token) }
function addUser(username, password) {
    if (users.has(username)) {
        throw new Error("User already exists");
    }

    users.set(username, {
        fullname: '',
        password: password,
        email: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
    });
}
const apiHandles = [

    http.post('/api/login', async ({ request, params, cookies }) => {
        const { username, password, isChecked } = await request.json();
        if (validateUser(username, password)) {
            const token = generateToken(username);
            console.log(token)
            return HttpResponse.json(
                {
                    message: "Login Successful"
                },
                {
                    status: 202,
                    statusText: 'Mocked status',
                    headers: {
                        'Set-Cookie': `authToken=${token}`,
                    }
                },


            )
        }
        return HttpResponse.json(
            {
                message: 'Login Failed',
            },
            {
                status: 401,
                statusText: 'Mocked status',
            },
        )
    }),

    http.post('/api/auth', async ({ request, params, cookies }) => {
        const { username } = await request.json();
        const token = cookies.authToken;
        console.log(token);
        if (authenticateUser(username, token)) {
            return HttpResponse.json(
                {
                },
                {
                    status: 200,
                    statusText: "Mocked successful authentication"

                }
            )
        }
        else {
            return HttpResponse.json(
                {
                },
                {
                    status: 401,
                    statusText: "Mocked unsuccessful authentication"

                }
            )
        }

    }),

    http.get('/api/profile/:username', async ({ request, params, cookies }) => {
        const username = params.username;
        const token = cookies.authToken;
        console.log(token);
        if (authenticateUser(username, token)) {
            const { fullname, email, street1, street2, city, state, zip } = users.get(username);
            const profileData = { fullname, email, street1, street2, city, state, zip };
            return HttpResponse.json(
                {
                    ...profileData
                },
                {
                    status: 200,
                    statusText: "Mocked successful authentication"
                }

            )
        }
        else {
            return HttpResponse.json(
                {
                    message: "Login failed"
                },
                {
                    status: 401,
                    statusText: "Mocked unsuccessful authentication"
                }
            )
        }
    }),

    http.post('/api/profile/:username/edit', async ({ request, params, cookies }) => {
        const profileData = await request.json();
        const username = params.username;
        const token = cookies.authToken;
        if (authenticateUser(username, token)) {
            users.set(username, profileData);
            return HttpResponse.json(
                {
                },
                {
                    status: 202,
                    statusText: "Mocked successful update of data"
                }
            )
        }
        else {
            return HttpResponse.json(
                {
                },

                {
                    status: 400,
                    statusText: "Mocked unsuccessful update of data"
                }
            )
        }

    }),

    http.post('/api/logout', async ({ request, params, cookies }) => {
        const { username } = await request.json();
        const token = cookies.authToken;
        if (authenticateUser(username, token)) {
            revokeToken(token, username);
            return HttpResponse.json(
                {
                    status: 200,
                    statusText: "Mocked logging out successfully"
                }
            )
        }
        else {
            return HttpResponse.json(
                {
                    status: 400,
                    statusText: 'Mocked unsuccessful session termination'
                }
            )
        }
    }),

    http.post('/api/register', async ({ request, params, cookies }) => {
        const { username, password } = await request.json();
        if (username && password) {
            try {
                addUser(username, password);
                return HttpResponse.json(
                    {
                        message: `Successfully registered client ${username}`
                    },
                    {
                        status: 202,
                        statusText: "Mocked successful registration"
                    }
                )
            } catch (e) {
                return HttpResponse.json(
                    {
                        message: "Unable to register client as requested"
                    },
                    {
                        status: 400,
                        statusText: "Mocked unsuccessful registration"
                    }

                )
            }

        }

    }),

    http.get('/api/quote/:username/:gallonsRequested', async ({ request, params, cookies }) => {
        const username = params.username;
        const gallons = params.gallonsRequested;
        const token = cookies.authToken;
        console.log(token)
        if (authenticateUser(username, token)) {
            const pricePerGallon = 2.5;
            return HttpResponse.json(
                {
                    pricePerGallon
                },
                {
                    status: 200,
                    statusText: "Successfully mocked get quote"
                }
            )
        }
        else {
            return HttpResponse.json(
                {

                },
                {
                    status: 400,
                    statusText: "Successfully mocked get quote failure"
                }
            )
        }

    }),

    http.post('/api/quote', async ({ request, params, cookies }) => {
        const {
            username,
            street,
            city,
            state,
            zip,
            deliveryDate,
            gallonsRequested,
            suggestedPricePerGallon,
            totalDue } = await request.json();
        try {
            if (!quoteHistory.get(username)) quoteHistory.set(username, []);
            const newQuote = {
                username,
                address: { street, city, state, zip },
                deliveryDate,
                gallonsRequested,
                suggestedPricePerGallon,
                totalDue
            };
            const userQuoteHistory = quoteHistory.get(username);
            userQuoteHistory.push(newQuote);
            return HttpResponse.json(
                {
                    status: 200,
                    statusText: "Sucessfully mocked update quote history"
                }
            )
        } catch (err) {
            return HttpResponse.json(
                {
                    status: 400,
                    statusText: "Successfully mocked unable to submit quote history"
                }
            )
        }

    }),

    http.get('/api/history/:username', async ({ request, params, cookies }) => {
        const username = params.username;
        const token = cookies.authToken;
        try {
            if (authenticateUser(username, token)) {
                const quotes = quoteHistory.get(username);
                return HttpResponse.json(
                    {
                        quotes
                    },
                    {
                        status: 200,
                        statusText: "Successfully mocked update quote history"
                    }
                )
            }
            else {
                return HttpResponse.json(
                    {
                        message: "Not authorized"
                    },
                    {
                        status: 403
                    }
                )
            }
        } catch (err) {
            return HttpResponse.json(
                {
                    status: 500,
                    statusText: "Successfully mocked unable to submit quote history"
                }
            )
        }
    })
];

export default apiHandles;