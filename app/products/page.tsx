"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Spin } from "antd";
import { useGetProducts } from "@/hooks/api/productApi";

function ProductsContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? undefined;
  const categoryId = Number(searchParams.get("category")) || undefined;
  const { data, isLoading } = useGetProducts({ Name: search, CategoryId: categoryId, PageSize: 24 });
  const products = (data?.items ?? []) as { id: number; name: string; price: number; discountPrice?: number | null }[];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <p className="text-xs font-bold tracking-[.18em] text-blue-600">CATALOG</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{search ? `نتایج جست‌وجو برای «${search}»` : "همه محصولات"}</h1>
        {isLoading ? <div className="flex justify-center py-24"><Spin size="large" /></div> : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => <Link key={product.id} href={`/products/${product.id}`} className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><h2 className="line-clamp-2 min-h-12 font-bold text-slate-800">{product.name}</h2><p className="mt-4 text-lg font-black text-blue-600">{(product.discountPrice ?? product.price).toLocaleString()} <span className="text-xs font-normal text-slate-400">تومان</span></p></Link>)}
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="py-24 text-center"><Spin /></div>}><ProductsContent /></Suspense>;
}
