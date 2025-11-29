'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Eye, MessageSquare, Flower2, Users, Calendar, TrendingUp, Clock, Filter, MapPin, X, ChevronDown, SortAsc, SortDesc } from "lucide-react";
import { BACKEND_URL } from "../config";
import "./TributeHome.css";

export default function TributeHome() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tributes, setTributes] = useState([]);
  const [filteredTributes, setFilteredTributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("recent"); // recent, popular, oldest
  const [sortBy, setSortBy] = useState("recent"); // recent, popular, oldest, alphabetical, views, messages, flowers
  const [dateFilter, setDateFilter] = useState("all"); // all, thisMonth, thisYear, last30Days, lastYear
  const [yearFilter, setYearFilter] = useState(""); // Filter by birth year or death year
  const [locationFilter, setLocationFilter] = useState(""); // Filter by location
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  // Helper function to construct full image URL
  const getImageUrl = (path) => {
    if (!path) return null;

    // If path is a Supabase URL, use as-is
    if (path.includes('supabase.co')) return path;

    // If path already contains full URL, return as-is
    if (path.startsWith('http')) return path;

    // If path starts with 'uploads/', add base URL
    if (path.startsWith('uploads/')) return `${BACKEND_URL.replace('/backend', '')}/${path}`;

    // Otherwise, assume it's a relative path from backend
    return `${BACKEND_URL.replace('/backend', '')}/${path}`;
  };

  useEffect(() => {
    // Get user info and fetch tributes
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchTributes(); // Fetch immediately on mount
  }, []); // Run once on mount

  useEffect(() => {
    // Re-fetch tributes when filterType, sortBy, or currentPage changes
    fetchTributes();
  }, [filterType, sortBy, currentPage, dateFilter, yearFilter, locationFilter]);

  useEffect(() => {
    // Filter tributes based on search query and client-side filters
    let filtered = [...tributes];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(tribute =>
        tribute.deceased_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tribute.date_of_birth?.includes(searchQuery) ||
        tribute.date_of_death?.includes(searchQuery) ||
        tribute.location_of_birth?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tribute.grave_location_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Year filter
    if (yearFilter) {
      filtered = filtered.filter(tribute => {
        const birthYear = tribute.date_of_birth ? new Date(tribute.date_of_birth).getFullYear() : null;
        const deathYear = tribute.date_of_death ? new Date(tribute.date_of_death).getFullYear() : null;
        return birthYear === parseInt(yearFilter) || deathYear === parseInt(yearFilter);
      });
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(tribute =>
        tribute.location_of_birth?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        tribute.grave_location_name?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Date range filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(tribute => {
        if (!tribute.date_of_death) return false;
        const deathDate = new Date(tribute.date_of_death);

        switch (dateFilter) {
          case "thisMonth":
            return deathDate.getMonth() === now.getMonth() && deathDate.getFullYear() === now.getFullYear();
          case "thisYear":
            return deathDate.getFullYear() === now.getFullYear();
          case "last30Days":
            const daysDiff = (now - deathDate) / (1000 * 60 * 60 * 24);
            return daysDiff >= 0 && daysDiff <= 30;
          case "lastYear":
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return deathDate >= oneYearAgo && deathDate <= now;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return (a.deceased_name || "").localeCompare(b.deceased_name || "");
        case "views":
          return (b.view_count || 0) - (a.view_count || 0);
        case "messages":
          return (b.message_count || 0) - (a.message_count || 0);
        case "flowers":
          return (b.flower_count || 0) - (a.flower_count || 0);
        case "popular":
          const aScore = (a.message_count || 0) + (a.flower_count || 0) + (a.view_count || 0);
          const bScore = (b.message_count || 0) + (b.flower_count || 0) + (b.view_count || 0);
          return bScore - aScore;
        case "oldest":
          const aDate = a.date_of_death ? new Date(a.date_of_death) : new Date(0);
          const bDate = b.date_of_death ? new Date(b.date_of_death) : new Date(0);
          return aDate - bDate;
        case "recent":
        default:
          const aCreated = a.created_at ? new Date(a.created_at) : new Date(0);
          const bCreated = b.created_at ? new Date(b.created_at) : new Date(0);
          return bCreated - aCreated;
      }
    });

    setFilteredTributes(filtered);
  }, [searchQuery, tributes, yearFilter, locationFilter, dateFilter, sortBy]);

  const fetchTributes = async () => {
    setLoading(true);
    setError("");
    try {
      // Build URL with user_id if logged in (to show private tributes to their creators)
      let url = `/api/backend/getTributes?filter=${filterType}&page=${currentPage}&limit=${itemsPerPage}`;
      if (user?.user_id) {
        url += `&user_id=${user.user_id}`;
      }

      const response = await fetch(url, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();

      // Handle standardized API response format: { success: true, data: { tributes: [...], pagination: {...} } }
      const tributes = data.data?.tributes || data.tributes || [];
      const pagination = data.data?.pagination || data.pagination || {};

      if (data.success) {
        setTributes(tributes);
        setFilteredTributes(tributes);
        setTotalPages(pagination.total_pages || 1);
      } else {
        setError(data.message || "Failed to load tributes");
      }
    } catch (err) {
      console.error("Error fetching tributes:", err);
      setError("Failed to load tributes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    setSortBy(newFilter);
    setCurrentPage(1); // Reset to first page
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setYearFilter("");
    setLocationFilter("");
    setSortBy("recent");
    setFilterType("recent");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || dateFilter !== "all" || yearFilter || locationFilter;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled by useEffect above
  };

  return (
    <div className="tribute-home">
      {/* Professional Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tribute-hero-header"
      >
        <div className="hero-content">
          <h1>Memorial Tributes</h1>
          <p className="hero-subtitle">
            Honor and remember loved ones with heartfelt tributes, shared memories, and meaningful connections
          </p>
          {user?.role === "family" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/tribute/create")}
              className="hero-create-btn"
            >
              <Plus className="w-5 h-5" />
              Create New Tribute
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="tribute-home-container">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="search-section"
        >
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search tributes by name, date, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="clear-search-btn"
                >
                  ×
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Quick Filters & Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="filter-section"
        >
          {/* Quick Date Filters */}
          <div className="quick-filters">
            <div className="quick-filter-group">
              <span className="filter-label">Time Period:</span>
              <div className="quick-filter-buttons">
                <button
                  className={`quick-filter-btn ${dateFilter === "all" ? "active" : ""}`}
                  onClick={() => setDateFilter("all")}
                >
                  All Time
                </button>
                <button
                  className={`quick-filter-btn ${dateFilter === "last30Days" ? "active" : ""}`}
                  onClick={() => setDateFilter("last30Days")}
                >
                  Last 30 Days
                </button>
                <button
                  className={`quick-filter-btn ${dateFilter === "thisMonth" ? "active" : ""}`}
                  onClick={() => setDateFilter("thisMonth")}
                >
                  This Month
                </button>
                <button
                  className={`quick-filter-btn ${dateFilter === "thisYear" ? "active" : ""}`}
                  onClick={() => setDateFilter("thisYear")}
                >
                  This Year
                </button>
                <button
                  className={`quick-filter-btn ${dateFilter === "lastYear" ? "active" : ""}`}
                  onClick={() => setDateFilter("lastYear")}
                >
                  Last Year
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="sort-group">
              <label className="sort-label">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setFilterType(e.target.value);
                }}
                className="sort-select"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">Name (A-Z)</option>
                <option value="views">Most Views</option>
                <option value="messages">Most Messages</option>
                <option value="flowers">Most Flowers</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="filter-actions">
            <button
              className="advanced-filter-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? "Hide" : "Show"} Filters
              <ChevronDown className={`w-4 h-4 ${showAdvancedFilters ? "rotated" : ""}`} />
            </button>

            {hasActiveFilters && (
              <button
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}

            {/* Results Count */}
            {!loading && (
              <div className="results-count">
                <span className="results-number">{filteredTributes.length}</span>
                <span className="results-label">
                  {filteredTributes.length === 1 ? 'Tribute' : 'Tributes'}
                </span>
              </div>
            )}
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="advanced-filters-panel"
              >
                <div className="advanced-filter-row">
                  <div className="advanced-filter-item">
                    <label className="filter-input-label">
                      <Calendar className="w-4 h-4" />
                      Filter by Year (Birth or Death)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2024 (matches birth year or death year)"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="filter-input"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    <p className="filter-hint">
                      Shows tributes where the birth year or death year matches
                    </p>
                  </div>

                  <div className="advanced-filter-item">
                    <label className="filter-input-label">
                      <MapPin className="w-4 h-4" />
                      Filter by Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, State, or Country"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="tributes-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="tribute-card skeleton-card">
                <div className="skeleton-image"></div>
                <div className="tribute-card-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-stats">
                    <div className="skeleton-stat"></div>
                    <div className="skeleton-stat"></div>
                    <div className="skeleton-stat"></div>
                  </div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="error-state"
          >
            <p>❌ {error}</p>
            <button onClick={fetchTributes}>Retry</button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTributes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state"
          >
            <div className="empty-icon">🌸</div>
            <h3>No Tributes Found</h3>
            <p>
              {searchQuery
                ? "Try a different search term"
                : "Be the first to create a memorial tribute"}
            </p>
            {user?.role === "family" && !searchQuery && (
              <button
                onClick={() => router.push("/tribute/create")}
                className="empty-create-btn"
              >
                + Create First Tribute
              </button>
            )}
          </motion.div>
        )}

        {/* Tributes Grid */}
        {!loading && !error && filteredTributes.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="tributes-grid"
            >
              <AnimatePresence>
                {filteredTributes.map((tribute, index) => (
                  <motion.div
                    key={tribute.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="tribute-card"
                    onClick={() => router.push(`/tribute/${tribute.id}`)}
                  >
                    {/* Card Image */}
                    <div className="tribute-card-image">
                      {/* Privacy Badge (only show if user is the creator and it's private) */}
                      {user?.user_id === tribute.created_by && tribute.is_public === 0 && (
                        <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Private
                        </div>
                      )}
                      {tribute.portrait_photo ? (
                        <img
                          src={getImageUrl(tribute.portrait_photo)}
                          alt={tribute.deceased_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="tribute-card-placeholder"><span>🕊️</span></div>';
                          }}
                        />
                      ) : (
                        <div className="tribute-card-placeholder">
                          <span>🕊️</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="tribute-card-content">
                      <h3>{tribute.deceased_name}</h3>
                      <p className="tribute-dates">
                        {(() => {
                          const formatDate = (dateString) => {
                            if (!dateString) return "N/A";
                            try {
                              const date = new Date(dateString);
                              if (isNaN(date.getTime())) return "N/A";
                              return date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            } catch (e) {
                              return "N/A";
                            }
                          };
                          const birthDate = tribute.date_of_birth || tribute.birth_date;
                          const deathDate = tribute.date_of_death || tribute.death_date;
                          return `${formatDate(birthDate)} — ${formatDate(deathDate)}`;
                        })()}
                      </p>

                      {/* Stats */}
                      <div className="tribute-card-stats">
                        <div className="stat-item">
                          <Eye className="w-4 h-4 stat-icon" />
                          <span className="stat-value">{tribute.view_count || 0}</span>
                          <span className="stat-label">Views</span>
                        </div>
                        <div className="stat-item">
                          <MessageSquare className="w-4 h-4 stat-icon" />
                          <span className="stat-value">{tribute.message_count || 0}</span>
                          <span className="stat-label">Messages</span>
                        </div>
                        <div className="stat-item">
                          <Flower2 className="w-4 h-4 stat-icon" />
                          <span className="stat-value">{tribute.flower_count || 0}</span>
                          <span className="stat-label">Flowers</span>
                        </div>
                      </div>

                      {/* View Button */}
                      <button className="view-tribute-btn">
                        View Tribute →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pagination"
              >
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  <span className="current-page">{currentPage}</span>
                  <span className="page-separator">/</span>
                  <span className="total-pages">{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
}


