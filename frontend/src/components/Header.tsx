"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle2 } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const updateAuth = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("token")));
    };

    updateAuth();
    window.addEventListener("storage", updateAuth);
    window.addEventListener("focus", updateAuth);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("focus", updateAuth);
    };
  }, [pathname]);

  return (
    <header
      className={`absolute top-0 left-0 z-20 flex w-full items-center justify-between px-3 py-3 sm:px-6 sm:py-4 md:px-8 ${
        isHome ? "border-0 bg-transparent shadow-none" : "border-b border-gray-200 bg-white shadow-md"
      }`}
    >
      <Link
        href="/"
        className={`max-w-[8.5rem] text-3xl leading-none font-bold transition-colors sm:max-w-none sm:text-2xl ${
          isHome ? "text-white hover:text-green-200" : "text-gray-900 hover:text-green-700"
        }`}
      >
        Лесное Озеро
      </Link>

      <nav className={`hidden md:flex gap-6 ${isHome ? "text-white" : "text-gray-800"}`}>
        <Link href="/#about" className="hover:underline">
          О базе
        </Link>
        <Link href="/#accommodation" className="hover:underline">
          Размещение
        </Link>
        <Link href="/#services" className="hover:underline">
          Услуги
        </Link>
        <Link href="/#contacts" className="hover:underline">
          Контакты
        </Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-4">
        <a
          href="tel:+79001234567"
          className={`hidden text-sm sm:inline ${isHome ? "text-white" : "text-gray-800"}`}
        >
          +7 (900) 123-45-67
        </a>

        {isAuthenticated ? (
          <Link href="/dashboard" aria-label="Профиль">
            <UserCircle2
              className={`h-9 w-9 transition-colors ${
                isHome ? "text-white hover:text-green-200" : "text-gray-800 hover:text-green-700"
              }`}
            />
          </Link>
        ) : (
          <Link href="/auth/login">
            <button className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white shadow-lg hover:bg-green-700 sm:px-4 sm:text-base">
              <span className="sm:hidden">Войти</span>
              <span className="hidden sm:inline">Войти/Зарегистрироваться</span>
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
