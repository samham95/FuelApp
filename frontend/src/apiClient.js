import axios from 'axios';
import config from './config';

const baseURL = config.baseURL;

const client = axios.create({
    baseURL: `${baseURL}`,
});

export { client };