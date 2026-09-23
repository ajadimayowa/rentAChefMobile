import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '@/services/apiConfig';

export const toggleFavorite = createAsyncThunk(
  'menu/toggleFavorite',
  async (menuId: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/specialmenu/${menuId}/favorite`);
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const rateMenu = createAsyncThunk(
  'menu/rateMenu',
  async (payload: { menuId: string; rating: number; review?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/specialmenu/${payload.menuId}/rating`, { rating: payload.rating, review: payload.review });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: { loading: false, error: null as any, lastAction: null as any },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleFavorite.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(toggleFavorite.fulfilled, (state, action) => { state.loading = false; state.lastAction = action.payload; })
      .addCase(toggleFavorite.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; })

      .addCase(rateMenu.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(rateMenu.fulfilled, (state, action) => { state.loading = false; state.lastAction = action.payload; })
      .addCase(rateMenu.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; });
  }
});

export default menuSlice.reducer;