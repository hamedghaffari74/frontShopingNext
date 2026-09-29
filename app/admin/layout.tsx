"use client";

import { useRouter, usePathname } from "next/navigation";
import { ConfigProvider } from "antd";
import faIR from "antd/locale/fa_IR";
import { useAuth } from "@/hooks/useAuth";
import { useProtectedRoute } from "@/components/auth/useProtectedRoute";
import {
  TeamOutlined,
  TagOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BoxPlotOutlined,
  ColumnHeightOutlined,
  GiftOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import { Layout, Menu, Button, theme } from "antd";
import { useState } from "react";

const { Sider, Content, Header: AntHeader } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const canAccess = useProtectedRoute({ requireAdmin: true });
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!canAccess) return null;

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "داشبورد",
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "کاربران",
      onClick: () => router.push("/admin"),
    },
    {
      key: "/admin/products",
      icon: <BoxPlotOutlined />,
      label: "محصولات",
    },
    {
      key: "/admin/brands",
      icon: <TagOutlined />,
      label: "برندها",
    },
    {
      key: "/admin/categories",
      icon: <AppstoreOutlined />,
      label: "دسته‌بندی‌ها",
    },
    {
      key: "/admin/sizes",
      icon: <ColumnHeightOutlined />,
      label: "سایزها",
    },
    {
      key: "/admin/special-offers",
      icon: <GiftOutlined />,
      label: "بخش‌های ویژه",
    },
    {
      key: "/admin/header-media",
      icon: <PictureOutlined />,
      label: "رسانهٔ هدر",
    },
  ];

  const selectedKey = (() => {
    if (pathname.includes("/admin/products")) return "/admin/products";
    if (pathname.includes("/admin/brands")) return "/admin/brands";
    if (pathname.includes("/admin/categories")) return "/admin/categories";
    if (pathname.includes("/admin/sizes")) return "/admin/sizes";
    if (pathname.includes("/admin/special-offers"))
      return "/admin/special-offers";
    if (pathname.includes("/admin/header-media")) return "/admin/header-media";
    return "users";
  })();

  return (
    <ConfigProvider direction="rtl" locale={faIR}>
      <Layout style={{ minHeight: "calc(100vh - 4rem)" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          theme="light" // برای هماهنگی بهتر با Ant Design
          className="relative z-10 border-l border-gray-100 bg-white shadow-xl shadow-gray-200/50 transition-all duration-300 ease-in-out"
        >
          {/* بخش هدر / لوگو */}
          <div className="flex h-20 items-center justify-center border-b border-gray-100/80 px-4 transition-all duration-300">
            {!collapsed ? (
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-black text-transparent drop-shadow-sm">
                پنل مدیریت
              </span>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm transition-all duration-300">
                <DashboardOutlined className="text-xl" />
              </div>
            )}
          </div>

          {/* منوی ناوبری */}
          <div className="custom-scroll h-[calc(100vh-160px)] overflow-y-auto pt-4">
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              className="border-none px-3 font-medium text-gray-600"
              items={menuItems}
              onClick={({ key }) => {
                if (key === "/admin" || key.startsWith("/admin/")) {
                  router.push(key);
                }
              }}
            />
          </div>

          {/* دکمه خروج */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-50 bg-gray-50/50 p-4 backdrop-blur-sm">
            <Button
              icon={<LogoutOutlined className={collapsed ? "text-lg" : ""} />}
              onClick={logout}
              className={`flex h-10 w-full items-center justify-center rounded-xl border-none font-semibold text-gray-500 shadow-sm transition-all duration-300 hover:bg-red-50 hover:text-red-500 ${
                collapsed ? "px-0" : "px-4 gap-2"
              }`}
            >
              {!collapsed && "خروج از سیستم"}
            </Button>
          </div>
        </Sider>

        <Layout>
          <AntHeader
            className="flex items-center justify-between border-b border-gray-200 px-6"
            style={{ background: colorBgContainer }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
            <h2 className="text-lg  text-gray-700">
              {pathname.includes("/products")
                ? "مدیریت محصولات"
                : pathname.includes("/brands")
                  ? "مدیریت برندها"
                  : pathname.includes("/categories")
                    ? "مدیریت دسته‌بندی‌ها"
                    : pathname.includes("/sizes")
                      ? "مدیریت سایزها"
                      : pathname.includes("/special-offers")
                        ? "بخش‌های ویژه"
                        : "مدیریت کاربران"}
            </h2>
          </AntHeader>

          <Content
            className="m-6 p-6"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
