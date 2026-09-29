"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddToCart,
  useGetCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/api/cartApi";
import type { CartItemDto } from "@/types";

const STORAGE_KEY = "offline_cart";
const CART_UPDATED_EVENT = "cart-updated";

export interface LocalCartItem extends CartItemDto {
  productName?: string;
  unitPrice?: number;
  finalPrice?: number;
}

export type CartInput = CartItemDto & Pick<LocalCartItem, "productName" | "unitPrice" | "finalPrice">;

function getLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function persistLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function clearLocalCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getLocalCartItems() {
  return getLocalCart();
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const { data: apiCart, isLoading: isApiCartLoading } = useGetCart();
  const addMutation = useAddToCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  // Do not read localStorage during render: SSR and the first client render
  // must stay identical.
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
  const syncedRef = useRef(false);

  useEffect(() => {
    const refresh = () => setLocalItems(getLocalCart());
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh);
  }, []);

  // The API remains the source of truth after login. Guest data is cleared only
  // after every local item has been accepted by the API.
  useEffect(() => {
    if (!isAuthenticated) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;

    const local = getLocalCart();
    syncedRef.current = true;
    if (local.length === 0) return;

    void Promise.all(
      local.map(({ productName, unitPrice, finalPrice, ...item }) => addMutation.mutateAsync(item)),
    )
      .then(() => {
        clearLocalCart();
        message.success("سبد خرید مهمان با حساب شما همگام شد");
      })
      .catch(() => {
        // Keep the guest cart intact. It can safely be retried after logout/login.
        syncedRef.current = false;
      });
  }, [addMutation, isAuthenticated]);

  const addToCart = useCallback(
    async (item: CartInput) => {
      if (isAuthenticated) {
        const { productName, unitPrice, finalPrice, ...apiItem } = item;
        void productName;
        void unitPrice;
        void finalPrice;
        await addMutation.mutateAsync(apiItem);
        message.success("به سبد خرید اضافه شد");
        return;
      }

      const current = getLocalCart();
      const existing = current.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.selectedColor === item.selectedColor &&
          cartItem.selectedSize === item.selectedSize,
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        current.push(item);
      }
      persistLocalCart(current);
      message.success("به سبد خرید مهمان اضافه شد");
    },
    [addMutation, isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number, productId?: number) => {
      if (quantity < 1) return;
      if (isAuthenticated) {
        await updateMutation.mutateAsync({ itemId, quantity });
        return;
      }

      const current = getLocalCart().map((item) =>
        item.productId === (productId ?? itemId) ? { ...item, quantity } : item,
      );
      persistLocalCart(current);
    },
    [isAuthenticated, updateMutation],
  );

  const removeFromCart = useCallback(
    async (itemId: number, productId?: number) => {
      if (isAuthenticated) {
        await removeMutation.mutateAsync(itemId);
        return;
      }
      persistLocalCart(getLocalCart().filter((item) => item.productId !== (productId ?? itemId)));
    },
    [isAuthenticated, removeMutation],
  );

  const items = isAuthenticated
    ? (Array.isArray(apiCart) ? apiCart : [])
    : localItems;
  const cartCount = items.reduce(
    (total, item) => total + (typeof item === "object" && item && "quantity" in item ? Number(item.quantity) || 0 : 0),
    0,
  );

  return {
    items,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    isLoading: isAuthenticated && isApiCartLoading,
  };
}
