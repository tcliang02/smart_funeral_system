'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProviderAvailabilityViewer from '../components/ProviderAvailabilityViewer';
import '../components/ProviderAvailabilityViewer.css';
import './ProviderAvailabilityPage.css';

const ProviderAvailabilityPage = ({ providerId }) => {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Read from sessionStorage instead of location.state
  const [fromPackageDetails, setFromPackageDetails] = useState(false);
  const [packageId, setPackageId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDateAvailable, setIsDateAvailable] = useState(true);
  
  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('availabilityData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setFromPackageDetails(data.fromPackageDetails || false);
          setPackageId(data.packageId || null);
          if (data.selectedDate) {
            setSelectedDate(new Date(data.selectedDate));
          }
        } catch (e) {
          console.error('Error parsing sessionStorage data:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Fetch provider details and packages
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        
        // Fetch provider details using getAllProviders and filter
        const providerResponse = await fetch(`/api/backend/getAllProviders?t=${timestamp}`);
        
        if (!providerResponse.ok) {
          throw new Error(`HTTP error! Status: ${providerResponse.status}`);
        }
        
        const providerData = await providerResponse.json();
        
        // Handle standardized API response format: { success: true, data: { providers: [...] } }
        const providersList = providerData.data?.providers || providerData.providers || [];
        
        if (providerData.success && providersList.length > 0) {
          const foundProvider = providersList.find(
            p => String(p.provider_id) === String(providerId)
          );
          
          if (foundProvider) {
            setProvider(foundProvider);
          } else {
            setError('Provider not found');
            setLoading(false);
            return;
          }
        } else {
          setError(providerData.message || 'Failed to load provider information');
          setLoading(false);
          return;
        }

        // Fetch packages for this provider using getAllPackages
        const packagesResponse = await fetch(`/api/backend/getAllPackages?t=${timestamp}`);
        const packagesData = await packagesResponse.json();
        
        // Handle standardized API response format: { success: true, data: { packages: [...] } }
        const packagesList = packagesData.data?.packages || packagesData.packages || [];
        
        if (packagesData.success && packagesList.length > 0) {
          // Filter packages for this provider
          const providerPackages = packagesList.filter(
            pkg => String(pkg.provider_id) === String(providerId)
          );
          setPackages(providerPackages);
        }
      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Could not load provider information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      fetchProviderData();
    } else {
      setError('No provider selected');
      setLoading(false);
    }
  }, [providerId]);

  // Navigate to package selection when user confirms
  const handleConfirmDate = () => {
    if (!selectedDate) {
      alert('Please select a date first.');
      return;
    }
    
    if (!provider) {
      alert('Provider information is missing. Please try again.');
      return;
    }
    
    // Check if the selected date is available
    if (!isDateAvailable) {
      alert('Cannot confirm unavailable date. Please select an available date.');
      return;
    }
    
    const formattedDate = selectedDate instanceof Date 
      ? selectedDate.toISOString().split('T')[0]
      : selectedDate;
    
    // If coming from PackageDetails, navigate back to PackageDetails with selected date
    if (fromPackageDetails && packageId) {
      // Store state in sessionStorage, preserving existing selections
      if (typeof window !== 'undefined') {
        // Get existing packageDetails to preserve add-ons, parlour, etc.
        const existingData = sessionStorage.getItem('packageDetails');
        let existingPackageDetails = {};
        if (existingData) {
          try {
            existingPackageDetails = JSON.parse(existingData);
          } catch (e) {
            console.error('Error parsing existing packageDetails', e);
          }
        }
        
        // Merge with new date, preserving all existing selections
        sessionStorage.setItem('packageDetails', JSON.stringify({
          ...existingPackageDetails,
          provider: provider || existingPackageDetails.provider,
          package: existingPackageDetails.package, // Preserve package data
          selectedDate: formattedDate,
          preSelectedDate: formattedDate,
          // Preserve existing selections if they exist
          selectedAddons: existingPackageDetails.selectedAddons || [],
          parlourChoice: existingPackageDetails.parlourChoice || 'own',
          parlourAddress: existingPackageDetails.parlourAddress || '',
          selectedVenue: existingPackageDetails.selectedVenue || null
        }));
      }
      router.push(`/package/${packageId}`);
    } else {
      // If no specific package, go back to Order Services with date pre-filled
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('orderServicesData', JSON.stringify({
          selectedDate: formattedDate,
          returnFromCalendar: true
        }));
      }
      router.push('/order-services');
    }
  };

  // Return to order services page
  const handleBackToList = () => {
    if (fromPackageDetails && packageId) {
      // Restore previous package details state if available
      router.push(`/package/${packageId}`);
    } else {
      router.push('/order-services');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading provider information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackToList} className="button">Back to {fromPackageDetails ? 'Package' : 'Providers'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container provider-availability-page">
      <div className="provider-header">
        <button onClick={handleBackToList} className="back-button">
          &larr; Back to {fromPackageDetails ? 'Package Details' : 'Order Services'}
        </button>
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{provider?.company_name || 'Provider'} - Check Availability</h1>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <p className="text-indigo-900 font-medium flex items-center justify-center gap-2">
              <span className="text-2xl">📅</span>
              <span>Select an available date from the calendar below to view packages</span>
            </p>
          </div>
        </div>
      </div>

      <div className="provider-details">
        <div className="provider-info bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📋</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">About this Provider</h3>
              <p className="text-gray-700 leading-relaxed">
                {provider?.description || 'Professional funeral service provider dedicated to supporting families during difficult times with compassionate care and comprehensive services.'}
              </p>
            </div>
          </div>
          
          {provider?.address && (
            <div className="mt-4 flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Location</p>
                <p className="text-sm text-gray-600">{provider.address}</p>
                {provider.city && <p className="text-sm text-gray-600">{provider.city}</p>}
                {provider.state && <p className="text-sm text-gray-600">{provider.state}</p>}
              </div>
            </div>
          )}

          {provider?.phone && (
            <div className="mt-2 flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <span className="text-xl">📞</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Contact</p>
                <p className="text-sm text-gray-600">{provider.phone}</p>
              </div>
            </div>
          )}
          
          {provider?.email && (
            <div className="mt-2 flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Email</p>
                <p className="text-sm text-gray-600">{provider.email}</p>
              </div>
            </div>
          )}

          {/* Show available packages count */}
          {packages.length > 0 && (
            <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-indigo-900 font-semibold">
                📦 {packages.length} package{packages.length !== 1 ? 's' : ''} available from this provider
              </p>
            </div>
          )}
        </div>

        {/* Right column - Calendar */}
        <div className="availability-section calendar-container">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Check Availability</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select an available date for your service. 
            <span className="block mt-2">
              <span className="inline-flex items-center gap-1 mr-4">
                <span className="inline-block w-3 h-3 bg-green-500 rounded"></span>
                <span>Available dates</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-red-500 rounded"></span>
                <span>Unavailable dates</span>
              </span>
            </span>
          </p>
          <ProviderAvailabilityViewer
            providerId={providerId}
            selectedDate={selectedDate}
            onDateSelect={(date, isAvailable) => {
              setSelectedDate(date);
              setIsDateAvailable(isAvailable !== false); // Default to true if not specified
            }}
          />
        </div>
      </div>

      {/* Date Confirmation Section - Centered */}
      <div className="max-w-4xl mx-auto">
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8 border-2 border-green-400">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className={`w-20 h-20 bg-gradient-to-br rounded-full flex items-center justify-center shadow-lg ${
                  isDateAvailable 
                    ? 'from-green-400 to-green-600' 
                    : 'from-red-400 to-red-600'
                }`}>
                  <span className="text-4xl text-white">{isDateAvailable ? '✓' : '⚠'}</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {isDateAvailable ? 'Date Selected!' : 'Date Not Available!'}
                </h3>
                <div className={`rounded-xl p-4 mb-4 border ${
                  isDateAvailable 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                }`}>
                  <p className={`text-sm font-semibold mb-2 ${
                    isDateAvailable ? 'text-green-700' : 'text-red-700'
                  }`}>
                    📅 Selected Date:
                  </p>
                  <p className={`text-3xl font-bold ${
                    isDateAvailable ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {selectedDate instanceof Date 
                      ? selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                    }
                  </p>
                  {!isDateAvailable && (
                    <p className="text-sm text-red-600 mt-2 font-semibold">
                      ⚠️ This date is marked as unavailable by the provider. Please select a different date.
                    </p>
                  )}
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 mb-4 border border-indigo-200">
                  <p className="text-gray-700">
                    <span className="font-bold text-indigo-600">{packages.length} package{packages.length !== 1 ? 's' : ''}</span> available from this provider
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all hover:border-gray-400"
                  >
                    ← Change Date
                  </button>
                  <button
                    onClick={handleConfirmDate}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {fromPackageDetails ? 'Confirm & Return to Package →' : 'Confirm & Search Packages →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProviderAvailabilityPage;
