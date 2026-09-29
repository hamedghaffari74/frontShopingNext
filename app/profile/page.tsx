"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { message, Modal, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useProtectedRoute } from "@/components/auth/useProtectedRoute";
import { setCredentials } from "@/store/authSlice";
import {
  useGetProfile,
  useUpdateProfile,
  useGetAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/api/profileApi";
import type { AddressDto } from "@/types";

interface Address {
  id: number;
  province: string;
  city: string;
  street: string;
  alley?: string | null;
  number: string;
  postalCode: string;
  floor?: number | null;
  unit?: number | null;
}

const genderOptions = [
  { value: "", label: "انتخاب کنید" },
  { value: "male", label: "آقا" },
  { value: "female", label: "خانم" },
];

const emptyAddress = {
  province: "",
  city: "",
  street: "",
  alley: "",
  number: "",
  postalCode: "",
  floor: undefined as number | undefined,
  unit: undefined as number | undefined,
};

const provinces = [
  "تهران",
  "اصفهان",
  "فارس",
  "خراسان رضوی",
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "خوزستان",
  "مازندران",
  "گیلان",
  "کرمان",
  "البرز",
  "قم",
  "همدان",
  "کردستان",
  "کرمانشاه",
  "لرستان",
  "سیستان و بلوچستان",
  "هرمزگان",
  "بوشهر",
  "مرکزی",
  "یزد",
  "زنجان",
  "قزوین",
  "سمنان",
  "گلستان",
  "اردبیل",
  "چهارمحال و بختیاری",
  "کهگیلویه و بویراحمد",
  "ایلام",
  "خراسان شمالی",
  "خراسان جنوبی",
];

export default function ProfilePage() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const canAccess = useProtectedRoute();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: addresses, isLoading: addrsLoading } = useGetAddresses();
  const updateProfile = useUpdateProfile();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [nationalId, setNationalId] = useState("");
  const [isForeign, setIsForeign] = useState(false);
  const [birthDay, setBirthDay] = useState<number | undefined>();
  const [birthMonth, setBirthMonth] = useState<number | undefined>();
  const [birthYear, setBirthYear] = useState<number | undefined>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [addrSubmitting, setAddrSubmitting] = useState(false);

  const enterEditMode = () => {
    if (profile) {
      setFirstName((profile.firstName as string) ?? "");
      setLastName((profile.lastName as string) ?? "");
      setGender((profile.gender as string) ?? "");
      setNationalId((profile.nationalId as string) ?? "");
      setIsForeign(!!(profile.isForeignNational as boolean));
      setBirthDay((profile.birthDay as number) ?? undefined);
      setBirthMonth((profile.birthMonth as number) ?? undefined);
      setBirthYear((profile.birthYear as number) ?? undefined);
    }
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      message.warning("نام و نام خانوادگی الزامی است");
      return;
    }
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender || null,
        nationalId: isForeign ? null : (nationalId.trim() || null),
        isForeignNational: isForeign,
        birthDay: birthDay ?? null,
        birthMonth: birthMonth ?? null,
        birthYear: birthYear ?? null,
      });
      dispatch(setCredentials({
        token: token!,
        user: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: user?.role,
          mobile: user?.mobile,
        },
      }));
      message.success("پروفایل با موفقیت ذخیره شد");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch {
      message.error("خطا در ذخیره پروفایل");
    } finally {
      setSaving(false);
    }
  };

  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm(emptyAddress);
    setAddrModalOpen(true);
  };

  const openEditAddr = (addr: Address) => {
    setEditingAddr(addr);
    setAddrForm({
      province: addr.province,
      city: addr.city,
      street: addr.street,
      alley: addr.alley ?? "",
      number: addr.number,
      postalCode: addr.postalCode,
      floor: addr.floor ?? undefined,
      unit: addr.unit ?? undefined,
    });
    setAddrModalOpen(true);
  };

  const handleSaveAddr = async () => {
    const { province, city, street, number, postalCode } = addrForm;
    if (!province || !city || !street || !number || !postalCode) {
      message.warning("فیلدهای الزامی را پر کنید");
      return;
    }
    setAddrSubmitting(true);
    try {
      if (editingAddr) {
        await updateAddress.mutateAsync({ id: editingAddr.id, ...addrForm } as AddressDto & { id: number });
        message.success("آدرس با موفقیت ویرایش شد");
      } else {
        await createAddress.mutateAsync(addrForm as AddressDto);
        message.success("آدرس با موفقیت افزوده شد");
      }
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setAddrModalOpen(false);
    } catch {
      message.error("خطا در ذخیره آدرس");
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddr = async (id: number) => {
    try {
      await deleteAddress.mutateAsync(id);
      message.success("آدرس با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch {
      message.error("خطا در حذف آدرس");
    }
  };

  if (!canAccess) return null;

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user?.firstName
      ? `${user.firstName[0]}${(user.lastName ?? "")[0] ?? ""}`.toUpperCase()
      : "?";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 pb-20 pt-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-pink-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white shadow-2xl ring-4 ring-white/30 backdrop-blur-sm">
              {initials}
            </div>
            <div className="text-center sm:text-right">
              <h1 className="text-3xl font-bold text-white">
                {profile?.firstName || firstName
                  ? `${profile?.firstName || firstName} ${profile?.lastName || lastName}`
                  : "پروفایل کاربری"}
              </h1>
              <p className="mt-1 text-blue-100">
                {user?.mobile ?? ""}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative -mt-16 mx-auto max-w-5xl space-y-8 px-6 pb-12">
        {/* Profile Info Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <UserOutlined className="text-lg" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  اطلاعات حساب کاربری
                </h2>
              </div>
              {!editing && (
                <button onClick={enterEditMode} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                  <EditOutlined /> ویرایش اطلاعات
                </button>
              )}
            </div>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-20"><Spin size="large" /></div>
          ) : editing ? (
            <div className="grid gap-6 p-8 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">نام *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="نام" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">نام خانوادگی *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="نام خانوادگی" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">جنسیت</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
                  {genderOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">کد ملی</label>
                <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} disabled={isForeign} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="کد ملی" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isForeign} onChange={(e) => setIsForeign(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm font-semibold text-gray-600">اتباع خارجی هستم</span>
                </label>
              </div>

              {/* Birth date */}
              <div className="sm:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-gray-600">تاریخ تولد</label>
                <div className="flex gap-3">
                  <select value={birthDay ?? ""} onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : undefined)} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
                    <option value="">روز</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                  <select value={birthMonth ?? ""} onChange={(e) => setBirthMonth(e.target.value ? Number(e.target.value) : undefined)} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
                    <option value="">ماه</option>
                    {["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"].map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
                  </select>
                  <select value={birthYear ?? ""} onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : undefined)} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
                    <option value="">سال</option>
                    {Array.from({ length: 106 }, (_, i) => 1405 - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3 flex gap-3">
                <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl disabled:opacity-60">
                  <CheckCircleOutlined />{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
                <button onClick={() => setEditing(false)} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">انصراف</button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 p-8 sm:grid-cols-2">
              <div>
                <span className="text-xs text-gray-400">نام</span>
                <p className="font-bold text-gray-800">{profile?.firstName ?? "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">نام خانوادگی</span>
                <p className="font-bold text-gray-800">{profile?.lastName ?? "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">جنسیت</span>
                <p className="font-bold text-gray-800">{profile?.gender === "male" ? "آقا" : profile?.gender === "female" ? "خانم" : "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">کد ملی</span>
                <p className="font-bold text-gray-800">{profile?.nationalId || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">تابعیت</span>
                <p className="font-bold text-gray-800">{profile?.isForeignNational ? "اتباع خارجی" : "ایرانی"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">تاریخ تولد</span>
                <p className="font-bold text-gray-800">
                  {profile?.birthYear ? `${profile.birthYear}/${String(profile.birthMonth ?? "").padStart(2, "0")}/${String(profile.birthDay ?? "").padStart(2, "0")}` : "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50">
          <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <EnvironmentOutlined className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  آدرس‌های من
                </h2>
                <p className="text-xs text-gray-400">
                  {Array.isArray(addresses) ? addresses.length : 0} آدرس ثبت‌شده
                </p>
              </div>
            </div>
            <button
              onClick={openAddAddr}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:shadow-xl hover:shadow-purple-300"
            >
              <PlusOutlined />
              افزودن آدرس جدید
            </button>
          </div>

          <div className="p-6">
            {addrsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spin size="large" />
              </div>
            ) : Array.isArray(addresses) && addresses.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {addresses.map((addr: Address) => (
                  <div
                    key={addr.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-purple-500 shadow-inner">
                          <HomeOutlined className="text-xl" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {addr.province}، {addr.city}
                          </p>
                          <p className="text-xs text-gray-400">
                            {addr.postalCode && (
                              <span className="ml-2">کد پستی: {addr.postalCode}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEditAddr(addr)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          onClick={() => {
                            Modal.confirm({
                              title: "حذف آدرس",
                              content: "آیا از حذف این آدرس مطمئن هستید؟",
                              okText: "بله",
                              cancelText: "خیر",
                              okButtonProps: { danger: true },
                              onOk: () => handleDeleteAddr(addr.id),
                            });
                          }}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pr-14 text-sm text-gray-600">
                      <p>
                        <span className="ml-1 font-medium text-gray-500">خیابان:</span>
                        {addr.street}
                        {addr.alley && ` - کوچه ${addr.alley}`}
                      </p>
                      <p>
                        <span className="ml-1 font-medium text-gray-500">پلاک:</span>
                        {addr.number}
                      </p>
                      {(addr.floor || addr.unit) && (
                        <p>
                          <span className="ml-1 font-medium text-gray-500">واحد:</span>
                          {addr.unit && `${addr.unit}`}
                          {addr.floor && ` - طبقه ${addr.floor}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <EnvironmentOutlined className="text-3xl text-gray-300" />
                </div>
                <p className="text-base font-medium">هنوز آدرسی ثبت نشده است</p>
                <p className="mt-1 text-sm">
                  اولین آدرس خود را با کلیک روی دکمه بالا اضافه کنید
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold">
            <HomeOutlined className="text-purple-500" />
            {editingAddr ? "ویرایش آدرس" : "آدرس جدید"}
          </div>
        }
        open={addrModalOpen}
        onOk={handleSaveAddr}
        confirmLoading={addrSubmitting}
        onCancel={() => setAddrModalOpen(false)}
        okText={editingAddr ? "ذخیره تغییرات" : "افزودن آدرس"}
        cancelText="انصراف"
        centered
        width={640}
      >
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              استان *
            </label>
            <select
              value={addrForm.province}
              onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            >
              <option value="">انتخاب کنید</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              شهر *
            </label>
            <input
              value={addrForm.city}
              onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="نام شهر"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              خیابان *
            </label>
            <input
              value={addrForm.street}
              onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="نام خیابان"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              کوچه
            </label>
            <input
              value={addrForm.alley}
              onChange={(e) => setAddrForm({ ...addrForm, alley: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="نام کوچه"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              پلاک *
            </label>
            <input
              value={addrForm.number}
              onChange={(e) => setAddrForm({ ...addrForm, number: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="شماره پلاک"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              کد پستی *
            </label>
            <input
              value={addrForm.postalCode}
              onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="کد پستی ۱۰ رقمی"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              طبقه
            </label>
            <input
              type="number"
              value={addrForm.floor ?? ""}
              onChange={(e) =>
                setAddrForm({
                  ...addrForm,
                  floor: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="شماره طبقه"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              واحد
            </label>
            <input
              type="number"
              value={addrForm.unit ?? ""}
              onChange={(e) =>
                setAddrForm({
                  ...addrForm,
                  unit: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              placeholder="شماره واحد"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
