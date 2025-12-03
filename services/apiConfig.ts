import * as SecureStore from "expo-secure-store";
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
    "Access-Control-Allow-Origin": "*"
  },
});

const MAX_RETRIES = 2;

api.interceptors.response.use(
  (response:any) => {
    // console.log(
    //   '%c⬅️ [API RESPONSE SUCCESS]',
    //   'color: lightgreen',
    //   response.config?.method?.toUpperCase(),
    //   response.config?.baseURL + response.config?.url,
    //   '\nResponse Data:',
    //   response?.data
    // );
    // console.log({seeResp:response?.data})
    return response;
  },
  async (error:any) => {
    console.log({seeRootError:error})
    const { config } = error;

    console.log(
      '%c❌ [API RESPONSE ERROR]',
      'color: red',
      config?.method?.toUpperCase(),
      config?.baseURL + config?.url,
      '\nError:',
      error?.response?.message || error.message
    );

    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    return error;
  }
);

let token: string | null = null;


api.interceptors.request.use(
  async (config) => {
    const userToken = await SecureStore.getItemAsync("userToken");
    // console.log({ seeOurTok: userToken });

    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const setToken = (newToken: string) => {
  token = newToken;
};

export default api;