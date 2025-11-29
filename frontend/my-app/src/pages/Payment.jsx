'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BookingProgressBar from "../components/BookingProgressBar";

export default function Payment() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedEwallet, setSelectedEwallet] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Load data from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('paymentData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setPaymentData(data);
          console.log("=== PAYMENT PAGE LOADED ===");
          console.log("🔍 paymentData from sessionStorage:", data);
          console.log("🔍 paymentData?.packageData:", data?.packageData);
          console.log("🔍 paymentData?.packageData?.package_id:", data?.packageData?.package_id);
          console.log("🔍 paymentData?.selectedAddons:", data?.selectedAddons);
          console.log("🔍 paymentData?.selectedAddons length:", data?.selectedAddons?.length);
        } catch (e) {
          console.error('Error parsing paymentData from sessionStorage:', e);
        }
      } else {
        console.warn("No paymentData found in sessionStorage");
      }
    }
  }, []);

  const { booking, packageData, providerData, selectedAddons = [], total, preSelectedDate, parlourData, uploadedFiles } = paymentData || {};
  
  console.log("🔍 Extracted packageData:", packageData);
  console.log("🔍 packageData.package_id:", packageData?.package_id);
  console.log("🔍 Extracted selectedAddons:", selectedAddons);
  console.log("🔍 selectedAddons length:", selectedAddons.length);
  console.log("🔍 selectedAddons details:", JSON.stringify(selectedAddons, null, 2));

  // Show loading while data is being loaded from sessionStorage
  if (!paymentData && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  // Check if we have required data
  if (!booking || !packageData || !providerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Booking Details Found</h2>
            <p className="text-gray-600 mb-4">
              Payment cannot proceed without booking information
            </p>
          </div>
          <button onClick={() => router.push("/order-services")} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
            Browse Packages
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = total || 0;

  // Group add-ons by category
  const groupedAddons = selectedAddons.reduce((acc, addon) => {
    const category = addon.category_name || "Other Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {});

  const validatePayment = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (!cardDetails.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }
      if (!cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        newErrors.expiryDate = "Please enter expiry date in MM/YY format";
      }
      if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = "Please enter a valid CVV";
      }
    } else if (paymentMethod === 'bank') {
      if (!selectedBank) {
        newErrors.bank = "Please select a bank";
      }
    } else if (paymentMethod === 'ewallet') {
      if (!selectedEwallet) {
        newErrors.ewallet = "Please select an e-wallet";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardDetails({ ...cardDetails, cardNumber: value });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setCardDetails({ ...cardDetails, expiryDate: value });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to complete the booking. Please login and try again.');
        router.push('/login');
        setIsProcessing(false);
        return;
      }

      // Step 1: Upload files if any
      // Use pre-uploaded files from checkout step if available
      let uploadedFilePaths = uploadedFiles || [];
      
      // Only attempt upload if we don't have paths yet and have files to upload
      // (This is a fallback/legacy path, primarily used if files weren't uploaded in checkout)
      if (uploadedFilePaths.length === 0 && (booking.deceasedPhoto || booking.deathCert || booking.additionalDocs?.length > 0)) {
        console.log('📤 Checking for files to upload...');
        
        const formData = new FormData();
        let fileCount = 0;
        
        // Helper function to check if value is a valid File/Blob
        const isValidFile = (value) => {
          return value instanceof File || value instanceof Blob;
        };

        // Add deceased photo
        if (booking.deceasedPhoto) {
          console.log('  → Deceased photo type:', typeof booking.deceasedPhoto, booking.deceasedPhoto instanceof File ? 'File' : booking.deceasedPhoto instanceof Blob ? 'Blob' : 'Other', booking.deceasedPhoto);
          
          if (isValidFile(booking.deceasedPhoto)) {
            formData.append('deceasedPhoto', booking.deceasedPhoto, booking.deceasedPhoto.name || 'deceasedPhoto.jpg');
            console.log('  → Added deceased photo:', booking.deceasedPhoto.name || 'unnamed');
            fileCount++;
          } else {
            console.log('  → Skipping deceased photo - not a valid File/Blob (likely placeholder or already uploaded):', typeof booking.deceasedPhoto);
          }
        }
        
        // Add death certificate
        if (booking.deathCert) {
          console.log('  → Death cert type:', typeof booking.deathCert, booking.deathCert instanceof File ? 'File' : booking.deathCert instanceof Blob ? 'Blob' : 'Other', booking.deathCert);
          
          if (isValidFile(booking.deathCert)) {
            formData.append('deathCert', booking.deathCert, booking.deathCert.name || 'deathCert.pdf');
            console.log('  → Added death certificate:', booking.deathCert.name || 'unnamed');
            fileCount++;
          } else {
            console.log('  → Skipping death certificate - not a valid File/Blob:', typeof booking.deathCert);
          }
        }
        
        // Add additional documents
        if (booking.additionalDocs && booking.additionalDocs.length > 0) {
          booking.additionalDocs.forEach((doc, index) => {
            console.log(`  → Additional doc ${index + 1} type:`, typeof doc, doc instanceof File ? 'File' : doc instanceof Blob ? 'Blob' : 'Other', doc);
            
            if (isValidFile(doc)) {
              formData.append(`additionalDoc_${index}`, doc, doc.name || `additionalDoc_${index}.pdf`);
              console.log(`  → Added additional doc ${index + 1}:`, doc.name || 'unnamed');
              fileCount++;
            } else {
              console.log(`  → Skipping additional doc ${index + 1} - not a valid File/Blob:`, typeof doc);
            }
          });
        }
        
        if (fileCount > 0) {
          // Add temporary booking reference for file naming
          formData.append('booking_reference', 'TEMP_' + Date.now());
          
          // Debug: Log FormData contents before sending
          console.log('📋 FormData contents before send:');
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else if (value instanceof Blob) {
              console.log(`  - ${key}: Blob(${value.size} bytes, ${value.type})`);
            } else {
              console.log(`  - ${key}: ${typeof value} = ${String(value).substring(0, 50)}`);
            }
          }
          
          try {
            const uploadResponse = await fetch('/api/backend/uploadFiles', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type for FormData - browser will set it with boundary
              },
              body: formData
            });
            
            // Check if response is OK before parsing JSON
            if (!uploadResponse.ok) {
              let errorMessage = `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`;
              try {
                const errorData = await uploadResponse.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
              } catch (e) {
                // If JSON parsing fails, use the status text
              }
              throw new Error(errorMessage);
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('📤 Upload result:', uploadResult);
            
            if (uploadResult.success) {
              uploadedFilePaths = uploadResult.files;
              console.log('✅ Files uploaded successfully:', uploadedFilePaths);
            } else {
              const errorDetails = uploadResult.errors && uploadResult.errors.length > 0 
                ? `\n\nErrors:\n${uploadResult.errors.join('\n')}`
                : '';
              console.error('❌ File upload failed:', uploadResult.message, uploadResult);
              alert(`⚠️ Warning: File upload failed: ${uploadResult.message}${errorDetails}\n\nBooking will continue without files.`);
            }
          } catch (uploadError) {
            console.error('❌ File upload error:', uploadError);
            const errorMsg = uploadError.message || 'Could not upload files';
            alert(`⚠️ Warning: File upload failed (${errorMsg}). You can continue, but files may need to be re-sent.`);
          }
        } else {
          console.log("ℹ️ No new files to upload (using pre-uploaded files or none found).");
        }
      }

      // Step 2: Get logged-in user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const userId = currentUser?.user_id || currentUser?.id || null;

      // Step 3: Prepare booking data matching database schema
      console.log('📊 DEBUG - selectedAddons before mapping:', selectedAddons);
      
      // Get and validate service_date
      let serviceDateValue = preSelectedDate || booking?.date || '';
      
      // Ensure service_date is in YYYY-MM-DD format
      if (serviceDateValue) {
        // If it's a Date object, convert to string
        if (serviceDateValue instanceof Date) {
          serviceDateValue = serviceDateValue.toISOString().split('T')[0];
        } else if (typeof serviceDateValue === 'string') {
          // If it's already in YYYY-MM-DD format, use it
          if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDateValue)) {
            // Try to parse and format
            const parsedDate = new Date(serviceDateValue);
            if (!isNaN(parsedDate.getTime())) {
              serviceDateValue = parsedDate.toISOString().split('T')[0];
            } else {
              serviceDateValue = '';
            }
          }
        }
      }
      
      // Validate service_date is not empty
      if (!serviceDateValue || serviceDateValue.trim() === '') {
        console.error('❌ ERROR: service_date is empty!', {
          preSelectedDate,
          'booking?.date': booking?.date,
          serviceDateValue
        });
        alert('❌ Error: Service date is missing. Please go back and select a service date.');
        setIsProcessing(false);
        return;
      }
      
      const bookingData = {
        package_id: packageData?.package_id || packageData?.id,
        user_id: userId,  // Link booking to logged-in user
        customer_name: booking?.name || '',
        customer_email: booking?.email || '',
        customer_phone: booking?.phone || '',
        service_date: serviceDateValue, // Starting service date (YYYY-MM-DD format)
        service_time: booking?.service_time || null, // Optional time
        service_address: parlourData 
          ? `${parlourData.name}\n${parlourData.address}\nCost: RM ${parlourData.fee.toFixed(2)}`
          : booking?.address || '',
        special_requirements: booking?.requirements || '',
        total_amount: totalPrice,
        payment_method: paymentMethod,  // Save payment method to database
        uploaded_files: uploadedFilePaths.length > 0 ? uploadedFilePaths : null,  // Include uploaded file paths
        resources: booking?.resources || [], // Resource selection (optional)
        // Note: Multi-day dates are handled via addons, not separate date selection
        selected_addons: selectedAddons.map(addon => ({
          addon_id: addon.addon_id || null, // ✅ Required for inventory tracking
          addon_name: addon.addon_name || addon.name,  // Fix: Use addon_name from backend API
          price: parseFloat(addon.price),  // Match API expectation: 'price' not 'addon_price'
          quantity: addon.quantity || 1, // ✅ Quantity support (default to 1)
          category_name: addon.category_name || 'Other Services'  // Include category for proper grouping
        }))
      };

      console.log('📦 Submitting booking to database:', bookingData);
      console.log('📅 Service Date (formatted):', bookingData.service_date);
      console.log('📊 Add-ons count:', bookingData.selected_addons?.length || 0);
      console.log('📊 Add-ons data:', bookingData.selected_addons);

      // Validate package_id before sending
      if (!bookingData.package_id) {
        alert('❌ Error: Package ID is missing. Please go back and select a package again.');
        setIsProcessing(false);
        return;
      }
      
      // Double-check service_date before sending
      if (!bookingData.service_date || bookingData.service_date.trim() === '') {
        alert('❌ Error: Service date is missing. Please go back and select a service date.');
        setIsProcessing(false);
        return;
      }

      // Call Next.js API route: /api/backend/createBooking
      const response = await fetch('/api/backend/createBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      console.log('Booking API response:', result);

      if (result.success) {
        // Use provider info from API response if providerData is missing
        const finalProviderData = providerData || {
          company_name: result.provider_name,
          name: result.provider_name,
          phone: result.provider_phone,
          contact_number: result.provider_phone,
          email: result.provider_email
        };

        // Store thank you page data in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('thankYouData', JSON.stringify({ 
            booking, 
            packageData, 
            providerData: finalProviderData, 
            selectedAddons,
            total: totalPrice,
            preSelectedDate,
            parlourData,
            bookingId: result.booking_id,  // Real database ID
            bookingReference: result.booking_reference,  // e.g., "BK000001"
            paymentMethod: paymentMethod
          }));
        }
        
        // Success! Navigate to thank you page
        router.push("/thankyou");
      } else {
        // Handle error
        console.error('Booking creation failed:', result.message);
        alert(`Booking failed: ${result.message || 'Unknown error'}. Please try again.`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while processing your booking. Please try again.');
      setIsProcessing(false);
    }
  };

  const banks = [
    { id: 'maybank', name: 'Maybank' },
    { id: 'cimb', name: 'CIMB Bank' },
    { id: 'publicbank', name: 'Public Bank' },
    { id: 'rhb', name: 'RHB Bank' },
    { id: 'hongleong', name: 'Hong Leong Bank' },
    { id: 'ambank', name: 'AmBank' }
  ];

  const ewallets = [
    { id: 'tng', name: 'Touch \'n Go eWallet' },
    { id: 'grabpay', name: 'GrabPay' },
    { id: 'boost', name: 'Boost' },
    { id: 'shopeepay', name: 'ShopeePay' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <BookingProgressBar 
            currentStep={3} 
            steps={['Select Package', 'Add-ons & Details', 'Checkout & Payment']} 
          />
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Checkout
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Payment Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
                <p className="text-gray-600">Secure payment processing for your funeral service booking</p>
              </div>

              <form onSubmit={handlePayment}>
                {/* Payment Method Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Payment Method
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card Payment */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                      </div>
                    </button>

                    {/* Online Banking */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Online Banking</span>
                      </div>
                    </button>

                    {/* E-Wallet */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ewallet')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        paymentMethod === 'ewallet'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-gray-900">E-Wallet</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 mb-6 text-white">
                      <div className="mb-6">
                        <svg className="w-12 h-10" fill="none" viewBox="0 0 48 32">
                          <rect width="48" height="32" rx="4" fill="white" fillOpacity="0.2"/>
                          <rect x="4" y="12" width="40" height="4" fill="white" fillOpacity="0.5"/>
                        </svg>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm opacity-80 mb-1">Card Number</p>
                        <p className="text-2xl tracking-wider font-mono">
                          {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm opacity-80 mb-1">Cardholder Name</p>
                          <p className="font-medium">{cardDetails.cardName || 'YOUR NAME'}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-80 mb-1">Expires</p>
                          <p className="font-medium">{cardDetails.expiryDate || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardName}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value.toUpperCase() })}
                          placeholder="JOHN DOE"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.cardName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cardName && (
                          <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setCardDetails({ ...cardDetails, cvv: value });
                            }
                          }}
                          placeholder="123"
                          maxLength={4}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === 'bank' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Your Bank *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            selectedBank === bank.id
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium text-gray-900">{bank.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.bank && (
                      <p className="mt-2 text-sm text-red-600">{errors.bank}</p>
                    )}
                  </motion.div>
                )}

                {/* E-Wallet */}
                {paymentMethod === 'ewallet' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select E-Wallet *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ewallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => setSelectedEwallet(wallet.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            selectedEwallet === wallet.id
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium text-gray-900">{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.ewallet && (
                      <p className="mt-2 text-sm text-red-600">{errors.ewallet}</p>
                    )}
                  </motion.div>
                )}

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Secure Payment</h4>
                      <p className="text-sm text-blue-700">
                        Your payment information is encrypted and secure. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pay RM {totalPrice.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h3>

              {/* Package Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{packageData.name}</p>
                    <p className="text-sm text-gray-600">{providerData.name}</p>
                    <p className="text-lg font-bold text-indigo-600 mt-2">
                      RM {packageData.price?.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Funeral Parlour */}
              {parlourData && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Funeral Parlour</p>
                      <p className="font-semibold text-gray-900">
                        {parlourData.choice === 'company' ? 'Company Funeral Parlour' : 'Own Location'}
                      </p>
                      {parlourData.choice === 'company' && (
                        <p className="text-sm font-semibold text-purple-600 mt-2">
                          +RM 500.00
                        </p>
                      )}
                      {parlourData.choice === 'own' && parlourData.address && (
                        <p className="text-sm text-gray-600 mt-1">{parlourData.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Add-ons */}
              {selectedAddons.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Selected Add-ons ({selectedAddons.length})
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(groupedAddons).map(([category, addons]) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-gray-500 mb-2">{category}</p>
                        {addons.map((addon, index) => (
                          <div key={addon.addon_id || `addon-${index}`} className="flex justify-between items-start text-sm mb-2">
                            <span className="text-gray-700">{addon.addon_name || addon.name}</span>
                            <span className="font-semibold text-gray-900 ml-2">
                              +RM {parseFloat(addon.price || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Date */}
              {(preSelectedDate || booking?.date) && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Service Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(preSelectedDate || booking.date).toLocaleDateString('en-MY', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold">
                      RM {totalPrice.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
