import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice';
import hotelListReducer from './slices/hotelListSlice';

const store = configureStore({
  reducer: {
    search: searchReducer,
    hotelList: hotelListReducer,
  },
});

export default store;
