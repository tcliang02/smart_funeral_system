// src/components/Footer.jsx
// Footer.css import removed for Tailwind migration

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-8">
      <div className="container mx-auto px-4 py-6 text-sm text-gray-600 flex flex-col md:flex-row md:justify-between">
        <div>© {new Date().getFullYear()} ZENLINK. All rights reserved.</div>
        <div className="mt-2 md:mt-0">
          <a className="hover:underline" href="/about">About</a>
          <span className="mx-2">|</span>
          <a className="hover:underline" href="/faqs">FAQs</a>
          <span className="mx-2">|</span>
          <a className="hover:underline" href="/tribute">Tribute</a>
        </div>
      </div>
    </footer>
  );
}
