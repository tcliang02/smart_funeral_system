'use client';

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className={`min-h-screen flex flex-col ${isHomePage ? 'bg-transparent' : 'bg-gray-50'}`}>
      <Navbar />
      <main className={`flex-1 ${isHomePage ? '' : 'container mx-auto px-4 py-6'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
