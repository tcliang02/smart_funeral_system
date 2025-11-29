'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getServiceProviders } from "../supabaseData"; // 🔥 NEW: Supabase import

export default function ServiceProviderSupabase() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    priceRange: "",
    rating: "",
    date: ""
  });

  // 🔥 NEW: Fetch providers from Supabase
  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      setLoading(true);
      setError(null);

      const result = await getServiceProviders();
      
      if (result.success) {
        setProviders(result.providers);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error loading providers:', err);
      setError('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  }

  // ✅ Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setFilters({
      location: "",
      priceRange: "",
      rating: "",
      date: ""
    });
  };

  // ✅ Apply filters
  const filteredProviders = providers.filter((provider) => {
    // Location filter
    if (filters.location && !provider.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Price range filter (if provider has packages)
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      // Note: You might need to fetch package prices separately
      // For now, skip price filtering
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      if (!provider.rating || provider.rating < minRating) {
        return false;
      }
    }

    // Date filter (availability)
    if (filters.date) {
      // You would check provider_availability table
      // For now, skip date filtering
    }

    return true;
  });

  // 🔥 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service providers...</p>
        </div>
      </div>
    );
  }

  // 🔥 Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={loadProviders}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Ideal Service Provider
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse trusted funeral service providers in your area
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city or state"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProviders.length} of {providers.length} providers
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider.provider_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Provider Image */}
              <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                {provider.logo_url ? (
                  <img
                    src={provider.logo_url}
                    alt={provider.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl text-primary/20">🏢</div>
                )}
              </div>

              {/* Provider Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {provider.company_name}
                </h3>

                <div className="space-y-2 mb-4">
                  {/* Location */}
                  {provider.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      📍 {provider.location}
                    </p>
                  )}

                  {/* Contact */}
                  {provider.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      📞 {provider.phone}
                    </p>
                  )}

                  {/* Email */}
                  {provider.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      ✉️ {provider.email}
                    </p>
                  )}

                  {/* Rating */}
                  {provider.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium text-gray-900">
                        {provider.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <Link
                  to={`/provider-details/${provider.provider_id}`}
                  className="block w-full text-center bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No service providers match your filters
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
