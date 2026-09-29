"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "@/hooks/api/authApi";

export default function RegisterPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({ mobile, password });
      router.push("/login");
    } catch {}
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          ثبت‌نام
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              شماره موبایل
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09123456789"
              pattern="^09\d{9}$"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-left outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              dir="ltr"
            />
            <p className="mt-1 text-xs text-gray-400">
              فرمت: 09 followed by 9 digits
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              dir="ltr"
            />
            <p className="mt-1 text-xs text-gray-400">حداقل ۶ کاراکتر</p>
          </div>

          {register.isError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              خطا در ثبت‌نام. لطفاً دوباره تلاش کنید
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {register.isPending ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
