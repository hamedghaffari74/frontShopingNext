"use client";

import { useState } from "react";
import { Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

// ─── Product Gallery ───
export function ProductGallery({
  baseApi,
  images,
  productName,
}: {
  baseApi: string;
  images: { id: number; fileUrl: string }[];
  productName: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={baseApi + images[activeIdx].fileUrl}
            alt={productName}
            className="h-full w-full object-cover transition-all duration-500"
          />
        </div>
        {/* Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur transition-all hover:bg-white hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" /></svg>
            </button>
            <button
              onClick={() => setActiveIdx((prev) => (prev + 1) % images.length)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur transition-all hover:bg-white hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" /></svg>
            </button>
          </>
        )}
        {/* Counter */}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === activeIdx ? "border-blue-500 shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={baseApi + img.fileUrl} alt="" className="h-20 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Info ───
export function ProductInfo({
  product,
  specs,
}: {
  product: Record<string, unknown>;
  specs: { id: number; title: string; description: string }[];
}) {
  const name = (product.name as string) ?? "";
  const description = (product.description as string) ?? "";
  const price = (product.price as number) ?? 0;
  const discountPrice = (product.discountPrice as number) ?? null;
  const colors = (Array.isArray(product.colors) ? product.colors : []) as string[];
  const sizes = (Array.isArray(product.sizes) ? product.sizes : []) as string[];
  const isActive = (product.isActive as boolean) ?? true;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round((1 - discountPrice! / price) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Name & Status */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-tight sm:text-3xl">{name}</h1>
        {!isActive && <Tag color="error" className="mt-2 rounded-full px-3">ناموجود</Tag>}
      </div>

      {/* Price */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
        {hasDiscount ? (
          <div>
            <span className="text-sm text-gray-400 line-through">{price.toLocaleString()} تومان</span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-black text-blue-600">{discountPrice!.toLocaleString()}</span>
              <span className="text-sm text-gray-500">تومان</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">{discountPercent}٪ تخفیف</span>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{price.toLocaleString()}</span>
            <span className="text-sm text-gray-500">تومان</span>
          </div>
        )}
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-700">رنگ‌ها</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <span key={c} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 hover:shadow">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-gray-700">سایزها</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <span key={s} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 hover:shadow">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart */}
      {isActive && (
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-300 hover:scale-[1.02] active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.251 2.251 0 017.5 15.75h11.218a2.25 2.25 0 002.162-1.639l2.276-8.165A.75.75 0 0022.438 5.25H5.924l-.55-2.07A1.863 1.863 0 003.636 1.5H2.25a.75.75 0 000 1.5z" /></svg>
          افزودن به سبد خرید
        </button>
      )}

      {/* Description */}
      {description && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-700">توضیحات</h3>
          <p className="text-sm leading-7 text-gray-600">{description}</p>
        </div>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-gray-700">مشخصات فنی</h3>
          <div className="divide-y divide-gray-100">
            {specs.map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CheckCircleOutlined className="text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">{s.title}</p>
                  <p className="text-sm font-semibold text-gray-800">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
