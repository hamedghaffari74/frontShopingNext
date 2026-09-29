// src/app/providers.tsx
"use client";

import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppStore, makeStore } from "@/store/store";
import { getSavedAuth, hydrateAuth } from "@/store/authSlice";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAuth(getSavedAuth()));
  }, [dispatch]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <AuthHydrator>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthHydrator>
    </Provider>
  );
}
