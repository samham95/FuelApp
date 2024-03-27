import axios from 'axios';
const baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: `${baseURL}`,
});

export { client };