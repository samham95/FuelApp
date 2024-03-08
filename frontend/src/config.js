let port;
let env;

if (process.env.NODE_ENV === 'test') {
    port = '3000';
    env = 'test';
} else {
    port = '3001';
    env = 'dev';
}

const baseURL = `http://localhost:${port}/api`

export default { baseURL, env }
