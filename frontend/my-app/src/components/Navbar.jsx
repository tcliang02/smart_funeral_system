'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../AuthContext";
// Navbar.css import removed for Tailwind migration

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use AuthContext instead of localStorage directly
  const { user, logout: authLogout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    authLogout();
    router.push("/");
  };

  const isActive = (path) => {
    return pathname === path 
      ? "text-indigo-600 font-medium"
      : "text-gray-700 hover:text-indigo-600";
  };

  const renderLinks = () => {
    if (!user) {
      // 🔓 Public visitor (not logged in)
      return (
        <>
          <li><Link href="/" className={`${isActive("/")} transition-colors`}>Home</Link></li>
          <li><Link href="/faqs" className={`${isActive("/faqs")} transition-colors`}>FAQs</Link></li>
        </>
      );
    }

    switch (user.role) {
      // 👪 FAMILY MEMBER (Main User) — Full access to all features
      case "family":
        return (
          <>
            <li><Link href="/" className={`${isActive("/")} transition-colors`}>Home</Link></li>
            <li><Link href="/order-services" className={`${isActive("/order-services")} transition-colors`}>Order Services</Link></li>
            <li><Link href="/tribute" className={`${isActive("/tribute")} transition-colors`}>Tribute</Link></li>
            <li><Link href="/grief-support" className={`${isActive("/grief-support")} transition-colors`}>Grief Support</Link></li>
            <li><Link href="/orders" className={`${isActive("/orders")} transition-colors`}>My Orders</Link></li>
            <li><Link href="/faqs" className={`${isActive("/faqs")} transition-colors`}>FAQs</Link></li>
          </>
        );

      // 🙏 FUNERAL ATTENDEE (Guest) — View tributes, RSVP, send condolences
      case "attendee":
        return (
          <>
            <li><Link href="/" className={`${isActive("/")} transition-colors`}>Home</Link></li>
            <li><Link href="/tribute" className={`${isActive("/tribute")} transition-colors`}>Tributes</Link></li>
            <li><Link href="/faqs" className={`${isActive("/faqs")} transition-colors`}>FAQs</Link></li>
          </>
        );

      // ⚙️ SERVICE PROVIDER — Manage packages and bookings
      case "provider":
        return (
          <>
            <li><Link href="/service-provider-dashboard" className={`${isActive("/service-provider-dashboard")} transition-colors`}>Dashboard</Link></li>
            <li><Link href="/manage-packages" className={`${isActive("/manage-packages")} transition-colors`}>Packages</Link></li>
            <li><Link href="/faqs" className={`${isActive("/faqs")} transition-colors`}>FAQs</Link></li>
          </>
        );

      default:
        // Default to family member links for unrecognized roles
        return (
          <>
            <li><Link href="/" className={`${isActive("/")} transition-colors`}>Home</Link></li>
            <li><Link href="/order-services" className={`${isActive("/order-services")} transition-colors`}>Order Services</Link></li>
            <li><Link href="/tribute" className={`${isActive("/tribute")} transition-colors`}>Tribute</Link></li>
            <li><Link href="/grief-support" className={`${isActive("/grief-support")} transition-colors`}>Grief Support</Link></li>
            <li><Link href="/orders" className={`${isActive("/orders")} transition-colors`}>My Orders</Link></li>
            <li><Link href="/faqs" className={`${isActive("/faqs")} transition-colors`}>FAQs</Link></li>
          </>
        );
    }
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Navigation */}
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="relative" style={{ width: '200px', height: '50px' }}>
                <Image
                  src="/images/zenlink logo.png"
                  alt="ZENLINK Logo"
                  fill
                  sizes="200px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links - Center (desktop only) */}
          <div className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center space-x-8">
              {renderLinks()}
            </ul>
          </div>

          {/* Auth Controls - Right */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  href="/contact"
                  className="hidden sm:flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Contact
                </Link>
                <button
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </button>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                {/* Welcome message */}
                <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500">Welcome,</span>
                  <span className="ml-1 text-sm font-semibold text-indigo-600">{user.name || user.username}</span>
                </div>
                
                {/* Profile Dropdown Button */}
                <button
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  onClick={() => router.push("/profile-settings")}
                  title="Profile Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Profile</span>
                </button>
                
                {/* Logout Button */}
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                  onClick={handleLogout}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Logout
                </button>
              </div>
            )}

            {/* Mobile: User menu or Login */}
            {user && (
              <div className="lg:hidden flex items-center gap-2">
                <button
                  className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => router.push("/profile-settings")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-100">
            {/* User info for mobile */}
            {user && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Logged in as</p>
                    <p className="text-sm font-semibold text-indigo-600">{user.name || user.username}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <ul className="flex flex-col space-y-2 mb-4">
              {renderLinks()}
            </ul>
            
            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {!user ? (
                <>
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Contact Us
                  </Link>
                  <button
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    onClick={() => {
                      router.push("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    onClick={() => {
                      router.push("/profile-settings");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile Settings
                  </button>
                  
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Contact Us
                  </Link>
                  
                  <button
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}