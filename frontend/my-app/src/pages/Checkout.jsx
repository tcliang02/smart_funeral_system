'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BookingProgressBar from "../components/BookingProgressBar";
import { logger } from "@/lib/logger";

export default function Checkout() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [booking, setBooking] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    address: "",
    requirements: "",
    deceasedPhoto: null,
    deathCert: null,
    additionalDocs: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Load data from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('checkoutData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setCheckoutData(data);
          // Update booking date if preSelectedDate is available
          if (data.preSelectedDate) {
            setBooking(prev => ({ ...prev, date: data.preSelectedDate }));
          }
          logger.debug('Checkout page loaded', {
            package: data?.package,
            packageId: data?.package?.package_id,
            provider: data?.provider,
            selectedAddons: data?.selectedAddons,
            addonsCount: data?.selectedAddons?.length
          });
        } catch (e) {
          logger.error('Error parsing checkout data', { error: e.message });
        }
      } else {
        logger.warn('No checkout data found in sessionStorage');
      }
    }
  }, []);

  const packageData = checkoutData?.package || {};
  const providerData = checkoutData?.provider || {};
  const selectedAddons = checkoutData?.selectedAddons || [];
  const totalAmount = checkoutData?.total || 0;
  const preSelectedDate = checkoutData?.preSelectedDate || null; // Get pre-selected date
  const parlourData = checkoutData?.parlour || { choice: 'own', address: '', fee: 0 }; // Get parlour data

  // Update booking date when preSelectedDate becomes available
  useEffect(() => {
    if (preSelectedDate && !booking.date) {
      setBooking(prev => ({ ...prev, date: preSelectedDate }));
    }
  }, [preSelectedDate, booking.date]);

  logger.debug('Checkout data extracted', {
    packageId: packageData.package_id,
    packageName: packageData.name,
    preSelectedDate,
    parlourChoice: parlourData.choice,
    addonsCount: selectedAddons.length,
    totalAmount
  });

  // Show loading while data is being loaded from sessionStorage
  if (!checkoutData && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout data...</p>
        </div>
      </div>
    );
  }

  if (!packageData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Package Selected</h2>
            <p className="text-gray-600 mb-4">
              You cannot access this page directly. Please select a package first.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              How to Book a Package:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2 ml-6 list-decimal">
              <li>Go to <strong>Order Services</strong></li>
              <li>Browse and select a provider</li>
              <li>Choose a funeral package</li>
              <li>Select Buddhist add-ons (optional)</li>
              <li>Click <strong>"Book This Package"</strong></li>
            </ol>
          </div>

          <button
            onClick={() => router.push("/order-services")}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Browse Packages
          </button>

          <button
            onClick={() => router.back()}
            className="w-full mt-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Always calculate the total to ensure accuracy
  // Base package price
  const basePackagePrice = parseFloat(packageData.price || packageData.basePrice || 0);
  
  // Add-ons total
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0);
  
  // Parlour fee (if applicable)
  const parlourFee = (parlourData.choice === 'company' && parlourData.fee > 0) ? parseFloat(parlourData.fee || 0) : 0;
  
  // Calculate total: base package + add-ons + parlour fee
  const totalPrice = basePackagePrice + addonsTotal + parlourFee;

  // Group add-ons by category for better display
  const groupedAddons = selectedAddons.reduce((acc, addon) => {
    const category = addon.category_name || "Other Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {});

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (field === "additionalDocs") {
      setBooking({
        ...booking,
        additionalDocs: Array.from(e.target.files),
      });
    } else {
      setBooking({ ...booking, [field]: file });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Personal Information
        if (!booking.name.trim()) {
          newErrors.name = "Full name is required";
        } else if (booking.name.trim().length < 3) {
          newErrors.name = "Name must be at least 3 characters";
        }

        if (!booking.email.trim()) {
          newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) {
          newErrors.email = "Please enter a valid email address";
        }

        if (!booking.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^[0-9+\s-()]{8,}$/.test(booking.phone)) {
          newErrors.phone = "Please enter a valid phone number";
        }
        break;

      case 1: // Funeral Details
        if (!booking.date) {
          newErrors.date = "Service date is required";
        } else {
          const selectedDate = new Date(booking.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            newErrors.date = "Service date cannot be in the past";
          }
        }

        // Address validation removed - now handled in PackageDetails parlour section
        break;

      case 2: // Documents
        if (!booking.deceasedPhoto) {
          newErrors.deceasedPhoto = "Photo of the deceased is required";
        } else {
          const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
          if (!validImageTypes.includes(booking.deceasedPhoto.type)) {
            newErrors.deceasedPhoto = "Please upload a valid image file (JPG, JPEG, or PNG)";
          }
        }

        if (!booking.deathCert) {
          newErrors.deathCert = "Death certificate is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsUploading(true);
      
      // Prepare data for storage/upload
      let uploadedFilePaths = [];
      let bookingForStorage = { ...booking };
      
      // Upload files if present
      if (booking.deceasedPhoto || booking.deathCert || booking.additionalDocs?.length > 0) {
        try {
          const token = localStorage.getItem('token');
          // Note: We don't strictly require token here for checkout flow, 
          // but if protected, we should handle it. Assuming public upload or user is logged in.
          
          const formData = new FormData();
          let hasFiles = false;
          
          // Helper function to check if value is a valid File/Blob
          const isValidFile = (file) => {
            return file instanceof File || 
                   file instanceof Blob || 
                   (file && typeof file === 'object' && 'size' in file && 'type' in file);
          };
          
          if (booking.deceasedPhoto && isValidFile(booking.deceasedPhoto)) {
            formData.append('deceasedPhoto', booking.deceasedPhoto);
            hasFiles = true;
            logger.debug('Added deceasedPhoto to upload', { 
              name: booking.deceasedPhoto.name || 'unknown',
              size: booking.deceasedPhoto.size,
              type: booking.deceasedPhoto.type 
            });
          } else if (booking.deceasedPhoto) {
            logger.warn('deceasedPhoto is not a valid file object', { type: typeof booking.deceasedPhoto, value: booking.deceasedPhoto });
          }
          
          if (booking.deathCert && isValidFile(booking.deathCert)) {
            formData.append('deathCert', booking.deathCert);
            hasFiles = true;
            logger.debug('Added deathCert to upload', { 
              name: booking.deathCert.name || 'unknown',
              size: booking.deathCert.size,
              type: booking.deathCert.type 
            });
          } else if (booking.deathCert) {
            logger.warn('deathCert is not a valid file object', { type: typeof booking.deathCert, value: booking.deathCert });
          }
          
          if (booking.additionalDocs && Array.isArray(booking.additionalDocs) && booking.additionalDocs.length > 0) {
            booking.additionalDocs.forEach((doc, index) => {
              if (isValidFile(doc)) {
                formData.append(`additionalDoc_${index}`, doc);
                hasFiles = true;
                logger.debug(`Added additionalDoc_${index} to upload`, { 
                  name: doc.name || 'unknown',
                  size: doc.size,
                  type: doc.type 
                });
              } else {
                logger.warn(`additionalDoc_${index} is not a valid file object`, { type: typeof doc, value: doc });
              }
            });
          }
          
          if (hasFiles) {
            formData.append('booking_reference', 'TEMP_' + Date.now());
            
            const headers = {};
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            
            logger.debug('Uploading files in checkout...', { 
              fileCount: formData.getAll('deceasedPhoto').length + 
                        formData.getAll('deathCert').length + 
                        Array.from(formData.keys()).filter(k => k.startsWith('additionalDoc_')).length
            });
            
            const uploadResponse = await fetch('/api/backend/uploadFiles', {
              method: 'POST',
              headers,
              body: formData
            });
            
            // Check if response is OK before parsing JSON
            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              let errorData;
              try {
                errorData = JSON.parse(errorText);
              } catch (e) {
                errorData = { message: errorText || 'Unknown error occurred' };
              }
              logger.error('File upload HTTP error', { 
                status: uploadResponse.status, 
                statusText: uploadResponse.statusText,
                error: errorData 
              });
              alert(`Warning: File upload failed (${uploadResponse.status}): ${errorData.message || 'Server error'}. You can continue, but files may need to be re-sent.`);
            } else {
              const uploadResult = await uploadResponse.json();
              
              if (uploadResult && uploadResult.success) {
                uploadedFilePaths = uploadResult.files || [];
                logger.debug('Files uploaded successfully', { files: uploadedFilePaths });
                
                // Store paths in booking object for storage (replacing File objects)
                // We keep the original booking object in state for UI, but modify what goes to sessionStorage
                
                // NOTE: The backend returns a flat list. We can't easily map back to specific fields 
                // without more complex logic, but Payment.jsx mostly just needs the list of paths 
                // to send to createBooking.
                // We will store the list separately in sessionStorage.
                
              } else {
                // Handle failure case with better error message
                const errorMessage = uploadResult?.message || 
                                   uploadResult?.error || 
                                   (uploadResult?.errors && uploadResult.errors.length > 0 
                                     ? uploadResult.errors.join(', ') 
                                     : 'Unknown error');
                logger.error('File upload failed', { 
                  result: uploadResult,
                  message: errorMessage,
                  errors: uploadResult?.errors 
                });
                alert(`Warning: File upload failed: ${errorMessage}. You can continue, but files may need to be re-sent.`);
              }
            }
          } else {
            // No valid files found even though we expected some
            logger.warn('Expected files but none were valid File objects', {
              hasDeceasedPhoto: !!booking.deceasedPhoto,
              hasDeathCert: !!booking.deathCert,
              additionalDocsCount: booking.additionalDocs?.length || 0
            });
          }
        } catch (error) {
          logger.error('Error uploading files', { 
            error: error.message, 
            stack: error.stack,
            name: error.name 
          });
          alert(`Warning: Could not upload files: ${error.message || 'Unknown error'}. Please contact support if this persists.`);
        }
      } else {
        logger.debug('No files to upload', {
          hasDeceasedPhoto: !!booking.deceasedPhoto,
          hasDeathCert: !!booking.deathCert,
          additionalDocsCount: booking.additionalDocs?.length || 0
        });
      }

      logger.debug('Navigating to payment', {
        packageId: packageData.package_id,
        providerId: providerData.provider_id,
        addonsCount: selectedAddons.length,
        total: totalPrice,
        parlourChoice: parlourData.choice,
        serviceDate: preSelectedDate,
        uploadedFilesCount: uploadedFilePaths.length
      });

      // Store payment data in sessionStorage (Next.js doesn't support state like React Router)
      if (typeof window !== 'undefined') {
        // Create a safe version of booking that doesn't contain non-serializable File objects
        // We replace them with placeholders or null, as we have the uploaded paths now
        const safeBooking = {
          ...booking,
          deceasedPhoto: booking.deceasedPhoto ? { name: booking.deceasedPhoto.name, type: 'uploaded' } : null,
          deathCert: booking.deathCert ? { name: booking.deathCert.name, type: 'uploaded' } : null,
          additionalDocs: booking.additionalDocs.map(f => ({ name: f.name, type: 'uploaded' }))
        };

        sessionStorage.setItem('paymentData', JSON.stringify({
          booking: safeBooking,
          uploadedFiles: uploadedFilePaths, // ✅ Pass the uploaded paths
          packageData,
          providerData,
          selectedAddons,  // ✅ Pass add-ons
          total: totalPrice,
          parlourData,  // ✅ Pass parlour data  
          preSelectedDate  // ✅ Pass selected date
        }));
      }

      setIsUploading(false);
      router.push("/payment");
    }
  };

  const steps = ["Personal Info", "Service Details", "Documents"];

  return (
    <main className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Booking Progress Bar */}
      <div className="mb-8">
        <BookingProgressBar
          currentStep={2}
          steps={['Select Package', 'Add-ons & Details', 'Checkout & Payment']}
        />
      </div>

      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          ← Back to Package
        </button>

        {/* Booking Summary Banner */}
        {selectedAddons.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-8 h-8 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Buddhist Funeral Service Package
                </h3>
                <p className="text-sm text-gray-700">
                  You've selected <span className="font-semibold text-amber-700">{selectedAddons.length} Buddhist ceremony add-on{selectedAddons.length > 1 ? 's' : ''}</span> for this service.
                  Please complete the booking information below.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600 mb-6">Please fill in all required information to finalize your reservation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Step 0: Personal Information */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-gray-600">Please provide your contact details for the booking</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        type="text"
                        placeholder="Enter your full name"
                        value={booking.name}
                        onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        type="email"
                        placeholder="johndoe@email.com"
                        value={booking.email}
                        onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      type="tel"
                      placeholder="+60 12-345 6789"
                      value={booking.phone}
                      onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Service Details */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Details</h2>
                    <p className="text-gray-600">Provide details about the funeral service</p>
                  </div>

                  {/* Service Date - Read-only Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Service Date
                    </label>

                    {(booking.date || preSelectedDate) ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-900 mb-1">Confirmed Service Date:</p>
                            <p className="text-2xl font-bold text-green-900">
                              {new Date((booking.date || preSelectedDate) + 'T12:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Date selected from availability calendar
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-xs text-green-800 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                            Need to change the date? Go back to <strong>Add-ons & Details</strong> page
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                          <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-yellow-900">No date selected</p>
                            <p className="text-sm text-yellow-700 mt-1">Please go back to package details to select a service date</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      type="hidden"
                      value={booking.date || preSelectedDate || ''}
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.date}
                    </p>}
                  </div>

                  {/* Funeral Parlour Information - Read-only Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Funeral Parlour
                    </label>
                    <div className={`rounded-xl p-6 border-2 ${parlourData.choice === 'company'
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-blue-50 border-blue-300'
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${parlourData.choice === 'company' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {parlourData.choice === 'company' ? 'Company Parlour' : 'Own Location'}
                          </h4>
                          {parlourData.choice === 'company' ? (
                            <div>
                              <p className="text-sm text-gray-700 mb-2">Professional funeral venue with all facilities</p>
                              <div className="bg-white bg-opacity-50 rounded-lg p-3 text-sm">
                                <p className="font-medium text-gray-900">
                                  Additional Fee: RM{parlourData.fee?.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-700 mb-2">Service at your own venue</p>
                              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-600 mb-1">Service Address:</p>
                                <p className="text-sm text-gray-900">{parlourData.address || 'Address not provided'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                          </svg>
                          To change parlour selection, please go back to Add-ons & Details page
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Any special requests, religious rites, flower preferences, etc."
                      value={booking.requirements}
                      onChange={(e) => setBooking({ ...booking, requirements: e.target.value })}
                      rows="4"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Required Documents</h2>
                    <p className="text-gray-600">Please upload the necessary documentation</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Photo of the Deceased *</label>
                      <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${booking.deceasedPhoto
                          ? 'border-green-400 bg-green-50'
                          : errors.deceasedPhoto
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-300 hover:border-indigo-400'
                        }`}>
                        <input
                          className="w-full"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'deceasedPhoto')}
                        />
                        {booking.deceasedPhoto ? (
                          <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {booking.deceasedPhoto.name}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2">JPG, PNG, or JPEG format (Max 5MB)</p>
                        )}
                      </div>
                      {errors.deceasedPhoto && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.deceasedPhoto}
                      </p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Death Certificate *</label>
                      <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${booking.deathCert
                          ? 'border-green-400 bg-green-50'
                          : errors.deathCert
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-300 hover:border-indigo-400'
                        }`}>
                        <input
                          className="w-full"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'deathCert')}
                        />
                        {booking.deathCert ? (
                          <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {booking.deathCert.name}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG, or JPEG format (Max 10MB)</p>
                        )}
                      </div>
                      {errors.deathCert && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.deathCert}
                      </p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Documents (Optional)</label>
                      <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${booking.additionalDocs.length > 0
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 hover:border-indigo-400'
                        }`}>
                        <input
                          className="w-full"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'additionalDocs')}
                        />
                        {booking.additionalDocs.length > 0 ? (
                          <div className="mt-3 space-y-1">
                            {booking.additionalDocs.map((file, idx) => (
                              <p key={idx} className="text-sm text-green-700 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {file.name}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2">Any additional documentation (multiple files allowed, max 5MB each)</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}

                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors ml-auto"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg ml-auto disabled:bg-indigo-400 flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading Files...
                      </>
                    ) : (
                      'Proceed to Payment →'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Order Summary Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {/* Provider & Package Info */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{providerData.company_name || providerData.name || packageData.provider || 'Service Provider'}</h3>
                    <p className="text-sm text-gray-600">{packageData.name}</p>
                  </div>
                </div>

                {/* Provider Details */}
                <div className="space-y-2 pt-3 border-t border-indigo-200">
                  {/* Full Address */}
                  {providerData.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">
                        {providerData.address}
                        {providerData.city && `, ${providerData.city}`}
                        {providerData.state && `, ${providerData.state}`}
                        {providerData.postal_code && ` ${providerData.postal_code}`}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  {(providerData.phone || providerData.contact_number) && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{providerData.phone || providerData.contact_number}</span>
                    </div>
                  )}

                  {/* Website */}
                  {providerData.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={providerData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}

                  {/* Social Media */}
                  {(providerData.facebook_url || providerData.instagram_url) && (
                    <div className="flex items-center gap-3 pt-2">
                      {providerData.facebook_url && (
                        <a
                          href={providerData.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </a>
                      )}
                      {providerData.instagram_url && (
                        <a
                          href={providerData.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-pink-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          Instagram
                        </a>
                      )}
                    </div>
                  )}

                  {/* About/Description */}
                  {providerData.description && (
                    <div className="pt-2 border-t border-indigo-200">
                      <p className="text-xs font-semibold text-gray-900 mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">{providerData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Booking Details
                </h4>

                {/* Service Date */}
                {(booking.date || preSelectedDate) && (
                  <div className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-0">
                    <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-0.5">Service Date</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {new Date((booking.date || preSelectedDate) + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Provider Contact */}
                {providerData.contact_number && (
                  <div className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-0">
                    <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-0.5">Provider Contact</p>
                      <p className="font-semibold text-gray-900 text-sm">{providerData.contact_number}</p>
                    </div>
                  </div>
                )}

                {/* Service Location (if entered) */}
                {booking.address && (
                  <div className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-0">
                    <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-0.5">Service Address</p>
                      <p className="font-medium text-gray-900 text-sm">{booking.address}</p>
                    </div>
                  </div>
                )}

                {/* Package Type */}
                {packageData.religion && (
                  <div className="flex items-start gap-3 py-2">
                    <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-0.5">Ceremony Type</p>
                      <p className="font-semibold text-gray-900 text-sm">{packageData.religion} Service</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Base Package</span>
                  <span className="font-semibold text-gray-900">
                    RM{parseFloat(packageData.price || packageData.basePrice || 0).toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>

                {/* Buddhist Add-ons by Category */}
                {selectedAddons.length > 0 && (
                  <div className="space-y-3 border-t border-gray-200 pt-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Buddhist Ceremony Add-ons
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {selectedAddons.length}
                      </span>
                    </h4>

                    {Object.entries(groupedAddons).map(([category, addons]) => (
                      <div key={category} className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <p className="text-xs font-medium text-amber-900 mb-2 uppercase tracking-wide">
                          {category}
                        </p>
                        <div className="space-y-2">
                          {addons.map((addon, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                              <span className="text-gray-700 flex-1 flex items-start gap-1.5">
                                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {addon.addon_name || addon.name}
                              </span>
                              <span className="font-semibold text-gray-900 ml-2 whitespace-nowrap">
                                RM{parseFloat(addon.price).toLocaleString('en-MY', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add-ons Subtotal */}
                    <div className="flex justify-between items-center text-sm font-medium text-amber-900 bg-amber-100 px-3 py-2 rounded-lg">
                      <span>Add-ons Subtotal:</span>
                      <span>
                        RM{selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0).toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Funeral Parlour Fee */}
                {parlourData.choice === 'company' && parlourData.fee > 0 && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Company Parlour
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">Professional venue with facilities</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        +RM{parseFloat(parlourData.fee).toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-indigo-600">
                      RM{totalPrice.toLocaleString('en-MY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                    {selectedAddons.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Includes {selectedAddons.length} add-on service{selectedAddons.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure booking process</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 customer support</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Flexible payment options</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Compassionate service guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
