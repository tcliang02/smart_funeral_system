'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BookingProgressBar from "../components/BookingProgressBar";
import { logger } from "@/lib/logger";

export default function PackageDetails({ packageId }) {
  const router = useRouter();

  // Get data from sessionStorage (passed from OrderServices)
  const [pkg, setPkg] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addonCategories, setAddonCategories] = useState([]);

  // Read from sessionStorage instead of location.state
  const [selectedDate, setSelectedDate] = useState('');
  const [isFlexibleDate, setIsFlexibleDate] = useState(true);

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('packageDetails');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setSelectedDate(data.selectedDate || '');
          setIsFlexibleDate(!data.selectedDate);
          // Optionally set pkg and provider if they were stored
          if (data.package) setPkg(data.package);
          if (data.provider) setProvider(data.provider);
          
          // Restore selected add-ons, parlour choice, and venue
          if (data.selectedAddons && Array.isArray(data.selectedAddons)) {
            setSelectedAddons(data.selectedAddons);
          }
          if (data.parlourChoice) {
            setParlourChoice(data.parlourChoice);
          }
          if (data.parlourAddress) {
            setParlourAddress(data.parlourAddress);
          }
          if (data.selectedVenue) {
            setSelectedVenue(data.selectedVenue);
          }
        } catch (e) {
          logger.error('Error parsing sessionStorage data', e);
        }
      }
    }
  }, []);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({}); // Track which categories are expanded
  const [parlourChoice, setParlourChoice] = useState('own'); // 'own' or 'venue'
  const [parlourAddress, setParlourAddress] = useState(''); // For own location
  const [selectedVenue, setSelectedVenue] = useState(null); // Selected venue addon

  // Fetch package details and provider add-ons
  useEffect(() => {
    // Always fetch based on packageId from URL
    fetchPackageDetails();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      // Fetch package details from backend (with cache busting)
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/backend/getAllPackages?t=${timestamp}`);
      const data = await response.json();

      // Handle standardized API response format: { success: true, data: { packages: [...] } }
      const packagesList = data.data?.packages || data.packages || [];
      logger.debug('Fetched packages', { packageCount: packagesList.length });

      if (data.success) {
        // Convert packageId to number for comparison
        const numericPackageId = parseInt(packageId, 10);
        logger.debug('Searching for package', { packageId: numericPackageId });

        const foundPackage = packagesList.find(p =>
          parseInt(p.package_id) === numericPackageId || parseInt(p.id) === numericPackageId
        );

        if (foundPackage) {
          setPkg(foundPackage);

          // Fetch provider details
          const providerResponse = await fetch(`/api/backend/getAllProviders?t=${timestamp}`);
          const providerData = await providerResponse.json();

          // Handle standardized API response format
          const providersList = providerData.data?.providers || providerData.providers || [];

          if (providerData.success) {
            const foundProvider = providersList.find(p => p.provider_id === foundPackage.provider_id);
            logger.debug('Found provider', { providerId: foundProvider?.provider_id });
            setProvider(foundProvider);

            // Fetch provider's add-ons
            if (foundProvider) {
              await fetchProviderAddons(foundProvider.provider_id);
              
              // After data is loaded, restore state from sessionStorage (preserve user selections)
              if (typeof window !== 'undefined') {
                const storedData = sessionStorage.getItem('packageDetails');
                if (storedData) {
                  try {
                    const data = JSON.parse(storedData);
                    // Only restore if this is the same package
                    const storedPackageId = data.package?.package_id || data.package?.id;
                    if (storedPackageId && parseInt(storedPackageId) === parseInt(packageId)) {
                      // Restore selections if they exist
                      if (data.selectedAddons && Array.isArray(data.selectedAddons) && data.selectedAddons.length > 0) {
                        setSelectedAddons(data.selectedAddons);
                        logger.debug('Restored selected add-ons', { count: data.selectedAddons.length });
                      }
                      if (data.parlourChoice) {
                        setParlourChoice(data.parlourChoice);
                      }
                      if (data.parlourAddress) {
                        setParlourAddress(data.parlourAddress);
                      }
                      if (data.selectedVenue) {
                        setSelectedVenue(data.selectedVenue);
                        logger.debug('Restored selected venue', { venue: data.selectedVenue.addon_name });
                      }
                    }
                  } catch (e) {
                    logger.error('Error parsing sessionStorage data after fetch', e);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error fetching package details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderAddons = async (providerId) => {
    try {
      const response = await fetch(`/api/backend/getActiveAddons?provider_id=${providerId}`);
      const data = await response.json();

      // Handle standardized API response format: { success: true, data: { categories: [...] } }
      const categories = data.data?.categories || data.categories || [];

      logger.debug('Fetched provider add-ons', {
        categoryCount: categories.length,
        totalAddons: categories.reduce((sum, cat) => sum + (cat.addons?.length || 0), 0)
      });

      if (data.success) {
        setAddonCategories(categories);
      } else {
        logger.warn('Failed to fetch addons', { message: data.message });
      }
    } catch (error) {
      logger.error('Error fetching provider add-ons', error);
    }
  };

  const [selectedAddons, setSelectedAddons] = useState([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!pkg || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
          <Link to="/order-services" className="text-indigo-600 hover:text-indigo-700">Back to Order Services</Link>
        </div>
      </div>
    );
  }

  const toggleAddon = (addon) => {
    logger.debug('toggleAddon called', { addonId: addon.addon_id });

    // Check if this is a venue addon
    const isVenue = venueAddons.some(venue => venue.addon_id === addon.addon_id);

    if (isVenue) {
      // For venues, only one can be selected at a time
      if (selectedVenue?.addon_id === addon.addon_id) {
        // Deselect venue
        setSelectedVenue(null);
        setParlourChoice('own');
      } else {
        // Select new venue
        setSelectedVenue(addon);
        setParlourChoice('venue');
      }
    } else {
      // Regular addon selection
      setSelectedAddons((prev) => {
        const isAlreadySelected = prev.find((a) => a.addon_id === addon.addon_id);
        const newSelection = isAlreadySelected
          ? prev.filter((a) => a.addon_id !== addon.addon_id)
          : [...prev, addon];

        logger.debug('Addon selection changed', {
          action: isAlreadySelected ? 'removed' : 'added',
          addonId: addon.addon_id,
          totalSelected: newSelection.length
        });

        return newSelection;
      });
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Helper function to save current state before navigating to availability
  const saveStateBeforeAvailability = () => {
    if (typeof window !== 'undefined' && pkg && provider) {
      // Save current selections to sessionStorage
      sessionStorage.setItem('packageDetails', JSON.stringify({
        package: pkg,
        provider: provider,
        selectedDate: selectedDate,
        selectedAddons: selectedAddons,
        parlourChoice: parlourChoice,
        parlourAddress: parlourAddress,
        selectedVenue: selectedVenue
      }));
      
      // Also save to availabilityData for the availability page
      sessionStorage.setItem('availabilityData', JSON.stringify({
        fromPackageDetails: true,
        packageId: packageId,
        selectedDate: selectedDate
      }));
    }
  };

  // Get venue addons from "Venue Rental" category
  const venueCategory = addonCategories.find(cat =>
    cat.category_name?.toLowerCase().includes('venue') ||
    cat.category_name?.toLowerCase().includes('rental')
  );
  const venueAddons = venueCategory?.addons || [];

  // Calculate total price: base package + add-ons + venue fee (if selected)
  const basePackagePrice = parseFloat(pkg?.price || 0);
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0);
  const venueFee = selectedVenue ? parseFloat(selectedVenue.price || 0) : 0;
  const totalPrice = basePackagePrice + addonsTotal + venueFee;

  const handleGoToCheckout = () => {
    // Validate date selection
    if (!selectedDate) {
      alert("Please select a service date before proceeding.");
      return;
    }

    // Validate parlour address if user's own location is selected
    if (parlourChoice === 'own' && !parlourAddress.trim()) {
      alert("Please provide the service address for your own location.");
      return;
    }

    // Remove any previously selected venue addons (only one venue can be selected)
    const nonVenueAddons = selectedAddons.filter(addon => {
      const isVenue = venueAddons.some(venue => venue.addon_id === addon.addon_id);
      return !isVenue;
    });

    // Add selected venue to addons if venue is selected
    const finalAddons = selectedVenue
      ? [...nonVenueAddons, selectedVenue]
      : nonVenueAddons;

    logger.debug('Proceeding to checkout', {
      packageId: pkg?.package_id,
      providerId: provider?.provider_id,
      selectedDate,
      parlourChoice,
      addonCount: finalAddons.length,
      totalPrice
    });

    // Ensure pkg and provider exist
    if (!pkg || !provider) {
      logger.error('Missing package or provider data for checkout');
      alert("Missing package or provider information. Please try again.");
      return;
    }

    // Store checkout data in sessionStorage (Next.js doesn't support state like React Router)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutData', JSON.stringify({
        package: pkg,
        provider: provider,
        selectedAddons: finalAddons,  // ✅ Include venue in addons if selected
        total: totalPrice,
        preSelectedDate: selectedDate,
        parlour: {
          choice: parlourChoice,
          name: parlourChoice === 'venue' ? (selectedVenue?.addon_name || '') : '',
          address: parlourChoice === 'venue' ? (selectedVenue?.description || provider.address) : parlourAddress,
          fee: selectedVenue ? parseFloat(selectedVenue.price) : 0,
          venue_id: selectedVenue?.addon_id || null,
        },
      }));
    }

    // Navigate to checkout
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      {/* Booking Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <BookingProgressBar
          currentStep={1}
          steps={['Select Package', 'Add-ons & Details', 'Checkout & Payment']}
        />
      </div>

      <main className="py-0 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/order-services"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            ← Back to Order Services
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">📦</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkg.package_name || pkg.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Capacity */}
                    {pkg.capacity && (
                      <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {pkg.capacity} {typeof pkg.capacity === 'number' ? 'guests' : ''}
                      </span>
                    )}
                    
                    {/* Location Type */}
                    {pkg.location_type && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pkg.duration_hours} {pkg.duration_hours === 1 ? 'hour' : 'hours'}
                      </span>
                    )}
                    
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{provider.company_name}</span>
                    {pkg.average_rating > 0 && (
                      <>
                        <span className="text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-900">{pkg.average_rating.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">({pkg.total_ratings} {pkg.total_ratings === 1 ? 'rating' : 'ratings'})</span>
                        </div>
                      </>
                    )}
                    <span className="text-gray-500">•</span>
                    <button
                      onClick={() => {
                        saveStateBeforeAvailability();
                        router.push(`/provider/${provider.provider_id}/availability`);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      <span>📅</span> View Availability
                    </button>
                  </div>
                </div>
                <div className="lg:text-right">
                  <div className="text-3xl font-bold text-gray-900">RM{pkg.price?.toLocaleString()}</div>
                  <div className="text-gray-500 text-sm">base price</div>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{pkg.description || 'Professional funeral service package'}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Service Date Selection - REQUIRED SECTION */}
            <div id="date-selection-section" className={`bg-white rounded-2xl shadow-sm border-2 p-8 transition-all ${showDateWarning ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-200'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Service Date *
                </h2>
                {selectedDate && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Date Confirmed
                  </span>
                )}
              </div>

              {showDateWarning && !selectedDate && (
                <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-1">Service Date Required</p>
                    <p className="text-sm text-red-700">Please select a service date before proceeding to checkout</p>
                  </div>
                </div>
              )}

              {selectedDate ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">Selected Service Date:</p>
                      <p className="text-2xl font-bold text-green-900">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        saveStateBeforeAvailability();
                        router.push(`/provider/${provider.provider_id}/availability`);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Change Date
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">Select your preferred service date from the availability calendar</p>
                  <button
                    onClick={() => {
                      setShowDateWarning(false);
                      saveStateBeforeAvailability();
                      router.push(`/provider/${provider.provider_id}/availability`);
                    }}
                    className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View Available Dates
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    You must select a service date before proceeding to checkout
                  </p>
                </div>
              )}
            </div>

            {/* Package Features */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Package Includes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Add-ons by Category - Collapsible */}
            {addonCategories.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Buddhist Ceremony Add-ons
                </h2>
                <p className="text-gray-600 mb-6">Select additional Buddhist services and items for your ceremony</p>

                {addonCategories
                  .filter(category => {
                    // Exclude "Venue Rental" category from regular addons (shown separately)
                    return !category.category_name?.toLowerCase().includes('venue') &&
                      !category.category_name?.toLowerCase().includes('rental');
                  })
                  .map((category) => {
                    const isExpanded = expandedCategories[category.category_id];
                    const categoryAddonCount = category.addons?.length || 0;
                    const selectedInCategory = selectedAddons.filter(addon =>
                      category.addons.some(a => a.addon_id === addon.addon_id)
                    ).length;

                    return (
                      <div key={category.category_id} className="mb-4 last:mb-0 border-2 border-gray-200 rounded-xl overflow-hidden">
                        {/* Category Header - Clickable */}
                        <button
                          onClick={() => toggleCategory(category.category_id)}
                          className="w-full px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <div className="text-left">
                              <h3 className="text-lg font-bold text-indigo-900">
                                {category.category_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {categoryAddonCount} service{categoryAddonCount > 1 ? 's' : ''} available
                                {selectedInCategory > 0 && (
                                  <span className="ml-2 text-amber-600 font-medium">
                                    • {selectedInCategory} selected
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedInCategory > 0 && (
                              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {selectedInCategory}
                              </span>
                            )}
                            <span className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </button>

                        {/* Category Content - Collapsible */}
                        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                          <div className="p-6 bg-white space-y-4">
                            {category.addons.map((addon) => {
                              const isSelected = selectedAddons.some((a) => a.addon_id === addon.addon_id);
                              return (
                                <div
                                  key={addon.addon_id}
                                  className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                                    ? "border-amber-500 bg-amber-50 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                    }`}
                                  onClick={() => toggleAddon(addon)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h4 className="text-lg font-semibold text-gray-900">{addon.addon_name}</h4>
                                          {addon.is_custom && (
                                            <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                              Custom Service
                                            </span>
                                          )}
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300"
                                          }`}>
                                          {isSelected && <span className="text-white text-sm">✓</span>}
                                        </div>
                                      </div>
                                      {addon.description && (
                                        <p className="text-gray-600 text-sm mb-3">{addon.description}</p>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-900">
                                          RM{parseFloat(addon.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button
                                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSelected
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-amber-600 text-white hover:bg-amber-700"
                                            }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleAddon(addon);
                                          }}
                                        >
                                          {isSelected ? "Remove" : "Add Service"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No add-ons available from this provider yet.</p>
                <p className="text-sm text-gray-400 mt-2">The provider can add Buddhist ceremony services from their dashboard.</p>
              </div>
            )}

            {/* Funeral Parlour / Venue Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Funeral Venue
              </h2>
              <p className="text-gray-600 mb-6">Choose where the funeral service will be held</p>

              <div className="space-y-4">
                {/* Own Location Option */}
                <div
                  onClick={() => {
                    setParlourChoice('own');
                    setSelectedVenue(null);
                  }}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${parlourChoice === 'own'
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${parlourChoice === 'own' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                        {parlourChoice === 'own' && <span className="text-white text-sm">●</span>}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Own Location</h3>
                        <p className="text-sm text-gray-600">Use your own venue for the funeral service</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-600">FREE</span>
                  </div>
                  {parlourChoice === 'own' && (
                    <div className="mt-4 pt-4 border-t border-indigo-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Address *
                      </label>
                      <textarea
                        value={parlourAddress}
                        onChange={(e) => setParlourAddress(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Enter the complete address where the service will be held"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Please provide the full address including street, city, and postal code
                      </p>
                    </div>
                  )}
                </div>

                {/* Venue Addons from Provider */}
                {venueAddons.length > 0 && (
                  <>
                    {venueAddons.map((venue) => {
                      const isSelected = selectedVenue?.addon_id === venue.addon_id;
                      return (
                        <div
                          key={venue.addon_id}
                          onClick={() => {
                            setSelectedVenue(venue);
                            setParlourChoice('venue');
                          }}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                }`}>
                                {isSelected && <span className="text-white text-sm">●</span>}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{venue.addon_name}</h3>
                                {venue.description && (
                                  <p className="text-sm text-gray-600 mt-1">{venue.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-purple-600">
                                +RM{parseFloat(venue.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-purple-200 space-y-2">
                              <div className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600">✓</span>
                                <span>Professional funeral venue with all facilities</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600">✓</span>
                                <span>Air-conditioned and comfortable for guests</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600">✓</span>
                                <span>Convenient location with parking available</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* No Venues Available Message */}
                {venueAddons.length === 0 && (
                  <div className="p-5 rounded-xl border-2 border-gray-200 bg-gray-50 text-center">
                    <p className="text-sm text-gray-600">
                      No venue options available from this provider. Please select "Own Location" or contact the provider for venue arrangements.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Base Package</span>
                  <span className="font-bold text-gray-900">RM{pkg.price?.toLocaleString()}</span>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Selected Add-ons:</h3>
                    {selectedAddons.map((addon) => (
                      <div key={addon.addon_id} className="flex justify-between items-start py-2">
                        <span className="text-gray-600 text-sm flex-1">{addon.addon_name}</span>
                        <span className="font-medium text-gray-900 ml-2">
                          RM{parseFloat(addon.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Venue Fee */}
                {selectedVenue && (
                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <div>
                      <span className="font-medium text-gray-700">{selectedVenue.addon_name}</span>
                      <span className="block text-xs text-gray-500 mt-1">Venue rental</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      +RM{parseFloat(selectedVenue.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-amber-600">
                    RM{totalPrice.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {selectedAddons.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">{selectedAddons.length} add-on service(s) selected</p>
                )}
              </div>

              <button
                onClick={handleGoToCheckout}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Book This Package
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Secure booking  No hidden fees
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
