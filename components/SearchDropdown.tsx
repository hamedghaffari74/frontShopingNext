"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Input, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchProducts, useGetProductImages } from "@/hooks/api/productApi";
import type { RootState } from "@/store/store";

function ProductPreviewThumb({ productId }: { productId: number }) {
  const { data: imgs } = useGetProductImages(productId);
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);
  const list = Array.isArray(imgs) ? (imgs as { fileUrl: string }[]) : [];
  if (list.length === 0)
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-xs">
        ?
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={baseApi + list[0].fileUrl}
      alt=""
      className="h-12 w-12 shrink-0 rounded-lg object-cover"
    />
  );
}

export default function SearchDropdown({ variant = "default" }: { variant?: "default" | "hero" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showCount, setShowCount] = useState(5);
  const debouncedQuery = useDebounce(query, 400);
  const { data: searchData, isLoading } = useSearchProducts(
    debouncedQuery,
    showCount,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncQueryFromUrl = () => {
      setQuery(new URLSearchParams(window.location.search).get("search") ?? "");
    };
    syncQueryFromUrl();
    window.addEventListener("popstate", syncQueryFromUrl);
    return () => window.removeEventListener("popstate", syncQueryFromUrl);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items =
    searchData && "items" in searchData
      ? (searchData.items as {
          id: number;
          name: string;
          price: number;
          discountPrice?: number | null;
        }[])
      : [];
  const totalCount =
    searchData && "totalCount" in searchData ? searchData.totalCount : 0;

  const handleSearch = () => {
    setOpen(false);
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div ref={ref} className={`relative w-full ${variant === "hero" ? "max-w-none" : "max-w-xs"}`}>
      <Input
        size="large"
        placeholder="جست‌وجوی محصول، برند یا دسته‌بندی..."
        prefix={<SearchOutlined className="text-gray-400 cursor-pointer" onClick={handleSearch} />}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowCount(5);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        allowClear
        className={variant === "hero" ? "!h-12 !rounded-2xl !border-0 !bg-transparent !px-3 !text-base !shadow-none" : ""}
      />

      {open && debouncedQuery.length >= 2 && (
        <div className="absolute top-full mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-400">
              محصولی یافت نشد
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <ProductPreviewThumb productId={item.id} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-blue-600 font-bold">
                        {(item.discountPrice ?? item.price).toLocaleString()}{" "}
                        تومان
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {totalCount > showCount && (
                <button
                  className="w-full border-t border-gray-100 py-2 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCount((c) => c + 5);
                  }}
                >
                  بیشتر ({totalCount - showCount} محصول دیگر)
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
