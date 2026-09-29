import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCredentials } from "@/store/authSlice";
import type { RootState, AppDispatch } from "@/store/store";
import type { LoginDto, RegisterDto, AuthResponse } from "@/types";

export const useLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const api = useSelector((state: RootState) => state.Auth.api);

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const { data: loginRes } = await axios.post<AuthResponse>(
        `${api}/Auth/Login`,
        data
      );
      const token = loginRes.token;
      const user = {
        role: loginRes.role,
        mobile: loginRes.mobile ?? data.mobile,
      };

      dispatch(setCredentials({ token, user }));
      return { token, user };
    },
  });
};

export const useRegister = () => {
  const api = useSelector((state: RootState) => state.Auth.api);

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const { data: res } = await axios.post(`${api}/Auth/Register`, data);
      return res;
    },
  });
};
