import axios from "axios";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import type { RootState } from "@/store/store";

const useApiClient = () => {
  const api = useSelector((state: RootState) => state.Auth.api);
  const token = useSelector((state: RootState) => state.Auth.token);

  const apiClient = useMemo(() => {
    if (!api) return null;

    return axios.create({
      baseURL: api,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, [api, token]);

  return apiClient;
};

export default useApiClient;
