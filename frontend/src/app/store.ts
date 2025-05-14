// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import itemsReducer from "../features/items/itemsSlice"; // Adjust the import path as necessary

export const store = configureStore({
  reducer: {
    items: itemsReducer,
    // add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
