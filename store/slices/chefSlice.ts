// store/slices/chefSlice.ts
import api from "@/services/apiConfig";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Chefs no longer sign in through this app (they use the web portal), so
// this slice no longer holds a logged-in chef profile — it just hosts the
// client-side "rate a chef after a booking" thunk below.

const initialState = {};

export const rateChef = createAsyncThunk(
  'chef/rateChef',
  async (
    payload: { chefId: string; bookingId: string; rating: number; review?: string },
    { rejectWithValue }
  ) => {
    try {
      const body = { rating: payload.rating, review: payload.review, bookingId: payload.bookingId };
      const res = await api.post(`/chef/${payload.chefId}/rating`, body);

      // Expect backend to return saved rating; return that for reducers to consume
      return res?.data;
    } catch (err: any) {
      // Normalize error for callers
      return rejectWithValue(err?.response?.data || { message: err.message || 'Failed to rate chef' });
    }
  }
);

const chefSlice = createSlice({
    name: "chef",
    initialState,
    reducers: {},
});

export default chefSlice.reducer;
