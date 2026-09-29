"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type Options = {
  requireAdmin?: boolean;
};

/**
 * A single client-side guard for the current localStorage-based auth design.
 * It waits for localStorage hydration before navigating, so the server render
 * cannot redirect based on a temporary, empty Redux state.
 */
export function useProtectedRoute({ requireAdmin = false }: Options = {}) {
  const { hydrated, isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      const search = window.location.search;
      const next = `${pathname}${search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, isAdmin, pathname, requireAdmin, router]);

  return hydrated && isAuthenticated && (!requireAdmin || isAdmin);
}
