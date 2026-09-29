"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Modal,
  Popconfirm,
  message,
  Select,
  Input,
  Tag,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  BoxPlotOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/api/productApi";
import { useGetBrands } from "@/hooks/api/brandApi";
import { useGetCategories } from "@/hooks/api/categoryApi";
import { useGetSizes } from "@/hooks/api/sizeApi";
import ProductForm, { emptyProduct } from "@/components/admin/ProductForm";

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

function StatCard({
  icon,
  label,
  count,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}>
      <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-2 h-16 w-16 rounded-full bg-white/10" />
      <div className="relative">
        <span className="text-2xl opacity-80">{icon}</span>
        <p className="mt-3 text-4xl font-black">{count}</p>
        <p className="mt-1 text-sm opacity-90">{label}</p>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | undefined>();
  const [filterBrand, setFilterBrand] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: productsData, isLoading } = useGetProducts({
    Name: searchName || undefined,
    CategoryId: filterCategory,
    BrandId: filterBrand,
    PageNumber: page,
    PageSize: pageSize,
  });
  const { data: brandsData } = useGetBrands(1, 1000);
  const { data: categoriesData } = useGetCategories(1, 1000);
  const { data: sizes } = useGetSizes();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [submitting, setSubmitting] = useState(false);

  const productList = (productsData?.items ?? []) as Product[];
  const totalProducts = productsData?.totalCount ?? productList.length;
  const activeCount = productList.filter((p) => p.isActive).length;
  const inactiveCount = productList.filter((p) => !p.isActive).length;

  const rawCats = (categoriesData?.items ?? []) as { id: number; name: string }[];
  const categoryOptions = rawCats.map((c) => ({ value: c.id, label: c.name }));
  const rawBrands = (brandsData?.items ?? []) as { id: number; name: string }[];
  const brandOptions = rawBrands.map((b) => ({ value: b.id, label: b.name }));
  const sizeList = (Array.isArray(sizes) ? sizes : []) as { id: number; name: string }[];

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (prod: Product) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name ?? "",
      description: prod.description ?? "",
      price: prod.price,
      discountPrice: prod.discountPrice ?? null,
      colors: Array.isArray(prod.colors) ? [...prod.colors] : [],
      sizes: Array.isArray(prod.sizes) ? [...prod.sizes] : [],
      isActive: prod.isActive,
      categoryId: prod.categoryId,
      brandId: prod.brandId ?? null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      message.warning("نام، قیمت و دسته‌بندی الزامی هستند");
      return;
    }
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...form });
        message.success("محصول با موفقیت ویرایش شد");
      } else {
        await createProduct.mutateAsync(form);
        message.success("محصول با موفقیت ایجاد شد");
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModalOpen(false);
    } catch {
      message.error("خطا در عملیات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id);
      message.success("محصول با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      message.error("خطا در حذف محصول");
    }
  };

  const columns: ColumnsType<Product> = [
    { title: "شناسه", dataIndex: "id", width: 70, align: "center" },
    {
      title: "نام محصول",
      dataIndex: "name",
      render: (t: string) => <span className="font-semibold text-gray-800">{t}</span>,
    },
    {
      title: "قیمت",
      dataIndex: "price",
      width: 140,
      align: "center",
      sorter: (a, b) => a.price - b.price,
      render: (price: number, record: Product) => (
        <div className="text-center">
          {record.discountPrice && record.discountPrice < price ? (
            <>
              <span className="text-sm text-gray-400 line-through">{price.toLocaleString()}</span>
              <br />
              <span className="font-bold text-green-600">{record.discountPrice.toLocaleString()}</span>
              <span className="mr-1 text-xs text-gray-500">تومان</span>
            </>
          ) : (
            <span>
              <span className="font-semibold">{price.toLocaleString()}</span>
              <span className="mr-1 text-xs text-gray-500">تومان</span>
            </span>
          )}
        </div>
      ),
    },
    {
      title: "دسته‌بندی",
      dataIndex: "categoryId",
      width: 130,
      align: "center",
      render: (id: number) => {
        const cat = categoryOptions.find((c) => c.value === id);
        return (
          <Tag color="blue" className="rounded-full px-3">
            {cat?.label ?? id}
          </Tag>
        );
      },
    },
    {
      title: "وضعیت",
      dataIndex: "isActive",
      width: 100,
      align: "center",
      render: (active: boolean) =>
        active ? (
          <Tag icon={<CheckCircleOutlined />} color="success" className="rounded-full px-3 py-0.5">فعال</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error" className="rounded-full px-3 py-0.5">غیرفعال</Tag>
        ),
    },
    {
      title: "عملیات",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="آیا از حذف این محصول مطمئن هستید؟" okText="بله" cancelText="خیر" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<BoxPlotOutlined />} label="کل محصولات" count={productList.length} gradient="from-blue-500 to-blue-700" />
        <StatCard icon={<CheckCircleOutlined />} label="محصولات فعال" count={activeCount} gradient="from-emerald-500 to-teal-700" />
        <StatCard icon={<CloseCircleOutlined />} label="محصولات غیرفعال" count={inactiveCount} gradient="from-red-500 to-pink-700" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input placeholder="جستجو نام محصول..." prefix={<SearchOutlined className="text-gray-400" />} value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-56" allowClear />
        <Select placeholder="دسته‌بندی" value={filterCategory} onChange={setFilterCategory} allowClear className="w-40" options={categoryOptions} />
        <Select placeholder="برند" value={filterBrand} onChange={setFilterBrand} allowClear className="w-40" options={brandOptions} />
        <div className="flex-1" />
        <Button icon={<ReloadOutlined />} onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}>بروزرسانی</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} size="large">افزودن محصول</Button>
      </div>

      <Table
        columns={columns}
        dataSource={productList}
        rowKey="id"
        loading={isLoading}
        className="rounded-xl border border-gray-100"
        pagination={{ current: page, pageSize, total: totalProducts, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        scroll={{ x: 800 }}
      />

      <Modal title={null} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} centered width={960} destroyOnClose>
        <ProductForm
          form={form}
          setForm={setForm}
          editingProduct={editingProduct}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          sizes={sizeList}
          queryClient={queryClient}
        />
      </Modal>
    </div>
  );
}
