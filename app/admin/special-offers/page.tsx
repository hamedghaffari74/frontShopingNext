"use client";

import {
  Children,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Popconfirm,
  message,
  Input,
  InputNumber,
  Select,
  Spin,
} from "antd";
import Link from "next/link";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { CirclePicker } from "react-color";
import {
  useGetSpecialOffers,
  useCreateSpecialOffer,
  useUpdateSpecialOffer,
  useDeleteSpecialOffer,
  useGetOfferProducts,
  useAddOfferProduct,
  useRemoveOfferProduct,
} from "@/hooks/api/specialOfferApi";
import { useGetProducts, useGetProductImages } from "@/hooks/api/productApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface Offer { id: number; name: string; color?: string | null; }
interface OfferProduct { id: number; productId: number; specialPrice: number; }

// ─── AutoMarquee ───
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

// ─── Product Image ───
function ProductThumb({ productId, accent }: { productId: number; accent: string }) {
  const { data: images } = useGetProductImages(productId);
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);
  const imgList = Array.isArray(images) ? images as { fileUrl: string }[] : [];
  if (imgList.length === 0) return <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white/80" style={{ background: accent }}>?</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={baseApi + imgList[0].fileUrl} alt="" className="h-full w-full object-cover" />
  );
}

// ─── Main Page ───
export default function SpecialOffersPage() {
  const qc = useQueryClient();
  const { data: offers, isLoading } = useGetSpecialOffers();
  const co = useCreateSpecialOffer(); const uo = useUpdateSpecialOffer(); const del = useDeleteSpecialOffer();
  const [m, setM] = useState(false); const [ed, setEd] = useState<Offer | null>(null);
  const [nm, setNm] = useState(""); const [clr, setClr] = useState("#3B82F6"); const [sub, setSub] = useState(false);
  const list = (Array.isArray(offers) ? offers : []) as Offer[];

  const openAdd = () => { setEd(null); setNm(""); setClr("#3B82F6"); setM(true); };
  const openEdit = (o: Offer) => { setEd(o); setNm(o.name); setClr(o.color || "#3B82F6"); setM(true); };
  const save = async () => { if (!nm.trim()) return; setSub(true); try { if (ed) { await uo.mutateAsync({ id: ed.id, name: nm.trim(), color: clr }); } else { await co.mutateAsync({ name: nm.trim(), color: clr }); } message.success(ed ? "ویرایش شد" : "ایجاد شد"); qc.invalidateQueries({ queryKey: ["special-offers"] }); setM(false); } catch { message.error("خطا"); } finally { setSub(false); } };
  const remove = async (id: number) => { try { await del.mutateAsync(id); message.success("حذف شد"); qc.invalidateQueries({ queryKey: ["special-offers"] }); } catch { message.error("خطا"); } };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h3 className="text-xl font-bold text-gray-800">بخش‌های ویژه</h3><p className="text-sm text-gray-500">{list.length} بخش</p></div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openAdd} className="shadow-lg shadow-blue-200">بخش ویژه جدید</Button>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spin size="large" /></div> : list.length > 0 ? <div className="space-y-10">{list.map((o) => <OfferCard key={o.id} offer={o} onEdit={() => openEdit(o)} onDelete={() => remove(o.id)} qc={qc} />)}</div> : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-20">
          <GiftOutlined className="text-6xl text-gray-300" /><p className="mt-4 text-gray-400">بخش ویژه‌ای تعریف نشده</p><Button type="primary" className="mt-4" onClick={openAdd}>ایجاد اولین بخش</Button>
        </div>
      )}

      <Modal title={<div className="flex items-center gap-2 text-lg font-bold"><GiftOutlined className="text-orange-500" />{ed ? "ویرایش" : "بخش ویژه جدید"}</div>} open={m} onOk={save} confirmLoading={sub} onCancel={() => setM(false)} okText={ed ? "ذخیره" : "ایجاد"} cancelText="انصراف" centered width={520}>
        <div className="py-4 space-y-5">
          <div><label className="mb-2 block text-sm font-semibold text-gray-600">نام *</label><Input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="مثال: تخفیف‌های هفته" size="large" /></div>
          <div><label className="mb-2 block text-sm font-semibold text-gray-600">رنگ</label>
            <div className="mb-3 flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: clr + "18", border: `1px solid ${clr}40` }}><div className="h-10 w-10 rounded-lg shadow-inner" style={{ backgroundColor: clr }} /><span className="font-medium" style={{ color: clr }}>{clr}</span></div>
            <CirclePicker color={clr} onChangeComplete={(c) => setClr(c.hex)} width="100%" circleSize={32} circleSpacing={12} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Offer Card ───
function OfferCard({ offer, onEdit, onDelete, qc }: { offer: Offer; onEdit: () => void; onDelete: () => void; qc: ReturnType<typeof useQueryClient> }) {
  const { data: prods, isLoading: ld } = useGetOfferProducts(offer.id);
  const { data: allProds } = useGetProducts({ PageSize: 1000 });
  const add = useAddOfferProduct(); const rem = useRemoveOfferProduct();
  const pList = (Array.isArray(prods) ? prods : []) as OfferProduct[];
  const aList = (allProds?.items ?? []) as { id: number; name: string; price: number }[];
  const [am, setAm] = useState(false); const [pid, setPid] = useState<number | undefined>(); const [prc, setPrc] = useState(0); const [ad, setAd] = useState(false);
  const accent = offer.color || "#3B82F6";

  const doAdd = async () => { if (!pid || !prc) return; setAd(true); try { await add.mutateAsync({ id: offer.id, productId: pid, specialPrice: prc }); message.success("اضافه شد"); qc.invalidateQueries({ queryKey: ["offer-products", offer.id] }); setAm(false); setPid(undefined); setPrc(0); } catch { message.error("خطا"); } finally { setAd(false); } };
  const doRem = async (productId: number) => { try { await rem.mutateAsync({ offerId: offer.id, productId }); message.success("حذف شد"); qc.invalidateQueries({ queryKey: ["offer-products", offer.id] }); } catch { message.error("خطا"); } };

  const cards = pList.map((p) => {
    const info = aList.find((x) => x.id === p.productId);
    return (
      <div key={p.id} className="group relative flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white shadow-2xl transition-transform hover:-translate-y-1.5" style={{ boxShadow: `0 16px 40px ${accent}33, 0 0 0 1px ${accent}40` }}>
        <div className="absolute inset-x-0 top-0 z-10 h-1" style={{ background: accent }} />
        <Popconfirm title="حذف؟" onConfirm={() => doRem(p.productId)} okText="بله" cancelText="خیر">
          <button className="absolute left-2 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-all hover:bg-red-500 group-hover:opacity-100"><CloseOutlined className="text-[11px]" /></button>
        </Popconfirm>
        <div className="relative h-40 w-full overflow-hidden">
          <Link href={`/products/${p.productId}?specialPrice=${p.specialPrice}`}><ProductThumb productId={p.productId} accent={accent} /></Link>
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, #09090b 0%, transparent 55%)" }} />
          <span className="absolute bottom-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-black tracking-wide text-white" style={{ background: accent }}>SPECIAL</span>
        </div>
        <div className="flex flex-col gap-1.5 p-3 pt-2">
          <p className="line-clamp-1 text-sm font-bold text-white/95" title={info?.name}>{info?.name ?? "محصول"}</p>
          <div className="flex items-baseline gap-1"><span className="text-lg font-black tabular-nums" style={{ color: accent }}>{p.specialPrice.toLocaleString()}</span><span className="text-[10px] text-white/45">تومان</span></div>
        </div>
      </div>
    );
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-white shadow-xl" style={{ borderColor: `${accent}35`, boxShadow: `0 24px 60px ${accent}18` }}>
      <div className="relative flex flex-wrap items-center gap-4 overflow-hidden px-6 py-5" style={{ background: `linear-gradient(120deg, ${accent} 0%, ${accent}cc 45%, #0f172a 100%)` }}>
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl text-white backdrop-blur"><GiftOutlined /></div>
        <div className="min-w-0 flex-1"><div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Offer Zone</div><h4 className="truncate text-xl font-black text-white drop-shadow">{offer.name}</h4><p className="text-xs font-medium text-white/75">{pList.length} محصول</p></div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">ویژه</span>
        <Button size="small" type="text" icon={<EditOutlined />} onClick={onEdit} className="!text-white/90 hover:!bg-white/15" />
        <Popconfirm title="حذف شود؟" onConfirm={onDelete} okText="بله" cancelText="خیر"><Button size="small" type="text" danger icon={<DeleteOutlined />} className="!text-white/90 hover:!bg-white/15" /></Popconfirm>
        <Button size="small" icon={<PlusOutlined />} onClick={() => setAm(true)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none" }}>افزودن محصول</Button>
      </div>

      <div className="px-3 py-6 sm:px-5">
        {ld ? <div className="flex justify-center py-10"><Spin /></div> : pList.length === 0 ? (
          <div className="flex justify-center">{cards}<button onClick={() => setAm(true)} className="ml-4 flex w-48 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-12 transition-all hover:scale-[1.02]" style={{ borderColor: `${accent}66`, background: `linear-gradient(160deg, ${accent}18, transparent)`, color: accent }}><div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: accent }}><PlusOutlined className="text-xl" /></div><span className="text-xs font-black">افزودن محصول</span></button></div>
        ) : <AutoMarquee>{cards}</AutoMarquee>}
      </div>

      <Modal title="افزودن محصول به بخش ویژه" open={am} onOk={doAdd} confirmLoading={ad} onCancel={() => { setAm(false); setPid(undefined); setPrc(0); }} okText="افزودن" cancelText="انصراف" centered>
        <div className="space-y-4 py-4">
          <div><label className="mb-2 block text-sm font-semibold text-gray-600">محصول</label><Select showSearch value={pid} onChange={setPid} className="w-full" size="large" placeholder="جستجو..." filterOption={(inp, opt) => (opt?.label as string)?.includes(inp)} options={aList.map((x) => ({ value: x.id, label: x.name }))} /></div>
          <div><label className="mb-2 block text-sm font-semibold text-gray-600">قیمت ویژه</label><InputNumber value={prc} onChange={(v) => setPrc(v ?? 0)} className="w-full" min={0} size="large" placeholder="تومان" /></div>
        </div>
      </Modal>
    </div>
  );
}
