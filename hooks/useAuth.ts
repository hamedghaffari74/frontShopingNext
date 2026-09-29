"use client";

import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import type { RootState, AppDispatch } from "@/store/store";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.Auth);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return {
    ...auth,
    isAuthenticated: !!auth.token,
    isAdmin: auth.user?.role === "Admin",
    logout: handleLogout,
  };
};
