"use client";

import Link from "next/link";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  InstagramOutlined,
  SendOutlined,
} from "@ant-design/icons";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6">
        {/* Top wave row */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.689z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">فروشگاه آنلاین</span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-gray-400">
              بهترین محصولات با کیفیت و قیمت مناسب. ارسال سریع به سراسر کشور.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-base font-bold text-white">دسترسی سریع</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-gray-400 transition-colors hover:text-white">محصولات</Link></li>
              <li><Link href="/" className="text-gray-400 transition-colors hover:text-white">بخش‌های ویژه</Link></li>
              <li><Link href="/cart" className="text-gray-400 transition-colors hover:text-white">سبد خرید</Link></li>
              <li><Link href="/profile" className="text-gray-400 transition-colors hover:text-white">پروفایل کاربری</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-base font-bold text-white">تماس با ما</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <EnvironmentOutlined className="text-blue-400" />
                تهران، خیابان ولیعصر
              </li>
              <li className="flex items-center gap-3">
                <PhoneOutlined className="text-blue-400" />
                ۰۲۱-۱۲۳۴۵۶۷۸
              </li>
              <li className="flex items-center gap-3">
                <MailOutlined className="text-blue-400" />
                info@shop.ir
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-5 text-base font-bold text-white">خبرنامه</h4>
            <p className="text-sm text-gray-400">برای دریافت جدیدترین تخفیف‌ها و محصولات عضو شوید</p>
            <div className="mt-4 flex gap-2">
              <input
                placeholder="ایمیل خود را وارد کنید"
                className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                dir="ltr"
              />
              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700">
                <SendOutlined />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-blue-600 hover:text-white">
                <InstagramOutlined />
              </span>
              <span className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-blue-600 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 py-6 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} فروشگاه آنلاین. تمامی حقوق محفوظ است.</p>
          <p>ساخته شده با ❤️</p>
        </div>
      </div>
    </footer>
  );
}
