import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type { SizeDto } from "@/types";

export const useGetSizes = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["sizes"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/Sizes");
      return data;
    },
    enabled: !!apiClient,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateSize = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: SizeDto) => {
      const { data } = await apiClient!.post("/Sizes", body);
      return data;
    },
  });
};

export const useUpdateSize = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: SizeDto & { id: number }) => {
      const { data } = await apiClient!.put(`/Sizes/${id}`, body);
      return data;
    },
  });
};

export const useDeleteSize = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/Sizes/${id}`);
      return data;
    },
  });
};
