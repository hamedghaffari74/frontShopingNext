"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Spin, message } from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useCart } from "@/lib/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useGetProductImages } from "@/hooks/api/productApi";
import type { RootState } from "@/store/store";

interface CartItem {
  id: number;
  productId: number;
  productName?: string;
  unitPrice?: number;
  bestPrice?: number;
  finalPrice?: number;
  totalPrice?: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

function ProductImg({
  productId,
  baseApi,
}: {
  productId: number;
  baseApi: string;
}) {
  const { data: imgs } = useGetProductImages(productId);
  const list = Array.isArray(imgs) ? (imgs as { fileUrl: string }[]) : [];
  if (list.length === 0)
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        ?
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={baseApi + list[0].fileUrl}
      alt=""
      className="h-20 w-20 rounded-xl object-cover"
    />
  );
}

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { items: cart, isLoading, updateQuantity, removeFromCart } = useCart();
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);

  const items = (Array.isArray(cart) ? cart : []).map((item) => {
    const cartItem = item as CartItem;
    const finalPrice = cartItem.finalPrice ?? 0;
    return {
      ...cartItem,
      id: cartItem.id ?? cartItem.productId,
      totalPrice: cartItem.totalPrice ?? finalPrice * cartItem.quantity,
    };
  });
  const handleQty = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      const productId = isAuthenticated ? undefined : itemId;
      await updateQuantity(itemId, newQty, productId);
    } catch {
      message.error("خطا");
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromCart(itemId, isAuthenticated ? undefined : itemId);
      message.success("حذف شد");
    } catch {
      message.error("خطا");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <h1 className="mb-6 text-xl font-extrabold text-gray-800">
            سبد خرید
          </h1>
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingCartOutlined className="text-6xl text-gray-300" />
            <p className="mt-4 text-gray-500">سبد خرید شما خالی است</p>
            <Link
              href="/"
              className="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = items.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-xl font-extrabold text-gray-800">سبد خرید</h1>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <Link href={`/products/${item.productId}`} className="shrink-0">
                  <ProductImg productId={item.productId} baseApi={baseApi} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-bold text-gray-800 hover:text-blue-600 line-clamp-1"
                  >
                    {item.productName ?? `محصول #${item.productId}`}
                  </Link>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join("، ")}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {item.finalPrice && item.unitPrice && item.finalPrice < item.unitPrice ? (
                      <>
                        <span className="text-sm text-gray-400 line-through">{item.unitPrice.toLocaleString()}</span>
                        <span className="text-base font-black text-blue-600">{item.finalPrice.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-base font-black text-blue-600">{(item.finalPrice ?? 0).toLocaleString()}</span>
                    )}
                    <span className="text-xs text-gray-400">تومان</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                  <button onClick={() => handleQty(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200"><MinusOutlined className="text-xs" /></button>
                  <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                  <button onClick={() => handleQty(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200"><PlusOutlined className="text-xs" /></button>
                </div>
                <button onClick={() => handleRemove(item.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"><DeleteOutlined /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sticky bottom-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">مجموع سبد خرید</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-700">
                {totalPrice.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">تومان</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              ادامه خرید
            </Link>
            <Link href="/checkout" className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:scale-[1.01]">
              نهایی کردن خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
