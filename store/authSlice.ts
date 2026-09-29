import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  role?: string;
  mobile?: string;
}

interface AuthState {
  baseApi: string;
  api: string;
  token: string | null;
  user: UserInfo | null;
  hydrated: boolean;
}

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5037").replace(/\/$/, "");

function isExpiredJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join(""),
      ),
    ) as { exp?: unknown };
    return typeof decoded.exp !== "number" || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export const getSavedAuth = () => {
  if (typeof window === "undefined") return { token: null, user: null };

  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.token === "string" && !isExpiredJwt(parsed.token)) {
        return { token: parsed.token, user: parsed.user ?? null };
      }
      localStorage.removeItem("auth");
    }
  } catch {
    localStorage.removeItem("auth");
  }

  return { token: null, user: null };
};

const initialState: AuthState = {
  baseApi: `${apiBaseUrl}/`,
  api: `${apiBaseUrl}/api`,
  // Keep server and initial client output identical. The browser restores
  // localStorage after hydration in app/providers.tsx.
  token: null,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<{ token: string | null; user: UserInfo | null }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
    },
    setCredentials(state, action: PayloadAction<{ token: string; user: UserInfo }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth", JSON.stringify(action.payload));
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.hydrated = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
      }
    },
  },
});

export const { hydrateAuth, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
