"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/hooks/api/authApi";

function LoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next") ?? searchParams.get("redirect");
  // Do not accept an external URL or send a user back to /login itself.
  const next =
    requestedNext &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.startsWith("/login")
      ? requestedNext
      : "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({ mobile, password });
      if (result.user.role === "Admin") {
        router.push("/admin");
      } else {
        router.replace(next);
      }
    } catch {}
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          ورود به حساب
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">شماره موبایل</label>
            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="09123456789" required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-left outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">رمز عبور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" dir="ltr" />
          </div>
          {login.isError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">شماره موبایل یا رمز عبور اشتباه است</p>}
          <button type="submit" disabled={login.isPending} className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {login.isPending ? "در حال ورود..." : "ورود"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          حساب کاربری ندارید؟{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
