"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useApiClient from "@/lib/useApiClient";
import { createHeaderMedia, deleteHeaderMedia, getHeaderMedia, updateHeaderMedia } from "./api";
import { headerMediaKeys } from "./queryKeys";
import type { HeaderMediaInput } from "./types";

function useInvalidateHeaderMedia() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: headerMediaKeys.all });
}

export function useHeaderMedia(onlyActive = false) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: headerMediaKeys.list(onlyActive),
    queryFn: () => getHeaderMedia(apiClient!, onlyActive),
    enabled: !!apiClient,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useActiveHeaderMedia() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: headerMediaKeys.active,
    queryFn: async () => (await getHeaderMedia(apiClient!, true))[0] ?? null,
    enabled: !!apiClient,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateHeaderMedia() {
  const apiClient = useApiClient();
  const invalidate = useInvalidateHeaderMedia();
  return useMutation({
    mutationFn: (input: HeaderMediaInput) => createHeaderMedia(apiClient!, input),
    onSuccess: invalidate,
  });
}

export function useUpdateHeaderMedia() {
  const apiClient = useApiClient();
  const invalidate = useInvalidateHeaderMedia();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: HeaderMediaInput }) => updateHeaderMedia(apiClient!, id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteHeaderMedia() {
  const apiClient = useApiClient();
  const invalidate = useInvalidateHeaderMedia();
  return useMutation({
    mutationFn: (id: number) => deleteHeaderMedia(apiClient!, id),
    onSuccess: invalidate,
  });
}
