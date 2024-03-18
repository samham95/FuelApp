import axios from 'axios';
import config from './config';

axios.defaults.withCredentials = true;

const baseURL = config.baseURL;

const client = axios.create({
    baseURL: `${baseURL}`,
});

export { client };