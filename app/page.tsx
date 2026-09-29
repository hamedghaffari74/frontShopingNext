"use client";

import {
  Children,
  useMemo,
  useRef,
  Suspense,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Spin } from "antd";
import { SearchOutlined, GiftOutlined, StarFilled } from "@ant-design/icons";
import { useGetProducts, useGetProductImages } from "@/hooks/api/productApi";
import { useGetSpecialOffers, useGetOfferProducts } from "@/hooks/api/specialOfferApi";
import type { RootState } from "@/store/store";

// ─── AutoMarquee (exact same as admin) ───
function AutoMarquee({ children }: { children: ReactNode }) {
  const items = useMemo(() => Children.toArray(children).filter(Boolean), [children]);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-4">
        {items.map((c, i) => (
          <div key={i} className="shrink-0">
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Product Thumb (with hover image cycle) ───
function ProductThumb({ productId, accent }: { productId: number; accent: string }) {
  const { data: images } = useGetProductImages(productId);
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);
  const imgList = Array.isArray(images) ? images as { fileUrl: string }[] : [];
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (imgList.length === 0) return <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white/80" style={{ background: accent }}>?</div>;

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => {
        if (imgList.length <= 1) return;
        intervalRef.current = setInterval(() => setIdx((prev) => (prev + 1) % imgList.length), 700);
      }}
      onMouseLeave={() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setIdx(0);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={baseApi + imgList[idx].fileUrl} alt="" className="h-full w-full object-cover transition-opacity duration-300" />
      {imgList.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {imgList.map((_, i) => (
            <span key={i} className={`rounded-full transition-all ${i === idx ? "h-1.5 w-4 bg-white shadow" : "h-1.5 w-1.5 bg-white/50"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Card ───
function ProductCard({ product }: { product: { id: number; name: string; price: number; discountPrice?: number | null; isActive: boolean; averageRating?: number; ratingCount?: number } }) {
  const discount = product.discountPrice && product.discountPrice < product.price ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const avgRating = product.averageRating ?? 0;
  const ratingCount = product.ratingCount ?? 0;
  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative h-52 w-full overflow-hidden bg-gray-50">
        <ProductThumb productId={product.id} accent="#3B82F6" />
        {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-black text-white shadow-lg">{discount}٪</span>}
        {!product.isActive && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"><span className="rounded-full bg-white/90 px-4 py-1 text-xs font-bold text-gray-700">ناموجود</span></div>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="line-clamp-2 text-sm font-semibold text-gray-800 leading-6">{product.name}</p>
        {avgRating > 0 && (
          <div className="flex items-center gap-1">
            <StarFilled style={{ color: "#FBBF24", fontSize: 11 }} />
            <span className="text-xs font-bold text-gray-700">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({ratingCount})</span>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between">
          <div>
            {discount > 0 && <span className="text-xs text-gray-400 line-through">{product.price.toLocaleString()}</span>}
            <p className="text-base font-black text-blue-600">{(product.discountPrice ?? product.price).toLocaleString()}<span className="mr-1 text-[10px] font-normal text-gray-400">تومان</span></p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Home Page ───
function HomePageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const { data: pData, isLoading: pLoad } = useGetProducts({ Name: searchQuery || undefined, PageSize: 12 });
  const { data: offers } = useGetSpecialOffers();

  const products = (pData?.items ?? []) as { id: number; name: string; price: number; discountPrice?: number | null; isActive: boolean; averageRating?: number; ratingCount?: number }[];
  const offerList = (Array.isArray(offers) ? offers : []) as { id: number; name: string; color?: string | null }[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-800">
            {searchQuery ? `نتایج جستجو: "${searchQuery}"` : "محصولات"}
          </h2>
          <Link href="/products" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
            نمایش همه محصولات
          </Link>
        </div>
        {pLoad ? <div className="flex justify-center py-20"><Spin size="large" /></div> : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : <div className="flex flex-col items-center justify-center py-20 text-gray-400"><SearchOutlined className="text-5xl" /><p className="mt-4">محصولی یافت نشد</p></div>}
      </div>

      {offerList.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white"><GiftOutlined className="text-lg" /></div><h2 className="text-xl font-extrabold text-gray-800">بخش‌های ویژه</h2></div>
          <div className="space-y-10">
            {offerList.map((o) => <OfferSection key={o.id} offer={o} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spin size="large" /></div>}>
      <HomePageContent />
    </Suspense>
  );
}

// ─── Offer Section (same design as admin, no edit/delete/add) ───
function OfferSection({ offer }: { offer: { id: number; name: string; color?: string | null } }) {
  const { data: prods, isLoading: ld } = useGetOfferProducts(offer.id);
  const { data: allProds } = useGetProducts({ PageSize: 1000 });
  const pList = (Array.isArray(prods) ? prods : []) as { productId: number; specialPrice: number }[];
  const aList = (allProds?.items ?? []) as { id: number; name: string }[];
  const accent = offer.color || "#3B82F6";

  if (pList.length === 0) return null;

  const cards = pList.map((p) => {
    const info = aList.find((x) => x.id === p.productId);
    return (
      <Link key={p.productId} href={`/products/${p.productId}?specialPrice=${p.specialPrice}`} className="flex w-36 sm:w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white shadow-2xl transition-transform hover:-translate-y-1.5" style={{ boxShadow: `0 16px 40px ${accent}33, 0 0 0 1px ${accent}40` }}>
        <div className="absolute inset-x-0 top-0 z-10 h-1" style={{ background: accent }} />
        <div className="relative h-32 sm:h-40 w-full overflow-hidden">
          <ProductThumb productId={p.productId} accent={accent} />
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, #09090b 0%, transparent 55%)" }} />
          <span className="absolute bottom-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-black tracking-wide text-white" style={{ background: accent }}>SPECIAL</span>
        </div>
        <div className="flex flex-col gap-1.5 p-3 pt-2">
          <p className="line-clamp-1 text-sm font-bold text-white/95" title={info?.name}>{info?.name ?? "محصول"}</p>
          <div className="flex items-baseline gap-1"><span className="text-lg font-black tabular-nums" style={{ color: accent }}>{p.specialPrice.toLocaleString()}</span><span className="text-[10px] text-white/45">تومان</span></div>
        </div>
      </Link>
    );
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-white shadow-xl" style={{ borderColor: `${accent}35`, boxShadow: `0 24px 60px ${accent}18` }}>
      <div className="relative flex flex-wrap items-center gap-4 overflow-hidden px-6 py-5" style={{ background: `linear-gradient(120deg, ${accent} 0%, ${accent}cc 45%, #0f172a 100%)` }}>
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl text-white backdrop-blur"><GiftOutlined /></div>
        <div className="min-w-0 flex-1"><div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Offer Zone</div><h4 className="truncate text-xl font-black text-white drop-shadow">{offer.name}</h4><p className="text-xs font-medium text-white/75">{pList.length} محصول</p></div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">ویژه</span>
      </div>
      <div className="px-3 py-6 sm:px-5">{ld ? <div className="flex justify-center py-10"><Spin /></div> :
        <AutoMarquee>
        {cards}
       </AutoMarquee>
       }
       </div>
    </div>
  );
}
