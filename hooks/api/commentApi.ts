import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type { CommentDto } from "@/types";

export interface Comment {
  id: number;
  productId: number;
  text: string;
  userId?: number;
  userFirstName?: string;
  userLastName?: string;
  createdAt?: string;
  parentId?: number | null;
}

export const useGetProductComments = (productId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["product-comments", productId],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/products/${productId}/comments`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!apiClient && !!productId,
    refetchOnWindowFocus: false,
  });
};

export const useAddComment = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, ...body }: CommentDto & { productId: number }) => {
      const { data } = await apiClient!.post(`/products/${productId}/comments`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-comments", variables.productId] });
    },
  });
};

export const useDeleteComment = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, commentId }: { productId: number; commentId: number }) => {
      const { data } = await apiClient!.delete(`/products/${productId}/comments/${commentId}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-comments", variables.productId] });
    },
  });
};
