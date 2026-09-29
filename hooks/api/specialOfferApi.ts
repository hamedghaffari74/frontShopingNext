import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type { SpecialOfferDto, SpecialOfferProductDto } from "@/types";

export const useGetSpecialOffers = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["special-offers"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/SpecialOffers");
      return data;
    },
    enabled: !!apiClient,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateSpecialOffer = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: SpecialOfferDto) => {
      const { data } = await apiClient!.post("/SpecialOffers", body);
      return data;
    },
  });
};

export const useUpdateSpecialOffer = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: SpecialOfferDto & { id: number }) => {
      const { data } = await apiClient!.put(`/SpecialOffers/${id}`, body);
      return data;
    },
  });
};

export const useDeleteSpecialOffer = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/SpecialOffers/${id}`);
      return data;
    },
  });
};

export const useGetOfferProducts = (offerId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["offer-products", offerId],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/SpecialOffers/${offerId}/products`);
      return data;
    },
    enabled: !!apiClient && !!offerId,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useAddOfferProduct = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: SpecialOfferProductDto & { id: number }) => {
      const { data } = await apiClient!.post(`/SpecialOffers/${id}/products`, body);
      return data;
    },
  });
};

export const useRemoveOfferProduct = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ offerId, productId }: { offerId: number; productId: number }) => {
      const { data } = await apiClient!.delete(`/SpecialOffers/${offerId}/products/${productId}`);
      return data;
    },
  });
};
