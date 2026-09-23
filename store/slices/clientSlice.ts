import api from '@/services/apiConfig';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const rateClient = createAsyncThunk(
  'client/rateClient',
  async (
    payload: { bookingId: string; rating: number; review?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/booking/${payload.bookingId}/client/rating`, { rating: payload.rating, review: payload.review });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || { message: err.message || 'Failed to rate client' });
    }
  }
);

const clientSlice = createSlice({
  name: 'client',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(rateClient.fulfilled, (state, action) => {
        // no-op; UI handles responses
      });
  },
});

export default clientSlice.reducer;
