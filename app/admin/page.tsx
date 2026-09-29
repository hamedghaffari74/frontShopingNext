"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Select,
} from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useGetAdminUsers,
  useDeleteUser,
  useUpdateUserRole,
} from "@/hooks/api/adminApi";

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  role?: string;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useGetAdminUsers();
  const deleteUser = useDeleteUser();
  const updateRole = useUpdateUserRole();

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      message.success("کاربر با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      message.error("خطا در حذف کاربر");
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateRole.mutateAsync({ id, role });
      message.success("نقش کاربر با موفقیت تغییر کرد");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      message.error("خطا در تغییر نقش کاربر");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
    },
    {
      title: "نام",
      key: "name",
      render: (_, record) =>
        `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim() || "—",
    },
    {
      title: "موبایل",
      dataIndex: "mobile",
      key: "mobile",
      width: 160,
    },
    {
      title: "نقش",
      dataIndex: "role",
      key: "role",
      width: 180,
      align: "center",
      render: (role: string, record) => (
        <Select
          value={role || "User"}
          onChange={(val) => handleRoleChange(record.id, val)}
          className="w-28"
          size="small"
          options={[
            { value: "User", label: "کاربر" },
            { value: "Admin", label: "ادمین" },
          ]}
        />
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="آیا از حذف این کاربر مطمئن هستید؟"
          okText="بله"
          cancelText="خیر"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">لیست کاربران</h3>
          <p className="text-sm text-gray-500">
            {Array.isArray(users) ? users.length : 0} کاربر ثبت‌شده
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
        >
          بروزرسانی
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-5">
          <h3 className="text-sm font-medium text-blue-600">کل کاربران</h3>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {Array.isArray(users) ? users.length : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-red-50 p-5">
          <h3 className="text-sm font-medium text-red-600">ادمین‌ها</h3>
          <p className="mt-2 text-3xl font-bold text-red-900">
            {Array.isArray(users)
              ? users.filter((u: User) => u.role === "Admin").length
              : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-green-50 p-5">
          <h3 className="text-sm font-medium text-green-600">کاربران عادی</h3>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {Array.isArray(users)
              ? users.filter(
                  (u: User) => !u.role || u.role === "User"
                ).length
              : "—"}
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(users) ? users : []}
        rowKey="id"
        loading={isLoading}
        className="border border-gray-100 rounded-lg"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
