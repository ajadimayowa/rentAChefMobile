// services/apiClient.ts
import axios, { AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_API_URL || "";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function callApi<T = any>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> {
    try {
        const response = await api.request<T>({
            method,
            url,
            data,
            ...config,
        });
        return response.data;
    } catch (error: any) {
        console.error("API Error:", error?.response || error.message);
        throw error?.response?.data || { message: "Network error" };
    }
}


// export const Api = {
//   get: <T>(url: string, config?: AxiosRequestConfig) => callApi<T>("GET", url, null, config),
//   post: <T>(url: string, body?: any, config?: AxiosRequestConfig) => callApi<T>("POST", url, body, config),
//   put: <T>(url: string, body?: any, config?: AxiosRequestConfig) => callApi<T>("PUT", url, body, config),
//   delete: <T>(url: string, config?: AxiosRequestConfig) => callApi<T>("DELETE", url, null, config),
// };