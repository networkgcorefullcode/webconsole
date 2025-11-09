import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/api.config';

const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors for handling requests and responses
httpClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        // You can add authorization tokens or other headers here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error) => {
        // Handle errors globally
        console.error('HTTP error:', error);
        return Promise.reject(error);
    }
);

export default httpClient;