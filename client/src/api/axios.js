import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5001',
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Flask raw might need parsing, but usually Bearer is standard
            // My backend currently doesn't strictly check 'Bearer', but let's send it.
            // Actually my backend routes don't use @login_required yet, but for future proofing.
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
