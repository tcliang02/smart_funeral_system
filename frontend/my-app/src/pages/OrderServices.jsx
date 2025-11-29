'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SmartSearch from "../components/SmartSearch";
import { Phone, ArrowRight } from "lucide-react";
import { logger } from "@/lib/logger";

export default function OrderServices() {
  const [providers, setProviders] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState({}); // Track which provider details are expanded
  const [expandedFeatures, setExpandedFeatures] = useState({}); // Track which package features are expanded
  const [filters, setFilters] = useState({
    location: "",
    priceRange: "",
    search: "",
    searchBy: "all" // all, provider, package, description
  });

  const router = useRouter();

  // Fetch providers and packages from backend
  useEffect(() => {
    fetchProvidersAndPackages();
  }, []);

  const fetchProvidersAndPackages = async () => {
    setLoading(true);
    try {
      // Fetch all providers with their packages (with cache busting)
      const timestamp = new Date().getTime();
      const [providersRes, packagesRes] = await Promise.all([
        fetch(`/api/backend/getAllProviders?t=${timestamp}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }),
        fetch(`/api/backend/getAllPackages?t=${timestamp}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
      ]);

      // Check if responses are ok before parsing
      if (!providersRes.ok) {
        const errorText = await providersRes.text();
        throw new Error(`Failed to fetch providers: ${providersRes.status} ${errorText}`);
      }

      if (!packagesRes.ok) {
        const errorText = await packagesRes.text();
        throw new Error(`Failed to fetch packages: ${packagesRes.status} ${errorText}`);
      }

      const providersData = await providersRes.json();
      const packagesData = await packagesRes.json();

      // Handle standardized API response format: data.data.providers or data.providers
      const providersList = providersData.data?.providers || providersData.providers || [];
      const packagesList = packagesData.data?.packages || packagesData.packages || [];

      logger.debug('Fetched providers and packages', {
        providersCount: providersList.length,
        packagesCount: packagesList.length,
        providersSuccess: providersData.success,
        packagesSuccess: packagesData.success
      });

      // Set providers even if empty array (to show empty state)
      if (providersData.success) {
        setProviders(providersList);
      } else {
        logger.warn('Providers fetch returned success: false', { data: providersData });
        setProviders([]);
      }

      // Set packages even if empty array (to show empty state)
      if (packagesData.success) {
        setPackages(packagesList);
      } else {
        logger.warn('Packages fetch returned success: false', { data: packagesData });
        setPackages([]);
      }
    } catch (error) {
      logger.error('Error fetching data', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      // Set empty arrays on error to show empty state
      setProviders([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection and availability check
  const handleContinue = async () => {
    if (!selectedDate && !isFlexible) {
      alert("Please select a date or check 'I'm flexible'");
      return;
    }

    setCheckingAvailability(true);

    try {
      if (isFlexible) {
        // Show all packages when flexible
        setAvailablePackages(packages);
        setShowResults(true);
      } else {
        // Format date for API (ensure it's in YYYY-MM-DD format)
        const dateForApi = selectedDate instanceof Date 
          ? selectedDate.toISOString().split('T')[0]
          : selectedDate.split('T')[0];
        
        logger.debug('Checking availability for date', { 
          originalDate: selectedDate, 
          formattedDate: dateForApi,
          providerCount: providers.length 
        });
        
        // Check availability for selected date
        const availabilityPromises = providers.map(async (provider) => {
          try {
            const response = await fetch(
              `/api/backend/checkAvailability?provider_id=${provider.provider_id}&date=${dateForApi}`,
              {
                headers: { 'ngrok-skip-browser-warning': 'true' }
              }
            );
            const data = await response.json();

            const isAvailable = data.success && (data.data?.provider?.is_available || data.data?.available || data.provider?.is_available || data.available);
            
            logger.debug(`Provider ${provider.provider_id} availability`, {
              providerId: provider.provider_id,
              providerName: provider.company_name,
              isAvailable,
              response: data
            });
            
            return {
              providerId: provider.provider_id,
              providerName: provider.company_name,
              available: isAvailable
            };
          } catch (error) {
            logger.error(`Error checking availability for provider ${provider.provider_id}`, { error });
            // If error checking, assume available (fail open)
            return {
              providerId: provider.provider_id,
              providerName: provider.company_name,
              available: true
            };
          }
        });

        const availabilityResults = await Promise.all(availabilityPromises);
        const availableCount = availabilityResults.filter(r => r.available).length;
        
        logger.debug('Availability check complete', {
          totalProviders: availabilityResults.length,
          availableCount: availableCount,
          selectedDate: selectedDate,
          results: availabilityResults.map(r => ({
            providerId: r.providerId,
            providerName: r.providerName,
            available: r.available
          }))
        });

        // If no providers are available, show all packages with a warning
        // This allows users to see packages even if providers haven't set up availability properly
        if (availableCount === 0) {
          logger.warn('No providers available for selected date - showing all packages with availability warning', {
            selectedDate,
            totalPackages: packages.length
          });
          // Show all packages but mark them as potentially unavailable
          setAvailablePackages(packages.map(pkg => ({
            ...pkg,
            _availabilityWarning: true
          })));
        } else {
          // Filter to only show packages from available providers
          const availableProviderIds = availabilityResults
            .filter(result => result.available)
            .map(result => String(result.providerId));

          const filtered = packages.filter(pkg => {
            const pkgProviderId = String(pkg.provider_id);
            return availableProviderIds.includes(pkgProviderId);
          });

          if (filtered.length === 0) {
            logger.warn('No packages available for selected date after filtering', {
              selectedDate,
              availableProviderIds,
              totalPackages: packages.length
            });
          }

          setAvailablePackages(filtered);
        }
        
        setShowResults(true);
      }
    } catch (error) {
      logger.error('Error checking availability', { error: error.message });
      alert("Error checking availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handle filter changes from SmartSearch component
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      location: "",
      priceRange: "",
      search: "",
      searchBy: "all"
    });
  };

  // Filter available packages based on search and filters
  const filteredPackages = availablePackages.filter(pkg => {
    const provider = providers.find(p => String(p.provider_id) === String(pkg.provider_id));

    if (!provider) return false;

    // Search filter with specific field targeting
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      let matchesSearch = false;

      switch (filters.searchBy) {
        case 'provider':
          matchesSearch = provider.company_name?.toLowerCase().includes(searchLower);
          break;
        case 'package':
          matchesSearch = pkg.name?.toLowerCase().includes(searchLower);
          break;
        case 'description':
          matchesSearch = pkg.description?.toLowerCase().includes(searchLower);
          break;
        case 'all':
        default:
          matchesSearch =
            pkg.name?.toLowerCase().includes(searchLower) ||
            provider.company_name?.toLowerCase().includes(searchLower) ||
            pkg.description?.toLowerCase().includes(searchLower) ||
            provider.address?.toLowerCase().includes(searchLower) ||
            provider.city?.toLowerCase().includes(searchLower) ||
            provider.state?.toLowerCase().includes(searchLower);
      }

      if (!matchesSearch) return false;
    }

    // Location filter - Filter by provider's state field
    if (filters.location && provider.state !== filters.location) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      const price = parseFloat(pkg.price);
      if (price < min || price > max) return false;
    }

    return true;
  });

  // Handle package selection - navigate to package details with date
  const handleSelectPackage = (pkg) => {
    logger.debug('Selecting package', {
      packageId: pkg.package_id || pkg.id,
      providerId: pkg.provider_id
    });
    const provider = providers.find(p => String(p.provider_id) === String(pkg.provider_id));

    if (provider) {
      // Use package_id (from database) instead of id
      const pkgId = pkg.package_id || pkg.id;
      console.log('Navigating to package:', pkgId);

      // Store state in sessionStorage for the package details page to access
      // (Next.js doesn't support state like React Router)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('packageDetails', JSON.stringify({
          package: pkg,
          provider: provider,
          providerId: pkg.provider_id,
          selectedDate: isFlexible ? null : selectedDate,
          packages: availablePackages
        }));
      }

      // Navigate to package details page
      router.push(`/package/${pkgId}`);
    }
  };

  // Toggle provider details visibility
  const toggleProviderDetails = (packageId) => {
    setExpandedProviders(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  // Toggle package features visibility
  const togglePackageFeatures = (packageId) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Emergency Contact Banner - Prominent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/contact"
            className="group relative flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-[1.02] font-bold overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-lg md:text-xl">Need Help Booking? Contact Us 24/7</div>
                <div className="text-sm text-white/90 font-normal mt-0.5">
                  Emergency funeral services • Immediate assistance available
                </div>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book Funeral Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select your service date and browse available packages from trusted providers.
          </p>
        </motion.div>

        {/* Date Selection Section (Always visible until Continue is clicked) */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border-2 border-indigo-200 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  When do you need the service?
                </h2>
                <p className="text-gray-600">
                  Select a date to see available packages, or choose flexible for all options
                </p>
              </div>

              {/* Date Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setIsFlexible(false);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isFlexible}
                    className={`w-full text-lg border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isFlexible ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                      }`}
                  />
                </div>

                {/* Flexible Option */}
                <div className="flex items-center space-x-3 bg-white rounded-xl p-4 border-2 border-gray-200">
                  <input
                    type="checkbox"
                    id="flexible"
                    checked={isFlexible}
                    onChange={(e) => {
                      setIsFlexible(e.target.checked);
                      if (e.target.checked) {
                        setSelectedDate('');
                      }
                    }}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="flexible" className="flex-1 cursor-pointer">
                    <span className="font-medium text-gray-900 block">I'm flexible with dates</span>
                    <span className="text-sm text-gray-600">Show all available packages</span>
                  </label>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={checkingAvailability}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {checkingAvailability ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking Availability...
                    </span>
                  ) : (
                    <>Continue to Packages →</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Section (Only shown after Continue is clicked) */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Availability Warning Banner (if no providers available) */}
            {!isFlexible && availablePackages.length > 0 && availablePackages[0]?._availabilityWarning && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">
                      Availability Not Confirmed
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Providers may not have confirmed availability for this date. Please contact providers directly to confirm before booking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Date Banner */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      {isFlexible ? (
                        'Showing all packages (flexible dates)'
                      ) : (
                        `Service Date: ${new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}`
                      )}
                    </p>
                    <p className="text-xs text-green-700">
                      {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setAvailablePackages([]);
                    setSelectedDate('');
                    setIsFlexible(false);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
                >
                  Change Date
                </button>
              </div>
            </div>

            {/* Smart Search Component */}
            <SmartSearch
              packages={packages}
              providers={providers}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
            />

            {/* Packages Grid */}
            {filteredPackages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No packages available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isFlexible
                    ? 'Try adjusting your filters to see more results.'
                    : 'No packages are available for the selected date. Try choosing a different date or enable flexible dates.'
                  }
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg, index) => {
                  const provider = providers.find(p => String(p.provider_id) === String(pkg.provider_id));
                  return (
                    <motion.div
                      key={pkg.package_id || pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
                    >
                      <div className="p-6">
                        {/* Package Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>

                        {/* Provider Info Section - Collapsible */}
                        {provider && (
                          <div className="mb-4">
                            {/* Provider Name Header - Always Visible */}
                            <button
                              onClick={() => toggleProviderDetails(pkg.package_id || pkg.id)}
                              className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100 hover:border-indigo-200 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm font-semibold text-gray-900">
                                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {provider.company_name}
                                </div>
                                <svg
                                  className={`w-5 h-5 text-indigo-600 transition-transform ${expandedProviders[pkg.package_id || pkg.id] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>

                            {/* Expandable Provider Details */}
                            {expandedProviders[pkg.package_id || pkg.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-b-lg px-4 pb-4 border-x border-b border-indigo-100 -mt-1"
                              >
                                <div className="space-y-2 text-xs pt-3">
                                  {/* Address */}
                                  {provider.address && (
                                    <div className="flex items-start gap-2">
                                      <svg className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="text-gray-700">
                                        {provider.address}
                                        {provider.city && `, ${provider.city}`}
                                        {provider.state && `, ${provider.state}`}
                                        {provider.postal_code && ` ${provider.postal_code}`}
                                      </span>
                                    </div>
                                  )}

                                  {/* Phone */}
                                  {(provider.phone || provider.contact_number) && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      <span className="text-gray-700">{provider.phone || provider.contact_number}</span>
                                    </div>
                                  )}

                                  {/* Operating Hours */}
                                  {provider.operating_hours && (
                                    <div className="flex items-start gap-2">
                                      <svg className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-gray-700">{provider.operating_hours}</span>
                                    </div>
                                  )}

                                  {/* Website & Social Media */}
                                  <div className="flex items-center gap-3 pt-1">
                                    {provider.website && (
                                      <a
                                        href={provider.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        Website
                                      </a>
                                    )}
                                    {provider.facebook_url && (
                                      <a
                                        href={provider.facebook_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        title="Facebook"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                      </a>
                                    )}
                                    {provider.instagram_url && (
                                      <a
                                        href={provider.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-pink-600 hover:text-pink-800"
                                        title="Instagram"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Package Details Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {/* Capacity */}
                          {pkg.capacity && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {pkg.capacity} {typeof pkg.capacity === 'number' ? 'guests' : ''}
                            </span>
                          )}
                          
                          {/* Location Type */}
                          {pkg.location_type && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              {pkg.location_type === 'both' ? 'Indoor & Outdoor' : 
                               pkg.location_type === 'home' ? 'Indoor Only' : 
                               pkg.location_type === 'venue' ? 'Outdoor Only' : 
                               pkg.location_type}
                            </span>
                          )}
                          
                          {/* Duration */}
                          {pkg.duration_hours && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {pkg.duration_hours} {pkg.duration_hours === 1 ? 'hour' : 'hours'}
                            </span>
                          )}
                        </div>

                        {/* Rating Display */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-lg ${star <= Math.round(pkg.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                {star <= Math.round(pkg.average_rating) ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {pkg.average_rating > 0 ? pkg.average_rating.toFixed(1) : 'New'}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {pkg.total_reviews > 0
                              ? `(${pkg.total_reviews} review${pkg.total_reviews === 1 ? '' : 's'})`
                              : '(No reviews yet)'}
                          </span>
                        </div>

                        {pkg.total_bookings > 0 && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2zM9 9V7a3 3 0 016 0v2H9z" />
                            </svg>
                            <span>{pkg.total_bookings} booking{pkg.total_bookings === 1 ? '' : 's'} completed</span>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>

                        {/* Package Features Section - Collapsible */}
                        {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                          <div className="mb-4">
                            {/* Features Header - Always Visible */}
                            <button
                              onClick={() => togglePackageFeatures(pkg.package_id || pkg.id)}
                              className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100 hover:border-emerald-200 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm font-semibold text-gray-900">
                                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Package Features ({pkg.features.length})
                                </div>
                                <svg
                                  className={`w-5 h-5 text-emerald-600 transition-transform ${expandedFeatures[pkg.package_id || pkg.id] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>

                            {/* Expandable Features List */}
                            {expandedFeatures[pkg.package_id || pkg.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-b-lg px-4 pb-4 border-x border-b border-emerald-100 -mt-1"
                              >
                                <ul className="space-y-2 pt-3">
                                  {pkg.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-3xl font-bold text-indigo-600">RM {parseFloat(pkg.price).toLocaleString('en-MY')}</span>
                          </div>
                          {!isFlexible && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          )}
                        </div>

                        {/* Select Button */}
                        <button
                          onClick={() => handleSelectPackage(pkg)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Select Package →
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
