"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/useCart";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items } = useCart();

  const continueToPayment = () => {
    if (!isAuthenticated) {
      router.replace("/login?next=%2Fcheckout");
      return;
    }

    message.info("درگاه پرداخت در Swagger فعلی تعریف نشده است.");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-gray-800">تکمیل خرید</h1>
        <p className="mt-3 text-sm text-gray-600">
          {items.length ? "سبد شما آمادهٔ ثبت سفارش است." : "سبد خرید شما خالی است."}
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/cart" className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-bold text-gray-600">
            بازگشت به سبد
          </Link>
          <button
            type="button"
            disabled={!items.length}
            onClick={continueToPayment}
            className="flex-[2] rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ورود و ادامهٔ پرداخت
          </button>
        </div>
      </section>
    </main>
  );
}
