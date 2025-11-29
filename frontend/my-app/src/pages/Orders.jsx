'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Orders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewCategory, setReviewCategory] = useState("quality");
  const [submittingRating, setSubmittingRating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      
      const currentUser = JSON.parse(localStorage.getItem("user"));
      
      // Support both 'id' and 'user_id' field names
      const userId = currentUser?.user_id || currentUser?.id;
      
      if (!currentUser || !userId) {
        setError("Please login to view your bookings");
        setLoading(false);
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Please login to view your bookings");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/backend/getUserBookings?user_id=${userId}`, {
        headers: { 
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      console.log("Fetched bookings:", result);
      
      // Handle standardized API response format: { success: true, data: { bookings: [...] } }
      const bookingsList = result.data?.bookings || result.bookings || [];
      
      // Debug specific booking
      if (bookingsList.length > 0) {
        bookingsList.forEach(booking => {
          console.log(`Booking ${booking.booking_reference}:`, {
            addons: booking.addons,
            addons_count: booking.addons?.length || 0,
            uploaded_files: booking.uploaded_files,
            uploaded_files_type: typeof booking.uploaded_files
          });
        });
      }

      if (result.success) {
        setBookings(bookingsList);
      } else {
        setError(result.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("An error occurred while fetching your bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    setCancellingBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancellingBooking) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      
      // Support both 'id' and 'user_id' field names
      const userId = currentUser?.user_id || currentUser?.id;
      
      if (!userId) {
        alert("Error: User ID not found. Please login again.");
        return;
      }

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to cancel bookings');
        return;
      }

      const response = await fetch('/api/backend/cancelBooking', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: cancellingBooking.booking_id,
          user_id: userId,
          cancellation_reason: cancellationReason || 'Customer requested cancellation'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Access refund data from result.data (API wraps response in data object)
        const refundData = result.data || result;
        const refundAmount = refundData.refund_amount || 0;
        const refundPercentage = refundData.refund_percentage || 0;
        
        const refundMessage = refundAmount > 0
          ? `\n\nRefund Amount: RM ${refundAmount.toFixed(2)} (${refundPercentage}%)`
          : `\n\nRefund processing will be initiated.`;
        
        alert(`Booking cancelled successfully!${refundMessage}\n\nThe service provider has been notified.`);
        fetchUserBookings(); // Refresh bookings
        setShowCancelModal(false);
        setCancellationReason("");
        setCancellingBooking(null);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("An error occurred while cancelling the booking");
    }
  };

  const handlePrintReceipt = (booking) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Receipt - ${booking.booking_reference}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4f46e5;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header h2 {
            color: #6b7280;
            font-size: 18px;
            font-weight: normal;
          }
          .section {
            margin-bottom: 25px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4f46e5;
          }
          .section h3 {
            color: #4f46e5;
            font-size: 16px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .field {
            display: flex;
            flex-direction: column;
          }
          .field label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .field span {
            color: #111827;
            font-size: 14px;
          }
          .addons-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .addons-table th,
          .addons-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .addons-table th {
            background: #4f46e5;
            color: white;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .addons-table td {
            font-size: 14px;
          }
          .total-section {
            background: #4f46e5;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          }
          .total-section h3 {
            color: white;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .total-amount {
            font-size: 32px;
            font-weight: bold;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-confirmed { background: #d1fae5; color: #059669; }
          .status-completed { background: #dbeafe; color: #2563eb; }
          .status-cancelled { background: #fee2e2; color: #dc2626; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .header h1 { font-size: 24px; }
            .total-amount { font-size: 28px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>My Orders - ZENLINK</h1>
          <h2>Booking Receipt</h2>
        </div>

        <div class="section">
          <h3>?? Booking Information</h3>
          <div class="grid">
            <div class="field">
              <label>Booking Reference</label>
              <span>${booking.booking_reference}</span>
            </div>
            <div class="field">
              <label>Status</label>
              <span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span>
            </div>
            <div class="field">
              <label>Service Date</label>
              <span>${new Date(booking.service_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}</span>
            </div>
            <div class="field">
              <label>Service Time</label>
              <span>${booking.service_time || "TBD"}</span>
            </div>
          </div>
          <div style="margin-top: 15px;">
            <div class="field">
              <label>Service Address</label>
              <span>${booking.service_address}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>?? Customer Information</h3>
          <div class="grid">
            <div class="field">
              <label>Full Name</label>
              <span>${booking.customer_name}</span>
            </div>
            <div class="field">
              <label>Phone Number</label>
              <span>${booking.customer_phone}</span>
            </div>
            <div class="field">
              <label>Email Address</label>
              <span>${booking.customer_email}</span>
            </div>
            <div class="field">
              <label>Package Selected</label>
              <span>${booking.package_name}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>?? Payment Details</h3>
          <div class="grid">
            <div class="field">
              <label>Package Price</label>
              <span>RM ${parseFloat(booking.package_price).toLocaleString("en-MY", { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="field">
              <label>Payment Method</label>
              <span>${booking.payment_method ? booking.payment_method.replace('_', ' ').toUpperCase() : 'Not specified'}</span>
            </div>
          </div>
        </div>

        ${booking.addons && booking.addons.length > 0 ? `
        <div class="section">
          <h3>?? Buddhist Ceremony Add-ons</h3>
          <table class="addons-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${booking.addons.map(addon => `
                <tr>
                  <td>${addon.name}</td>
                  <td>${addon.category || 'Other Services'}</td>
                  <td>RM ${parseFloat(addon.price).toLocaleString("en-MY", { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 15px; font-weight: 600;">
            Add-ons Subtotal: RM ${booking.addons.reduce((sum, addon) => sum + parseFloat(addon.price), 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
          </div>
        </div>
        ` : ''}

        <div class="total-section">
          <h3>Total Amount</h3>
          <div class="total-amount">RM ${parseFloat(booking.total_amount).toLocaleString("en-MY", { minimumFractionDigits: 2 })}</div>
        </div>

        ${booking.special_requirements ? `
        <div class="section">
          <h3>?? Special Requirements</h3>
          <p style="font-style: italic; color: #6b7280;">${booking.special_requirements}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Generated on: ${new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long", 
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}</p>
          <p style="margin-top: 10px;">ZENLINK - Serving with Compassion and Respect</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleRateService = (booking) => {
    setRatingBooking(booking);
    setShowRatingModal(true);
    setRating(booking.submitted_rating || 0);
    setReviewText(booking.submitted_review || "");
    setReviewCategory(booking.submitted_category || "quality");
  };

  const handleSubmitRating = async () => {
    if (!ratingBooking || rating === 0) return;

    try {
      setSubmittingRating(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const userId = currentUser?.user_id || currentUser?.id;

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to submit ratings');
        return;
      }

      const response = await fetch('/api/backend/submitRating', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: ratingBooking.booking_id,
          rating,
          review_text: reviewText.trim(),
          review_category: reviewCategory,
          reviewer_user_id: userId,
          review_type: 'customer_to_provider'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`? Thank you! Your ${rating}-star rating has been submitted successfully.`);
        setShowRatingModal(false);
        setRating(0);
        setReviewText("");
        setReviewCategory("quality");
        setRatingBooking(null);
        fetchUserBookings(); // Refresh bookings
      } else {
        alert(`? Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("? An error occurred while submitting your rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const StarRating = ({ value, onChange, readonly = false }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= value;
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange(star)}
              className={`text-3xl transition-colors ${
                isActive ? 'text-yellow-400' : 'text-gray-300'
              } ${!readonly ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              {isActive ? '★' : '☆'}
            </button>
          );
        })}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      in_progress: "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: (
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      confirmed: (
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      in_progress: (
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      ),
      completed: (
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      cancelled: (
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    };
    return icons[status] || (
      <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">{error}</h2>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">
                View and manage your funeral service bookings
              </p>
            </div>
            <div className="bg-indigo-100 px-6 py-3 rounded-full">
              <span className="text-2xl font-bold text-indigo-600">{bookings.length}</span>
              <span className="text-sm text-indigo-700 ml-2">Total Bookings</span>
            </div>
          </div>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-12 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t made any bookings. Start by browsing our services.</p>
            <button
              onClick={() => router.push("/order-services")}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Browse Services
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.booking_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{booking.package_name}</h3>
                        <p className="text-sm text-gray-600 font-medium">Booking #{booking.booking_reference}</p>
                      </div>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm shadow-md ${getStatusColor(booking.status)}`}>
                      <span className="mr-2">{getStatusIcon(booking.status)}</span>
                      {booking.status.replace("_", " ").toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Enhanced Compact Summary - Always Visible */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Service Date</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(booking.service_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Amount</p>
                        <p className="text-lg font-bold text-green-600">
                          RM {parseFloat(booking.total_amount).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Add-ons</p>
                        <p className="text-sm font-bold text-gray-900">
                          {booking.addons && booking.addons.length > 0 ? `${booking.addons.length} selected` : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Details Section */}
                  <AnimatePresence>
                    {expandedBooking === booking.booking_id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                      >
                        {/* Customer Details */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-500">Full Name</p>
                              <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="text-sm font-medium text-gray-900">{booking.customer_phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-medium text-gray-900">{booking.customer_email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Package</p>
                              <p className="text-sm font-medium text-gray-900">{booking.package_name}</p>
                            </div>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Service Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-500">Service Provider</p>
                              <p className="text-sm font-medium text-gray-900">{booking.provider_name || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Service Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(booking.service_date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Service Address</p>
                              <p className="text-sm font-medium text-gray-900">{booking.service_address}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Package Price</p>
                              <p className="text-sm font-medium text-gray-900">
                                RM {parseFloat(booking.package_price).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Payment Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-500">Payment Method</p>
                              <div className="flex items-center gap-2 mt-1">
                                {booking.payment_method === "credit_card" && (
                                  <>
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Credit Card</span>
                                  </>
                                )}
                                {booking.payment_method === "online_banking" && (
                                  <>
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Online Banking</span>
                                  </>
                                )}
                                {booking.payment_method === "e_wallet" && (
                                  <>
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">E-Wallet</span>
                                  </>
                                )}
                                {booking.payment_method === "cash" && (
                                  <>
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm2-4h10v6H9V9z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Cash</span>
                                  </>
                                )}
                                {booking.payment_method === "ewallet" && (
                                  <>
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">E-Wallet</span>
                                  </>
                                )}
                                {(!booking.payment_method || booking.payment_method === "" || booking.payment_method === null) && (
                                  <span className="text-sm text-gray-500">Not specified</span>
                                )}
                                {booking.payment_method && 
                                 !["credit_card", "online_banking", "e_wallet", "ewallet", "cash"].includes(booking.payment_method) && (
                                  <span className="text-sm font-medium text-gray-900">
                                    {booking.payment_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total Amount</p>
                              <p className="text-lg font-bold text-green-600">
                                RM {parseFloat(booking.total_amount).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Add-ons Section - Grouped by Category */}
                        {booking.addons && booking.addons.length > 0 && (() => {
                          // Group add-ons by category
                          const groupedAddons = booking.addons.reduce((acc, addon) => {
                            const category = addon.category || "Other Services";
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(addon);
                            return acc;
                          }, {});

                          return (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Buddhist Ceremony Add-ons
                                <span className="ml-2 text-sm text-gray-500 font-normal">
                                  ({booking.addons.length} {booking.addons.length === 1 ? 'Service' : 'Services'})
                                </span>
                              </h4>

                              {/* Display by category */}
                              {Object.entries(groupedAddons).map(([category, addons]) => (
                                <div key={category} className="mb-4">
                                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-t-lg border-l-4 border-amber-500">
                                    <h5 className="font-semibold text-amber-800">{category}</h5>
                                  </div>
                                  <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg">
                                    {addons.map((addon, idx) => (
                                      <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                        <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                                        <span className="text-sm font-bold text-indigo-600">
                                          RM {parseFloat(addon.price).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              {/* Add-ons Subtotal */}
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-base font-bold text-gray-900">Add-ons Subtotal:</span>
                                  <span className="text-lg font-bold text-indigo-600">
                                    RM {booking.addons.reduce((sum, addon) => sum + parseFloat(addon.price), 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Includes {booking.addons.length} add-on service{booking.addons.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Warning: Missing Add-ons Data */}
                        {(!booking.addons || booking.addons.length === 0) && 
                         booking.package_price && 
                         booking.total_amount > booking.package_price && (
                          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  <strong>Note:</strong> This booking includes add-ons (Total: RM {parseFloat(booking.total_amount).toFixed(2)} - Package: RM {parseFloat(booking.package_price).toFixed(2)} = RM {(parseFloat(booking.total_amount) - parseFloat(booking.package_price)).toFixed(2)}), but add-on details are not available. This may be an older booking created before the system upgrade.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Uploaded Files - With Labels */}
                        {booking.uploaded_files && (() => {
                          try {
                            console.log(`Parsing uploaded_files for ${booking.booking_reference}:`, booking.uploaded_files);
                            const files = JSON.parse(booking.uploaded_files);
                            console.log(`Parsed files:`, files);
                            
                            if (files && files.length > 0) {
                              // Define file labels based on order (Photo of Deceased, Death Certificate, Additional Docs)
                              const getFileLabel = (index) => {
                                if (index === 0) return "Photo of the Deceased *";
                                if (index === 1) return "Death Certificate *";
                                return `Additional Document ${index - 1}`;
                              };

                              return (
                                <div className="mb-6">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Uploaded Documents
                                    <span className="ml-2 text-sm text-gray-500 font-normal">({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                                  </h4>
                                  <div className="space-y-3">
                                    {files.map((file, idx) => (
                                      <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200 overflow-hidden">
                                        {/* File Label Header */}
                                        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center gap-2">
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                          </svg>
                                          <span className="font-semibold text-sm">{getFileLabel(idx)}</span>
                                        </div>
                                        {/* File Download Link */}
                                        {(() => {
                                          // Handle both formats:
                                          // 1. Array of strings: ["https://...", "https://..."]
                                          // 2. Array of objects: [{url: "https://...", name: "..."}]
                                          const fileUrl = typeof file === 'string' ? file : (file.url || file);
                                          const isFullUrl = typeof fileUrl === 'string' && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'));
                                          const href = isFullUrl ? fileUrl : `/backend/${fileUrl}`;
                                          
                                          // Extract filename for display
                                          const getFileName = () => {
                                            // If file is an object with name property
                                            if (file && typeof file === 'object' && file.name) {
                                              return file.name;
                                            }
                                            // Extract from URL
                                            if (typeof fileUrl === 'string') {
                                              const parts = fileUrl.split('/');
                                              const filename = parts[parts.length - 1];
                                              // Remove query parameters if any
                                              return filename.split('?')[0] || `file_${idx + 1}`;
                                            }
                                            return `file_${idx + 1}`;
                                          };

                                          return (
                                            <a
                                              href={href}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-100 transition-colors cursor-pointer group"
                                              onClick={(e) => {
                                                // Ensure Supabase URLs open correctly
                                                if (isFullUrl) {
                                                  // Let default behavior handle it, but ensure it opens
                                                  console.log('Opening file:', href);
                                                }
                                              }}
                                            >
                                              <svg className="w-6 h-6 text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                  {getFileName()}
                                                </p>
                                                <p className="text-xs text-indigo-600 font-medium group-hover:text-indigo-700">Click to view/download →</p>
                                              </div>
                                              <svg className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </a>
                                          );
                                        })()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            } else {
                              console.log(`No files found after parsing for ${booking.booking_reference}`);
                            }
                          } catch (e) {
                            console.error(`Error parsing uploaded_files for ${booking.booking_reference}:`, e, booking.uploaded_files);
                          }
                          return null;
                        })()}

                        {/* Special Requirements */}
                        {booking.special_requirements && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              Special Requirements
                            </h4>
                            <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                              {booking.special_requirements}
                            </p>
                          </div>
                        )}

                        {/* Provider Notes */}
                        {booking.provider_notes && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Provider Notes
                            </h4>
                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                              {booking.provider_notes}
                            </p>
                          </div>
                        )}

                        {/* Cancellation Details */}
                        {booking.status === 'cancelled' && booking.cancellation_reason && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Cancellation Details
                            </h4>
                            <div className="bg-red-50 p-4 rounded-lg space-y-2">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Reason:</span> {booking.cancellation_reason}
                              </p>
                              {booking.cancelled_by && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Cancelled by:</span>{" "}
                                  <span className="capitalize">{booking.cancelled_by}</span>
                                </p>
                              )}
                              {booking.refund_amount && (
                                <p className="text-sm font-semibold text-green-700">
                                  ?? Refund Amount: RM {parseFloat(booking.refund_amount).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                                  {booking.cancelled_by === 'customer' && ' (95%)'}
                                  {booking.cancelled_by === 'provider' && ' (100%)'}
                                </p>
                              )}
                              {booking.cancelled_at && (
                                <p className="text-xs text-gray-500">
                                  Cancelled on: {new Date(booking.cancelled_at).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Booking Timestamps */}
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 pt-4 border-t border-gray-200">
                          <div>
                            <span className="font-medium">Booked on:</span>{" "}
                            {new Date(booking.created_at).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                          {booking.updated_at !== booking.created_at && (
                            <div>
                              <span className="font-medium">Last updated:</span>{" "}
                              {new Date(booking.updated_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Action Buttons */}
                  {(booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'completed') && (
                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 border-2 border-red-300 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Booking
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintReceipt(booking)}
                        className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border-2 border-blue-300 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Receipt
                      </button>
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => handleRateService(booking)}
                          className={`flex-1 min-w-[200px] px-6 py-4 ${
                            booking.customer_rating_submitted 
                              ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-2 border-green-300' 
                              : 'bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-yellow-700 border-2 border-yellow-300'
                          } rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {booking.customer_rating_submitted ? 'View Your Rating' : 'Rate Service'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const phone = booking.provider_phone || "0123456789";
                          const message = `Hi, I have a question about my booking (Ref: ${booking.booking_reference})`;
                          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border-2 border-green-300 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Contact Provider
                      </button>
                      <button
                        onClick={() => setExpandedBooking(expandedBooking === booking.booking_id ? null : booking.booking_id)}
                        className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 text-indigo-700 border-2 border-indigo-300 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {expandedBooking === booking.booking_id ? 'Hide Details' : 'View Full Details'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => router.push("/order-services")}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              Book Another Service
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Refund Policy
                  </h4>
                  <div className="text-sm text-yellow-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600">-</span>
                      <span><strong>95% refund</strong> will be processed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600">-</span>
                      <span>5% processing fee applies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600">-</span>
                      <span>Provider will be notified immediately</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600">-</span>
                      <span>For changes, contact the provider directly</span>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                  placeholder="e.g., Schedule conflict, Found another service..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellationReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && ratingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {ratingBooking.customer_rating_submitted ? 'Your Rating' : 'Rate Your Service'}
                </h3>
                <p className="text-gray-600">
                  {ratingBooking.customer_rating_submitted 
                    ? `You rated ${ratingBooking.provider_name}` 
                    : `How was your experience with ${ratingBooking.provider_name}?`}
                </p>
              </div>

              {!ratingBooking.customer_rating_submitted && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating Category
                    </label>
                    <select
                      value={reviewCategory}
                      onChange={(e) => setReviewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="quality">Overall Quality</option>
                      <option value="professionalism">Professionalism</option>
                      <option value="communication">Communication</option>
                      <option value="value">Value for Money</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      Rating
                    </label>
                    <div className="flex justify-center">
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-sm text-gray-600 mt-2">
                        {rating === 1 && "Needs Improvement"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                      rows="3"
                      placeholder="Share your experience..."
                      maxLength="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reviewText.length}/500 characters
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRatingModal(false);
                        setRating(0);
                        setReviewText("");
                        setReviewCategory("quality");
                        setRatingBooking(null);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitRating}
                      disabled={rating === 0 || submittingRating}
                      className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                      {submittingRating ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </>
              )}

              {ratingBooking.customer_rating_submitted && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                      <StarRating value={rating} readonly={true} />
                    </div>
                    {reviewText && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 italic">"{reviewText}"</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowRatingModal(false);
                      setRatingBooking(null);
                    }}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
