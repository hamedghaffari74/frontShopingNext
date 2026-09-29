"use client";

import { useMemo, useState } from "react";
import type { Key } from "react";
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
  CATEGORY_TREE_KEY,
  useCreateCategory,
  useDeleteCategory,
  useGetCategoryTree,
  useUpdateCategory,
} from "@/hooks/api/categoryApi";
import {
  collectCategoryIds,
  findCategoryNode,
  flattenCategoryTree,
  indentCategoryLabel,
  type CategoryNode,
} from "@/lib/categoryTree";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: tree, isLoading } = useGetCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = useMemo(() => tree ?? [], [tree]);
  const flat = useMemo(() => flattenCategoryTree(categories), [categories]);
  const flatById = useMemo(
    () => new Map(flat.map((category) => [category.id, category])),
    [flat]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(
    null
  );
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | undefined>();

  // Keep every parent row expanded so deeper levels stay visible by default.
  const parentIds = useMemo(() => {
    const ids: number[] = [];
    const walk = (nodes?: CategoryNode[]) => {
      for (const node of nodes ?? []) {
        if (node.children?.length) {
          ids.push(node.id);
          walk(node.children);
        }
      }
    };
    walk(categories);
    return ids;
  }, [categories]);

  // Rows are expanded by default; we only remember which ones were collapsed.
  const [collapsedKeys, setCollapsedKeys] = useState<Key[]>([]);
  const expandedKeys = useMemo(
    () => parentIds.filter((id) => !collapsedKeys.includes(id)),
    [parentIds, collapsedKeys]
  );

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: CATEGORY_TREE_KEY });
    // The storefront reads the paginated list, so refresh it as well.
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setParentId(undefined);
    setModalOpen(true);
  };

  // افزودن فرزند مستقیم به یک دسته‌بندی مشخص
  const openAddChildModal = (parentRecord: CategoryNode) => {
    setEditingCategory(null);
    setName("");
    setParentId(parentRecord.id);
    setModalOpen(true);
  };

  const openEditModal = (record: CategoryNode) => {
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
      invalidateCategories();
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
      invalidateCategories();
    } catch {
      message.error("خطا در حذف دسته‌بندی");
    }
  };

  // A category cannot be its own parent, nor a descendant of itself.
  const parentOptions = useMemo(() => {
    const blocked = editingCategory
      ? collectCategoryIds(findCategoryNode(categories, editingCategory.id))
      : new Set<number>();

    return flat
      .filter((category) => !blocked.has(category.id))
      .map((category) => ({
        value: category.id,
        label: category.name,
        depth: category.depth,
      }));
  }, [flat, categories, editingCategory]);

  const columns: ColumnsType<CategoryNode> = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 90,
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
        if (!pid) return <span className="text-xs text-gray-400">—</span>;
        return (
          <span className="text-xs text-gray-600">
            {flatById.get(pid)?.name ?? pid}
          </span>
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
          {/* افزودن زیرمجموعه در هر سطحی */}
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
        dataSource={categories}
        rowKey="id"
        loading={isLoading}
        className="rounded-lg border border-gray-100"
        indentSize={22}
        expandable={{
          // Every level can be expanded, not just the first one.
          rowExpandable: (record) => (record.children?.length ?? 0) > 0,
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => {
            const visible = new Set(keys);
            setCollapsedKeys(parentIds.filter((id) => !visible.has(id)));
          },
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
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
        <div className="space-y-4 py-4">
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
              showSearch
              optionFilterProp="label"
              options={parentOptions}
              optionRender={(option) =>
                indentCategoryLabel(option.data.label, option.data.depth ?? 0)
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
