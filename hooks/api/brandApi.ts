import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type { BrandDto, PaginatedResponse } from "@/types";

export const useGetBrands = (pageNumber = 1, pageSize = 10) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["brands", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await apiClient!.get(
        `/Brands?PageNumber=${pageNumber}&PageSize=${pageSize}`
      );
      if (data && typeof data === "object" && "items" in data) {
        return data as PaginatedResponse<unknown>;
      }
      return { items: Array.isArray(data) ? data : [], totalCount: Array.isArray(data) ? data.length : 0, pageNumber, pageSize };
    },
    enabled: !!apiClient,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useGetBrand = (id: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["brand", id],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/Brands/${id}`);
      return data;
    },
    enabled: !!apiClient && !!id,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateBrand = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: BrandDto) => {
      const { data } = await apiClient!.post("/Brands", body);
      return data;
    },
  });
};

export const useUpdateBrand = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: BrandDto & { id: number }) => {
      const { data } = await apiClient!.put(`/Brands/${id}`, body);
      return data;
    },
  });
};

export const useDeleteBrand = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/Brands/${id}`);
      return data;
    },
  });
};
