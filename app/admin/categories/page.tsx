"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Space, Popconfirm, message, Select } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/api/categoryApi";

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parentName?: string;
  children?: Category[]; // اضافه شدن آرایه فرزندان برای نمایش درختی در جدول
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: catData, isLoading } = useGetCategories(page, pageSize);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = catData?.items ?? [];
  const total = catData?.totalCount ?? 0;

  // دریافت همه دسته‌بندی‌ها جهت استفاده در Select والد و ساختار درختی
  const { data: allCatsData } = useGetCategories(1, 1000);
  const allCats = (allCatsData?.items ?? []) as Category[];

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | undefined>();

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setParentId(undefined);
    setModalOpen(true);
  };

  // تابع جدید برای افزودن فرزند مستقیم به یک دسته خاص
  const openAddChildModal = (parentRecord: Category) => {
    setEditingCategory(null);
    setName("");
    setParentId(parentRecord.id); // تنظیم والد پیش‌فرض روی دسته‌بندی کلیک شده
    setModalOpen(true);
  };

  const openEditModal = (record: Category) => {
    setEditingCategory(record);
    setName(record.name);
    setParentId(record.parentId ?? undefined);
    setModalOpen(true);
  };

  const handleOk = async () => {
    if (!name.trim()) return;
    setConfirmLoading(true);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: name.trim(),
          parentId: parentId ?? null,
        });
        message.success("دسته‌بندی ویرایش شد");
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          parentId: parentId ?? null,
        });
        message.success("دسته‌بندی ایجاد شد");
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setModalOpen(false);
    } catch {
      message.error("خطا در عملیات");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      message.success("دسته‌بندی با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      message.error("خطا در حذف دسته‌بندی");
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 100,
      align: "center",
    },
    {
      title: "نام دسته‌بندی",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "والد",
      dataIndex: "parentId",
      key: "parentId",
      width: 150,
      render: (pid: number | null | undefined) => {
        if (!pid) return <span className="text-gray-400 text-xs">—</span>;
        const parent = allCats.find((c) => c.id === pid);
        return (
          <span className="text-xs text-gray-600">{parent?.name ?? pid}</span>
        );
      },
    },
    {
      title: "عملیات",
      key: "actions",
      width: 220,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {/* دکمه افزودن زیرمجموعه (فرزند) */}
          <Button
            type="link"
            title="افزودن زیرمجموعه"
            icon={<PlusSquareOutlined className="text-green-600" />}
            onClick={() => openAddChildModal(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="آیا از حذف این دسته‌بندی مطمئن هستید؟"
            okText="بله"
            cancelText="خیر"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
console.log(categories);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          لیست دسته‌بندی‌ها
        </h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          افزودن دسته‌بندی
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(categories) ? categories : []}
        rowKey="id"
        loading={isLoading}
        className="border border-gray-100 rounded-lg"
        // مدیریت نحوه باز شدن و پنهان کردن آیکون پلاس در ردیف‌های بدون فرزند
        expandable={{
          rowExpandable: (record) => record.children?.length >=1,
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title={editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={() => setModalOpen(false)}
        okText={editingCategory ? "ذخیره" : "افزودن"}
        cancelText="انصراف"
        centered
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              نام دسته‌بندی
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="نام دسته‌بندی"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              دسته‌بندی والد
            </label>
            <Select
              value={parentId}
              onChange={setParentId}
              allowClear
              placeholder="بدون والد (سرگروه)"
              className="w-full"
              size="large"
              options={allCats
                .filter((c) => c.id !== editingCategory?.id)
                .map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
