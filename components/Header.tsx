"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/useCart";
import SearchDropdown from "./SearchDropdown";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.251 2.251 0 017.5 15.75h11.218a2.25 2.25 0 002.162-1.639l2.276-8.165A.75.75 0 0022.438 5.25H5.924l-.55-2.07A1.863 1.863 0 003.636 1.5H2.25a.75.75 0 000 1.5zm5.25 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
    </svg>
  );
}

function UserAvatar({ name }: { name?: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-sm ring-2 ring-white">
      {initials}
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout, hydrated } = useAuth();
  const { cartCount } = useCart();
  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "";

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-md transition-all duration-300">
      {/* محفظه اصلی با سایه بسیار محو و بدون خط مرزی تیز */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* لوگو و نام فروشگاه */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-200 active:scale-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5"
            >
              <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.689z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
            فروشگاه آنلاین
          </span>
        </Link>

        {/* بخش اکشن‌ها و پروفایل کاربر */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hydrated ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-md hover:shadow-orange-500/30 active:scale-95 sm:text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08zM15.03 10.28a.75.75 0 00-1.06-1.06l-4.47 4.47-1.47-1.47a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l5-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>پنل مدیریت</span>
                </Link>
              )}

              {/* دکمه سبد خرید با افکت ظریف */}
              <Link
                href="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100/70 text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                aria-label="سبد خرید"
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* وضعیت ورود / پروفایل */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-gray-100/80 active:scale-98"
                  >
                    <UserAvatar name={fullName} />
                    <span className="hidden text-sm font-medium text-gray-700 sm:block">
                      {fullName}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-md hover:shadow-blue-500/30 active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>ورود</span>
                </Link>
              )}
            </>
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-100" />
          )}
        </div>
      </div>
    </header>
  );
}
