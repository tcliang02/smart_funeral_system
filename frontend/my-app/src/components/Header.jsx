'use client';

import Link from 'next/link'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <h1>My Website</h1>
      <nav>
        <Link href="/">Home</Link> |{" "}
        <Link href="/about">About</Link> |{" "}
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  )
}

export default Header
