"use client";

import { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Spin, Tag, message } from "antd";
import { CheckOutlined, StarFilled, HeartFilled, HeartOutlined, DeleteOutlined, MessageOutlined } from "@ant-design/icons";
import { useGetProduct, useGetProductImages, useGetProductSpecs } from "@/hooks/api/productApi";
import { useGetFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/api/favoriteApi";
import { useGetProductComments, useAddComment, useDeleteComment } from "@/hooks/api/commentApi";
import { useRateProduct } from "@/hooks/api/ratingApi";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/lib/useCart";
import type { RootState } from "@/store/store";

const PALETTE_HEX: Record<string, string> = {
  قرمز: "#EF4444", آبی: "#3B82F6", سبز: "#22C55E", زرد: "#EAB308", مشکی: "#1F2937",
  سفید: "#F9FAFB", نارنجی: "#F97316", بنفش: "#A855F7", صورتی: "#EC4899", طوسی: "#6B7280",
  "قهوه‌ای": "#92400E", نیلی: "#6366F1", "فیروزه‌ای": "#14B8A6", زرشکی: "#BE123C",
  یشمی: "#059669", "نقره‌ای": "#94A3B8", طلایی: "#D97706", کرم: "#F5E6CC",
  "سرمه‌ای": "#1E3A5F", زیتونی: "#708238",
};

interface Comment {
  id: number;
  text: string;
  userFirstName?: string;
  userLastName?: string;
  createdAt?: string;
}

export default function ProductPageWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const specialPriceParam = searchParams.get("specialPrice");
  const specialPrice = specialPriceParam ? Number(specialPriceParam) : null;
  return <ProductPageInner productId={id} specialPrice={specialPrice} />;
}

function ProductPageInner({ productId, specialPrice }: { productId: number; specialPrice: number | null }) {
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: images } = useGetProductImages(productId);
  const { data: specs } = useGetProductSpecs(productId);
  const { data: favorites } = useGetFavorites();
  const { data: comments } = useGetProductComments(productId);
  const addFav = useAddFavorite();
  const remFav = useRemoveFavorite();
  const addComment = useAddComment();
  const delComment = useDeleteComment();
  const rateProduct = useRateProduct();
  const { addToCart } = useCart();
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);

  const [selColor, setSelColor] = useState("");
  const [selSize, setSelSize] = useState("");
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // --- early returns after all hooks ---
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>;
  if (!product) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center"><p className="text-6xl">😕</p><h1 className="mt-4 text-2xl font-bold text-gray-800">محصول یافت نشد</h1><Link href="/" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white">بازگشت به فروشگاه</Link></div>
    </div>
  );

  // --- data ---
  const imgList = (Array.isArray(images) ? images : []) as { id: number; fileUrl: string }[];
  const specList = (Array.isArray(specs) ? specs : []) as { id: number; title: string; description: string }[];
  const commentList = Array.isArray(comments) ? (comments as Comment[]) : [];
  const favList = Array.isArray(favorites) ? favorites : [];
  const isFav = favList.some((f: unknown) => typeof f === "object" && f !== null && ((f as { productId?: number }).productId === productId || (f as { id?: number }).id === productId));

  const p = product as Record<string, unknown>;
  const name = (p.name as string) ?? "";
  const description = (p.description as string) ?? "";
  const price = (p.price as number) ?? 0;
  const discountPrice = (p.discountPrice as number) ?? null;
  const colors = (Array.isArray(p.colors) ? p.colors : []) as string[];
  const sizes = (Array.isArray(p.sizes) ? p.sizes : []) as string[];
  const isActive = (p.isActive as boolean) ?? true;
  const avgRating = (p.averageRating as number) ?? 0;
  const ratingCount = (p.ratingCount as number) ?? 0;
  const existingUserRating = (p.userRating as number) ?? 0;

  const effectivePrice = specialPrice ?? (discountPrice && discountPrice < price ? discountPrice : price);
  const hasDiscount = specialPrice ? specialPrice < price : !!(discountPrice && discountPrice < price);
  const discountPercent = hasDiscount ? Math.round((1 - effectivePrice / price) * 100) : 0;

  const displayRating = userRating > 0 ? userRating : existingUserRating;

  // Default to first color/size if not manually selected
  const activeColor = selColor || colors[0] || "";
  const activeSize = selSize || sizes[0] || "";

  // --- handlers ---
  const toggleFav = async () => {
    try {
      if (isFav) await remFav.mutateAsync(productId);
      else await addFav.mutateAsync(productId);
      message.success(isFav ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد");
    } catch { message.error("خطا. لطفاً وارد شوید"); }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try { await addComment.mutateAsync({ productId, text: commentText.trim() }); setCommentText(""); message.success("نظر شما ثبت شد"); } catch { message.error("خطا"); }
    setSending(false);
  };

  const handleRate = async (score: number) => {
    setUserRating(score);
    try { await rateProduct.mutateAsync({ productId, score }); message.success("امتیاز ثبت شد"); } catch { message.error("خطا"); }
  };

  // ──── render ────
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 text-xs text-gray-500 sm:px-6">
          <Link href="/" className="hover:text-blue-600">فروشگاه</Link><span>/</span><span className="truncate text-gray-700">{name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery baseApi={baseApi} images={imgList} productName={name} />

          <div>
            {/* Title + Favorite */}
            <div className="mb-5">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 leading-snug sm:text-2xl">{name}</h1>
                <button onClick={toggleFav} className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  {isFav ? <HeartFilled style={{ color: "#EF4444", fontSize: 22 }} /> : <HeartOutlined style={{ color: "#9CA3AF", fontSize: 22 }} />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {isActive ? <Tag color="success" className="rounded-full border-none px-2.5 py-0.5 text-xs font-bold">موجود</Tag> : <Tag color="error" className="rounded-full border-none px-2.5 py-0.5 text-xs font-bold">ناموجود</Tag>}
                {specialPrice && <Tag color="orange" className="rounded-full border-none px-2.5 py-0.5 text-xs font-bold">پیشنهاد ویژه</Tag>}
                {avgRating > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
                    <StarFilled style={{ fontSize: 11 }} />{avgRating.toFixed(1)} ({ratingCount})
                  </span>
                )}
              </div>
            </div>

            {/* Price - only effective */}
            <div className="mb-6 rounded-2xl bg-gradient-to-bl from-blue-50 to-indigo-50/50 p-5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-black text-blue-700">{effectivePrice.toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-500">تومان</span>
                {hasDiscount && discountPercent > 0 && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-600">{discountPercent}٪</span>
                )}
              </div>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-gray-800">رنگ</h3><span className="text-xs text-gray-500">{activeColor || "انتخاب کنید"}</span></div>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const hex = PALETTE_HEX[c]; const active = (selColor || colors[0]) === c;
                    return (
                      <button key={c} onClick={() => setSelColor(c)} className={`flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-sm font-medium transition-all ${active ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 ${c === "سفید" ? "ring-gray-300" : ""}`} style={{ backgroundColor: hex || "#ccc" }}>{active && <CheckOutlined className="text-[10px] text-white drop-shadow" />}</span>{c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-gray-800">سایز</h3><span className="text-xs text-gray-500">{activeSize || "انتخاب کنید"}</span></div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = (selSize || sizes[0]) === s;
                    return <button key={s} onClick={() => setSelSize(s)} className={`flex h-11 w-14 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${active ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-500"}`}>{s}</button>;
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {isActive && (
              <button
                onClick={() => addToCart({
                  productId,
                  quantity: 1,
                  selectedColor: activeColor || null,
                  selectedSize: activeSize || null,
                  productName: name,
                  unitPrice: price,
                  finalPrice: effectivePrice,
                })}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-200 transition-all hover:shadow-2xl hover:scale-[1.01] active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.251 2.251 0 017.5 15.75h11.218a2.25 2.25 0 002.162-1.639l2.276-8.165A.75.75 0 0022.438 5.25H5.924l-.55-2.07A1.863 1.863 0 003.636 1.5H2.25a.75.75 0 000 1.5z" /></svg>
                افزودن به سبد خرید
              </button>
            )}

            {/* Rating */}
            <div className="mb-6 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">امتیاز شما</h3>
                {avgRating > 0 && <span className="flex items-center gap-1 text-xs text-gray-500"><StarFilled style={{ color: "#FBBF24" }} />{avgRating.toFixed(1)} ({ratingCount} رأی)</span>}
              </div>
              <RatingStars value={displayRating} onChange={handleRate} size={28} />
            </div>
          </div>
        </div>

        {/* Specs + Description */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {specList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4"><StarFilled className="text-amber-400 text-sm" /><h3 className="text-base font-extrabold text-gray-800">مشخصات فنی</h3></div>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm"><tbody>{specList.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}><td className="w-1/3 px-4 py-3 text-xs font-medium text-gray-400">{s.title}</td><td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.description}</td></tr>
                ))}</tbody></table>
              </div>
            </div>
          )}
          {description && (
            <div>
              <div className="flex items-center gap-2 mb-4"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500"><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg><h3 className="text-base font-extrabold text-gray-800">توضیحات محصول</h3></div>
              <div className="rounded-xl bg-gray-50/50 p-5"><p className="text-sm leading-8 text-gray-600 whitespace-pre-line">{description}</p></div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-5"><MessageOutlined className="text-blue-500" /><h3 className="text-base font-extrabold text-gray-800">نظرات کاربران</h3><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">{commentList.length}</span></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-5">
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="نظر خود را بنویسید..." className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:bg-white outline-none resize-none" rows={4} />
            <div className="mt-3 flex justify-end"><button onClick={submitComment} disabled={sending || !commentText.trim()} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{sending ? "..." : "ثبت نظر"}</button></div>
          </div>
          {commentList.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-gray-200"><MessageOutlined className="text-3xl text-gray-300" /><p className="mt-3 text-sm text-gray-400">هنوز نظری ثبت نشده</p></div>
          ) : (
            <div className="space-y-3">
              {commentList.map((c) => (
                <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-800">{c.userFirstName || c.userLastName ? `${c.userFirstName ?? ""} ${c.userLastName ?? ""}`.trim() : "کاربر"}</span>
                    <button onClick={() => delComment.mutateAsync({ productId, commentId: c.id }).then(() => message.success("نظر حذف شد")).catch(() => message.error("خطا"))} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><DeleteOutlined /></button>
                  </div>
                  <p className="text-sm leading-7 text-gray-600">{c.text}</p>
                  {c.createdAt && <p className="text-xs text-gray-400 mt-2">{new Date(c.createdAt).toLocaleDateString("fa-IR")}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Gallery ───
function ProductGallery({ baseApi, images, productName }: { baseApi: string; images: { id: number; fileUrl: string }[]; productName: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (images.length === 0) return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-300">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="aspect-[4/3]">{/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={baseApi + images[activeIdx].fileUrl} alt={productName} className="h-full w-full object-cover transition-all duration-500" /></div>
        {images.length > 1 && (<>
          <button onClick={() => setActiveIdx((prev) => (prev - 1 + images.length) % images.length)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur hover:bg-white hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" /></svg></button>
          <button onClick={() => setActiveIdx((prev) => (prev + 1) % images.length)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur hover:bg-white hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" /></svg></button>
        </>)}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur">{activeIdx + 1} / {images.length}</div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{images.map((img, i) => (
          <button key={img.id} onClick={() => setActiveIdx(i)} className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i === activeIdx ? "border-blue-500 shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}>{/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={baseApi + img.fileUrl} alt="" className="h-20 w-20 object-cover" /></button>
        ))}</div>
      )}
    </div>
  );
}
