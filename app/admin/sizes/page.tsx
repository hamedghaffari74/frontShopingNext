"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Space, Popconfirm, message, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetSizes,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
} from "@/hooks/api/sizeApi";

interface Size {
  id: number;
  name: string;
}

export default function SizesPage() {
  const queryClient = useQueryClient();
  const { data: sizes, isLoading } = useGetSizes();
  const createSize = useCreateSize();
  const updateSize = useUpdateSize();
  const deleteSize = useDeleteSize();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [name, setName] = useState("");

  const openAddModal = () => {
    setEditingSize(null);
    setName("");
    setModalOpen(true);
  };

  const openEditModal = (record: Size) => {
    setEditingSize(record);
    setName(record.name);
    setModalOpen(true);
  };

  const handleOk = async () => {
    if (!name.trim()) return;
    setConfirmLoading(true);
    try {
      if (editingSize) {
        await updateSize.mutateAsync({ id: editingSize.id, name: name.trim() });
        message.success("سایز با موفقیت ویرایش شد");
      } else {
        await createSize.mutateAsync({ name: name.trim() });
        message.success("سایز با موفقیت ایجاد شد");
      }
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
      setModalOpen(false);
    } catch {
      message.error("خطا در عملیات");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSize.mutateAsync(id);
      message.success("سایز با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    } catch {
      message.error("خطا در حذف سایز");
    }
  };

  const columns: ColumnsType<Size> = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 100,
      align: "center",
    },
    {
      title: "نام سایز",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
          {text}
        </span>
      ),
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
            title="آیا از حذف این سایز مطمئن هستید؟"
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
        <h3 className="text-lg font-semibold text-gray-800">لیست سایزها</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          افزودن سایز
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(sizes) ? sizes : []}
        rowKey="id"
        loading={isLoading}
        className="border border-gray-100 rounded-lg"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSize ? "ویرایش سایز" : "افزودن سایز جدید"}
        open={modalOpen}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={() => setModalOpen(false)}
        okText={editingSize ? "ذخیره" : "افزودن"}
        cancelText="انصراف"
        centered
      >
        <div className="py-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            نام سایز
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder="مثال: Large, 42, XL"
            autoFocus
            size="large"
          />
        </div>
      </Modal>
    </div>
  );
}
