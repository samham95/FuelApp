import axios from 'axios';
import config from './config';

const baseURL = config.baseURL;

const client = axios.create({
    baseURL: `${baseURL}`,
});


const authClient = (token) => axios.create({
    baseURL: `${baseURL}`,
    headers: {
        Authorization: `Bearer ${token}`,
    }
});

export { client, authClient };