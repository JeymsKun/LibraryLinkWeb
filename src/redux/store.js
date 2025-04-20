import { configureStore } from "@reduxjs/toolkit";
import bookFormReducer from "./slices/bookFormSlice";

export const store = configureStore({
  reducer: {
    bookForm: bookFormReducer,
  },
});
