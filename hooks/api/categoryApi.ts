import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type { CategoryDto, PaginatedResponse } from "@/types";

export const useGetCategories = (pageNumber = 1, pageSize = 10) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["categories", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await apiClient!.get(
        `/Categories?PageNumber=${pageNumber}&PageSize=${pageSize}`
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

export const useGetCategory = (id: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/Categories/${id}`);
      return data;
    },
    enabled: !!apiClient && !!id,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateCategory = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: CategoryDto) => {
      const { data } = await apiClient!.post("/Categories", body);
      return data;
    },
  });
};

export const useUpdateCategory = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: CategoryDto & { id: number }) => {
      const { data } = await apiClient!.put(`/Categories/${id}`, body);
      return data;
    },
  });
};

export const useDeleteCategory = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/Categories/${id}`);
      return data;
    },
  });
};
