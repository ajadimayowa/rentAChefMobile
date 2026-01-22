// store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import SecureStorage from "./secureStore";
import authReducer from "./slices/authSlice";
import locationReducer from "./slices/locationSlice"

// combine all reducers
const rootReducer = combineReducers({
    auth: authReducer,
    location:locationReducer
});

// persist config
const persistConfig = {
    key: "root",
    storage: SecureStorage,
    whitelist: ["auth","location"],
    keyPrefix: "", // ✅ removes "persist:" prefix
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // SecureStore stores strings
        }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;