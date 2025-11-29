'use client';

import { useState } from "react";  
import { motion } from "framer-motion";
import Link from "next/link";
import { providers } from "../data/providers";

export default function ProviderDetails({ id }) {
  const [activeTab, setActiveTab] = useState('packages');

  const provider = providers.find((p) => p.id === parseInt(id));
  
  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-4">The service provider you are looking for does not exist.</p>
          <Link href="/service-provider" className="text-indigo-600 hover:text-indigo-700">Back to Providers</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="py-8 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/service-provider" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
           Back to Providers
        </Link>
        <Link 
          to={`/provider/${id}/availability`} 
          className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          Check Provider Availability
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl"></span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-400"></span>
              <span className="text-sm text-gray-600 ml-2">{provider.rating} ({provider.reviews} reviews)</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span> {provider.location}</span>
              <span> {provider.workingHours}</span>
              <span> {provider.packages?.length} Packages Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {provider.packages?.map((pkg, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{pkg.capacity}</span>
            </div>
            <p className="text-gray-600 mb-4">{pkg.desc}</p>
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">What is Included:</h4>
              <ul className="space-y-1">
                {pkg.features?.slice(0, 3).map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                     {feature}
                  </li>
                ))}
                {pkg.features?.length > 3 && (
                  <li className="text-sm text-indigo-600">+ {pkg.features.length - 3} more features</li>
                )}
              </ul>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-2xl font-bold text-gray-900">RM{pkg.price?.toLocaleString()}</span>
                <span className="text-gray-500 text-sm ml-1">per service</span>
              </div>
              <Link href={`/provider/${provider.id}/package/${index}`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
