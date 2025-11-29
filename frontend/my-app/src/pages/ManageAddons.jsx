'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  PlusCircle,
  ClipboardList
} from "lucide-react";
import { Button } from "../components/ui/shadcn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "../components/ui/shadcn/card";
import { Badge } from "../components/ui/shadcn/badge";
import { cn } from "../lib/utils";
import { logger } from "@/lib/logger";

export default function ManageAddons() {
  const [activeTab, setActiveTab] = useState("my-addons"); // 'my-addons', 'templates', 'create-custom'
  const [loading, setLoading] = useState(true);
  const [myAddons, setMyAddons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingAddon, setEditingAddon] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Initialize navigation
  const router = useRouter();

  // Get provider ID from localStorage - check both user.provider_id and provider.provider_id
  const [user, setUser] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [providerId, setProviderId] = useState(null);

  // Load user and provider data on mount and set up listener
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        const providerDataStr = localStorage.getItem("provider");

        let parsedUser = null;
        let parsedProvider = null;
        let id = null;

        if (userData) {
          try {
            parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        if (providerDataStr) {
          try {
            parsedProvider = JSON.parse(providerDataStr);
            setProviderData(parsedProvider);
            if (parsedProvider?.provider_id) {
              id = parsedProvider.provider_id;
            }
          } catch (e) {
            console.error('Error parsing provider data:', e);
          }
        }

        // Also try to get provider_id from user object if available
        if (!id && parsedUser?.provider_id) {
          id = parsedUser.provider_id;
        }

        logger.debug('Loading user data', {
          hasUser: !!parsedUser,
          hasProvider: !!parsedProvider,
          providerId: id
        });
        setProviderId(id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error loading user data', error instanceof Error ? error : new Error(errorMessage));
      }
    };

    loadUserData();

    // Listen for storage changes (if user logs in in another tab)
    window.addEventListener('storage', loadUserData);

    return () => {
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  useEffect(() => {
    if (providerId) {
      logger.debug('Provider ID available, fetching data', { providerId });
      fetchMyAddons();
      fetchTemplates();
    }
    // Note: providerId may be null on initial mount - this is expected
    // The effect will run again once providerId is loaded from localStorage
  }, [providerId]);

  const fetchMyAddons = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/backend/getProviderAddons", {
        method: "POST",
        headers,
        body: JSON.stringify({ provider_id: providerId }),
      });
      const data = await response.json();

      // Handle standardized API response format
      const addons = data.data?.addons || data.addons || [];

      if (data.success) {
        setMyAddons(addons);
      }
    } catch (error) {
      logger.error('Error fetching addons', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/backend/getAddonTemplates", {
        headers,
      });
      const data = await response.json();

      // Handle standardized API response format
      const categories = data.data?.categories || data.categories || [];

      if (data.success) {
        setCategories(categories);
        if (categories.length > 0) {
          setSelectedCategory(categories[0].category_id);
        }
      }
    } catch (error) {
      logger.error('Error fetching templates', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleAddFromTemplate = async (template, customPrice) => {
    try {
      const payload = {
        provider_id: providerId,
        template_id: template.template_id,
        addon_name: template.template_name,
        description: template.description,
        price: customPrice || template.suggested_price,
        category_id: template.category_id,
        is_custom: 0,
      };

      logger.debug('Adding addon from template', {
        templateId: template.template_id,
        providerId,
        price: customPrice || template.suggested_price
      });

      if (!providerId) {
        alert("❌ Error: Provider ID not found. Please logout and login again.");
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/backend/addProviderAddon", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      logger.debug('Add addon response', { success: data.success });

      if (data.success) {
        alert("✅ Add-on service added successfully!");
        fetchMyAddons();
        setShowAddModal(false);
        setSelectedTemplate(null);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      logger.error('Error adding addon', error instanceof Error ? error : new Error(String(error)));
      alert("❌ Error adding add-on service");
    }
  };

  const handleUpdateAddon = async (addonId, updates) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/backend/updateProviderAddon", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          addon_id: addonId,
          ...updates,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Add-on updated successfully!");
        fetchMyAddons();
        setEditingAddon(null);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      logger.error('Error updating addon', error instanceof Error ? error : new Error(String(error)));
      alert("❌ Error updating add-on");
    }
  };

  const handleDeleteAddon = async (addonId) => {
    if (!confirm("Are you sure you want to delete this add-on service?")) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/backend/deleteProviderAddon", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ addon_id: addonId }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Add-on deleted successfully!");
        fetchMyAddons();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      logger.error('Error deleting addon', error instanceof Error ? error : new Error(String(error)));
      alert("❌ Error deleting add-on");
    }
  };

  const handleToggleActive = async (addon) => {
    await handleUpdateAddon(addon.addon_id, {
      addon_name: addon.addon_name,
      description: addon.description,
      price: addon.price,
      is_active: addon.is_active ? 0 : 1,
    });
  };

  const handleCreateCustomAddon = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const payload = {
      provider_id: providerId,
      template_id: null,
      addon_name: formData.get("addon_name"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price")),
      category_id: parseInt(formData.get("category_id")),
      is_custom: 1,
    };

    logger.debug('Creating custom addon', {
      providerId,
      addonName: formData.get("addon_name"),
      price: parseFloat(formData.get("price"))
    });

    if (!providerId) {
      alert("❌ Error: Provider ID not found. Please logout and login again.");
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/backend/addProviderAddon", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      logger.debug('Custom addon response', { success: data.success });

      if (data.success) {
        alert("✅ Custom add-on created successfully!");
        fetchMyAddons();
        e.target.reset();
        setActiveTab("my-addons");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      console.error("Error creating custom addon:", error);
      alert("❌ Error creating custom add-on");
    }
  };

  if (!providerId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50/70 to-emerald-50 px-4">
        <Card className="max-w-md border border-rose-100 bg-white/95 text-center shadow-lg shadow-rose-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-rose-600">Access denied</CardTitle>
            <CardDescription className="text-sm text-rose-500">
              Please sign in as a service provider to manage offerings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-left text-xs text-slate-500">
            <p className="font-medium text-slate-600">Debug details</p>
            <p>User: {user ? JSON.stringify(user) : "null"}</p>
            <p>Provider: {providerData ? JSON.stringify(providerData) : "null"}</p>
            <p>Role: {user?.role || "unknown"}</p>
          </CardContent>
          <CardContent className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Go to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { key: "my-addons", label: "My services", icon: ClipboardList, count: myAddons.length },
    { key: "templates", label: "Browse templates", icon: Layers },
    { key: "create-custom", label: "Create custom", icon: PlusCircle }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/70 to-emerald-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-sky-200/40 via-transparent to-emerald-200/40 blur-3xl" />

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
            {myAddons.length} active services
          </div>
        </div>

        <Card className="border-none bg-white/90 shadow-xl shadow-sky-100/50">
          <CardHeader className="space-y-4">
            <Badge className="bg-sky-100/70 text-sky-700">Service Catalogue</Badge>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold text-slate-900 md:text-4xl">
                Buddhist funeral offerings
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Curate templates, activate custom services, and keep your ceremony options up to date.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "border-sky-300 bg-sky-500 text-white shadow-sm hover:bg-sky-500"
                      : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-white"
                  )}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={16} className={cn(!isActive && "text-sky-500")} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={cn("ml-1 rounded-full px-2 py-0.5 text-xs", isActive ? "bg-white/30 text-white" : "bg-slate-100 text-slate-500")}>
                      {tab.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          <Badge className="bg-white/80 text-slate-500 border border-slate-200/80">
            <Layers size={14} className="mr-1 text-sky-400" />
            {categories.length} template categories
          </Badge>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "my-addons" && (
            <MyAddonsTab
              myAddons={myAddons}
              loading={loading}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteAddon}
              onEdit={setEditingAddon}
              editingAddon={editingAddon}
              onUpdate={handleUpdateAddon}
            />
          )}

          {activeTab === "templates" && (
            <TemplatesTab
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onAddTemplate={(template) => {
                setSelectedTemplate(template);
                setShowAddModal(true);
              }}
              myAddons={myAddons}
            />
          )}

          {activeTab === "create-custom" && (
            <CreateCustomTab
              categories={categories}
              onSubmit={handleCreateCustomAddon}
            />
          )}
        </AnimatePresence>

        {/* Add Template Modal */}
        {showAddModal && selectedTemplate && (
          <AddTemplateModal
            template={selectedTemplate}
            onClose={() => {
              setShowAddModal(false);
              setSelectedTemplate(null);
            }}
            onAdd={handleAddFromTemplate}
          />
        )}
      </div>
    </div>
  );
}

// My Add-ons Tab Component
function MyAddonsTab({ myAddons, loading, onToggleActive, onDelete, onEdit, editingAddon, onUpdate }) {
  const [editForm, setEditForm] = useState({
    addon_name: '',
    description: '',
    price: '',
    is_active: false,
  });

  useEffect(() => {
    if (editingAddon) {
      setEditForm({
        addon_name: editingAddon.addon_name || '',
        description: editingAddon.description || '',
        price: editingAddon.price || '',
        is_active: editingAddon.is_active || false,
      });
    } else {
      setEditForm({
        addon_name: '',
        description: '',
        price: '',
        is_active: false,
      });
    }
  }, [editingAddon]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col justify-center items-center py-16"
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-600">Loading your services...</p>
        <p className="text-sm text-gray-500">Please wait while we fetch your Buddhist ceremony offerings</p>
      </motion.div>
    );
  }

  if (myAddons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-200 p-16 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🪷</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Services Yet</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Begin your journey by exploring our Buddhist ceremony templates or create personalized services for your customers
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🪷 Browse Templates
          </button>
        </div>
      </motion.div>
    );
  }

  // Group add-ons by category
  const groupedAddons = myAddons.reduce((acc, addon) => {
    if (!acc[addon.category_name]) {
      acc[addon.category_name] = [];
    }
    acc[addon.category_name].push(addon);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {Object.entries(groupedAddons).map(([categoryName, addons]) => (
        <div key={categoryName} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🪷</span>
            {categoryName}
          </h3>
          <div className="space-y-4">
            {addons.map((addon) => (
              <motion.div
                key={addon.addon_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${addon.is_active
                  ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
              >
                {editingAddon?.addon_id === addon.addon_id ? (
                  // Enhanced Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                      <input
                        type="text"
                        value={editForm.addon_name || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, addon_name: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter service name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, description: e.target.value })
                        }
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Describe the service..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (RM)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => onUpdate(addon.addon_id, editForm)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                      >
                        ✅ Save Changes
                      </button>
                      <button
                        onClick={() => onEdit(null)}
                        className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Enhanced View Mode
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-xl font-bold text-gray-900">
                          {addon.addon_name}
                        </h4>
                        {addon.is_custom && (
                          <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-purple-200">
                            ✨ Custom
                          </span>
                        )}
                        {!addon.is_active && (
                          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full font-semibold">
                            ⏸️ Inactive
                          </span>
                        )}
                        {addon.is_active && (
                          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-green-200">
                            ✅ Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{addon.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Price:</span>
                        <p className="text-2xl font-bold text-blue-600">
                          RM {parseFloat(addon.price).toLocaleString("en-MY", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => onToggleActive(addon)}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${addon.is_active
                          ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-lg"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg"
                          }`}
                      >
                        {addon.is_active ? "🔴 Disable" : "🟢 Enable"}
                      </button>
                      <button
                        onClick={() => onEdit(addon)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => onDelete(addon.addon_id)}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Templates Tab Component
function TemplatesTab({ categories, selectedCategory, onSelectCategory, onAddTemplate, myAddons }) {
  const myAddonNames = myAddons.map((a) => a.addon_name.toLowerCase());
  const selectedCat = categories.find((c) => c.category_id === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-6"
    >
      {/* Category Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
          <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() => onSelectCategory(category.category_id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedCategory === category.category_id
                  ? "bg-amber-100 text-amber-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {category.category_name}
                <span className="block text-xs text-gray-500 mt-1">
                  {category.templates?.length || 0} templates
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="lg:col-span-3">
        {selectedCat && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🪷 {selectedCat.category_name}
            </h2>
            <p className="text-gray-600 mb-6">{selectedCat.description}</p>

            <div className="grid grid-cols-1 gap-4">
              {selectedCat.templates?.map((template) => {
                const isAdded = myAddonNames.includes(
                  template.template_name.toLowerCase()
                );
                return (
                  <div
                    key={template.template_id}
                    className={`border-2 rounded-xl p-5 transition-all ${isAdded
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">
                            {template.template_name}
                          </h4>
                          {template.is_popular && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                              ⭐ Popular
                            </span>
                          )}
                          {isAdded && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                              ✓ Added
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {template.description}
                        </p>
                        <p className="text-xl font-bold text-amber-600">
                          Suggested: RM{" "}
                          {parseFloat(template.suggested_price).toLocaleString(
                            "en-MY",
                            { minimumFractionDigits: 2 }
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => onAddTemplate(template)}
                        disabled={isAdded}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${isAdded
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-amber-600 text-white hover:bg-amber-700"
                          }`}
                      >
                        {isAdded ? "✓ Already Added" : "➕ Add Service"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Create Custom Tab Component
function CreateCustomTab({ categories, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ✨ Create Custom Buddhist Service
        </h2>
        <p className="text-gray-600 mb-8">
          Create a unique service that's specific to your funeral home
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              name="addon_name"
              required
              placeholder="e.g., Special Taoist-Buddhist Combined Ceremony"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category_id"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="4"
              placeholder="Describe what this service includes, duration, and any special features..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (RM) *
            </label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              ✨ Create Custom Service
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// Add Template Modal Component
function AddTemplateModal({ template, onClose, onAdd }) {
  const [customPrice, setCustomPrice] = useState(template.suggested_price);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Add Service to Your Offerings
          </h2>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {template.template_name}
            </h3>
            {template.is_popular && (
              <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium mb-3">
                ⭐ Popular Service
              </span>
            )}
            <p className="text-gray-700 text-sm">{template.description}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Your Price (RM) *
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.01"
                min="0"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-semibold"
              />
              <div className="text-sm text-gray-500">
                Suggested: RM{" "}
                {parseFloat(template.suggested_price).toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can customize the price to match your market and service quality
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => onAdd(template, customPrice)}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              ✅ Add to My Services
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
