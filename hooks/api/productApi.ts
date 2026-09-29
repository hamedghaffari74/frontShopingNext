import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import type {
  ProductDto,
  ProductSpecificationDto,
  PaginatedResponse,
} from "@/types";

// ─── Products ───

interface ProductFilters {
  Name?: string;
  CategoryId?: number;
  BrandId?: number;
  MinPrice?: number;
  MaxPrice?: number;
  PageNumber?: number;
  PageSize?: number;
}

function extractPaginated(
  data: unknown,
  pageNumber: number,
  pageSize: number
): PaginatedResponse<unknown> {
  if (data && typeof data === "object" && "items" in data) {
    return data as PaginatedResponse<unknown>;
  }
  const arr = Array.isArray(data) ? data : [];
  return { items: arr, totalCount: arr.length, pageNumber, pageSize };
}

export const useGetProducts = (filters?: ProductFilters) => {
  const apiClient = useApiClient();
  const pageNumber = filters?.PageNumber ?? 1;
  const pageSize = filters?.PageSize ?? 10;

  const params = new URLSearchParams();
  if (filters?.Name) params.append("Name", filters.Name);
  if (filters?.CategoryId) params.append("CategoryId", String(filters.CategoryId));
  if (filters?.BrandId) params.append("BrandId", String(filters.BrandId));
  if (filters?.MinPrice !== undefined) params.append("MinPrice", String(filters.MinPrice));
  if (filters?.MaxPrice !== undefined) params.append("MaxPrice", String(filters.MaxPrice));
  params.append("PageNumber", String(pageNumber));
  params.append("PageSize", String(pageSize));
  const query = params.toString();

  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/Products${query ? `?${query}` : ""}`);
      return extractPaginated(data, pageNumber, pageSize);
    },
    enabled: !!apiClient,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// ─── Infinite Scroll Products ───
export const useInfiniteProducts = (
  filters?: Omit<ProductFilters, "PageNumber">,
) => {
  const apiClient = useApiClient();
  const pageSize = filters?.PageSize ?? 12;

  return useInfiniteQuery({
    queryKey: ["infinite-products", filters],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      const params = new URLSearchParams();
      if (filters?.Name) params.append("Name", filters.Name);
      if (filters?.CategoryId)
        params.append("CategoryId", String(filters.CategoryId));
      if (filters?.BrandId) params.append("BrandId", String(filters.BrandId));
      if (filters?.MinPrice !== undefined)
        params.append("MinPrice", String(filters.MinPrice));
      if (filters?.MaxPrice !== undefined)
        params.append("MaxPrice", String(filters.MaxPrice));
      params.append("PageNumber", String(pageParam));
      params.append("PageSize", String(pageSize));
      const query = params.toString();
      const { data } = await apiClient!.get(
        `/Products${query ? `?${query}` : ""}`,
      );
      return extractPaginated(data, pageParam, pageSize);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<unknown>) => {
      const loaded = lastPage.pageNumber * pageSize;
      return loaded < lastPage.totalCount ? lastPage.pageNumber + 1 : undefined;
    },
    enabled: !!apiClient,
  });
};

// ─── Search Products (for dropdown preview) ───
export const useSearchProducts = (searchTerm: string, limit = 5) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["search-products", searchTerm, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("Name", searchTerm);
      params.append("PageNumber", "1");
      params.append("PageSize", String(limit));
      const { data } = await apiClient!.get(`/Products?${params.toString()}`);
      return extractPaginated(data, 1, limit);
    },
    enabled: !!apiClient && searchTerm.length >= 2,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useGetProduct = (id: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/Products/${id}`);
      return data;
    },
    enabled: !!apiClient && !!id,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateProduct = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (body: ProductDto) => {
      const { data } = await apiClient!.post("/Products", body);
      return data;
    },
  });
};

export const useUpdateProduct = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: ProductDto & { id: number }) => {
      const { data } = await apiClient!.put(`/Products/${id}`, body);
      return data;
    },
  });
};

export const useDeleteProduct = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/Products/${id}`);
      return data;
    },
  });
};

// ─── Product Specs ───

export const useGetProductSpecs = (productId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["product-specs", productId],
    queryFn: async () => {
      const { data } = await apiClient!.get(
        `/products/${productId}/specifications`
      );
      return data;
    },
    enabled: !!apiClient && !!productId,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreateProductSpec = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({
      productId,
      ...body
    }: ProductSpecificationDto & { productId: number }) => {
      const { data } = await apiClient!.post(
        `/products/${productId}/specifications`,
        body
      );
      return data;
    },
  });
};

export const useUpdateProductSpec = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({
      productId,
      specId,
      ...body
    }: ProductSpecificationDto & { productId: number; specId: number }) => {
      const { data } = await apiClient!.put(
        `/products/${productId}/specifications/${specId}`,
        body
      );
      return data;
    },
  });
};

export const useDeleteProductSpec = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({
      productId,
      specId,
    }: {
      productId: number;
      specId: number;
    }) => {
      const { data } = await apiClient!.delete(
        `/products/${productId}/specifications/${specId}`
      );
      return data;
    },
  });
};

// ─── Product Images ───

export const useGetProductImages = (productId: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () => {
      const { data } = await apiClient!.get(
        `/products/${productId}/images`
      );
      return data;
    },
    enabled: !!apiClient && !!productId,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useUploadProductImages = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({
      productId,
      files,
    }: {
      productId: number;
      files: File[];
    }) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const { data } = await apiClient!.post(
        `/products/${productId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
  });
};

export const useDeleteProductImage = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: number;
      imageId: number;
    }) => {
      const { data } = await apiClient!.delete(
        `/products/${productId}/images/${imageId}`
      );
      return data;
    },
  });
};
