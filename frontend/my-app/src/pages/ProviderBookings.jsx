'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  CalendarCheck,
  User2,
  Wallet,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Filter,
  Clock3
} from "lucide-react";
import { Button } from "../components/ui/shadcn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "../components/ui/shadcn/card";
import { Badge } from "../components/ui/shadcn/badge";
import { cn } from "../lib/utils";

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [providerNotes, setProviderNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const buildAuthHeaders = (extraHeaders = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders
    };
  };

  useEffect(() => {
    fetchProviderBookings();
  }, [statusFilter]);

  const fetchProviderBookings = async () => {
    try {
      setLoading(true);
      
      const currentUser = JSON.parse(localStorage.getItem("user"));
      
      // Get user_id - the API will look up provider_id from service_provider table
      const userId = currentUser?.user_id || currentUser?.id;
      
      if (!currentUser || !userId) {
        setError("Please login as a service provider to view bookings");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/backend/getProviderBookings?user_id=${userId}`, {
        headers: buildAuthHeaders({ 'ngrok-skip-browser-warning': 'true' })
      });
      const result = await response.json();

      if (result.success) {
        // Handle standardized API response format: { success: true, data: { bookings: [...] } }
        const allBookingsData = result.data?.bookings || result.bookings || [];
        setAllBookings(allBookingsData);
        
        // Apply status filter
        let filteredBookings = allBookingsData;
        if (statusFilter !== 'all') {
          filteredBookings = allBookingsData.filter(b => b.status === statusFilter);
        }
        
        setBookings(filteredBookings);
      } else {
        setError(result.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("An error occurred while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = (booking) => {
    setSelectedBooking(booking);
    setProviderNotes("");
    setShowConfirmModal(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason("");
    setProviderNotes("");
    setShowCancelModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedBooking) return;

    try {
      setUpdating(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const userId = currentUser?.user_id || currentUser?.id;

      // Get provider_id from user_id
      let providerId = null;
      
      // Try to get provider_id from getProviderDashboard API
      try {
        const providerIdResponse = await fetch(`/api/backend/getProviderDashboard?user_id=${userId}`, {
          headers: buildAuthHeaders()
        });
        const providerIdData = await providerIdResponse.json();
        
        if (providerIdData.success && providerIdData.data?.provider_id) {
          providerId = providerIdData.data.provider_id;
        } else {
          // Fallback: Query provider_id directly from service_provider table
          const directProviderResponse = await fetch(`/api/backend/getProviderId?user_id=${userId}`, {
            headers: buildAuthHeaders()
          });
          const directProviderData = await directProviderResponse.json();
          if (directProviderData.success && directProviderData.provider_id) {
            providerId = directProviderData.provider_id;
          }
        }
      } catch (err) {
        console.error("Error fetching provider ID:", err);
      }

      if (!providerId) {
        alert(`❌ Error: Could not find provider ID. Please ensure you are logged in as a service provider.`);
        setUpdating(false);
        return;
      }

      const response = await fetch('/api/backend/updateBookingStatus', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          booking_id: selectedBooking.booking_id,
          provider_id: providerId,
          new_status: 'confirmed',
          provider_notes: providerNotes || 'Booking confirmed by provider'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Booking confirmed successfully!`);
        setShowConfirmModal(false);
        setProviderNotes("");
        setSelectedBooking(null);
        fetchProviderBookings();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Error confirming booking:", err);
      alert("❌ An error occurred while confirming the booking");
    } finally {
      setUpdating(false);
    }
  };

  const cancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      setUpdating(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const userId = currentUser?.user_id || currentUser?.id;

      // Get provider_id from user_id
      let providerId = null;
      
      // Try to get provider_id from getProviderDashboard API
      try {
        const providerIdResponse = await fetch(`/api/backend/getProviderDashboard?user_id=${userId}`, {
          headers: buildAuthHeaders()
        });
        const providerIdData = await providerIdResponse.json();
        
        if (providerIdData.success && providerIdData.data?.provider_id) {
          providerId = providerIdData.data.provider_id;
        } else {
          // Fallback: Query provider_id directly from service_provider table
          const directProviderResponse = await fetch(`/api/backend/getProviderId?user_id=${userId}`, {
            headers: buildAuthHeaders()
          });
          const directProviderData = await directProviderResponse.json();
          if (directProviderData.success && directProviderData.provider_id) {
            providerId = directProviderData.provider_id;
          }
        }
      } catch (err) {
        console.error("Error fetching provider ID:", err);
      }

      if (!providerId) {
        alert(`❌ Error: Could not find provider ID. Please ensure you are logged in as a service provider.`);
        setUpdating(false);
        return;
      }

      const response = await fetch('/api/backend/updateBookingStatus', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          booking_id: selectedBooking.booking_id,
          provider_id: providerId,
          new_status: 'cancelled',
          cancellation_reason: cancellationReason,
          provider_notes: providerNotes || 'Booking cancelled by provider'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Booking cancelled successfully!\n\nRefund Amount: RM ${result.refund_amount?.toFixed(2) || '0.00'} (100%)\n\nThe customer has been notified.`);
        setShowCancelModal(false);
        setCancellationReason("");
        setProviderNotes("");
        setSelectedBooking(null);
        fetchProviderBookings();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("❌ An error occurred while cancelling the booking");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (booking, newStatus) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.replace('_', ' ')}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const userId = currentUser?.user_id || currentUser?.id;

      // Get provider_id from user_id
      let providerId = null;
      
      // Try to get provider_id from getProviderDashboard API
      try {
        const providerIdResponse = await fetch(`/api/backend/getProviderDashboard?user_id=${userId}`, {
          headers: buildAuthHeaders()
        });
        const providerIdData = await providerIdResponse.json();
        
        if (providerIdData.success && providerIdData.data?.provider_id) {
          providerId = providerIdData.data.provider_id;
        } else {
          // Fallback: Query provider_id directly from service_provider table
          const directProviderResponse = await fetch(`/api/backend/getProviderId?user_id=${userId}`, {
            headers: buildAuthHeaders()
          });
          const directProviderData = await directProviderResponse.json();
          if (directProviderData.success && directProviderData.provider_id) {
            providerId = directProviderData.provider_id;
          }
        }
      } catch (err) {
        console.error("Error fetching provider ID:", err);
      }

      if (!providerId) {
        alert(`❌ Error: Could not find provider ID. Please ensure you are logged in as a service provider.`);
        setUpdating(false);
        return;
      }

      const response = await fetch('/api/backend/updateBookingStatus', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          booking_id: booking.booking_id,
          provider_id: providerId,
          new_status: newStatus,
          provider_notes: `Status updated to ${newStatus}`
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Booking status updated successfully!`);
        fetchProviderBookings();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ An error occurred while updating the booking status");
    } finally {
      setUpdating(false);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {
      all: allBookings.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };

    allBookings.forEach(booking => {
      if (counts.hasOwnProperty(booking.status)) {
        counts[booking.status]++;
      }
    });

    return counts;
  }, [allBookings]);

  const statusConfig = {
    pending: { label: "Pending", tone: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock3 },
    confirmed: { label: "Confirmed", tone: "bg-sky-100 text-sky-700 border-sky-200", icon: CheckCircle2 },
    in_progress: { label: "In Progress", tone: "bg-purple-100 text-purple-700 border-purple-200", icon: Loader2 },
    completed: { label: "Completed", tone: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", tone: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50/60 to-emerald-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
          <p className="text-sm font-medium">Loading bookings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50/60 to-emerald-50 px-4">
        <Card className="max-w-lg border border-rose-100 bg-white/95 text-center shadow-lg shadow-rose-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-rose-600">Unable to load bookings</CardTitle>
            <CardDescription className="text-sm text-rose-500">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3 pb-6">
            <Button variant="ghost" className="text-slate-600" onClick={() => router.push("/service-provider-dashboard")}>
              Back to dashboard
            </Button>
            <Button onClick={() => router.push("/login")}>Sign in again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const filters = [
    { key: "all", label: "All", count: statusCounts.all },
    { key: "pending", label: "Pending", count: statusCounts.pending },
    { key: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
    { key: "in_progress", label: "In progress", count: statusCounts.in_progress },
    { key: "completed", label: "Completed", count: statusCounts.completed },
    { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/60 to-emerald-50">
      <div className="pointer-events-none absolute inset-0 top-0 h-64 bg-gradient-to-br from-sky-200/40 via-transparent to-emerald-200/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white"
            onClick={() => router.push("/service-provider-dashboard")}
          >
            <ArrowLeft size={18} />
            Back to dashboard
          </Button>
          <div className="flex items-center gap-2 rounded-2xl border border-sky-100/70 bg-white/80 px-4 py-2 text-sm text-sky-600 shadow-sm">
            <Sparkles size={16} className="text-sky-500" />
            {statusCounts.all} total bookings
          </div>
        </div>

        <Card className="overflow-hidden border-none bg-white/90 shadow-xl shadow-sky-100/50">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="bg-sky-100/70 text-sky-700">Operations</Badge>
                <CardTitle className="text-3xl font-semibold text-slate-900 md:text-4xl">
                  Booking management
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-slate-500">
                  Track requests, confirm services, and keep families informed from one calm workspace.
                </CardDescription>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-6 py-4 text-right">
                <p className="text-xs font-medium uppercase text-slate-400">Pending decisions</p>
                <p className="text-2xl font-semibold text-slate-700">{statusCounts.pending}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.key}
                  variant="ghost"
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                    statusFilter === filter.key
                      ? "border-sky-300 bg-sky-500 text-white shadow-sm hover:bg-sky-500"
                      : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-white"
                  )}
                  onClick={() => setStatusFilter(filter.key)}
                >
                  <Filter size={14} className={cn("mr-1", statusFilter === filter.key ? "text-white" : "text-sky-400")} />
                  {filter.label}
                  <span className="ml-1 text-xs text-slate-400">{filter.count}</span>
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {bookings.length === 0 ? (
          <Card className="border-none bg-white/90 py-16 text-center shadow-lg shadow-sky-100/50">
            <CardContent className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ClipboardList size={28} />
              </div>
              <CardTitle className="text-xl text-slate-800">No bookings yet</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {statusFilter === "all"
                  ? "When families request your services they will appear here for review."
                  : `You have no ${statusFilter.replace("_", " ")} bookings right now.`}
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 pb-12">
            {bookings.map((booking, index) => {
              const status = statusConfig[booking.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Card
                  key={booking.booking_id}
                  className="border-none bg-white/90 shadow-lg shadow-sky-100/40 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <CardHeader className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-md">
                        <ClipboardList size={24} />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xl text-slate-900">{booking.package_name}</CardTitle>
                        <p className="text-sm text-slate-500">Booking #{booking.booking_reference}</p>
                      </div>
                    </div>
                    <Badge className={cn("gap-2 border px-3 py-1.5 text-sm font-medium", status.tone)}>
                      <StatusIcon size={16} />
                      {status.label}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-500">
                          <User2 size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Customer</p>
                          <p className="text-sm font-semibold text-slate-700">{booking.customer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500">
                          <CalendarCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Service date</p>
                          <p className="text-sm font-semibold text-slate-700">
                            {booking.service_date
                              ? new Date(booking.service_date).toLocaleDateString("en-MY", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              : "TBC"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                          <Wallet size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Amount</p>
                          <p className="text-sm font-semibold text-emerald-600">
                            RM {parseFloat(booking.total_amount || 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            className="flex-1 min-w-[180px] bg-emerald-500/90 text-white hover:bg-emerald-500"
                            onClick={() => handleConfirmBooking(booking)}
                            disabled={updating}
                          >
                            <CheckCircle2 size={16} className="mr-2" />
                            {updating ? "Confirming…" : "Confirm booking"}
                          </Button>
                          <Button
                            className="flex-1 min-w-[180px] border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                            onClick={() => handleCancelBooking(booking)}
                            disabled={updating}
                          >
                            <XCircle size={16} className="mr-2" />
                            Decline
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          className="flex-1 min-w-[180px] border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100"
                          onClick={() => handleUpdateStatus(booking, "completed")}
                          disabled={updating}
                        >
                          <CheckCircle2 size={16} className="mr-2" />
                          Mark as completed
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="flex-1 min-w-[180px] border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        onClick={() =>
                          setExpandedBooking(expandedBooking === booking.booking_id ? null : booking.booking_id)
                        }
                      >
                        <Eye size={16} className="mr-2" />
                        {expandedBooking === booking.booking_id ? "Hide details" : "View full details"}
                      </Button>
                    </div>

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
                              <a href={`tel:${booking.customer_phone}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                {booking.customer_phone}
                              </a>
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
                              <p className="text-xs text-gray-500">Service Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {booking.service_date ? new Date(booking.service_date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                }) : 'TBD'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Service Address</p>
                              <p className="text-sm font-medium text-gray-900">{booking.service_address}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Package Price</p>
                              <p className="text-sm font-medium text-gray-900">
                                RM {parseFloat(booking.package_price || 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
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
                                RM {parseFloat(booking.total_amount || 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>


                        {/* Buddhist Ceremony Add-ons - Grouped by Category */}
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
                                Buddhist Ceremony Add-ons ({booking.addons.length} {booking.addons.length === 1 ? 'Service' : 'Services'})
                              </h4>

                              {/* Display by category */}
                              {Object.entries(groupedAddons).map(([category, addons]) => (
                                <div key={category} className="mb-4">
                                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-t-lg border-l-4 border-amber-500">
                                    <h6 className="font-semibold text-amber-800">{category}</h6>
                                  </div>
                                  <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg">
                                    {addons.map((addon, idx) => (
                                      <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                        <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                                        <span className="text-sm font-bold text-indigo-600">
                                          RM {parseFloat(addon.price || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              {/* Add-ons Subtotal */}
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200 mt-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-base font-bold text-gray-900">Add-ons Subtotal:</span>
                                  <span className="text-lg font-bold text-indigo-600">
                                    RM {booking.addons.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Includes {booking.addons.length} add-on service{booking.addons.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Customer Uploaded Documents - With Labels */}
                        {booking.uploaded_files && (() => {
                          try {
                            const files = JSON.parse(booking.uploaded_files);
                            if (files && files.length > 0) {
                              // Define file labels based on order
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
                                    Customer Uploaded Documents ({files.length} {files.length === 1 ? 'file' : 'files'})
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
                                        <a
                                          href={`/backend/${file.url || file}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-100 transition-colors"
                                        >
                                          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {file.name || file.split('/').pop() || `file_${idx + 1}`}
                                            </p>
                                            <p className="text-xs text-indigo-600 font-medium">Click to view/download →</p>
                                          </div>
                                          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error("Error parsing uploaded_files:", e);
                          }
                          return null;
                        })()}

                        {/* Special Requirements */}
                        {booking.special_requirements && (
                          <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Special Requirements
                            </h4>
                            <p className="text-sm text-gray-700">{booking.special_requirements}</p>
                          </div>
                        )}

                        {/* Footer - Creation Date */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Created: {booking.created_at ? new Date(booking.created_at).toLocaleString("en-US", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit"
                            }) : 'N/A'}
                          </p>
                        </div>

                        {/* Provider Notes */}
                        {booking.provider_notes && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Provider Notes
                            </h4>
                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.provider_notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Cancellation Info */}
                        {booking.status === 'cancelled' && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancellation Details
                            </h4>
                            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                              {booking.cancelled_by && (
                                <p className="text-sm text-red-700 mb-2">
                                  <span className="font-semibold">Cancelled by:</span> {booking.cancelled_by === 'customer' ? 'Customer' : 'Service Provider'}
                                </p>
                              )}
                              {booking.cancelled_at && (
                                <p className="text-sm text-red-700 mb-2">
                                  <span className="font-semibold">Cancelled on:</span> {new Date(booking.cancelled_at).toLocaleString('en-MY', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                              {booking.cancellation_reason && (
                                <p className="text-sm text-red-700 mb-2">
                                  <span className="font-semibold">Reason:</span> {booking.cancellation_reason}
                                </p>
                              )}
                              {booking.refund_amount && (
                                <p className="text-sm text-red-700 mt-2 font-semibold pt-2 border-t border-red-200">
                                  Refund Amount: RM {parseFloat(booking.refund_amount).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                                  {booking.cancelled_by === 'customer' && ' (95% refund)'}
                                  {booking.cancelled_by === 'provider' && ' (100% refund)'}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !updating && setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Booking</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to confirm booking <strong>{selectedBooking?.booking_reference}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Notes (Optional)
                </label>
                <textarea
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes for the customer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setProviderNotes("");
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !updating && setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-red-900 mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-4">
                Cancelling booking <strong>{selectedBooking?.booking_reference}</strong> will issue a 100% refund to the customer.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Please provide a reason for cancellation..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Notes (Optional)
                </label>
                <textarea
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                  placeholder="Add any additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellationReason("");
                    setProviderNotes("");
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={cancelBooking}
                  disabled={updating || !cancellationReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {updating ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
