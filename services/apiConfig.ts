import axios from 'axios';
// import { API_BASEURL, API_KEY } from '@env';
// console.log({ currentDev: dev })
// console.log({ currentEnv: baseURL })

import Constants from 'expo-constants';
// const apiUrl = Constants.manifest.extra.apiUrl;
// const nodeEnv = Constants.manifest.extra.nodeEnv;
const apiUrl = Constants.expoConfig?.extra?.apiUrl
// console.log({base:apiUrl,env:nodeEnv})

const api = axios.create({
    baseURL: `${apiUrl}/api/v1`, // replace with your API base URL
    headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin":"*"
    },
});

const MAX_RETRIES = 0;

// Add an interceptor to handle retry logic
api.interceptors.response.use(
  (response) => response, // On success, just return the response
  async (error) => {
    const { config } = error;

     console.log(
      `%c➡️ [API REQUEST]`,
      'color: cyan',
      config.method?.toUpperCase(),
      config.baseURL + config.url,

    );
    
    // If retries are not already set, initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // If we have hit the max retries, reject the promise
    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }

    // Increment the retry count
    config.__retryCount += 1;

    // Retry the request after a short delay (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Retry the request
    return api(config);
  }
);

let token: string | null = null;

api.interceptors.request.use(
    config => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export const setToken = (newToken: string) => {
    token = newToken;
};

export default api;