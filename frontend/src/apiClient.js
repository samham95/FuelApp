import axios from 'axios';
const base_URL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: base_URL
});

export { client };