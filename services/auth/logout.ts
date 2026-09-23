// services/auth/logout.ts
import { persistor, store } from "@/store";
import SecureStorage from "@/store/secureStore";
import { setUserProfile } from "@/store/slices/authSlice";

const emptyUserProfile = {
  id: "",
  email: "",
  fullName: "",
  gender: "m",
  profilePic: "",
  healthInfo: "",
  allergies: "",
  isAdmin: null,
};

/**
 * Single source of truth for ending a session: clears the stored auth
 * token, resets the persisted client profile slice, and wipes the
 * redux-persist cache. Safe to call from anywhere (manual "Logout" buttons,
 * the inactivity guard, expired-session handling, etc.) without duplicating
 * the cleanup steps at every call site.
 *
 * Does NOT navigate — callers decide where to send the user afterwards.
 */
export async function performLogout(): Promise<void> {
  try {
    await SecureStorage.removeItem("userToken");
  } catch {
    // Clearing local session state should never block the logout flow.
  }

  store.dispatch(setUserProfile(emptyUserProfile));

  try {
    await persistor.purge();
  } catch {
    // Best-effort — the in-memory state above is already cleared.
  }
}
