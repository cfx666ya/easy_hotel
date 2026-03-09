import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  loading: false,
  hasMore: true,
  cursor: 0,
  limit: 3,
};

const hotelListSlice = createSlice({
  name: 'hotelList',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    appendHotels(state, action) {
      const existingIds = new Set(state.list.map((i) => i.id));
      const newItems = action.payload.filter((i) => !existingIds.has(i.id));
      state.list.push(...newItems);
    },
    setHasMore(state, action) {
      state.hasMore = action.payload;
    },
    setCursor(state, action) {
      state.cursor = action.payload;
    },
    resetHotelList(state) {
      state.list = [];
      state.hasMore = true;
      state.cursor = 0;
    },
  },
});

export const {
  setLoading,
  appendHotels,
  setHasMore,
  setCursor,
  resetHotelList,
} = hotelListSlice.actions;
export default hotelListSlice.reducer;
