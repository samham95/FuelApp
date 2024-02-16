import { http, HttpResponse } from 'msw';
const JWT_SECRET = 'secretkeyhehehe';

let users = new Map();
let sessions = new Map();
let revokedTokens = new Map();
users.set('samham', {
    fullname: 'Sammy Hamdi',
    password: 'abc123',
    email: 'samham@gmail.com',
    street1: '9222 Memorial Dr.',
    street2: '1215 Main Street',
    city: 'Houston',
    state: 'Texas',
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
    /*     http.get('/auth', async ({ request, params, cookies }) => {
            const token = cookies.token;
            try {
                jwt.verify(token, JWT_SECRET);
                res.json({ isAuthenticated: true });
            } catch (error) {
                res.json({ isAuthenticated: false });
            }
        }), */

    http.post('/api/login', async ({ request, params, cookies }) => {
        const { username, password, isChecked } = await request.json();
        if (validateUser(username, password)) {
            const token = generateToken(username);
            return HttpResponse.json(
                {
                    token,
                    username,
                },
                {
                    status: 202,
                    statusText: 'Mocked status'
                },


            )
        }
        return HttpResponse.json(
            {
                message: 'Login Failed',
            },
            {
                status: 400,
                statusText: 'Mocked status',
            },
        )
    }),

    http.post('/api/auth', async ({ request, params, cookies }) => {
        const { username, token } = await request.json();
        if (authenticateUser(username, token)) {
            return HttpResponse.json(
                {
                    isAuthorized: true
                },
                {
                    status: 202
                }
            )
        }
        else {
            return HttpResponse.json(
                {
                    isAuthorized: false
                },
                {
                    status: 403
                }
            )
        }

    }),

    http.get('/api/profile/:username', async ({ request, params, cookies }) => {
        const username = params.username;
        const token = request.headers.get('Authorization').split(' ')[1];
        console.log(sessions);
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
                    status: 400,
                    statusText: "Mocked unsuccessful authentication"
                }
            )
        }
    }),

    http.post('/api/profile/:username/edit', async ({ request, params, cookies }) => {
        const profileData = await request.json();
        const username = params.username;
        const token = request.headers.get('Authorization').split(' ')[1];
        if (authenticateUser(username, token)) {
            users.set(username, profileData);
            return HttpResponse.json(
                {
                    status: 202,
                    statusText: "Mocked successful update of data"
                }
            )
        }
        else {
            return HttpResponse.json(
                {
                    status: 400,
                    statusText: "Mocked unsuccessful update of data"
                }
            )
        }

    }),

    http.post('/api/logout', async ({ request, params, cookies }) => {
        const { username } = await request.json();
        const { token } = request.headers.get('Authorization').split(' ')[1];
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
                    status: 500,
                    statusText: 'Mocked unsuccessfully session termination'
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
                        message: "User already exists"
                    },
                    {
                        status: 400,
                        statusText: "Mocked unsuccessful registration"
                    }

                )
            }

        }

    })

];

export default apiHandles;