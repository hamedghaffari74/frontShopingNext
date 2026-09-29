import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import { useAuth } from "@/hooks/useAuth";
import type { ProfileDto, AddressDto } from "@/types";

export const useGetProfile = () => {
  const apiClient = useApiClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/Profile");
      return data;
    },
    enabled: !!apiClient && isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: ProfileDto) => {
      const { data } = await apiClient!.put("/Profile", body);
      return data;
    },
  });
};

export const useGetAddresses = () => {
  const apiClient = useApiClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/Profile/addresses");
      return data;
    },
    enabled: !!apiClient && isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateAddress = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: AddressDto) => {
      const { data } = await apiClient!.post("/Profile/addresses", body);
      return data;
    },
  });
};

export const useUpdateAddress = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: AddressDto & { id: number }) => {
      const { data } = await apiClient!.put(`/Profile/addresses/${id}`, body);
      return data;
    },
  });
};

export const useDeleteAddress = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/Profile/addresses/${id}`);
      return data;
    },
  });
};
