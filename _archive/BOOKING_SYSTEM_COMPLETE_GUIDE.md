# 🚀 Complete Booking System Enhancement - Implementation Guide

## 📦 **What's Been Created**

### **Backend APIs** ✅
1. **`backend/booking_enhancements.sql`** - Database migration
   - Adds: payment_method, uploaded_files, cancellation tracking fields
   - Adds indexes for performance
   
2. **`backend/cancelBooking.php`** - Customer cancellation API
   - 95% refund policy
   - Validates ownership
   - Updates status to 'cancelled'
   
3. **`backend/updateBookingStatus.php`** - Provider status management API
   - Confirm/cancel bookings
   - 100% refund for provider cancellations
   - Add provider notes
   
4. **`backend/getProviderBookings.php`** - Provider bookings view API
   - Get all bookings for provider's packages
   - Full details including add-ons
   
5. **`backend/createBooking.php`** - UPDATED
   - Now saves payment_method to database

---

## 🗄️ **STEP 1: Run SQL Migration**

Open HeidiSQL and run this:

```sql
-- Copy from backend/booking_enhancements.sql or run directly:
USE smart_funeral_system;

-- Add payment_method column
ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50) NULL AFTER total_amount;

-- Add uploaded_files column (JSON format for file paths)
ALTER TABLE bookings ADD COLUMN uploaded_files TEXT NULL AFTER service_address;

-- Add cancellation tracking
ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT NULL AFTER provider_notes;
ALTER TABLE bookings ADD COLUMN cancelled_by ENUM('customer', 'provider') NULL AFTER cancellation_reason;
ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMP NULL AFTER cancelled_by;

-- Add confirmation tracking
ALTER TABLE bookings ADD COLUMN confirmed_at TIMESTAMP NULL AFTER cancelled_at;

-- Add refund tracking
ALTER TABLE bookings ADD COLUMN refund_amount DECIMAL(10,2) NULL AFTER confirmed_at;

-- Add indexes for performance
ALTER TABLE bookings ADD INDEX idx_status (status);
ALTER TABLE bookings ADD INDEX idx_service_date (service_date);
```

---

## 📱 **STEP 2: Enhance Orders.jsx (Customer View)**

### Add These Imports:
```javascript
import { AnimatePresence } from "framer-motion";
```

### Add These State Variables (after existing useState):
```javascript
const [expandedBooking, setExpandedBooking] = useState(null);
const [cancellingBooking, setCancellingBooking] = useState(null);
const [cancellationReason, setCancellationReason] = useState("");
const [showCancelModal, setShowCancelModal] = useState(false);
```

### Add Cancel Booking Handler (after fetchUserBookings):
```javascript
const handleCancelBooking = async (booking) => {
  setCancellingBooking(booking);
  setShowCancelModal(true);
};

const confirmCancelBooking = async () => {
  if (!cancellingBooking) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    const response = await fetch('/backend/cancelBooking.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: cancellingBooking.booking_id,
        user_id: currentUser.id,
        cancellation_reason: cancellationReason || 'Customer requested cancellation'
      })
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ Booking cancelled successfully!\n\nRefund Amount: RM ${result.refund_amount.toFixed(2)} (${result.refund_percentage}%)\n\nThe service provider has been notified.`);
      fetchUserBookings(); // Refresh bookings
      setShowCancelModal(false);
      setCancellationReason("");
      setCancellingBooking(null);
    } else {
      alert(`❌ Error: ${result.message}`);
    }
  } catch (err) {
    console.error("Error cancelling booking:", err);
    alert("❌ An error occurred while cancelling the booking");
  }
};
```

### Add Action Buttons Section (in each booking card, after the payment section):
```javascript
{/* Action Buttons */}
<div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
  {/* Cancel Button - Only for pending/confirmed bookings */}
  {(booking.status === 'pending' || booking.status === 'confirmed') && (
    <button
      onClick={() => handleCancelBooking(booking)}
      className="flex-1 min-w-[200px] px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Cancel Booking
    </button>
  )}
  
  {/* Contact Provider Button */}
  <button
    onClick={() => window.location.href = `mailto:${booking.provider_phone}?subject=Regarding Booking ${booking.booking_reference}`}
    className="flex-1 min-w-[200px] px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
    Contact Provider
  </button>

  {/* Toggle Details Button */}
  <button
    onClick={() => setExpandedBooking(expandedBooking === booking.booking_id ? null : booking.booking_id)}
    className="flex-1 min-w-[200px] px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
  >
    {expandedBooking === booking.booking_id ? (
      <>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        Hide Details
      </>
    ) : (
      <>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        View Full Details
      </>
    )}
  </button>
</div>

{/* Collapsible Full Details */}
<AnimatePresence>
  {expandedBooking === booking.booking_id && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 bg-gray-50 p-4 rounded-lg">
        {/* Payment Method */}
        {booking.payment_method && (
          <div className="bg-white p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Method
            </h5>
            <p className="text-sm text-gray-700 capitalize">{booking.payment_method.replace('_', ' ')}</p>
          </div>
        )}

        {/* Refund Info (if cancelled) */}
        {booking.status === 'cancelled' && booking.refund_amount && (
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Refund Information
            </h5>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Refund Amount:</span> RM {parseFloat(booking.refund_amount).toFixed(2)}
            </p>
            {booking.cancelled_by && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Cancelled by:</span> {booking.cancelled_by === 'customer' ? 'You' : 'Service Provider'}
              </p>
            )}
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.cancellation_reason && (
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <h5 className="font-semibold text-gray-900 mb-2">Cancellation Reason</h5>
            <p className="text-sm text-gray-700">{booking.cancellation_reason}</p>
          </div>
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### Add Cancel Modal (before the closing `</main>` tag):
```javascript
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel booking #{cancellingBooking?.booking_reference}?
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 font-semibold mb-1">⚠️ Refund Policy</p>
            <p className="text-sm text-yellow-700">
              You will receive a <strong>95% refund</strong> of the total amount (RM {cancellingBooking && (cancellingBooking.total_amount * 0.95).toFixed(2)}).
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              5% processing fee applies. Frequent cancellations may affect service provider relationships.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Cancellation (Optional)
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
            rows="3"
            placeholder="Please tell us why you're cancelling..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancellationReason("");
              setCancellingBooking(null);
            }}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={confirmCancelBooking}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Yes, Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🏢 **STEP 3: Create Provider Bookings Page**

Create new file: `frontend/my-app/src/pages/ProviderBookings.jsx`

This will be in the next message due to length. Let me know when you're ready!

---

## ✅ **Testing Checklist**

### Customer Side:
1. ✅ Run SQL migration in HeidiSQL
2. ✅ Create a new booking (test payment_method is saved)
3. ✅ View booking in Orders page
4. ✅ Click "View Full Details" - should expand
5. ✅ Click "Cancel Booking" - modal should appear
6. ✅ Cancel with reason - should show 95% refund
7. ✅ Verify database shows refund_amount, cancelled_by = 'customer'

### Provider Side (Next):
1. Create provider login
2. View all bookings for their packages
3. Confirm booking - status changes to 'confirmed'
4. Cancel booking - 100% refund for customer

---

## 📊 **Database Schema After Migration**

```
bookings table:
├── booking_id
├── booking_reference
├── package_id
├── user_id  ← Added previously
├── customer_name
├── customer_email
├── customer_phone
├── service_date
├── service_address
├── uploaded_files  ← NEW (JSON array of file paths)
├── special_requirements
├── total_amount
├── payment_method  ← NEW (card/bank/ewallet/cash)
├── status (pending/confirmed/in_progress/completed/cancelled)
├── provider_notes
├── cancellation_reason  ← NEW
├── cancelled_by  ← NEW (customer/provider)
├── cancelled_at  ← NEW
├── confirmed_at  ← NEW
├── refund_amount  ← NEW
├── created_at
└── updated_at
```

---

Would you like me to create the Provider Bookings page next? 🚀
