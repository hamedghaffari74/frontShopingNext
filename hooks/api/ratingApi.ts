import { useMutation, useQueryClient } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type { RatingDto } from "@/types";

export const useRateProduct = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, ...body }: RatingDto & { productId: number }) => {
      const { data } = await apiClient!.post(`/products/${productId}/ratings`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
    },
  });
};
