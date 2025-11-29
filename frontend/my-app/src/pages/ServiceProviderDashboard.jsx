'use client';

import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { BookingsBarChart, RevenueBarChart } from "../components/dashboard/Charts";
import CalendarAvailability from "../components/dashboard/CalendarAvailability";
import "../components/dashboard/CalendarAvailability.css";
import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  LogOut,
  MapPin,
  Package,
  PlusCircle,
  Settings,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "../components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/shadcn/card";
import { Badge } from "../components/ui/shadcn/badge";
import { cn } from "../lib/utils";

const INITIAL_STATS = {
  totalBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  totalRevenue: 0,
  averageRating: 0,
  totalReviews: 0,
  revenueGrowth: 0
};

export default function ServiceProviderDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: INITIAL_STATS,
    recentBookings: [],
    recentReviews: [],
    monthlyRevenue: [],
    packages: [],
    company_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    capacity: "",
    duration_hours: "",
    location_type: "both",
    features: []
  });
  const [newFeature, setNewFeature] = useState("");
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPackageId, setEditPackageId] = useState(null);

  const VALID_TABS = ["overview", "packages", "availability"];

  const { user, provider, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const tabItems = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "packages", label: "Packages", icon: Package },
    { key: "availability", label: "Availability", icon: CalendarRange }
  ];

  useEffect(() => {
    if (!user || user.role !== "provider") {
      router.push("/login");
      return;
    }

    // Check sessionStorage for activeTab (set by ManagePackages or other pages)
    const activeTabFromStorage = typeof window !== 'undefined' ? sessionStorage.getItem('dashboardActiveTab') : null;
    if (activeTabFromStorage) {
      const requestedTab = activeTabFromStorage;
      setActiveTab(VALID_TABS.includes(requestedTab) ? requestedTab : "overview");
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const providerId =
        storedUser?.id || storedUser?.user_id || user?.id || user?.user_id;

      if (!providerId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const response = await fetch(`/api/backend/getProviderDashboard?user_id=${providerId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      const rawText = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(rawText);
          if (data.success && data.data) {
            setDashboardData({
              stats: { ...INITIAL_STATS, ...(data.data.stats || {}) },
              recentBookings: data.data.recentBookings || [],
              recentReviews: data.data.recentReviews || [],
              monthlyRevenue: data.data.monthlyRevenue || [],
              packages: data.data.packages || [],
              company_name: data.data.company_name || ''
            });
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
        }
      } else {
        console.error("Dashboard fetch error:", rawText);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (event) => {
    event.preventDefault();

    if (!newPackage.name || !newPackage.price) {
      alert("Please fill in package name and price");
      return;
    }

    try {
      const packageData = {
        ...newPackage,
        user_id:
          JSON.parse(localStorage.getItem("user") || "null")?.user_id ||
          JSON.parse(localStorage.getItem("user") || "null")?.id ||
          user?.user_id ||
          user?.id,
        features: newPackage.features
      };

      if (isEditMode) {
        packageData.package_id = editPackageId;
      }

      if (packageData.price) packageData.price = parseFloat(packageData.price);
      if (packageData.duration_hours) packageData.duration_hours = parseFloat(packageData.duration_hours);
      if (packageData.capacity) packageData.capacity = parseInt(packageData.capacity, 10);

      const response = await fetch("/api/backend/managePackage", {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(packageData)
      });

      const responseText = await response.text();
      const result = JSON.parse(responseText);

      if (response.ok && result.success) {
        resetPackageForm();
        await fetchDashboardData();
        alert(result.message || "Package saved successfully!");
      } else {
        alert(result.message || "Failed to save package");
      }
    } catch (error) {
      console.error("Exception saving package:", error);
      alert(`An error occurred: ${error.message}. Please try again.`);
    }
  };

  const handleFeatureAdd = () => {
    if (newFeature.trim() !== "") {
      setNewPackage((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleFeatureRemove = (index) => {
    setNewPackage((prev) => {
      const updated = [...prev.features];
      updated.splice(index, 1);
      return { ...prev, features: updated };
    });
  };

  const handleEditPackage = (packageData) => {
    let processedFeatures = [];
    if (Array.isArray(packageData.features)) {
      processedFeatures = packageData.features.map((feature) =>
        typeof feature === "object"
          ? feature.feature_name || feature.description || feature.name || ""
          : feature
      );
    }

    setNewPackage({
      name: packageData.name || "",
      description: packageData.description || "",
      price: packageData.price || "",
      capacity: packageData.capacity || "",
      duration_hours: packageData.duration_hours || "",
      location_type: packageData.location_type || "both",
      features: processedFeatures
    });
    setIsEditMode(true);
    setEditPackageId(packageData.package_id || packageData.id);
    setShowAddPackage(true);
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) {
      return;
    }

    try {
      const response = await fetch("/api/backend/deletePackage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: packageId })
      });

      const responseText = await response.text();
      const result = JSON.parse(responseText);

      if (response.ok && result.success) {
        await fetchDashboardData();
        alert("Package deleted successfully!");
      } else {
        alert(result.message || "Failed to delete package");
      }
    } catch (error) {
      console.error("Exception when deleting package:", error);
      alert(`An error occurred: ${error.message}. Please check console for details.`);
    }
  };

  const handleTogglePackageStatus = async (packageId, field, currentValue) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const userId = storedUser?.user_id || storedUser?.id || user?.user_id || user?.id;

      const response = await fetch("/api/backend/managePackage", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          package_id: packageId,
          user_id: userId,
          [field]: currentValue ? 0 : 1
        })
      });

      const result = await response.json();

      if (result.success) {
        setDashboardData((prev) => ({
          ...prev,
          packages: prev.packages.map((pkg) =>
            (pkg.package_id || pkg.id) === packageId
              ? { ...pkg, [field]: currentValue ? 0 : 1 }
              : pkg
          )
        }));
      } else {
        alert(result.message || "Failed to update package status");
      }
    } catch (error) {
      console.error("Error toggling package status:", error);
      alert(`An error occurred: ${error.message}. Please try again.`);
    }
  };

  const resetPackageForm = () => {
    setNewPackage({
      name: "",
      description: "",
      price: "",
      capacity: "",
      duration_hours: "",
      location_type: "both",
      features: []
    });
    setNewFeature("");
    setIsEditMode(false);
    setEditPackageId(null);
    setShowAddPackage(false);
  };

  const statsCards = [
    {
      title: "Total bookings",
      value: dashboardData.stats.totalBookings || 0,
      icon: CalendarRange,
      accent: "from-sky-100 to-blue-100",
      chip: `${dashboardData.stats.pendingBookings || 0} pending · ${dashboardData.stats.completedBookings || 0} completed`
    },
    {
      title: "Revenue to date",
      value: `RM ${(dashboardData.stats.totalRevenue || 0).toLocaleString("en-MY")}`,
      icon: TrendingUp,
      accent: "from-emerald-100 to-teal-100",
      chip:
        dashboardData.stats.revenueGrowth !== undefined &&
        dashboardData.stats.revenueGrowth !== null
          ? `${dashboardData.stats.revenueGrowth >= 0 ? "+" : ""}${dashboardData.stats.revenueGrowth.toFixed(1)}% vs last month`
          : "Growth data unavailable"
    },
    {
      title: "Average rating",
      value:
        dashboardData.stats.averageRating && dashboardData.stats.averageRating > 0
          ? `${dashboardData.stats.averageRating.toFixed(1)} / 5`
          : "No reviews yet",
      icon: Star,
      accent: "from-amber-100 to-orange-100",
      chip: `${dashboardData.stats.totalReviews || 0} customer reviews`
    }
  ];

  const bookingsChartData =
    dashboardData.monthlyRevenue?.map((item) => ({
      month: new Date(item.year, item.month - 1).toLocaleString("default", { month: "long" }),
      bookings: parseInt(item.booking_count)
    })).reverse() || [];

  const revenueChartData =
    dashboardData.monthlyRevenue?.map((item) => ({
      month: new Date(item.year, item.month - 1).toLocaleString("default", { month: "long" }),
      revenue: parseFloat(item.total_revenue)
    })).reverse() || [];

  const pendingBookings = dashboardData.stats.pendingBookings || 0;
  const totalPackages = dashboardData.packages?.length || 0;
  const averageRating = dashboardData.stats.averageRating || 0;

  if (loading) {
    return (
      <div 
        className="flex min-h-screen flex-col items-center justify-center relative"
        style={{
          backgroundImage: 'url("/images/flower-background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative z-10 mb-4 h-12 w-12 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
        <p className="relative z-10 text-sm font-medium text-slate-500">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen"
      style={{
        backgroundImage: 'url("/images/flower-background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      {/* Subtle gradient overlay to maintain the calm aesthetic */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/50 via-transparent to-emerald-50/50" />

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 space-y-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <Card className="relative overflow-hidden border-none bg-white/90 shadow-xl shadow-sky-100/50">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/70 via-white/90 to-emerald-100/60" />
            <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-60 w-60 rounded-full bg-emerald-200/45 blur-3xl" />

            <CardHeader className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <Badge variant="default" className="w-fit bg-sky-100/80 text-sky-700">
                  Service provider portal
                </Badge>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                    Good day, {dashboardData.company_name || provider?.company_name || user?.username || "provider"}.
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-slate-600">
                    Stay on top of bookings, packages, and availability with a calmer workspace tailored for compassionate services.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-sky-100">
                    <Users size={16} className="text-sky-500" />
                    {dashboardData.stats.totalBookings || 0} lifetime bookings
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-sky-100">
                    <MapPin size={16} className="text-emerald-500" />
                    Serving {provider?.service_area || "multiple regions"}
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-sky-100">
                    <Star size={16} className="text-amber-500" />
                    {averageRating ? `${averageRating.toFixed(1)}/5 satisfaction` : "Awaiting first reviews"}
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-xs flex-col gap-3">
                <Button
                  variant="outline"
                  className="justify-between border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100"
                  onClick={() => router.push("/profile-settings")}
                >
                  <span className="flex items-center gap-2">
                    <Settings size={18} />
                    Manage account
                  </span>
                  <span className="text-xs text-slate-400">Profile & billing</span>
                </Button>
                <Button
                  variant="soft"
                  className="justify-center bg-rose-100/80 text-rose-600 hover:bg-rose-100"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  Sign out
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none bg-white/85 shadow-lg shadow-sky-100/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Today at a glance
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Focus on gentle priorities that keep families supported.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: ClipboardList,
                  tone: "bg-sky-50/80 text-sky-600",
                  title: `${pendingBookings} booking${pendingBookings === 1 ? "" : "s"} waiting for action`,
                  text: "Confirm or reschedule to reassure families promptly."
                },
                {
                  icon: Package,
                  tone: "bg-emerald-50/80 text-emerald-600",
                  title: `${totalPackages} package${totalPackages === 1 ? "" : "s"} live on your profile`,
                  text: "Keep offerings updated with seasonal touches and add-ons."
                },
                {
                  icon: Star,
                  tone: "bg-amber-50/80 text-amber-600",
                  title: averageRating
                    ? `Average rating ${averageRating.toFixed(1)} / 5`
                    : "Collect first reviews",
                  text: averageRating
                    ? "Kind words help families feel confident choosing you."
                    : "Invite families to share feedback after ceremonies."
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100/80 bg-white/90 px-4 py-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", item.tone)}>
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  className="border-none bg-white/85 shadow-md shadow-sky-100/40 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        {card.title}
                      </span>
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-700",
                          card.accent
                        )}
                      >
                        <Icon size={18} />
                      </span>
                    </div>
                    <p className="text-3xl font-semibold text-slate-900">{card.value}</p>
                    <CardDescription className="text-sm text-slate-500">
                      {card.chip}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {tabItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <Button
                    key={item.key}
                    variant="ghost"
                    type="button"
                    className={cn(
                      "group flex items-center gap-2 rounded-2xl border border-transparent px-5 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-200 hover:bg-sky-500"
                        : "border-sky-100/70 bg-white/80 text-sky-700 shadow-sm hover:border-sky-200 hover:bg-white"
                    )}
                    onClick={() => setActiveTab(item.key)}
                  >
                    <Icon size={16} className={cn(!isActive && "text-sky-500")} />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "group flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all",
                  "border-sky-100/70 bg-sky-100/70 text-sky-700 shadow-sm hover:border-sky-200 hover:bg-sky-100"
                )}
                onClick={() => router.push("/provider-bookings")}
              >
                <ClipboardList size={16} className="text-sky-500" />
                <span>Open booking manager</span>
                {pendingBookings > 0 && (
                  <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-sky-600">
                    {pendingBookings}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="group flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-white"
                onClick={() => router.push("/manage-addons")}
              >
                <PlusCircle size={16} className="text-slate-500" />
                <span>Manage add-ons</span>
              </Button>
            </div>
          </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-none bg-white/90 shadow-md shadow-sky-100/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Bookings trend</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Monthly ceremonies and services secured by families.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <BookingsBarChart data={bookingsChartData} />
                  </CardContent>
                </Card>

                <Card className="border-none bg-white/90 shadow-md shadow-sky-100/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Revenue overview</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Track earnings across recent months.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <RevenueBarChart data={revenueChartData} />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-none bg-white/90 shadow-md shadow-sky-100/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Recent bookings</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Families who reached out most recently.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.recentBookings.length > 0 ? (
                      dashboardData.recentBookings.map((booking, index) => (
                        <div
                          key={`${booking.id}-${index}`}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{booking.customer_name}</p>
                            <p className="text-xs text-slate-500">{booking.package_name}</p>
                            <p className="text-xs text-slate-400">{booking.service_date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700">
                              RM {Number(booking.total_amount).toLocaleString("en-MY")}
                            </p>
                            <Badge
                              className={cn(
                                "mt-1",
                                booking.status === "pending" && "bg-amber-100 text-amber-700",
                                booking.status === "confirmed" && "bg-sky-100 text-sky-700",
                                booking.status === "completed" && "bg-emerald-100 text-emerald-700",
                                !["pending", "confirmed", "completed"].includes(booking.status) &&
                                  "bg-slate-100 text-slate-600"
                              )}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-10 text-center text-sm text-slate-500">
                        You have no recent bookings. When families reach out, they will appear here.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none bg-white/90 shadow-md shadow-sky-100/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Recent reviews</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Heartfelt words from families you have supported.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.recentReviews.length > 0 ? (
                      dashboardData.recentReviews.map((review, index) => (
                        <div
                          key={`${review.id}-${index}`}
                          className="rounded-2xl border border-slate-100 bg-gradient-to-r from-amber-50/60 via-white to-white px-5 py-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/80 text-sm font-semibold text-white shadow-md">
                                {review.reviewer_name?.charAt(0)?.toUpperCase() ||
                                  review.customer_name?.charAt(0)?.toUpperCase() ||
                                  "F"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {review.reviewer_name || review.customer_name}
                                </p>
                                <p className="text-xs text-slate-400">{review.reviewer_email}</p>
                                <p className="text-xs text-sky-500">Package: {review.package_name}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={cn(
                                      "text-amber-300",
                                      i < review.rating ? "fill-amber-300" : "opacity-30"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-400">
                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                              </span>
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="mt-3 text-sm italic text-slate-600">"{review.review_text}"</p>
                          )}
                          {review.review_category && (
                            <Badge className="mt-3 bg-sky-100 text-sky-700">
                              {review.review_category}
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-10 text-center text-sm text-slate-500">
                        Reviews will appear here after completed services. Invite families to share their experience.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "packages" && (
            <Card className="border-none bg-white/92 shadow-lg shadow-sky-100/50">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                    <Package size={22} className="text-sky-500" />
                    My packages
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    {totalPackages} {totalPackages === 1 ? "offering" : "offerings"} published for families to explore.
                  </CardDescription>
                </div>
                <Button
                  className="bg-sky-500 text-white hover:bg-sky-500/90"
                  onClick={() => setShowAddPackage(true)}
                >
                  <PlusCircle size={18} />
                  Create package
                </Button>
              </CardHeader>
              <CardContent>
                {dashboardData.packages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {dashboardData.packages.map((pkg) => (
                      <Card
                        key={pkg.package_id || pkg.id}
                        className="flex h-full flex-col border border-slate-200/70 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <CardHeader className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <CardTitle className="text-xl text-slate-900">{pkg.name}</CardTitle>
                              <CardDescription className="text-sm text-slate-500">
                                RM {Number(pkg.price).toLocaleString("en-MY")} • {pkg.capacity || "N/A"} guests • {pkg.duration_hours || "N/A"} hours
                              </CardDescription>
                            </div>
                            {pkg.is_featured ? (
                              <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                            ) : (
                              <Badge variant="muted" className="bg-slate-100 text-slate-500">
                                Standard
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            <Badge variant="outline" className="border-slate-200 bg-white/80">
                              {pkg.location_type === "both"
                                ? "Indoor & outdoor"
                                : pkg.location_type === "home"
                                  ? "Indoor only"
                                  : "Outdoor only"}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 bg-white/80">
                              {pkg.booking_count || 0} booking{(pkg.booking_count || 0) === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4">
                          <p className="text-sm text-slate-600">
                            {pkg.description || "No description available yet. Share thoughtful details about this service."}
                          </p>
                          {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Includes
                              </p>
                              <ul className="space-y-1">
                                {pkg.features.slice(0, 4).map((feature, featureIndex) => (
                                  <li key={featureIndex} className="flex items-start gap-2 text-sm text-slate-600">
                                    <CheckCircle2 size={14} className="mt-0.5 text-emerald-500" />
                                    <span>
                                      {typeof feature === "object"
                                        ? feature.feature_name || feature.description || "Additional service"
                                        : feature}
                                    </span>
                                  </li>
                                ))}
                                {pkg.features.length > 4 && (
                                  <li className="ml-6 text-xs text-sky-500">
                                    +{pkg.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <Star size={15} className="text-amber-500" />
                                Featured package
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTogglePackageStatus(pkg.package_id || pkg.id, "is_featured", pkg.is_featured)}
                                className={cn(
                                  "relative inline-flex h-6 w-11 items-center rounded-full transition",
                                  pkg.is_featured ? "bg-amber-400" : "bg-slate-300"
                                )}
                              >
                                <span
                                  className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    pkg.is_featured ? "translate-x-6" : "translate-x-1"
                                  )}
                                />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <Users size={15} className="text-emerald-500" />
                                Visible to families
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTogglePackageStatus(pkg.package_id || pkg.id, "is_active", pkg.is_active)}
                                className={cn(
                                  "relative inline-flex h-6 w-11 items-center rounded-full transition",
                                  pkg.is_active ? "bg-emerald-400" : "bg-slate-300"
                                )}
                              >
                                <span
                                  className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    pkg.is_active ? "translate-x-6" : "translate-x-1"
                                  )}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              variant="soft"
                              className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200"
                              onClick={() => handleEditPackage(pkg)}
                            >
                              Edit package
                            </Button>
                            <Button
                              variant="soft"
                              className="flex-1 bg-rose-100/80 text-rose-600 hover:bg-rose-100"
                              onClick={() => handleDeletePackage(pkg.package_id || pkg.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/85 py-16 text-center shadow-inner shadow-slate-100">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
                      <Package size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">No packages yet</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Create your first package to share meaningful services and help families choose with confidence.
                    </p>
                    <Button
                      className="mt-6 bg-sky-500 text-white hover:bg-sky-500/90"
                      onClick={() => setShowAddPackage(true)}
                    >
                      <PlusCircle size={18} />
                      Create your first package
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "availability" && (
            <Card className="border-none bg-white/90 shadow-lg shadow-sky-100/50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Availability calendar</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Toggle dates to keep families informed about when you can serve them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                  Click on any date to mark it as available (emerald) or unavailable (rose). Availability updates instantly for families browsing your profile.
                </p>
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-inner shadow-slate-100">
                  <CalendarAvailability providerId={provider?.provider_id} />
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {showAddPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border-none bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-slate-900">
                  {isEditMode ? "Edit package" : "Create a new package"}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Describe the services, support and meaningful touches included in this offering.
                </CardDescription>
              </div>
              <Button
                variant="soft"
                className="bg-slate-100 text-slate-600 hover:bg-slate-200"
                onClick={resetPackageForm}
              >
                Close
              </Button>
            </CardHeader>
            <form onSubmit={handleAddPackage}>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Package name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      value={newPackage.name}
                      onChange={(event) =>
                        setNewPackage((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Graceful farewell, Harmony tribute..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Price (RM) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      value={newPackage.price}
                      onChange={(event) =>
                        setNewPackage((prev) => ({ ...prev, price: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="3000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <textarea
                    rows={4}
                    value={newPackage.description}
                    onChange={(event) =>
                      setNewPackage((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Share how this package gently supports families through the ceremony."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Capacity</label>
                    <input
                      type="number"
                      value={newPackage.capacity}
                      onChange={(event) =>
                        setNewPackage((prev) => ({ ...prev, capacity: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Guests supported"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Duration (hours)</label>
                    <input
                      type="number"
                      value={newPackage.duration_hours}
                      onChange={(event) =>
                        setNewPackage((prev) => ({ ...prev, duration_hours: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Eg. 4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Location type</label>
                    <select
                      value={newPackage.location_type}
                      onChange={(event) =>
                        setNewPackage((prev) => ({ ...prev, location_type: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="both">Indoor & outdoor</option>
                      <option value="home">Indoor only</option>
                      <option value="venue">Outdoor only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600">
                    Signature touches (features)
                  </label>
                  <div className="space-y-2">
                    {newPackage.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                      >
                        <span>{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleFeatureRemove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={newFeature}
                      onChange={(event) => setNewFeature(event.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Eg. Floral tribute setup, live streaming, memorial video"
                    />
                    <Button
                      type="button"
                      variant="soft"
                      className="bg-sky-100 text-sky-600 hover:bg-sky-200"
                      onClick={handleFeatureAdd}
                    >
                      Add feature
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-500 hover:bg-white"
                  onClick={resetPackageForm}
                >
                  Cancel
                </Button>
                <Button className="bg-sky-500 text-white hover:bg-sky-500/90" type="submit">
                  {isEditMode ? "Update package" : "Save package"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

