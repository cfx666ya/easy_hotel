import { createSlice } from '@reduxjs/toolkit';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const formatDate = (d) => d.toISOString().split('T')[0];

const initialState = {
  city: '北京',
  keyword: '',
  checkIn: formatDate(today),
  checkOut: formatDate(tomorrow),
  nights: 1,
  rooms: 1,
  guests: 2,
  minPrice: '',
  maxPrice: '',
  starMin: '',
  starMax: '',
  sortBy: 'score_desc',
  poiId: 0,
  poiName: '天安门',
  distance: '',
  score: '',
  theme: '',
  brand: '',
  facility: '',
  roomType: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams(state, action) {
      Object.assign(state, action.payload);
    },
    resetSearch() {
      return { ...initialState };
    },
  },
});

export const { setSearchParams, resetSearch } = searchSlice.actions;
export default searchSlice.reducer;
