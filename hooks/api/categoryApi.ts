import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import { toCategoryNode, type CategoryNode } from "@/lib/categoryTree";
import type { CategoryDto, PaginatedResponse } from "@/types";

export const CATEGORY_TREE_KEY = ["category-tree"] as const;

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

function extractItems(data: unknown): unknown[] {
  if (data && typeof data === "object" && "items" in data) {
    const items = (data as { items?: unknown }).items;
    return Array.isArray(items) ? items : [];
  }
  return Array.isArray(data) ? data : [];
}

/**
 * Builds the full category tree for the admin UI.
 *
 * `GET /Categories` only nests one level, so children of children come back
 * with an empty `children` array even though they exist. To recover the real
 * hierarchy we walk each node's `GET /Categories/{id}` endpoint, which returns
 * that node's direct children, until no deeper level is left.
 */
export const useGetCategoryTree = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: CATEGORY_TREE_KEY,
    queryFn: async (): Promise<CategoryNode[]> => {
      const client = apiClient!;

      const { data: listData } = await client.get(
        "/Categories?PageNumber=1&PageSize=1000"
      );
      const roots = extractItems(listData)
        .map(toCategoryNode)
        .filter((node): node is CategoryNode => node !== null);

      // Guards against duplicated ids and cycles in a broken response.
      const visited = new Set<number>();

      const loadNode = async (node: CategoryNode): Promise<CategoryNode> => {
        if (visited.has(node.id)) {
          return { id: node.id, name: node.name, parentId: node.parentId ?? null };
        }
        visited.add(node.id);

        let rawChildren: unknown[] = [];
        try {
          const { data } = await client.get(`/Categories/${node.id}`);
          const children = (data as { children?: unknown })?.children;
          rawChildren = Array.isArray(children) ? children : [];
        } catch {
          // If the detail call fails fall back to whatever the list nested.
          rawChildren = node.children ?? [];
        }

        const children = await Promise.all(
          rawChildren
            .map(toCategoryNode)
            .filter((child): child is CategoryNode => child !== null)
            .map(loadNode)
        );

        return {
          id: node.id,
          name: node.name,
          parentId: node.parentId ?? null,
          ...(children.length > 0 ? { children } : {}),
        };
      };

      return Promise.all(roots.map(loadNode));
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
