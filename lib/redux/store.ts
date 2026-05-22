import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import authReducer from "./features/authSlice";
import userReducer from "./features/userSlice";
import notificationReducer from "./features/notificationSlice";
import { notificationMiddleware } from "./middleware/notificationMiddleware";
import { baseApi } from "./services/baseApi";

// Create the store with the APIs
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    notification: notificationReducer,
    currentUser: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, notificationMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
