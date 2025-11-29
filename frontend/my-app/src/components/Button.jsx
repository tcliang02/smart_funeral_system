'use client';

// src/components/Button.js
import React from "react";
import Link from "next/link";
// Button.css import removed for Tailwind migration

const Button = ({ to, variant = "primary", size = "medium", children }) => {
  const base = "inline-flex items-center justify-center rounded shadow-sm focus:outline-none";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const className = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.medium}`;

  return to ? (
    <Link href={to} className={className}>
      {children}
    </Link>
  ) : (
    <button className={className}>{children}</button>
  );
};

export default Button;
