import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import { useAuth } from "@/hooks/useAuth";

export const useGetFavorites = () => {
  const apiClient = useApiClient();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/favorites");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apiClient && isAuthenticated,
    refetchOnWindowFocus: false,
  });
};

export const useAddFavorite = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const { data } = await apiClient!.post(`/favorites/${productId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useRemoveFavorite = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const { data } = await apiClient!.delete(`/favorites/${productId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useIsFavorite = (productId: number, favorites: number[] | { productId: number }[]) => {
  if (!Array.isArray(favorites)) return false;
  return favorites.some((item) => {
    if (typeof item === "number") return item === productId;
    if (typeof item === "object" && item !== null) return item.productId === productId;
    return false;
  });
};
