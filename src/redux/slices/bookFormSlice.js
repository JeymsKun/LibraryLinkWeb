import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  author: "",
  genre: "",
  genreId: "",
  isbn: "",
  publisher: "",
  publishedDate: new Date().toISOString(),
  copies: "",
  description: "",
  barcode: null,
  barcodeCode: "",
  coverImage: null,
  images: [],
};

const bookFormSlice = createSlice({
  name: "bookForm",
  initialState,
  reducers: {
    setField: (state, action) => {
      const { field, value } = action.payload;
      state[field] =
        field === "publishedDate" && value instanceof Date
          ? value.toISOString()
          : value;
    },
    addImage: (state, action) => {
      if (state.images.length < 5) {
        state.images.push(action.payload);
      }
    },
    deleteImage: (state, action) => {
      state.images = state.images.filter((_, idx) => idx !== action.payload);
    },
    resetForm: () => initialState,
    setBarcode: (state, action) => {
      const { barcodeCode, barcodeUrl } = action.payload;
      state.barcodeCode = barcodeCode;
      state.barcode = barcodeUrl;
    },
  },
});

export const { setField, addImage, deleteImage, resetForm, setBarcode } =
  bookFormSlice.actions;
export default bookFormSlice.reducer;
