import { useQuery, useMutation } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";

export const useGetAdminUsers = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await apiClient!.get("/admin/users");
      return data;
    },
    enabled: !!apiClient,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useGetAdminUser = (id: number) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const { data } = await apiClient!.get(`/admin/users/${id}`);
      return data;
    },
    enabled: !!apiClient && !!id,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useDeleteUser = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient!.delete(`/admin/users/${id}`);
      return data;
    },
  });
};

export const useUpdateUserRole = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const { data } = await apiClient!.put(
        `/admin/users/${id}/role`,
        JSON.stringify(role),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return data;
    },
  });
};
