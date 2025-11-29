'use client';

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const router = useRouter();
  const [thankYouData, setThankYouData] = useState(null);

  // Load data from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('thankYouData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setThankYouData(data);
        } catch (e) {
          console.error('Error parsing thankYouData from sessionStorage:', e);
        }
      }
    }
  }, []);

  const { 
    booking, 
    packageData, 
    providerData, 
    selectedAddons = [], 
    total, 
    preSelectedDate, 
    parlourData,
    bookingId,
    bookingReference,
    paymentMethod
  } = thankYouData || {};

  // Use bookingReference for display (e.g., "BK000001"), fallback to bookingId
  const displayOrderId = bookingReference || bookingId || 'Pending';

  // Redirect if no booking data
  useEffect(() => {
    if (thankYouData && (!booking || !packageData)) {
      const timer = setTimeout(() => {
        router.push("/order-services");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [booking, packageData, router, thankYouData]);

  if (!booking || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  // Group add-ons by category
  const groupedAddons = selectedAddons.reduce((acc, addon) => {
    const category = addon.category_name || "Other Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {});

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-xl mb-6">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-14 h-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900 mb-3"
          >
            Payment Successful!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-600"
          >
            Thank you for your booking. Your order has been confirmed.
          </motion.p>
        </motion.div>

        {/* Order ID Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Booking Reference:</span>
            <span className="text-lg font-bold text-indigo-600">{displayOrderId}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Next Steps Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">What Happens Next?</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                      <p className="text-sm">
                        <strong>{providerData?.company_name || providerData?.name || 'The service provider'}</strong> will contact you within <strong className="text-blue-700">1-2 working days</strong> to confirm your booking details.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                      <p className="text-sm">
                        The service provider will guide you through the funeral arrangements and answer any questions you may have.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                      <p className="text-sm">
                        A confirmation email with all booking details has been sent to <strong className="text-blue-700">{booking?.email}</strong>
                      </p>
                    </div>
                  </div>
                  
                  {providerData?.contact_number && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">For urgent inquiries, contact the provider directly:</p>
                      <a 
                        href={`tel:${providerData.contact_number}`}
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {providerData.contact_number}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900">{booking?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-700">{booking?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-700">{booking?.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date((preSelectedDate || booking?.date) + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service Provider</p>
                    <p className="font-semibold text-gray-900">{providerData?.company_name || providerData?.name || packageData?.provider_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Package Selected</p>
                    <p className="font-semibold text-gray-900">{packageData?.name}</p>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {booking?.requirements && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Special Requirements</p>
                  <p className="text-sm text-gray-700">{booking.requirements}</p>
                </div>
              )}
            </div>

            {/* Funeral Parlour Details */}
            {parlourData && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Funeral Parlour
                </h3>
                <div className={`p-4 rounded-xl border-2 ${
                  parlourData.choice === 'company' ? 'bg-purple-50 border-purple-300' : 'bg-blue-50 border-blue-300'
                }`}>
                  <p className="font-semibold text-gray-900 mb-1">
                    {parlourData.choice === 'company' ? 'Company Funeral Parlour' : 'Own Location'}
                  </p>
                  {parlourData.choice === 'company' ? (
                    <p className="text-sm text-gray-600">Professional venue with all facilities</p>
                  ) : (
                    parlourData.address && (
                      <p className="text-sm text-gray-600">{parlourData.address}</p>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-indigo-300 text-indigo-700 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Receipt
              </button>
              
              <button
                onClick={() => router.push("/orders")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-semibold shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                View My Orders
              </button>
            </div>
          </motion.div>

          {/* Sidebar - Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                {/* Package */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Base Package</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    RM {parseFloat(packageData?.price || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Add-ons */}
                {selectedAddons.length > 0 && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Add-ons ({selectedAddons.length})
                    </p>
                    <div className="space-y-2">
                      {Object.entries(groupedAddons).map(([category, addons]) => (
                        <div key={category}>
                          <p className="text-xs font-medium text-gray-500 mb-1">{category}</p>
                          {addons.map((addon, idx) => (
                            <div key={idx} className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{addon.addon_name || addon.name}</span>
                              <span className="font-medium text-gray-900">
                                +RM {parseFloat(addon.price || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parlour Fee */}
                {parlourData?.choice === 'company' && parlourData?.fee > 0 && (
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Company Parlour</span>
                      <span className="font-semibold text-purple-600">
                        +RM {parseFloat(parlourData.fee).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Paid</span>
                    <span className="text-2xl font-bold text-green-700">
                      RM {parseFloat(total || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Confirmation */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-green-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Payment Confirmed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Support Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <div className="inline-block bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@zenlink.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                support@zenlink.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
