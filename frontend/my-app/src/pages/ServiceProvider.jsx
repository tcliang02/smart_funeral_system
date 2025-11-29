'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Star,
  Calendar,
  Filter,
  Compass,
  Users,
  Leaf
} from "lucide-react";
import { providers as initialProviders } from "../data/providers";
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
import { Input } from "../components/ui/shadcn/input";
import { Select } from "../components/ui/shadcn/select";
import { Label } from "../components/ui/shadcn/label";

export default function ServiceProvider() {
  const [providers, setProviders] = useState(initialProviders);
  const [filters, setFilters] = useState({
    location: "",
    priceRange: "",
    rating: "",
    date: ""
  });
  const router = useRouter();

  // ✅ Simulate real-time updates (if provider dashboard changes providers)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedData = JSON.parse(localStorage.getItem("providersData"));
      if (updatedData) setProviders(updatedData);
    };

    const savedData = JSON.parse(localStorage.getItem("providersData"));
    if (savedData) setProviders(savedData);

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setFilters({
      location: "",
      priceRange: "",
      rating: "",
      date: ""
    });
  };

  // ✅ Apply filters
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      if (
        filters.location &&
        !provider.location?.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (filters.date && !provider.availableDates?.includes(filters.date)) {
        return false;
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-").map(Number);
        const hasPackageInRange = provider.packages?.some(
          (pkg) => pkg.price >= min && pkg.price <= max
        );
        if (!hasPackageInRange) return false;
      }

      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        const providerRating = provider.rating || 4.5;
        if (providerRating < minRating) return false;
      }

      return true;
    });
  }, [providers, filters]);

  // ✅ Get price range for a provider
  const getProviderPriceRange = (provider) => {
    if (!provider.packages || provider.packages.length === 0) return "Contact for pricing";
    const prices = provider.packages.map(p => p.price).sort((a, b) => a - b);
    return `RM${prices[0].toLocaleString()} - RM${prices[prices.length - 1].toLocaleString()}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-emerald-50 py-16">
      <div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-br from-sky-100/80 via-transparent to-emerald-100/70 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-[1.4fr,1fr]"
        >
          <Card className="relative overflow-hidden border-none bg-white/80 shadow-lg shadow-sky-100/40">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-white/90 to-emerald-100/70" />
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
            <CardHeader className="relative space-y-6">
              <Badge variant="default" className="w-fit bg-emerald-100/70 text-emerald-700">
                Compassionate marketplace
              </Badge>
              <CardTitle className="text-3xl font-semibold leading-snug text-slate-900 md:text-4xl">
                Discover trusted funeral partners that honor every farewell.
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-slate-600">
                Compare carefully curated service providers, explore thoughtful packages,
                and book support that matches your family’s traditions and budget.
              </CardDescription>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm">
                  <Leaf size={16} className="text-emerald-500" />
                  Gentle guidance included
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm">
                  <Sparkles size={16} className="text-sky-500" />
                  Personalised memorial ideas
                </span>
              </div>
            </CardHeader>
            <CardFooter className="relative flex flex-col gap-4 border-t border-slate-100/70 bg-white/70 py-6 md:flex-row md:items-center">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <Users size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Compassion verified</p>
                  <p>Providers trained to support grieving families</p>
                </div>
              </div>
              <div className="flex flex-1 justify-end gap-3">
                <Button
                  variant="soft"
                  className="flex-1 bg-white text-slate-700 shadow-sm hover:bg-slate-100 md:flex-none"
                  onClick={() => router.push("/contact")}
                >
                  Learn about our process
                </Button>
                <Button
                  className="flex-1 bg-sky-500/90 hover:bg-sky-500 md:flex-none"
                  onClick={() => router.push("/register?role=provider")}
                >
                  Join as provider
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="border-none bg-white/80 shadow-lg shadow-sky-100/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Compass size={18} className="text-sky-500" />
                Calm planning insights
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-slate-500">
                How families are finding support this week.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-3 rounded-2xl bg-sky-50/60 p-4 text-sm text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Kuala Lumpur &amp; Penang are the most requested locations</p>
                  <p>Families favour providers who offer 24/7 support and on-site ceremony coordination.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/70 p-4 text-sm text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Star size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Top packages include live streaming &amp; memorial keepsakes</p>
                  <p>Premium packages with digital tributes help distant relatives participate meaningfully.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 text-sm text-slate-600 shadow-inner shadow-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Average lead time is 2–3 days</p>
                  <p>Reserve your preferred provider early to secure venue, rituals, and family logistics.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Filters */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none bg-white/85 shadow-lg shadow-sky-100/30">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Filter size={18} className="text-sky-500" />
                  Refine support options
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Tailor recommendations by location, budget, rating, or availability.
                </CardDescription>
              </div>
              <Button variant="ghost" className="text-sky-600" onClick={clearFilters}>
                Reset filters
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  id="location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                >
                  <option value="">All locations</option>
                  <option value="Kuala Lumpur">Kuala Lumpur</option>
                  <option value="Selangor">Selangor</option>
                  <option value="Penang">Penang</option>
                  <option value="Johor">Johor</option>
                  <option value="Perak">Perak</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRange">Price range</Label>
                <Select
                  id="priceRange"
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                >
                  <option value="">All prices</option>
                  <option value="0-2000">RM0 - RM2,000</option>
                  <option value="2000-4000">RM2,000 - RM4,000</option>
                  <option value="4000-6000">RM4,000 - RM6,000</option>
                  <option value="6000-999999">RM6,000+</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Minimum rating</Label>
                <Select
                  id="rating"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                >
                  <option value="">All ratings</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4.0">4.0+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                  <option value="3.0">3.0+ stars</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Service date</Label>
                <Input
                  id="date"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Results */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Badge variant="muted" className="bg-white/70 text-slate-600">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""} available
              </Badge>
              <span className="text-sm text-slate-500">
                Curated and sorted by overall family satisfaction
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full border-none bg-white/85 shadow-md shadow-sky-100/40 transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative flex items-start gap-4 px-6 pb-2 pt-6">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-white to-emerald-100 shadow-inner">
                        {provider.logo ? (
                          <img
                            src={provider.logo}
                            alt={provider.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <Leaf className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-xl font-semibold text-slate-900">
                            {provider.name}
                          </h3>
                          <div className="flex items-center gap-1 rounded-full bg-amber-50/80 px-3 py-1 text-sm text-amber-600">
                            <Star size={16} className="fill-amber-400 text-amber-400" />
                            {(provider.rating || 4.5).toFixed(1)}
                            <span className="text-xs text-amber-700/80">
                              ({provider.reviews || 12} reviews)
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1 rounded-full bg-sky-50/80 px-3 py-1">
                            <MapPin size={14} className="text-sky-500" />
                            {provider.location || "Kuala Lumpur"}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-emerald-50/70 px-3 py-1">
                            <Calendar size={14} className="text-emerald-500" />
                            {provider.workingHours || "9:00 AM - 6:00 PM"}
                          </span>
                          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-600 shadow-sm">
                            {provider.packages?.length || 3} curated packages
                          </span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                        <span>Gentle pricing guidance</span>
                        <span className="font-semibold text-slate-900">
                          {getProviderPriceRange(provider)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">
                          Service highlights
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provider.packages?.slice(0, 3).map((pkg) => (
                            <Badge
                              key={pkg.name}
                              variant="outline"
                              className="border-slate-200 bg-white/70 text-slate-600"
                            >
                              {pkg.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 border-t border-slate-100/70 bg-white/80 pt-4 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm text-slate-500">
                        {filters.date && provider.availableDates?.includes(filters.date) ? (
                          <span className="flex items-center gap-2 rounded-full bg-emerald-50/80 px-3 py-1 text-emerald-600">
                            <Calendar size={14} />
                            Available on your selected date
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            Next available: {provider.availableDates?.[0] ?? "Contact us"}
                          </span>
                        )}
                      </div>
                      <Button
                        className="w-full md:w-auto"
                        onClick={() => router.push(`/provider/${provider.id}`)}
                      >
                        View details
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                className="col-span-full rounded-3xl border border-dashed border-sky-200 bg-white/80 p-12 text-center text-slate-500 shadow-inner"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-400">
                  <Compass size={26} />
                </div>
                <h3 className="text-lg font-medium text-slate-700">No providers match your filters</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Adjust your criteria or explore nearby states to discover compassionate partners.
                </p>
                <Button variant="ghost" className="mt-6 text-sky-600" onClick={clearFilters}>
                  Clear filters
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
