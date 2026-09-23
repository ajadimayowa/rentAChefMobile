import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/apiConfig';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  [key: string]: any;
}

interface NotificationsState {
  items: NotificationItem[];
  count: number; // unread count
  loading: boolean;
  error?: string | null;
  page: number;
  pages: number;
}

const initialState: NotificationsState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async ({ userId, page = 1 }: { userId: string; page?: number }, thunkAPI) => {
  try {
    const res = await api.get(`/notifications?userId=${userId}&page=${page}&limit=20`);
    return res?.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data || err?.message || 'Fetch error');
  }
});

export const markNotificationAsRead = createAsyncThunk('notifications/markRead', async (id: string, thunkAPI) => {
  try {
    const res = await api.put(`/notification/${id}/read`);
    return { id, data: res?.data };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data || err?.message || 'Mark read error');
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAll', async ({ userId }: { userId: string }, thunkAPI) => {
  try {
    // Backend doesn't have bulk endpoint; fetch all pages and mark individually
    const res = await api.get(`/notifications?userId=${userId}&page=1&limit=100`);
    const items: NotificationItem[] = res?.data?.payload || [];
    const unread = items.filter((i) => !i.isRead);
    await Promise.all(unread.map((n) => api.put(`/notification/${n._id}/read`)));
    return { marked: unread.map((n) => n._id) };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.response?.data || err?.message || 'Mark all error');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications(state) {
      state.items = [];
      state.count = 0;
    },
    setUnreadCount(state, action) {
      state.count = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload || {};
      state.items = payload.payload || [];
      state.page = payload.pagination?.page || 1;
      state.pages = payload.pagination?.pages || 1;
      state.count = (state.items || []).filter((i) => !i.isRead).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any || 'Error';
    });

    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const id = (action.payload as any)?.id;
      const idx = state.items.findIndex((i) => i._id === id);
      if (idx >= 0) state.items[idx].isRead = true;
      state.count = Math.max(0, state.count - 1);
    });

    builder.addCase(markAllAsRead.fulfilled, (state, action) => {
      state.items = state.items.map((i) => ({ ...i, isRead: true }));
      state.count = 0;
    });
  }
});

export const { clearNotifications, setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
