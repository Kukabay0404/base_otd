// app/layout.tsx
"use client";

import "./globals.css";
import Header from "../components/Header";
import Hero from "../components/Hero";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // список страниц, где НЕ нужно показывать Hero / Header / Footer
  const hidHeader = ["/auth/login", "/auth/register", "/admin"];
  const hideHero = ["/auth/login", "/auth/register", "/", "/summer/football", "/summer/paintball", "/admin", "/booking"];
  const hidFooter = ["/", "/auth/login", "/auth/register", "/admin"];

  return (
    <html lang="ru">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        {!hidHeader.includes(pathname) && <Header />}
        {!hideHero.includes(pathname) && <Hero />}
        <main>{children}</main>
        {!hidFooter.includes(pathname) && <Footer />}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
