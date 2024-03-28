import axios from 'axios';
const base_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001/api';
axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: base_URL
});

export { client };