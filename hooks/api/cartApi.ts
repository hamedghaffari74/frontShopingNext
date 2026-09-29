import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import { useAuth } from "@/hooks/useAuth";
import type { CartItemDto } from "@/types";

export const useGetCart = () => {
  const apiClient = useApiClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/Cart");
      if (data && typeof data === "object" && "items" in data) {
        return (data as { items: unknown[] }).items;
      }
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apiClient && isAuthenticated,
    refetchOnWindowFocus: false,
  });
};

export const useAddToCart = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CartItemDto) => {
      const { data } = await apiClient!.post("/Cart", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartItem = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      const { data } = await apiClient!.put(`/Cart/${itemId}`, quantity, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveCartItem = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const { data } = await apiClient!.delete(`/Cart/${itemId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useClearCart = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient!.delete("/Cart");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
