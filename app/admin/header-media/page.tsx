"use client";

import { useState } from "react";
import { Button, Empty, Form, Input, InputNumber, Modal, Popconfirm, Spin, Switch, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, StarFilled, UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useCreateHeaderMedia, useDeleteHeaderMedia, useHeaderMedia, useUpdateHeaderMedia } from "@/feature/headerMedia/hooks";
import type { HeaderMedia, HeaderMediaInput } from "@/feature/headerMedia/types";
import type { RootState } from "@/store/store";

type Values = { file?: UploadFile[]; title?: string; description?: string; linkUrl?: string; isActive: boolean; displayOrder: number };

function Preview({ media, baseApi }: { media: HeaderMedia; baseApi: string }) {
  const src = `${baseApi}${media.fileUrl}`;
  return media.mediaType === "Video" ? <video src={src} className="h-full w-full object-cover" muted /> : <img src={src} className="h-full w-full object-cover" alt={media.title || "رسانه هدر"} />;
}

export default function HeaderMediaAdminPage() {
  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);
  const { data, isLoading } = useHeaderMedia(false);
  const create = useCreateHeaderMedia(); const update = useUpdateHeaderMedia(); const remove = useDeleteHeaderMedia();
  const [form] = Form.useForm<Values>(); const [open, setOpen] = useState(false); const [editing, setEditing] = useState<HeaderMedia | null>(null); const [preview, setPreview] = useState<HeaderMedia | null>(null);
  const items = Array.isArray(data) ? data : [];
  const showForm = (item?: HeaderMedia) => { setEditing(item ?? null); form.setFieldsValue(item ? { title: item.title ?? "", description: item.description ?? "", linkUrl: item.linkUrl ?? "", isActive: item.isActive, displayOrder: item.displayOrder, file: [] } : { isActive: true, displayOrder: 0, file: [] }); setOpen(true); };
  const save = async (values: Values) => {
    const file = values.file?.[0]?.originFileObj;
    if (!editing && !file) return message.error("انتخاب فایل الزامی است");
    const input: HeaderMediaInput = { title: values.title, description: values.description, linkUrl: values.linkUrl, isActive: values.isActive, displayOrder: values.displayOrder ?? 0, ...(file ? { file } : {}) };
    try { if (editing) await update.mutateAsync({ id: editing.id, input }); else await create.mutateAsync(input); message.success("رسانه ذخیره شد"); setOpen(false); } catch { message.error("ذخیره ناموفق بود"); }
  };
  const activate = (item: HeaderMedia) => update.mutateAsync({ id: item.id, input: { title: item.title ?? "", description: item.description ?? "", linkUrl: item.linkUrl ?? "", isActive: true, displayOrder: item.displayOrder } }).then(() => message.success("رسانهٔ فعال تغییر کرد")).catch(() => message.error("عملیات ناموفق بود"));
  return <div className="mx-auto max-w-7xl"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em] text-blue-600">STOREFRONT HERO</p><h1 className="mt-1 text-2xl font-black text-slate-900">مدیریت رسانهٔ هدر</h1><p className="mt-2 text-sm text-slate-500">یک رسانهٔ فعال در hero صفحهٔ اصلی نمایش داده می‌شود.</p></div><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>افزودن رسانه</Button></div>{isLoading ? <div className="py-24 text-center"><Spin size="large" /></div> : items.length === 0 ? <Empty className="py-20" description="هنوز رسانه‌ای ثبت نشده است" /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${item.isActive ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-100"}`}><div className="relative aspect-video bg-slate-100"><Preview media={item} baseApi={baseApi} />{item.isActive && <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white"><StarFilled /> فعال</span>}<Button className="!absolute bottom-3 left-3" shape="circle" icon={<EyeOutlined />} onClick={() => setPreview(item)} /></div><div className="p-5"><h2 className="font-extrabold text-slate-800">{item.title || "بدون عنوان"}</h2><p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">{item.description || "بدون توضیحات"}</p><div className="mt-4 flex items-center justify-between border-t pt-4"><span className="text-xs text-slate-400">ترتیب: {item.displayOrder}</span><div className="flex gap-1"><Button size="small" type="primary" disabled={item.isActive} onClick={() => activate(item)}>فعال‌سازی</Button><Button size="small" icon={<EditOutlined />} onClick={() => showForm(item)} /><Popconfirm title="این رسانه حذف شود؟" onConfirm={() => remove.mutateAsync(item.id).then(() => message.success("حذف شد"))}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></div></div></div></article>)}</div>}<Modal open={open} footer={null} title={editing ? "ویرایش رسانه" : "افزودن رسانه"} onCancel={() => setOpen(false)} destroyOnHidden><Form form={form} layout="vertical" onFinish={save}><Form.Item name="file" label={editing ? "جایگزینی فایل" : "فایل رسانه"} valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}><Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"><Button icon={<UploadOutlined />}>انتخاب فایل</Button></Upload></Form.Item><Form.Item name="title" label="عنوان"><Input /></Form.Item><Form.Item name="description" label="توضیح"><Input.TextArea rows={3} /></Form.Item><Form.Item name="linkUrl" label="لینک CTA"><Input placeholder="/products" /></Form.Item><div className="grid grid-cols-2 gap-4"><Form.Item name="displayOrder" label="ترتیب"><InputNumber min={0} className="!w-full" /></Form.Item><Form.Item name="isActive" label="نمایش در هدر" valuePropName="checked"><Switch /></Form.Item></div><Button htmlType="submit" type="primary" block loading={create.isPending || update.isPending}>ذخیره</Button></Form></Modal><Modal open={!!preview} footer={null} title={preview?.title} onCancel={() => setPreview(null)}>{preview && <div className="aspect-video overflow-hidden rounded-xl"><Preview media={preview} baseApi={baseApi} /></div>}</Modal></div>;
}
