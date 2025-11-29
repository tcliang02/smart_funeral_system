import React, { useState, useEffect, useRef } from 'react';

export default function SmartSearch({ 
  packages, 
  providers, 
  filters, 
  onFilterChange,
  onClearFilters 
}) {
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate smart search suggestions
  const generateSearchSuggestions = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const suggestions = [];
    const seen = new Set();

    packages.forEach(pkg => {
      const provider = providers.find(p => p.provider_id === pkg.provider_id);
      
      // Match package names
      if (pkg.name && pkg.name.toLowerCase().includes(term)) {
        const key = `package-${pkg.name}`;
        if (!seen.has(key)) {
          suggestions.push({ 
            type: 'package', 
            value: pkg.name, 
            label: pkg.name,
            icon: '📦',
            searchBy: 'package'
          });
          seen.add(key);
        }
      }
      
      // Match provider names
      if (provider?.company_name?.toLowerCase().includes(term)) {
        const key = `provider-${provider.company_name}`;
        if (!seen.has(key)) {
          suggestions.push({ 
            type: 'provider', 
            value: provider.company_name, 
            label: provider.company_name,
            icon: '🏢',
            searchBy: 'provider'
          });
          seen.add(key);
        }
      }
      
      // Match locations
      if (provider?.address?.toLowerCase().includes(term)) {
        const key = `location-${provider.address}`;
        if (!seen.has(key)) {
          suggestions.push({ 
            type: 'location', 
            value: provider.address, 
            label: provider.address,
            icon: '📍',
            searchBy: 'all'
          });
          seen.add(key);
        }
      }
    });

    setSearchSuggestions(suggestions.slice(0, 6));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    onFilterChange({ target: { name: 'search', value } });
    
    if (value.trim()) {
      generateSearchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onFilterChange({ target: { name: 'search', value: suggestion.value } });
    onFilterChange({ target: { name: 'searchBy', value: suggestion.searchBy } });
    setShowSuggestions(false);
  };

  // Count active filters
  const activeFilterCount = [
    filters.location,
    filters.priceRange,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      {/* Search Section */}
      <div className="mb-6" ref={searchRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🔍 Quick Search
        </label>
        <div className="relative">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by package, provider, or location..."
            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Suggestions
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3 group"
                  >
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                        {suggestion.label}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {suggestion.type}
                      </div>
                    </div>
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover:text-indigo-600"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📍 State
          </label>
          <select
            name="location"
            value={filters.location}
            onChange={(e) => onFilterChange(e)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All States</option>
            <option value="Johor">Johor</option>
            <option value="Kedah">Kedah</option>
            <option value="Kelantan">Kelantan</option>
            <option value="Kuala Lumpur">Kuala Lumpur</option>
            <option value="Labuan">Labuan</option>
            <option value="Melaka">Melaka</option>
            <option value="Negeri Sembilan">Negeri Sembilan</option>
            <option value="Pahang">Pahang</option>
            <option value="Penang">Penang</option>
            <option value="Perak">Perak</option>
            <option value="Perlis">Perlis</option>
            <option value="Putrajaya">Putrajaya</option>
            <option value="Sabah">Sabah</option>
            <option value="Sarawak">Sarawak</option>
            <option value="Selangor">Selangor</option>
            <option value="Terengganu">Terengganu</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💰 Price Range
          </label>
          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={(e) => onFilterChange(e)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Prices</option>
            <option value="0-5000">Below RM 5,000</option>
            <option value="5000-10000">RM 5,000 - RM 10,000</option>
            <option value="10000-20000">RM 10,000 - RM 20,000</option>
            <option value="20000-999999">Above RM 20,000</option>
          </select>
        </div>
      </div>

      {/* Active Filters & Clear Button */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{activeFilterCount}</span> filter{activeFilterCount !== 1 ? 's' : ''} active
          </div>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            ✕ Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
