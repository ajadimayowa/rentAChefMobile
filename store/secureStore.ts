// store/secureStore.ts
import * as SecureStore from "expo-secure-store";
import { Storage } from "redux-persist";

const SecureStorage: Storage = {
  async getItem(key) {
    const item = await SecureStore.getItemAsync(key);
    return item;
  },
  async setItem(key, value) {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key) {
    await SecureStore.deleteItemAsync(key);
  },
};

export default SecureStorage;