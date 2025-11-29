export default function Card({ title, children, cta }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">{children}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
