// store/slices/authSlice.ts
import api from "@/services/apiConfig";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IChefProfile {
    chefData: {
        "id": string,
        "staffId": string,
        "name": string,
        "email": string,
        "gender": string,
        "profilePic": string,
        "isPasswordUpdated": boolean | null
    }
}


const initialState: IChefProfile = {
    chefData: {
        "id": "",
        "staffId": "",
        "name": "",
        "email": "",
        "gender": 'm',
        "profilePic": '',
        "isPasswordUpdated": null
    }
}
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
    name: "auth",
    initialState,
    reducers: {
        setChefProfile: (
            state,
            action: PayloadAction<any>
        ) => {
            state.chefData = action.payload;
        }
    },
});

export const { setChefProfile } = chefSlice.actions;
export default chefSlice.reducer;