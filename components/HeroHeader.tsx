"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import SearchDropdown from "@/components/SearchDropdown";
import { useActiveHeaderMedia } from "@/feature/headerMedia/hooks";
import type { RootState } from "@/store/store";

function isSafeInternalLink(url?: string | null) {
  return Boolean(url?.startsWith("/") && !url.startsWith("//"));
}

export default function HeroHeader() {
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);
  const { data: media, isLoading } = useActiveHeaderMedia();
  console.log("media",media);
  
  const source = media?.fileUrl ? `${baseApi}${media.fileUrl}` : null;
  const cta = media?.linkUrl && isSafeInternalLink(media.linkUrl) ? media.linkUrl : "/products";
console.log("source",source);

  if (isLoading) {
    return (
      <section className="relative mx-auto mt-4 min-h-[530px] max-w-[1500px] overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 sm:px-10 lg:min-h-[620px]">
        <Skeleton active paragraph={{ rows: 4 }} className="relative z-10 max-w-xl [&_*]:!bg-white/15" />
      </section>
    );
  }
console.log("");

  return (
    <section className="relative mx-auto mt-4 min-h-[530px] max-w-[1500px] overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-[0_28px_90px_rgba(15,23,42,0.23)] sm:px-10 lg:min-h-[620px] lg:px-16">
      {source && media?.mediaType === "Video" ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src={source}
        />
      ) : source ? (
        <Image
          src={source}
          alt={media?.title || "پیشنهاد ویژه فروشگاه"}
          fill
          preload
          unoptimized 
          sizes="(max-width: 768px) 100vw, 1500px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#2563eb_0,transparent_28%),radial-gradient(circle_at_18%_80%,#7c3aed_0,transparent_35%),linear-gradient(135deg,#020617,#172554_55%,#0f172a)]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.9)_0%,rgba(2,6,23,.55)_45%,rgba(2,6,23,.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950/70 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative z-10 flex min-h-[450px] max-w-2xl flex-col justify-center lg:min-h-[540px]"
      >
        <p className="mb-4 text-xs font-bold tracking-[0.24em] text-blue-200">CURATED FOR YOU</p>
        <h1 className="max-w-xl text-4xl font-black leading-[1.22] tracking-tight sm:text-5xl lg:text-6xl">
          {media?.title || "یک تجربهٔ تازه برای خرید آنلاین"}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-8 text-slate-100/90 sm:text-lg">
          {media?.description || "محصولات منتخب را با ارسال سریع، قیمت شفاف و تجربه‌ای ساده‌تر پیدا کنید."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={cta} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">
            مشاهده محصولات <ArrowLeftOutlined />
          </Link>
          <Link href="/cart" className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20">
            سبد خرید من
          </Link>
        </div>

        <div className="mt-10 w-full max-w-xl rounded-[1.35rem] border border-white/25 bg-white/90 p-2 shadow-2xl backdrop-blur-xl">
          <SearchDropdown variant="hero" />
        </div>
      </motion.div>
    </section>
  );
}
