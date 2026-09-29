"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/hooks/api/brandApi";

interface Brand {
  id: number;
  name: string;
}

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: brandData, isLoading } = useGetBrands(page, pageSize);
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const brands = brandData?.items ?? [];
  const total = brandData?.totalCount ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");

  const openAddModal = () => {
    setEditingBrand(null);
    setName("");
    setModalOpen(true);
  };

  const openEditModal = (record: Brand) => {
    setEditingBrand(record);
    setName(record.name);
    setModalOpen(true);
  };

  const handleOk = async () => {
    if (!name.trim()) return;
    setConfirmLoading(true);
    try {
      if (editingBrand) {
        await updateBrand.mutateAsync({ id: editingBrand.id, name: name.trim() });
        message.success("برند با موفقیت ویرایش شد");
      } else {
        await createBrand.mutateAsync({ name: name.trim() });
        message.success("برند با موفقیت ایجاد شد");
      }
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setModalOpen(false);
    } catch {
      message.error("خطا در عملیات");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBrand.mutateAsync(id);
      message.success("برند با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    } catch {
      message.error("خطا در حذف برند");
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 100,
      align: "center",
    },
    {
      title: "نام برند",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "عملیات",
      key: "actions",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="آیا از حذف این برند مطمئن هستید؟"
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">لیست برندها</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
        >
          افزودن برند
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(brands) ? brands : []}
        rowKey="id"
        loading={isLoading}
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
        className="border border-gray-100 rounded-lg"
      />

      <Modal
        title={editingBrand ? "ویرایش برند" : "افزودن برند جدید"}
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={() => setModalOpen(false)}
        okText={editingBrand ? "ذخیره" : "افزودن"}
        cancelText="انصراف"
        centered
      >
        <div className="py-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            نام برند
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="نام برند را وارد کنید"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}
