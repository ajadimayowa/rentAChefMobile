import * as SecureStore from "expo-secure-store";
import axios, { AxiosError, AxiosResponse } from "axios";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

const api = axios.create({
  baseURL: `${apiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

const MAX_RETRIES = 2;

/* -------------------- RESPONSE INTERCEPTOR -------------------- */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    /**
     * Always return the backend payload
     * {
     *   success: boolean,
     *   message: string,
     *   data?: any
     * }
     */
    return response;
  },
  async (error: AxiosError<any>) => {
    const config: any = error.config;

    const apiMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    console.log(
      "%c❌ [API RESPONSE ERROR]",
      "color: red",
      config?.method?.toUpperCase(),
      `${config?.baseURL}${config?.url}`,
      "\nMessage:",
      apiMessage
    );

    // Retry logic
    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject({
        success: false,
        message: apiMessage,
        status: error.response?.status,
        error,
      });
    }

    config.__retryCount += 1;

    return api(config);
  }
);

/* -------------------- REQUEST INTERCEPTOR -------------------- */
api.interceptors.request.use(
  async (config) => {
    const userToken = await SecureStore.getItemAsync("userToken");

    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;