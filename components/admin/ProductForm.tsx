"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Tabs,
  Popconfirm,
  message,
  Select,
  InputNumber,
  Input,
  Upload,
  Empty,
  Switch,
  Spin,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  PictureOutlined,
  FileTextOutlined,
  SettingOutlined,
  BoxPlotOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  useGetProductSpecs,
  useCreateProductSpec,
  useUpdateProductSpec,
  useDeleteProductSpec,
  useGetProductImages,
  useUploadProductImages,
  useDeleteProductImage,
} from "@/hooks/api/productApi";
import ColorSelector from "./ColorSelector";
import { indentCategoryLabel } from "@/lib/categoryTree";
import type { RootState } from "@/store/store";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  isActive: boolean;
  categoryId: number;
  brandId?: number | null;
}

interface Spec {
  id: number;
  title: string;
  description: string;
}

interface Image {
  id: number;
  fileUrl: string;
}

export const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  discountPrice: null as number | null,
  colors: [] as string[],
  sizes: [] as string[],
  isActive: true,
  categoryId: 0,
  brandId: null as number | null,
};

export default function ProductForm({
  form,
  setForm,
  editingProduct,
  submitting,
  onSubmit,
  onCancel,
  categoryOptions,
  brandOptions,
  sizes,
  queryClient,
}: {
  form: typeof emptyProduct;
  setForm: (f: typeof emptyProduct) => void;
  editingProduct: Product | null;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  categoryOptions: { value: number; label: string; depth?: number }[];
  brandOptions: { value: number; label: string }[];
  sizes: { id: number; name: string }[];
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const productId = editingProduct?.id ?? 0;
  const { data: specs, isLoading: specsLoading } =
    useGetProductSpecs(productId);
  const { data: images, isLoading: imgsLoading } =
    useGetProductImages(productId);
  const createSpec = useCreateProductSpec();
  const updateSpec = useUpdateProductSpec();
  const deleteSpec = useDeleteProductSpec();
  const uploadImages = useUploadProductImages();
  const deleteImage = useDeleteProductImage();

  const [specTitle, setSpecTitle] = useState("");
  const [specDesc, setSpecDesc] = useState("");
  const [editingSpecId, setEditingSpecId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const baseApi = useSelector((state: RootState) => state.Auth.baseApi);

  const specList = Array.isArray(specs) ? (specs as Spec[]) : [];
  const imgList = Array.isArray(images) ? (images as Image[]) : [];

  const handleAddSpec = async () => {
    if (!specTitle.trim() || !specDesc.trim()) return;
    try {
      if (editingSpecId) {
        await updateSpec.mutateAsync({
          productId,
          specId: editingSpecId,
          title: specTitle.trim(),
          description: specDesc.trim(),
        });
        message.success("مشخصات ویرایش شد");
      } else {
        await createSpec.mutateAsync({
          productId,
          title: specTitle.trim(),
          description: specDesc.trim(),
        });
        message.success("مشخصات افزوده شد");
      }
      queryClient.invalidateQueries({ queryKey: ["product-specs", productId] });
      setSpecTitle("");
      setSpecDesc("");
      setEditingSpecId(null);
    } catch {
      message.error("خطا");
    }
  };

  const handleDeleteSpec = async (specId: number) => {
    try {
      await deleteSpec.mutateAsync({ productId, specId });
      message.success("مشخصات حذف شد");
      queryClient.invalidateQueries({ queryKey: ["product-specs", productId] });
    } catch {
      message.error("خطا");
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadImages.mutateAsync({ productId, files: [file] });
      message.success("تصویر آپلود شد");
      queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
    } catch {
      message.error("خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImg = async (imageId: number) => {
    try {
      await deleteImage.mutateAsync({ productId, imageId });
      message.success("تصویر حذف شد");
      queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
    } catch {
      message.error("خطا");
    }
  };

  const tabs = [
    {
      key: "info",
      label: (
        <span className="flex items-center gap-1.5">
          <FileTextOutlined />اطلاعات محصول
        </span>
      ),
      children: (
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">نام محصول *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="نام محصول"
              size="large"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">توضیحات</label>
            <Input.TextArea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="توضیحات محصول"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">قیمت (تومان) *</label>
            <InputNumber
              value={form.price}
              onChange={(v) => setForm({ ...form, price: v ?? 0 })}
              className="w-full"
              min={0}
              size="large"
              placeholder="قیمت"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">قیمت تخفیف‌خورده</label>
            <InputNumber
              value={form.discountPrice}
              onChange={(v) => setForm({ ...form, discountPrice: v ?? null })}
              className="w-full"
              min={0}
              size="large"
              placeholder="اختیاری"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">دسته‌بندی *</label>
            <Select
              value={form.categoryId || undefined}
              onChange={(v) => setForm({ ...form, categoryId: v ?? 0 })}
              className="w-full"
              size="large"
              options={categoryOptions}
              placeholder="انتخاب کنید"
              showSearch
              optionFilterProp="label"
              optionRender={(option) =>
                indentCategoryLabel(option.data.label, option.data.depth ?? 0)
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">برند</label>
            <Select
              value={form.brandId ?? undefined}
              onChange={(v) => setForm({ ...form, brandId: v ?? null })}
              className="w-full"
              size="large"
              options={brandOptions}
              placeholder="انتخاب کنید (اختیاری)"
              allowClear
            />
          </div>
          <div className="col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-600">رنگ‌ها</label>
            <ColorSelector
              selected={form.colors}
              onChange={(colors) => setForm({ ...form, colors })}
            />
          </div>
          <div className="col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-600">سایزها</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const isSelected = (form.sizes ?? []).includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      const current = form.sizes ?? [];
                      setForm({
                        ...form,
                        sizes: isSelected
                          ? current.filter((x) => x !== s.name)
                          : [...current, s.name],
                      });
                    }}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-500"
                    }`}
                  >
                    {s.name}
                    {isSelected && <CheckCircleOutlined className="mr-1.5 text-xs" />}
                  </button>
                );
              })}
              {sizes.length === 0 && (
                <p className="text-sm text-gray-400">ابتدا از بخش سایزها، سایز تعریف کنید</p>
              )}
            </div>
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-600">وضعیت</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <Switch checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
              <span className="text-sm text-gray-600">
                {form.isActive ? "محصول فعال است" : "محصول غیرفعال است"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "specs",
      label: (
        <span className="flex items-center gap-1.5">
          <SettingOutlined />مشخصات فنی
        </span>
      ),
      children: !productId ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <SettingOutlined className="text-4xl" />
          <p className="mt-4">ابتدا محصول را ذخیره کنید</p>
        </div>
      ) : (
        <div className="pt-4">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 p-5">
            <div className="flex flex-wrap gap-3">
              <Input value={specTitle} onChange={(e) => setSpecTitle(e.target.value)} placeholder="عنوان مشخصه" className="flex-1" size="large" />
              <Input value={specDesc} onChange={(e) => setSpecDesc(e.target.value)} placeholder="توضیح" className="flex-[2]" size="large" />
              <Button type="primary" onClick={handleAddSpec} icon={editingSpecId ? <EditOutlined /> : <PlusOutlined />} size="large">
                {editingSpecId ? "ویرایش" : "افزودن"}
              </Button>
              {editingSpecId && (
                <Button size="large" onClick={() => { setEditingSpecId(null); setSpecTitle(""); setSpecDesc(""); }}>انصراف</Button>
              )}
            </div>
          </div>
          {specsLoading ? <Spin /> : specList.length > 0 ? (
            <div className="space-y-2">
              {specList.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><SettingOutlined /></div>
                    <div>
                      <p className="font-semibold text-gray-800">{s.title}</p>
                      <p className="text-sm text-gray-500">{s.description}</p>
                    </div>
                  </div>
                  <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingSpecId(s.id); setSpecTitle(s.title); setSpecDesc(s.description); }} />
                    <Popconfirm title="حذف شود؟" onConfirm={() => handleDeleteSpec(s.id)} okText="بله" cancelText="خیر">
                      <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              ))}
            </div>
          ) : <Empty description="هیچ مشخصاتی ثبت نشده" />}
        </div>
      ),
    },
    {
      key: "images",
      label: (
        <span className="flex items-center gap-1.5">
          <PictureOutlined />تصاویر
        </span>
      ),
      children: !productId ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <PictureOutlined className="text-4xl" />
          <p className="mt-4">ابتدا محصول را ذخیره کنید</p>
        </div>
      ) : (
        <div className="pt-4">
          <div className="mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30">
            <Upload.Dragger accept="image/*" showUploadList={false} beforeUpload={(file) => { handleUpload(file); return false; }} disabled={uploading}>
              <p className="text-4xl"><InboxOutlined className="text-blue-400" /></p>
              <p className="mt-3 text-base font-semibold text-gray-600">کلیک کنید یا تصویر را اینجا بکشید</p>
              <p className="mt-1 text-sm text-gray-400">فرمت‌های JPG, PNG, WebP پشتیبانی می‌شود</p>
            </Upload.Dragger>
          </div>
          {imgsLoading ? <Spin /> : imgList.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {imgList.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={baseApi + img.fileUrl} alt="product" className="h-40 w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <Popconfirm title="حذف تصویر؟" onConfirm={() => handleDeleteImg(img.id)} okText="بله" cancelText="خیر">
                      <Button danger type="primary" icon={<DeleteOutlined />} size="small">حذف</Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty description="هیچ تصویری ثبت نشده" />}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <BoxPlotOutlined className="text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {editingProduct ? "ویرایش محصول" : "محصول جدید"}
          </h3>
          <p className="text-sm text-gray-400">
            {editingProduct ? "اطلاعات محصول را ویرایش کنید" : "محصول جدید خود را ثبت کنید"}
          </p>
        </div>
      </div>
      <Tabs defaultActiveKey="info" items={tabs} />
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button size="large" onClick={onCancel}>انصراف</Button>
        <Button type="primary" size="large" loading={submitting} onClick={onSubmit} icon={<CheckCircleOutlined />}>
          {editingProduct ? "ذخیره تغییرات" : "ایجاد محصول"}
        </Button>
      </div>
    </div>
  );
}
